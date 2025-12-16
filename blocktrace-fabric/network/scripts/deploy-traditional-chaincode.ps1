# Deploy Traditional Chaincode (JavaScript)
# This script packages, installs, approves, and commits the evidence chaincode
# in traditional mode (not external chaincode) to work on Windows Docker Desktop

Write-Host "`n=== BlockTrace Traditional Chaincode Deployment ===" -ForegroundColor Cyan
Write-Host "This deploys chaincode in traditional mode (Fabric handles lifecycle)" -ForegroundColor Yellow

$ErrorActionPreference = "Stop"

# Configuration
$CHANNEL_NAME = "blocktrace-channel"
$CC_NAME = "evidence"
$CC_VERSION = "1.0"
$CC_SEQUENCE = 1
$CC_PATH = "C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\chaincode\evidence"

# Peer configurations
$FORENSICS_PEER = "peer0.forensics.blocktrace.com:7051"
$FORENSICS_MSP = "ForensicsOrgMSP"
$FORENSICS_TLS_CERT = "/etc/hyperledger/fabric/peers/peer0.forensics.blocktrace.com/tls/ca.crt"
$FORENSICS_ADMIN_MSP = "/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp"

$POLICE_PEER = "peer0.police.blocktrace.com:9051"
$POLICE_MSP = "PoliceOrgMSP"
$POLICE_TLS_CERT = "/etc/hyperledger/fabric/peers/peer0.police.blocktrace.com/tls/ca.crt"
$POLICE_ADMIN_MSP = "/etc/hyperledger/fabric/users/Admin@police.blocktrace.com/msp"

$COURT_PEER = "peer0.court.blocktrace.com:11051"
$COURT_MSP = "CourtOrgMSP"
$COURT_TLS_CERT = "/etc/hyperledger/fabric/peers/peer0.court.blocktrace.com/tls/ca.crt"
$COURT_ADMIN_MSP = "/etc/hyperledger/fabric/users/Admin@court.blocktrace.com/msp"

$ORDERER_ADDRESS = "orderer.blocktrace.com:7050"
$ORDERER_TLS_CERT = "/etc/hyperledger/fabric/orderer/msp/tlscacerts/tlsca.blocktrace.com-cert.pem"

# Step 1: Package the chaincode
Write-Host "`n[1/6] Packaging chaincode..." -ForegroundColor Cyan
Write-Host "Path: $CC_PATH" -ForegroundColor Gray

$packageCmd = "cd /tmp && peer lifecycle chaincode package ${CC_NAME}.tar.gz --path /opt/gopath/src/github.com/chaincode/evidence --lang node --label ${CC_NAME}_${CC_VERSION}"

docker exec -e FABRIC_CFG_PATH=/etc/hyperledger/fabric peer0.forensics.blocktrace.com sh -c $packageCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Chaincode packaged successfully" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Chaincode packaging failed" -ForegroundColor Red
    exit 1
}

# Step 2: Install on all peers
Write-Host "`n[2/6] Installing chaincode on all peers..." -ForegroundColor Cyan

# Install on Forensics peer
Write-Host "  -> Installing on Forensics peer..." -ForegroundColor Gray
$installCmd = "export CORE_PEER_LOCALMSPID=$FORENSICS_MSP && export CORE_PEER_ADDRESS=$FORENSICS_PEER && export CORE_PEER_MSPCONFIGPATH=$FORENSICS_ADMIN_MSP && export CORE_PEER_TLS_ENABLED=true && export CORE_PEER_TLS_ROOTCERT_FILE=$FORENSICS_TLS_CERT && peer lifecycle chaincode install /tmp/${CC_NAME}.tar.gz"

docker exec peer0.forensics.blocktrace.com sh -c $installCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "     [OK] Installed on Forensics" -ForegroundColor Green
} else {
    Write-Host "     [FAIL] Installation failed on Forensics" -ForegroundColor Red
    exit 1
}

# Install on Police peer
Write-Host "  -> Installing on Police peer..." -ForegroundColor Gray
$installCmd = @"
export CORE_PEER_LOCALMSPID=$POLICE_MSP && \
export CORE_PEER_ADDRESS=$POLICE_PEER && \
export CORE_PEER_MSPCONFIGPATH=$POLICE_ADMIN_MSP && \
export CORE_PEER_TLS_ENABLED=true && \
export CORE_PEER_TLS_ROOTCERT_FILE=$POLICE_TLS_CERT && \
peer lifecycle chaincode install /tmp/${CC_NAME}.tar.gz
"@

