# Vercel Deployment Fix for adminAPI.js Module Not Found

## Problem
Vercel build fails with: `Module not found: Error: Can't resolve '../api/adminAPI.js'`

## Root Cause
On Linux (Vercel's build environment), file system is case-sensitive. The module resolution might fail if:
1. File is not committed to git
2. Case mismatch between import and actual filename
3. Build cache issues

## Solution Steps

### Step 1: Verify File is Committed to Git
```bash
# Check if file is tracked
git ls-files | grep adminAPI.js

# If not found, add and commit:
git add frountend/college-portal-frontend/src/api/adminAPI.js
git commit -m "Add adminAPI.js to git tracking"
git push
```

### Step 2: Verify Exact File Name Match
The file MUST be exactly: `adminAPI.js` (not `AdminAPI.js` or `adminApi.js`)
The import MUST be exactly: `from "../api/adminAPI.js"`

### Step 3: Clear Vercel Build Cache
1. Go to Vercel Dashboard → Your Project
2. Settings → General → Scroll to "Clear Build Cache"
3. Click "Clear"
4. Redeploy

### Step 4: Force Rebuild Without Cache
1. Vercel Dashboard → Deployments
2. Click "..." on latest deployment
3. Select "Redeploy"
4. Uncheck "Use existing Build Cache"
5. Click "Redeploy"

### Step 5: Verify Project Settings
In Vercel Dashboard → Settings → General:
- **Root Directory**: `frountend/college-portal-frontend` (or leave empty if root is correct)
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### Step 6: Check Build Logs
If still failing, check Vercel build logs for:
- File listing showing `adminAPI.js` exists
- Any case sensitivity warnings
- Module resolution errors

## Alternative: Use Absolute Imports
If relative imports continue to fail, update `jsconfig.json` and use absolute imports:

```javascript
// In AdminDashboard.js
import { ... } from "api/adminAPI.js";  // Instead of "../api/adminAPI.js"
```

This requires `jsconfig.json` with `baseUrl: "src"` (already configured).

## Verification Checklist
- [ ] File `src/api/adminAPI.js` exists
- [ ] File is committed to git
- [ ] Import path: `from "../api/adminAPI.js"` (exact match)
- [ ] Vercel build cache cleared
- [ ] Project root directory configured correctly
- [ ] Build logs checked for errors

## Current Status
✅ Local build: SUCCESS
✅ All imports updated with .js extensions
✅ File exists: `src/api/adminAPI.js`
✅ jsconfig.json configured
✅ vercel.json configured

If the issue persists after following these steps, the problem is likely:
1. File not in git repository
2. Vercel build cache needs clearing
3. Project root directory misconfiguration in Vercel

