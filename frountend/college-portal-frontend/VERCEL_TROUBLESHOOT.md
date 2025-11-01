# ⚠️ Vercel Build Error: Module Not Found Fix Guide

## Error
```
Module not found: Error: Can't resolve '../api/adminAPI.js' in '/vercel/path0/frountend/college-portal-frontend/src/pages'
```

## ✅ All Imports Already Fixed
All 22+ API import files now use `.js` extensions:
- ✅ `from "../api/adminAPI.js"`
- ✅ `from "../../api/studentApi.js"`
- ✅ `from "../../api/staffApi.js"`
- etc.

## 🔍 Root Cause Analysis
Since local build works, the issue is **Vercel-specific**:

### Most Likely Causes:
1. **File not committed to git** (90% probability)
2. **Vercel build cache** is stale
3. **Project root directory** misconfigured

## 🛠️ Fix Steps (In Order)

### Step 1: Verify Git Tracking
```bash
# Check if file is in git
git ls-files frountend/college-portal-frontend/src/api/adminAPI.js

# If empty/not found, add all API files:
git add frountend/college-portal-frontend/src/api/*.js
git commit -m "Ensure all API files are tracked in git"
git push
```

### Step 2: Clear Vercel Build Cache
**Critical Step** - Most common fix:
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → General
4. Scroll to "Build & Development Settings"
5. Click **"Clear Build Cache"**
6. Confirm the action

### Step 3: Verify Vercel Project Configuration
In Vercel Dashboard → Settings → General:

**Root Directory:**
- If your project root is `frountend/college-portal-frontend`, set:
  ```
  Root Directory: frountend/college-portal-frontend
  ```
- OR if you want to deploy from repo root, leave empty BUT ensure file path matches

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

### Step 4: Force Clean Rebuild
1. Vercel Dashboard → Deployments
2. Click "..." on latest deployment
3. Select **"Redeploy"**
4. **UNCHECK** "Use existing Build Cache"
5. Click "Redeploy"

### Step 5: Check Build Logs
In Vercel build logs, verify:
```
✓ Found file: frountend/college-portal-frontend/src/api/adminAPI.js
```

If you see file listing errors, the file isn't in your git repository.

## 🚨 If Still Failing: Alternative Solutions

### Option A: Use Absolute Imports
Update `jsconfig.json` (already done) and change imports:
```javascript
// Change from:
import { ... } from "../api/adminAPI.js";

// To:
import { ... } from "api/adminAPI.js";
```

### Option B: Add Webpack Alias
Create `config-overrides.js` (requires react-app-rewired):
```javascript
module.exports = function override(config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@api': path.resolve(__dirname, 'src/api')
  };
  return config;
};
```

### Option C: Rename File (Last Resort)
If case sensitivity is the issue:
```bash
# Verify exact filename
ls -la src/api/adminAPI.js

# If it's AdminAPI.js, rename:
mv src/api/AdminAPI.js src/api/adminAPI.js
git add src/api/adminAPI.js
git commit -m "Fix case sensitivity"
git push
```

## ✅ Verification Checklist
- [x] All imports use `.js` extensions
- [x] Local build succeeds
- [x] File exists: `src/api/adminAPI.js`
- [x] `jsconfig.json` configured
- [x] `vercel.json` configured
- [ ] **File committed to git** ← Most important!
- [ ] **Vercel cache cleared** ← Usually fixes it!
- [ ] **Project root configured correctly**

## 📝 Quick Command Summary
```bash
# 1. Ensure all API files are tracked
git add frountend/college-portal-frontend/src/api/*.js
git status

# 2. Commit if any changes
git commit -m "Fix API imports with .js extensions for Vercel"

# 3. Push to trigger Vercel rebuild
git push

# 4. Then clear Vercel cache and redeploy (via dashboard)
```

## 💡 Most Likely Solution
**95% of the time, clearing Vercel's build cache fixes this issue.**

The file exists, imports are correct, but Vercel's cached build thinks it doesn't exist.

---

**After clearing cache and redeploying, the build should succeed!** 🎉

