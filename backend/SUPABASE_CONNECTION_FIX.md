# 🔧 Supabase Database Connection Fix

## Current Issue
```
Can't reach database server at `db.ojlnokrkvdwboysfsiei.supabase.co:5432`
```

This indicates your `DATABASE_URL` is pointing to a Supabase database, but the connection is failing.

## Possible Causes

### 1. Supabase Database is Paused (Most Likely)
Supabase free tier databases pause after **7 days of inactivity**. You need to wake it up.

**Solution:**
1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. If you see a "Paused" or "Inactive" status, click **"Resume"** or **"Restore"**
4. Wait 1-2 minutes for the database to start
5. Test the connection again

### 2. Wrong Connection String
The `DATABASE_URL` might be using the wrong format or credentials.

**Verify Connection String:**
1. Go to **Supabase Dashboard** → Your Project
2. Go to **Settings** → **Database**
3. Find **Connection String** (or **Connection Pooling**)
4. Copy the **Direct Connection** string (not pooling)
5. It should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### 3. Use Connection Pooling (Recommended for Production)
For better performance and reliability, use **Connection Pooling**:

1. Go to **Supabase Dashboard** → **Settings** → **Database**
2. Find **Connection Pooling**
3. Copy the **Transaction Mode** connection string
4. It will use port **6543** instead of **5432**
5. Format: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true`

### 4. Password/Connection Issues
- Ensure password is correct
- Check if IP restrictions are enabled (disable for Render)
- Verify the database name is correct

## ✅ Step-by-Step Fix

### Option A: Use Supabase (Wake Up Database)

1. **Wake Up Supabase Database**:
   - Go to https://supabase.com/dashboard
   - Select your project
   - If paused, click **"Resume"** or **"Restore"**

2. **Get Correct Connection String**:
   - **Settings** → **Database** → **Connection string**
   - Use **Direct connection** or **Transaction pooling** (port 6543)

3. **Update DATABASE_URL in Render**:
   - Render Dashboard → Your Service → **Environment**
   - Update `DATABASE_URL` with the correct connection string
   - Make sure password is correct (use `%` instead of special characters if needed)

4. **Redeploy**:
   - Save environment variable
   - Render will auto-redeploy

### Option B: Use Render PostgreSQL (Recommended)

If Supabase continues to pause or cause issues, consider using Render's PostgreSQL:

1. **Create Render PostgreSQL**:
   - Render Dashboard → **New** → **PostgreSQL**
   - Choose a name and region
   - Click **Create Database**

2. **Get Connection String**:
   - Click on your database
   - Copy **Internal Database URL** (for same service) or **External Connection String**

3. **Update DATABASE_URL**:
   - Go to your backend service → **Environment**
   - Update `DATABASE_URL` with Render PostgreSQL connection string

4. **Run Migrations**:
   - After deployment, migrations should run automatically
   - Or manually: `npx prisma migrate deploy`

5. **Redeploy**:
   - Save environment variable
   - Render will redeploy

## 🔍 Verify Connection

After updating DATABASE_URL, test the connection:

1. **Check Render Logs**:
   - Should see: `Server running on port 10000` (no errors)

2. **Test Health Endpoint**:
   ```bash
   curl https://collage-portal-r5j6.onrender.com/
   ```
   Should return: `{"status":"ok",...}`

3. **Test Contact Endpoint**:
   ```bash
   curl -X POST https://collage-portal-r5j6.onrender.com/api/contacts \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","message":"Test"}'
   ```
   Should return `201` (not `500`)

## 🎯 Quick Fix Checklist

**If Using Supabase:**
- [ ] Database is unpaused/resumed in Supabase Dashboard
- [ ] DATABASE_URL uses correct connection string from Supabase
- [ ] Password is correct (URL-encoded if needed)
- [ ] Using Transaction Pooling port (6543) if possible
- [ ] No IP restrictions blocking Render

**If Using Render PostgreSQL:**
- [ ] Render PostgreSQL database created
- [ ] DATABASE_URL updated with Render connection string
- [ ] Migrations run successfully
- [ ] Connection tested and working

## ⚠️ Important Notes

- **Supabase Free Tier**: Databases pause after 7 days of inactivity
- **Connection Pooling**: Use port **6543** with `pgbouncer=true` for better reliability
- **Render PostgreSQL**: More reliable for production, doesn't pause
- **Password Encoding**: Special characters in passwords need URL encoding (`@` → `%40`, etc.)

---

**Most likely solution: Resume your Supabase database and use Connection Pooling (port 6543)!**

