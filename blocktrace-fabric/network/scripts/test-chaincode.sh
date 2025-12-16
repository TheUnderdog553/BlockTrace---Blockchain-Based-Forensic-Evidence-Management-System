#!/bin/bash
# Test Evidence Chaincode Functions
# Run this after approve-commit-chaincode.sh

set -e

echo "=== Testing Evidence Chaincode ==="
echo ""

# Test 1: Create Evidence
echo "Test 1: Creating evidence record..."
docker exec peer0.forensics.blocktrace.com bash -c '
  export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
  export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
  
  peer chaincode invoke \
    -o orderer.blocktrace.com:7050 \
    --tls \
    --cafile /etc/hyperledger/fabric/orderer-ca.pem \
    -C blocktrace-channel \
    -n evidence \
    --peerAddresses peer0.forensics.blocktrace.com:7051 \
    --peerAddresses peer0.police.blocktrace.com:9051 \
    -c '"'"'{"function":"createEvidence","Args":["EV001","QmTestHash123","Ransomware executable","192.168.1.100","MALWARE","2025-11-19T10:00:00Z"]}'"'"'
'

echo ""
echo "Waiting 3 seconds for transaction to commit..."
sleep 3

# Test 2: Read Evidence
echo ""
echo "Test 2: Reading evidence record..."
docker exec peer0.forensics.blocktrace.com bash -c '
  export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
  export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
  
  peer chaincode query \
    -C blocktrace-channel \
    -n evidence \
    -c '"'"'{"function":"readEvidence","Args":["EV001"]}'"'"'
'

# Test 3: Update Custody
echo ""
echo "Test 3: Transferring custody to Police..."
docker exec peer0.forensics.blocktrace.com bash -c '
  export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
  export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
  
  peer chaincode invoke \
    -o orderer.blocktrace.com:7050 \
    --tls \
    --cafile /etc/hyperledger/fabric/orderer-ca.pem \
    -C blocktrace-channel \
    -n evidence \
    --peerAddresses peer0.forensics.blocktrace.com:7051 \
    --peerAddresses peer0.police.blocktrace.com:9051 \
    -c '"'"'{"function":"updateCustody","Args":["EV001","PoliceOrgMSP","Officer John Doe"]}'"'"'
'

sleep 3

# Test 4: Get Evidence History
echo ""
echo "Test 4: Getting evidence history (chain of custody)..."
docker exec peer0.police.blocktrace.com bash -c '
  export CORE_PEER_LOCALMSPID=PoliceOrgMSP
  export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@police.blocktrace.com/msp
  
  peer chaincode query \
    -C blocktrace-channel \
    -n evidence \
    -c '"'"'{"function":"getEvidenceHistory","Args":["EV001"]}'"'"'
'

# Test 5: Get All Evidence
echo ""
echo "Test 5: Listing all evidence..."
docker exec peer0.court.blocktrace.com bash -c '
  export CORE_PEER_LOCALMSPID=CourtOrgMSP
  export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@court.blocktrace.com/msp
  
  peer chaincode query \
    -C blocktrace-channel \
    -n evidence \
    -c '"'"'{"function":"getAllEvidence","Args":[]}'"'"'
'

echo ""
echo "=== All Tests Complete ==="
