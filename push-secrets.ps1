# Push Secrets to Cloudflare Workers
# This script will securely store secrets in Cloudflare Workers

Write-Host "Pushing secrets to Cloudflare Workers..." -ForegroundColor Cyan

# Google OAuth Client ID
Write-Host "`nSetting GOOGLE_WEB_CLIENT_ID..." -ForegroundColor Yellow
echo "87314678313-3gqqqeo2krfilu6uo5s2m4auraune9ji.apps.googleusercontent.com" | npx wrangler secret put GOOGLE_WEB_CLIENT_ID

# JWT Secret for token signing (generating a secure random secret)
Write-Host "`nSetting JWT_SECRET..." -ForegroundColor Yellow
$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
echo $jwtSecret | npx wrangler secret put JWT_SECRET

Write-Host "`nAll secrets have been pushed to Cloudflare!" -ForegroundColor Green
Write-Host "`nNow deploying the worker..." -ForegroundColor Cyan

# Deploy the worker
npx wrangler deploy

Write-Host "`nDeployment complete!" -ForegroundColor Green
