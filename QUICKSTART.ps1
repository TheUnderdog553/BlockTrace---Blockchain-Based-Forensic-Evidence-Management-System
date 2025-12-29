# ========================================
#  BLOCKTRACE QUICKSTART
#  Automated startup for all services
# ========================================

$ErrorActionPreference = "Stop"

# Resolve project root
$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

# Paths
$FABRIC_PATH   = Join-Path $PROJECT_ROOT "fabric-samples\test-network"
$BACKEND_PATH  = Join-Path $PROJECT_ROOT "blocktrace-fabric\backend"
$FRONTEND_PATH = Join-Path $PROJECT_ROOT "blocktrace-fabric\frontend"

Write-Host ""
Write-Host "+--------------------------------------+"
Write-Host "|        BlockTrace Quick Start         |"
Write-Host "|    Forensic Evidence Blockchain       |"
Write-Host "+--------------------------------------+"
Write-Host ""

# ========================================
# STEP 1: Check Docker Desktop
# ========================================
Write-Host "[1/4] Checking Docker Desktop..."
try {
    docker ps | Out-Null
    Write-Host "      OK Docker is running"
}
catch {
    Write-Host "      ERROR Docker Desktop is NOT running!"
    Write-Host ""
    Write-Host "      Please:"
    Write-Host "      1. Open Docker Desktop"
    Write-Host "      2. Wait until it is running"
    Write-Host "      3. Run this script again"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# ========================================
# STEP 2: Start Blockchain Network
# ========================================
Write-Host ""
Write-Host "[2/4] Starting Blockchain Network..."

$networkRunning = docker ps --filter "name=orderer.example.com" --format '{{.Names}}'
if ($networkRunning) {
    Write-Host "      OK Network already running"
}
else {
    Write-Host "      Starting Fabric containers..."

    Set-Location $FABRIC_PATH

    $env:DOCKER_SOCK = "/var/run/docker.sock"
    docker-compose `
        -f compose/compose-test-net.yaml `
        -f compose/docker/docker-compose-test-net.yaml `
        up -d

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
            Write-Host "      OK Network started successfully"
            Write-Host "        - orderer.example.com"
            Write-Host "        - peer0.org1.example.com"
            Write-Host "        - peer0.org2.example.com"
            break
        }

        Start-Sleep -Seconds 2
        $elapsed += 2
    }

    if ($missing.Count -ne 0) {
        Write-Host "      ERROR Network failed to start"
        Write-Host "      Missing containers:"
        $missing | ForEach-Object { Write-Host "        - $_" }
        exit 1
    }

}

# ========================================
# STEP 3: Start Backend API
# ========================================
Write-Host ""
Write-Host "[3/4] Starting Backend API..."

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
    Write-Host "      OK Backend API running"
    Write-Host "        http://localhost:4000"
}
catch {
    Write-Host "      WARNING Backend starting (may take a moment)"
    Write-Host "        http://localhost:4000"
}

# ========================================
# STEP 4: Start Frontend
# ========================================
Write-Host ""
Write-Host "[4/4] Starting Frontend..."

Set-Location $FRONTEND_PATH

$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run dev
} -ArgumentList $FRONTEND_PATH

Start-Sleep -Seconds 5

Write-Host "      OK Frontend server starting"
Write-Host "        http://localhost:5173"

# ========================================
# SUMMARY
# ========================================
Write-Host ""
Write-Host "+--------------------------------------+"
Write-Host "|        ALL SERVICES STARTED           |"
Write-Host "+--------------------------------------+"
Write-Host ""

Write-Host "Access Points:"
Write-Host "  - Frontend: http://localhost:5173"
Write-Host "  - Backend:  http://localhost:4000"
Write-Host "  - Network:  3 containers running"
Write-Host ""

Write-Host "View Status:"
Write-Host '  docker ps --filter "name=example.com"'
Write-Host ""

Write-Host "Stop Services:"
Write-Host "  Stop-Process -Name node -Force"
Write-Host ""

Write-Host "Tip:"
Write-Host "  Check HOW-TO-RUN.md for details"
Write-Host ""

Start-Sleep -Seconds 2
Write-Host "Opening BlockTrace in browser..."
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Press Ctrl+C to stop monitoring (services keep running)"
Write-Host ""

# Keep script running and show job status
while ($true) {
    Start-Sleep -Seconds 10

    $backendState  = (Get-Job -Id $backendJob.Id).State
    $frontendState = (Get-Job -Id $frontendJob.Id).State

    if ($backendState -eq "Failed") {
        Write-Host "WARNING Backend job failed! Check logs."
    }
    if ($frontendState -eq "Failed") {
        Write-Host "WARNING Frontend job failed! Check logs."
    }
}
