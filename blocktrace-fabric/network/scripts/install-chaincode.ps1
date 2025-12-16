# Install External Chaincode Package - PowerShell Version
# This works around Windows Docker Desktop external builder issues

Write-Host "=== Installing Evidence Chaincode (PowerShell Method) ===" -ForegroundColor Cyan

# Create temporary directory
$tempDir = "C:\temp\cc-package-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
Set-Location $tempDir

Write-Host "`nCreating chaincode package files..." -ForegroundColor Yellow

# Create metadata.json
$metadata = @"
{
  "type": "external",
  "label": "evidence_1.0"
}
"@
$metadata | Out-File -FilePath "metadata.json" -Encoding ASCII -NoNewline

# Create connection.json
$connection = @"
{
  "address": "evidence-chaincode:7052",
  "dial_timeout": "10s",
  "tls_required": false
}
"@
$connection | Out-File -FilePath "connection.json" -Encoding ASCII -NoNewline

Write-Host "Files created. Building package..." -ForegroundColor Yellow

# Use WSL tar if available, otherwise use docker
if (Get-Command wsl -ErrorAction SilentlyContinue) {
    Write-Host "Using WSL tar..." -ForegroundColor Green
    wsl tar czf code.tar.gz connection.json
    wsl tar czf evidence-external.tar.gz metadata.json code.tar.gz
} else {
    Write-Host "Using Docker tar..." -ForegroundColor Green
    # Create package using alpine container
    docker run --rm -v "${tempDir}:/work" -w /work alpine:latest sh -c "tar czf code.tar.gz connection.json && tar czf evidence-external.tar.gz metadata.json code.tar.gz"
}

$packagePath = Join-Path $tempDir "evidence-external.tar.gz"

if (Test-Path $packagePath) {
    Write-Host "[OK] Package created successfully" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Package creation failed!" -ForegroundColor Red
    exit 1
}

# Function to install on a peer
function Install-Chaincode {
    param (
        [string]$PeerContainer,
        [string]$MSP,
        [string]$MSPPath
    )
    
    Write-Host "`nInstalling on $PeerContainer..." -ForegroundColor Yellow
    
    # Copy package to peer container
    Get-Content $packagePath | docker exec -i $PeerContainer sh -c 'cat > /tmp/evidence-external.tar.gz'
    
    # Install chaincode
    $installCmd = "export CORE_PEER_LOCALMSPID=$MSP && export CORE_PEER_MSPCONFIGPATH=$MSPPath && peer lifecycle chaincode install /tmp/evidence-external.tar.gz"
    
    docker exec $PeerContainer sh -c $installCmd
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Installed on $PeerContainer" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Failed to install on $PeerContainer" -ForegroundColor Red
        return $false
    }
    return $true
}

# Install on all peers
$success = $true
$success = $success -and (Install-Chaincode -PeerContainer "peer0.forensics.blocktrace.com" -MSP "ForensicsOrgMSP" -MSPPath "/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp")
$success = $success -and (Install-Chaincode -PeerContainer "peer0.police.blocktrace.com" -MSP "PoliceOrgMSP" -MSPPath "/etc/hyperledger/fabric/users/Admin@police.blocktrace.com/msp")
$success = $success -and (Install-Chaincode -PeerContainer "peer0.court.blocktrace.com" -MSP "CourtOrgMSP" -MSPPath "/etc/hyperledger/fabric/users/Admin@court.blocktrace.com/msp")

if ($success) {
    Write-Host "`n=== Installation Complete ===" -ForegroundColor Green
    Write-Host "`nQuerying Package ID..." -ForegroundColor Yellow
    
    $queryCmd = @"
export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
peer lifecycle chaincode queryinstalled
"@
    
    $output = docker exec peer0.forensics.blocktrace.com sh -c $queryCmd
    Write-Host $output
    
    # Extract package ID
    $packageId = $output | Select-String -Pattern "Package ID: (evidence_1\.0:\w+)" | ForEach-Object { $_.Matches.Groups[1].Value }
    
    if ($packageId) {
        Write-Host "`n[OK] Package ID: $packageId" -ForegroundColor Green
        Write-Host "`nNext step - Run approve script:" -ForegroundColor Cyan
        Write-Host ".\approve-commit-chaincode.ps1 `"$packageId`"" -ForegroundColor White
        
        # Save package ID to file
        $packageId | Out-File -FilePath "C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\network\scripts\package-id.txt" -Encoding ASCII
        Write-Host "`nPackage ID saved to: network\scripts\package-id.txt" -ForegroundColor Gray
    }
} else {
    Write-Host "`n[FAIL] Installation failed on one or more peers" -ForegroundColor Red
    exit 1
}

# Cleanup
Write-Host "`nCleaning up temporary files..." -ForegroundColor Gray
Set-Location C:\
Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`n[OK] Done!" -ForegroundColor Green
