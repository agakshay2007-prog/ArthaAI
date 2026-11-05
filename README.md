# ArthaAI — Intelligent Personal Finance & Wealth Management System

ArthaAI is an enterprise-grade full-stack personal finance and autonomous intelligence platform. This repository represents the integrated implementation of:
- **Phase 1: Professional Full-Stack Architecture & Telemetry Probes**
- **Phase 2: Premium Fintech Dashboard UI & Analytics**
- **Phase 3: Enterprise Authentication & User Management**
- **Phase 4: Persistent Financial Transaction Management**
- **Phase 5: Complete Budget Management System & Predictive Velocity Analytics**

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
│   │   │   ├── budget.controller.ts# Budget CRUD, overview, history & velocity analytics
│   │   │   ├── health.controller.ts# Liveness, readiness, and diagnostics probes
│   │   │   └── transaction.controller.ts # Transaction CRUD, pagination, filters & summary
│   │   ├── middleware/             # Express middlewares
│   │   │   ├── auth.middleware.ts  # HttpOnly cookie & Bearer JWT authentication guard
│   │   │   ├── errorHandler.ts     # Centralized error sanitizer & response pipeline
│   │   │   ├── notFoundHandler.ts  # Standardized 404 handler
│   │   │   └── rateLimit.middleware.ts # IP rate limiter for sensitive auth routes
│   │   ├── models/                 # Mongoose schemas & data models
│   │   │   ├── budget.model.ts     # Budget model with integer minor units & threshold validation
│   │   │   ├── transaction.model.ts# Transaction model with integer minor units (paise/cents)
│   │   │   └── user.model.ts       # User model with bcrypt hashing & JSON sanitization
│   │   ├── routes/                 # Express API routes
│   │   │   ├── auth.route.ts       # /api/auth authentication endpoints
│   │   │   ├── budget.route.ts     # /api/budgets budget endpoints
│   │   │   ├── health.route.ts     # /api/health probes & telemetry
│   │   │   ├── index.ts            # Central API route gateway
│   │   │   └── transaction.route.ts# /api/transactions financial ledger endpoints
│   │   ├── services/               # Core computational services
│   │   │   └── budget.service.ts   # Dynamic transaction aggregation, thresholds & forecasting
│   │   ├── types/                  # Backend TypeScript interfaces & declarations
│   │   │   └── index.ts
│   │   ├── utils/                  # Cryptography, tokens & response formatters
│   │   │   ├── apiError.ts         # Custom AppError operational hierarchy
│   │   │   ├── apiResponse.ts      # Standardized API response builder
│   │   │   ├── asyncHandler.ts     # Async Promise-exception wrapper
│   │   │   └── token.ts            # JWT signing, verification & cookie management
│   │   ├── app.ts                  # Express application setup, security stack & cookies
│   │   └── server.ts               # HTTP server bootstrap & graceful shutdown hooks
│   ├── tests/                      # Automated test suites (55 tests passing)
│   │   ├── auth.test.ts            # 16 automated tests covering auth, JWT, bcrypt & DB degradation
│   │   ├── budgets.test.ts         # 21 automated tests covering budget models, math & routes
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
│   │   │   ├── budgets/            # Phase 5 Budget Management Components
│   │   │   │   ├── AddBudgetModal.tsx # Create budget dialog with thresholds & period selection
│   │   │   │   ├── BudgetAnalyticsModal.tsx # Velocity run-rate, Recharts trend & transaction list
│   │   │   │   ├── BudgetCard.tsx  # Dynamic budget card with progress cues & action triggers
│   │   │   │   ├── BudgetProgressBar.tsx # Color-coded progress bar (normal, warning, critical, exceeded)
│   │   │   │   ├── DeleteBudgetModal.tsx # Safe deletion dialog (preserves transactions)
│   │   │   │   └── EditBudgetModal.tsx # Edit budget caps, categories & thresholds
│   │   │   ├── dashboard/          # Financial dashboard cards & visual analytics
│   │   │   │   ├── AIAssistantCard.tsx # Natural language finance assistant preview
│   │   │   │   ├── BudgetOverviewCard.tsx # Dashboard budget discipline gauge & top categories
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
│   │   │       ├── BudgetingView.tsx # Redesigned master budget view with filters & alerts banner
│   │   │       ├── DashboardView.tsx
│   │   │       ├── ReportsAnalyticsView.tsx
│   │   │       ├── SavingsGoalsView.tsx
│   │   │       ├── SettingsView.tsx
│   │   │       └── TransactionsView.tsx # Searchable, paginated transaction ledger & CSV export
│   │   ├── context/                # React state context
│   │   │   └── AuthContext.tsx     # Global authentication provider with guest mode
│   │   ├── data/                   # Identified frontend demo data
│   │   │   └── mockFinanceData.ts  # Demo transactions, budgets & dynamic enrichment helpers
│   │   ├── services/               # API clients
│   │   │   ├── api.ts              # Health & telemetry service
│   │   │   ├── auth.ts             # Auth REST API service with HttpOnly credentials
│   │   │   ├── budgets.ts          # Budget REST API service with full CRUD & analytics
│   │   │   └── transactions.ts     # Persistent financial transaction API service
│   │   ├── types/                  # Frontend TypeScript definitions
│   │   │   ├── auth.ts             # Auth user, payloads & responses
│   │   │   ├── budget.ts           # Phase 5 Budget models, analytics & alert interfaces
│   │   │   ├── finance.ts          # Financial models & filter definitions
│   │   │   └── index.ts            # System health interfaces
│   │   ├── App.tsx                 # Root application with live ledger & budget state
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

