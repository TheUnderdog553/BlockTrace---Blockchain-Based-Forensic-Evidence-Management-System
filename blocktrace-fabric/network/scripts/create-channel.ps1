# Create and Join Channel
# Run this after network restart to recreate the channel

Write-Host "`n=== Creating BlockTrace Channel ===" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"
$CHANNEL_NAME = "blocktrace-channel"

# Step 1: Create channel
Write-Host "`n[1/4] Creating channel..." -ForegroundColor Cyan
docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp ; peer channel create -o orderer.blocktrace.com:7050 -c $CHANNEL_NAME -f /etc/hyperledger/fabric/configtx/blocktrace-channel.tx --ordererTLSHostnameOverride orderer.blocktrace.com --tls --cafile /etc/hyperledger/fabric/orderer/tlscacerts/tlsca.blocktrace.com-cert.pem"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Channel created" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Channel creation failed" -ForegroundColor Red
    exit 1
}

# Step 2: Join Forensics peer
Write-Host "`n[2/4] Joining Forensics peer..." -ForegroundColor Cyan
docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp ; peer channel join -b $CHANNEL_NAME.block"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Forensics joined" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Forensics join failed" -ForegroundColor Red
    exit 1
}

# Step 3: Join Police peer
Write-Host "`n[3/4] Joining Police peer..." -ForegroundColor Cyan
docker exec peer0.police.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=PoliceOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@police.blocktrace.com/msp ; peer channel join -b $CHANNEL_NAME.block"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Police joined" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Police join failed" -ForegroundColor Red
    exit 1
}

# Step 4: Join Court peer
Write-Host "`n[4/4] Joining Court peer..." -ForegroundColor Cyan
docker exec peer0.court.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=CourtOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@court.blocktrace.com/msp ; peer channel join -b $CHANNEL_NAME.block"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Court joined" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Court join failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Channel Setup Complete! ===" -ForegroundColor Green
Write-Host "All peers have joined blocktrace-channel" -ForegroundColor Cyan
