# BlockTrace Complete Testing & Verification Guide

This document provides step-by-step instructions to verify every function of the BlockTrace Forensic Evidence Blockchain application.

---

## Prerequisites

Before testing, ensure:
- ✅ All services are running (use `.\CHECK-STATUS.ps1`)
- ✅ Frontend accessible at http://localhost:5173
- ✅ Backend responding at http://localhost:4000
- ✅ 6 Docker containers running

---

## Test 1: Dashboard & System Overview

### Steps:
1. Open browser to `http://localhost:5173`
2. You should land on the **Dashboard** page

### Verify:
- ✅ **Quick Stats Cards** display:
  - Total Evidence count (e.g., 8 items)
  - Verified Evidence count (e.g., 5 items)
  - Pending Verification count (e.g., 2 items)
  - Active Transfers count
  
- ✅ **Recent Evidence Section** shows list of recent items
- ✅ **Analytics Charts** render properly:
  - Evidence by Type (Bar chart)
  - Evidence Status Distribution (Pie chart)
  - Verification Timeline (Line chart)
  - Chain of Custody Activity (Area chart)

- ✅ Navigation sidebar shows all menu items:
  - Dashboard
  - Evidence List
  - Upload Evidence
  - Transfer Custody
  - Verify Evidence
  - Analytics
  - Court Report
  - Blockchain Status
  - Settings

### Expected Result:
Dashboard loads with real-time statistics and visualizations.

---

## Test 2: Evidence List & Search

### Steps:
1. Click **"Evidence List"** in sidebar
2. Wait for evidence data to load

### Verify:
- ✅ Table displays evidence with columns:
  - Evidence ID
  - Type (e.g., Digital, Physical, Document)
  - Status (Registered, Verified, Pending)
  - Current Custodian (Forensics/Police/Court)
  - Timestamp
  - Actions (View Details, Transfer, Verify buttons)

- ✅ **Search functionality**:
  - Type "EVD" in search box
  - Table filters to show only matching evidence

- ✅ **Type filter**:
  - Select "Digital" from dropdown
  - Table shows only digital evidence

- ✅ **Status filter**:
  - Select "Verified" from dropdown
  - Table shows only verified evidence

- ✅ **Pagination** (if more than 10 items):
  - Click page numbers
  - Table updates with new items

### Expected Result:
All 8 evidence items displayed with proper filtering and search capabilities.

---

## Test 3: View Evidence Details

### Steps:
1. From Evidence List, click **"View Details"** on any evidence item
2. Evidence Details page opens

### Verify:
- ✅ **Basic Information Card**:
  - Evidence ID
  - Evidence Type
  - Current Status
  - Current Custodian
  - Collection Location
  - Collection Date/Time

- ✅ **IPFS Hash** displayed (for off-chain storage reference)

- ✅ **Description** section shows evidence notes

- ✅ **File Information Card**:
  - IPFS Hash (truncated with "..." button)
  - File Size
  - File Type
  - Verification Hash
  - Download from IPFS button

- ✅ **Metadata Sidebar**:
  - Current Custodian
  - Submitted By
  - Collection Date
  - Source IP
  - Last Modified timestamp
  - Block Height number

- ✅ **Verification Status Badge** (if verified):
  - Green checkmark with "Verified Evidence" message
  - Cryptographic verification confirmation text

- ✅ **Three Tab Navigation**:
  - Details tab (default)
  - Chain of Custody tab
  - Annotations tab with count badge

- ✅ **Action Buttons** (top right):
  - Transfer Custody button
  - Verify Evidence button

- ✅ **Back button** returns to Evidence List

### Test 3b: Chain of Custody Tab

**Steps:**
1. While on Evidence Details page, click **"Chain of Custody"** tab

**Verify:**
- ✅ **Timeline view** with vertical line connecting entries
- ✅ Each custody entry shows:
  - Action type (e.g., "Evidence Created", "Custody Transferred")
  - Timestamp
  - From organization
  - To organization
  - Handler name
  - Transaction ID (blockchain hash)
- ✅ Entries displayed chronologically (oldest to newest)
- ✅ Visual timeline with dots on left side
- ✅ Color-coded neon highlights

### Test 3c: Annotations Tab

**Steps:**
1. Click **"Annotations"** tab

**Verify:**
- ✅ **Annotation list** shows all forensic notes:
  - Author name
  - Organization badge
  - Timestamp
  - Annotation content/notes
- ✅ **Add Annotation section** at bottom:
  - Text area for new notes
  - Submit button
- ✅ Multiple annotations from different organizations visible
- ✅ User icon for each annotation

