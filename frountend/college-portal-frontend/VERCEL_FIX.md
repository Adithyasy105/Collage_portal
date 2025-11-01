# Vercel Deployment Fix Guide

## Issue
Module not found: Error: Can't resolve '../api/adminAPI' on Vercel

## Solutions Applied

### 1. Created jsconfig.json
Added `jsconfig.json` to improve module resolution:
- Sets `baseUrl` to `src` for absolute imports
- Configures proper module resolution

### 2. Created vercel.json
Added Vercel-specific configuration for Create React App

### 3. Verified File Structure
- ✅ File exists at: `src/api/adminAPI.js`
- ✅ All exports are correct
- ✅ Imports use relative paths: `from "../api/adminAPI"`

## If Issue Persists on Vercel

### Option 1: Clear Vercel Build Cache
1. Go to Vercel Dashboard → Project → Settings → General
2. Scroll to "Clear Build Cache"
3. Click "Clear"
4. Redeploy

### Option 2: Verify Git Tracking
Ensure `src/api/adminAPI.js` is committed to git:
```bash
git add src/api/adminAPI.js
git commit -m "Add adminAPI.js"
git push
```

### Option 3: Check File Case Sensitivity
Vercel uses Linux (case-sensitive). Verify:
- File name: `adminAPI.js` (not `adminApi.js` or `AdminAPI.js`)
- Import path matches exactly: `../api/adminAPI`

### Option 4: Force Rebuild
In Vercel Dashboard:
1. Go to Deployments
2. Click "..." on latest deployment
3. Select "Redeploy"
4. Check "Use existing Build Cache" = OFF

### Option 5: Use Absolute Imports (Alternative)
If relative imports continue to fail, update imports to use absolute paths:
```javascript
// Change from:
import { ... } from "../api/adminAPI";

// To:
import { ... } from "api/adminAPI";
```
(Requires jsconfig.json which is already added)

## Current Status
✅ Local build: SUCCESS
✅ File exists and has correct exports
✅ jsconfig.json configured
✅ vercel.json configured

The build should work on Vercel. If it doesn't, try the troubleshooting steps above.

