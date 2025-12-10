# Security Best Practices Guide

## For the JUIT Robotics Hub Development Team

### Last Updated: December 10, 2025

---

## 1. Console Logging Guidelines

### ❌ **DO NOT LOG:**

```typescript
// ❌ WRONG - API Keys
console.log('API Key:', process.env.SUPABASE_ANON_KEY);
console.log('Database URL:', process.env.VITE_SUPABASE_URL);

// ❌ WRONG - User Data
console.log('User Session:', sessionData);
console.log('User Email:', user.email);
console.log('User Profile:', profileData);

// ❌ WRONG - Form Data
console.log('Form Submission:', formData);
console.log('Selected Resources:', resourcesArray);

// ❌ WRONG - Error Details
console.error('Login failed:', error);
// This exposes full error object with stack trace
```

### ✅ **DO LOG:**

```typescript
// ✅ CORRECT - Generic Messages (Dev Only)
if (process.env.NODE_ENV === 'development') {
  console.log('Starting authentication check');
  console.log('API endpoint: /api/auth');
}

// ✅ CORRECT - Error Without Details
if (error) {
  // Log generic message
  console.error('Authentication failed');
  // But don't expose the error object:
  // console.error('Full error:', error); // ❌ WRONG
}

// ✅ CORRECT - Operational Messages
console.warn('Database in mock mode - data not persisted');
console.info('Application initialized successfully');
```

---

## 2. Sensitive Data Protection

### Environment Variables

**Never expose these in console:**
```typescript
// ❌ WRONG
console.log('Environment variables:', import.meta.env);

// ✅ CORRECT - Only in debug builds with explicit check
if (isDevelopment && isDebugModeEnabled) {
  console.log('Config loaded') // Generic message only
}
```

### User Data

**Handle with care:**
```typescript
// ❌ WRONG
const handleLogin = async (email, password) => {
  console.log(`Login attempt: ${email} with password: ${password}`);
  // Never ever log passwords!
}

// ✅ CORRECT
const handleLogin = async (email, password) => {
  // No logging of credentials
  // Use server-side logging only
}
```

### API Responses

**Be selective:**
```typescript
// ❌ WRONG
const { data, error } = await supabase.from('projects').select('*');
console.log('Query response:', data); // Might contain sensitive data

// ✅ CORRECT
const { data, error } = await supabase.from('projects').select('*');
if (error) {
  // Log only that there was an error
  console.error('Failed to fetch projects');
  // Don't log the error object
}
```

---

## 3. Error Handling Best Practices

### Pattern 1: Silent Error Handling

```typescript
// Use when: User doesn't need to know details
const fetchProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      // Don't log or expose error
      // Return sensible default
      return createDefaultProfile(userId);
    }
    return data;
  } catch (err) {
    // Silently fail with fallback
    return createDefaultProfile(userId);
  }
};
```

### Pattern 2: User-Friendly Error Handling

```typescript
// Use when: User needs to know something went wrong
const handleProjectSubmission = async (formData) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([formData])
      .select()
      .single();
    
    if (error) {
      // Show user-friendly message
      toast.error('Failed to submit project. Please try again.');
      // Don't expose technical details
      return false;
    }
    return true;
  } catch (err) {
    // Generic error message
    toast.error('An unexpected error occurred.');
    return false;
  }
};
```

### Pattern 3: Server-Side Error Logging

```typescript
// Use when: You need technical error details for debugging
// This should be done on the backend, not client

// BACKEND ONLY (Node.js/Express example):
app.use((error, req, res, next) => {
  // Log detailed error server-side
  logger.error('Server error:', {
    message: error.message,
    stack: error.stack,
    endpoint: req.path,
    timestamp: new Date().toISOString()
  });
  
  // Return generic error to client
  res.status(500).json({
    error: 'Internal server error'
    // Don't include details
  });
});
```

---

## 4. Development vs Production

### Development Environment

**.env.development:**
```env
# Development: More verbose logging OK
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
VITE_SUPABASE_URL=https://dev.supabase.co
VITE_SUPABASE_ANON_KEY=dev_key_12345
```

**In code:**
```typescript
if (import.meta.env.VITE_DEBUG_MODE === 'true') {
  console.log('Dev mode: Additional logging enabled');
  // Dev-only logging here
}
```

### Production Environment

**.env.production:**
```env
# Production: Minimal logging
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
VITE_SUPABASE_URL=https://prod.supabase.co
VITE_SUPABASE_ANON_KEY=prod_key_xxxxx
```

**In code:**
```typescript
if (import.meta.env.MODE === 'production') {
  // No debug logging in production
  console.log = () => {}; // Optional: disable all logging
}
```

---

## 5. Logging Architecture

### Recommended Setup: Server-Side Logging

**Benefits:**
- ✅ Secure (logs not visible to users)
- ✅ Persistent (stored on server)
- ✅ Searchable (can query logs)
- ✅ Compliant (meets GDPR requirements)

### Implementation Example

**Backend (Node.js + Winston):**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    // Log errors to file
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // Log all to file
    new winston.transports.File({ filename: 'combined.log' }),
    // Log to console in development
    ...(process.env.NODE_ENV === 'development' 
      ? [new winston.transports.Console()] 
      : [])
  ]
});

// Usage in handlers
logger.error('User login failed', {
  email: user.email,  // OK on backend
  reason: error.message,
  timestamp: new Date()
});
```

**Frontend (Send errors to backend):**
```typescript
const reportError = async (error) => {
  try {
    // Send error to backend for logging
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
        // Don't include sensitive data
      })
    });
  } catch (err) {
    // Silently fail
  }
};

