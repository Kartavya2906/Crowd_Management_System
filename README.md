# 🎯 CrowdBuddy - Intelligent Crowd Management System

<div align="center">

![CrowdBuddy Banner](https://img.shields.io/badge/CrowdBuddy-Intelligent_Crowd_Management-blue?style=for-the-badge)

[![Website](https://img.shields.io/badge/Website-Live-success?style=for-the-badge&logo=vercel)](https://crowdbuddy.vercel.app/)
[![Flutter](https://img.shields.io/badge/Flutter-3.0+-02569B?style=for-the-badge&logo=flutter)](https://flutter.dev)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.0+-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)

*A comprehensive AI-powered crowd management solution for large-scale events*

[📱 Download App](#-mobile-app-download) • [🌐 Live Demo](#-live-demo) • [📖 Documentation](#-documentation) • [🚀 Quick Start](#-quick-start)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)

---

## 🌟 Overview

**CrowdBuddy** is an intelligent crowd management system designed to enhance safety and coordination at large-scale events such as concerts, festivals, sports events, and public gatherings. It combines AI-powered crowd density analysis, real-time monitoring, and emergency response coordination into a unified platform.

### Why CrowdBuddy?

- **🎯 Real-time Monitoring**: AI-powered crowd density analysis using image processing
- **🚨 Emergency Response**: Quick medical emergency reporting and tracking
- **👥 Lost & Found**: Efficient lost person tracking with photo uploads
- **📊 Analytics Dashboard**: Comprehensive event analytics and feedback insights
- **🏥 Facility Management**: Track washrooms, medical centers, and emergency exits
- **🔔 Smart Alerts**: Weather alerts and emergency notifications
- **📱 Multi-Platform**: Web dashboard for organizers + Mobile app for attendees

---

## 🌐 Live Demo

### 🖥️ Web Portal (Organizers)
**Live URL**: [https://crowdbuddy.vercel.app/](https://crowdbuddy.vercel.app/)

Access the organizer dashboard to:
- Create and manage events
- Monitor crowd density in real-time
- Track lost persons and medical emergencies
- Analyze event feedback
- Manage facilities and emergency exits

### 📱 Mobile App Download

**Android APK**: [Download CrowdBuddy App](https://drive.google.com/file/d/YOUR_SHARED_LINK/view?usp=sharing)

> **Note**: Replace the above link with your actual Google Drive or GitHub release link for the APK file located at:
> `c:\Users\Anshika Agarwal\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\TempState\DE75FA7494E402E31126B79B98474AC3\app-release.apk`

**Installation Steps**:
1. Download the APK file
2. Enable "Install from Unknown Sources" in your Android settings
3. Install the APK
4. Open CrowdBuddy and register/login

---

## ✨ Features

### 🎫 Event Management
- **Create & Configure Events**: Set up events with location, capacity, and time details
- **Zone-Based Monitoring**: Define multiple zones/areas within events
- **Dynamic Areas**: Customizable event areas with radius-based boundaries
- **Status Tracking**: Monitor event status (Upcoming, Live, Completed)

### 🤖 AI-Powered Crowd Analysis
- **Image-Based Counting**: Upload images for AI-powered crowd density estimation
- **Density Classification**: Automatic classification (Safe, Moderate, Risky, Overcrowded)
- **Area-Wise Analytics**: Track crowd density across different event zones
- **Real-time Updates**: Live density metrics per square meter

### 🚑 Emergency Management

#### Medical Emergencies
- **Quick Reporting**: Report emergencies with severity levels (Minor, Moderate, Severe, Critical)
- **Emergency Types**: Injury, Illness, Heatstroke, Cardiac, Other
- **Responder Assignment**: Track responder names and response times
- **Status Workflow**: Reported → Dispatched → On Scene → Transported → Resolved

#### Lost Person Tracking
- **Photo Upload**: Attach photos of missing persons
- **Priority System**: Auto-prioritize children and elderly (Critical priority)
- **Status Management**: Reported → Searching → Found → Resolved
- **Reporter Contact**: Store reporter information for quick communication

### 🏨 Facility Management
- **Multiple Facility Types**:
  - 🚻 Washroom facilities (gender-specific)
  - 🏥 Medical centers
  - 🍔 Food courts
  - 🏨 Hotels
  - 🚪 Emergency exits

- **Availability Tracking**: Real-time facility status (Available, Occupied, Maintenance)
- **Location-Based Search**: Find nearby facilities with distance calculation
- **Floor-Level Details**: Multi-level venue support

### 📊 Feedback & Analytics
- **Rating System**: 5-star rating for overall experience
- **AI Sentiment Analysis**: Automatic sentiment classification (Positive, Neutral, Negative)
- **Category-Based Feedback**: General, Safety, Navigation, Facilities, Emergency
- **Statistics Dashboard**: 
  - Average ratings
  - Rating distribution
  - Sentiment breakdown
  - Recent feedback timeline

### 🔔 Alert System
- **Alert Types**: Warning, Emergency, Info, Weather
- **Severity Levels**: Low, Medium, High, Critical
- **Weather Integration**: Real-time weather conditions and forecasts
- **Active/Inactive Status**: Manage alert lifecycle

### 👤 User Management
- **Role-Based Access**:
  - 👥 Public (Attendees)
  - 🎫 Organizer (Event Managers)
  - 🏥 Medical (Medical Staff)
  - 👮 Police (Security Personnel)
- **Secure Authentication**: User registration and login
- **Profile Management**: Update user information

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CROWDBUDDY SYSTEM                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │   Mobile    │   │     Web     │   │   Backend   │
    │     App     │   │   Portal    │   │     API     │
    │  (Flutter)  │   │   (React)   │   │  (FastAPI)  │
    └─────────────┘   └─────────────┘   └─────────────┘
           │                  │                  │
           │                  │                  │
           └──────────────────┼──────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │    MongoDB      │
                     │    Database     │
                     └─────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │  AI Inference   │
                     │  (Crowd Count)  │
                     └─────────────────┘
```

### Component Breakdown

#### 1. **Mobile Application** (Flutter)
- Attendee-facing mobile interface
- Report emergencies and lost persons
- View event information
- Access facility locations
- Submit feedback

#### 2. **Web Portal** (React + TypeScript)
- Organizer dashboard
- Event creation and management
- Real-time monitoring
- Analytics and reports
- Facility management

#### 3. **Backend API** (FastAPI + Python)
- RESTful API endpoints
- Business logic processing
- Database operations
- AI inference integration
- Authentication & authorization

#### 4. **Database** (MongoDB)
- NoSQL document storage
- High-performance async operations
- Flexible schema for event data
- Indexed queries for fast retrieval

#### 5. **AI Inference Engine**
- Lightweight Crowd Counting (LWCC)
- Image-based person detection
- Density calculation algorithms
- Crowd classification logic

---

## 🛠️ Tech Stack

### Frontend

#### Web Portal
- **Framework**: React 18.3.1 with TypeScript 5.5.3
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Deployment**: Vercel

#### Mobile App
- **Framework**: Flutter 3.0+
- **Language**: Dart
- **State Management**: Provider / Riverpod
- **HTTP Client**: Dio
- **Local Storage**: Hive / Shared Preferences

### Backend
- **Framework**: FastAPI 0.109.0
- **Server**: Uvicorn 0.27.0
- **Database Driver**: Motor 3.3.2 (Async MongoDB)
- **Validation**: Pydantic
- **Image Processing**: Pillow, NumPy
- **Testing**: Pytest 7.4.3, pytest-asyncio

### Database
- **Primary Database**: MongoDB 4.0+
- **ODM**: Motor (async PyMongo)
- **Indexing**: Compound indexes for performance

### AI/ML
- **Crowd Counting**: Lightweight Crowd Counting (LWCC)
- **Image Processing**: Pillow, NumPy
- **Model Format**: PyTorch (optional)

### DevOps
- **Version Control**: Git
- **API Testing**: Postman
- **Environment**: Python dotenv
- **CI/CD**: GitHub Actions (optional)

---

## 🚀 Quick Start

### Prerequisites
- **Python**: 3.8 or higher
- **Node.js**: 16.x or higher
- **MongoDB**: 4.0 or higher
- **Flutter**: 3.0+ (for mobile app)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Kartavya2906/Crowd_Management_System.git
cd Crowd_Management_System
```

### 2️⃣ Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will run at**: `http://localhost:8000`
**API Docs**: `http://localhost:8000/docs`

### 3️⃣ Web Frontend Setup
```bash
cd cms_web_frontend

# Install dependencies
npm install

# Configure environment
# Create .env file with backend API URL
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

**Web portal will run at**: `http://localhost:5173`

### 4️⃣ Mobile App Setup
```bash
cd app_crowd_buddy

# Get Flutter dependencies
flutter pub get

# Run on connected device/emulator
flutter run
```

### 5️⃣ MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB
# Start MongoDB service
mongod --dbpath /path/to/data
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGO_URL` in backend `.env`

---

## 📖 Installation

### Detailed Backend Installation

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Environment variables (.env file)
MONGO_URL=mongodb://localhost:27017
DB_NAME=crowd_management_system_db
HOST=0.0.0.0
PORT=8000
LWCC_HOME=/path/to/writable/dir  # For AI model cache

# Run database verification
python verify_setup.py

# Start server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Detailed Frontend Installation

```bash
# Navigate to web frontend
cd cms_web_frontend

# Install dependencies
npm install

# Environment configuration (.env)
VITE_API_BASE_URL=http://localhost:8000

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Mobile App Build

```bash
cd app_crowd_buddy

# Install dependencies
flutter pub get

# Run in debug mode
flutter run

# Build APK (Android)
flutter build apk --release

# Build iOS (macOS only)
flutter build ios --release
```

---

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:8000`
- **Production**: Your deployed backend URL

### Interactive API Docs
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

#### Authentication
```
POST   /auth/register          - Register new user
POST   /auth/login             - User login
GET    /auth/users             - List all users
GET    /auth/users/{user_id}   - Get user details
```

#### Events
```
POST   /events/                      - Create event
GET    /events/                      - Get all events
GET    /events/{event_id}            - Get event by ID
PUT    /events/{event_id}            - Update event
PATCH  /events/{event_id}/status     - Update event status
DELETE /events/{event_id}            - Delete event
```

#### Crowd Density
```
POST   /crowd-density/                           - Create density record
GET    /crowd-density/                           - Get all density records
GET    /crowd-density/event/{event_id}/latest    - Latest density
GET    /crowd-density/event/{event_id}/areas     - All areas density
POST   /inference/count                          - AI crowd counting
```

#### Medical Emergencies
```
POST   /medical-emergencies/                      - Report emergency
GET    /medical-emergencies/                      - List emergencies
GET    /medical-emergencies/{id}                  - Get emergency
PATCH  /medical-emergencies/{id}/status           - Update status
GET    /medical-emergencies/stats/event/{id}      - Event statistics
```

#### Lost Persons
```
POST   /lost-persons/                  - Report lost person
GET    /lost-persons/                  - List reports
GET    /lost-persons/{id}              - Get report
PATCH  /lost-persons/{id}/status       - Update status
GET    /lost-persons/search/active     - Active reports
```

#### Facilities
```
POST   /facilities/                         - Create facility
GET    /facilities/                         - List facilities
GET    /facilities/{id}                     - Get facility
PUT    /facilities/{id}                     - Update facility
DELETE /facilities/{id}                     - Delete facility
GET    /facilities/nearby/search            - Find nearby
```

#### Washroom Facilities
```
POST   /washroom-facilities/                - Create washroom
GET    /washroom-facilities/                - List washrooms
GET    /washroom-facilities/{id}            - Get washroom
PUT    /washroom-facilities/{id}            - Update washroom
PATCH  /washroom-facilities/{id}/status     - Update status
DELETE /washroom-facilities/{id}            - Delete washroom
```

#### Feedback
```
POST   /feedback/                           - Submit feedback
GET    /feedback/                           - List feedback
GET    /feedback/event/{id}/stats           - Event statistics
GET    /feedback/event/{id}/recent          - Recent feedback
```

#### Alerts
```
POST   /alerts/                     - Create alert
GET    /alerts/                     - List alerts
GET    /alerts/{id}                 - Get alert
PATCH  /alerts/{id}/deactivate      - Deactivate alert
POST   /alerts/weather              - Create weather alert
GET    /alerts/weather              - List weather alerts
```

### Example Request

```bash
# Create an event
curl -X POST "http://localhost:8000/events/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Conference 2025",
    "description": "Annual technology conference",
    "start_time": "2025-12-01T09:00:00",
    "end_time": "2025-12-01T18:00:00",
    "location": "Convention Center",
    "capacity": 5000,
    "organizer_id": "ORG123"
  }'
```

---

## 📸 Screenshots

### Web Portal
*Coming soon - Add screenshots of your web dashboard here*

### Mobile App
*Coming soon - Add screenshots of your Flutter app here*

---

## 📁 Project Structure

```
Crowd_Management_System/
│
├── 📱 app_crowd_buddy/              # Flutter Mobile Application
│   ├── lib/
│   │   ├── main.dart                # App entry point
│   │   ├── models/                  # Data models
│   │   ├── pages/                   # UI screens
│   │   ├── services/                # API services
│   │   ├── utils/                   # Utilities
│   │   └── widgets/                 # Reusable widgets
│   ├── android/                     # Android configuration
│   ├── ios/                         # iOS configuration
│   └── pubspec.yaml                 # Flutter dependencies
│
├── 🖥️ cms_web_frontend/             # React Web Portal
│   ├── src/
│   │   ├── components/
│   │   │   ├── pages/               # Page components
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── EventsPage.tsx
│   │   │   │   ├── EventDashboard.tsx
│   │   │   │   ├── MedicalPage.tsx
│   │   │   │   ├── LostPersonsPage.tsx
│   │   │   │   ├── WashroomFacilitiesPage.tsx
│   │   │   │   ├── EmergencyExitsPage.tsx
│   │   │   │   └── FeedbackPage.tsx
│   │   │   └── widgets/             # Reusable components
│   │   ├── services/                # API services
│   │   │   ├── api.ts
│   │   │   ├── eventService.ts
│   │   │   ├── medicalService.ts
│   │   │   ├── washroomService.ts
│   │   │   └── feedbackApi.ts
│   │   ├── utils/
│   │   │   └── constants.ts         # API URLs
│   │   └── App.tsx                  # Main app component
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── 🔧 backend/                       # FastAPI Backend
│   ├── routes/                       # API route handlers
│   │   ├── auth.py                  # Authentication
│   │   ├── events.py                # Event management
│   │   ├── crowd_density.py         # Crowd analysis
│   │   ├── medical_emergencies.py   # Medical emergencies
│   │   ├── lost_persons.py          # Lost person tracking
│   │   ├── facilities.py            # Facility management
│   │   ├── washroom_facilities.py   # Washroom management
│   │   ├── feedback.py              # Feedback system
│   │   ├── alerts.py                # Alert system
│   │   └── inference.py             # AI inference
│   ├── tests/                        # Test suites
│   ├── outputs/                      # AI output files
│   ├── main.py                       # FastAPI app
│   ├── models.py                     # Pydantic models
│   ├── database.py                   # Database connection
│   ├── config.py                     # Configuration
│   ├── inference_utils.py            # AI utilities
│   ├── requirements.txt              # Python dependencies
│   └── README.md                     # Backend docs
│
├── 📊 samplecrowd/                   # Sample crowd images
├── 📄 README.md                      # This file
└── 📜 LICENSE                        # License file
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_events.py

# Run specific test
pytest tests/test_events.py::test_create_event
```

### Frontend Tests
```bash
cd cms_web_frontend

# Run tests
npm run test

# Type checking
npm run typecheck
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards
- Follow PEP 8 for Python code
- Use ESLint rules for TypeScript/React
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 👥 Team

**Project Team Members**:
- Anshika Agarwal
- Kartavya ([@Kartavya2906](https://github.com/Kartavya2906))
- *Add other team members*

**Faculty Advisor**: *Your faculty name*

**Institution**: *Your college/university name*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **FastAPI** - Modern web framework for building APIs
- **React** - Frontend library
- **Flutter** - Mobile app framework
- **MongoDB** - Database solution
- **Lightweight Crowd Counting (LWCC)** - AI crowd counting model
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful icon library

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/Kartavya2906/Crowd_Management_System/issues)
- **Email**: *your-email@example.com*
- **Documentation**: See `backend/README.md` and `cms_web_frontend/README.md`

---

## 🔮 Future Enhancements

- [ ] Real-time WebSocket updates for live monitoring
- [ ] Push notifications for mobile app
- [ ] Integration with IoT sensors for automated density tracking
- [ ] Advanced analytics with machine learning predictions
- [ ] Multi-language support (i18n)
- [ ] Offline mode for mobile app
- [ ] Export reports to PDF/Excel
- [ ] Google Maps integration
- [ ] Voice commands for emergency reporting
- [ ] Integration with weather APIs

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ by the CrowdBuddy Team**

[🔝 Back to Top](#-crowdbuddy---intelligent-crowd-management-system)

</div>
