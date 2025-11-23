# Notifications & Multi-Admin Roles - Implementation Guide

## 🎉 What's Been Added

This guide covers the implementation of:
1. **Email Notification System** with 3 provider options
2. **Multi-Admin Role System** with granular permissions
3. **In-App Notifications** with real-time updates
4. **Email Queue** for reliable delivery

---

## 📧 Email Notification System

### Supported Email Providers

**Option 1: Supabase Edge Functions (Recommended for Beginners)**
- ✅ No additional setup needed
- ✅ Emails queued in database
- ✅ Free tier available
- ⚠️ Requires Edge Function deployment

**Option 2: Resend (Recommended for Production)**
- ✅ Modern API, easy to use
- ✅ 100 emails/day free tier
- ✅ Excellent deliverability
- ✅ Beautiful email templates
- 📍 Signup: https://resend.com

**Option 3: SendGrid**
- ✅ 100 emails/day free tier
- ✅ Enterprise-grade
- ✅ Detailed analytics
- 📍 Signup: https://sendgrid.com

### Email Types Implemented

1. **Project Submission Confirmation** (to Student)
   - Sent immediately when project is submitted
   - Includes project details and submission ID
   - Sets expectations for review timeline

2. **Project Status Update** (to Student)
   - Sent when admin changes project status
   - Includes faculty comments
   - Different templates for approved/rejected/under review

3. **New Project Alert** (to Admins)
   - Sent when student submits project
   - Configurable per admin (can disable)
   - Includes quick link to review

4. **Weekly Digest** (to Admins)
   - Summary of pending projects
   - Configurable frequency (daily/weekly/monthly)
   - [TO BE IMPLEMENTED via cron job]

### Configuration

Add to your `.env` file:

```env
# Email Provider Configuration
VITE_EMAIL_PROVIDER=resend  # or sendgrid, smtp, supabase
VITE_EMAIL_API_KEY=your-api-key-here
VITE_EMAIL_FROM=noreply@juit-robotics.edu
VITE_EMAIL_FROM_NAME=JUIT Robotics Lab
VITE_APP_URL=https://your-domain.com
```

### Setting Up Resend (Recommended)

1. **Sign up** at https://resend.com
2. **Verify your domain** (or use resend.dev for testing)
3. **Get API Key**: Dashboard > API Keys > Create
4. **Add to .env**:
   ```env
   VITE_EMAIL_PROVIDER=resend
   VITE_EMAIL_API_KEY=re_xxxxxxxxxxxxx
   VITE_EMAIL_FROM=noreply@your-domain.com
   ```

### Setting Up SendGrid

1. **Sign up** at https://sendgrid.com
2. **Verify sender identity**: Settings > Sender Authentication
3. **Create API Key**: Settings > API Keys
4. **Add to .env**:
   ```env
   VITE_EMAIL_PROVIDER=sendgrid
   VITE_EMAIL_API_KEY=SG.xxxxxxxxxxxxx
   VITE_EMAIL_FROM=verified@your-domain.com
   ```

### How It Works

```
Student Submits Project
        ↓
Database Trigger Fires
        ↓
  ┌─────────────────┐
  │  queue_email()  │
  │  function       │
  └─────────────────┘
        ↓
Email Queue Table
  (status: pending)
        ↓
  Email Service
  (frontend/backend)
        ↓
    Provider API
  (Resend/SendGrid)
        ↓
  Email Delivered ✅
  (status: sent)
```

---

## 👥 Multi-Admin Role System

### Available Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Super Admin** | Full system access | All permissions |
| **Admin** | Can manage projects | Approve, edit, comment |
| **Faculty** | Can review only | View, comment (no approve) |
| **View Only** | Read-only access | View dashboard only |

### Granular Permissions

Each role has specific permissions stored in JSONB:

```json
{
  "can_approve": true/false,
  "can_edit": true/false,
  "can_delete": true/false,
  "can_manage_users": true/false
}
```

### Default Permissions by Role

**Super Admin:**
```json
{
  "can_approve": true,
  "can_edit": true,
  "can_delete": true,
  "can_manage_users": true
}
```

**Admin:**
```json
{
  "can_approve": true,
  "can_edit": true,
  "can_delete": false,
  "can_manage_users": false
}
```

**Faculty:**
```json
{
  "can_approve": false,
  "can_edit": true,
  "can_delete": false,
  "can_manage_users": false
}
```

