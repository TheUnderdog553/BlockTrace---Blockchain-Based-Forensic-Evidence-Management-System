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

    if (-not (Test-Path $FABRIC_PATH)) {
        Write-Host "      ERROR Fabric test-network not found:"
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
    $missing = $expected

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

Start-Sleep -Seconds 2
Write-Host "Opening BlockTrace in browser..."
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Press Ctrl+C to stop monitoring (services keep running)"
Write-Host ""

# Monitor jobs
while ($true) {
    Start-Sleep -Seconds 10

    if ((Get-Job -Id $backendJob.Id).State -eq "Failed") {
        Write-Host "WARNING Backend job failed! Check logs."
    }
    if ((Get-Job -Id $frontendJob.Id).State -eq "Failed") {
        Write-Host "WARNING Frontend job failed! Check logs."
    }
}
