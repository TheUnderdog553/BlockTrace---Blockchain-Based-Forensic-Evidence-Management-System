#!/bin/bash
set -e

# Create package directory structure
mkdir -p /tmp/cc-pkg
cd /tmp/cc-pkg

# Create metadata.json (must be at root)
cat > metadata.json <<'EOF'
{
  "type": "external",
  "label": "evidence_1.0"
}
EOF

# Create connection.json (for external chaincode)
cat > connection.json <<'EOF'
{
  "address": "evidence-chaincode:7052",
  "dial_timeout": "10s",
  "tls_required": false
}
EOF

# For external chaincode, code.tar.gz should contain the connection.json
# This tells Fabric where to find the running chaincode service
tar czf code.tar.gz connection.json

# Create final package
tar czf /tmp/evidence-external.tar.gz metadata.json code.tar.gz

# Install chaincode on Forensics peer
export CORE_PEER_LOCALMSPID=ForensicsOrgMSP
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/users/Admin@forensics.blocktrace.com/msp
peer lifecycle chaincode install /tmp/evidence-external.tar.gz

# Get the package ID for later use
peer lifecycle chaincode queryinstalled | grep evidence_1.0
