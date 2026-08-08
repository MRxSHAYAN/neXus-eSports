# 🎮 NEXUS ESPORTS — PUBG Mobile Tournament Platform

> A full-stack eSports tournament management application engineered for **PUBG Mobile** competitive gaming. Features real-time slot tracking, team registration with payment proof upload, automated slot management, and an integrated admin portal.

---

## 🌟 Key Features

- **🏆 Tournament Management**: View live, upcoming, and completed PUBG Mobile tournaments with dynamic slot remaining indicators.
- **📝 Seamless Team Registration**: Squad & Duo team registration with captain details, player IDs, and payment verification.
- **💳 Payment Proof Handling**: Support for **Easypaisa**, **JazzCash**, and **Bank Transfer** with image receipt uploads powered by Multer.
- **🛡️ Dual-Mode Database Engine**: Connects to MongoDB via Mongoose with an automatic **In-Memory Fallback** store ensuring 100% uptime during development or network outages.
- **📊 Protected Admin Dashboard**: Full admin panel to inspect pending registrations, review payment screenshots, approve/reject teams, update bank details, and manage tournaments.
- **⚡ High-Performance Frontend**: Built on **Astro 5** for fast page loads and custom CSS/Tailwind styling with dark gaming aesthetics.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Astro 5](https://astro.build/)
- **Styling**: Vanilla CSS + Tailwind CSS (Cyberpunk/Dark eSports Theme)
- **State & Interactions**: ES6 JavaScript with dynamic DOM components

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) (with In-Memory fallback)
- **File Processing**: [Multer](https://github.com/expressjs/multer) (Multipart form data & receipt uploads)
- **CORS & Middleware**: Express CORS, Static File Serving

---

## 📁 Project Architecture

```text
neXus eSports/
├── package.json               # Root scripts (Concurrent Frontend + Backend execution)
├── vercel.json                # Vercel deployment configuration
├── .gitignore                 # Environment & build git-ignore rules
├── README.md                  # Project documentation
│
├── backend/                   # Node.js + Express REST API
│   ├── config/                # DB setup & dual-mode fallback logic
│   ├── controllers/           # Business logic (Teams, Tournaments, Bank, Admin)
│   ├── models/                # Mongoose Models (Team.js, Tournament.js)
│   ├── routes/                # Express API Route declarations
│   ├── uploads/               # Uploaded payment screenshots directory
│   └── index.js               # API Server Entry Point
│
└── frontend/                  # Astro 5 Web Application
    ├── public/                # Static assets (Banners, Favicons, Icons)
    └── src/
        ├── components/        # Reusable UI components (Navbar, Footer, Cards)
        ├── layouts/           # Astro page layouts
        └── pages/             # File-based routes
            ├── index.astro            # Homepage
            ├── tournaments.astro      # Tournament listings
            ├── register.astro         # Registration form & payment upload
            ├── rules.astro            # Fair play & match rules
            ├── contact.astro          # Support page
            └── admin/                 # Admin Dashboard Pages
                ├── login.astro        # Admin Login
                ├── index.astro        # Analytics & Stats
                ├── teams.astro        # Team Verification & Approval
                ├── tournaments.astro  # Tournament CRUD Manager
                ├── bank.astro         # Payment Accounts Manager
                └── settings.astro     # System Settings
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **MongoDB** *(Optional)*: Local MongoDB instance or MongoDB Atlas URI (App gracefully defaults to In-Memory mode if DB is unavailable).

### 1. Installation
Clone the repository and install all dependencies for root, backend, and frontend with a single command:

```bash
npm run install:all
```

### 2. Environment Setup

Create a `.env` file in the `backend/` directory:

```env
# backend/.env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/nexus_esports
CORS_ORIGIN=http://localhost:4321
```

### 3. Run Development Server
Start both Backend API (`localhost:5000`) and Frontend (`localhost:4321`) concurrently:

```bash
npm run dev
```

Visit **`http://localhost:4321`** in your browser to view the application!

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Check API & Database status |
| `GET` | `/api/tournaments` | Fetch list of all tournaments |
| `POST` | `/api/tournaments` | Create a new tournament (Admin) |
| `PUT` | `/api/tournaments/:id` | Update existing tournament details (Admin) |
| `DELETE` | `/api/tournaments/:id` | Delete a tournament (Admin) |
| `GET` | `/api/teams` | Fetch registered teams |
| `POST` | `/api/teams` | Register a new team (handles file upload) |
| `GET` | `/api/bank` | Fetch active payment receiving accounts |
| `PUT` | `/api/bank` | Update payment receiving accounts (Admin) |
| `GET` | `/api/admin/stats` | Retrieve admin dashboard analytics |
| `GET` | `/api/admin/teams` | Fetch all teams for verification |
| `PATCH` | `/api/admin/teams/:id/status` | Approve or Reject team registration |
| `DELETE` | `/api/admin/teams/:id` | Delete team registration |

---

## 🛡️ Admin Portal Access

To access the admin dashboard:
1. Navigate to **`http://localhost:4321/admin/login`**
2. Login credentials:
   - **Username**: `admin`
   - **Password**: `nexus2026`
3. Manage teams, inspect payment receipts, approve registrations, and create tournaments.

---

## 📦 Scripts Overview

From the repository root:

- `npm run dev`: Runs backend and frontend dev servers concurrently.
- `npm run dev:backend`: Starts backend server with `nodemon`.
- `npm run dev:frontend`: Starts frontend Astro dev server.
- `npm run build`: Builds frontend production assets (`dist/`).
- `npm run start`: Starts production servers concurrently.
- `npm run install:all`: Installs root, backend, and frontend npm packages.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
