# ArthaAI — Intelligent Personal Finance & Wealth Management System

ArthaAI is an enterprise-grade full-stack personal finance and autonomous intelligence platform. This repository represents the integrated implementation of:
- **Phase 1: Professional Full-Stack Architecture & Telemetry Probes**
- **Phase 2: Premium Fintech Dashboard UI & Analytics**
- **Phase 3: Enterprise Authentication & User Management**
- **Phase 4: Persistent Financial Transaction Management**

---

## 🏛️ Architecture Overview

The project is structured with strict client-server decoupling, strong TypeScript contracts, and database-backed financial persistence:

```
ArthaAI/
├── backend/                        # Node.js + Express + TypeScript API Server
│   ├── src/
│   │   ├── config/                 # Environment schema & MongoDB Atlas lifecycle
│   │   │   ├── database.ts         # Mongoose connection manager & health hooks
│   │   │   └── env.ts              # Strongly-typed environment schema & validation
│   │   ├── controllers/            # Route controllers
│   │   │   ├── auth.controller.ts  # Registration, login, logout, profile & password
│   │   │   ├── health.controller.ts# Liveness, readiness, and diagnostics probes
│   │   │   └── transaction.controller.ts # Transaction CRUD, pagination, filters & summary
│   │   ├── middleware/             # Express middlewares
│   │   │   ├── auth.middleware.ts  # HttpOnly cookie & Bearer JWT authentication guard
│   │   │   ├── errorHandler.ts     # Centralized error sanitizer & response pipeline
│   │   │   ├── notFoundHandler.ts  # Standardized 404 handler
│   │   │   └── rateLimit.middleware.ts # IP rate limiter for sensitive auth routes
│   │   ├── models/                 # Mongoose schemas & data models
│   │   │   ├── transaction.model.ts# Transaction model with integer minor units (paise/cents)
│   │   │   └── user.model.ts       # User model with bcrypt hashing & JSON sanitization
│   │   ├── routes/                 # Express API routes
│   │   │   ├── auth.route.ts       # /api/auth authentication endpoints
│   │   │   ├── health.route.ts     # /api/health probes & telemetry
│   │   │   ├── index.ts            # Central API route gateway
│   │   │   └── transaction.route.ts# /api/transactions financial ledger endpoints
│   │   ├── types/                  # Backend TypeScript interfaces & declarations
│   │   │   └── index.ts
│   │   ├── utils/                  # Cryptography, tokens & response formatters
│   │   │   ├── apiError.ts         # Custom AppError operational hierarchy
│   │   │   ├── apiResponse.ts      # Standardized API response builder
│   │   │   ├── asyncHandler.ts     # Async Promise-exception wrapper
│   │   │   └── token.ts            # JWT signing, verification & cookie management
│   │   ├── app.ts                  # Express application setup, security stack & cookies
│   │   └── server.ts               # HTTP server bootstrap & graceful shutdown hooks
│   ├── tests/                      # Automated test suites (34 tests passing)
│   │   ├── auth.test.ts            # 16 automated tests covering auth, JWT, bcrypt & DB degradation
│   │   └── transactions.test.ts    # 18 automated tests covering CRUD, minor units, isolation & math
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
│   │   │   │   ├── FinancialCharts.tsx # Dynamic Cash flow area chart & expense donut
│   │   │   │   ├── FinancialHealthCard.tsx # Health score & savings rate metrics
│   │   │   │   ├── MetricCards.tsx # Net worth, income, expenses & liquid savings
│   │   │   │   ├── RecentTransactionsCard.tsx # Filterable recent ledger card
│   │   │   │   └── SavingsGoalsCard.tsx # Target progress bars
│   │   │   ├── layout/             # Master app shell
│   │   │   │   ├── Header.tsx      # Top bar with user profile, date filter & actions
│   │   │   │   └── Sidebar.tsx     # Responsive navigation bar with live transaction badge
│   │   │   ├── modals/             # Action dialogs
│   │   │   │   ├── AddGoalModal.tsx
│   │   │   │   ├── AddTransactionModal.tsx # Transaction recorder with validation
│   │   │   │   ├── EditTransactionModal.tsx # Edit transaction details & amount
│   │   │   │   ├── DeleteTransactionModal.tsx # Confirm permanent deletion
│   │   │   │   └── SystemStatusModal.tsx # Live full-stack architecture probe
│   │   │   └── views/              # Full page views
│   │   │       ├── AIAssistantView.tsx
│   │   │       ├── BillsPaymentsView.tsx
│   │   │       ├── BudgetingView.tsx
│   │   │       ├── DashboardView.tsx
│   │   │       ├── ReportsAnalyticsView.tsx
│   │   │       ├── SavingsGoalsView.tsx
│   │   │       ├── SettingsView.tsx
│   │   │       └── TransactionsView.tsx # Searchable, paginated transaction ledger & CSV export
│   │   ├── context/                # React state context
│   │   │   └── AuthContext.tsx     # Global authentication provider with guest mode
│   │   ├── data/                   # Identified frontend demo data
│   │   │   └── mockFinanceData.ts
│   │   ├── services/               # API clients
│   │   │   ├── api.ts              # Health & telemetry service
│   │   │   ├── auth.ts             # Auth REST API service with HttpOnly credentials
│   │   │   └── transactions.ts     # Persistent financial transaction API service
│   │   ├── types/                  # Frontend TypeScript definitions
│   │   │   ├── auth.ts             # Auth user, payloads & responses
│   │   │   ├── finance.ts          # Financial models & filter definitions
│   │   │   └── index.ts            # System health interfaces
│   │   ├── App.tsx                 # Root application with auth gating & live ledger state
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

## 💰 Phase 4: Financial Transaction Management

### 1. Database Model (`Transaction`)
- **`userId`**: `ObjectId` reference to `User`, strictly required and indexed. Every record is cryptographically bound to its authenticated owner.
- **`title`**: String (1–150 chars), trimmed.
- **`description`**: String (optional, up to 500 chars).
- **`amountInCents`**: Integer minor units (e.g. 1050 cents = $10.50 / ₹10.50). Validated with `min: 1` and `Number.isInteger`. Eliminates IEEE 754 floating-point rounding errors during financial aggregation.
- **`type`**: Enum (`'income' | 'expense'`).
- **`category`**: String (e.g. `'Salary & Earnings'`, `'Food & Dining'`, `'Technology & SaaS'`).
- **`merchant`**: String (optional, up to 100 chars).
- **`paymentMethod`**: Enum (`'bank_transfer' | 'credit_card' | 'debit_card' | 'upi' | 'cash' | 'other'`).
- **`transactionDate`**: Date (default: `Date.now`).
- **`notes`**: String (optional, up to 1000 chars).
- **`account`**: String (default: `'Primary Checking'`).
- **`status`**: Enum (`'completed' | 'pending'`).
- **Indexes**:
  - Compound: `{ userId: 1, transactionDate: -1 }` (fast chronological ledger queries).
  - Compound: `{ userId: 1, type: 1 }` (inflow vs outflow separation).
  - Compound: `{ userId: 1, category: 1 }` (category-wise spend aggregation).
  - Text: `{ userId: 1, title: 'text', merchant: 'text' }`.

### 2. Financial Calculations & Precision
- All aggregations are performed in integer minor units (`amountInCents`).
- Conversion helpers `amountToCents()` and `centsToAmount()` guarantee precision:
  ```ts
  amountToCents(amount: number) => Math.round(amount * 100)
  centsToAmount(cents: number) => Math.round(cents) / 100
  ```
- **Summary Metrics**:
  - `totalIncome`: Sum of all income transactions in period.
  - `totalExpenses`: Sum of all expense transactions in period.
  - `netBalance`: `totalIncome - totalExpenses`.
  - `totalSavings`: `Math.max(0, netBalance)`.
  - `savingsRatePercentage`: `Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)`.
  - `categoryBreakdown`: Category-wise expense totals and relative percentage share.
  - `monthlyCashFlow`: Chronological monthly inflow, outflow, and net savings points.

### 3. Data Isolation & Security Guarantees
- **No Client Trust for Identity**: The `userId` is obtained strictly from the verified authentication session (`req.user.id`). Any `userId` supplied in request payloads is ignored.
- **Query Scoping**: Every database lookup (`find`, `findOne`, `findOneAndUpdate`, `findOneAndDelete`) is scoped with `{ userId }`. A user can never read, modify, or delete another user's transactions (returns `404 Not Found`).
- **MongoDB Degradation**: If MongoDB Atlas credentials are not configured, calls to `/api/transactions/*` safely return `503 Service Unavailable` with actionable guidance without crashing or exposing stack traces.

---

## 📡 REST API Endpoints

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public (Rate-limited) | Creates a user, hashes password with bcrypt, sets auth cookie & returns user |
| `POST` | `/api/auth/login` | Public (Rate-limited) | Verifies credentials, sets HttpOnly cookie & returns token + user |
| `POST` | `/api/auth/logout` | Authenticated / Public | Clears the HttpOnly session cookie |
| `GET` | `/api/auth/me` | Authenticated | Returns current authenticated user profile |
| `PATCH` | `/api/auth/profile` | Authenticated | Updates user full name and phone number |
| `PATCH` | `/api/auth/change-password` | Authenticated | Verifies old password and updates to new password hash |

### Transaction Endpoints (`/api/transactions`)
| Method | Endpoint | Access | Query Parameters / Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/transactions` | Authenticated | Body: `{ title, amount, type, category, merchant?, paymentMethod?, notes?, account? }` | Records a new transaction with positive amount |
| `GET` | `/api/transactions` | Authenticated | `?page=1&limit=20&search=keyword&type=expense&category=Food&dateFilter=this_month` | Returns paginated, user-isolated transaction records |
| `GET` | `/api/transactions/:id` | Authenticated | URL param `:id` | Retrieves a single transaction with ownership verification |
| `PATCH` | `/api/transactions/:id` | Authenticated | URL param `:id`, Body: partial updates | Updates an existing transaction with ownership verification |
| `DELETE` | `/api/transactions/:id` | Authenticated | URL param `:id` | Deletes a transaction with ownership verification |
| `GET` | `/api/transactions/summary` | Authenticated | `?dateFilter=this_month&startDate=...&endDate=...` | Computes financial totals, savings rate, and category breakdowns |
| `GET` | `/api/transactions/categories` | Authenticated | None | Returns standard and user-custom transaction categories |

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
API_PREFIX=/api

# MongoDB Atlas URI (optional for initial guest preview, required for live DB persistence)
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

## 🚀 Execution & Testing

### 1. Run Automated Unit & Integration Tests (34 Tests)
```bash
npm test
# or
npm --prefix backend test
```
The test suite validates:
- Password hashing with bcrypt
- JWT generation, verification, and tamper rejection
- Cookie and Bearer token authentication
- Transaction creation, retrieval, editing, and deletion
- Positive amount validation & integer minor units
- Cross-user authorization isolation
- Financial summary arithmetic & category breakdowns
- MongoDB unavailable graceful degradation (503)

### 2. Production Build Verification
```bash
npm run build
```
Compiles both backend TypeScript (`tsc`) and frontend bundle (`vite build`).

### 3. Development Server
```bash
# Terminal 1: Backend API (http://localhost:5000)
npm run dev:backend

# Terminal 2: Frontend Client (http://localhost:5173)
npm run dev:frontend
```

---

## 🛡️ Security Audit Checklist
- [x] Every financial record strictly associates with authenticated `userId`.
- [x] `userId` from request body is strictly discarded in favor of verified session context.
- [x] Integer minor units prevent IEEE 754 financial calculation drift.
- [x] Zero-amount and negative-amount transactions rejected at model & controller levels.
- [x] Cross-user access blocked via compound database ownership queries.
- [x] Sensitive authentication routes protected by IP rate limiting (15 req / 15 min).
- [x] HttpOnly, SameSite cookies prevent credential access from browser JavaScript.
- [x] CSV export generated safely from authorized records only.
- [x] 100% test pass rate across 34 automated unit and integration tests.
- [x] Zero secrets, tokens, or credentials stored in repository or frontend code.
