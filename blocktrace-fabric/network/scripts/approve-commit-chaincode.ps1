# Approve and Commit Chaincode - PowerShell Version
param(
    [Parameter(Mandatory=$true)]
    [string]$PackageId
)

Write-Host "=== Approving and Committing Evidence Chaincode ===" -ForegroundColor Cyan
Write-Host "Package ID: $PackageId`n" -ForegroundColor White

# Function to approve chaincode for an org
function Approve-Chaincode {
    param (
        [string]$PeerContainer,
        [string]$MSP,
        [string]$MSPPath,
        [string]$PeerAddress,
        [string]$PackageId
    )
    
    Write-Host "Approving for $MSP..." -ForegroundColor Yellow
    
    $approveCmd = @"
export CORE_PEER_LOCALMSPID=$MSP
export CORE_PEER_ADDRESS=$PeerAddress
export CORE_PEER_MSPCONFIGPATH=$MSPPath
peer lifecycle chaincode approveformyorg \
  --channelID blocktrace-channel \
  --name evidence \
  --version 1.0 \
  --package-id $PackageId \
  --sequence 1 \
  --tls \
  --cafile /etc/hyperledger/fabric/orderer-ca.pem \
  --orderer orderer.blocktrace.com:7050
"@
    
    docker exec $PeerContainer sh -c $approveCmd
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Approved by $MSP" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[FAIL] Approval failed for $MSP" -ForegroundColor Red
        return $false
    }
}

# Approve for all orgs
$success = $true
$success = $success -and (Approve-Chaincode -PeerContainer "peer0.forensics.blocktrace.com" -MSP "ForensicsOrgMSP" -MSPPath "/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp" -PeerAddress "peer0.forensics.blocktrace.com:7051" -PackageId $PackageId)
$success = $success -and (Approve-Chaincode -PeerContainer "peer0.police.blocktrace.com" -MSP "PoliceOrgMSP" -MSPPath "/etc/hyperledger/fabric/users/Admin@police.blocktrace.com/msp" -PeerAddress "peer0.police.blocktrace.com:9051" -PackageId $PackageId)
$success = $success -and (Approve-Chaincode -PeerContainer "peer0.court.blocktrace.com" -MSP "CourtOrgMSP" -MSPPath "/etc/hyperledger/fabric/users/Admin@court.blocktrace.com/msp" -PeerAddress "peer0.court.blocktrace.com:11051" -PackageId $PackageId)

if (-not $success) {
    Write-Host "`n[FAIL] Approval failed!" -ForegroundColor Red
    exit 1
}

# Check commit readiness
Write-Host "`nChecking commit readiness..." -ForegroundColor Yellow
$checkCmd = @"
export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
export CORE_PEER_ADDRESS=peer0.forensics.blocktrace.com:7051
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
peer lifecycle chaincode checkcommitreadiness \
  --channelID blocktrace-channel \
  --name evidence \
  --version 1.0 \
  --sequence 1 \
  --tls \
  --cafile /etc/hyperledger/fabric/orderer-ca.pem
"@

$readiness = docker exec peer0.forensics.blocktrace.com sh -c $checkCmd
Write-Host $readiness

# Commit chaincode
Write-Host "`nCommitting chaincode to channel..." -ForegroundColor Yellow
$commitCmd = @"
export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
export CORE_PEER_ADDRESS=peer0.forensics.blocktrace.com:7051
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
peer lifecycle chaincode commit \
  --channelID blocktrace-channel \
  --name evidence \
  --version 1.0 \
  --sequence 1 \
  --tls \
  --cafile /etc/hyperledger/fabric/orderer-ca.pem \
  --orderer orderer.blocktrace.com:7050 \
  --peerAddresses peer0.forensics.blocktrace.com:7051 \
  --peerAddresses peer0.police.blocktrace.com:9051 \
  --peerAddresses peer0.court.blocktrace.com:11051
"@

docker exec peer0.forensics.blocktrace.com sh -c $commitCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[OK] Chaincode committed successfully!" -ForegroundColor Green
    
    # Query committed chaincode
    Write-Host "`nQuerying committed chaincode..." -ForegroundColor Yellow
    $queryCmd = @"
export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
export CORE_PEER_ADDRESS=peer0.forensics.blocktrace.com:7051
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
peer lifecycle chaincode querycommitted --channelID blocktrace-channel --name evidence
"@
    
    $committed = docker exec peer0.forensics.blocktrace.com sh -c $queryCmd
    Write-Host $committed
    
    Write-Host "`n=== Success! ===" -ForegroundColor Green
    Write-Host "Chaincode is now ready to use.`n" -ForegroundColor White
    Write-Host "Next step - Test the chaincode:" -ForegroundColor Cyan
    Write-Host ".\test-chaincode.ps1`n" -ForegroundColor White
} else {
    Write-Host "`n[FAIL] Commit failed!" -ForegroundColor Red
    exit 1
}
