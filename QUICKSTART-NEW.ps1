# ========================================
#  BLOCKTRACE QUICKSTART
#  Automated startup for all services
# ========================================

$ErrorActionPreference = "Stop"

Write-Host "`n" -NoNewline
Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     " -NoNewline -ForegroundColor Cyan
Write-Host "BlockTrace Quick Start" -NoNewline -ForegroundColor White
Write-Host "        ║" -ForegroundColor Cyan
Write-Host "║   " -NoNewline -ForegroundColor Cyan
Write-Host "Forensic Evidence Blockchain" -NoNewline -ForegroundColor Gray
Write-Host "    ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ========================================
# STEP 1: Check Docker Desktop
# ========================================
Write-Host "[1/4] Checking Docker Desktop..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "      ✓ Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "      ✗ Docker Desktop is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "      Please:" -ForegroundColor Yellow
    Write-Host "      1. Open Docker Desktop application" -ForegroundColor White
    Write-Host "      2. Wait for it to show 'Docker Desktop is running'" -ForegroundColor White
    Write-Host "      3. Run this script again" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# ========================================
# STEP 2: Start Blockchain Network
# ========================================
Write-Host "`n[2/4] Starting Blockchain Network..." -ForegroundColor Yellow

$networkRunning = docker ps --filter "name=orderer.example.com" --format "{{.Names}}"
if ($networkRunning) {
    Write-Host "      ✓ Network already running" -ForegroundColor Green
}
else {
    Write-Host "      → Starting Fabric containers..." -ForegroundColor Gray
    
    Set-Location C:\Users\Priyanshu\Desktop\Blocktrace\fabric-samples\test-network
    
    $env:DOCKER_SOCK = "/var/run/docker.sock"
    docker-compose -f compose/compose-test-net.yaml -f compose/docker/docker-compose-test-net.yaml up -d 2>&1 | Out-Null
    
    Start-Sleep -Seconds 3
    
    $containers = docker ps --filter "name=example.com" --format "{{.Names}}"
    if ($containers.Count -ge 3) {
        Write-Host "      ✓ Network started successfully" -ForegroundColor Green
        Write-Host "        • orderer.example.com" -ForegroundColor DarkGray
        Write-Host "        • peer0.org1.example.com" -ForegroundColor DarkGray
        Write-Host "        • peer0.org2.example.com" -ForegroundColor DarkGray
    }
    else {
        Write-Host "      ✗ Network failed to start" -ForegroundColor Red
        exit 1
    }
}

# ========================================
# STEP 3: Start Backend API
# ========================================
Write-Host "`n[3/4] Starting Backend API..." -ForegroundColor Yellow

# Stop any existing node processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start backend in background
$backendPath = "C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\backend"
Set-Location $backendPath

$backendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    node app.js
} -ArgumentList $backendPath

Start-Sleep -Seconds 3

# Verify backend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/healthz" -UseBasicParsing -TimeoutSec 5
    Write-Host "      ✓ Backend API running" -ForegroundColor Green
    Write-Host "        http://localhost:4000" -ForegroundColor DarkGray
}
catch {
    Write-Host "      ⚠ Backend starting (may take a moment)" -ForegroundColor Yellow
    Write-Host "        http://localhost:4000" -ForegroundColor DarkGray
}

# ========================================
# STEP 4: Start Frontend
# ========================================
Write-Host "`n[4/4] Starting Frontend..." -ForegroundColor Yellow

$frontendPath = "C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\frontend"
Set-Location $frontendPath

$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run dev
} -ArgumentList $frontendPath

Start-Sleep -Seconds 5

Write-Host "      ✓ Frontend server starting" -ForegroundColor Green
Write-Host "        http://localhost:5173" -ForegroundColor DarkGray

# ========================================
# SUMMARY
# ========================================
Write-Host ""
Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      " -NoNewline -ForegroundColor Green
Write-Host "✓ ALL SERVICES STARTED!" -NoNewline -ForegroundColor White
Write-Host "        ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 Access Points:" -ForegroundColor Cyan
Write-Host "   ├─ Frontend:  " -NoNewline -ForegroundColor DarkGray
Write-Host "http://localhost:5173" -ForegroundColor White
Write-Host "   ├─ Backend:   " -NoNewline -ForegroundColor DarkGray
Write-Host "http://localhost:4000" -ForegroundColor White
Write-Host "   └─ Network:   " -NoNewline -ForegroundColor DarkGray
Write-Host "3 containers running" -ForegroundColor White
Write-Host ""

Write-Host "📊 View Status:" -ForegroundColor Cyan
Write-Host "   docker ps --filter " -NoNewline -ForegroundColor DarkGray
Write-Host '"name=example.com"' -ForegroundColor White
Write-Host ""

Write-Host "🛑 Stop Services:" -ForegroundColor Cyan
Write-Host "   Stop-Process -Name node -Force" -ForegroundColor DarkGray
Write-Host ""

Write-Host "💡 Tip: " -NoNewline -ForegroundColor Yellow
Write-Host "Check STARTUP-COMMANDS.md for detailed instructions" -ForegroundColor White
Write-Host ""

# Open browser
Start-Sleep -Seconds 2
Write-Host "🚀 Opening BlockTrace in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Press Ctrl+C to stop monitoring (services will keep running)" -ForegroundColor Gray
Write-Host ""

# Keep script running and show job status
while ($true) {
    Start-Sleep -Seconds 10
    
    $backendState = (Get-Job -Id $backendJob.Id).State
    $frontendState = (Get-Job -Id $frontendJob.Id).State
    
    if ($backendState -eq "Failed") {
        Write-Host "⚠ Backend job failed! Check logs." -ForegroundColor Red
    }
    if ($frontendState -eq "Failed") {
        Write-Host "⚠ Frontend job failed! Check logs." -ForegroundColor Red
    }
}