docker exec peer0.police.blocktrace.com sh -c $installCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "     [OK] Installed on Police" -ForegroundColor Green
} else {
    Write-Host "     [FAIL] Installation failed on Police" -ForegroundColor Red
    exit 1
}

# Install on Court peer
Write-Host "  -> Installing on Court peer..." -ForegroundColor Gray
$installCmd = @"
export CORE_PEER_LOCALMSPID=$COURT_MSP && \
export CORE_PEER_ADDRESS=$COURT_PEER && \
export CORE_PEER_MSPCONFIGPATH=$COURT_ADMIN_MSP && \
export CORE_PEER_TLS_ENABLED=true && \
export CORE_PEER_TLS_ROOTCERT_FILE=$COURT_TLS_CERT && \
peer lifecycle chaincode install /tmp/${CC_NAME}.tar.gz
"@

docker exec peer0.court.blocktrace.com sh -c $installCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "     [OK] Installed on Court" -ForegroundColor Green
} else {
    Write-Host "     [FAIL] Installation failed on Court" -ForegroundColor Red
    exit 1
}

# Step 3: Query package ID
Write-Host "`n[3/6] Querying package ID..." -ForegroundColor Cyan

$queryCmd = @"
export CORE_PEER_LOCALMSPID=$FORENSICS_MSP && \
export CORE_PEER_ADDRESS=$FORENSICS_PEER && \
export CORE_PEER_MSPCONFIGPATH=$FORENSICS_ADMIN_MSP && \
peer lifecycle chaincode queryinstalled
"@

$queryResult = docker exec peer0.forensics.blocktrace.com sh -c $queryCmd

# Extract package ID
$packageId = ""
if ($queryResult -match "${CC_NAME}_${CC_VERSION}:([a-f0-9]+)") {
    $packageId = "${CC_NAME}_${CC_VERSION}:$($matches[1])"
    Write-Host "Package ID: $packageId" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Could not extract package ID" -ForegroundColor Red
    Write-Host "Query result: $queryResult" -ForegroundColor Gray
    exit 1
}

# Step 4: Approve chaincode for all orgs
Write-Host "`n[4/6] Approving chaincode for all organizations..." -ForegroundColor Cyan

# Approve for Forensics
Write-Host "  -> Approving for Forensics..." -ForegroundColor Gray
$approveCmd = @"
export CORE_PEER_LOCALMSPID=$FORENSICS_MSP && \
export CORE_PEER_ADDRESS=$FORENSICS_PEER && \
export CORE_PEER_MSPCONFIGPATH=$FORENSICS_ADMIN_MSP && \
export CORE_PEER_TLS_ENABLED=true && \
export CORE_PEER_TLS_ROOTCERT_FILE=$FORENSICS_TLS_CERT && \
peer lifecycle chaincode approveformyorg \
  -o $ORDERER_ADDRESS \
  --ordererTLSHostnameOverride orderer.blocktrace.com \
  --tls --cafile $ORDERER_TLS_CERT \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --package-id $packageId \
  --sequence $CC_SEQUENCE
"@

docker exec peer0.forensics.blocktrace.com sh -c $approveCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "     [OK] Approved by Forensics" -ForegroundColor Green
} else {
    Write-Host "     [FAIL] Approval failed for Forensics" -ForegroundColor Red
    exit 1
}

# Approve for Police
Write-Host "  -> Approving for Police..." -ForegroundColor Gray
$approveCmd = @"
export CORE_PEER_LOCALMSPID=$POLICE_MSP && \
export CORE_PEER_ADDRESS=$POLICE_PEER && \
export CORE_PEER_MSPCONFIGPATH=$POLICE_ADMIN_MSP && \
export CORE_PEER_TLS_ENABLED=true && \
export CORE_PEER_TLS_ROOTCERT_FILE=$POLICE_TLS_CERT && \
peer lifecycle chaincode approveformyorg \
  -o $ORDERER_ADDRESS \
  --ordererTLSHostnameOverride orderer.blocktrace.com \
  --tls --cafile $ORDERER_TLS_CERT \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --package-id $packageId \
  --sequence $CC_SEQUENCE
"@

