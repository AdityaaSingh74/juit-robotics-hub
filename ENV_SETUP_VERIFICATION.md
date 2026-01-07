# Environment Variable Setup Verification

## 🔴 Issue: 400 Bad Request - No API Key Found

This error occurs when Supabase environment variables are not properly configured in Vercel.

## ✅ Quick Fix Steps:

### 1. **Check Your Vercel Environment Variables**

Go to: `Vercel Dashboard → Project Settings → Environment Variables`

Verify these variables are present:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_USE_MOCK=false
```

### 2. **Verify Supabase Credentials**

From Supabase Dashboard:
1. Go to `Settings → API`
2. Copy the **Project URL** → Set as `VITE_SUPABASE_URL`
3. Copy the **anon public** key → Set as `VITE_SUPABASE_ANON_KEY`

### 3. **After Updating Environment Variables**

⚠️ **IMPORTANT**: You must redeploy after updating env vars!

```bash
# In Vercel Dashboard:
1. Go to Deployments
2. Select the latest deployment
3. Click "Redeploy"
# OR
4. Push a new commit to main branch
```

### 4. **Local Development Check**

Create `.env.local` in project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_USE_MOCK=false
```

Run locally:
```bash
npm run dev
```

## 🔍 Troubleshooting

### Problem: Still getting 400 error after fix

**Check:**
```bash
1. Browser DevTools → Network tab
2. Look for failed requests to `https://your-supabase-url`
3. Check response details for exact error
4. Verify URL doesn't have trailing slash: 
   ❌ https://project.supabase.co/
   ✅ https://project.supabase.co
```

### Problem: Data saves but doesn't show in admin panel

**Cause:** Supabase RLS (Row Level Security) policies might be blocking reads

**Fix:**
1. Go to Supabase Dashboard → Authentication → Policies
2. Ensure policies allow admin role to read/write all projects
3. Or disable RLS for testing: `ALTER TABLE projects DISABLE ROW LEVEL SECURITY;`

### Problem: Admin panel shows "Missing Supabase configuration"

**This means:**
- Either `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is empty
- Check Vercel env vars again
- Make sure env var names match EXACTLY (case-sensitive)

## ✨ What Was Fixed

**Previous Issue:**
```javascript
// ❌ WRONG - This caused 400 errors
global: {
  headers: {
    'apikey': supabaseAnonKey, // Redundant - Supabase doesn't need this
  },
}
```

**Solution:**
```javascript
// ✅ CORRECT - Let Supabase handle auth internally
// No need for manual headers - removed completely
```

## 📋 Checklist

- [ ] Supabase URL set in Vercel env vars
- [ ] Anon key set in Vercel env vars
- [ ] Redeployed after env var changes
- [ ] Checking browser Network tab for actual errors
- [ ] Database tables exist in Supabase
- [ ] RLS policies allow admin access (if enabled)
- [ ] Local `.env.local` has correct credentials for testing

## 🚀 Expected Result

After fixing:
- ✅ Admin dashboard loads without errors
- ✅ Projects display from database
- ✅ Can create/update/delete projects
- ✅ No 400 errors in console

## 📞 Still Not Working?

1. Check Supabase status: https://status.supabase.com
2. Verify database tables exist with correct schema
3. Check Vercel deployment logs: `Vercel Dashboard → Deployments → Logs`
4. Test with mock mode: Set `VITE_USE_MOCK=true` to verify UI works
