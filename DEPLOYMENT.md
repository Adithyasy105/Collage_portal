# 🚀 Quick Deployment Guide

This guide provides step-by-step instructions for deploying the ITI College Portal to free hosting platforms.

---

## 📋 Pre-Deployment Checklist

- [ ] Code committed to GitHub/GitLab
- [ ] Environment variables documented
- [ ] Database backup strategy planned
- [ ] Domain name (optional) ready

---

## 🌐 Option 1: Vercel (Frontend) + Render (Backend) - Recommended

### Frontend: Vercel

**Why Vercel?** - Best for React apps, automatic deployments, excellent CDN, free SSL

#### Steps:

1. **Install Vercel CLI** (optional, can use web interface):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Root Directory**: `frountend/college-portal-frontend`
     - **Framework Preset**: Create React App
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`

4. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add: `REACT_APP_API_URL` = `https://your-backend.onrender.com`

5. **Update Frontend API URLs**:
   - Edit `frountend/college-portal-frontend/src/api/*.js` files
   - Replace `http://localhost:5000` with your Render backend URL

6. **Deploy**: Click "Deploy"

**Frontend URL**: `https://your-project.vercel.app`

---

### Backend: Render

**Why Render?** - Free PostgreSQL, easy deployment, auto-deploy from Git

#### Steps:

