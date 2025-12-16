# Deploy Traditional Chaincode - Fixed Version
# Single-line commands to avoid PowerShell heredoc issues

Write-Host "`n=== BlockTrace Traditional Chaincode Deployment ===" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# Configuration
$CHANNEL_NAME = "blocktrace-channel"
$CC_NAME = "evidence"
$CC_VERSION = "1.0"
$CC_SEQUENCE = 1

Write-Host "`n[1/6] Packaging chaincode..." -ForegroundColor Cyan
docker exec peer0.forensics.blocktrace.com sh -c "cd /tmp && peer lifecycle chaincode package evidence.tar.gz --path /opt/gopath/src/github.com/chaincode/evidence --lang node --label evidence_1.0"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Packaged" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Packaging failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/6] Installing on all peers..." -ForegroundColor Cyan

Write-Host "  -> Forensics..." -ForegroundColor Gray
docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp && peer lifecycle chaincode install /tmp/evidence.tar.gz"

if ($LASTEXITCODE -ne 0) { Write-Host "[FAIL] Forensics" -ForegroundColor Red; exit 1 }
Write-Host "     [OK]" -ForegroundColor Green

Write-Host "  -> Police (packaging)..." -ForegroundColor Gray
docker exec peer0.police.blocktrace.com sh -c "cd /tmp && peer lifecycle chaincode package evidence.tar.gz --path /opt/gopath/src/github.com/chaincode/evidence --lang node --label evidence_1.0"
docker exec peer0.police.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=PoliceOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@police.blocktrace.com/msp && peer lifecycle chaincode install /tmp/evidence.tar.gz"

if ($LASTEXITCODE -ne 0) { Write-Host "[FAIL] Police" -ForegroundColor Red; exit 1 }
Write-Host "     [OK]" -ForegroundColor Green

Write-Host "  -> Court (packaging)..." -ForegroundColor Gray
docker exec peer0.court.blocktrace.com sh -c "cd /tmp && peer lifecycle chaincode package evidence.tar.gz --path /opt/gopath/src/github.com/chaincode/evidence --lang node --label evidence_1.0"
docker exec peer0.court.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=CourtOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@court.blocktrace.com/msp && peer lifecycle chaincode install /tmp/evidence.tar.gz"

if ($LASTEXITCODE -ne 0) { Write-Host "[FAIL] Court" -ForegroundColor Red; exit 1 }
Write-Host "     [OK]" -ForegroundColor Green

Write-Host "`n[3/6] Querying package ID..." -ForegroundColor Cyan
$queryResult = docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp && peer lifecycle chaincode queryinstalled"

$packageId = ""
if ($queryResult -match "evidence_1\.0:([a-f0-9]+)") {
    $packageId = "evidence_1.0:$($matches[1])"
    Write-Host "Package ID: $packageId" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Could not find package ID" -ForegroundColor Red
    Write-Host $queryResult -ForegroundColor Gray
    exit 1
}

Write-Host "`n[4/6] Approving for all orgs..." -ForegroundColor Cyan

Write-Host "  -> Forensics..." -ForegroundColor Gray
docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp && export CORE_PEER_TLS_ENABLED=true && export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/peers/peer0.forensics.blocktrace.com/tls/ca.crt && peer lifecycle chaincode approveformyorg -o orderer.blocktrace.com:7050 --ordererTLSHostnameOverride orderer.blocktrace.com --tls --cafile /etc/hyperledger/fabric/orderer/msp/tlscacerts/tlsca.blocktrace.com-cert.pem --channelID blocktrace-channel --name evidence --version 1.0 --package-id $packageId --sequence 1"

if ($LASTEXITCODE -ne 0) { Write-Host "[FAIL] Forensics approval" -ForegroundColor Red; exit 1 }
Write-Host "     [OK]" -ForegroundColor Green

Write-Host "  -> Police..." -ForegroundColor Gray
docker exec peer0.police.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=PoliceOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@police.blocktrace.com/msp && export CORE_PEER_TLS_ENABLED=true && export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/peers/peer0.police.blocktrace.com/tls/ca.crt && peer lifecycle chaincode approveformyorg -o orderer.blocktrace.com:7050 --ordererTLSHostnameOverride orderer.blocktrace.com --tls --cafile /etc/hyperledger/fabric/orderer/msp/tlscacerts/tlsca.blocktrace.com-cert.pem --channelID blocktrace-channel --name evidence --version 1.0 --package-id $packageId --sequence 1"

if ($LASTEXITCODE -ne 0) { Write-Host "[FAIL] Police approval" -ForegroundColor Red; exit 1 }
Write-Host "     [OK]" -ForegroundColor Green

Write-Host "  -> Court..." -ForegroundColor Gray
docker exec peer0.court.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=CourtOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@court.blocktrace.com/msp && export CORE_PEER_TLS_ENABLED=true && export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/peers/peer0.court.blocktrace.com/tls/ca.crt && peer lifecycle chaincode approveformyorg -o orderer.blocktrace.com:7050 --ordererTLSHostnameOverride orderer.blocktrace.com --tls --cafile /etc/hyperledger/fabric/orderer/msp/tlscacerts/tlsca.blocktrace.com-cert.pem --channelID blocktrace-channel --name evidence --version 1.0 --package-id $packageId --sequence 1"

if ($LASTEXITCODE -ne 0) { Write-Host "[FAIL] Court approval" -ForegroundColor Red; exit 1 }
Write-Host "     [OK]" -ForegroundColor Green

Write-Host "`n[5/6] Checking commit readiness..." -ForegroundColor Cyan
docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp && peer lifecycle chaincode checkcommitreadiness --channelID blocktrace-channel --name evidence --version 1.0 --sequence 1 --output json"

Write-Host "`n[6/6] Committing chaincode..." -ForegroundColor Cyan
docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp && export CORE_PEER_TLS_ENABLED=true && export CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/peers/peer0.forensics.blocktrace.com/tls/ca.crt && peer lifecycle chaincode commit -o orderer.blocktrace.com:7050 --ordererTLSHostnameOverride orderer.blocktrace.com --tls --cafile /etc/hyperledger/fabric/orderer/msp/tlscacerts/tlsca.blocktrace.com-cert.pem --channelID blocktrace-channel --name evidence --version 1.0 --sequence 1 --peerAddresses peer0.forensics.blocktrace.com:7051 --tlsRootCertFiles /etc/hyperledger/fabric/peers/peer0.forensics.blocktrace.com/tls/ca.crt --peerAddresses peer0.police.blocktrace.com:9051 --tlsRootCertFiles /etc/hyperledger/fabric/peers/peer0.police.blocktrace.com/tls/ca.crt --peerAddresses peer0.court.blocktrace.com:11051 --tlsRootCertFiles /etc/hyperledger/fabric/peers/peer0.court.blocktrace.com/tls/ca.crt"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[OK] Chaincode committed!" -ForegroundColor Green
} else {
    Write-Host "`n[FAIL] Commit failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n[Verification] Querying committed chaincode..." -ForegroundColor Cyan
docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp && peer lifecycle chaincode querycommitted --channelID blocktrace-channel"

Write-Host "`n=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "Run test-chaincode.ps1 to test functions" -ForegroundColor Yellow
