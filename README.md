# 🏛️ Smart Cities Portal

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue?logo=postgresql)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-MIT-green)

A comprehensive, high-fidelity national smart city grievance and municipal operations management system. The platform connects citizens, ward officers, and municipal administrators to report, route, and resolve urban issues efficiently across all 36 States/UTs and 780+ districts of India.

---

## 🚀 Core Modules & Features

### 1. 👤 Citizen Portal
* **Interactive Issue Reporting**: Submit complaints with automatic GPS geocoding or by dropping a pin on a Leaflet map.
* **AI-Powered Photo Detection**: Auto-detects issue category and severity from uploaded photos.
* **Gamified Citizen Rewards**: Earn reward points for verified resolutions, redeemable via the citizen dashboard.
* **Community Voting**: Upvote local issues to increase their priority and urgency.
* **Leaderboard & Ranks**: View top-performing citizens and active local contributors.

### 2. 👮 Officer Console (Jira/GitHub Style)
* **Operations Overview**: A personal dashboard with live caseload KPIs and a dispatch map showing all active complaints in the officer's jurisdiction.
* **Case Workspace**: A systematic, double-column dossier view detailing citizen contact info (with a direct call button), description, photo evidence, and status history.
* **Route Dispatch Optimizer**: An automated route planner that solves the Traveling Salesperson Problem (TSP) using a nearest-neighbor algorithm. It plots the shortest travel sequence connecting all active complaints on a Leaflet map.

### 3. 🛡️ Admin Command Center
* **National Analytics Dashboard**: Interactive drill-down charts mapping complaint distributions across all 36 States/UTs, accompanied by animated period KPI cards.
* **Geospatial Density Heatmap**: A Leaflet heatmap of India visualizing complaint clusters, filterable by *Category* and *Priority*, with pulsing radar rings for emergency issues.
* **Districts & Ward Manager**: High-performance paginated database covering all 780+ districts of India.
* **Emergency Broadcasts**: Send targeted, simulated SMS alerts to citizens or officers based on location.
* **SLA & System Settings**: Configure citizen reward thresholds and target SLA resolution times (saved locally).
* **Reports & Exports**: Generate date-filtered reports and download CSV files with auto-wrapping addresses.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), Leaflet.js (Geospatial Maps), Chart.js (Analytics), Vanilla CSS (Premium glassmorphic styling).
* **Backend**: Node.js, Express, PostgreSQL, JWT (Authentication), Bcrypt (Password Hashing).
* **APIs Used**: OpenStreetMap Nominatim (Reverse Geocoding & Boundaries), Open-Meteo (Fallback Geocoding).

---

