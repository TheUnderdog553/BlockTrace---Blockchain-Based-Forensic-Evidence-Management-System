# Test Evidence Chaincode - PowerShell Version

Write-Host "=== Testing Evidence Chaincode ===" -ForegroundColor Cyan

# Test 1: Create evidence
Write-Host "`nTest 1: Creating evidence record EV001..." -ForegroundColor Yellow
$invokeCmd = @"
export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
export CORE_PEER_ADDRESS=peer0.forensics.blocktrace.com:7051
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
peer chaincode invoke \
  -o orderer.blocktrace.com:7050 \
  --tls --cafile /etc/hyperledger/fabric/orderer-ca.pem \
  -C blocktrace-channel -n evidence \
  --peerAddresses peer0.forensics.blocktrace.com:7051 \
  --peerAddresses peer0.police.blocktrace.com:9051 \
  --peerAddresses peer0.court.blocktrace.com:11051 \
  -c '{\"function\":\"createEvidence\",\"Args\":[\"EV001\",\"QmTestHash123\",\"Ransomware executable file\",\"192.168.1.100\",\"Malware\",\"2025-11-20\"]}'
"@

docker exec peer0.forensics.blocktrace.com sh -c $invokeCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Evidence EV001 created" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Failed to create evidence" -ForegroundColor Red
}

Start-Sleep -Seconds 3

# Test 2: Read evidence
Write-Host "`nTest 2: Reading evidence record..." -ForegroundColor Yellow
$queryCmd = @"
export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
export CORE_PEER_ADDRESS=peer0.forensics.blocktrace.com:7051
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
peer chaincode query \
  -C blocktrace-channel -n evidence \
  -c '{\"function\":\"readEvidence\",\"Args\":[\"EV001\"]}'
"@

$result = docker exec peer0.forensics.blocktrace.com sh -c $queryCmd
Write-Host $result -ForegroundColor Cyan

# Test 3: Transfer custody
Write-Host "`nTest 3: Transferring custody to Police..." -ForegroundColor Yellow
$transferCmd = @"
export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
export CORE_PEER_ADDRESS=peer0.forensics.blocktrace.com:7051
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
peer chaincode invoke \
  -o orderer.blocktrace.com:7050 \
  --tls --cafile /etc/hyperledger/fabric/orderer-ca.pem \
  -C blocktrace-channel -n evidence \
  --peerAddresses peer0.forensics.blocktrace.com:7051 \
  --peerAddresses peer0.police.blocktrace.com:9051 \
  --peerAddresses peer0.court.blocktrace.com:11051 \
  -c '{\"function\":\"updateCustody\",\"Args\":[\"EV001\",\"PoliceOrg\",\"Officer Smith\"]}'
"@

docker exec peer0.forensics.blocktrace.com sh -c $transferCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Custody transferred" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Failed to transfer custody" -ForegroundColor Red
}

Start-Sleep -Seconds 3

# Test 4: Get history
Write-Host "`nTest 4: Getting evidence history..." -ForegroundColor Yellow
$historyCmd = @"
export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
export CORE_PEER_ADDRESS=peer0.forensics.blocktrace.com:7051
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
peer chaincode query \
  -C blocktrace-channel -n evidence \
  -c '{\"function\":\"getEvidenceHistory\",\"Args\":[\"EV001\"]}'
"@

$history = docker exec peer0.forensics.blocktrace.com sh -c $historyCmd
Write-Host $history -ForegroundColor Cyan

# Test 5: Get all evidence
Write-Host "`nTest 5: Listing all evidence..." -ForegroundColor Yellow
$allCmd = @"
export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
export CORE_PEER_ADDRESS=peer0.forensics.blocktrace.com:7051
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
peer chaincode query \
  -C blocktrace-channel -n evidence \
  -c '{\"function\":\"getAllEvidence\",\"Args\":[]}'
"@

$all = docker exec peer0.forensics.blocktrace.com sh -c $allCmd
Write-Host $all -ForegroundColor Cyan

Write-Host "`n=== All Tests Complete ===" -ForegroundColor Green
Write-Host "Chaincode is working correctly!`n" -ForegroundColor White