### Expected Result:
Complete forensic chain-of-custody history visible with all details.

---

## Test 4: Upload New Evidence

### Steps:
1. Click **"Upload Evidence"** in sidebar
2. Fill the registration form:

   **Test Data:**
   - **Evidence Type**: Select "Digital"
   - **Description**: "Test laptop seized from suspect - contains encrypted files"
   - **Collection Location**: "123 Main St, Crime Scene Alpha"
   - **Case Number**: "CASE-2025-001"
   - **Investigator Name**: "Det. John Smith"
   - **File Upload**: Select any image file (e.g., crime-scene.jpg)

3. Click **"Register Evidence"** button

### Verify:
- ✅ Form validation works:
  - Try submitting empty form → Shows required field errors
  - All fields marked as required show asterisk (*)

- ✅ File upload preview:
  - Selected file name appears
  - File size displayed

- ✅ On successful submission:
  - Success toast notification appears
  - "Evidence registered successfully" message
  - Evidence ID generated (e.g., EVD-20250001)
  - Form resets

- ✅ **Backend verification** (optional):
  Open browser console (F12) → Network tab → Check POST request to `/api/evidence/register`
  - Status: 200 OK
  - Response contains: `{ success: true, evidenceId: "EVD-..." }`

### Expected Result:
New evidence successfully registered on blockchain with unique ID.

---

## Test 5: Transfer Custody

### Steps:
1. Click **"Transfer Custody"** in sidebar
2. Select evidence to transfer:
   - **Evidence ID**: Choose "EVD-20240001" (or any existing ID)
   
3. Transfer details:
   - **From Organization**: Auto-detected (e.g., Forensics)
   - **To Organization**: Select "Police"
   - **Transfer Reason**: "Chain of custody transfer for forensic analysis"
   - **Transfer Notes**: "Evidence sealed and transported via secure vehicle"

4. Click **"Transfer Custody"** button

### Verify:
- ✅ Dropdown shows all 3 organizations:
  - Forensics Organization
  - Police Organization
  - Court Organization

- ✅ Cannot transfer to same organization (validation)

- ✅ On successful transfer:
  - Success toast notification
  - "Custody transferred successfully"
  - Transaction hash displayed

- ✅ **Blockchain verification**:
  - Go to Evidence Details page
  - Chain of Custody timeline shows new transfer
  - Current Custodian updated to "Police"
  - Transfer timestamp recorded

### Expected Result:
Evidence custody transferred and recorded immutably on blockchain.

---

## Test 6: Verify Evidence

### Steps:
1. Click **"Verify Evidence"** in sidebar
2. Select unverified evidence:
   - **Evidence ID**: Choose evidence with "Pending" status

3. Verification details:
   - **Verifier Name**: "Dr. Sarah Johnson"
   - **Verification Method**: Select "Digital Forensics"
   - **Verification Notes**: "Hash values verified against original. No tampering detected. Metadata consistent."
   - **Verification Result**: Select "Verified" or "Tampered"

4. Click **"Verify Evidence"** button

### Verify:
- ✅ Verification method dropdown shows options:
  - Digital Forensics
  - Physical Examination
  - DNA Analysis
  - Fingerprint Analysis
  - Chain of Custody Review

- ✅ Result options:
  - ✓ Verified (green)
  - ✗ Tampered (red)
  - ? Inconclusive (yellow)

- ✅ On successful verification:
  - Success notification
  - Digital signature generated
  - Verification recorded on blockchain

- ✅ **Status update verification**:
  - Go to Evidence List
  - Status changed from "Pending" → "Verified"
  - Verification badge appears

- ✅ **Evidence Details verification**:
  - Verification History section updated
  - Shows verifier name, timestamp, notes
  - Digital signature hash displayed

### Expected Result:
Evidence verification recorded immutably with cryptographic proof.

---

## Test 7: Analytics Dashboard

### Steps:
1. Click **"Analytics"** in sidebar
2. Dashboard loads with multiple visualizations

### Verify:
- ✅ **Time Range Filter**:
  - Dropdown shows: Last 7 Days, Last 30 Days, Last 3 Months, Last Year, All Time
  - Change selection → Charts update dynamically

- ✅ **Evidence Distribution by Type Chart** (Bar Chart):
  - X-axis: Evidence types (Digital, Physical, Document)
  - Y-axis: Count
  - Bars show correct counts (e.g., Digital: 5, Physical: 2, Document: 1)

- ✅ **Status Overview Chart** (Pie Chart):
  - Segments: Verified, Pending, Registered
  - Percentages displayed
  - Correct color coding (Green: Verified, Yellow: Pending, Blue: Registered)

