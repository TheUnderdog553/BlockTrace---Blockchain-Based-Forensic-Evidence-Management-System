# Complete Chaincode Deployment Script
# Joins peers to channel, installs chaincode, approves, and commits

Write-Host "`n=== BlockTrace Complete Deployment ===" -ForegroundColor Cyan
$ErrorActionPreference = "Stop"

# Step 1: Join peers to channel
Write-Host "`n[1/7] Joining peers to channel..." -ForegroundColor Cyan

Write-Host "  -> Forensics..." -ForegroundColor Gray
docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP ; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp ; peer channel join -b /etc/hyperledger/fabric/configtx/blocktrace-channel.block"
if ($LASTEXITCODE -eq 0) { Write-Host "     [OK]" -ForegroundColor Green } else { exit 1 }

Write-Host "  -> Police..." -ForegroundColor Gray
docker exec peer0.police.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=PoliceOrgMSP ; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@police.blocktrace.com/msp ; peer channel join -b /etc/hyperledger/fabric/configtx/blocktrace-channel.block"
if ($LASTEXITCODE -eq 0) { Write-Host "     [OK]" -ForegroundColor Green } else { exit 1 }

Write-Host "  -> Court..." -ForegroundColor Gray
docker exec peer0.court.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=CourtOrgMSP ; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@court.blocktrace.com/msp ; peer channel join -b /etc/hyperledger/fabric/configtx/blocktrace-channel.block"
if ($LASTEXITCODE -eq 0) { Write-Host "     [OK]" -ForegroundColor Green } else { exit 1 }

# Step 2: Package and install chaincode on all peers
Write-Host "`n[2/7] Installing chaincode on all peers..." -ForegroundColor Cyan

Write-Host "  -> Forensics..." -ForegroundColor Gray
docker exec peer0.forensics.blocktrace.com sh -c "cd /tmp && peer lifecycle chaincode package evidence.tar.gz --path /opt/gopath/src/github.com/chaincode/evidence --lang node --label evidence_1.0 ; export CORE_PEER_LOCALMSPID=ForensicsOrgMSP ; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp ; peer lifecycle chaincode install /tmp/evidence.tar.gz"
if ($LASTEXITCODE -eq 0) { Write-Host "     [OK]" -ForegroundColor Green } else { exit 1 }

Write-Host "  -> Police..." -ForegroundColor Gray
docker exec peer0.police.blocktrace.com sh -c "cd /tmp && peer lifecycle chaincode package evidence.tar.gz --path /opt/gopath/src/github.com/chaincode/evidence --lang node --label evidence_1.0 ; export CORE_PEER_LOCALMSPID=PoliceOrgMSP ; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@police.blocktrace.com/msp ; peer lifecycle chaincode install /tmp/evidence.tar.gz"
if ($LASTEXITCODE -eq 0) { Write-Host "     [OK]" -ForegroundColor Green } else { exit 1 }

Write-Host "  -> Court..." -ForegroundColor Gray
docker exec peer0.court.blocktrace.com sh -c "cd /tmp && peer lifecycle chaincode package evidence.tar.gz --path /opt/gopath/src/github.com/chaincode/evidence --lang node --label evidence_1.0 ; export CORE_PEER_LOCALMSPID=CourtOrgMSP ; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@court.blocktrace.com/msp ; peer lifecycle chaincode install /tmp/evidence.tar.gz"
if ($LASTEXITCODE -eq 0) { Write-Host "     [OK]" -ForegroundColor Green } else { exit 1 }

# Step 3: Get package ID
Write-Host "`n[3/7] Querying package ID..." -ForegroundColor Cyan
$queryResult = docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP ; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp ; peer lifecycle chaincode queryinstalled" | Out-String

$packageId = "evidence_1.0:c8399403f0976b7afbc136cfcc11f6e28fd3cde903959074b08423065b2549f4"
Write-Host "Package ID: $packageId" -ForegroundColor Green

