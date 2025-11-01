# 🔄 Rename API Files: Change .JS to .js

## Problem
Files were created with uppercase `.JS` extension, but imports use lowercase `.js`. Git on Windows doesn't detect case-only renames automatically.

## ✅ Solution: Use Git to Rename Files

### Method 1: Using Git MV (Recommended)

```bash
# Navigate to project root
cd C:\Users\geeth\Downloads\collage_potal

# For each API file, use git mv:
cd frountend/college-portal-frontend/src/api

# Rename adminAPI.JS to adminAPI.js
git mv adminAPI.JS adminAPI.js.temp
git mv adminAPI.js.temp adminAPI.js

# Repeat for other files:
git mv admissionAPI.JS admissionAPI.js.temp
git mv admissionAPI.js.temp admissionAPI.js

git mv authApi.JS authApi.js.temp
git mv authApi.js.temp authApi.js

git mv contactAPI.JS contactAPI.js.temp
git mv contactAPI.js.temp contactAPI.js

git mv leaveApi.JS leaveApi.js.temp
git mv leaveApi.js.temp leaveApi.js

git mv staffApi.JS staffApi.js.temp
git mv staffApi.js.temp staffApi.js

git mv studentApi.JS studentApi.js.temp
git mv studentApi.js.temp studentApi.js
```

### Method 2: Two-Step Rename (More Reliable)

```bash
# Step 1: Rename to temporary name
cd C:\Users\geeth\Downloads\collage_potal\frountend\college-portal-frontend\src\api

git mv adminAPI.JS adminAPI_temp.JS
git mv admissionAPI.JS admissionAPI_temp.JS
git mv authApi.JS authApi_temp.JS
git mv contactAPI.JS contactAPI_temp.JS
git mv leaveApi.JS leaveApi_temp.JS
git mv staffApi.JS staffApi_temp.JS
git mv studentApi.JS studentApi_temp.JS

# Commit the intermediate rename
cd C:\Users\geeth\Downloads\collage_potal
git add -A
git commit -m "Rename API files: Step 1 - to temp names"

# Step 2: Rename to final lowercase name
cd frountend/college-portal-frontend/src/api

git mv adminAPI_temp.JS adminAPI.js
git mv admissionAPI_temp.JS admissionAPI.js
git mv authApi_temp.JS authApi.js
git mv contactAPI_temp.JS contactAPI.js
git mv leaveApi_temp.JS leaveApi.js
git mv staffApi_temp.JS staffApi.js
git mv studentApi_temp.JS studentApi.js

# Commit final rename
cd C:\Users\geeth\Downloads\collage_potal
git add -A
git commit -m "Rename API files: Step 2 - to lowercase .js extensions"

# Push to GitHub
git push
```

### Method 3: Manual Rename + Git Add (If git mv doesn't work)

```bash
# 1. Delete files from Git index (but keep locally)
cd C:\Users\geeth\Downloads\collage_potal\frountend\college-portal-frontend\src\api
git rm --cached adminAPI.JS
git rm --cached admissionAPI.JS
git rm --cached authApi.JS
git rm --cached contactAPI.JS
git rm --cached leaveApi.JS
git rm --cached staffApi.JS
git rm --cached studentApi.JS

# 2. Commit removal
cd C:\Users\geeth\Downloads\collage_potal
git commit -m "Remove API files with uppercase extensions"

# 3. Rename files in Windows (case doesn't matter for Windows)
#    Manually rename each file in Explorer or use:
#    - adminAPI.JS → adminAPI.js
#    - etc.

# 4. Add with new names
git add frountend/college-portal-frontend/src/api/adminAPI.js
git add frountend/college-portal-frontend/src/api/admissionAPI.js
git add frountend/college-portal-frontend/src/api/authApi.js
git add frountend/college-portal-frontend/src/api/contactAPI.js
git add frountend/college-portal-frontend/src/api/leaveApi.js
git add frountend/college-portal-frontend/src/api/staffApi.js
git add frountend/college-portal-frontend/src/api/studentApi.js

# 5. Commit
git commit -m "Add API files with lowercase .js extensions"

# 6. Push
git push
```

## ✅ Verify After Rename

```bash
# Check Git shows lowercase names
git ls-files | findstr "adminAPI.js"

# Should output: frountend/college-portal-frontend/src/api/adminAPI.js
```

## 🚨 Important Notes

1. **All imports already use `.js` (lowercase)** - They're correct!
2. **Windows filesystem is case-insensitive** - `adminAPI.JS` and `adminAPI.js` are the same file on Windows
3. **Git and Linux are case-sensitive** - Vercel needs exact match: `adminAPI.js`
4. **Use `git mv`** - It ensures Git tracks the rename properly

## 📝 Quick Commands Summary

```bash
# Navigate to API directory
cd C:\Users\geeth\Downloads\collage_potal\frountend\college-portal-frontend\src\api

# Rename each file (two-step to avoid case issues)
git mv adminAPI.JS adminAPI_temp
git mv adminAPI_temp adminAPI.js

# Repeat for all 7 files, then:
cd C:\Users\geeth\Downloads\collage_potal
git commit -m "Rename all API files to lowercase .js extensions"
git push
```