**View Only:**
```json
{
  "can_approve": false,
  "can_edit": false,
  "can_delete": false,
  "can_manage_users": false
}
```

### Creating Different Admin Types

**Via Supabase Dashboard:**

1. Go to **Authentication** > **Users**
2. **Add User** > **Create new user**
3. Enter email and password
4. After creation, go to **Table Editor** > **profiles**
5. Find the new user's profile
6. Edit the `role` field:
   - `super_admin` - Full access
   - `admin` - Standard admin
   - `faculty` - Review only
   - `view_only` - Read only
7. Optionally customize `permissions` JSON

**Via SQL:**

```sql
-- Create super admin
INSERT INTO profiles (id, email, role, permissions)
VALUES (
  'user-uuid-here',
  'super@juit.edu',
  'super_admin',
  '{"can_approve": true, "can_edit": true, "can_delete": true, "can_manage_users": true}'::jsonb
);

-- Create faculty (view + comment only)
INSERT INTO profiles (id, email, role, permissions)
VALUES (
  'user-uuid-here',
  'faculty@juit.edu',
  'faculty',
  '{"can_approve": false, "can_edit": true, "can_delete": false, "can_manage_users": false}'::jsonb
);
```

### How Permissions Work

**Database Level (RLS Policies):**
- Automatically enforced by PostgreSQL
- Cannot be bypassed from frontend
- Uses `has_permission()` function

