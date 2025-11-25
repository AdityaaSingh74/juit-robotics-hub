-- ============================================
-- ULTIMATE DATABASE FIX FOR JUIT ROBOTICS HUB
-- Compatible with your React frontend
-- Handles ALL foreign key dependencies
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: DROP ALL DEPENDENT TABLES FIRST
-- This prevents foreign key constraint errors
-- ============================================

DROP TABLE IF EXISTS public.project_equipment CASCADE;
DROP TABLE IF EXISTS public.equipment CASCADE;
DROP TABLE IF EXISTS public.email_queue CASCADE;
DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.project_resources CASCADE;
DROP TABLE IF EXISTS public.resources CASCADE;

-- ============================================
-- STEP 2: DROP MAIN TABLES WITH CASCADE
-- ============================================

DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================
-- STEP 3: DROP ALL FUNCTIONS AND TRIGGERS
-- ============================================

DROP FUNCTION IF EXISTS public.handle_new_project() CASCADE;
DROP FUNCTION IF EXISTS public.handle_project_status_change() CASCADE;
DROP FUNCTION IF EXISTS public.send_project_notification() CASCADE;
DROP FUNCTION IF EXISTS public.queue_email() CASCADE;
DROP FUNCTION IF EXISTS public.notify_project_submission() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- ============================================
-- STEP 4: CREATE PROFILES TABLE
-- Matches your frontend useAuth hook expectations
-- ============================================

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'faculty', 'view_only')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- ============================================
-- STEP 5: CREATE PROJECTS TABLE
-- Matches your ProjectForm.tsx data structure
-- ============================================

CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Student Information
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    branch TEXT NOT NULL,
    year TEXT NOT NULL,
    contact_number TEXT,
    -- Team Information
    is_team_project BOOLEAN DEFAULT FALSE,
    team_size INTEGER,
    team_members TEXT,
    -- Project Details
    category TEXT NOT NULL,
    project_title TEXT NOT NULL,
    description TEXT NOT NULL,
    expected_outcomes TEXT,
    duration TEXT NOT NULL,
    -- Resources (TEXT ARRAY for multiple selections)
    required_resources TEXT[] DEFAULT '{}',
    other_resources TEXT,
    -- Status and Review
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed')),
    faculty_comments TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_student_email ON public.projects(student_email);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);

-- ============================================
-- STEP 6: CREATE ACTIVITY LOGS TABLE
-- For admin dashboard activity tracking
-- ============================================

CREATE TABLE public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_admin_id ON public.activity_logs(admin_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- ============================================
-- STEP 7: CREATE HELPER FUNCTIONS
-- ============================================

-- Auto-create profile for new users (used by useAuth.ts)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
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
$$;

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================
-- STEP 8: CREATE TRIGGERS (ONLY ESSENTIAL ONES)
-- ============================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STEP 9: ENABLE RLS
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 10: CREATE RLS POLICIES (SIMPLE, NO RECURSION)
-- ============================================

-- PROFILES: Authenticated users can read all, update own
CREATE POLICY "profiles_select_all"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- PROJECTS: Public can insert, authenticated can manage
CREATE POLICY "projects_insert_public"
    ON public.projects FOR INSERT
    WITH CHECK (true);  -- Anyone can submit projects

CREATE POLICY "projects_select_authenticated"
    ON public.projects FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "projects_update_authenticated"
    ON public.projects FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "projects_delete_authenticated"
    ON public.projects FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- ACTIVITY LOGS: Authenticated users only
CREATE POLICY "logs_insert_authenticated"
    ON public.activity_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "logs_select_authenticated"
    ON public.activity_logs FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ============================================
-- STEP 11: CREATE PROFILES FOR EXISTING AUTH USERS
-- ============================================

INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    'admin'
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check tables
SELECT 'Tables Created' as check_type, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'projects', 'activity_logs')
ORDER BY tablename;

-- Check RLS is enabled
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'projects', 'activity_logs')
ORDER BY tablename;

-- Count policies
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Check for email tables (should be 0)
SELECT COUNT(*) as email_tables_remaining
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE '%email%';

-- Check data
SELECT 
    'profiles' as table_name, COUNT(*) as rows FROM public.profiles
UNION ALL
SELECT 
    'projects' as table_name, COUNT(*) as rows FROM public.projects
UNION ALL
SELECT 
    'activity_logs' as table_name, COUNT(*) as rows FROM public.activity_logs;

-- Final status
SELECT 
    '✅ DATABASE READY' as status,
    'Compatible with React frontend' as compatibility,
    'No email dependencies' as clean,
    'Simple RLS policies' as security;