## 🎯 Phase 5: Complete Budget Management System

### 1. Database Model (`Budget`)
- **`userId`**: `ObjectId` reference to `User`, strictly required and indexed. Every budget is cryptographically bound to its authenticated owner.
- **`name`**: String (1–150 chars), trimmed.
- **`description`**: String (optional, up to 500 chars).
- **`period`**: Enum (`'monthly' | 'yearly'`).
- **`category`**: String (e.g. `'Food & Dining'`, `'Technology & SaaS'`). Standardized or custom category identifier.
- **`limitInCents`**: Integer minor units (e.g. 50000 cents = $500.00 / ₹500.00). Validated with `min: 1` and `Number.isInteger`. Eliminates IEEE 754 precision drift.
- **`currency`**: String (default: `'USD'`).
- **`startDate`**: Date, validated to be before `endDate`.
- **`endDate`**: Date, boundary for spending transaction matching.
- **`alertThresholds`**: Array of integer percentages (default: `[50, 75, 90, 100]`).
- **`isActive`**: Boolean (default: `true`). Inactive budgets are preserved for historical audit trails without triggering active alerts.
- **Indexes**:
  - Compound: `{ userId: 1, isActive: 1 }` (fast retrieval of active budgets).
  - Compound: `{ userId: 1, category: 1, startDate: 1, endDate: 1 }` (quick budget lookup during transaction processing).
  - Compound: `{ userId: 1, period: 1 }` (filtering by monthly/yearly periods).

### 2. Automatic Transaction-to-Budget Integration
- **Zero Redundant Storage**: Budgets do not store duplicating transaction arrays or stale spend fields.
- **Dynamic Aggregation Pipeline**: Spending is dynamically computed from Phase 4 expense transactions matching:
  $$\text{transaction.userId} = \text{budget.userId} \land \text{type} = \text{'expense'} \land \text{status} = \text{'completed'} \land \text{category} = \text{budget.category} \land \text{startDate} \le \text{transactionDate} \le \text{endDate}$$
- **Integer Arithmetic Calculations**:
  - `actualSpentInCents`: $\sum \text{transaction.amountInCents}$
  - `remainingInCents`: $\text{limitInCents} - \text{actualSpentInCents}$
  - `utilizationPercentage`: $\text{Math.round}((\text{actualSpentInCents} / \text{limitInCents}) \times 100)$
  - Decimal amounts (`limit`, `actualSpent`, `remaining`) are formatted solely for display using `centsToAmount()`.

### 3. Threshold Alert Hierarchy
Budgets dynamically compute their status level and trigger alerts based on utilization percentage:
- `normal`: Utilization $< 50\%$ (Theme: Emerald / Safe)
- `moderate`: $50\% \le \text{utilization} < 75\%$ (Theme: Blue / Active Monitor)
- `warning`: $75\% \le \text{utilization} < 90\%$ (Theme: Amber / Approaching Limit)
- `critical`: $90\% \le \text{utilization} < 100\%$ (Theme: Orange / Imminent Breach)
- `exceeded`: Utilization $\ge 100\%$ (Theme: Rose / Budget Exceeded)
- **Alert Deduplication**: Only the highest breached threshold per budget produces an active warning banner, preventing notification fatigue.