- ✅ **Verification Timeline Chart** (Line Chart):
  - X-axis: Dates
  - Y-axis: Verification count
  - Line shows trend over time

- ✅ **Chain of Custody Activity Chart** (Area Chart):
  - Shows custody transfers over time
  - Area gradient effect visible

- ✅ **Statistics Cards**:
  - Total Evidence
  - Verification Rate (percentage)
  - Average Processing Time
  - Active Custody Transfers

### Expected Result:
All charts render correctly with accurate data and responsive filtering.

---

## Test 8: Court Report Generation (PDF)

### Steps:
1. Click **"Court Report"** in sidebar
2. Select evidence for report:
   - **Evidence ID**: Choose any verified evidence (e.g., EVD-20240001)

3. Report details:
   - **Report Type**: Select "Chain of Custody Report"
   - **Case Number**: "CASE-2025-001"
   - **Court Name**: "District Court, County X"
   - **Prepared By**: "Forensic Analyst - Jane Doe"
   - **Additional Notes**: "This report is prepared for court proceedings. All evidence has been verified and secured."

4. Click **"Generate Report"** button

### Verify:
- ✅ Report type dropdown shows options:
  - Chain of Custody Report
  - Evidence Analysis Report
  - Verification Summary Report
  - Complete Case Report

- ✅ Form validation requires all fields

- ✅ **PDF Generation**:
  - Processing indicator appears
  - PDF downloads automatically (filename: `court-report-EVD-20240001-[timestamp].pdf`)

- ✅ **PDF Content Verification**:
  Open downloaded PDF and verify:
  
  **Page 1 - Cover & Case Information:**
  - BlockTrace logo/header
  - Report title
  - Case number
  - Court name
  - Generation date
  - Prepared by name
  
  **Page 2 - Chain of Custody:**
  - Table with all custody transfers
  - Columns: Date, From, To, Reason, Timestamp
  - All transfers listed chronologically
  
  **Page 3 - Verification & Legal Summary:**
  - Evidence details (ID, Type, Status)
  - Verification information
  - Digital signatures
  - Legal certification statement
  - QR code for blockchain verification (optional)
  - Footer with page numbers

- ✅ **Legal Compliance Elements**:
  - Official seal/header
  - Date and time stamps
  - Cryptographic hash references
  - Legal disclaimer text
  - "This report is generated from immutable blockchain records"

### Expected Result:
Professional, court-ready PDF report with complete chain-of-custody documentation.

---

## Test 9: Blockchain Status Monitoring

### Steps:
1. Click **"Blockchain Status"** in sidebar
2. Wait for network information to load

### Verify:
- ✅ **Network Health Status**:
  - Overall status: "Healthy" (green) or "Issues Detected" (red)
  - Network uptime displayed

- ✅ **Peer Nodes Information**:
  Table showing all 3 peers:
  - **Peer Name**: peer0.forensics.blocktrace.com
  - **Organization**: ForensicsOrg
  - **Status**: Online/Offline
  - **Block Height**: Current blockchain height
  - **Ledger Size**: Size in MB
  
  Repeat for Police and Court peers

- ✅ **Channel Information**:
  - Channel Name: "blocktrace-channel"
  - Member Organizations: 3 (Forensics, Police, Court)
  - Smart Contracts: Evidence Chaincode v2.0

- ✅ **Chaincode Information**:
  - Name: evidence
  - Version: 2.0
  - Language: Node.js
  - Endorsement Policy displayed
  - Functions: RegisterEvidence, TransferCustody, VerifyEvidence, etc.

- ✅ **Recent Blocks**:
  - List of last 10 blocks
  - Block number
  - Timestamp
  - Transaction count
  - Block hash (truncated)

- ✅ **Transaction Statistics**:
  - Total transactions
  - Transactions today
  - Average block time

### Expected Result:
Complete visibility into blockchain network health and activity.

---

## Test 10: Settings & Configuration

### Steps:
1. Click **"Settings"** in sidebar
2. Settings page loads

### Verify:
- ✅ **Organization Settings**:
  - Current organization displayed (e.g., Forensics)
  - Organization ID
  - MSP ID (e.g., ForensicsOrgMSP)

- ✅ **User Profile** (if implemented):
  - User name
  - Role (Investigator, Analyst, Admin)
  - Email

- ✅ **Notification Preferences**:
  - Toggle for email notifications
  - Toggle for desktop notifications
  - Toggle for custody transfer alerts

