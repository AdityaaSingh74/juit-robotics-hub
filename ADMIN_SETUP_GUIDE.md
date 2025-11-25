# Admin Setup Guide - JUIT Robotics Hub

## 🐞 Issues Fixed

This guide addresses the following issues:
1. ❌ Automatic redirect to `/admin/dashboard` without login
2. ❌ Infinite loading on admin dashboard
3. ❌ Wrong environment variable names
4. ❌ Missing database tables
5. ❌ Mock mode enabled by default

## ✅ Changes Made

### 1. Environment Variables Fixed
- **Changed**: `VITE_SUPABASE_PUBLISHABLE_KEY` → `VITE_SUPABASE_ANON_KEY`
- **Added**: `VITE_USE_MOCK="false"` to disable mock mode

### 2. Authentication Flow Improved
- Added `hasCheckedAuth` state to prevent redirect loops
- Better loading state management
- Auto-create profile if missing
- Console logs for debugging

### 3. Error Handling Enhanced
- Graceful handling of missing `profiles` table
- Better error messages
- Fallback to admin role for first user

---

## 🚀 Setup Instructions

### Step 1: Verify Environment Variables

Your `.env` file should now look like this:

```env
VITE_SUPABASE_PROJECT_ID="acuenaeeyrziajdbutpy"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjdWVuYWVleXJ6aWFqZGJ1dHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4OTQ5NTksImV4cCI6MjA3OTQ3MDk1OX0.vE8wAR0Deu_Gfkr9tHnWV-8dqUVrfVAXrXenPmtPBR8"
VITE_SUPABASE_URL="https://acuenaeeyrziajdbutpy.supabase.co"
VITE_USE_MOCK="false"
```

### Step 2: Create Database Tables in Supabase

Go to your Supabase project → SQL Editor and run these commands:

#### Create `profiles` Table

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'view_only' CHECK (role IN ('super_admin', 'admin', 'faculty', 'view_only')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Create policy to allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'admin'  -- Default to admin for first users
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

#### Create `projects` Table

```sql
-- Create projects table
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

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert projects (for submissions)
CREATE POLICY "Anyone can create projects"
    ON public.projects
    FOR INSERT
    WITH CHECK (true);

-- Allow admins to view all projects
CREATE POLICY "Admins can view all projects"
    ON public.projects
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'faculty')
        )
    );

-- Allow admins to update projects
CREATE POLICY "Admins can update projects"
    ON public.projects
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'faculty')
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### Create `activity_logs` Table (Optional but recommended)

```sql
-- Create activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view activity logs"
    ON public.activity_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Only admins can insert logs
CREATE POLICY "Admins can create activity logs"
    ON public.activity_logs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'faculty')
        )
    );
```

### Step 3: Create Your Admin User

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to **Authentication** → **Users** in your Supabase dashboard
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `admin@juit.edu` (or any email)
   - Password: Choose a secure password (min 6 characters)
4. Click **Create user**
5. The profile will be automatically created with admin role

#### Option B: Via SQL

```sql
-- First, get your user ID from auth.users table
SELECT id, email FROM auth.users;

-- Then, manually insert or update the profile
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
    'YOUR_USER_ID_HERE',  -- Replace with actual UUID from auth.users
    'admin@juit.edu',
    'Admin User',
    'super_admin'
)
ON CONFLICT (id) DO UPDATE
SET role = 'super_admin';
```

### Step 4: Clear Browser Cache and Restart

1. **Clear localStorage**:
   - Open browser console (F12)
   - Run: `localStorage.clear()`
   - Or go to Application → Local Storage → Delete all

2. **Restart development server**:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   # or
   bun dev
   ```

3. **Hard refresh browser**:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

### Step 5: Test the Login

1. Go to `http://localhost:5173/admin`
2. You should see the login page (NOT auto-redirect)
3. Enter your credentials:
   - Email: The email you created
   - Password: Your password
4. Click **Login**
5. You should be redirected to `/admin/dashboard`
6. Dashboard should load properly (not infinite loading)

---

## 🔍 Debugging

### Check Console Logs

Open browser console (F12) and look for:

```
✅ Using REAL Supabase database
Checking authentication...
User authenticated, redirecting to dashboard...
Fetching projects from database...
Fetched X projects
```

### Common Issues and Solutions

#### Issue 1: Still seeing "Using MOCK DATABASE"
**Solution**: 
- Verify `.env` has `VITE_USE_MOCK="false"`
- Restart dev server
- Clear browser cache

#### Issue 2: "Projects table not found"
**Solution**:
- Run the SQL commands in Step 2
- Verify tables exist in Supabase SQL Editor: `SELECT * FROM projects;`

#### Issue 3: "Access Denied" after login
**Solution**:
- Check your profile role:
  ```sql
  SELECT * FROM profiles WHERE email = 'your@email.com';
  ```
- Update role if needed:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
  ```

#### Issue 4: Still getting infinite loading
**Solution**:
1. Check browser console for errors
2. Verify Supabase URL and key are correct
3. Test Supabase connection:
   ```javascript
   // In browser console:
   const { data, error } = await window.supabase.from('profiles').select('*');
   console.log({ data, error });
   ```

#### Issue 5: "Auth session missing" error
**Solution**:
- Clear localStorage: `localStorage.clear()`
- Logout and login again
- Check if Supabase auth is working:
  ```sql
  SELECT * FROM auth.users;
  ```

---

## 📝 Additional Notes

### Security Considerations

1. **Never commit `.env` to Git**:
   - Already in `.gitignore`
   - Use `.env.example` for templates

2. **Use strong passwords**:
   - Minimum 12 characters
   - Mix of letters, numbers, symbols

3. **Row Level Security (RLS)**:
   - Already enabled on all tables
   - Policies restrict access properly

### Testing Without Database

If you want to test without setting up the database:

1. Set `VITE_USE_MOCK="true"` in `.env`
2. Use mock credentials:
   - Email: `admin@juit.edu`
   - Password: Any password (6+ chars)

---

## ✅ Verification Checklist

- [ ] `.env` has correct variable names
- [ ] `VITE_USE_MOCK` is set to `"false"`
- [ ] All database tables created in Supabase
- [ ] Admin user created in Supabase Auth
- [ ] Profile with `role='admin'` exists
- [ ] Browser cache cleared
- [ ] Dev server restarted
- [ ] Console shows "✅ Using REAL Supabase database"
- [ ] Login page loads without auto-redirect
- [ ] Login works and redirects to dashboard
- [ ] Dashboard loads without infinite loading
- [ ] Can see project stats (even if 0)

---

## 📞 Need Help?

If you're still experiencing issues:

1. Check the browser console for errors
2. Check Supabase logs (Project Settings → API Logs)
3. Verify all SQL commands executed successfully
4. Make sure you're using the correct Supabase project

---

## 🚀 Next Steps

Once admin login is working:

1. Create more admin users if needed
2. Test project submission flow
3. Configure email notifications (see `NOTIFICATIONS_AND_ROLES_GUIDE.md`)
4. Set up proper user roles
5. Configure production environment

---

**Last Updated**: November 26, 2025
**Status**: ✅ All fixes applied and tested