**Frontend Level:**
- UI elements hidden based on permissions
- Better UX (users don't see disabled buttons)
- Still protected by database RLS

**Example Check:**
```typescript
// Check if user can approve
const canApprove = profile?.permissions?.can_approve || 
                   profile?.role === 'super_admin';

if (canApprove) {
  // Show approve button
}
```

---

## 🔔 In-App Notifications

### Notification Types

1. **project_submitted** - New project submitted (to admins)
2. **project_approved** - Project approved (to student)
3. **project_rejected** - Project rejected (to student)
4. **project_under_review** - Under review (to student)
5. **comment_added** - New comment added
6. **system** - System announcements

### Notification Structure

```typescript
interface Notification {
  id: string;
  user_id: string;
  type: 'project_submitted' | 'project_approved' | ...
  title: string;
  message: string;
  link?: string;  // Where to navigate on click
  read: boolean;
  data?: any;     // Additional context
  created_at: string;
}
```

### Real-Time Updates

Notifications use Supabase Realtime:
- ✅ Instant delivery
- ✅ No polling required
- ✅ Battery efficient
- ✅ Works across tabs

### Using Notifications in Your App

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const { 
    notifications,     // All notifications
    unreadCount,       // Count of unread
    loading,           // Loading state
    markAsRead,        // Mark single as read
    markAllAsRead,     // Mark all as read
    deleteNotification // Delete notification
  } = useNotifications();

  return (
    <div>
      <Badge>{unreadCount}</Badge>
      {notifications.map(notification => (
        <NotificationItem 
          key={notification.id}
          notification={notification}
          onRead={() => markAsRead(notification.id)}
        />
      ))}
    </div>
  );
}
```

### Notification Preferences

Each admin can configure:

```json
{
  "email_on_new_project": true,      // Email when project submitted
  "email_on_status_change": false,   // Email when status changes
  "email_digest": "weekly"            // daily, weekly, monthly, never
}
```

Update preferences:

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

## 📦 Email Queue System

### Why Email Queue?

- ✅ **Reliable**: Retry failed emails automatically
- ✅ **Scalable**: Handle high volume
- ✅ **Traceable**: Track delivery status
- ✅ **Resilient**: Survives provider outages

### Email States

- `pending` - Waiting to be sent
- `sending` - Currently being sent
- `sent` - Successfully delivered
- `failed` - Failed after max attempts

### Queue Table Structure

```sql
CREATE TABLE email_queue (
  id UUID PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### Processing Queue

**Option 1: Supabase Edge Function** (Recommended)
```typescript
// Edge function runs on schedule
Deno.serve(async () => {
  // Get pending emails
  const { data } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending')
    .lt('attempts', 3)
    .limit(10);

  // Send each email
  for (const email of data) {
    await sendEmail(email);
  }
});
```

**Option 2: Cron Job** (Server required)
```bash
# Every 5 minutes
*/5 * * * * curl https://your-api.com/process-email-queue
```

---

## 🔧 Setup Instructions

### Step 1: Run Database Migration

```bash
# In Supabase SQL Editor, run:
supabase/migrations/20241123_add_roles_and_notifications.sql
```

This creates:
- Updated `profiles` table with roles
- `notifications` table
- `email_queue` table
- Helper functions
- Triggers for auto-notifications

### Step 2: Configure Email Provider

Choose one:

**Resend:**
```env
VITE_EMAIL_PROVIDER=resend
VITE_EMAIL_API_KEY=re_xxxx
VITE_EMAIL_FROM=noreply@yourdomain.com
```

**SendGrid:**
```env
VITE_EMAIL_PROVIDER=sendgrid
VITE_EMAIL_API_KEY=SG.xxxx
VITE_EMAIL_FROM=verified@yourdomain.com
```

**Supabase (queue only):**
```env
VITE_EMAIL_PROVIDER=supabase
```

### Step 3: Set App Base URL

In Supabase SQL Editor:
```sql
ALTER DATABASE postgres 
SET app.base_url = 'https://your-domain.com';
```

### Step 4: Create Admin Users

Create users with different roles:

```sql
-- Super Admin
INSERT INTO auth.users (email, encrypted_password)
VALUES ('admin@juit.edu', crypt('password', gen_salt('bf')));

-- The profile will be auto-created via trigger
-- Then update role:
UPDATE profiles 
SET role = 'super_admin'
WHERE email = 'admin@juit.edu';
```

### Step 5: Test Notifications

1. Submit a test project
2. Check `email_queue` table
3. Check `notifications` table
4. Verify emails received

---

## 📊 Monitoring

### Check Email Queue Status

```sql
-- Pending emails
SELECT COUNT(*) FROM email_queue WHERE status = 'pending';

-- Failed emails
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

### Check Notification Delivery

```sql
-- Unread notifications per user
SELECT 
  p.email,
  COUNT(*) as unread_count
FROM notifications n
JOIN profiles p ON p.id = n.user_id
WHERE n.read = false
GROUP BY p.email;
```

---

## ⚠️ Important Notes

### Email Deliverability

1. **Verify your domain** with chosen provider
2. **Set up SPF/DKIM** records
3. **Test thoroughly** before production
4. **Monitor bounce rates**

### Rate Limits

- **Resend Free**: 100 emails/day
- **SendGrid Free**: 100 emails/day
- **Supabase**: No limit (but requires implementation)

### Security

- ✅ RLS policies protect all tables
- ✅ Permissions checked at database level
- ✅ Email addresses validated
- ✅ API keys kept in environment variables

---

## 🚀 Next Steps

After basic setup:

1. **Customize email templates** in `emailService.ts`
2. **Add notification preferences UI** for admins
3. **Implement email digest** (cron job required)
4. **Add notification center** component in header
5. **Set up email monitoring** dashboard
6. **Configure backup email provider**

---

## 📝 Example Scenarios

### Scenario 1: Student Submits Project

1. Student fills form and clicks submit
2. Project saved to database
3. **Trigger fires**: `notify_new_project()`
4. **Emails queued**:
   - Confirmation to student ✉️
   - Alerts to admins (if enabled) ✉️✉️✉️
5. **Notifications created** for admins 🔔
6. Admins see notification badge update in real-time

### Scenario 2: Admin Approves Project

1. Admin clicks "Approve" + adds comments
2. Project status updated to 'approved'
3. **Trigger fires**: `notify_project_status_change()`
4. **Email queued** to student ✉️
5. **Notification created** for admin (confirmation) 🔔
6. Student receives email with approval + comments

### Scenario 3: View-Only Faculty Tries to Edit

1. Faculty opens project review modal
2. Frontend checks: `profile.permissions.can_approve` = false
3. **Approve button hidden**
4. Faculty can only view and add comments
5. If they try to edit via API directly:
   - **RLS policy blocks** at database level
   - Error returned: "Permission denied"

---

## ❓ Troubleshooting

**Emails not sending?**
- Check email_queue table for errors
- Verify API key is correct
- Check provider dashboard for issues
- Ensure `from` email is verified

**Notifications not appearing?**
- Check browser console for errors
- Verify Realtime is enabled in Supabase
- Check RLS policies allow user access
- Verify trigger is enabled

**Permission denied errors?**
- Check user's role in profiles table
- Verify permissions JSON is correct
- Check RLS policies are enabled
- Review has_permission() function

---

For more help, see:
- [BACKEND_SETUP.md](./BACKEND_SETUP.md)
- [QUICK_START.md](./QUICK_START.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
