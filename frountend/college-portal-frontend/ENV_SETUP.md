# 🔧 Environment Variable Setup

## For Vercel Deployment (Frontend)

### Add Environment Variable:

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://collage-portal-r5j6.onrender.com`
   - **Environment**: Select **Production**, **Preview**, and **Development**
5. Click **Save**
6. **Redeploy** your application (or wait for next deployment)

### Verify:
After deployment, your frontend will use:
- **Development**: `http://localhost:5000` (if env var not set)
- **Production**: `https://collage-portal-r5j6.onrender.com` (from env var)

---

## For Render Deployment (Backend)

### Add Environment Variable:

1. Go to **Render Dashboard** → Your Service
2. Click **Environment**
3. Scroll to **Environment Variables**
4. Add new variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://collage-portal-h9kw84t0h-adithyasy105s-projects.vercel.app`
5. Click **Save Changes**
6. Render will automatically redeploy

### Verify:
After deployment, your backend CORS will allow:
- `http://localhost:3000` (local development)
- `https://collage-portal-h9kw84t0h-adithyasy105s-projects.vercel.app` (Vercel production)
- Any URL from `FRONTEND_URL` environment variable

---

## Summary

✅ **Frontend (Vercel)**: Set `REACT_APP_API_URL=https://collage-portal-r5j6.onrender.com`
✅ **Backend (Render)**: Set `FRONTEND_URL=https://collage-portal-h9kw84t0h-adithyasy105s-projects.vercel.app`

After setting these, both services will communicate correctly! 🎉

