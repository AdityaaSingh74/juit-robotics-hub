# Faculty Email Feature - Changes Summary

## Files Modified

### 1. `server/mail_service/main.go`

**Added:**
- Faculty email constant (line 28)
- New EmailRequest fields for faculty notifications
- `generateFacultyEmailContent()` function
- Email routing logic to handle faculty_notification type

**Key Lines:**
```go
// Line 28 - Faculty email (EDIT THIS TO CHANGE)
const FACULTY_EMAIL = "robotics-coordinator@juitsolan.in"

// Line 37-46 - New fields in EmailRequest struct
StudentEmail       string
StudentName        string
RollNumber         string
Branch             string
Year               string
Category           string
Description        string
ResourcesArray     []string
ResourceDescription string

// Lines 123-155 - Faculty email generation function
func generateFacultyEmailContent(req EmailRequest) (string, string, error)

// Lines 178-188 - Routing logic
if req.EmailType == "faculty_notification" {
    subject, body, err = generateFacultyEmailContent(req)
    targetEmail = FACULTY_EMAIL
} else {
    subject, body, err = generateStudentEmailContent(req)
    targetEmail = req.Email
}
```

### 2. `src/components/ProjectForm.tsx`

**Added:**
- `sendFacultyNotificationEmail()` function (lines 76-110)
- Call to faculty email function in `onSubmit()` (line 179)
- `duration` variable captured from form (line 52)

**Key Changes:**
```typescript
// Lines 76-110 - New function
const sendFacultyNotificationEmail = async (projectData: any) => {
    // Sends faculty_notification email type
    // Includes all project details
    // Non-blocking errors
}

// Line 179 in onSubmit - Added call
await sendFacultyNotificationEmail(project);
```

### 3. `server/mail_service/.env`

**Added Comment:**
```
# Faculty email is hardcoded in main.go as FACULTY_EMAIL constant
# Update it there if the faculty email changes
```

## What Happens Now

### Before Changes
```
Student submits → Save to DB → Send student email
```

### After Changes
```
Student submits → Save to DB → Send student email → Send faculty email
```

## No Breaking Changes

✅ All existing student emails work the same:
- Type: "submission" → Student confirmation
- Type: "approved" → Approval notification
- Type: "rejected" → Rejection notification

✅ New email type added:
- Type: "faculty_notification" → Faculty alert

## How to Change Faculty Email

**Step 1:** Open `server/mail_service/main.go`

**Step 2:** Find line 28:
```go
const FACULTY_EMAIL = "robotics-coordinator@juitsolan.in"
```

**Step 3:** Replace with new email:
```go
const FACULTY_EMAIL = "new-faculty-email@juitsolan.in"
```

**Step 4:** Restart the Go service

## Testing Checklist

- [ ] Go email service runs: `go run main.go`
- [ ] No compilation errors
- [ ] Student can submit form
- [ ] Student receives confirmation email
- [ ] Faculty receives notification email
- [ ] Faculty email contains all project details
- [ ] Resources list shows correctly in faculty email

## Technical Details

### Email Types Now Supported
1. `submission` - Student gets confirmation
2. `approved` - Student gets approval notice  
3. `rejected` - Student gets rejection notice
4. `faculty_notification` - Faculty gets alert (NEW)

### Faculty Email Includes
- Student: name, email, roll number, branch, year
- Project: title, category, description
- Resources: list of required resources
- Details: resource requirements notes

### Error Handling
- If faculty email fails: Logged only, user sees success
- If student email fails: Logged only, user sees success
- If database fails: User sees error, stops submission

## Deployment

1. Rebuild Go binary (if deploying)
2. No database migrations needed
3. No new environment variables needed
4. Update faculty email constant if needed
5. Restart services

## Rollback

To remove faculty notifications:

**Option 1 - Quick (Keep code, disable):**
- Comment out line in ProjectForm: `// await sendFacultyNotificationEmail(project);`

**Option 2 - Full (Remove code):**
- Revert ProjectForm.tsx to previous version
- Remove generateFacultyEmailContent() from main.go
- Remove faculty email logic from sendEmailHandler()

## Questions

Refer to `FACULTY_EMAIL_GUIDE.md` for setup and troubleshooting.
