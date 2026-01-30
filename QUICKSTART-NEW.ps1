# ========================================
#  BLOCKTRACE QUICKSTART
#  Automated startup for all services
# ========================================

$ErrorActionPreference = "Continue"

Write-Host "`n" -NoNewline
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "     BlockTrace Quick Start" -ForegroundColor White
Write-Host "   Forensic Evidence Blockchain" -ForegroundColor Gray
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ========================================
# STEP 1: Check Docker Desktop
# ========================================
Write-Host "[1/4] Checking Docker Desktop..." -ForegroundColor Yellow
try {
    docker ps 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "      OK Docker is running" -ForegroundColor Green
    } else {
        throw "Docker not running"
    }
} catch {
    Write-Host "      ERROR Docker Desktop is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "      Please:" -ForegroundColor Yellow
    Write-Host "      1. Open Docker Desktop application" -ForegroundColor White
    Write-Host "      2. Wait for it to show Docker Desktop is running" -ForegroundColor White
    Write-Host "      3. Run this script again" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# ========================================
# STEP 2: Start Blockchain Network
# ========================================
Write-Host "`n[2/4] Starting Blockchain Network..." -ForegroundColor Yellow

$networkRunning = docker ps --filter "name=blocktrace.com" --format "{{.Names}}"
if ($networkRunning) {
    Write-Host "      OK Network already running" -ForegroundColor Green
} else {
    Write-Host "      Starting BlockTrace network..." -ForegroundColor Gray
    
    Set-Location C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\network
    
    docker-compose up -d 2>&1 | Out-Null
    
    Start-Sleep -Seconds 5
    
    $containers = docker ps --filter "name=blocktrace.com" --format "{{.Names}}"
    if ($containers.Count -ge 3) {
        Write-Host "      OK Network started successfully" -ForegroundColor Green
        Write-Host "        - orderer.blocktrace.com" -ForegroundColor DarkGray
        Write-Host "        - peer0.police.blocktrace.com" -ForegroundColor DarkGray
        Write-Host "        - peer0.forensics.blocktrace.com" -ForegroundColor DarkGray
        Write-Host "        - peer0.court.blocktrace.com" -ForegroundColor DarkGray
    } else {
        Write-Host "      ERROR Network failed to start" -ForegroundColor Red
        exit 1
    }
}

# ========================================
# STEP 3: Start Backend API
# ========================================
Write-Host "`n[3/4] Starting Backend API..." -ForegroundColor Yellow

# Check if backend is already running
$backendRunning = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*backend*"}
if ($backendRunning) {
    Write-Host "      OK Backend already running" -ForegroundColor Green
} else {
    $backendPath = "C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\backend"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; node app.js" -WindowStyle Minimized
    
    Start-Sleep -Seconds 3
    
    Write-Host "      OK Backend API started" -ForegroundColor Green
    Write-Host "        http://localhost:4000" -ForegroundColor DarkGray
}

# ========================================
# STEP 4: Start Frontend
# ========================================
Write-Host "`n[4/4] Starting Frontend..." -ForegroundColor Yellow

$frontendPath = "C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\frontend"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Minimized

Start-Sleep -Seconds 3

Write-Host "      OK Frontend server starting" -ForegroundColor Green
Write-Host "        http://localhost:5173" -ForegroundColor DarkGray

# ========================================
# SUMMARY
# ========================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "      ALL SERVICES STARTED!" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:   http://localhost:4000" -ForegroundColor White
Write-Host "   Network:   Docker containers running" -ForegroundColor White
Write-Host ""

Write-Host "View Status:" -ForegroundColor Cyan
Write-Host "   docker ps --filter name=blocktrace.com" -ForegroundColor DarkGray
Write-Host ""

Write-Host "Stop Services:" -ForegroundColor Cyan
Write-Host "   Stop-Process -Name node -Force" -ForegroundColor DarkGray
Write-Host "   docker-compose -f blocktrace-fabric\network\docker-compose.yaml down" -ForegroundColor DarkGray
Write-Host ""

# Open browser
Start-Sleep -Seconds 3
Write-Host "Opening BlockTrace in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "BlockTrace is ready to use!" -ForegroundColor Green
Write-Host ""
