# Production Setup Guide - JUIT Robotics Hub

## Overview

This guide covers deploying both frontend (Vercel) and backend (Go service) for production.

### Architecture
- **Frontend**: React + Vite → Vercel ✅ (Already done)
- **Backend**: Go Mail Service → Railway/Render
- **Database**: Supabase (PostgreSQL)

---

## Part 1: Local Development (Testing Both Services)

### Prerequisites
```bash
# Check Go installation
go version  # Should be 1.21+

# Check Node version
node --version  # Should be 18+

# Check npm
npm --version
```

### Setup Steps

#### 1. Clone and Navigate
```bash
git clone https://github.com/AdityaaSingh74/juit-robotics-hub.git
cd juit-robotics-hub
```

#### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Copy .env.example to .env.local and fill in values
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_ANON_KEY=your_key
# VITE_BACKEND_URL=http://localhost:3001
```

#### 3. Backend (Go Service) Setup
```bash
# Navigate to Go service
cd server/mail_service

# Create .env file
cp .env.example .env  # Or manually create it

# Add these to .env:
# EMAIL=your-gmail@gmail.com
# PASSWORD=your-app-specific-password
# PORT=3001

# Download Go dependencies
go mod download

# Run the service
go run main.go

# Output should show:
# Go email service starting on port 3001...
# Endpoints:
#   POST /api/send-email
#   GET  /health
```

#### 4. Start Frontend (in another terminal)
```bash
# From root directory
npm run dev

# Runs on http://localhost:5173
```

#### 5. Test Login Flow
1. Go to http://localhost:5173/admin
2. Enter your Supabase user credentials
3. Should successfully log in and redirect to dashboard

---

## Part 2: Production Deployment

### Backend Deployment to Railway

#### Step 1: Prepare Repository
```bash
# Make sure all changes are committed
git add .
git commit -m "Production: Add Docker and environment configs"
git push origin main
```

#### Step 2: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "Create New Project"
3. Select "Deploy from GitHub"
4. Select your `juit-robotics-hub` repository
5. Railway auto-detects the Go service from `server/mail_service`

#### Step 3: Configure Environment Variables in Railway

In Railway dashboard → Variables:

```
EMAIL=your-gmail@gmail.com
PASSWORD=your-app-specific-password
PORT=3001
```

**Getting Gmail App Password:**
1. Enable 2FA on Google Account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows"
4. Copy the 16-character password

#### Step 4: Deploy
- Click "Deploy"
- Wait for build to complete
- Get your service URL (e.g., `https://juit-robotics-hub-production.railway.app`)

### Frontend Deployment to Vercel

#### Step 1: Add Backend URL to Vercel

In Vercel → Project Settings → Environment Variables:

```
VITE_BACKEND_URL=https://juit-robotics-hub-production.railway.app
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_USE_MOCK=false
```

#### Step 2: Deploy
- Vercel auto-deploys on push to main
- Or manually trigger deployment from Vercel dashboard

---

## Part 3: Integration & Testing

### Test Email Sending

1. **From Admin Dashboard:**
   - Approve/Reject a project submission
   - Check if email is sent successfully
   - Verify email appears in inbox

2. **Direct API Test:**
   ```bash
   curl -X POST https://your-backend-url/api/send-email \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "name": "Test User",
       "emailType": "submission",
       "projectName": "Test Project"
     }'
   ```

3. **Health Check:**
   ```bash
   curl https://your-backend-url/health
   # Should return: {"status": "ok"}
   ```

### Verify CORS Configuration

- Frontend requests should work from Vercel domain
- Check browser console for CORS errors
- Go service allows all origins (currently)

---

## Part 4: File Structure

```
juit-robotics-hub/
├── .env.example                    # Environment template
├── src/
│   ├── hooks/
│   │   └── useAuth.ts             # Fixed auth hook
│   ├── pages/
│   │   └── Admin.tsx              # Login page
│   └── ...
├── server/
│   └── mail_service/
│       ├── Dockerfile             # Production Docker build
│       ├── .dockerignore          # Docker ignore patterns
│       ├── main.go                # Go service
│       └── .env                   # Local env (not in git)
└── package.json
```

---

## Part 5: Environment Variables Summary

### Frontend (.env.local for development / Vercel for production)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_USE_MOCK=false
VITE_BACKEND_URL=http://localhost:3001        # Local dev
# or
VITE_BACKEND_URL=https://your-railway-url    # Production
```

### Backend (server/mail_service/.env for local / Railway for production)
```
EMAIL=your-gmail@gmail.com
PASSWORD=your-app-specific-password
PORT=3001
```

---

## Part 6: Troubleshooting

### Frontend Login Not Working
1. Check Supabase credentials in .env
2. Verify Supabase project is accessible
3. Check browser console for errors
4. Ensure `useAuth.ts` is properly updated

### Email Not Sending
1. Verify Gmail credentials in Railway variables
2. Check Gmail allows "Less secure app access" OR use App Password
3. Check Railway logs for errors
4. Verify CORS is not blocking requests

### Connection Issues
1. Ensure backend URL in frontend .env is correct
2. Check if backend service is running
3. Test health endpoint: `GET /health`
4. Check network tab in browser dev tools

---

## Part 7: Monitoring & Logs

### Railway Logs
```bash
# Via CLI
railway logs

# Or in web dashboard: Deployments → View Logs
```

### Vercel Logs
- Dashboard → Deployments → Logs
- Real-time logs for production issues

### Local Development
```bash
# Frontend
npm run dev
# Check terminal for Vite output

# Backend
go run main.go
# Check terminal for Go service output
```

---

## Part 8: Quick Commands Reference

```bash
# Local Development
cd server/mail_service && go run main.go  # Terminal 1
npm run dev                                # Terminal 2

# Build for Production
npm run build

# Test Production Build Locally
npm run preview

# Go Service Production Build
cd server/mail_service
go build -o mail-service
./mail-service  # Run locally

# Docker Test (if Docker installed)
cd server/mail_service
docker build -t mail-service .
docker run -e EMAIL=test@gmail.com -e PASSWORD=test -p 3001:3001 mail-service
```

---

## Deployment Checklist

- [ ] Fixed `useAuth.ts` hook
- [ ] Created `.env.example` template
- [ ] Created `Dockerfile` for Go service
- [ ] Created `.dockerignore` for Go service
- [ ] Committed all changes to GitHub
- [ ] Created Railway project
- [ ] Added environment variables to Railway
- [ ] Verified backend deployment works (health check)
- [ ] Added backend URL to Vercel
- [ ] Verified frontend can reach backend
- [ ] Tested login flow end-to-end
- [ ] Tested email sending
- [ ] Monitored logs for errors
- [ ] Documented credentials in secure place

---

## Next Steps

1. **Local Testing First** - Ensure both services work together locally
2. **Deploy Backend** - Get Railway running before frontend
3. **Update Frontend** - Add backend URL to Vercel
4. **End-to-End Testing** - Test complete flows
5. **Monitor & Debug** - Watch logs during first production usage

---

## Support

For issues or questions, check:
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Go Documentation](https://golang.org/doc/)
