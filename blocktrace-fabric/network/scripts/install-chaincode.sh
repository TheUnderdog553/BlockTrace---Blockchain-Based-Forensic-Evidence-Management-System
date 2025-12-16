#!/bin/bash
# Install External Chaincode on All Peers
# Run this from Git Bash to properly handle external chaincode installation

set -e

echo "=== Installing Evidence Chaincode on All Peers ==="

# Create package directly in Forensics peer container
echo ""
echo "Creating chaincode package..."
docker exec peer0.forensics.blocktrace.com bash -c '
  cd /tmp
  mkdir -p cc-package
  cd cc-package
  
  # Create metadata.json
  cat > metadata.json <<EOF
{
  "type": "external",
  "label": "evidence_1.0"
}
EOF
  
  # Create connection.json
  cat > connection.json <<EOF
{
  "address": "evidence-chaincode:7052",
  "dial_timeout": "10s",
  "tls_required": false
}
EOF
  
  # Create code.tar.gz
  tar czf code.tar.gz connection.json
  
  # Create final package
  tar czf evidence-external.tar.gz metadata.json code.tar.gz
  
  echo "✓ Package created"
'

# Install on Forensics Peer
echo ""
echo "Installing on Forensics Peer..."
docker exec peer0.forensics.blocktrace.com bash -c "
  export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
  export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
  peer lifecycle chaincode install /tmp/cc-package/evidence-external.tar.gz
"

# Copy package to Police Peer and install
echo ""
echo "Installing on Police Peer..."
docker exec peer0.forensics.blocktrace.com cat /tmp/cc-package/evidence-external.tar.gz | docker exec -i peer0.police.blocktrace.com sh -c 'cat > /tmp/evidence-external.tar.gz'
docker exec peer0.police.blocktrace.com bash -c "
  export CORE_PEER_LOCALMSPID=PoliceOrgMSP
  export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@police.blocktrace.com/msp
  peer lifecycle chaincode install /tmp/evidence-external.tar.gz
"

# Copy package to Court Peer and install
echo ""
echo "Installing on Court Peer..."
docker exec peer0.forensics.blocktrace.com cat /tmp/cc-package/evidence-external.tar.gz | docker exec -i peer0.court.blocktrace.com sh -c 'cat > /tmp/evidence-external.tar.gz'
docker exec peer0.court.blocktrace.com bash -c "
  export CORE_PEER_LOCALMSPID=CourtOrgMSP
  export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@court.blocktrace.com/msp
  peer lifecycle chaincode install /tmp/evidence-external.tar.gz
"

echo ""
echo "=== Chaincode Installation Complete ==="
echo ""
echo "Package ID (copy this for next step):"
docker exec peer0.forensics.blocktrace.com peer lifecycle chaincode queryinstalled | grep evidence_1.0 | awk '{print $3}' | sed 's/,$//'