1. **Sign Up**: [render.com](https://render.com) → Sign Up with GitHub

2. **Create PostgreSQL Database**:
   - Dashboard → New → PostgreSQL
   - Name: `college-portal-db`
   - Plan: Free (30-day auto-pause after inactivity)
   - Copy the **Internal Database URL**

3. **Create Web Service**:
   - Dashboard → New → Web Service
   - Connect GitHub repository
   - Configure:
     - **Name**: `college-portal-backend`
     - **Root Directory**: `backend`
     - **Environment**: Node
     - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
     - **Start Command**: `npm start`

4. **Environment Variables** (Add all from `.env.example`):
   ```
   DATABASE_URL=postgresql://... (from step 2)
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   FRONTEND_URL=https://your-project.vercel.app
   ```

5. **Deploy**: Render will automatically deploy

6. **Run Migrations** (First time):
   - After first deployment, go to Shell
   - Run: `npx prisma migrate deploy`

**Backend URL**: `https://your-backend.onrender.com`

---

## 🚂 Option 2: Railway (All-in-One)

**Why Railway?** - Simple, includes PostgreSQL, good for beginners

### Steps:

1. **Sign Up**: [railway.app](https://railway.app) → Sign Up with GitHub

2. **Deploy Backend**:
   - New Project → Deploy from GitHub
   - Select repository → Add Service → GitHub Repo
   - Select `backend` folder
   - Railway auto-detects Node.js

3. **Add PostgreSQL**:
   - New → Database → PostgreSQL
   - Railway automatically creates and provides `DATABASE_URL`

4. **Environment Variables**:
   - Service Settings → Variables
   - Add all required variables
   - `DATABASE_URL` is auto-added by Railway

5. **Deploy Frontend**:
   - New Service → Static Web Site
   - Connect GitHub → Select repository
   - Root Directory: `frountend/college-portal-frontend`
   - Build Command: `npm install && npm run build`
   - Output Directory: `build`
   - Add environment variable: `REACT_APP_API_URL`

**Note**: Railway free tier includes $5 credit/month

---

## 🌊 Option 3: Netlify (Frontend) + Fly.io (Backend)

### Frontend: Netlify

1. Go to [netlify.com](https://netlify.com)
2. New site from Git → Connect repository
3. Build settings:
   - Base directory: `frountend/college-portal-frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `build`
4. Add environment variable: `REACT_APP_API_URL`

### Backend: Fly.io

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**:
   ```bash
   fly auth login
   ```

3. **Initialize**:
   ```bash
   cd backend
   fly launch
   ```

4. **Deploy**:
   ```bash
   fly deploy
   ```

5. **Add PostgreSQL**:
   ```bash
   fly postgres create
   fly postgres attach -a <app-name>
   ```

---

## 💾 Free PostgreSQL Options

### 1. Supabase (Recommended)
- **URL**: [supabase.com](https://supabase.com)
- **Free Tier**: 500MB database, 500MB storage
- **Pros**: Fast, includes storage, excellent dashboard
- **Steps**:
  1. Create account → New project
  2. Go to Settings → Database
  3. Copy Connection String
  4. Use as `DATABASE_URL`

### 2. Neon
- **URL**: [neon.tech](https://neon.tech)
- **Free Tier**: 3GB storage, serverless PostgreSQL
- **Pros**: Serverless, auto-scaling, modern
- **Steps**: Similar to Supabase

### 3. Render PostgreSQL
- Included with Render account
- Free tier: Auto-pauses after 30 days inactivity
- Good for: Combined with Render backend deployment

---

## 🔧 Post-Deployment Steps

### 1. Update API URLs in Frontend

Replace all instances of `http://localhost:5000` in:
- `frountend/college-portal-frontend/src/api/*.js`

With your production backend URL:
- `https://your-backend.onrender.com`

### 2. Run Database Migrations

```bash
# On Render: Use Shell feature
npx prisma migrate deploy

# On Railway: Use Deploy logs or connect via SSH
npx prisma migrate deploy
```

### 3. Create Supabase Storage Buckets

1. Go to Supabase Dashboard → Storage
2. Create buckets:
   - `student-photos`
   - `staff-photos`
   - `leave-letters`
   - `documents`

3. Set bucket policies (Public or Private as needed)

### 4. Configure CORS

Ensure `FRONTEND_URL` in backend environment variables matches your frontend URL.

### 5. Test Deployment

- [ ] Frontend loads correctly
- [ ] Login works
- [ ] API calls succeed
- [ ] File uploads work
- [ ] Database queries work
- [ ] Email sending works (if configured)

---

## 🔐 Environment Variables Summary

### Backend (Production)

```env
DATABASE_URL=postgresql://...        # From your database provider
JWT_SECRET=your-secret-key           # Generate secure random string
NODE_ENV=production
PORT=5000                            # Usually auto-set by hosting
SUPABASE_URL=https://...             # Your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=...        # Supabase service role key
FRONTEND_URL=https://your-app.vercel.app  # Your frontend URL
EMAIL_HOST=smtp.gmail.com            # Optional
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...
```

### Frontend (Production)

```env
REACT_APP_API_URL=https://your-backend.onrender.com
```

---

## 📊 Monitoring & Maintenance

### Health Checks

- Backend: `https://your-backend.onrender.com/` (should return `{status: "ok"}`)
- Frontend: Check Vercel/Railway dashboard for build status

### Logs

- **Render**: Dashboard → Service → Logs
- **Railway**: Dashboard → Deployments → View logs
- **Vercel**: Dashboard → Project → Deployments → View logs

### Database Backups

- **Supabase**: Automatic daily backups
- **Neon**: Automatic backups
- **Render**: Manual backups recommended
- **Manual**: Use `pg_dump` command

---

## 🐛 Troubleshooting Deployment

### Build Fails

1. Check build logs in hosting dashboard
2. Verify Node.js version (>= 18.0.0)
3. Check for missing dependencies
4. Verify environment variables

### Database Connection Errors

1. Verify `DATABASE_URL` is correct
2. Check if database is paused (Render free tier)
3. Verify IP whitelisting (some providers require it)
4. Run migrations: `npx prisma migrate deploy`

### CORS Errors

1. Update `FRONTEND_URL` in backend env vars
2. Clear browser cache
3. Check network tab in browser DevTools

### File Upload Fails

1. Verify Supabase credentials
2. Check bucket exists and is configured
3. Verify file size limits
4. Check CORS settings in Supabase

---

## 💡 Cost Optimization Tips

1. **Use Free Tiers Wisely**:
   - Render free tier auto-pauses after inactivity (30 days)
   - Keep services active with monitoring
   - Use Supabase for database (generous free tier)

2. **Optimize Builds**:
   - Use `.npmrc` to cache dependencies
   - Optimize images before upload
   - Use CDN for static assets

3. **Database**:
   - Regular cleanup of old data
   - Archive historical records
   - Use Supabase (best free tier)

4. **Monitoring**:
   - Set up uptime monitoring (free: UptimeRobot)
   - Monitor API usage
   - Set up alerts

---

## 📞 Support

If you encounter issues:

1. Check hosting provider documentation
2. Review deployment logs
3. Check GitHub issues
4. Contact hosting provider support

---

**Happy Deploying! 🚀**

