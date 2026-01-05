# Testing Faculty Email Feature

## Prerequisites

- Go installed
- Email service `.env` file configured with GMAIL credentials
- Frontend running on port 5173 (or configured port)
- Go service configured to run on port 3001

## Test Setup

### 1. Start Go Email Service

```bash
cd server/mail_service
go run main.go
```

**Expected Output:**
```
Go email service starting on port 3001...
Endpoints:
  POST /api/send-email
  GET  /health
Faculty notification email: robotics-coordinator@juitsolan.in
```

### 2. Verify Service is Running

```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{"status":"ok"}
```

### 3. Start Frontend

```bash
npm run dev
```

## Test Scenarios

### Test 1: Basic Faculty Email Send (cURL)

**Purpose:** Test if Go service correctly sends faculty emails

**Command:**
```bash
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "faculty_notification",
    "projectName": "Test Robot Project",
    "studentName": "Test Student",
    "studentEmail": "test@juitsolan.in",
    "rollNumber": "12345",
    "branch": "CSE",
    "year": "3rd",
    "category": "Autonomous Robots",
    "description": "This is a test project description.",
    "resourcesArray": ["Drone", "Arduino & Development Kits"],
    "resourceDescription": "We need these specific resources for testing."
  }'
```

**Expected Response:**
```json
{"message":"faculty_notification email sent successfully"}
```

**Verify:**
- Check faculty email inbox for new message
- Email should come from configured sender
- Email should contain all test data

### Test 2: Student Confirmation Email (cURL)

**Purpose:** Verify student emails still work (backward compatibility)

**Command:**
```bash
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@juitsolan.in",
    "name": "Student Name",
    "emailType": "submission",
    "projectName": "Test Project"
  }'
```

**Expected Response:**
```json
{"message":"submission email sent successfully"}
```

**Verify:**
- Student receives confirmation email
- Email is from configured sender
- No reference to faculty in student email

### Test 3: Full Form Submission

**Purpose:** Test complete workflow from form to both emails

**Steps:**

1. Open http://localhost:5173 (or your frontend port)
2. Scroll to "Submit Your Project Idea" form
3. Fill form with data:
   - **Name:** Test Student
   - **Email:** your-test-email@juitsolan.in
   - **Roll Number:** 12345
   - **Branch:** CSE
   - **Year:** 3rd
   - **Contact:** +919999999999
   - **Category:** Autonomous Robots
   - **Duration:** 3-6 months
   - **Title:** Test Robotics Project
   - **Description:** A comprehensive test project
   - **Outcomes:** Successfully test the system
   - **Resources:** Select at least 2 (e.g., Drone, Arduino)
   - **Resource Details:** Explain resource usage
   - **Consent:** Check box

4. Click **Submit Project Idea**

**Expected Behavior:**
```
✓ Form validates (no errors)
✓ Shows "Project idea submitted successfully!" toast
✓ Form clears automatically
✓ No errors in browser console
```

**Email Verification:**

*Student Email:*
- Subject: "Project Submission Confirmation - JUIT Robotics Hub"
- Contains: Acknowledgment and project name
- From: Configured sender email
- To: your-test-email@juitsolan.in

*Faculty Email:*
- Subject: "New Project Submission for Review - JUIT Robotics Hub"
- Contains:
  - Student info: Name, email, roll number, branch, year
  - Project info: Title, category
  - Full description
  - Resource list (Drone, Arduino, etc.)
  - Resource requirements
- From: Configured sender email
- To: robotics-coordinator@juitsolan.in

### Test 4: Error Handling

**Purpose:** Verify form still works if email service fails

**Steps:**
1. Stop Go email service (Ctrl+C in Go terminal)
2. Fill and submit the form again

**Expected Behavior:**
```
✓ Form shows "Project idea submitted successfully!"
✓ Database shows new project entry
✓ Browser console shows fetch errors (non-blocking)
✓ No user-facing error about emails
```

**Verification:**
- Check Supabase projects table - new entry exists
- Check Go service logs - shows connection refused

### Test 5: Faculty Email Address Change

**Purpose:** Verify faculty email can be updated

**Steps:**
1. Edit `server/mail_service/main.go` line 28
2. Change: `const FACULTY_EMAIL = "new-faculty@juitsolan.in"`
3. Stop and restart Go service
4. Submit a new form
5. Verify new email receives notification

**Expected:**
- Old faculty email does NOT receive notification
- New faculty email DOES receive notification

### Test 6: Missing Required Fields

**Purpose:** Verify proper validation for faculty email API

**Command (Missing projectName):**
```bash
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "faculty_notification",
    "studentName": "Test",
    "studentEmail": "test@juitsolan.in"
  }'
```

**Expected Response:**
```json
{"error": "Bad request: projectName, studentEmail, and studentName are required for faculty notification"}
```

## Troubleshooting During Testing

### No Response from cURL
- Check if port 3001 is correct
- Verify Go service is running
- Try: `curl http://localhost:3001/health`

### Go Service Crashes
- Check if `.env` file exists and has EMAIL and PASSWORD
- Verify Gmail app-specific password (not regular password)
- Check logs for specific error

### Emails Not Received
- Check spam/junk folder
- Verify email address is correct
- Check Gmail security settings if using Gmail
- Verify EMAIL in .env is sending account

### Form Won't Submit
- Check browser console for errors
- Verify at least one resource is selected
- Verify all required fields are filled
- Check if Go service is running

### Faculty Email Not Sent (But Student Email Works)
- Check FACULTY_EMAIL constant in main.go
- Verify line: `const FACULTY_EMAIL = "robotics-coordinator@juitsolan.in"`
- Check Go service logs
- Try Test 1 with cURL

## Test Results Template

```
Test Date: _______________
Tester: ___________________

[ ] Test 1: Basic Faculty Email (cURL) - PASS/FAIL
[ ] Test 2: Student Email (cURL) - PASS/FAIL
[ ] Test 3: Full Form Submission - PASS/FAIL
[ ] Test 4: Error Handling - PASS/FAIL
[ ] Test 5: Faculty Email Change - PASS/FAIL
[ ] Test 6: Validation - PASS/FAIL

Notes:
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
```

## Quick Verification Checklist

- [ ] Go service starts without errors
- [ ] Health check returns {"status":"ok"}
- [ ] Student email test with cURL works
- [ ] Faculty email test with cURL works
- [ ] Form submission succeeds
- [ ] Student receives correct email
- [ ] Faculty receives correct email
- [ ] Form clears after submission
- [ ] No errors in browser console
- [ ] No breaking changes to existing functionality

## What Could Go Wrong

| Issue | Check |
|-------|-------|
| Emails in spam | Check spam folder, add to contacts |
| Slow email delivery | Normal (up to 5 minutes sometimes) |
| Form won't submit | Check browser console for errors |
| Go service won't start | Check .env file exists with EMAIL/PASSWORD |
| Only student email sent | Check Go logs, verify FACULTY_EMAIL |
| Connection refused | Verify port 3001 is open, service running |

## Next Steps After Testing

1. Document test results
2. If all tests pass: Deploy to feature branch
3. Request code review
4. Merge to main branch
5. Deploy to production