// Usage
try {
  // Some operation
} catch (error) {
  reportError(error); // Send to backend
  // Show generic message to user
  toast.error('Something went wrong');
}
```

---

## 6. Code Review Checklist

When reviewing code, check for:

- [ ] No `console.log()` with sensitive data
- [ ] No API keys or tokens in console output
- [ ] No user data (email, name, etc.) in console
- [ ] No environment variables exposed
- [ ] No full error objects logged (use messages only)
- [ ] Error handling uses user-friendly messages
- [ ] No debug comments left in production code
- [ ] No `debugger` statements left in code
- [ ] No commented-out logging code
- [ ] Production builds have logging disabled

---

## 7. Git Commit Best Practices

### Preventing Secrets in Git

**.gitignore:**
```bash
# Environment files
.env
.env.local
.env.*.local

# Sensitive files
*.pem
*.key
secrets.json

# Build artifacts
build/
dist/
.vite/

# IDE
.vscode/
.idea/
```

### Pre-commit Hook (optional but recommended)

**.husky/pre-commit:**
```bash
#!/bin/bash

# Check for console statements
if grep -r "console\.log\|console\.error\|console\.warn" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v "SECURITY_BEST_PRACTICES"; then
  echo "❌ Error: Found console statements in code"
  echo "Please remove before committing"
  exit 1
fi

# Check for API keys in code
if grep -r "SUPABASE_ANON_KEY\|API_KEY\|SECRET" src/ --include="*.ts" --include="*.tsx" --exclude="*.md"; then
  echo "❌ Error: Possible API key found in code"
  exit 1
fi
```

---

## 8. Common Mistakes to Avoid

### Mistake 1: Logging Full Error Objects

```typescript
// ❌ WRONG
catch (error) {
  console.error(error); // Exposes stack trace
}

// ✅ CORRECT
catch (error) {
  console.error('Operation failed'); // Generic message
  // Optionally send detailed error to backend
}
```

### Mistake 2: Logging User Actions

```typescript
// ❌ WRONG
const onClick = (email) => {
  console.log(`User ${email} clicked button`);
}

// ✅ CORRECT
const onClick = () => {
  // No logging of user information
  // If needed, send anonymous event to backend
}
```

### Mistake 3: Conditional Console in Production

```typescript
// ❌ WRONG
if (someCondition) {
  console.log('Sensitive data:', userData);
  // Someone can trigger this in production
}

// ✅ CORRECT
if (isDevelopment && process.env.DEBUG === 'true') {
  console.log('Debug info:', userData);
}
```

### Mistake 4: Forgotten Debug Code

```typescript
// ❌ WRONG
const handler = async (data) => {
  console.log('DEBUG:', data); // Forgot to remove
  const result = await process(data);
  console.log('RESULT:', result); // Should have been removed
  return result;
}

// ✅ CORRECT
const handler = async (data) => {
  const result = await process(data);
  return result;
}
```

---

## 9. Security Incident Response

If sensitive data is accidentally logged:

### Immediate Actions
1. Stop the deployment/rollback if already live
2. Remove the logging statement
3. Clear browser cache
4. Reset affected credentials if exposed (API keys, etc.)

### Investigation
1. Check git history for leaks
2. Check deployed versions
3. Check user browser histories
4. Check server logs

### Prevention
1. Code review process
2. Automated testing
3. Pre-commit hooks
4. Security training

---

## 10. Resources & Tools

### ESLint Configuration

Add to your project:

```bash
npm install --save-dev eslint-plugin-no-console
```

**.eslintrc.json:**
```json
{
  "plugins": ["no-console"],
  "rules": {
    "no-console": [
      "warn",
      { "allow": ["warn", "error"] }
    ]
  }
}
```

### Recommended Tools

- **Error Tracking:** Sentry (sentry.io)
- **Logging:** Winston, Pino, Bunyan
- **Secrets Management:** HashiCorp Vault, AWS Secrets Manager
- **Code Scanning:** SonarQube, GitHub Advanced Security
- **Dependency Scanning:** npm audit, Snyk

---

## 11. Team Guidelines

### Code Review Process

1. **Reviewer:** Check for console statements
2. **Reviewer:** Verify no sensitive data logged
3. **Reviewer:** Ensure error handling is proper
4. **Approver:** Cannot approve with console logs

### Training

- Monthly security review meetings
- Security best practices documentation
- Code examples and patterns
- Real-world incident case studies

### Monitoring

- Regular security audits
- Automated scanning tools
- User privacy impact assessments
- Quarterly security updates

---

## Summary

### Golden Rules

1. ❌ **Never log secrets**
   - API keys, tokens, passwords

2. ❌ **Never log user data**
   - Emails, names, personal info

3. ❌ **Never expose errors**
   - Stack traces, error objects

4. ✅ **Always use user-friendly messages**
   - Generic, helpful error messages

5. ✅ **Log on the server, not the client**
   - Secure, persistent logging

6. ✅ **Review before committing**
   - Check for sensitive data in code

---

## Questions or Issues?

If you find a potential security issue:
1. Document the issue
2. Create a private security report
3. Don't publicly disclose
4. Wait for fix before disclosure

**Security Contact:** [Add your contact info]

---

*Last reviewed: December 10, 2025*
*Next review: June 10, 2026*