## ⚙️ Local Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+)
* [PostgreSQL](https://www.postgresql.org/) (installed and running)

### 1. Database Setup
Create a new PostgreSQL database and execute the schema:
```sql
CREATE DATABASE smart_cities;
-- Run the queries in backend/migration.sql on your database to set up the tables.
```

### 2. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` root (use `.env.example` as a template):
   ```env
   PORT=5000
   DATABASE_URL=postgresql://username:password@localhost:5432/smart_cities
   JWT_SECRET=your_jwt_secret_key
   ```
4. Run the database seeders:
   ```bash
   # Seed 780+ districts of India
   node seed_india_districts.js

   # Seed Suresh and Ramesh as officers across all districts
   node seed_officers.js

   # Create the default Administrator account
   node createAdmin.js
   ```
5. Start the backend server:
   ```bash
   npm start
   ```

### 3. Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` root (use `.env.example` as a template):
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## 🔑 Default Accounts & Credentials

Use these pre-seeded accounts to log in at `http://localhost:5173/login`:

| Portal / Role | Phone Number | Password | Details |
| :--- | :--- | :--- | :--- |
| 🛡️ **Admin Panel** | `9014688922` | `Admin@123` | Accesses the full national command center |
| 👮 **Officer Suresh** | `9111111111` | `Officer@123` | Assigned to odd-numbered districts |
| 👮 **Officer Ramesh** | `9222222222` | `Officer@123` | Assigned to even-numbered districts |
| 👤 **Citizen Account** | *Register a new one* | *Your password* | Sign up in any of the 780+ districts |

---

## 📁 Project Directory Structure

```text
smart_cities/
├── backend/
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection pool setup
│   ├── controllers/
│   │   ├── adminController.js    # Logic for broadcasts, officer registration, and SLAs
│   │   ├── authController.js     # User registration, login, and geocoding
│   │   ├── complaintController.js# Filing, voting, and listing complaints
│   │   └── officerController.js  # Fetching and updating officer complaints
│   ├── data/
│   │   ├── indiaStatesDistricts.json # Core reference list of 780 districts
│   │   └── systemSettings.json   # Saved SLA targets & reward values
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification & role validation
│   ├── models/
│   │   ├── complaintModel.js     # SQL queries for complaints & metrics
│   │   ├── userModel.js          # SQL queries for profiles, OTPs, and officers
│   │   └── wardModel.js          # SQL queries for districts/wards
│   ├── routes/
│   │   ├── adminRoutes.js        # Admin routes definition
│   │   ├── authRoutes.js         # Authentication routes definition
│   │   ├── complaintRoutes.js    # Citizen complaint routes definition
│   │   └── officerRoutes.js      # Officer dashboard routes definition
│   ├── utils/
│   │   ├── mailer.js             # Email notification service
│   │   └── notificationService.js# SMS/In-app notification simulator
│   ├── migration.sql             # Full database schema definition
│   ├── run-migration.js          # Automation script to run migration.sql
│   ├── seed_india_districts.js   # Script to seed all 780 districts
│   ├── seed_officers.js          # Script to register Suresh and Ramesh
│   ├── reset_officers.js         # Script to reset passwords to Officer@123
│   ├── createAdmin.js            # Script to create the admin account
│   └── server.js                 # Express application entry point
└── frontend/
    ├── src/
    │   ├── components/           # Reusable UI components
    │   │   ├── AIDetector.jsx        # AI camera scanner simulator
    │   │   ├── AnimatedButton.jsx    # Custom micro-animated buttons
    │   │   ├── CitizenShell.jsx      # Citizen portal header & layout shell
    │   │   ├── ComingSoon.jsx        # Interactive feature placeholders
    │   │   ├── DistrictSelector.jsx  # Dropdown list of districts by state
    │   │   ├── HeatmapView.jsx       # Leaflet-based geospatial heatmap
    │   │   ├── InteractiveIndiaMap.svg # SVG map of India for landing page
    │   │   ├── LocationPicker.jsx    # Leaflet map picker with auto-fly & boundary drawing
    │   │   ├── MapView.jsx           # SinglePin & MultiPin Leaflet map wrappers
    │   │   ├── NearbyWarning.jsx     # Alert banner for duplicate complaints
    │   │   ├── SkeletonCard.jsx      # Glassmorphic loading skeletons
    │   │   ├── StateSelector.jsx     # Dropdown list of Indian States/UTs
    │   │   ├── StatusBadge.jsx       # Color-coded status badge pill
    │   │   ├── StatusTimeline.jsx    # Vertical audit log timeline
    │   │   ├── Toast.jsx             # Notification toast alerts system
    │   │   └── useTranslation.jsx    # Multilingual translation provider
    │   ├── pages/                # Page components
    │   │   ├── AdminBroadcast.jsx    # SMS broadcast compose & history feed
    │   │   ├── AdminComplaints.jsx   # Admin complaint listing & reassignment
    │   │   ├── AdminOfficers.jsx     # Officer directory list & registration modal
    │   │   ├── AdminOverview.jsx     # Admin analytics, drill-down chart & heatmap
    │   │   ├── AdminPanel.jsx        # Admin sidebar layout & page router
    │   │   ├── AdminReports.jsx      # PDF/CSV exporter & period analytics
    │   │   ├── AdminSettings.jsx     # SLA and rewards settings editor
    │   │   ├── AdminWards.jsx        # District manager table with search/filters
    │   │   ├── CitizenHome.jsx       # Citizen home page, news feed & active reports
    │   │   ├── ComplaintDetail.jsx   # Citizen complaint details & voting
    │   │   ├── HelpSupport.jsx       # Contact form, FAQs, and help desk
    │   │   ├── Leaderboard.jsx       # Citizen ranking & leaderboard
    │   │   ├── Login.jsx             # Phone and password login page
    │   │   ├── NearMe.jsx            # Map of nearby complaints and issues
    │   │   ├── NotFound.jsx          # 404 Error page
    │   │   ├── OfficerDashboard.jsx  # Officer dashboard console & workspace
    │   │   ├── Profile.jsx           # Citizen profile editor & reward points tracker
    │   │   ├── Register.jsx          # Citizen sign up (State/District picker)
    │   │   ├── ResetPassword.jsx     # Forgot password OTP recovery flow
    │   │   ├── Rewards.jsx           # Rewards info panel
    │   │   ├── RouteOptimization.jsx # TSP nearest-neighbor route optimizer
    │   │   ├── Settings.jsx          # Citizen settings & language selector
    │   │   ├── SubmitComplaint.jsx   # Citizen multi-step complaint wizard
    │   │   └── TrackComplaints.jsx   # Citizen personal complaint tracker list
    │   ├── api.js                # Centralized Axios HTTP client configurations
    │   ├── index.css             # Main stylesheet & CSS variables design tokens
    │   └── main.jsx              # React application bootstrap entry point
    ├── index.html                # Main HTML document template
    └── package.json              # Frontend dependencies configuration
```

---

## 🔌 Key API Endpoints

| Category | Method | Endpoint | Description | Access |
| :--- | :---: | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register a new citizen account | Public |
| **Auth** | `POST` | `/api/auth/login` | Login to receive a JWT token | Public |
| **Complaints** | `POST` | `/api/complaints` | File a new complaint | Citizen |
| **Complaints** | `GET` | `/api/complaints` | List citizen's filed complaints | Citizen |
| **Officer** | `GET` | `/api/officer/complaints` | List complaints assigned to officer | Officer |
| **Officer** | `PUT` | `/api/officer/complaints/:id/status` | Update case status with internal note | Officer |
| **Admin** | `POST` | `/api/admin/officers` | Register and assign a new officer | Admin |
| **Admin** | `POST` | `/api/admin/broadcast` | Send an emergency SMS alert broadcast | Admin |
| **Admin** | `PUT` | `/api/admin/settings` | Update target SLAs and citizen reward points | Admin |

---

## 📸 Screenshots

### 👤 Citizen Portal (Home Page)
![Citizen Home Page](docs/images/citizen_home.png)

### 🛡️ Admin Dashboard (Command Center Overview)
![Admin Dashboard Overview](docs/images/admin_overview.png)

### 👮 Officer Dashboard (Operations Overview)
![Officer Dashboard Overview](docs/images/officer_overview.png)

### 👮 Officer Workspace (Jira/GitHub Case Dossier)
![Officer Workspace](docs/images/officer_workspace.png)

### 🗺️ Officer Route Planner (TSP Optimization Map)
![Route Planner](docs/images/route_planner.png)

### 👤 Citizen Portal (Boundary-aware Location Picker)
![Citizen Location Picker](docs/images/submit_complaint.png)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Rishik Parimalla**  
*B.Tech Computer Science Engineering*

*   📧 **Email**: <a href="mailto:rishikparimala@gmail.com">rishikparimala@gmail.com</a>
*   💼 **LinkedIn**: [Rishik Parimalla](https://www.linkedin.com/in/rishik-parimalla-/)
*   🐙 **GitHub**: [rishik0910](https://github.com/rishik0910)



