# BlockTrace Complete Startup Guide

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  BlockTrace System Startup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check Docker Desktop
Write-Host "[1/4] Checking Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = $false
try {
    docker ps | Out-Null
    $dockerRunning = $true
    Write-Host "      ✓ Docker Desktop is running" -ForegroundColor Green
} catch {
    Write-Host "      ✗ Docker Desktop is NOT running!" -ForegroundColor Red
    Write-Host "`n      Please start Docker Desktop and wait for it to be ready." -ForegroundColor Yellow
    Write-Host "      Then run this script again.`n" -ForegroundColor Yellow
    exit 1
}

# Step 2: Start Fabric Network
Write-Host "`n[2/4] Starting Fabric Network..." -ForegroundColor Yellow
cd C:\Users\Priyanshu\Desktop\Blocktrace\fabric-samples\test-network

$networkRunning = docker ps --filter "name=orderer.example.com" --format "{{.Names}}"
if ($networkRunning) {
    Write-Host "      ✓ Network already running" -ForegroundColor Green
} else {
    Write-Host "      Starting network containers..." -ForegroundColor Gray
    $env:DOCKER_SOCK = "/var/run/docker.sock"
    docker-compose -f compose/compose-test-net.yaml -f compose/docker/docker-compose-test-net.yaml up -d
    Start-Sleep -Seconds 5
    Write-Host "      ✓ Network started" -ForegroundColor Green
}

# Step 3: Start Backend API
Write-Host "`n[3/4] Starting Backend API..." -ForegroundColor Yellow
$backendPath = "C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\backend"

# Kill any existing node processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "Write-Host 'BlockTrace Backend Server' -ForegroundColor Cyan; `
     cd $backendPath; `
     node app.js" -WindowStyle Normal

Start-Sleep -Seconds 3
Write-Host "      ✓ Backend starting on http://localhost:4000" -ForegroundColor Green

# Step 4: Start Frontend
Write-Host "`n[4/4] Starting Frontend..." -ForegroundColor Yellow
$frontendPath = "C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\frontend"

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "Write-Host 'BlockTrace Frontend' -ForegroundColor Cyan; `
     cd $frontendPath; `
     npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 5
Write-Host "      ✓ Frontend starting (check new window for URL)" -ForegroundColor Green

# Summary
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✓ BlockTrace System Started!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  • Fabric Network:  3 containers running" -ForegroundColor White
Write-Host "  • Backend API:     http://localhost:4000" -ForegroundColor White
Write-Host "  • Frontend App:    Check PowerShell window for URL" -ForegroundColor White
Write-Host "                     (usually http://localhost:5173)" -ForegroundColor Gray

Write-Host "`n⚡ Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Look for the PowerShell window titled 'BlockTrace Frontend'" -ForegroundColor White
Write-Host "  2. Find the line that says 'Local: http://localhost:XXXX'" -ForegroundColor White
Write-Host "  3. Open that URL in your browser" -ForegroundColor White

Write-Host "`n📝 Useful Commands:" -ForegroundColor Yellow
Write-Host "  • Check network:   docker ps" -ForegroundColor Gray
Write-Host "  • Test backend:    curl http://localhost:4000/healthz" -ForegroundColor Gray
Write-Host "  • View logs:       docker logs peer0.org1.example.com" -ForegroundColor Gray

Write-Host "`nPress any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
