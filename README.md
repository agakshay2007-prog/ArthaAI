# ArthaAI — Full-Stack Intelligent Platform Core

ArthaAI is an enterprise-grade full-stack financial and autonomous intelligence platform. This repository contains the Phase 1 decoupled architecture featuring a modern React frontend and a resilient Node.js / Express backend with MongoDB Atlas integration.

---

## 🏛️ Architecture Overview

The project is structured into cleanly decoupled client and server workspaces:

```
ArthaAI/
├── backend/                        # Node.js + Express + TypeScript API Server
│   ├── src/
│   │   ├── config/                 # Environment variables & MongoDB Atlas configuration
│   │   │   ├── database.ts         # Mongoose connection foundation & lifecycle
│   │   │   └── env.ts              # Strongly-typed environment variables
│   │   ├── controllers/            # Route controllers
│   │   │   └── health.controller.ts# Health check controller
│   │   ├── middleware/             # Express middlewares
│   │   │   ├── errorHandler.ts     # Centralized error handler
│   │   │   └── notFoundHandler.ts  # 404 handler
│   │   ├── routes/                 # Express API routes
│   │   │   ├── health.route.ts     # /api/health endpoint
│   │   │   └── index.ts            # Central API route gateway
│   │   ├── types/                  # Backend TypeScript interfaces
│   │   ├── utils/                  # Utility helpers & response formatters
│   │   │   ├── apiError.ts         # Custom AppError class
│   │   │   ├── apiResponse.ts      # Standardized API response builder
│   │   │   └── asyncHandler.ts     # Async route handler wrapper
│   │   ├── app.ts                  # Express application setup & middleware stack
│   │   └── server.ts               # HTTP server bootstrap & graceful shutdown
│   ├── .env.example                # Example backend environment variables
│   ├── package.json                # Backend dependencies & build scripts
│   └── tsconfig.json               # Backend TypeScript configuration
│
├── frontend/                       # React 18 + Vite + TypeScript Client
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ArchitectureOverview.tsx # Phase 1 tech stack overview
│   │   │   ├── HealthMonitor.tsx   # Live health check dashboard & latency probe
│   │   │   └── Navbar.tsx          # Main header navigation
│   │   ├── services/               # API clients & service integrations
│   │   │   └── api.ts              # API client for health checks
│   │   ├── types/                  # Frontend TypeScript definitions
│   │   ├── App.tsx                 # Root application component
│   │   ├── index.css               # Tailwind CSS base & utilities
│   │   └── main.tsx                # Frontend application entry point
│   ├── .env.example                # Example frontend environment variables
│   ├── index.html                  # HTML5 template
│   ├── package.json                # Frontend dependencies & build scripts
│   ├── postcss.config.js           # PostCSS configuration
│   ├── tailwind.config.js          # Tailwind CSS design system config
│   ├── tsconfig.json               # Frontend TypeScript configuration
│   └── vite.config.ts              # Vite bundler configuration & proxy
│
├── .gitignore                      # Security-focused ignore rules
├── package.json                    # Root workspace script coordinator
└── README.md                       # Platform documentation
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + PostCSS + Autoprefixer
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express 4](https://expressjs.com/) + [TypeScript](https://www.typescriptlang.org/)
- **Database ODM**: [Mongoose 8](https://mongoosejs.com/) for MongoDB Atlas
- **Security**: [Helmet](https://helmetjs.github.io/) + [CORS](https://github.com/expressjs/cors)
- **Logging**: [Morgan](https://github.com/expressjs/morgan)
- **Development Tooling**: `tsx` (TypeScript execute & watch)

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18.0.0 or later recommended)
- npm (v9.0.0 or later)
- MongoDB Atlas cluster URI (optional for initial local run, required for database persistence)

### 1. Installation

From the project root:

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

Or via root helper scripts:
```bash
npm run install:all
```

---

## 🔐 Environment Configuration

### Backend (`backend/.env`)
Copy the example file:
```bash
cp backend/.env.example backend/.env
```

Configure your variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/artha_ai?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173
API_PREFIX=/api
```

> **Note**: If `MONGODB_URI` is omitted or empty, the backend runs in a graceful "unconfigured" mode. The server and health checks remain fully operational while reporting the database state.

### Frontend (`frontend/.env`)
Copy the example file:
```bash
cp frontend/.env.example frontend/.env
```

Configure your variables:
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🚀 Running the Application

### Development Mode

Run backend and frontend in separate terminals:

```bash
# Terminal 1: Backend API (runs on http://localhost:5000)
cd backend
npm run dev

# Terminal 2: Frontend Client (runs on http://localhost:5173)
cd frontend
npm run dev
```

Or execute from the project root:
```bash
npm run dev:backend
npm run dev:frontend
```

---

## 🔍 Health-Check API & Probes

The backend provides distinct enterprise-grade telemetry and container probe endpoints:

### 1. Liveness Probe (`GET /api/health/live` or `/health/live`)
Confirms the Node.js / Express process is alive and responsive to incoming requests.
- **Success (`200 OK`)**:
```json
{
  "success": true,
  "message": "Service is alive",
  "data": {
    "service": "ArthaAI Backend API",
    "status": "alive",
    "uptime": 45,
    "timestamp": "2026-11-05T08:55:00.000Z"
  },
  "timestamp": "2026-11-05T08:55:00.000Z"
}
```

### 2. Readiness Probe (`GET /api/health/ready` or `/health/ready`)
Verifies critical infrastructure dependencies (MongoDB Atlas).
- **Ready (`200 OK`)**: Database is connected (`readyState: 1`).
- **Not Ready (`503 Service Unavailable`)**: Database is unconfigured or disconnected.

### 3. Comprehensive Diagnostics (`GET /api/health` or `/health`)
Reports complete system metrics, memory consumption, Node version, platform, and MongoDB lifecycle status.
- **Operational Statuses**:
  - `healthy`: Database connected and operational.
  - `degraded`: Server operational, but database is unconfigured.
  - `unhealthy`: Database connection failed or disconnected.
  - `starting`: Database connection in progress.

---

## 🛡️ Centralized Error Handling

The backend implements an enterprise-grade error pipeline:
- **`AppError`**: Custom error class with HTTP status codes and operational classification.
- **`asyncHandler`**: Wraps asynchronous controllers to catch unhandled Promise rejections.
- **`errorHandler`**: Centralized middleware handling:
  - Custom `AppError` instances
  - Mongoose `ValidationError` and `CastError`
  - MongoDB duplicate key (`11000`)
  - Malformed JSON payloads
- **Environment Isolation**: Stack traces and internal error traces are sanitized and suppressed in `production`.

---

## 🏗️ Build & Verification

To verify production builds:

```bash
# Build backend TypeScript
cd backend && npm run build

# Build frontend Vite bundle
cd ../frontend && npm run build
```

Or from repository root:
```bash
npm run build
```

---

## 🔒 Security Best Practices
- `.gitignore` strictly excludes `.env`, `.env*.local`, certificates, credentials, and build outputs.
- Helmet is configured to add HTTP security headers.
- CORS whitelist restricts browser origin access to configured frontend clients.
- Rate limiting and authentication hooks are prepared for subsequent phases.
