# BlockTrace Startup Commands

## Quick Start (Recommended)

### Method 1: One-Click Startup
```powershell
cd C:\Users\Priyanshu\Desktop\Blocktrace
.\QUICKSTART.ps1
```

This single script will:
- Check Docker Desktop status
- Start Fabric blockchain network
- Launch backend API (port 4000)
- Launch frontend (port 5173)

---

## Manual Startup (Step by Step)

### Step 1: Verify Docker Desktop
```powershell
docker ps
```
**Expected**: Should show running containers or empty list (no error)

If Docker is not running:
1. Open Docker Desktop application
2. Wait for "Docker Desktop is running" status
3. Run the command again

---

### Step 2: Start Blockchain Network
```powershell
cd C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\network
docker-compose -f docker-compose.yaml up -d
```

**Wait 10-15 seconds** for containers to initialize.

**Verify**:
```powershell
docker ps
```
Should show 6 containers:
- peer0.forensics.blocktrace.com
- peer0.police.blocktrace.com
- peer0.court.blocktrace.com
- couchdb.forensics
- couchdb.police
- couchdb.court

---

### Step 3: Start Backend API
```powershell
cd C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\backend
node app.js
```

**Expected Output**: 
```
✓ Connected to Fabric Gateway
✓ Server running on http://localhost:4000
```

**Keep this terminal open** (backend runs here)

---

### Step 4: Start Frontend (New Terminal)
Open a **new PowerShell window**:
```powershell
cd C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\frontend
npm run dev
```

**Expected Output**:
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

**Keep this terminal open** (frontend runs here)

---

## Access the Application

Open your web browser and navigate to:
```
http://localhost:5173
```

---

## Check System Status

At any time, verify all services are running:
```powershell
cd C:\Users\Priyanshu\Desktop\Blocktrace
.\CHECK-STATUS.ps1
```

---

## Alternative Startup Scripts

### Start Backend + Frontend Only
If blockchain network is already running:
```powershell
cd C:\Users\Priyanshu\Desktop\Blocktrace
.\START.ps1
```

### Complete Deployment with Chaincode
For fresh deployment including smart contract:
```powershell
cd C:\Users\Priyanshu\Desktop\Blocktrace\fabric-samples\test-network
.\deployAll.ps1
```

---

## Troubleshooting Commands

### View Container Logs
```powershell
# View specific container logs
docker logs peer0.forensics.blocktrace.com

# View backend logs (if running in background)
docker logs blocktrace-backend

# View all container status
docker ps -a
```

### Restart Everything
```powershell
# Stop all containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)

# Start fresh
cd C:\Users\Priyanshu\Desktop\Blocktrace
.\QUICKSTART.ps1
```

### Check Port Usage
```powershell
# Check if port 4000 is in use
netstat -ano | findstr :4000

# Check if port 5173 is in use
netstat -ano | findstr :5173
```

### Kill Node Processes
```powershell
Stop-Process -Name node -Force
```

---

## System Requirements

- **Docker Desktop**: Running and initialized
- **Node.js**: v16 or higher
- **npm**: v8 or higher
- **PowerShell**: 5.1 or higher
- **Ports Required**: 4000 (backend), 5173 (frontend), 7051, 9051, 11051 (peers), 5984, 7984, 9990 (CouchDB)

---

## Network Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│         http://localhost:5173           │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Backend API (Express.js)           │
│      http://localhost:4000              │
│      Fabric SDK Integration             │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    Hyperledger Fabric Network           │
│    - ForensicsOrg (peer + CouchDB)      │
│    - PoliceOrg    (peer + CouchDB)      │
│    - CourtOrg     (peer + CouchDB)      │
│    - Evidence Chaincode v2.0            │
└─────────────────────────────────────────┘
```

---

## Quick Reference

| Service | Port | Check URL |
|---------|------|-----------|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 4000 | http://localhost:4000/healthz |
| Peer Forensics | 7051 | - |
| Peer Police | 9051 | - |
| Peer Court | 11051 | - |
| CouchDB Forensics | 5984 | http://localhost:5984/_utils |
| CouchDB Police | 7984 | http://localhost:7984/_utils |
| CouchDB Court | 9990 | http://localhost:9990/_utils |
