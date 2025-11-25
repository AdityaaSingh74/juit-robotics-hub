-- COMPREHENSIVE DATABASE FIX FOR JUIT ROBOTICS HUB
-- Run this entire script in Supabase SQL Editor
-- This will fix all database-related issues

-- ============================================
-- 1. DROP EXISTING EMAIL TRIGGERS (if they exist)
-- ============================================

DROP TRIGGER IF EXISTS on_project_submitted ON public.projects;
DROP TRIGGER IF EXISTS on_project_status_changed ON public.projects;
DROP FUNCTION IF EXISTS public.handle_new_project();
DROP FUNCTION IF EXISTS public.handle_project_status_change();

-- ============================================
-- 2. CREATE OR UPDATE PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'faculty', 'view_only')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'admin'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. CREATE OR UPDATE PROJECTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    branch TEXT NOT NULL,
    year TEXT NOT NULL,
    contact_number TEXT,
    is_team_project BOOLEAN DEFAULT FALSE,
    team_size INTEGER,
    team_members TEXT,
    category TEXT NOT NULL,
    project_title TEXT NOT NULL,
    description TEXT NOT NULL,
    expected_outcomes TEXT,
    duration TEXT NOT NULL,
    required_resources TEXT[] DEFAULT '{}',
    other_resources TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed')),
    faculty_comments TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;

-- Create policies
CREATE POLICY "Anyone can create projects"
    ON public.projects FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all projects"
    ON public.projects FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'faculty')
        )
    );

CREATE POLICY "Admins can update projects"
    ON public.projects FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'faculty')
        )
    );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. CREATE ACTIVITY LOGS TABLE (OPTIONAL)
-- ============================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can create activity logs" ON public.activity_logs;

CREATE POLICY "Admins can view activity logs"
    ON public.activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can create activity logs"
    ON public.activity_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'faculty')
        )
    );

-- ============================================
-- 5. DROP EMAIL QUEUE TABLE (IF IT EXISTS)
-- This table was causing the issue
-- ============================================

DROP TABLE IF EXISTS public.email_queue CASCADE;

-- ============================================
-- 6. VERIFY SETUP
-- ============================================

-- Check if tables exist
SELECT 
    'profiles' as table_name,
    COUNT(*) as row_count
FROM public.profiles
UNION ALL
SELECT 
    'projects' as table_name,
    COUNT(*) as row_count
FROM public.projects
UNION ALL
SELECT 
    'activity_logs' as table_name,
    COUNT(*) as row_count
FROM public.activity_logs;

-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'projects', 'activity_logs');

-- ============================================
-- 7. CREATE ADMIN USER PROFILE (IF NEEDED)
-- Replace 'YOUR_EMAIL_HERE' with your actual email
-- ============================================

-- First, check if your user exists
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'admin@juit.edu'; -- Change this to your email

-- If user exists but no profile, create one:
-- Replace 'YOUR_USER_ID' with the actual UUID from above query
/*
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
    'YOUR_USER_ID',  -- Replace with actual UUID
    'admin@juit.edu',  -- Replace with your email
    'Admin User',
    'super_admin'
)
ON CONFLICT (id) DO UPDATE
SET role = 'super_admin';
*/

-- ============================================
-- SUCCESS! DATABASE IS NOW READY
-- ============================================

-- Next steps:
-- 1. Create your admin user in Supabase Auth dashboard
-- 2. The profile will be auto-created with admin role
-- 3. Test project submission - should work without email_queue error
-- 4. Check admin dashboard - should show submitted projects
