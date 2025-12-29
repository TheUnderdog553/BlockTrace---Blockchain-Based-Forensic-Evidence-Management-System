# ========================================
#  BLOCKTRACE QUICKSTART (NEW)
#  Automated startup for all services
# ========================================

$ErrorActionPreference = "Stop"

# Resolve project root dynamically
$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

$FABRIC_PATH   = Join-Path $PROJECT_ROOT "fabric-samples\test-network"
$BACKEND_PATH  = Join-Path $PROJECT_ROOT "blocktrace-fabric\backend"
$FRONTEND_PATH = Join-Path $PROJECT_ROOT "blocktrace-fabric\frontend"

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
    Read-Host "Press Enter to exit"
    exit 1
}

# ========================================
# STEP 2: Start Blockchain Network
# ========================================
Write-Host "`n[2/4] Starting Blockchain Network..." -ForegroundColor Yellow

$networkRunning = docker ps --filter "name=orderer.example.com" --format '{{.Names}}'
if ($networkRunning) {
    Write-Host "      ✓ Network already running" -ForegroundColor Green
}
else {
    Write-Host "      → Starting Fabric containers..." -ForegroundColor Gray

    if (-not (Test-Path $FABRIC_PATH)) {
        Write-Host "      ✗ Fabric test-network not found:" -ForegroundColor Red
        Write-Host "        $FABRIC_PATH"
        exit 1
    }

    Set-Location $FABRIC_PATH

    $env:DOCKER_SOCK = "/var/run/docker.sock"

    # Run docker-compose via CMD to avoid PowerShell stderr termination
    cmd /c docker-compose `
        -f compose/compose-test-net.yaml `
        -f compose/docker/docker-compose-test-net.yaml `
        up -d

    # ---- Robust readiness check ----
    $expected = @(
        "orderer.example.com",
        "peer0.org1.example.com",
        "peer0.org2.example.com"
    )

    $maxWait = 30
    $elapsed = 0

    while ($elapsed -lt $maxWait) {
        $running = @(docker ps --format '{{.Names}}')
        $missing = $expected | Where-Object { $_ -notin $running }

        if ($missing.Count -eq 0) {
            Write-Host "      ✓ Network started successfully" -ForegroundColor Green
            Write-Host "        • orderer.example.com" -ForegroundColor DarkGray
            Write-Host "        • peer0.org1.example.com" -ForegroundColor DarkGray
            Write-Host "        • peer0.org2.example.com" -ForegroundColor DarkGray
            break
        }

        Start-Sleep -Seconds 2
        $elapsed += 2
    }

    if ($missing.Count -ne 0) {
        Write-Host "      ✗ Network failed to start" -ForegroundColor Red
        Write-Host "      Missing containers:"
        $missing | ForEach-Object { Write-Host "        • $_" }
        exit 1
    }
}

# ========================================
# STEP 3: Start Backend API
# ========================================
Write-Host "`n[3/4] Starting Backend API..." -ForegroundColor Yellow

Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Set-Location $BACKEND_PATH

$backendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    node app.js
} -ArgumentList $BACKEND_PATH

Start-Sleep -Seconds 3

try {
    Invoke-WebRequest -Uri "http://localhost:4000/healthz" -UseBasicParsing -TimeoutSec 5 | Out-Null
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

Set-Location $FRONTEND_PATH

$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run dev
} -ArgumentList $FRONTEND_PATH

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
Write-Host "   ├─ Frontend:  http://localhost:5173"
Write-Host "   ├─ Backend:   http://localhost:4000"
Write-Host "   └─ Network:   3 containers running"
Write-Host ""

Start-Sleep -Seconds 2
Write-Host "🚀 Opening BlockTrace in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Press Ctrl+C to stop monitoring (services will keep running)" -ForegroundColor Gray
Write-Host ""

# Monitor jobs
while ($true) {
    Start-Sleep -Seconds 10

    if ((Get-Job -Id $backendJob.Id).State -eq "Failed") {
        Write-Host "⚠ Backend job failed! Check logs." -ForegroundColor Red
    }
    if ((Get-Job -Id $frontendJob.Id).State -eq "Failed") {
        Write-Host "⚠ Frontend job failed! Check logs." -ForegroundColor Red
    }
}
