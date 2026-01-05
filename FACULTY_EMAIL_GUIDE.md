# Faculty Email Notification Service - Quick Guide

## What Changed

### 1. Backend Email Service (Go)
**File:** `server/mail_service/main.go`

**Faculty Email Address:**
Line 28 - Hardcoded in code:
```go
const FACULTY_EMAIL = "robotics-coordinator@juitsolan.in"
```

To change: Edit this line and restart the service.

**New EmailType Supported:**
- `"faculty_notification"` - Sends email to FACULTY_EMAIL constant

**No Breaking Changes:** All existing functionality (submission, approved, rejected emails) works exactly the same.

### 2. Frontend Form (React)
**File:** `src/components/ProjectForm.tsx`

**What Happens on Submit:**
1. Project data saved to database
2. Confirmation email sent to student
3. Notification email sent to faculty (includes all project details)
4. Form clears and shows success

**If Email Fails:** Student still sees success - email failures don't block submissions.

## How It Works

### Flow Diagram
```
Student Submits Form
    ↓
✓ Validate & Save to Database
    ↓
✓ Send Student Confirmation Email
    ↓
✓ Send Faculty Notification Email
    ↓
Show Success Message to Student
```

### Faculty Email Content
```
To: robotics-coordinator@juitsolan.in
Subject: New Project Submission for Review - JUIT Robotics Hub

Contains:
- Student name, email, roll number, branch, year
- Project title and category
- Full project description
- Selected resources (Drone, Arduino, etc.)
- Resource requirements details
```

## Setup

### 1. Faculty Email Configuration

**Option 1: Hardcoded (Current)**
- Edit: `server/mail_service/main.go` line 28
- Change: `const FACULTY_EMAIL = "new-email@juitsolan.in"`
- Rebuild: `go run main.go`

**Option 2: Future - Use .env file**
(Not implemented yet, but enhancement possibility)

### 2. Run Email Service
```bash
cd server/mail_service
go run main.go
```

Expected output:
```
Go email service starting on port 3001...
Faculty notification email: robotics-coordinator@juitsolan.in
```

### 3. Environment Variables (No New Ones)
Use existing `.env` file:
```
EMAIL=your-gmail@gmail.com
PASSWORD=your-app-password
PORT=3001
```

## Testing

### Step 1: Start Services
```bash
# Terminal 1 - Email Service
cd server/mail_service
go run main.go

# Terminal 2 - Frontend (if not already running)
cd juit-robotics-hub
npm run dev
```

### Step 2: Submit Test Project
1. Go to project form
2. Fill all fields
3. Select at least one resource
4. Click Submit

### Step 3: Verify Emails
1. Check student email: Should receive confirmation
2. Check faculty email: Should receive detailed project info
3. Both emails should have student and project details

## Files Modified

### Backend
- `server/mail_service/main.go` - Added faculty email generation and routing
- `server/mail_service/.env` - Added comment about faculty email

### Frontend  
- `src/components/ProjectForm.tsx` - Added faculty notification function

## API Reference

### Student Email (Existing)
```json
{
  "email": "student@juitsolan.in",
  "name": "Student Name",
  "emailType": "submission",
  "projectName": "Project Title"
}
```

### Faculty Email (New)
```json
{
  "emailType": "faculty_notification",
  "projectName": "Project Title",
  "studentName": "Student Name",
  "studentEmail": "student@juitsolan.in",
  "rollNumber": "123456",
  "branch": "CSE",
  "year": "3rd",
  "category": "Autonomous Robots",
  "description": "Project description...",
  "resourcesArray": ["Drone", "Arduino"],
  "resourceDescription": "Resource details..."
}
```

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Faculty email not received | Check FACULTY_EMAIL constant in main.go, verify spam folder |
| Form submission fails | Check if Go service is running, check browser console |
| Only student email received | Check Go service logs, verify email service connectivity |
| "Failed to send email" error | Verify EMAIL/PASSWORD in .env, check Gmail app password |

## Summary of Changes

✓ Go service now generates faculty notification emails
✓ Faculty email hardcoded to: robotics-coordinator@juitsolan.in
✓ ProjectForm sends faculty email after student confirmation
✓ No breaking changes - existing emails work same way
✓ Faculty email includes all project details
✓ Failed emails don't block student submissions
