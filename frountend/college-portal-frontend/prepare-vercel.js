#!/usr/bin/env node
// Script to verify all API files exist and are ready for Vercel deployment

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Vercel Deployment Readiness...\n');

const apiDir = path.join(__dirname, 'src', 'api');
const pagesDir = path.join(__dirname, 'src', 'pages');
const componentsDir = path.join(__dirname, 'src', 'components');

// Required API files
const requiredApiFiles = [
  'adminAPI.js',
  'admissionAPI.js',
  'authApi.js',
  'contactAPI.js',
  'leaveApi.js',
  'staffApi.js',
  'studentApi.js'
];

// Check API files
console.log('📁 Checking API Files:');
let allApiFilesExist = true;
requiredApiFiles.forEach(file => {
  const filePath = path.join(apiDir, file);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allApiFilesExist = false;
});

// Check critical imports in AdminDashboard.js
console.log('\n📄 Checking Critical Imports:');
const adminDashboardPath = path.join(pagesDir, 'AdminDashboard.js');
if (fs.existsSync(adminDashboardPath)) {
  const content = fs.readFileSync(adminDashboardPath, 'utf8');
  const hasCorrectImport = content.includes("from \"../api/adminAPI.js\"");
  console.log(`   ${hasCorrectImport ? '✅' : '❌'} AdminDashboard.js uses '../api/adminAPI.js'`);
}

// Summary
console.log('\n' + '='.repeat(50));
if (allApiFilesExist) {
  console.log('✅ All API files exist!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Ensure files are committed to git:');
  console.log('      git add src/api/*.js');
  console.log('      git add src/pages/*.js');
  console.log('      git add src/components/**/*.js');
  console.log('      git commit -m "Fix: API imports with .js extensions"');
  console.log('      git push');
  console.log('\n   2. Configure Vercel Root Directory:');
  console.log('      Settings → General → Root Directory');
  console.log('      Set to: frountend/college-portal-frontend');
  console.log('\n   3. Clear Vercel build cache and redeploy');
  process.exit(0);
} else {
  console.log('❌ Some API files are missing!');
  console.log('   Please ensure all files exist before deploying.');
  process.exit(1);
}

