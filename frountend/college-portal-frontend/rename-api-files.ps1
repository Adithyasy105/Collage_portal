# PowerShell script to rename API files from .JS to .js in Git
# This handles Windows case-insensitivity issue

Write-Host "🔄 Renaming API files from .JS to .js in Git..." -ForegroundColor Cyan
Write-Host ""

# Navigate to API directory
$apiDir = Join-Path $PSScriptRoot "src\api"
Set-Location $apiDir

# List of API files to rename
$apiFiles = @(
    "adminAPI",
    "admissionAPI",
    "authApi",
    "contactAPI",
    "leaveApi",
    "staffApi",
    "studentApi"
)

Write-Host "Step 1: Checking current Git status..." -ForegroundColor Yellow
Write-Host ""

foreach ($file in $apiFiles) {
    $uppercaseFile = "$file.JS"
    $lowercaseFile = "$file.js"
    $tempFile = "$file.tempJS"
    
    # Check if Git has uppercase version
    $gitFiles = git ls-files | Select-String $file
    
    Write-Host "Processing: $file" -ForegroundColor White
    
    # Check current Git status
    if ($gitFiles -match "\.JS$") {
        Write-Host "  ⚠️  Git shows: $uppercaseFile (uppercase)" -ForegroundColor Yellow
        
        # Step 1: Rename to temp (with different case)
        Write-Host "  📝 Renaming to temp file..." -ForegroundColor Cyan
        git mv "$uppercaseFile" "$tempFile" 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Renamed to temp" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Temp rename may have failed (file might already be lowercase)" -ForegroundColor Yellow
        }
        
        # Step 2: Rename to final lowercase
        Write-Host "  📝 Renaming to lowercase..." -ForegroundColor Cyan
        git mv "$tempFile" "$lowercaseFile" 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Renamed to $lowercaseFile" -ForegroundColor Green
        } else {
            # Try direct rename if temp rename didn't work
            if (Test-Path $uppercaseFile) {
                git mv "$uppercaseFile" "$lowercaseFile" 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  ✅ Direct rename successful" -ForegroundColor Green
                }
            } else {
                Write-Host "  ℹ️  File may already be lowercase in working directory" -ForegroundColor Cyan
            }
        }
    } else {
        Write-Host "  ✅ Already lowercase in Git" -ForegroundColor Green
    }
    
    Write-Host ""
}

Write-Host "✅ Rename process complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review changes: git status" -ForegroundColor White
Write-Host "  2. Commit: git commit -m 'Rename API files to lowercase .js extensions'" -ForegroundColor White
Write-Host "  3. Push: git push" -ForegroundColor White
Write-Host ""

# Navigate back to project root
Set-Location $PSScriptRoot

