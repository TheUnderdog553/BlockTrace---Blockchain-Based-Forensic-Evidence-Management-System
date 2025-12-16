# 🔐 BlockTrace - Blockchain-Based Forensic Evidence Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hyperledger Fabric](https://img.shields.io/badge/Hyperledger-Fabric-2F3134?logo=hyperledger)](https://www.hyperledger.org/use/fabric)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16.x-339933?logo=node.js)](https://nodejs.org/)

A comprehensive blockchain-powered system for managing forensic evidence with cryptographic integrity, complete chain of custody tracking, and court-ready report generation.

![BlockTrace Dashboard](docs/screenshot-placeholder.png)

## 🌟 Features

### Core Functionality
- **🔒 Immutable Evidence Storage** - All evidence recorded on Hyperledger Fabric blockchain
- **🔗 Chain of Custody Tracking** - Complete audit trail with cryptographic verification
- **✅ Evidence Verification** - IPFS hash-based integrity checking
- **📊 Real-time Analytics** - Dashboards showing evidence trends, verification rates, and activity heatmaps
- **⚖️ Court-Ready Reports** - Generate PDF reports with QR codes and blockchain proofs
- **🔐 Secure Authentication** - Firebase authentication with email verification and Google Sign-In

### Advanced Features
- **📝 Annotations System** - Add notes and comments to evidence
- **🔔 Real-time Notifications** - Bell icon notifications for custody transfers and updates
- **🔍 Advanced Search & Filters** - Find evidence by ID, category, status, or custodian
- **📈 Activity Heatmaps** - Visualize evidence handling patterns by day and time
- **🌐 Multi-Organization Support** - Manage evidence across different organizations

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React Frontend│────▶│  Express Backend │────▶│ Hyperledger     │
│   (Port 5173)   │     │   (Port 4000)    │     │ Fabric Network  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         │                       │                         │
         ▼                       ▼                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Firebase Auth  │     │   IPFS Storage   │     │  Blockchain     │
│                 │     │                  │     │  Ledger         │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Recharts** - Data visualization
- **React Router** - Client-side routing
- **React Hot Toast** - Notifications
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Hyperledger Fabric SDK** - Blockchain interaction

### Blockchain
- **Hyperledger Fabric** - Permissioned blockchain framework
- **Docker** - Container platform for blockchain nodes
- **IPFS** - Distributed file storage (simulated)

### Authentication
- **Firebase Authentication** - User management
- **Email/Password Auth** - Traditional login
- **Google OAuth** - Social login

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16.x or higher) - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - [Download](https://git-scm.com/)
- **Windows PowerShell** (for Windows users)
- **Firebase Account** - [Sign up](https://firebase.google.com/)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/TheUnderdog553/BlockTrace---Blockchain-Based-Forensic-Evidence-Management-System.git
cd BlockTrace---Blockchain-Based-Forensic-Evidence-Management-System
```

### 2. Install Dependencies

```powershell
# Install frontend dependencies
cd blocktrace-fabric/frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Configure Firebase

1. Follow the instructions in [FIREBASE-SETUP.md](FIREBASE-SETUP.md)
2. Update `blocktrace-fabric/frontend/src/config/firebase.js` with your credentials

### 4. Start Docker Desktop

Ensure Docker Desktop is running before starting the blockchain network.

### 5. Quick Start (Automated)

```powershell
# From the root directory
.\QUICKSTART.ps1
```

This script will:
- ✅ Check Docker status
- ✅ Start Hyperledger Fabric network
- ✅ Launch backend API (port 4000)
- ✅ Launch frontend (port 5173)

### 6. Manual Start (Step by Step)

If you prefer manual setup, see [STARTUP-COMMANDS.md](STARTUP-COMMANDS.md)

## 📖 Usage

### Access the Application

Once started, navigate to:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000

### First Time Setup

1. **Sign Up**: Visit `/signup` and create an account
2. **Verify Email**: Check your email and verify your account
3. **Login**: Sign in with your verified credentials
4. **Upload Evidence**: Navigate to "Upload Evidence" to add your first evidence

### Key Pages

- **Dashboard** - Overview of evidence and system statistics
- **Evidence List** - Browse and manage all evidence
- **Upload Evidence** - Submit new forensic evidence
- **Custody Transfer** - Transfer evidence between organizations
- **Verification** - Verify evidence integrity
- **Analytics** - View trends and activity patterns
- **Court Report** - Generate legal reports for evidence
- **Blockchain Status** - Monitor network health

## 📚 Documentation

- [Startup Commands](STARTUP-COMMANDS.md) - Manual startup guide
- [Testing Guide](TESTING-GUIDE.md) - Feature testing instructions
- [Firebase Setup](FIREBASE-SETUP.md) - Authentication configuration

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env` file in the backend directory:

```env
PORT=4000
FABRIC_NETWORK_PATH=../network
```

### Settings Page

Configure application settings through the UI:
- API endpoint
- IPFS gateway (currently simulated)
- Notification preferences
- Organization details

## 🎯 Features in Detail

### Evidence Management
- Upload evidence with metadata (case ID, description, category)
- Attach files and generate IPFS hashes
- Track current custodian and status
- Add timestamps and location data

### Chain of Custody
- Record every transfer with timestamp
- Capture "from" and "to" organizations
- Store transfer reason and handler information
- View complete custody timeline

### Verification System
- Upload file for verification
- Compare with stored IPFS hash
- Update evidence status to "verified"
- Generate cryptographic proof

### Analytics Dashboard
- Total evidence count and verification rate
- Evidence by category (pie chart)
- Organization activity (bar chart)
- Evidence submission trends (line chart)
- Activity heatmap by day and time

### Court Reports
- Generate comprehensive PDF reports
- Include all evidence metadata
- Show complete chain of custody
- Embed QR codes for verification
- Cryptographic hash proofs

## 🧪 Testing

Run the test suite:

```powershell
cd blocktrace-fabric/frontend
npm test
```

For manual testing, follow [TESTING-GUIDE.md](TESTING-GUIDE.md)

## 📦 Build for Production

### Frontend Build

```powershell
cd blocktrace-fabric/frontend
npm run build
```

The optimized production build will be in the `dist/` directory.

### Backend Deployment

Configure your production blockchain network and update connection profiles in the backend.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**TheUnderdog553**
- GitHub: [@TheUnderdog553](https://github.com/TheUnderdog553)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Hyperledger Fabric community
- Firebase for authentication services
- All open-source libraries used in this project

## 📞 Support

For issues and questions:
- 📧 Email: your.email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/TheUnderdog553/BlockTrace---Blockchain-Based-Forensic-Evidence-Management-System/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/TheUnderdog553/BlockTrace---Blockchain-Based-Forensic-Evidence-Management-System/discussions)

## 🗺️ Roadmap

- [ ] Real IPFS integration (currently simulated)
- [ ] Multi-factor authentication
- [ ] Role-based access control (RBAC)
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Audit log export
- [ ] Advanced search with filters
- [ ] Evidence sharing between organizations
- [ ] Integration with forensic tools

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Evidence Upload
![Upload](docs/screenshots/upload.png)

### Court Report
![Report](docs/screenshots/report.png)

### Analytics
![Analytics](docs/screenshots/analytics.png)

---

**⭐ If you find this project useful, please consider giving it a star!**

Made with ❤️ using Blockchain Technology
