-- Add new role types to profiles table
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('super_admin', 'admin', 'faculty', 'view_only'));

-- Set default role to admin (backward compatible)
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'admin';

-- Add permissions column to track specific permissions
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"can_approve": true, "can_edit": true, "can_delete": false, "can_manage_users": false}'::jsonb;

-- Add notification preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email_on_new_project": true, "email_on_status_change": false, "email_digest": "weekly"}'::jsonb;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('project_submitted', 'project_approved', 'project_rejected', 'project_under_review', 'comment_added', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create email queue table for reliable email delivery
CREATE TABLE IF NOT EXISTS public.email_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    to_email TEXT NOT NULL,
    to_name TEXT,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    template_name TEXT,
    template_data JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Add indexes for email queue
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON public.email_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON public.email_queue(created_at DESC);

-- RLS Policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
    ON public.notifications FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
    ON public.notifications FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- RLS Policies for email queue (admin only)
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email queue" 
    ON public.email_queue FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('super_admin', 'admin')
        )
    );

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION public.has_permission(
    user_id UUID,
    permission_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    user_permissions JSONB;
    has_perm BOOLEAN;
BEGIN
    -- Get user role and permissions
    SELECT role, permissions INTO user_role, user_permissions
    FROM public.profiles
    WHERE id = user_id;
    
    -- Super admin has all permissions
    IF user_role = 'super_admin' THEN
        RETURN TRUE;
    END IF;
    
    -- View only has no write permissions
    IF user_role = 'view_only' THEN
        RETURN FALSE;
    END IF;
    
    -- Check specific permission
    has_perm := COALESCE((user_permissions->>permission_name)::BOOLEAN, FALSE);
    
    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for projects to use new permission system
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;

CREATE POLICY "Users with edit permission can update projects" 
    ON public.projects FOR UPDATE 
    TO authenticated 
    USING (
        public.has_permission(auth.uid(), 'can_edit') OR 
        public.has_permission(auth.uid(), 'can_approve')
    );

DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;

CREATE POLICY "Users with delete permission can delete projects" 
    ON public.projects FOR DELETE 
    TO authenticated 
    USING (
        public.has_permission(auth.uid(), 'can_delete')
    );

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_link TEXT DEFAULT NULL,
    p_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, type, title, message, link, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_link, p_data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to queue email
CREATE OR REPLACE FUNCTION public.queue_email(
    p_to_email TEXT,
    p_to_name TEXT,
    p_subject TEXT,
    p_body_html TEXT,
    p_body_text TEXT DEFAULT NULL,
    p_template_name TEXT DEFAULT NULL,
    p_template_data JSONB DEFAULT NULL,
    p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    email_id UUID;
BEGIN
    INSERT INTO public.email_queue (
        to_email, to_name, subject, body_html, body_text, 
        template_name, template_data, scheduled_for
    )
    VALUES (
        p_to_email, p_to_name, p_subject, p_body_html, p_body_text,
        p_template_name, p_template_data, 
        COALESCE(p_scheduled_for, TIMEZONE('utc'::text, NOW()))
    )
    RETURNING id INTO email_id;
    
    RETURN email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to send notifications when project status changes
CREATE OR REPLACE FUNCTION public.notify_project_status_change()
RETURNS TRIGGER AS $$
DECLARE
    admin_record RECORD;
    notification_title TEXT;
    notification_message TEXT;
BEGIN
    -- Only trigger if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Set notification content based on new status
        CASE NEW.status
            WHEN 'approved' THEN
                notification_title := 'Project Approved! 🎉';
                notification_message := 'Your project "' || NEW.project_title || '" has been approved!';
            WHEN 'rejected' THEN
                notification_title := 'Project Status Update';
                notification_message := 'Your project "' || NEW.project_title || '" has been reviewed.';
            WHEN 'under_review' THEN
                notification_title := 'Project Under Review';
                notification_message := 'Your project "' || NEW.project_title || '" is now under review.';
            ELSE
                notification_title := 'Project Status Updated';
                notification_message := 'Your project "' || NEW.project_title || '" status has been updated.';
        END CASE;
        
        -- Queue email to student
        PERFORM public.queue_email(
            NEW.student_email,
            NEW.student_name,
            notification_title,
            '<h2>' || notification_title || '</h2>' ||
            '<p>Dear ' || NEW.student_name || ',</p>' ||
            '<p>' || notification_message || '</p>' ||
            CASE WHEN NEW.faculty_comments IS NOT NULL THEN
                '<p><strong>Faculty Comments:</strong><br>' || NEW.faculty_comments || '</p>'
            ELSE ''
            END ||
            '<p>You can view your project details in the student portal.</p>' ||
            '<p>Best regards,<br>JUIT Robotics Lab</p>',
            notification_message,
            'project_status_update',
            jsonb_build_object(
                'project_id', NEW.id,
                'project_title', NEW.project_title,
                'old_status', OLD.status,
                'new_status', NEW.status
            )
        );
        
        -- Notify all admins with email_on_status_change enabled (if status is approved/rejected)
        IF NEW.status IN ('approved', 'rejected') THEN
            FOR admin_record IN 
                SELECT id, email, full_name 
                FROM public.profiles 
                WHERE role IN ('super_admin', 'admin', 'faculty')
                AND (notification_preferences->>'email_on_status_change')::boolean = true
            LOOP
                PERFORM public.create_notification(
                    admin_record.id,
                    'project_' || NEW.status,
                    'Project ' || UPPER(NEW.status),
                    'Project "' || NEW.project_title || '" by ' || NEW.student_name || ' has been ' || NEW.status,
                    '/admin/dashboard',
                    jsonb_build_object('project_id', NEW.id)
                );
            END LOOP;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_project_status_change ON public.projects;

CREATE TRIGGER trigger_notify_project_status_change
    AFTER UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_project_status_change();

-- Trigger to notify admins of new project submissions
CREATE OR REPLACE FUNCTION public.notify_new_project()
RETURNS TRIGGER AS $$
DECLARE
    admin_record RECORD;
BEGIN
    -- Notify all admins with email_on_new_project enabled
    FOR admin_record IN 
        SELECT id, email, full_name 
        FROM public.profiles 
        WHERE role IN ('super_admin', 'admin', 'faculty')
        AND (notification_preferences->>'email_on_new_project')::boolean = true
    LOOP
        -- Create in-app notification
        PERFORM public.create_notification(
            admin_record.id,
            'project_submitted',
            'New Project Submission',
            NEW.student_name || ' submitted "' || NEW.project_title || '"',
            '/admin/dashboard',
            jsonb_build_object('project_id', NEW.id)
        );
        
        -- Queue email notification
        PERFORM public.queue_email(
            admin_record.email,
            admin_record.full_name,
            'New Project Submission - ' || NEW.project_title,
            '<h2>New Project Submission</h2>' ||
            '<p>Dear ' || COALESCE(admin_record.full_name, 'Admin') || ',</p>' ||
            '<p>A new project has been submitted for review:</p>' ||
            '<ul>' ||
            '<li><strong>Title:</strong> ' || NEW.project_title || '</li>' ||
            '<li><strong>Student:</strong> ' || NEW.student_name || '</li>' ||
            '<li><strong>Category:</strong> ' || NEW.category || '</li>' ||
            '<li><strong>Branch:</strong> ' || NEW.branch || '</li>' ||
            '</ul>' ||
            '<p><a href="' || current_setting('app.base_url', true) || '/admin/dashboard">View in Dashboard</a></p>' ||
            '<p>Best regards,<br>JUIT Robotics Hub System</p>',
            'New project submitted by ' || NEW.student_name,
            'new_project_admin',
            jsonb_build_object(
                'project_id', NEW.id,
                'project_title', NEW.project_title,
                'student_name', NEW.student_name
            )
        );
    END LOOP;
    
    -- Send confirmation email to student
    PERFORM public.queue_email(
        NEW.student_email,
        NEW.student_name,
        'Project Submission Confirmed - ' || NEW.project_title,
        '<h2>Thank You for Your Submission! 🚀</h2>' ||
        '<p>Dear ' || NEW.student_name || ',</p>' ||
        '<p>Your project proposal has been successfully submitted and is now pending review by our faculty.</p>' ||
        '<h3>Submission Details:</h3>' ||
        '<ul>' ||
        '<li><strong>Project Title:</strong> ' || NEW.project_title || '</li>' ||
        '<li><strong>Category:</strong> ' || NEW.category || '</li>' ||
        '<li><strong>Duration:</strong> ' || NEW.duration || '</li>' ||
        '<li><strong>Submission Date:</strong> ' || TO_CHAR(NEW.created_at, 'DD Mon YYYY, HH24:MI') || '</li>' ||
        '</ul>' ||
        '<p>You will receive an email notification once your project has been reviewed.</p>' ||
        '<p>Best regards,<br>JUIT Robotics Lab Team</p>',
        'Your project has been submitted successfully',
        'project_confirmation_student',
        jsonb_build_object(
            'project_id', NEW.id,
            'project_title', NEW.project_title
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_new_project ON public.projects;

CREATE TRIGGER trigger_notify_new_project
    AFTER INSERT ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_project();

-- Update default permissions for existing users
UPDATE public.profiles 
SET permissions = CASE 
    WHEN role = 'admin' THEN '{"can_approve": true, "can_edit": true, "can_delete": false, "can_manage_users": false}'::jsonb
    ELSE permissions
END
WHERE permissions IS NULL;

-- Add app base URL setting (used in email links)
-- This should be set via: ALTER DATABASE your_db SET app.base_url = 'https://your-domain.com';
