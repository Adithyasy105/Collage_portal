# 🔧 Fix: Rename adminAPI.JS to adminAPI.js in Git

## Current Status
- ❌ Git shows: `adminAPI.JS` (uppercase)
- ✅ All other files are lowercase: `.js`
- ✅ Local file is already lowercase

## ✅ Fix Commands

**Run these commands in order:**

```bash
# 1. Navigate to API directory
cd C:\Users\geeth\Downloads\collage_potal\frountend\college-portal-frontend\src\api

# 2. Step 1: Rename to temp (forces Git to see it as different file)
git mv adminAPI.JS adminAPI_temp

# 3. Step 2: Rename to lowercase
git mv adminAPI_temp adminAPI.js

# 4. Go back to project root
cd C:\Users\geeth\Downloads\collage_potal

# 5. Check the change
git status

# 6. Commit
git commit -m "Rename adminAPI.JS to adminAPI.js for Vercel compatibility"

# 7. Push to GitHub
git push
```

## ✅ Verify After Push

```bash
# Check Git shows lowercase
git ls-files | findstr "adminAPI.js"

# Should output: frountend/college-portal-frontend/src/api/adminAPI.js
```

## 🎯 That's It!

After pushing, Vercel will rebuild and should find `adminAPI.js` correctly.

