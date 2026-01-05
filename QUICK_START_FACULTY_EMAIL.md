# Quick Start - Faculty Email Feature ⚡

## Current Status
**All changes are on the `main` branch and ready to go! ✅**

---

## 1. Update Faculty Emails (REQUIRED)

**File:** `server/mail_service/main.go` (lines 31-35)

**Current:**
```go
var FACULTY_EMAILS = []string{
    "head1@juitsolan.in",
    "head2@juitsolan.in",
    "head3@juitsolan.in",
}
```

**Change to your faculty emails:**
```go
var FACULTY_EMAILS = []string{
    "dr.faculty1@juitsolan.in",
    "dr.faculty2@juitsolan.in",
    "dr.faculty3@juitsolan.in",
}
```

---

## 2. Verify Environment Variables

**File:** `server/mail_service/.env`

```
EMAIL=your-gmail@gmail.com
PASSWORD=your-16-char-app-password
PORT=3001
```

**Important:** Use **App Password**, not regular Gmail password!
- Get it from: https://myaccount.google.com/apppasswords
- 2FA must be enabled

---

## 3. Start Email Service

```powershell
cd server/mail_service
go run main.go
```

**Expected Output:**
```
Go email service starting on port 3001...
Faculty notification emails (3 recipients):
  1. dr.faculty1@juitsolan.in
  2. dr.faculty2@juitsolan.in
  3. dr.faculty3@juitsolan.in
```

---

## 4. Start Frontend

```powershell
npm run dev
```

---

## 5. Test It

1. Go to http://localhost:5173
2. Fill the project form
3. Submit
4. Check emails:
   - Student: Gets confirmation
   - Faculty (all 3): Get notification with full project details

---

## What Happens

```
Student submits form
    ↓
✓ Database saves project
    ↓
✓ Student gets confirmation email
    ↓
✓ All 3 faculty heads get notification email
    ↓
Success message shown
```

---

## Email Content

### Student Gets:
```
Subject: Project Submission Confirmation - JUIT Robotics Hub
Body: Thank you message + project name
```

### Faculty Gets (to all 3):
```
Subject: New Project Submission for Review - JUIT Robotics Hub
Body: 
  - Student info (name, email, roll, branch, year)
  - Project details (title, category, description)
  - Resources (list + requirements)
```

---

## Files Changed

| File | Change |
|------|--------|
| `server/mail_service/main.go` | Faculty email support for 3 heads |
| `src/components/ProjectForm.tsx` | Sends faculty notification on submit |
| `server/mail_service/.env` | Configuration documentation |

---

## Configuration Quick Reference

### Add/Remove Faculty

**To add 4th faculty:**
```go
var FACULTY_EMAILS = []string{
    "head1@juitsolan.in",
    "head2@juitsolan.in",
    "head3@juitsolan.in",
    "head4@juitsolan.in",  // Add here
}
```

**To remove 3rd faculty:**
```go
var FACULTY_EMAILS = []string{
    "head1@juitsolan.in",
    "head2@juitsolan.in",
    // Removed head3
}
```

Then restart the Go service.

---

## Troubleshooting

### Faculty not getting emails
1. Check email addresses are correct
2. Restart Go service after any changes
3. Check spam folder
4. Verify Gmail app password

### Service won't start
1. Verify .env file exists
2. Check EMAIL and PASSWORD are set
3. Make sure Go is installed
4. Try: `go version`

### Form submission fails
1. Check Go service is running
2. Check browser console for errors
3. Verify frontend and backend can communicate

---

## No Breaking Changes

✅ All existing functionality preserved
✅ Student emails still work
✅ Form submission unchanged
✅ Admin approval/rejection still works
✅ Database schema unchanged

---

## Ready to Deploy?

**Checklist:**
- [ ] Faculty emails updated in main.go
- [ ] .env file configured with app password
- [ ] Go service starts without errors
- [ ] Frontend starts without errors
- [ ] Test form submission
- [ ] Student receives confirmation
- [ ] Faculty receives notification
- [ ] All details correct in faculty email

**Once all checked: You're good to go! ✅**

---

## Need Help?

- Setup: Check .env and app password
- Testing: Submit test project and check both inboxes
- Configuration: Edit FACULTY_EMAILS array in main.go
- Issues: Check browser console and Go service logs

**Everything working?** You're ready for production! 🚀
