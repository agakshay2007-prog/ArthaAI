# ArthaAI — Intelligent Personal Finance & Wealth Management System

ArthaAI is an enterprise-grade full-stack personal finance and autonomous intelligence platform. This repository represents the integrated implementation of **Phase 1 (Full-Stack Architecture)**, **Phase 2 (Premium Fintech Dashboard)**, and **Phase 3 (Enterprise Authentication & User Management)**.

---

## 🏛️ Architecture Overview

The project is cleanly decoupled into client and server workspaces with strict separation of concerns, enterprise security, and strong TypeScript typings:

```
ArthaAI/
├── backend/                        # Node.js + Express + TypeScript API Server
│   ├── src/
│   │   ├── config/                 # Environment variables & MongoDB Atlas lifecycle
│   │   │   ├── database.ts         # Mongoose connection manager & health hooks
│   │   │   └── env.ts              # Strongly-typed environment schema & validation
│   │   ├── controllers/            # Route controllers
│   │   │   ├── auth.controller.ts  # Registration, login, logout, profile & password
│   │   │   └── health.controller.ts# Liveness, readiness, and diagnostics probes
│   │   ├── middleware/             # Express middlewares
│   │   │   ├── auth.middleware.ts  # HttpOnly cookie & Bearer JWT authentication guard
│   │   │   ├── errorHandler.ts     # Centralized error sanitizer & response pipeline
│   │   │   ├── notFoundHandler.ts  # Standardized 404 handler
│   │   │   └── rateLimit.middleware.ts # IP rate limiter for sensitive auth routes
│   │   ├── models/                 # Mongoose schemas & data models
│   │   │   └── user.model.ts       # User model with bcrypt hashing & JSON sanitization
│   │   ├── routes/                 # Express API routes
│   │   │   ├── auth.route.ts       # /api/auth authentication endpoints
│   │   │   ├── health.route.ts     # /api/health probes & telemetry
│   │   │   └── index.ts            # Central API route gateway
│   │   ├── types/                  # Backend TypeScript interfaces & declarations
│   │   │   └── index.ts
│   │   ├── utils/                  # Cryptography, tokens & response formatters
│   │   │   ├── apiError.ts         # Custom AppError operational hierarchy
│   │   │   ├── apiResponse.ts      # Standardized API response builder
│   │   │   ├── asyncHandler.ts     # Async Promise-exception wrapper
│   │   │   └── token.ts            # JWT signing, verification & cookie management
│   │   ├── app.ts                  # Express application setup, security stack & cookies
│   │   └── server.ts               # HTTP server bootstrap & graceful shutdown hooks
│   ├── tests/                      # Automated test suites
│   │   └── auth.test.ts            # 16 automated tests covering auth, JWT, bcrypt & DB degradation
│   ├── .env.example                # Sanitized backend environment template
│   ├── package.json                # Backend dependencies, build & test scripts
│   └── tsconfig.json               # Backend TypeScript configuration
│
├── frontend/                       # React 18 + Vite + TypeScript Client
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── components/             # Reusable UI & view components
│   │   │   ├── auth/               # Authentication Views & Modals
│   │   │   │   ├── ForgotPasswordModal.tsx # Simulated password recovery dialog
│   │   │   │   ├── LoginView.tsx   # Premium dark navy glassmorphic login interface
│   │   │   │   ├── RegisterView.tsx# Account registration with password strength meter
│   │   │   │   └── UserProfileModal.tsx # Profile editor & password change modal
│   │   │   ├── dashboard/          # Financial dashboard cards & visual analytics
│   │   │   │   ├── AIAssistantCard.tsx # Natural language finance assistant preview
│   │   │   │   ├── FinancialCharts.tsx # Interactive Income vs Expense & category charts
│   │   │   │   ├── FinancialHealthCard.tsx # Health score & savings rate metrics
│   │   │   │   ├── MetricCards.tsx # Total balance, income, expenses & savings cards
│   │   │   │   ├── RecentTransactionsCard.tsx # Filterable transaction ledger
│   │   │   │   └── SavingsGoalsCard.tsx # Interactive target progress bars
│   │   │   ├── layout/             # Master app shell
│   │   │   │   ├── Header.tsx      # Top bar with user profile, date filter & actions
│   │   │   │   └── Sidebar.tsx     # Responsive collapsable navigation bar
│   │   │   ├── modals/             # Transaction, goal & system status dialogs
│   │   │   │   ├── AddGoalModal.tsx
│   │   │   │   ├── AddTransactionModal.tsx
│   │   │   │   └── SystemStatusModal.tsx # Live full-stack architecture probe
│   │   │   └── views/              # Full page views
│   │   │       ├── AIAssistantView.tsx
│   │   │       ├── BillsPaymentsView.tsx
│   │   │       ├── BudgetingView.tsx
│   │   │       ├── DashboardView.tsx
│   │   │       ├── ReportsAnalyticsView.tsx
│   │   │       ├── SavingsGoalsView.tsx
│   │   │       ├── SettingsView.tsx
│   │   │       └── TransactionsView.tsx
│   │   ├── context/                # React state context
│   │   │   └── AuthContext.tsx     # Global authentication provider with guest mode
│   │   ├── data/                   # Identified frontend demo data
│   │   │   └── mockFinanceData.ts
│   │   ├── services/               # API clients
│   │   │   ├── api.ts              # Health & telemetry service
│   │   │   └── auth.ts             # Auth REST API service with HttpOnly credentials
│   │   ├── types/                  # Frontend TypeScript definitions
│   │   │   ├── auth.ts             # Auth user, payloads & responses
│   │   │   ├── finance.ts          # Financial models & filter definitions
│   │   │   └── index.ts            # System health interfaces
│   │   ├── App.tsx                 # Root application with auth gating & dashboard shell
│   │   ├── index.css               # Tailwind CSS theme & glassmorphic utilities
│   │   └── main.tsx                # Frontend bootstrap
│   ├── .env.example                # Example frontend environment variables
│   ├── index.html                  # HTML5 entry template
│   ├── package.json                # Frontend dependencies & build scripts
│   ├── postcss.config.js           # PostCSS configuration
│   ├── tailwind.config.js          # Tailwind CSS design system config
│   ├── tsconfig.json               # Frontend TypeScript configuration
│   └── vite.config.ts              # Vite bundler configuration & proxy
│
├── .gitignore                      # Security-focused ignore rules
├── package.json                    # Workspace script coordinator
└── README.md                       # Comprehensive platform documentation
```

