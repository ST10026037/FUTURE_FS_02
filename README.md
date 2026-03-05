# LeadFlow CRM — Client Lead Management System

A full-stack Mini CRM that captures leads from a public contact form, then lets admins track, update, and manage those leads from a secure dashboard — mirroring how real businesses manage incoming clients.

---

## 🎯 What It Does

**Public users** visit `/contact` and fill in a form. That submission is saved as a **lead** in the database.

**Admins** log in at `/login` and get access to the full dashboard where they can:
- View all incoming leads at a glance
- Move leads through the sales pipeline (`New → Contacted → Converted → Lost`)
- Add follow-up notes after each call or email
- Search, filter, and delete leads
- View analytics including conversion rates and source breakdowns
- Add leads manually without using the contact form

---

## ✨ Features

| Feature | Description |
|---|---|
| **Contact Form** | Public page — visitors submit name, email, phone, source, message |
| **Admin Dashboard** | Protected page listing all leads with search & filter |
| **Lead Drawer** | Slide-in panel to view details, update status, add notes |
| **Status Tracking** | New → Contacted → Converted → Lost |
| **Follow-up Notes** | Timestamped notes per lead |
| **Delete Lead** | Two-step confirmation delete |
| **Add Lead Manually** | Admin can add leads directly from the dashboard |
| **Analytics Page** | Visual breakdown — status bar chart, 7-day activity, source breakdown, KPIs |
| **Search & Filter** | Live search by name/email/source + status dropdown filter |
| **JWT Auth** | Stateless authentication — token stored in localStorage |
| **Toast Notifications** | Real-time success/error feedback on all actions |
| **Auto-logout** | Expired/invalid token → automatic redirect to login |

---

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite**
- **React Router v6** — client-side routing
- **Axios** — HTTP client with request/response interceptors
- **Vanilla CSS** — custom dark-mode design system

### Backend
- **Node.js** + **Express 5**
- **MongoDB Atlas** + **Mongoose**
- **JWT** (`jsonwebtoken`) — authentication
- **dotenv** — environment configuration
- **nodemon** — development hot-reload

---

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have the following installed on your machine:

- **[Node.js](https://nodejs.org/) ≥ 18** — includes `npm` (the package manager used to install dependencies)
- **A [MongoDB Atlas](https://www.mongodb.com/atlas) account** — free tier is sufficient. You'll need a connection string from your cluster.

> You can check your Node.js version by running `node -v` in your terminal.

---

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ClientLeadManagementSystem
```

---

### 2. Set up environment variables

The backend requires a `.env` file to store sensitive config (database URI, JWT secret, admin credentials). This file is **not included in the repo** for security reasons — you must create it yourself.

```bash
cd backend
cp .env.example .env
```

Then open `backend/.env` and fill in your own values:

```env
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<any long random string, e.g. "mysupersecretkey123">
ADMIN_EMAIL=admin@demo.com
ADMIN_PASSWORD=Admin123!
PORT=5001
```

> **Where to get `MONGO_URI`:** Log into MongoDB Atlas → your cluster → **Connect** → **Drivers** → copy the connection string and replace `<password>` with your actual DB password.

---

### 3. Install dependencies

The project has two separate Node.js apps (backend and frontend), each with their own `package.json`. You need to install dependencies for **both**.

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

> `npm install` reads the `package.json` in each folder and downloads all required packages into a local `node_modules/` folder. This folder is excluded from Git (via `.gitignore`) which is why you need to run this step yourself after cloning.

---

### 4. Run the app in development

You'll need **two terminals open at the same time** — one for the backend server, one for the frontend dev server.

**Terminal 1 — Backend API**
```bash
cd backend
npm run dev
# ✅ Server running on http://localhost:5001
# ✅ MongoDB connected successfully
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
# ✅ App running at http://localhost:5173
```

Open your browser and go to **http://localhost:5173** to use the app.

---

## 🔑 Admin Credentials

| Email | Password |
|---|---|
| `admin@demo.com` | `Admin123!` |

> ⚠️ Change these in `backend/.env` before deploying to production.

---

## 📋 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | Admin login — returns JWT |
| `POST` | `/api/leads` | ❌ | Submit a lead (public contact form) |
| `GET` | `/api/leads` | ✅ | List all leads |
| `PATCH` | `/api/leads/:id/status` | ✅ | Update lead status |
| `POST` | `/api/leads/:id/notes` | ✅ | Add a follow-up note |
| `DELETE` | `/api/leads/:id` | ✅ | Delete a lead |

---

## 🔄 Lead Lifecycle

```
Visitor fills /contact form
        ↓
Lead saved to MongoDB  (status: New)
        ↓
Admin sees it on Dashboard
        ↓
Admin contacts them → status: Contacted
        ↓
Deal closed  → status: Converted 🎉
   OR
No response → status: Lost
```

---

## 📁 Project Structure

```
ClientLeadManagementSystem/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js     # JWT verification
│   ├── models/Lead.js         # Mongoose schema (Lead + Notes)
│   ├── routes/
│   │   ├── auth.js            # Login endpoint
│   │   └── leads.js           # CRUD endpoints
│   ├── .env                   # Environment variables (not committed)
│   ├── .env.example           # Template for .env
│   └── server.js              # Express entry point
└── frontend/
    ├── index.html
    └── src/
        ├── api/client.js      # Axios instance + all API functions
        ├── components/
        │   ├── LeadDrawer.jsx # Lead detail side panel
        │   ├── Sidebar.jsx    # Navigation
        │   ├── StatusBadge.jsx# Coloured status chip
        │   └── Toast.jsx      # Notification system
        ├── pages/
        │   ├── Analytics.jsx  # Charts & KPI dashboard
        │   ├── ContactForm.jsx# Public lead submission form
        │   ├── Dashboard.jsx  # Main admin view
        │   └── Login.jsx      # Admin login
        ├── index.css          # Design system (dark mode)
        └── main.jsx           # React entry point
```
