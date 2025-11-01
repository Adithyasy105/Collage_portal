# 🚀 Production Configuration Guide

## Overview
Your application is deployed on:
- **Frontend**: https://collage-portal-h9kw84t0h-adithyasy105s-projects.vercel.app
- **Backend**: https://collage-portal-r5j6.onrender.com

## ✅ Changes Made

### 1. Backend CORS Configuration
Updated `backend/server.js` to allow requests from:
- ✅ `http://localhost:3000` (local development)
- ✅ `https://collage-portal-h9kw84t0h-adithyasy105s-projects.vercel.app` (Vercel production)
- ✅ `process.env.FRONTEND_URL` (environment variable override)

### 2. Frontend API Configuration
- ✅ Created `src/config/api.js` - Centralized API URL configuration
- ✅ Updated all API files to use environment variable
- ✅ Defaults to `http://localhost:5000` for development
- ✅ Uses `REACT_APP_API_URL` environment variable for production

## 🔧 Setup Instructions

### Step 1: Configure Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://collage-portal-r5j6.onrender.com`
   - **Environment**: Production, Preview, Development (all)
4. Click **Save**

### Step 2: Update Backend Environment Variables (Render)

1. Go to **Render Dashboard** → Your Service
2. Click **Environment**
3. Add/Update:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://collage-portal-h9kw84t0h-adithyasy105s-projects.vercel.app`
4. Click **Save Changes**
5. **Redeploy** your backend service

### Step 3: Redeploy

#### Vercel (Frontend):
After setting the environment variable:
1. Go to **Deployments**
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. This will rebuild with the new API URL

#### Render (Backend):
After setting environment variables:
1. Go to **Manual Deploy** → **Deploy latest commit**
2. OR just save the environment variable (auto-redeploys)

## ✅ Verification

### Check CORS in Backend:
```bash
# Check server.js has correct CORS configuration
cat backend/server.js | grep -A 5 "corsOptions"
```

Should show:
```javascript
origin: [
  "http://localhost:3000",
  "https://collage-portal-h9kw84t0h-adithyasy105s-projects.vercel.app",
  process.env.FRONTEND_URL
]
```

### Check Frontend API Configuration:
```bash
# Check config file exists
cat frountend/college-portal-frontend/src/config/api.js

# Check API files use the config
grep -r "API_URLS\|config/api" frountend/college-portal-frontend/src/api/
```

### Test in Browser:
1. Open https://collage-portal-h9kw84t0h-adithyasy105s-projects.vercel.app
2. Open Browser DevTools → Network tab
3. Try logging in
4. Check API requests go to: `https://collage-portal-r5j6.onrender.com/api/...`

## 🐛 Troubleshooting

### CORS Errors Still Occurring?

1. **Check Backend Logs** (Render Dashboard):
   - Look for CORS errors
   - Verify FRONTEND_URL is set correctly

2. **Verify Vercel Environment Variable**:
   - Settings → Environment Variables
   - Ensure `REACT_APP_API_URL` is set
   - Must restart deployment after adding

3. **Check Browser Console**:
   - Look for CORS errors
   - Verify API requests use correct URL

### API Requests Going to Wrong URL?

1. **Check Build Logs** in Vercel:
   - Should show `REACT_APP_API_URL` being used

2. **Verify Environment Variable**:
   - Must be prefixed with `REACT_APP_`
   - Must be set before build

3. **Clear Browser Cache**:
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## 📝 Summary

**Backend Changes:**
- ✅ CORS allows Vercel frontend
- ✅ Uses environment variable for flexibility

**Frontend Changes:**
- ✅ All API calls use centralized config
- ✅ Respects `REACT_APP_API_URL` environment variable
- ✅ Defaults to localhost for local development

**Next Steps:**
1. Set `REACT_APP_API_URL` in Vercel
2. Set `FRONTEND_URL` in Render
3. Redeploy both services
4. Test the application

---

**After configuration, your production app should work correctly!** 🎉

