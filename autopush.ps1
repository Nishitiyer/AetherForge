# AetherForge Auto-Push Script
# This script stages all changes, commits them with a timestamp, and pushes to GitHub.

$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$Message = "auto: update changes at $Timestamp"

Write-Host "🚀 Starting auto-push to GitHub..." -ForegroundColor Cyan

# Check if we are in a git repo
if (!(Test-Path .git)) {
    Write-Host "❌ Error: Not a git repository." -ForegroundColor Red
    exit
}

# Stage all changes
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($null -eq $status) {
    Write-Host "✨ No changes to commit." -ForegroundColor Green
} else {
    git commit -m $Message
    Write-Host "✅ Changes committed: $Message" -ForegroundColor Green
}

# Push to origin main
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Successfully pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "❌ Push failed. Please ensure you are authenticated (run 'gh auth login')." -ForegroundColor Red
}