---

## 🔐 Phase 3: Authentication & Security Architecture

### 1. Database Model (`User`)
- **Full Name**: Trimmed string with min/max length validation.
- **Email Address**: Normalized to lowercase, strictly validated for RFC-compliant email formats, enforced with unique MongoDB indexing.
- **Password Hash**: Irreversibly hashed using `bcrypt` (10 salt rounds). Excluded from default queries (`select: false`) and automatically omitted from all serialized JSON responses.
- **Phone Number**: Optional sanitized string.
- **Account Status**: Enum (`active`, `suspended`, `pending`).
- **Email Verification**: Boolean flag (`isEmailVerified`).
- **Timestamps**: Automatic `createdAt` and `updatedAt`.

### 2. Token & Session Management
- **Short-Lived JWT Access Tokens**: Signed using HMAC-SHA256 with user `id`, `email`, and `accountStatus`. Configured to expire in 7 days by default (customizable via `JWT_EXPIRES_IN`).
- **Secure HttpOnly Cookies**: Sent with `httpOnly: true`, `sameSite: 'lax'`, and dynamic `secure: true` in production environments. Tokens cannot be read by browser JavaScript, protecting against XSS credential theft.
- **Dual Bearer Support**: The authentication middleware accepts both incoming HttpOnly cookies and `Authorization: Bearer <token>` headers, enabling both web application and future mobile/REST clients.

### 3. Rate Limiting
- Built using `express-rate-limit`.
- Applied directly to sensitive authentication endpoints (`/api/auth/*`).
- Restricts requests to 15 attempts per 15-minute window per IP to eliminate brute-force and credential-stuffing vulnerabilities.

### 4. Database-Unconfigured Graceful Degradation
- If MongoDB Atlas credentials are not yet specified in `backend/.env`, the system does **not** crash or fabricate fake data.
- Calls to database-dependent endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/profile`, `/api/auth/change-password`) cleanly return `503 Service Unavailable` with a descriptive message prompting the operator to configure `MONGODB_URI`.
- The frontend provides an instant **Guest Demo Mode (Alex Morgan)** so evaluators can test the entire application and interactive dashboard without requiring an active database cluster.

---

## 📡 Authentication REST API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public (Rate-limited) | Creates a new user, hashes password, sets auth cookie & returns sanitized user |
| `POST` | `/api/auth/login` | Public (Rate-limited) | Authenticates email & password, sets auth cookie & returns token + user |
| `POST` | `/api/auth/logout` | Authenticated / Public | Clears the HttpOnly session cookie |
| `GET` | `/api/auth/me` | Authenticated | Validates session via cookie or Bearer token and returns authenticated user |
| `PATCH` | `/api/auth/profile` | Authenticated | Updates current user full name and phone number |
| `PATCH` | `/api/auth/change-password` | Authenticated | Verifies old password and updates to new password hash |

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
API_PREFIX=/api

# MongoDB Atlas
# If omitted or unconfigured, server runs gracefully in unconfigured mode
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/artha_ai?retryWrites=true&w=majority

# JWT & Authentication Security
JWT_SECRET=artha_ai_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d
COOKIE_NAME=artha_auth_token
COOKIE_MAX_AGE_MS=604800000
BCRYPT_SALT_ROUNDS=10
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🚀 Getting Started & Execution

### 1. Installation
Install root, backend, and frontend packages:
```bash
npm run install:all
```

### 2. Run Automated Test Suite
Run the 16 automated backend authentication and health unit/integration tests:
```bash
npm run test:backend
# or
npm test
```

### 3. Production Build
Build both backend (TypeScript compilation to `dist/`) and frontend (Vite bundler to `dist/`):
```bash
npm run build
```

### 4. Development Servers
Start backend and frontend development servers concurrently:
```bash
# Terminal 1: Backend API (http://localhost:5000)
npm run dev:backend

# Terminal 2: Frontend Client (http://localhost:5173)
npm run dev:frontend
```

---

## 🛡️ Security Audit Checklist
- [x] Passwords irreversibly hashed with bcrypt (salt rounds: 10).
- [x] JWT tokens stored in secure HttpOnly cookies (`SameSite=lax`, `Secure` in production).
- [x] Password hashes strictly excluded from all API responses and MongoDB default projections.
- [x] Sensitive endpoints rate-limited against brute force attacks.
- [x] CORS origin whitelist strictly enforced.
- [x] Strict input validation for emails, full names, and passwords.
- [x] Automated test suite verifying edge cases and database degradation behavior.
- [x] Zero exposed credentials, `.env` files, or secrets in Git tracking.
