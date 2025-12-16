# BlockTrace Status Checker

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   BlockTrace System Status" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Docker Network:" -ForegroundColor Yellow
$containers = docker ps --filter "name=example.com" --format "{{.Names}}" 2>$null
if ($containers) {
    foreach ($container in $containers) {
        Write-Host "   OK $container" -ForegroundColor Green
    }
} else {
    Write-Host "   NOT RUNNING" -ForegroundColor Red
}

# Check Backend
Write-Host ""
Write-Host "Backend API:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/healthz" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   OK Running on http://localhost:4000" -ForegroundColor Green
} catch {
    Write-Host "   NOT RESPONDING on port 4000" -ForegroundColor Red
}

# Check Frontend
Write-Host ""
Write-Host "Frontend:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   OK Running on http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "   NOT RESPONDING on port 5173" -ForegroundColor Red
}

# Check Node Processes
Write-Host ""
Write-Host "Node Processes:" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    foreach ($proc in $nodeProcesses) {
        Write-Host "   PID: $($proc.Id)" -ForegroundColor White
    }
} else {
    Write-Host "   No node processes found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "======================================" -ForegroundColor DarkGray
Write-Host ""
