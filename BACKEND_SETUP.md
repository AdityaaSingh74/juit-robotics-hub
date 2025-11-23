# JUIT Robotics Hub - Backend & Admin System

This document provides complete setup instructions for the backend and admin features added to the JUIT Robotics Hub.

## 🎯 What Was Added

### 1. **Database Schema (Supabase)**
- **projects** table - Stores student project submissions
- **profiles** table - Admin user profiles
- **equipment** table - Lab equipment inventory
- **project_equipment** table - Junction table for project-equipment relationships
- **activity_logs** table - Tracks admin actions

### 2. **Backend Features**
- Project submission system connected to Supabase
- Row Level Security (RLS) policies for data protection
- Automatic timestamp tracking
- Activity logging for admin actions

### 3. **Admin Dashboard**
- Secure authentication using Supabase Auth
- Project management with filtering and search
- Project review workflow with status updates
- Comprehensive project details view
- Statistics dashboard
- Activity tracking

### 4. **Authentication System**
- Admin login with email/password
- Session management
- Protected routes
- Auto-redirect for authenticated users

## 📋 Prerequisites

Before setting up, ensure you have:
- Node.js (v16 or higher)
- A Supabase account (free tier works)
- Git

## 🚀 Setup Instructions

### Step 1: Supabase Project Setup

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign in and create a new project
   - Choose a project name, database password, and region
   - Wait for the project to be provisioned (~2 minutes)

2. **Get Your Credentials**
   - Go to Project Settings > API
   - Copy the following:
     - `Project URL` (SUPABASE_URL)
     - `anon/public` key (SUPABASE_ANON_KEY)

3. **Update Environment Variables**
   - Open `.env` file in the project root
   - Update with your credentials:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Step 2: Database Migration

1. **Run the Migration SQL**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Click "New Query"
   - Copy the entire content from `supabase/migrations/20241123_initial_schema.sql`
   - Paste and click "Run"
   - You should see "Success. No rows returned"

2. **Verify Tables Created**
   - Go to Table Editor in Supabase
   - You should see 5 tables:
     - `profiles`
     - `projects`
     - `equipment`
     - `project_equipment`
     - `activity_logs`

### Step 3: Create Admin User

1. **Create Admin Account**
   - Go to Authentication > Users in Supabase
   - Click "Add User" > "Create new user"
   - Enter:
     - Email: `admin@juit.ac.in` (or your preferred admin email)
     - Password: Choose a secure password
     - Auto Confirm User: ✓ (check this)
   - Click "Create User"

2. **Verify Profile Created**
   - Go to Table Editor > `profiles`
   - You should see your admin user with role='admin'
   - If not automatically created, insert manually:
   ```sql
   INSERT INTO profiles (id, email, full_name, role)
   VALUES (
     'USER_ID_FROM_AUTH_USERS',
     'admin@juit.ac.in',
     'Admin Name',
     'admin'
   );
   ```

### Step 4: Install Dependencies & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔐 Admin Access

### Login to Admin Dashboard

1. Navigate to `http://localhost:5173/admin`
2. Enter your admin credentials:
   - Email: `admin@juit.ac.in` (or the email you created)
   - Password: Your admin password
3. Click "Login"
4. You'll be redirected to `/admin/dashboard`

### Admin Dashboard Features

**Statistics Overview**
- Total projects submitted
- Pending reviews
- Under review
- Approved projects
- Rejected projects

**Project Management**
- View all projects in tabs by status
- Filter projects: All, Pending, Under Review, Approved, Rejected
- Detailed project information display
- Quick review access

**Project Review**
- Change project status:
  - Pending
  - Under Review
  - Approved
  - Rejected
  - Completed
- Add faculty comments/feedback
- View student details
- View required resources
- View team information (if team project)

## 📊 Database Schema Details

### Projects Table
```typescript
interface Project {
  id: string;                    // UUID
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
  required_resources: string[];  // Array
  other_resources?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
  faculty_comments?: string;
  reviewed_by?: string;          // UUID reference to profiles
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}
```

### Equipment Table (Pre-populated)
```typescript
interface Equipment {
  id: string;
  name: string;
  category: string;
  description?: string;
  quantity: number;
  availability_status: 'available' | 'in_use' | 'maintenance' | 'unavailable';
  image_url?: string;
  specifications?: JSON;
  created_at: string;
  updated_at: string;
}
```

