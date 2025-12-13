# JUIT Robotics Hub - Complete Setup Guide

**Last Updated**: December 11, 2025  
**Status**: ✅ Production Ready

---

## 📖 Table of Contents

1. [Quick Start (5 minutes)](#-quick-start-5-minutes)
2. [System Architecture](#-system-architecture)
3. [Complete Setup Instructions](#-complete-setup-instructions)
4. [Database Schema](#-database-schema)
5. [Authentication & Security](#-authentication--security)
6. [Email & Notifications System](#-email--notifications-system)
7. [Multi-Admin Roles](#-multi-admin-roles)
8. [Troubleshooting](#-troubleshooting)
9. [Production Deployment](#-production-deployment)

---

## 🚀 Quick Start (5 minutes)

### For the Impatient

```bash
# 1. Create Supabase Project
# Go to https://supabase.com, create new project, copy credentials

# 2. Configure Environment
cat > .env << 'EOF'
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_SUPABASE_URL="your-project-url"
VITE_USE_MOCK="false"
EOF

# 3. Run Database Migration
# In Supabase SQL Editor, run: supabase/migrations/20241123_initial_schema.sql

# 4. Create Admin User
# In Supabase Dashboard > Authentication > Users, create user with email/password

# 5. Start Development
npm install
npm run dev
```

### Test It Works

```bash
# Test project submission
curl -X POST http://localhost:5173/api/projects \
  -H "Content-Type: application/json" \
  -d '{"student_name":"Test","project_title":"Test Project",...}'

# Test admin login
# Visit http://localhost:5173/admin
# Login with credentials you created
```

---

## 🏛️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (React + TypeScript)              │
│                                                         │
│  ┌──────────────────┐        ┌──────────────────────┐  │
│  │  Public Pages    │        │   Admin Pages        │  │
│  │                  │        │                      │  │
│  │  - Landing       │        │  - Login Page        │  │
│  │  - Projects Form │        │  - Dashboard         │  │
│  │  - Equipment     │        │  - Project Review    │  │
│  │  - Gallery       │        │  - Activity Logs     │  │
│  │                  │        │  (Protected Routes)  │  │
│  └──────────────────┘        └──────────────────────┘  │
│                                                         │
│         ┌─────────────────────────────┐               │
│         │   State Management         │               │
│         │  - React Query (caching)   │               │
│         │  - useAuth Hook            │               │
│         │  - Form State              │               │
│         └─────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘
                        │
             Supabase Client (REST API)
                        │
┌─────────────────────────────────────────────────────────┐
│            BACKEND (Supabase - BaaS)                   │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │    Authentication Layer (JWT-based)            │   │
│  │    - Session management                        │   │
│  │    - Password hashing                          │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │    PostgreSQL Database                         │   │
│  │                                                │   │
│  │  Tables: profiles, projects, equipment,        │   │
│  │  project_equipment, activity_logs, email_queue │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │    Row Level Security (RLS) Policies           │   │
│  │    - Public read on projects                   │   │
│  │    - Admin write on projects                   │   │
│  │    - Role-based access control                 │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Diagrams

**Student Submission Flow:**
```
Student Form Submit → Validate → Supabase Insert → RLS Check → Database Update 
→ Email Queued → Notification Created → Success Response
```

**Admin Review Flow:**
```
Admin Opens Project → Load Details → Update Status & Comments → RLS Check 
→ Update Database → Activity Log Created → Refresh Dashboard
```

**Authentication Flow:**
```
Login Form → Supabase Auth → JWT Token → Store in localStorage 
→ Fetch Profile → Check Role → Redirect to Dashboard
```

---

## 📋 Complete Setup Instructions

### Prerequisites

- Node.js v16+ ([Download](https://nodejs.org/))
- A Supabase account (free: https://supabase.com)
- Git and basic command line knowledge

### Step 1: Create Supabase Project (2-3 minutes)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or login
3. Click **New Project**
4. Fill in details:
   - Project Name: `juit-robotics-hub`
   - Database Password: Choose a strong password
   - Region: Closest to your location
5. Click **Create new project** (wait 1-2 minutes)

### Step 2: Get Credentials (1 minute)

1. Once project is ready, go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public Key** → `VITE_SUPABASE_ANON_KEY`
   - **Project ID** (from URL or settings) → `VITE_SUPABASE_PROJECT_ID`

### Step 3: Configure Environment Variables (30 seconds)

Create or update `.env` in project root:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id-here"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_USE_MOCK="false"
VITE_EMAIL_PROVIDER="resend"
VITE_EMAIL_API_KEY="re_xxxxxxxxxxxx"
VITE_EMAIL_FROM="noreply@juit-robotics.edu"
```

⚠️ **Important**: Never commit `.env` to Git (already in `.gitignore`)

### Step 4: Run Database Migration (1-2 minutes)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy content from `supabase/migrations/20241123_initial_schema.sql`
4. Paste into SQL Editor
5. Click **Run**
6. You should see: "Success. No rows returned"

**Verify tables created:**
- Go to **Table Editor** in Supabase
- You should see these 5 tables:
  - `auth.users` (created by Supabase)
  - `profiles`
  - `projects`
  - `equipment`
  - `project_equipment`
  - `activity_logs` (optional)

### Step 5: Create Admin User (1 minute)

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter:
   - Email: `admin@juit.edu`
   - Password: Choose secure password (min 6 chars)
   - Auto Confirm User: ✓ Check this
4. Click **Create User**
5. Profile will be auto-created by trigger

#### Option B: Via SQL

```sql
-- First, get your user ID:
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Then update profile role:
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@juit.edu';
```

### Step 6: Install Dependencies & Run (1 minute)

```bash
# Install packages
npm install
# or
bun install

# Start development server
npm run dev
# or
bun run dev
```

Visit `http://localhost:5173` in your browser.

### Step 7: Clear Cache & Test (30 seconds)

1. Open browser console: `F12`
2. Run: `localStorage.clear()`
3. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. Check console for: `✅ Using REAL Supabase database`

---

## 💾 Database Schema

### Tables Overview

#### `profiles` Table
Stores admin user information and permissions.

```typescript
interface Profile {
  id: string;              // UUID (references auth.users)
  email: string;           // User email
  full_name?: string;      // Display name
  role: 'super_admin' | 'admin' | 'faculty' | 'view_only';
  permissions?: {           // Optional: granular permissions
    can_approve: boolean;
    can_edit: boolean;
    can_delete: boolean;
    can_manage_users: boolean;
  };
  notification_preferences?: {
    email_on_new_project: boolean;
    email_on_status_change: boolean;
    email_digest: 'daily' | 'weekly' | 'monthly' | 'never';
  };
  created_at: string;
  updated_at: string;
}
```

#### `projects` Table
Stores student project submissions.

```typescript
interface Project {
  id: string;                      // UUID
  student_name: string;
  student_email: string;
  roll_number: string;
  branch: string;
  year: string;
  contact_number?: string;
  is_team_project: boolean;
  team_size?: number;
  team_members?: string;
  category: string;
  project_title: string;
  description: string;
  expected_outcomes?: string;
  duration: string;
  required_resources: string[];    // Array
  other_resources?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
  faculty_comments?: string;
  reviewed_by?: string;            // UUID (FK to profiles)
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}
```

#### `equipment` Table
Pre-populated lab equipment inventory.

```typescript
interface Equipment {
  id: string;
  name: string;
  category: string;
  description?: string;
  quantity: number;
  availability_status: 'available' | 'in_use' | 'maintenance' | 'unavailable';
  image_url?: string;
  specifications?: any;            // JSON
  created_at: string;
  updated_at: string;
}
```

#### `activity_logs` Table
Tracks all admin actions for audit trail.

```typescript
interface ActivityLog {
  id: string;
  admin_id: string;               // FK to profiles
  action: string;                 // 'approved', 'rejected', 'commented', etc.
  entity_type: 'project' | 'user' | 'equipment';
  entity_id: string;              // ID of affected entity
  details?: any;                  // Additional context
  created_at: string;
}
```

#### `email_queue` Table
Queues emails for reliable delivery.

```typescript
interface EmailQueue {
  id: string;
  to_email: string;
  subject: string;
  body_html: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  attempts: number;
  max_attempts: number;
  error_message?: string;
  sent_at?: string;
  created_at: string;
}
```

#### `notifications` Table
In-app notifications for users.

```typescript
interface Notification {
  id: string;
  user_id: string;               // FK to profiles
  type: 'project_submitted' | 'project_approved' | 'project_rejected' | 
        'project_under_review' | 'comment_added' | 'system';
  title: string;
  message: string;
  link?: string;                 // Where to navigate
  read: boolean;
  data?: any;                    // Additional context
  created_at: string;
}
```

### Entity Relationship Diagram

```
auth.users (Supabase)
    │
    │ 1:1
    ↓
profiles ←─── one user per profile
    │
    │ 1:N
    ├──→ projects (reviewed_by FK)
    ├──→ activity_logs (admin_id FK)
    └──→ notifications (user_id FK)

projects ←─── 1:N ─→ project_equipment ←─── N:M ─→ equipment

email_queue (independent, processed by cron/edge function)
```

### SQL for Creating Tables

The migration file `supabase/migrations/20241123_initial_schema.sql` contains:

```sql
-- All table CREATE statements
-- Indexes on frequently queried fields
-- RLS policies for each table
-- Triggers for automatic timestamps
-- Helper functions for permissions
```

---

## 🔐 Authentication & Security

### Authentication Flow

```
User enters credentials
        ↓
supabase.auth.signInWithPassword()
        ↓
Check email/password against auth.users
        ↓
Generate JWT token (valid 24 hours)
        ↓
Store in localStorage
        ↓
useAuth hook sets user state
        ↓
Fetch user's profile (role, permissions)
        ↓
Set isAdmin/isEditor computed values
        ↓
Frontend checks permissions
        ↓
Render appropriate UI
```

### Security Layers

1. **Frontend Route Guards**
   - Protected routes check `useAuth` hook
   - Redirect to login if not authenticated
   - Prevent unauthorized navigation

2. **Supabase Authentication**
   - JWT token validation on all requests
   - Session management
   - Secure password hashing

3. **Row Level Security (RLS) Policies**
   - Enforce at database level
   - Cannot be bypassed from frontend
   - Policies defined in SQL

4. **Database Constraints**
   - Foreign keys prevent orphaned records
   - Check constraints validate data
   - Not null constraints enforce required fields

### Using the useAuth Hook

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { 
    user,              // Current user object
    profile,           // User's profile with role
    isAdmin,           // Computed: user is admin+
    isEditor,          // Computed: user can edit
    loading,           // Loading state
    error,             // Error message if any
    signIn,            // Async function to login
    signOut,           // Logout
    hasPermission      // Check specific permission
  } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome, {profile?.full_name}</p>
      <p>Role: {profile?.role}</p>
      
      {isAdmin && <button>Admin Panel</button>}
      {hasPermission('can_approve') && <button>Approve</button>}
    </div>
  );
}
```

---

## 📧 Email & Notifications System

### Supported Email Providers

#### Option 1: Resend (Recommended)

Best for: Modern, easy-to-use, great deliverability

```bash
# 1. Sign up at https://resend.com
# 2. Verify your domain (or use resend.dev)
# 3. Create API key in dashboard
# 4. Add to .env:
VITE_EMAIL_PROVIDER=resend
VITE_EMAIL_API_KEY=re_xxxxxxxxxxxx
VITE_EMAIL_FROM=noreply@yourdomain.com
```

#### Option 2: SendGrid

Best for: Enterprise, advanced analytics

```bash
# 1. Sign up at https://sendgrid.com
# 2. Verify sender identity in settings
# 3. Create API key
# 4. Add to .env:
VITE_EMAIL_PROVIDER=sendgrid
VITE_EMAIL_API_KEY=SG.xxxxxxxxxxxx
VITE_EMAIL_FROM=verified@yourdomain.com
```

#### Option 3: Supabase (Queue Only)

Best for: Testing, no external dependencies

```bash
# 1. Set in .env:
VITE_EMAIL_PROVIDER=supabase
# 2. Implement edge function to process queue
```

### Email Types Sent

1. **Project Submission Confirmation** → Student
   - When project is submitted
   - Includes submission details

2. **Status Update Notification** → Student
   - When admin changes project status
   - Includes faculty comments

3. **New Project Alert** → Admins
   - When student submits project
   - Optional per admin

4. **Weekly Digest** → Admins
   - Summary of pending projects
   - Configurable frequency

### In-App Notifications

Real-time notifications using Supabase Realtime:

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function NotificationCenter() {
  const { 
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  return (
    <div>
      <Badge>{unreadCount}</Badge>
      {notifications.map(n => (
        <NotificationItem 
          key={n.id}
          notification={n}
          onRead={() => markAsRead(n.id)}
        />
      ))}
    </div>
  );
}
```

### Email Queue System

Why? Ensures reliability, scaling, and retry logic:

```sql
-- Check pending emails
SELECT COUNT(*) FROM email_queue 
WHERE status = 'pending';

-- Check failed emails
SELECT * FROM email_queue 
WHERE status = 'failed' 
ORDER BY created_at DESC;

-- Success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM email_queue
GROUP BY status;
```

---

## 👥 Multi-Admin Roles

### Available Roles

| Role | Approve Projects | Edit Data | Delete | Manage Users |
|------|-----------------|-----------|--------|--------------|
| **Super Admin** | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ❌ | ❌ |
| **Faculty** | ❌ | ✅ | ❌ | ❌ |
| **View Only** | ❌ | ❌ | ❌ | ❌ |

### Creating Different Admin Types

```sql
-- Super Admin (full access)
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'user-uuid-from-auth',
  'super@juit.edu',
  'Super Admin',
  'super_admin'
);

-- Faculty (can review and comment)
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'user-uuid-from-auth',
  'faculty@juit.edu',
  'Dr. Faculty Member',
  'faculty'
);

-- View Only User
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'user-uuid-from-auth',
  'viewer@juit.edu',
  'View Only User',
  'view_only'
);
```

### Checking Permissions

```typescript
// In components
const canApprove = profile?.role === 'super_admin' || 
                   profile?.role === 'admin';

const canEdit = ['super_admin', 'admin', 'faculty'].includes(profile?.role);

// Or use helper
function hasPermission(permission: string) {
  return profile?.permissions?.[permission] ?? 
         profile?.role === 'super_admin';
}

// Usage
{canApprove && <ApproveButton />}
{hasPermission('can_delete') && <DeleteButton />}
```

### Notification Preferences

Each admin can configure:

```sql
UPDATE profiles
SET notification_preferences = '{
  "email_on_new_project": true,
  "email_on_status_change": true,
  "email_digest": "daily"
}'::jsonb
WHERE id = 'user-uuid';
```

---

## 🐛 Troubleshooting

### Authentication Issues

**Problem**: "Can't connect to Supabase"

**Solution**:
```bash
# 1. Verify .env variables
cat .env

# 2. Check format (no extra quotes)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...  # No quotes

# 3. Restart dev server
npm run dev

# 4. Check browser console (F12) for errors
```

**Problem**: "Invalid credentials on login"

**Solution**:
```sql
-- Verify user exists in auth.users
SELECT id, email FROM auth.users;

-- Verify profile exists
SELECT * FROM profiles WHERE email = 'your@email.com';

-- Verify role is set
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your@email.com';
```

**Problem**: "Access Denied" after login

**Solution**:
```sql
-- Check user's role
SELECT id, email, role FROM profiles 
WHERE email = 'your@email.com';

-- Check RLS policies
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'projects');

-- Should show 'true' for rowsecurity
```

### Database Issues

**Problem**: "Projects table not found"

**Solution**:
1. Verify migration ran successfully
2. Check table exists:
   ```sql
   SELECT * FROM projects LIMIT 1;
   ```
3. Re-run migration if needed

**Problem**: "Infinite loading on dashboard"

**Solution**:
```javascript
// In browser console (F12)
const { data, error } = await supabase
  .from('projects')
  .select('*');
console.log({ data, error });

// If error: check RLS policies
// If no data: projects table may be empty (expected)
```

### Email Issues

**Problem**: "Emails not sending"

**Solution**:
```sql
-- Check email queue
SELECT * FROM email_queue 
WHERE status IN ('failed', 'pending') 
ORDER BY created_at DESC LIMIT 5;

-- Check error messages
SELECT to_email, error_message FROM email_queue 
WHERE status = 'failed';
```

**Common causes**:
- ❌ Wrong API key in .env
- ❌ API key expired (regenerate)
- ❌ Domain not verified
- ❌ Rate limit exceeded

### Notification Issues

**Problem**: "Notifications not appearing"

**Solution**:
1. Check browser console for errors
2. Verify Realtime is enabled:
   ```
   Supabase Dashboard → Project Settings → Realtime
   ```
3. Check RLS policies allow user access:
   ```sql
   SELECT * FROM notifications 
   WHERE user_id = 'current-user-id';
   ```

---

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Environment variables secured (not in code)
- [ ] All sensitive keys in `.env` (git-ignored)
- [ ] Database RLS policies enabled
- [ ] CORS configured in Supabase
- [ ] Email templates customized
- [ ] Admin user created with strong password
- [ ] Database backups configured
- [ ] SSL certificate enabled
- [ ] Security headers configured
- [ ] Monitoring and logging set up

### Environment-Specific Configuration

```bash
# Development (.env.development)
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_USE_MOCK=false
VITE_EMAIL_PROVIDER=resend

# Staging (.env.staging)
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_EMAIL_FROM_NAME=JUIT Robotics Lab (Staging)

# Production (.env.production)
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_ENVIRONMENT=production
# Extra security checks
```

### Database Backup Strategy

```sql
-- Create backup before major changes
pg_dump -U postgres -h host.supabase.co dbname > backup.sql

-- In Supabase: Settings → Database Backups
-- Enable automatic daily backups
-- Test restore procedures regularly
```

### Monitoring

Set up monitoring for:

1. **Database performance**
   - Slow query logs
   - Connection count
   - Disk usage

2. **API errors**
   - 5xx errors
   - RLS policy failures
   - Auth failures

3. **Email delivery**
   - Bounce rates
   - Unsubscribe rate
   - Delivery time

### Deployment Platforms

**Vercel (Recommended for Frontend)**
```bash
# 1. Connect GitHub repo
# 2. Add environment variables
# 3. Deploy with: npm run build
```

**Netlify**
```bash
# 1. Connect GitHub repo
# 2. Build command: npm run build
# 3. Publish directory: dist
```

**Self-hosted (Docker)**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📚 File Structure

```
juit-robotics-hub/
├── .env                              # Environment variables (git-ignored)
├── .env.example                      # Template for .env
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── vite.config.ts                    # Vite build config
│
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── ProjectReviewModal.tsx
│   │   ├── ui/                       # Shadcn UI components
│   │   └── ProjectForm.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts               # Authentication hook
│   │   └── useNotifications.ts      # Notifications hook
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts            # Supabase client setup
│   │       ├── types.ts             # Auto-generated types
│   │       └── helpers.ts           # Utility functions
│   │
│   ├── pages/
│   │   ├── Index.tsx                # Landing page
│   │   ├── Admin.tsx                # Login page
│   │   └── AdminDashboard.tsx       # Dashboard
│   │
│   └── App.tsx                      # Route configuration
│
├── supabase/
│   └── migrations/
│       └── 20241123_initial_schema.sql  # Database schema
│
├── SETUP_GUIDE.md                   # This file
├── ARCHITECTURE.md                  # Detailed architecture
├── SECURITY_BEST_PRACTICES.md       # Security guidelines
└── README.md                        # Project overview
```

---

## 🤝 Contributing

When modifying backend/database:

1. **Test locally first**
   - Create migration in dev database
   - Test thoroughly

2. **Update TypeScript types**
   - Run: `npm run db:types` (if available)
   - Manually update if needed

3. **Add RLS policies**
   - Every table needs security policies
   - Test both authenticated and anonymous access

4. **Document changes**
   - Update SETUP_GUIDE.md
   - Add comments in migrations
   - Update ARCHITECTURE.md if needed

5. **Test auth flows**
   - Login/logout
   - Role-based access
   - Permission checks

---

## 📞 Getting Help

### Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Shadcn UI Components](https://ui.shadcn.com/)
- [React Query Docs](https://tanstack.com/query/latest)

### Common Patterns

**Query data from Supabase:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'approved');
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* Render data */}</div>;
}
```

**Update data:**
```typescript
async function updateProject(projectId: string, updates: object) {
  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId);
  
  if (error) {
    throw new Error(`Failed to update: ${error.message}`);
  }
}
```

**Check permissions:**
```typescript
function AdminOnlyButton() {
  const { profile } = useAuth();
  
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return null;  // Don't render
  }
  
  return <button>Admin Action</button>;
}
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `.env` has correct credentials
- [ ] `VITE_USE_MOCK=false` is set
- [ ] Database migration ran successfully
- [ ] All 6 tables exist in Supabase
- [ ] Admin user created in auth.users
- [ ] Profile exists with role='admin'
- [ ] Dev server starts without errors
- [ ] Browser console shows "✅ Using REAL Supabase database"
- [ ] Login page loads at `/admin`
- [ ] Can login with credentials
- [ ] Dashboard loads without infinite loading
- [ ] Can submit test project from home page
- [ ] Submitted project appears in dashboard

---

## 🎯 Next Steps

1. **Complete initial setup** (follow steps 1-7 above)
2. **Test all functionality** (use verification checklist)
3. **Customize for production**:
   - Update admin user email
   - Configure email provider
   - Customize email templates
4. **Create additional admins** if needed
5. **Deploy to production** (see deployment section)
6. **Set up monitoring** for production
7. **Train team members** on admin dashboard

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 11, 2025 | Initial comprehensive guide combining all documentation |

---

**Last Updated**: December 11, 2025  
**Maintained by**: JUIT Robotics Lab Team  
**License**: MIT

For questions or issues, please open a GitHub issue or contact the development team.
