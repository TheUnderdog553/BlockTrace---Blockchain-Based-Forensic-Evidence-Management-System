# BlockTrace Status Checker

Write-Host "`n╔═══════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   BlockTrace System Status       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════╝`n" -ForegroundColor Cyan

# Check Docker
Write-Host "🐳 Docker Network:" -ForegroundColor Yellow
$containers = docker ps --filter "name=example.com" --format "{{.Names}}" 2>$null
if ($containers) {
    foreach ($container in $containers) {
        Write-Host "   ✓ $container" -ForegroundColor Green
    }
} else {
    Write-Host "   ✗ Not running" -ForegroundColor Red
    Write-Host "   → Run: cd fabric-samples\test-network ; QUICKSTART.ps1" -ForegroundColor Gray
}

# Check Backend
Write-Host "`n🔧 Backend API:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/healthz" -UseBasicParsing -TimeoutSec 3
    Write-Host "   ✓ Running on http://localhost:4000" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Not responding on port 4000" -ForegroundColor Red
    Write-Host "   → Start: cd blocktrace-fabric\backend ; node app.js" -ForegroundColor Gray
}

# Check Frontend
Write-Host "`n🎨 Frontend:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 3
    Write-Host "   ✓ Running on http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Not responding on port 5173" -ForegroundColor Red
    Write-Host "   → Start: cd blocktrace-fabric\frontend ; npm run dev" -ForegroundColor Gray
}

# Check Node Processes
Write-Host "`n⚙️  Node Processes:" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    foreach ($proc in $nodeProcesses) {
        $startTime = $proc.StartTime.ToString("HH:mm:ss")
        Write-Host "   • PID: $($proc.Id) - Running since $startTime" -ForegroundColor White
    }
} else {
    Write-Host "   ℹ No node processes found" -ForegroundColor Gray
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
