#!/bin/bash
# Approve and Commit Chaincode Definition
# Run this after install-chaincode.sh

set -e

# You'll need to replace this with the actual package ID from queryinstalled output
PACKAGE_ID=${1:-"evidence_1.0:59d480b000ff21ee2b3224fbeca21e77152e913984260dac302724eea5fe8301"}

echo "=== Approving Chaincode for All Organizations ==="
echo "Using Package ID: $PACKAGE_ID"
echo ""

# Approve for Forensics Org
echo "Approving for ForensicsOrg..."
docker exec peer0.forensics.blocktrace.com bash -c "
  export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
  export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
  export CORE_PEER_ADDRESS=peer0.forensics.blocktrace.com:7051
  
  peer lifecycle chaincode approveformyorg \
    -o orderer.blocktrace.com:7050 \
    --channelID blocktrace-channel \
    --name evidence \
    --version 1.0 \
    --package-id ${PACKAGE_ID} \
    --sequence 1 \
    --tls \
    --cafile /etc/hyperledger/fabric/orderer-ca.pem
"

# Approve for Police Org
echo ""
echo "Approving for PoliceOrg..."
docker exec peer0.police.blocktrace.com bash -c "
  export CORE_PEER_LOCALMSPID=PoliceOrgMSP
  export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@police.blocktrace.com/msp
  export CORE_PEER_ADDRESS=peer0.police.blocktrace.com:9051
  
  peer lifecycle chaincode approveformyorg \
    -o orderer.blocktrace.com:7050 \
    --channelID blocktrace-channel \
    --name evidence \
    --version 1.0 \
    --package-id ${PACKAGE_ID} \
    --sequence 1 \
    --tls \
    --cafile /etc/hyperledger/fabric/orderer-ca.pem
"

# Approve for Court Org
echo ""
echo "Approving for CourtOrg..."
docker exec peer0.court.blocktrace.com bash -c "
  export CORE_PEER_LOCALMSPID=CourtOrgMSP
  export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@court.blocktrace.com/msp
  export CORE_PEER_ADDRESS=peer0.court.blocktrace.com:11051
  
  peer lifecycle chaincode approveformyorg \
    -o orderer.blocktrace.com:7050 \
    --channelID blocktrace-channel \
    --name evidence \
    --version 1.0 \
    --package-id ${PACKAGE_ID} \
    --sequence 1 \
    --tls \
    --cafile /etc/hyperledger/fabric/orderer-ca.pem
"

# Check commit readiness
echo ""
echo "Checking commit readiness..."
docker exec peer0.forensics.blocktrace.com bash -c "
  export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
  export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
  
  peer lifecycle chaincode checkcommitreadiness \
    --channelID blocktrace-channel \
    --name evidence \
    --version 1.0 \
    --sequence 1 \
    -o orderer.blocktrace.com:7050 \
    --tls \
    --cafile /etc/hyperledger/fabric/orderer-ca.pem
"

# Commit the chaincode
echo ""
echo "Committing chaincode definition to channel..."
docker exec peer0.forensics.blocktrace.com bash -c "
  export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
  export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
  
  peer lifecycle chaincode commit \
    -o orderer.blocktrace.com:7050 \
    --channelID blocktrace-channel \
    --name evidence \
    --version 1.0 \
    --sequence 1 \
    --tls \
    --cafile /etc/hyperledger/fabric/orderer-ca.pem \
    --peerAddresses peer0.forensics.blocktrace.com:7051 \
    --peerAddresses peer0.police.blocktrace.com:9051 \
    --peerAddresses peer0.court.blocktrace.com:11051
"

echo ""
echo "=== Chaincode Deployment Complete ==="
echo "Verify with: docker exec peer0.forensics.blocktrace.com peer lifecycle chaincode querycommitted -C blocktrace-channel"
