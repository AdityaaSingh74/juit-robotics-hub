# Quick Start - Local Development

## What's Fixed ✅

1. **Authentication Issue** - Fixed `useAuth.ts` hook to properly handle profile sync after login
2. **Environment Setup** - Created `.env.example` template
3. **Backend Service** - Added production-ready Dockerfile and CORS configuration
4. **Startup Scripts** - Created one-command startup for both services

---

## Prerequisites

### Required
- ✅ Go 1.21+ ([download](https://golang.org/dl/))
- ✅ Node.js 18+ ([download](https://nodejs.org/))
- ✅ Git ([download](https://git-scm.com/))

### Verify Installation
```bash
go version      # Should show Go 1.21+
node --version  # Should show Node 18+
npm --version   # Should show npm 8+
```

---

## 1️⃣ Initial Setup (First Time Only)

### Step 1: Clone Repository
```bash
git clone https://github.com/AdityaaSingh74/juit-robotics-hub.git
cd juit-robotics-hub
```

### Step 2: Create Environment Files

#### Frontend Environment (`.env.local`)
```bash
# Copy template
cp .env.example .env.local

# Edit .env.local and add:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_USE_MOCK=false
VITE_BACKEND_URL=http://localhost:3001
```

**Finding Supabase credentials:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API → Copy URL and Anon Key

#### Backend Environment (`server/mail_service/.env`)
```bash
# Create file
cd server/mail_service
touch .env  # On Windows: copy nul > .env

# Add these lines:
EMAIL=your-gmail@gmail.com
PASSWORD=your-app-specific-password
PORT=3001
```

**Getting Gmail App Password:**
1. Enable 2-Factor Authentication on Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows"
4. Copy the 16-character password to PASSWORD field

---

## 2️⃣ Start Development

### Option A: Automatic (Recommended)

**On macOS/Linux:**
```bash
chmod +x start-dev.sh  # Make executable (first time only)
./start-dev.sh
```

**On Windows:**
```bash
start-dev.bat
```

✅ Both services will start in ~5 seconds!

### Option B: Manual

**Terminal 1 - Backend:**
```bash
cd server/mail_service
go mod download  # First time only
go run main.go
```

Expected output:
```
Go email service starting on port 3001...
Endpoints:
  POST /api/send-email
  GET  /health
```

**Terminal 2 - Frontend:**
```bash
npm install     # First time only
npm run dev
```

Expected output:
```
  VITE v5.4.19  ready in 345 ms
  ✔ Local:   http://localhost:5173/
```

---

## 3️⃣ Test Login Flow

1. Open http://localhost:5173/admin in browser
2. Enter your Supabase credentials:
   - Email: `your-email@example.com`
   - Password: `your-password`
3. ✅ Should show "Logged in successfully!"
4. ✅ Should redirect to admin dashboard

---

## 4️⃣ Test Email Sending

### From Admin Dashboard
1. Submit a project (http://localhost:5173)
2. Go to admin dashboard (http://localhost:5173/admin)
3. Approve or reject the project
4. ✅ Email should arrive in inbox within 5 seconds

### Direct API Test
```bash
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@gmail.com",
    "name": "Test User",
    "emailType": "submission",
    "projectName": "Test Project"
  }'
```

### Health Check
```bash
curl http://localhost:3001/health
# Should return: {"status": "ok"}
```

---

## 5️⃣ Services URLs

| Service | URL | Purpose |
|---------|-----|----------|
| Frontend | http://localhost:5173 | Main application |
| Admin Panel | http://localhost:5173/admin | Login & dashboard |
| Backend API | http://localhost:3001 | Email service API |
| Health Check | http://localhost:3001/health | Backend status |

---

## 6️⃣ Common Issues & Fixes

### ❌ Login shows "Invalid credentials"
**Solution:**
1. Double-check Supabase credentials in `.env.local`
2. Verify email exists in Supabase auth
3. Check browser console for error messages
4. Try signing up at http://localhost:5173/signup first

### ❌ Backend won't start
**Solution:**
1. Check Gmail credentials in `server/mail_service/.env`
2. Make sure port 3001 is not in use: `lsof -i :3001`
3. Try killing process: `pkill -f "go run main.go"`
4. Check logs in `.dev-logs/backend.log`

### ❌ Email not sending
**Solution:**
1. Verify Gmail App Password is correct
2. Check if 2FA is enabled on Gmail
3. Try sending health check to ensure backend responds
4. Check spam folder
5. Look at backend logs for error messages

### ❌ CORS errors in browser console
**Solution:**
1. Ensure `VITE_BACKEND_URL=http://localhost:3001` in `.env.local`
2. Verify backend is running on port 3001
3. Restart both services

### ❌ Port already in use
**Solution:**
```bash
# Find process using port 5173 (frontend)
lsof -i :5173
kill -9 <PID>

# Find process using port 3001 (backend)
lsof -i :3001
kill -9 <PID>
```

---

## 7️⃣ View Logs

**Frontend Logs:**
```bash
tail -f .dev-logs/frontend.log
```

**Backend Logs:**
```bash
tail -f .dev-logs/backend.log
```

**Browser Console:**
- Open DevTools (F12 or Cmd+Option+I)
- Go to Console tab
- Look for errors

---

## 8️⃣ Stop Services

### If using startup script
```bash
# Press Ctrl+C in the startup terminal
```

### If running manually
```bash
# Terminal 1 (Backend): Press Ctrl+C
# Terminal 2 (Frontend): Press Ctrl+C
```

---

## 9️⃣ File Structure

```
juit-robotics-hub/
├── src/                          # React frontend
│   ├── hooks/
│   │   └── useAuth.ts            # ✅ Fixed auth hook
│   ├── pages/
│   │   ├── Admin.tsx             # Admin login
│   │   └── AdminDashboard.tsx    # Dashboard
│   └── ...
├── server/
│   └── mail_service/
│       ├── main.go               # ✅ Go service with CORS
│       ├── Dockerfile            # ✅ Production Docker
│       └── .env                  # Local config (in .gitignore)
├── .env.example                  # ✅ Environment template
├── .env.local                    # Your local config
├── PRODUCTION_SETUP.md           # ✅ Production guide
├── start-dev.sh                  # ✅ Startup script (macOS/Linux)
├── start-dev.bat                 # ✅ Startup script (Windows)
└── package.json
```

---

## 🔟 What Changed (For Your Reference)

### Fixed Issues ✅
1. **useAuth.ts** - Improved async profile sync after login
2. **Go Service** - Added production CORS configuration
3. **Environment** - Centralized env configuration

### New Files Added ✅
- `.env.example` - Environment template
- `Dockerfile` - Production Docker image
- `.dockerignore` - Docker build optimization
- `PRODUCTION_SETUP.md` - Production deployment guide
- `start-dev.sh` - Linux/macOS startup script
- `start-dev.bat` - Windows startup script
- `QUICKSTART_LOCAL.md` - This file!

---

## Next Steps

✅ **Development**: Run locally with startup scripts

🚀 **Production**: Follow [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)

📚 **More Info**:
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Go Docs](https://golang.org/doc/)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)

---

## Questions?

Check the logs first:
```bash
# See all logs
ls -la .dev-logs/
cat .dev-logs/backend.log
cat .dev-logs/frontend.log
```

Then check troubleshooting section above.

Good luck! 🚀