docker exec peer0.police.blocktrace.com sh -c $approveCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "     [OK] Approved by Police" -ForegroundColor Green
} else {
    Write-Host "     [FAIL] Approval failed for Police" -ForegroundColor Red
    exit 1
}

# Approve for Court
Write-Host "  -> Approving for Court..." -ForegroundColor Gray
$approveCmd = @"
export CORE_PEER_LOCALMSPID=$COURT_MSP && \
export CORE_PEER_ADDRESS=$COURT_PEER && \
export CORE_PEER_MSPCONFIGPATH=$COURT_ADMIN_MSP && \
export CORE_PEER_TLS_ENABLED=true && \
export CORE_PEER_TLS_ROOTCERT_FILE=$COURT_TLS_CERT && \
peer lifecycle chaincode approveformyorg \
  -o $ORDERER_ADDRESS \
  --ordererTLSHostnameOverride orderer.blocktrace.com \
  --tls --cafile $ORDERER_TLS_CERT \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --package-id $packageId \
  --sequence $CC_SEQUENCE
"@

docker exec peer0.court.blocktrace.com sh -c $approveCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "     [OK] Approved by Court" -ForegroundColor Green
} else {
    Write-Host "     [FAIL] Approval failed for Court" -ForegroundColor Red
    exit 1
}

# Step 5: Check commit readiness
Write-Host "`n[5/6] Checking commit readiness..." -ForegroundColor Cyan

$checkCmd = @"
export CORE_PEER_LOCALMSPID=$FORENSICS_MSP && \
export CORE_PEER_ADDRESS=$FORENSICS_PEER && \
export CORE_PEER_MSPCONFIGPATH=$FORENSICS_ADMIN_MSP && \
export CORE_PEER_TLS_ENABLED=true && \
export CORE_PEER_TLS_ROOTCERT_FILE=$FORENSICS_TLS_CERT && \
peer lifecycle chaincode checkcommitreadiness \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --sequence $CC_SEQUENCE \
  --output json
"@

$readyResult = docker exec peer0.forensics.blocktrace.com sh -c $checkCmd
Write-Host $readyResult -ForegroundColor Gray

# Step 6: Commit chaincode definition
Write-Host "`n[6/6] Committing chaincode to channel..." -ForegroundColor Cyan

$commitCmd = @"
export CORE_PEER_LOCALMSPID=$FORENSICS_MSP && \
export CORE_PEER_ADDRESS=$FORENSICS_PEER && \
export CORE_PEER_MSPCONFIGPATH=$FORENSICS_ADMIN_MSP && \
export CORE_PEER_TLS_ENABLED=true && \
export CORE_PEER_TLS_ROOTCERT_FILE=$FORENSICS_TLS_CERT && \
peer lifecycle chaincode commit \
  -o $ORDERER_ADDRESS \
  --ordererTLSHostnameOverride orderer.blocktrace.com \
  --tls --cafile $ORDERER_TLS_CERT \
  --channelID $CHANNEL_NAME \
  --name $CC_NAME \
  --version $CC_VERSION \
  --sequence $CC_SEQUENCE \
  --peerAddresses $FORENSICS_PEER --tlsRootCertFiles $FORENSICS_TLS_CERT \
  --peerAddresses $POLICE_PEER --tlsRootCertFiles $POLICE_TLS_CERT \
  --peerAddresses $COURT_PEER --tlsRootCertFiles $COURT_TLS_CERT
"@

docker exec peer0.forensics.blocktrace.com sh -c $commitCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Chaincode committed successfully!" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Chaincode commit failed" -ForegroundColor Red
    exit 1
}

# Verify deployment
Write-Host "`n[Verification] Querying committed chaincode..." -ForegroundColor Cyan

$verifyCmd = @"
export CORE_PEER_LOCALMSPID=$FORENSICS_MSP && \
export CORE_PEER_ADDRESS=$FORENSICS_PEER && \
export CORE_PEER_MSPCONFIGPATH=$FORENSICS_ADMIN_MSP && \
peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME
"@

docker exec peer0.forensics.blocktrace.com sh -c $verifyCmd

Write-Host "`n=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "Chaincode '$CC_NAME' version $CC_VERSION is now active on channel '$CHANNEL_NAME'" -ForegroundColor Cyan
Write-Host "`nNext step: Run test-chaincode.ps1 to invoke functions" -ForegroundColor Yellow