### 4. Predictive Spending Velocity & Forecasting
The budget analytics engine computes:
- **Daily Burn Rate**: $\text{actualSpent} / \text{daysElapsed}$
- **Projected Total Spend**: $\text{dailyBurnRate} \times \text{totalPeriodDays}$
- **Projected Utilization**: $(\text{projectedTotalSpend} / \text{limit}) \times 100$
- **Early Warning Signal**: Indicates whether the user is on pace to exceed their budget before the end of the period.
- **Historical Run-Rate**: Rendered via Recharts smooth area gradient chart.

### 5. Safe Deletion & Isolation Guarantees
- **Transaction Safety**: Deleting a budget removes only the budget cap and alert configuration. Associated financial transactions remain untouched in the ledger.
- **Strict User Scoping**: All operations (`find`, `findById`, `updateOne`, `deleteOne`) enforce `userId: req.user.id`. Cross-user access is impossible and yields `404 Not Found`.

---

## 📡 REST API Endpoints

### Budget Endpoints (`/api/budgets`)
| Method | Endpoint | Access | Query Parameters / Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/budgets` | Authenticated | Body: `{ name, category, period, limit, startDate, endDate, alertThresholds?, description? }` | Creates a new budget with integer minor units |
| `GET` | `/api/budgets` | Authenticated | `?period=monthly&category=Food&isActive=true&page=1&limit=20` | Returns user's budgets with dynamic spent & remaining values |
| `GET` | `/api/budgets/overview` | Authenticated | `?period=monthly` | Returns aggregate limits, total spent, overall %, and recent alerts |
| `GET` | `/api/budgets/history` | Authenticated | `?category=Food&page=1&limit=20` | Returns historical/inactive budgets |
| `GET` | `/api/budgets/:id` | Authenticated | URL param `:id` | Retrieves a single budget with transaction count & status |
| `GET` | `/api/budgets/:id/analytics` | Authenticated | URL param `:id` | Returns daily spend trend, velocity forecasting, and matching transactions |
| `PATCH` | `/api/budgets/:id` | Authenticated | URL param `:id`, Body: partial updates | Updates budget limit, dates, thresholds, or active state |
| `DELETE` | `/api/budgets/:id` | Authenticated | URL param `:id` | Deletes budget cap (preserves transactions) |

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

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public (Rate-limited) | Creates a user, hashes password with bcrypt, sets auth cookie & returns user |
| `POST` | `/api/auth/login` | Public (Rate-limited) | Verifies credentials, sets HttpOnly cookie & returns token + user |
| `POST` | `/api/auth/logout` | Authenticated / Public | Clears the HttpOnly session cookie |
| `GET` | `/api/auth/me` | Authenticated | Returns current authenticated user profile |
| `PATCH` | `/api/auth/profile` | Authenticated | Updates user full name and phone number |
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

### 1. Run Automated Unit & Integration Tests (55 Tests)
```bash
npm test
# or
npm --prefix backend test
```
The test suite validates:
- **Authentication (16 tests)**: Bcrypt hashing, JWT generation/verification/tamper rejection, cookie/Bearer auth, rate limiting, MongoDB degradation.
- **Transactions (18 tests)**: CRUD operations, integer minor units, positive amount validation, cross-user isolation, financial summary arithmetic, category breakdowns.
- **Budgets (21 tests)**: Minor-unit schema validation, negative limit rejection, invalid period/date rejection, dynamic utilization levels, alert deduplication, unauthenticated 401s, unconfigured MongoDB 503s.

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
- [x] Integer minor units prevent IEEE 754 financial calculation drift across transactions and budgets.
- [x] Zero-amount and negative-amount limits rejected at model & controller levels.
- [x] Cross-user access blocked via compound database ownership queries.
- [x] Deleting a budget leaves historical transaction records completely intact.
- [x] Sensitive authentication routes protected by IP rate limiting (15 req / 15 min).
- [x] HttpOnly, SameSite cookies prevent credential access from browser JavaScript.
- [x] CSV export generated safely from authorized records only.
- [x] 100% test pass rate across 55 automated unit and integration tests.
- [x] Zero secrets, tokens, or credentials stored in repository or frontend code.