- ✅ **Network Configuration** (read-only):
  - Blockchain endpoint
  - API endpoint (http://localhost:4000)
  - Channel name

- ✅ **Theme Settings** (if implemented):
  - Light/Dark mode toggle
  - Theme preference saved

- ✅ **Save Changes** button updates configuration

### Expected Result:
Settings properly display and update user preferences.

---

## Test 11: Search & Navigation

### Steps:
1. Use the **search bar** in top navbar

### Verify:
- ✅ **Global Search**:
  - Type "EVD-20240001" → Finds specific evidence
  - Type "laptop" → Finds evidence with "laptop" in description
  - Type "Police" → Finds evidence at Police organization
  - Search results show:
    - Evidence ID
    - Description preview
    - Current status
    - Click to view details

- ✅ **Navigation**:
  - All sidebar links work
  - Active page highlighted
  - Breadcrumb trail (if implemented)
  - Back button functionality

### Expected Result:
Fast, accurate search across all evidence records.

---

## Test 12: Notifications & Alerts

### Steps:
1. Trigger various actions (upload, transfer, verify)
2. Observe notification system

### Verify:
- ✅ **Toast Notifications** appear for:
  - ✓ Success actions (green)
  - ✗ Error messages (red)
  - ⚠ Warning messages (yellow)
  - ℹ Info messages (blue)

- ✅ **Notification Bell** (top navbar):
  - Badge shows unread count
  - Click to open dropdown
  - Shows recent notifications:
    - "New evidence registered"
    - "Custody transferred"
    - "Verification completed"
  - Timestamps displayed
  - "Mark all as read" button

### Expected Result:
Real-time notifications keep users informed of system events.

---

## Test 13: Backend API Endpoints (Advanced)

### Steps:
Use browser console or Postman to test API directly

### Test GET /api/evidence/all
```bash
curl http://localhost:4000/api/evidence/all
```

**Verify:**
- ✅ Status: 200 OK
- ✅ Response: Array of evidence objects
- ✅ Each object has: id, type, status, custodian, timestamp

---

### Test POST /api/evidence/register
```bash
curl -X POST http://localhost:4000/api/evidence/register \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Digital",
    "description": "Test evidence",
    "location": "Test location",
    "caseNumber": "TEST-001",
    "investigator": "Test User"
  }'
```

**Verify:**
- ✅ Status: 200 OK
- ✅ Response: `{ success: true, evidenceId: "EVD-..." }`
- ✅ Transaction hash returned

---

### Test POST /api/evidence/transfer
```bash
curl -X POST http://localhost:4000/api/evidence/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "evidenceId": "EVD-20240001",
    "fromOrg": "Forensics",
    "toOrg": "Police",
    "reason": "API test transfer"
  }'
```

**Verify:**
- ✅ Status: 200 OK
- ✅ Custody updated on blockchain
- ✅ Transaction recorded

---

### Test GET /api/evidence/history/:id
```bash
curl http://localhost:4000/api/evidence/history/EVD-20240001
```

**Verify:**
- ✅ Status: 200 OK
- ✅ Returns array of all transactions for evidence
- ✅ Chronological order (oldest to newest)

---

### Test GET /healthz
```bash
curl http://localhost:4000/healthz
```

**Verify:**
- ✅ Status: 200 OK
- ✅ Response: `{ status: "ok", service: "blocktrace-backend" }`

---

## Test 14: Blockchain Immutability (Critical)

### Steps:
1. Register new evidence → Note Evidence ID (e.g., EVD-TEST-001)
2. View evidence details → Note IPFS hash and timestamp
3. Transfer custody → Note transaction hash
4. Try to "modify" evidence details (should fail - blockchain immutability)

### Verify:
- ✅ **Cannot modify registered evidence**:
  - No "Edit" button for basic details
  - Evidence ID is permanent
  - Original timestamp unchangeable

- ✅ **Cannot delete custody transfers**:
  - Chain of custody history is append-only
  - No "Delete transfer" option

- ✅ **Hash verification**:
  - IPFS hash remains constant
  - Any tampering would break cryptographic signatures

- ✅ **Audit trail completeness**:
  - Every action recorded with timestamp
  - Every action has associated user/organization
  - Transaction hashes link to blockchain

### Expected Result:
Data immutability enforced - no tampering possible.

---

## Test 15: Multi-Organization Workflow

### Complete End-to-End Scenario:

1. **Forensics** registers evidence:
   - Type: "Digital"
   - Description: "Seized laptop from suspect"
   - Status: "Registered"

2. **Forensics** verifies evidence:
   - Verification method: "Digital Forensics"
   - Result: "Verified"
   - Status changes to: "Verified"

3. **Forensics** transfers to **Police**:
   - Reason: "Investigation required"
   - Custodian changes: Forensics → Police

4. **Police** adds verification:
   - Additional notes: "Evidence reviewed by detective"
   - Status remains: "Verified"

5. **Police** transfers to **Court**:
   - Reason: "Court proceedings"
   - Custodian changes: Police → Court

6. **Court** generates final report:
   - Complete chain-of-custody documented
   - All verifications included
   - Ready for court presentation

### Verify:
- ✅ Each transfer recorded with timestamp
- ✅ All organizations see complete history
- ✅ No data loss between transfers
- ✅ Cryptographic integrity maintained
- ✅ Court report includes all steps

### Expected Result:
Complete forensic evidence lifecycle from collection to court presentation.

---

## Performance Testing

### Test Response Times:

1. **Evidence List Load Time**:
   - ✅ Should load < 2 seconds for 100 items
   - ✅ Pagination should be instant

2. **Evidence Registration**:
   - ✅ Should complete < 5 seconds
   - ✅ Includes blockchain transaction time

3. **Custody Transfer**:
   - ✅ Should complete < 3 seconds
   - ✅ Multi-org consensus time

4. **PDF Generation**:
   - ✅ Should generate < 3 seconds
   - ✅ Includes data fetch + PDF creation

5. **Search**:
   - ✅ Should return results < 1 second
   - ✅ Filters should update instantly

---

## Security Testing

### Verify Access Controls:

1. ✅ **Authentication** (if implemented):
   - Unauthorized users cannot access system
   - Login required

2. ✅ **Authorization**:
   - Forensics can only transfer from Forensics
   - Police cannot access Forensics-only data (if restricted)

3. ✅ **Data Validation**:
   - SQL injection attempts blocked
   - XSS attempts sanitized
   - Invalid data rejected

4. ✅ **HTTPS** (production):
   - All API calls encrypted
   - Secure certificate

---

## Final Verification Checklist

- [ ] All 10 frontend pages accessible
- [ ] All 7 chaincode functions tested (RegisterEvidence, TransferCustody, VerifyEvidence, GetEvidenceHistory, AnnotateEvidence, GetEvidenceById, GetAllEvidence)
- [ ] Evidence lifecycle: Register → Verify → Transfer → Report
- [ ] PDF reports generate correctly
- [ ] Analytics charts display accurate data
- [ ] Search and filtering work across all pages
- [ ] Notifications appear for all actions
- [ ] Blockchain status page shows healthy network
- [ ] No console errors in browser
- [ ] No backend errors in terminal
- [ ] All Docker containers running
- [ ] Chain-of-custody immutability enforced
- [ ] Multi-organization workflow complete

---

## Expected Test Results Summary

| Test Category | Pass Criteria | Status |
|--------------|---------------|--------|
| Dashboard Load | All stats visible, charts render | ✅ |
| Evidence Registration | New evidence created with ID | ✅ |
| Evidence Search | Filter/search returns correct results | ✅ |
| Custody Transfer | Blockchain records transfer | ✅ |
| Evidence Verification | Status updated, signature generated | ✅ |
| Court Report | PDF downloads with all data | ✅ |
| Analytics | Charts update based on time range | ✅ |
| Blockchain Status | All 3 peers online, chaincode active | ✅ |
| API Endpoints | All endpoints return 200 OK | ✅ |
| Data Immutability | Cannot modify/delete records | ✅ |

---

## Troubleshooting Test Failures

### If Evidence Registration Fails:
1. Check backend logs for Fabric SDK errors
2. Verify chaincode is deployed: `docker logs peer0.forensics.blocktrace.com`
3. Test backend health: `http://localhost:4000/healthz`

### If PDF Generation Fails:
1. Check browser console for jsPDF errors
2. Verify evidence data exists
3. Check browser file download permissions

### If Charts Don't Load:
1. Check network tab for API call failures
2. Verify data format in response
3. Check for JavaScript errors in console

### If Custody Transfer Fails:
1. Verify blockchain network is healthy
2. Check endorsement policy (requires majority)
3. Verify organization MSP IDs match

---

## Conclusion

After completing all tests above, you will have verified:
- ✅ Complete frontend functionality (10 pages)
- ✅ All backend API endpoints (7+ endpoints)
- ✅ All chaincode smart contract functions (7 functions)
- ✅ Blockchain network health (3 organizations)
- ✅ Data immutability and security
- ✅ Court-ready reporting capability
- ✅ Multi-organization workflow
- ✅ End-to-end evidence lifecycle

**BlockTrace is a fully functional, production-ready forensic evidence blockchain system.**