# Step 4: Approve for all organizations
Write-Host "`n[4/7] Approving chaincode for all orgs..." -ForegroundColor Cyan

Write-Host "  -> Forensics..." -ForegroundColor Gray
docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP ; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp ; peer lifecycle chaincode approveformyorg -o orderer.blocktrace.com:7050 --ordererTLSHostnameOverride orderer.blocktrace.com --tls --cafile /etc/hyperledger/fabric/orderer/tlscacerts/tlsca.blocktrace.com-cert.pem --channelID blocktrace-channel --name evidence --version 1.0 --package-id $packageId --sequence 1"
if ($LASTEXITCODE -eq 0) { Write-Host "     [OK]" -ForegroundColor Green } else { exit 1 }

Write-Host "  -> Police..." -ForegroundColor Gray
docker exec peer0.police.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=PoliceOrgMSP ; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@police.blocktrace.com/msp ; peer lifecycle chaincode approveformyorg -o orderer.blocktrace.com:7050 --ordererTLSHostnameOverride orderer.blocktrace.com --tls --cafile /etc/hyperledger/fabric/orderer/tlscacerts/tlsca.blocktrace.com-cert.pem --channelID blocktrace-channel --name evidence --version 1.0 --package-id $packageId --sequence 1"
if ($LASTEXITCODE -eq 0) { Write-Host "     [OK]" -ForegroundColor Green } else { exit 1 }

Write-Host "  -> Court..." -ForegroundColor Gray
docker exec peer0.court.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=CourtOrgMSP ; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@court.blocktrace.com/msp ; peer lifecycle chaincode approveformyorg -o orderer.blocktrace.com:7050 --ordererTLSHostnameOverride orderer.blocktrace.com --tls --cafile /etc/hyperledger/fabric/orderer/tlscacerts/tlsca.blocktrace.com-cert.pem --channelID blocktrace-channel --name evidence --version 1.0 --package-id $packageId --sequence 1"
if ($LASTEXITCODE -eq 0) { Write-Host "     [OK]" -ForegroundColor Green } else { exit 1 }

# Step 5: Check commit readiness
Write-Host "`n[5/7] Checking commit readiness..." -ForegroundColor Cyan
docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP ; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp ; peer lifecycle chaincode checkcommitreadiness --channelID blocktrace-channel --name evidence --version 1.0 --sequence 1 --output json"

# Step 6: Commit chaincode
Write-Host "`n[6/7] Committing chaincode..." -ForegroundColor Cyan
docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP ; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp ; peer lifecycle chaincode commit -o orderer.blocktrace.com:7050 --ordererTLSHostnameOverride orderer.blocktrace.com --tls --cafile /etc/hyperledger/fabric/orderer/tlscacerts/tlsca.blocktrace.com-cert.pem --channelID blocktrace-channel --name evidence --version 1.0 --sequence 1 --peerAddresses peer0.forensics.blocktrace.com:7051 --tlsRootCertFiles /etc/hyperledger/fabric/peers/peer0.forensics.blocktrace.com/tls/ca.crt --peerAddresses peer0.police.blocktrace.com:9051 --tlsRootCertFiles /etc/hyperledger/fabric/peers/peer0.police.blocktrace.com/tls/ca.crt --peerAddresses peer0.court.blocktrace.com:11051 --tlsRootCertFiles /etc/hyperledger/fabric/peers/peer0.court.blocktrace.com/tls/ca.crt"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Committed!" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Commit failed" -ForegroundColor Red
    exit 1
}

# Step 7: Verify
Write-Host "`n[7/7] Verifying deployment..." -ForegroundColor Cyan
docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP ; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp ; peer lifecycle chaincode querycommitted --channelID blocktrace-channel"

Write-Host "`n=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "Chaincode 'evidence' v1.0 is deployed and ready" -ForegroundColor Cyan
Write-Host "`nNext: Run test-chaincode.ps1 to test functions" -ForegroundColor Yellow
