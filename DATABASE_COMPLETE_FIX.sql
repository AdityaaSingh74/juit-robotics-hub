-- ============================================
-- COMPLETE DATABASE FIX FOR JUIT ROBOTICS HUB
-- This script will fix ALL issues comprehensively
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: DROP ALL TRIGGERS AND FUNCTIONS
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all triggers on projects table
    FOR r IN (SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.projects'::regclass)
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.tgname) || ' ON public.projects CASCADE';
    END LOOP;
    
    -- Drop all triggers on profiles table
    FOR r IN (SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.profiles'::regclass AND tgname != 'on_auth_user_created')
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.tgname) || ' ON public.profiles CASCADE';
    END LOOP;
END $$;

-- Drop all email-related functions
DROP FUNCTION IF EXISTS public.handle_new_project() CASCADE;
DROP FUNCTION IF EXISTS public.handle_project_status_change() CASCADE;
DROP FUNCTION IF EXISTS public.send_project_notification() CASCADE;
DROP FUNCTION IF EXISTS public.queue_email() CASCADE;
DROP FUNCTION IF EXISTS public.notify_project_submission() CASCADE;

-- ============================================
-- STEP 2: DROP EMAIL QUEUE TABLE AND RELATED TABLES
-- ============================================

DROP TABLE IF EXISTS public.email_queue CASCADE;
DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;

-- ============================================
-- STEP 3: DISABLE RLS ON ALL TABLES TEMPORARILY
-- ============================================

ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_logs DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: DROP AND RECREATE PROFILES TABLE
-- ============================================

DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'faculty', 'view_only')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================
-- STEP 5: DROP AND RECREATE PROJECTS TABLE
-- ============================================

DROP TABLE IF EXISTS public.projects CASCADE;

CREATE TABLE public.projects (
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
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_student_email ON public.projects(student_email);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- ============================================
-- STEP 6: DROP AND RECREATE ACTIVITY LOGS TABLE
-- ============================================

DROP TABLE IF EXISTS public.activity_logs CASCADE;

CREATE TABLE public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_id ON public.activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- ============================================
-- STEP 7: CREATE SIMPLE TRIGGERS (NO EMAIL)
-- ============================================

-- Auto-create profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
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
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger for projects
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
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
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STEP 8: ENABLE RLS AND CREATE SIMPLE POLICIES
-- ============================================

-- PROFILES TABLE
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- PROJECTS TABLE
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users"
    ON public.projects FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users"
    ON public.projects FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable update for authenticated users"
    ON public.projects FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
    ON public.projects FOR DELETE
    TO authenticated
    USING (true);

-- ACTIVITY LOGS TABLE
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for authenticated users"
    ON public.activity_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users"
    ON public.activity_logs FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- STEP 9: CREATE ADMIN USER PROFILES FOR EXISTING USERS
-- ============================================

-- This will create profiles for any existing auth users that don't have one
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    'admin'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 10: VERIFICATION QUERIES
-- ============================================

-- Check tables exist
SELECT 
    'Tables Created' as status,
    COUNT(DISTINCT tablename) as table_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'projects', 'activity_logs');

-- Check RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'projects', 'activity_logs')
ORDER BY tablename;

-- Check policies exist
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'projects', 'activity_logs')
GROUP BY tablename
ORDER BY tablename;

-- Check for any email-related objects
SELECT 
    'Email Objects Remaining' as check_type,
    COUNT(*) as count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE '%email%';

-- List all triggers
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND c.relname IN ('profiles', 'projects', 'activity_logs')
ORDER BY c.relname, t.tgname;

-- Check existing data
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

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 
    '✅ DATABASE SETUP COMPLETE!' as status,
    'All tables recreated without email dependencies' as message,
    'RLS policies are simple and non-recursive' as security,
    'Ready for project submissions' as ready;

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. All email-related triggers and tables have been removed
-- 2. RLS policies are simplified to avoid recursion
-- 3. Projects can be submitted by anyone (public access)
-- 4. Authenticated users can view and manage projects
-- 5. Admin role checking should be done in your application code
-- 6. Email notifications should be implemented separately using Edge Functions
-- ============================================
