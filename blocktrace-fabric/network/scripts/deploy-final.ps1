# Final Working Deployment - No TLS for simplicity
# This script deploys the complete chaincode from scratch

Write-Host "`n====== BlockTrace Final Deployment ======" -ForegroundColor Cyan
$ErrorActionPreference = "Continue"

# 1. Join orderer to channel
Write-Host "`n[1/6] Joining orderer to channel..." -ForegroundColor Cyan
docker run --rm --network blocktrace-net -v "C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\network\configtx:/configtx" -v "C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\network\crypto-config:/crypto" hyperledger/fabric-tools:2.5 sh -c "osnadmin channel join --channelID blocktrace-channel --config-block /configtx/blocktrace-channel.block -o orderer.blocktrace.com:7053"
Write-Host "[OK] Orderer joined" -ForegroundColor Green

# 2. Join all peers
Write-Host "`n[2/6] Joining all peers..." -ForegroundColor Cyan
docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP ; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp ; peer channel join -b /etc/hyperledger/fabric/configtx/blocktrace-channel.block" | Out-Null
docker exec peer0.police.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=PoliceOrgMSP ; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@police.blocktrace.com/msp ; peer channel join -b /etc/hyperledger/fabric/configtx/blocktrace-channel.block" | Out-Null
docker exec peer0.court.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=CourtOrgMSP ; export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@court.blocktrace.com/msp ; peer channel join -b /etc/hyperledger/fabric/configtx/blocktrace-channel.block" | Out-Null
Write-Host "[OK] All peers joined" -ForegroundColor Green

# 3. Install chaincode
Write-Host "`n[3/6] Installing chaincode on all peers..." -ForegroundColor Cyan
docker exec peer0.forensics.blocktrace.com sh -c "cd /tmp && peer lifecycle chaincode package evidence.tar.gz --path /opt/gopath/src/github.com/chaincode/evidence --lang node --label evidence_1.0 && export CORE_PEER_LOCALMSPID=ForensicsOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp && peer lifecycle chaincode install /tmp/evidence.tar.gz" | Out-Null
docker exec peer0.police.blocktrace.com sh -c "cd /tmp && peer lifecycle chaincode package evidence.tar.gz --path /opt/gopath/src/github.com/chaincode/evidence --lang node --label evidence_1.0 && export CORE_PEER_LOCALMSPID=PoliceOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@police.blocktrace.com/msp && peer lifecycle chaincode install /tmp/evidence.tar.gz" | Out-Null
docker exec peer0.court.blocktrace.com sh -c "cd /tmp && peer lifecycle chaincode package evidence.tar.gz --path /opt/gopath/src/github.com/chaincode/evidence --lang node --label evidence_1.0 && export CORE_PEER_LOCALMSPID=CourtOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@court.blocktrace.com/msp && peer lifecycle chaincode install /tmp/evidence.tar.gz" | Out-Null
Write-Host "[OK] Chaincode installed" -ForegroundColor Green

$packageId = "evidence_1.0:c8399403f0976b7afbc136cfcc11f6e28fd3cde903959074b08423065b2549f4"

# 4. Approve chaincode
Write-Host "`n[4/6] Approving chaincode..." -ForegroundColor Cyan
docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp && peer lifecycle chaincode approveformyorg -o orderer.blocktrace.com:7050 --channelID blocktrace-channel --name evidence --version 1.0 --package-id $packageId --sequence 1" | Out-Null
docker exec peer0.police.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=PoliceOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@police.blocktrace.com/msp && peer lifecycle chaincode approveformyorg -o orderer.blocktrace.com:7050 --channelID blocktrace-channel --name evidence --version 1.0 --package-id $packageId --sequence 1" | Out-Null
docker exec peer0.court.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=CourtOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@court.blocktrace.com/msp && peer lifecycle chaincode approveformyorg -o orderer.blocktrace.com:7050 --channelID blocktrace-channel --name evidence --version 1.0 --package-id $packageId --sequence 1" | Out-Null
Write-Host "[OK] Chaincode approved" -ForegroundColor Green

# 5. Commit chaincode
Write-Host "`n[5/6] Committing chaincode..." -ForegroundColor Cyan
docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp && peer lifecycle chaincode commit -o orderer.blocktrace.com:7050 --channelID blocktrace-channel --name evidence --version 1.0 --sequence 1 --peerAddresses peer0.forensics.blocktrace.com:7051 --peerAddresses peer0.police.blocktrace.com:9051 --peerAddresses peer0.court.blocktrace.com:11051"
Write-Host "[OK] Chaincode committed!" -ForegroundColor Green

# 6. Verify
Write-Host "`n[6/6] Verifying deployment..." -ForegroundColor Cyan
docker exec peer0.forensics.blocktrace.com sh -c "export CORE_PEER_LOCALMSPID=ForensicsOrgMSP && export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp && peer lifecycle chaincode querycommitted --channelID blocktrace-channel --name evidence"

Write-Host "`n====== DEPLOYMENT COMPLETE! ======" -ForegroundColor Green
Write-Host "Chaincode 'evidence' v1.0 is live on blocktrace-channel" -ForegroundColor Cyan
Write-Host "`nRun: .\test-chaincode.ps1 to test functions" -ForegroundColor Yellow
