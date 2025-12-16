# Start BlockTrace System

Write-Host "`n====== Starting BlockTrace System ======" -ForegroundColor Cyan

# Check if network is running
$ordererStatus = docker ps --filter "name=orderer.example.com" --format "{{.Status}}"
if (-not $ordererStatus) {
    Write-Host "`n[ERROR] Fabric network not running!" -ForegroundColor Red
    Write-Host "Start network with: cd fabric-samples\test-network ; .\deployAll.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[OK] Fabric network is running" -ForegroundColor Green

# Start Backend
Write-Host "`n[1/2] Starting Backend API..." -ForegroundColor Cyan
$backendPath = "C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\backend"

if (-not (Test-Path "$backendPath\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location $backendPath
    npm install
}

Set-Location $backendPath
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $backendPath ; node app.js" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "[OK] Backend starting on http://localhost:4000" -ForegroundColor Green

# Start Frontend
Write-Host "`n[2/2] Starting Frontend..." -ForegroundColor Cyan
$frontendPath = "C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\frontend"

if (-not (Test-Path "$frontendPath\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location $frontendPath
    npm install
}

Set-Location $frontendPath
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $frontendPath ; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "[OK] Frontend starting on http://localhost:5173" -ForegroundColor Green

Write-Host "`n====== BlockTrace Started! ======" -ForegroundColor Green
Write-Host "`nServices Running:" -ForegroundColor Cyan
Write-Host "  • Fabric Network: orderer + 2 peers" -ForegroundColor White
Write-Host "  • Backend API:    http://localhost:4000" -ForegroundColor White
Write-Host "  • Frontend App:   http://localhost:5173" -ForegroundColor White
Write-Host "`nOpen http://localhost:5173 in your browser" -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C to stop this script (services will keep running)" -ForegroundColor Gray

# Keep script running
while ($true) {
    Start-Sleep -Seconds 30
}