## 🔒 Security Features

### Row Level Security (RLS)

**Projects Table**
- Anyone can view and insert projects (student submissions)
- Only admins can update/delete projects

**Profiles Table**
- Authenticated users can view all profiles
- Users can only update their own profile

**Equipment Table**
- Everyone can view equipment
- Only admins can manage (create/update/delete)

**Activity Logs**
- Only admins can view and create logs

### Authentication
- Supabase Auth for secure user management
- JWT-based session handling
- Automatic session refresh
- Protected admin routes

## 🧪 Testing the System

### Test Project Submission

1. Go to the main site: `http://localhost:5173`
2. Scroll to "Submit Your Project Idea" section
3. Fill out the form with test data
4. Submit the project
5. You should see a success toast

### Test Admin Review

1. Login to admin dashboard
2. You should see the submitted project in "Pending" tab
3. Click "Review Project" on the project card
4. Change status to "Under Review" or "Approved"
5. Add faculty comments
6. Click "Save Review"
7. Project should move to the appropriate tab

## 📁 File Structure

```
src/
├── components/
│   ├── admin/
│   │   └── ProjectReviewModal.tsx   # Modal for reviewing projects
│   ├── ui/                           # Shadcn UI components
│   └── ProjectForm.tsx               # Updated with Supabase integration
├── hooks/
│   └── useAuth.ts                    # Authentication hook
├── integrations/
│   └── supabase/
│       ├── client.ts                 # Supabase client
│       └── types.ts                  # Database types (auto-generated)
├── pages/
│   ├── Admin.tsx                     # Login page (updated)
│   ├── AdminDashboard.tsx            # Main admin dashboard
│   └── Index.tsx                     # Main landing page
└── App.tsx                           # Routes configuration

supabase/
└── migrations/
    └── 20241123_initial_schema.sql   # Database schema
```

## 🐛 Troubleshooting

### "Failed to fetch projects"
- Check if Supabase URL and keys are correct in `.env`
- Verify the migration ran successfully
- Check browser console for detailed errors

### "Invalid credentials" on login
- Ensure admin user was created in Supabase Auth
- Verify email and password are correct
- Check if email confirmation is disabled (for development)

### "Access Denied" after login
- Check if profile was created with role='admin'
- Verify RLS policies are enabled
- Check browser console for auth errors

### Projects not showing after submission
- Open browser dev tools > Network tab
- Check if POST request to Supabase succeeded
- Verify RLS policies allow anonymous inserts
- Check Supabase logs in dashboard

## 🔄 Future Enhancements

- [ ] Email notifications for project status updates
- [ ] Equipment reservation system
- [ ] Project progress tracking
- [ ] File upload for project documentation
- [ ] Advanced analytics and reporting
- [ ] Student portal to track their submissions
- [ ] Export projects to CSV/PDF
- [ ] Calendar integration for lab bookings

## 📝 API Endpoints (Supabase)

All API calls are made through Supabase client. Key operations:

### Projects
```typescript
// Create project
supabase.from('projects').insert(projectData)

// Get all projects
supabase.from('projects').select('*')

// Update project
supabase.from('projects').update({ status, faculty_comments }).eq('id', projectId)

// Get projects by status
supabase.from('projects').select('*').eq('status', 'pending')
```

### Authentication
```typescript
// Sign in
supabase.auth.signInWithPassword({ email, password })

// Sign out
supabase.auth.signOut()

// Get session
supabase.auth.getSession()
```

## 🤝 Contributing

When contributing to backend features:
1. Always test database changes in development first
2. Update TypeScript types after schema changes
3. Add RLS policies for new tables
4. Document new features in this README
5. Test authentication flows thoroughly

## 📞 Support

For issues or questions:
1. Check existing GitHub issues
2. Review Supabase documentation
3. Check browser console for errors
4. Verify environment variables are set

## 🎓 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Shadcn UI](https://ui.shadcn.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Note**: This is a development setup. For production:
- Use environment-specific configurations
- Enable email confirmations
- Set up proper CORS policies
- Use secure password policies
- Enable 2FA for admin accounts
- Set up monitoring and logging
- Configure rate limiting
