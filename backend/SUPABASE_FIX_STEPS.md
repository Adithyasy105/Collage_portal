# 🔧 Supabase Connection Fix - Step by Step

## Current Error
```
Can't reach database server at `db.ojlnokrkvdwboysfsiei.supabase.co:5432`
```

This means Prisma can't connect to Supabase. The most common cause is a **paused database**.

## ✅ Step-by-Step Fix

### Step 1: Wake Up Supabase Database (CRITICAL)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Sign in** to your account
3. **Select your project** (the one with `ojlnokrkvdwboysfsiei`)
4. **Check the status**:
   - If you see **"Paused"** or **"Inactive"** → Click **"Resume"** or **"Restore"**
   - If it shows **"Active"** → Skip to Step 2
5. **Wait 1-2 minutes** for the database to fully start
6. **Verify it's running**: You should see "Active" status

### Step 2: Get Connection Pooling String (RECOMMENDED)

Instead of direct connection (port 5432), use Connection Pooling (port 6543) for better reliability:

1. **In Supabase Dashboard** → Your Project
2. Go to **Settings** → **Database**
3. Scroll to **Connection Pooling** section
4. Find **Connection String** (Transaction Mode)
5. **Copy the connection string** - it should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.ojlnokrkvdwboysfsiei.supabase.co:6543/postgres?pgbouncer=true
   ```
6. **Important**: It will use port **6543**, not 5432

### Step 3: Update DATABASE_URL in Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your backend service**
3. Click **Environment** tab
4. Find the `DATABASE_URL` variable
5. **Update it** with one of these:

   **Option A: Connection Pooling (RECOMMENDED)**
   ```
   postgresql://postgres:Geethavb9008@db.ojlnokrkvdwboysfsiei.supabase.co:6543/postgres?pgbouncer=true&sslmode=require
   ```
   (Change password if you've updated it)

   **Option B: Direct Connection (Current - if database is active)**
   ```
   postgresql://postgres:Geethavb9008@db.ojlnokrkvdwboysfsiei.supabase.co:5432/postgres?sslmode=require
   ```

6. **Click "Save Changes"**
7. **Render will automatically redeploy**

### Step 4: Wait for Deployment

1. **Go to Render Dashboard** → **Events** tab
2. **Watch the deployment** progress
3. **Wait for "Live" status** (usually 2-5 minutes)
4. **Check logs** for errors

### Step 5: Verify Connection

After deployment completes, check:

1. **Render Logs**:
   - Should see: `Server running on port 10000`
   - No connection errors

2. **Test Health Endpoint**:
   ```bash
   curl https://collage-portal-r5j6.onrender.com/
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

3. **Test Login Endpoint**:
   ```bash
   curl -X POST https://collage-portal-r5j6.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test"}'
   ```
   Should return `200` or `401` (not `500`)

## 🔍 Troubleshooting

### If Still Getting Connection Errors:

1. **Verify Supabase Database is Active**:
   - Dashboard should show "Active" (not "Paused")
   - If paused, click "Resume" and wait 2 minutes

2. **Check Password**:
   - Ensure password in `DATABASE_URL` matches Supabase
   - URL-encode special characters if needed (`@` → `%40`)

3. **Try Connection Pooling Port (6543)**:
   - More reliable than direct connection (5432)
   - Handles connection limits better

4. **Check Supabase Project Settings**:
   - Go to Settings → Database
   - Ensure "Database" is enabled
   - Check if IP restrictions are blocking Render

5. **Verify DATABASE_URL Format**:
   - Must start with `postgresql://`
   - No extra spaces or characters
   - Password properly encoded

### If Database Keeps Pausing:

Supabase free tier pauses after **7 days of inactivity**. Solutions:

1. **Use Connection Pooling** (port 6543) - more reliable
2. **Upgrade to Pro** - no pausing
3. **Use Render PostgreSQL** - doesn't pause

## 🎯 Quick Action Items

**Right Now:**
1. ✅ Go to Supabase Dashboard
2. ✅ Resume/Activate your database if paused
3. ✅ Get Connection Pooling string (port 6543)
4. ✅ Update DATABASE_URL in Render
5. ✅ Wait for redeployment
6. ✅ Test endpoints

**The connection string format is correct - you just need to:**
- **Wake up the Supabase database** (most likely issue)
- **Use Connection Pooling** for better reliability

---

**Most likely: Your Supabase database is paused. Resume it first!** 🚀

