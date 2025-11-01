# 🚀 Quick Git Commands for Vercel Fix

## Step 1: Verify Current Status

```bash
# Navigate to project root
cd C:\Users\geeth\Downloads\collage_potal

# Check git status
git status

# Check if API files are tracked
git ls-files | findstr "adminAPI.js"
```

## Step 2: Add All Modified Files

```bash
# Add all API files explicitly
git add frountend/college-portal-frontend/src/api/*.js

# Add all pages that use API imports
git add frountend/college-portal-frontend/src/pages/*.js

# Add all components that use API imports
git add frountend/college-portal-frontend/src/components/**/*.js
git add frountend/college-portal-frontend/src/components/**/*.jsx

# Or add everything in src
git add frountend/college-portal-frontend/src/
```

## Step 3: Commit Changes

```bash
git commit -m "Fix Vercel deployment: Update all API imports to use .js extensions with relative paths"
```

## Step 4: Push to Repository

```bash
# Push to main branch (or master if that's your default)
git push origin main

# OR if your branch is master
git push origin master
```

## Step 5: Verify Files Are Tracked

```bash
# After pushing, verify files are in git
git ls-files frountend/college-portal-frontend/src/api/adminAPI.js

# Should output: frountend/college-portal-frontend/src/api/adminAPI.js
```

## 🔍 Troubleshooting

### If "git add" says "nothing to commit"

The files are already tracked. Check if they need updating:

```bash
# Check what changed
git diff frountend/college-portal-frontend/src/pages/AdminDashboard.js

# If changes exist, add and commit
git add frountend/college-portal-frontend/src/pages/AdminDashboard.js
git commit -m "Update imports"
git push
```

### If Repository Not Initialized

```bash
# Initialize git (if not done)
git init

# Add remote (if not added)
git remote add origin <your-repo-url>

# Then follow Step 2-4 above
```

---

**After pushing, Vercel will automatically rebuild. Make sure Root Directory is configured!**

