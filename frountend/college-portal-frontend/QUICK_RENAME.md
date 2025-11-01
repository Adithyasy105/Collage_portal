# 🚀 Quick Guide: Rename API Files from .JS to .js

## Current Situation
- ✅ Files on disk are already lowercase (`.js`)
- ❌ Git repository still has uppercase (`.JS`)
- ⚠️ Windows filesystem is case-insensitive, so Git doesn't detect the change

## ✅ Solution: Use Git MV Command

### Option 1: Quick Rename Script (Easiest)

```powershell
# Run the PowerShell script
cd C:\Users\geeth\Downloads\collage_potal\frountend\college-portal-frontend
.\rename-api-files.ps1
```

### Option 2: Manual Git Commands

**Navigate to API directory:**
```bash
cd C:\Users\geeth\Downloads\collage_potal\frountend\college-portal-frontend\src\api
```

**For each file, use two-step rename:**
```bash
# Step 1: Rename to temp (forces Git to see it as different)
git mv adminAPI.JS adminAPI_temp

# Step 2: Rename to lowercase
git mv adminAPI_temp adminAPI.js
```

**Repeat for all files:**
```bash
git mv admissionAPI.JS admissionAPI_temp
git mv admissionAPI_temp admissionAPI.js

git mv authApi.JS authApi_temp
git mv authApi_temp authApi.js

git mv contactAPI.JS contactAPI_temp
git mv contactAPI_temp contactAPI.js

git mv leaveApi.JS leaveApi_temp
git mv leaveApi_temp leaveApi.js

git mv staffApi.JS staffApi_temp
git mv staffApi_temp staffApi.js

git mv studentApi.JS studentApi_temp
git mv studentApi_temp studentApi.js
```

**Commit and push:**
```bash
# Go back to project root
cd C:\Users\geeth\Downloads\collage_potal

# Check status
git status

# Commit
git commit -m "Rename all API files from .JS to .js extensions"

# Push
git push
```

### Option 3: If Git MV Doesn't Work

**Remove from Git index, then re-add:**
```bash
cd C:\Users\geeth\Downloads\collage_potal\frountend\college-portal-frontend\src\api

# Remove from Git (but keep local files)
git rm --cached adminAPI.JS
git rm --cached admissionAPI.JS
git rm --cached authApi.JS
git rm --cached contactAPI.JS
git rm --cached leaveApi.JS
git rm --cached staffApi.JS
git rm --cached studentApi.JS

# Commit removal
cd C:\Users\geeth\Downloads\collage_potal
git commit -m "Remove API files with uppercase extensions"

# Re-add with lowercase (Windows will use existing lowercase files)
git add frountend/college-portal-frontend/src/api/adminAPI.js
git add frountend/college-portal-frontend/src/api/admissionAPI.js
git add frountend/college-portal-frontend/src/api/authApi.js
git add frountend/college-portal-frontend/src/api/contactAPI.js
git add frountend/college-portal-frontend/src/api/leaveApi.js
git add frountend/college-portal-frontend/src/api/staffApi.js
git add frountend/college-portal-frontend/src/api/studentApi.js

# Commit
git commit -m "Add API files with lowercase .js extensions"

# Push
git push
```

## ✅ Verify After Rename

```bash
# Check Git shows lowercase
git ls-files | findstr "adminAPI.js"

# Should show: frountend/college-portal-frontend/src/api/adminAPI.js (lowercase)
```

## 🎯 Recommended Approach

**Use Option 2 (Manual Git Commands)** - Most reliable:
1. Two-step rename ensures Git tracks the change
2. Works even on Windows case-insensitive filesystem
3. Git history is preserved

**After renaming, your Vercel build should succeed!** 🎉

