# ArthaAI — Intelligent Personal Finance & Wealth Management System

ArthaAI is an enterprise-grade full-stack personal finance and autonomous intelligence platform. This repository represents the integrated implementation of:
- **Phase 1: Professional Full-Stack Architecture & Telemetry Probes**
- **Phase 2: Premium Fintech Dashboard UI & Analytics**
- **Phase 3: Enterprise Authentication & User Management**
- **Phase 4: Persistent Financial Transaction Management**
- **Phase 5: Complete Budget Management System & Predictive Velocity Analytics**
- **Phase 6: Complete Savings Goals & Financial Planning Engine**
- **Phase 7: Bills, Payments & Recurring Expenses Management Engine**
- **Phase 8: AI Financial Assistant & Gemini Intelligence Engine**
- **Phase 9: Comprehensive Reports, Analytics & Financial Export Engine**
- **Phase 10: Complete Security Audit, Live Integration, Deployment & Production Launch**

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
│   │   │   ├── ai.controller.ts    # AI chat, conversation history & financial insights
│   │   │   ├── auth.controller.ts  # Registration, login, logout, profile & password
│   │   │   ├── bill.controller.ts  # Bills CRUD, payments, reminders & analytics
│   │   │   ├── budget.controller.ts# Budget CRUD, overview, history & velocity analytics
│   │   │   ├── health.controller.ts# Liveness, readiness, and diagnostics probes
│   │   │   ├── report.controller.ts# Monthly, quarterly, annual, custom reports & exports
│   │   │   ├── savings.controller.ts # Savings goals CRUD, contributions & analytics
│   │   │   └── transaction.controller.ts # Transaction CRUD, pagination, filters & summary
│   │   ├── middleware/             # Express middlewares
│   │   │   ├── auth.middleware.ts  # HttpOnly cookie & Bearer JWT authentication guard
│   │   │   ├── errorHandler.ts     # Centralized error sanitizer & response pipeline
│   │   │   ├── notFoundHandler.ts  # Standardized 404 handler
│   │   │   └── rateLimit.middleware.ts # IP rate limiter for auth and AI chat routes
│   │   ├── models/                 # Mongoose schemas & data models
│   │   │   ├── ai-conversation.model.ts # AI conversation & message history model
│   │   │   ├── bill.model.ts       # Bill model with recurrence rules & minor units
│   │   │   ├── bill-payment.model.ts # Bill payment sub-ledger model
│   │   │   ├── budget.model.ts     # Budget model with integer minor units & threshold validation
│   │   │   ├── goal-contribution.model.ts # Goal contribution sub-ledger model
│   │   │   ├── savings-goal.model.ts # Savings goal model with milestones & minor units
│   │   │   ├── transaction.model.ts# Transaction model with integer minor units (paise/cents)
│   │   │   └── user.model.ts       # User model with bcrypt hashing & JSON sanitization
│   │   ├── routes/                 # Express API routes
│   │   │   ├── ai.route.ts         # /api/ai chat, conversation & insights endpoints
│   │   │   ├── auth.route.ts       # /api/auth authentication endpoints
│   │   │   ├── bill.route.ts       # /api/bills bills & recurring payments endpoints
│   │   │   ├── budget.route.ts     # /api/budgets budget endpoints
│   │   │   ├── health.route.ts     # /api/health probes & telemetry
│   │   │   ├── index.ts            # Central API route gateway
│   │   │   ├── report.route.ts     # /api/reports financial statements & export endpoints
│   │   │   ├── savings.route.ts    # /api/savings-goals endpoints
│   │   │   └── transaction.route.ts# /api/transactions financial ledger endpoints
│   │   ├── services/               # Core computational services
│   │   │   ├── ai/                 # Gemini integration & prompt services
│   │   │   │   ├── financial-context.service.ts # Aggregates ledger context for authenticated user
│   │   │   │   ├── financial-insights.service.ts# Deterministic calculation of health score & metrics
│   │   │   │   ├── gemini.service.ts            # Official Google Gen AI SDK client & error sanitizer
│   │   │   │   └── prompt-builder.service.ts    # System instructions, guardrails & injection defense
│   │   │   ├── reports/            # Financial reporting & export aggregation engine
│   │   │   │   ├── report.service.ts            # Monthly, quarterly, annual, custom report orchestration
│   │   │   │   ├── report-aggregation.service.ts# Multi-module integer minor unit financial rollup
│   │   │   │   ├── report-comparison.service.ts # Period-over-period delta & percentage variance
│   │   │   │   └── report-export.service.ts     # Multi-format generator (PDFKit, ExcelJS, CSV)
│   │   │   ├── bill.service.ts     # Recurrence schedules, reminders & payment ledger
│   │   │   ├── budget.service.ts   # Dynamic transaction aggregation, thresholds & forecasting
│   │   │   └── savings.service.ts  # Goal enrichment, milestones, velocity & recommendations
│   │   ├── types/                  # Backend TypeScript interfaces & declarations
│   │   │   └── index.ts
│   │   ├── utils/                  # Cryptography, tokens & response formatters
│   │   │   ├── apiError.ts         # Custom AppError operational hierarchy
│   │   │   ├── apiResponse.ts      # Standardized API response builder
│   │   │   ├── asyncHandler.ts     # Async Promise-exception wrapper
│   │   │   └── token.ts            # JWT signing, verification & cookie management
│   │   ├── validators/             # Request payload validators
│   │   │   ├── ai.validator.ts     # Chat message & pagination validation
│   │   │   └── report.validator.ts # Report date range & period validation
│   │   ├── app.ts                  # Express application setup, security stack & cookies
│   │   └── server.ts               # HTTP server bootstrap & graceful shutdown hooks
│   ├── tests/                      # Automated test suites (195 tests passing across 24 suites)
│   │   ├── ai.test.ts              # 29 automated tests covering Gemini mocks, health math & routes
│   │   ├── auth.test.ts            # 16 automated tests covering auth, JWT, bcrypt & DB degradation
│   │   ├── bills.test.ts           # 31 automated tests covering recurrence math, payments & routes
│   │   ├── budgets.test.ts         # 21 automated tests covering budget models, math & routes
│   │   ├── reports.test.ts         # 38 automated tests covering aggregation, exports & AI insights
│   │   ├── savings-goals.test.ts   # 23 automated tests covering savings models, milestones & routes
│   │   ├── security-audit.test.ts  # 19 automated tests covering isolation, headers, body limits & sanitization
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
│   │   │   ├── bills/              # Phase 7 Bills & Recurring Payments Components
│   │   │   │   ├── AddBillModal.tsx # Create bill dialog with recurrence & reminders
│   │   │   │   ├── BillAnalyticsModal.tsx # Spending trend Recharts bar chart & annualized cost
│   │   │   │   ├── BillCard.tsx    # Glassmorphic card with countdown, badges & actions
│   │   │   │   ├── BillStatusBadge.tsx # Visual status badge (paid, overdue, due today, etc.)
│   │   │   │   ├── DeleteBillModal.tsx # Safe deletion / archival dialog (preserves transactions)
│   │   │   │   ├── EditBillModal.tsx # Edit bill recurrence, due date & reminder settings
│   │   │   │   ├── PaymentHistoryModal.tsx # Chronological sub-ledger with payment reversal
│   │   │   │   └── RecordPaymentModal.tsx # Payment modal with partial/full calculation & ledger link
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
│   │   │   │   ├── SavingsGoalsCard.tsx # Target progress bars & milestone badges
│   │   │   │   └── UpcomingBillsCard.tsx # Next due obligation, overdue alerts & quick pay
│   │   │   ├── layout/             # Master app shell
│   │   │   │   ├── Header.tsx      # Top bar with user profile, date filter & actions
│   │   │   │   └── Sidebar.tsx     # Responsive navigation bar with live transaction badge
│   │   │   ├── modals/             # Action dialogs
│   │   │   │   ├── AddGoalModal.tsx
│   │   │   │   ├── AddTransactionModal.tsx # Transaction recorder with validation
│   │   │   │   ├── EditTransactionModal.tsx # Edit transaction details & amount
│   │   │   │   ├── DeleteTransactionModal.tsx # Confirm permanent deletion
│   │   │   │   └── SystemStatusModal.tsx # Live full-stack architecture probe
│   │   │   ├── reports/            # Phase 9 Comprehensive Financial Reporting Components
│   │   │   │   ├── AIReportInsights.tsx # Gemini AI executive synthesis with refresh capability
│   │   │   │   ├── BillsObligationsCard.tsx # Recurring liabilities and commitments breakdown
│   │   │   │   ├── BudgetPerformanceChart.tsx # Budget variance and adherence progress bars
│   │   │   │   ├── CashFlowChart.tsx # Recharts bar chart comparing inflow, outflow & net surplus
│   │   │   │   ├── CategoryBreakdownChart.tsx # Recharts donut chart with category variance badges
│   │   │   │   ├── DateRangeSelector.tsx # Presets (Monthly, Quarterly, Annual, Custom) & date pickers
│   │   │   │   ├── ExportReportMenu.tsx # PDF statement, Excel workbook (.xlsx) & CSV export triggers
│   │   │   │   ├── PeriodComparison.tsx # Delta & percentage variance benchmark cards
│   │   │   │   └── ReportOverviewCards.tsx # 6 KPI cards (Inflow, Outflow, Net, Savings Rate, etc.)
│   │   │   ├── savings/            # Phase 6 Savings Goals & Financial Planning Components
│   │   │   │   ├── AddContributionModal.tsx # Deposit/withdrawal modal with real-time balance simulation
│   │   │   │   ├── AddSavingsGoalModal.tsx # Create goal form with category, deadline & color/icon picker
│   │   │   │   ├── ContributionHistoryModal.tsx # Sub-ledger contribution list with reversal support
│   │   │   │   ├── DeleteSavingsGoalModal.tsx # Safe goal deletion modal (preserves ledger transactions)
│   │   │   │   ├── EditSavingsGoalModal.tsx # Edit goal target, deadline, priority & status
│   │   │   │   ├── GoalAnalyticsModal.tsx # Predictive velocity AreaChart, milestones & run-rate
│   │   │   │   └── SavingsGoalCard.tsx # Goal card with progress bar, milestone checkpoints & actions
│   │   │   └── views/              # Full page views
│   │   │       ├── AIAssistantView.tsx
│   │   │       ├── BillsPaymentsView.tsx # Master bills view with summary metrics, reminders & filters
│   │   │       ├── BudgetingView.tsx # Master budget view with filters & alerts banner
│   │   │       ├── DashboardView.tsx # Central dashboard with transactions, budgets, goals & bills
│   │   │       ├── ReportsAnalyticsView.tsx
│   │   │       ├── SavingsGoalsView.tsx # Savings view with recommendations & metrics
│   │   │       ├── SettingsView.tsx
│   │   │       └── TransactionsView.tsx # Searchable, paginated transaction ledger & CSV export
│   │   ├── context/                # React state context
│   │   │   └── AuthContext.tsx     # Global authentication provider with guest mode
│   │   ├── data/                   # Identified frontend demo data
│   │   │   ├── mockFinanceData.ts  # Demo transactions, budgets, savings goals & bills
│   │   │   └── mockReportsData.ts  # Demo reports for monthly, quarterly, annual & custom filters
│   │   ├── services/               # API clients
│   │   │   ├── api.ts              # Health & telemetry service
│   │   │   ├── auth.ts             # Auth REST API service with HttpOnly credentials
│   │   │   ├── bills.ts            # Bills REST API service with payments & analytics
│   │   │   ├── budgets.ts          # Budget REST API service with full CRUD & analytics
│   │   │   ├── reports.ts          # Reports & multi-format export API service (PDF, Excel, CSV)
│   │   │   ├── savings.ts          # Savings goals REST API service with contributions & analytics
│   │   │   └── transactions.ts     # Persistent financial transaction API service
│   │   ├── types/                  # Frontend TypeScript definitions
│   │   │   ├── auth.ts             # Auth user, payloads & responses
│   │   │   ├── bill.ts             # Phase 7 Bills, payments, reminders & analytics interfaces
│   │   │   ├── budget.ts           # Phase 5 Budget models, analytics & alert interfaces
│   │   │   ├── finance.ts          # Financial models & filter definitions
│   │   │   ├── index.ts            # System health interfaces
│   │   │   ├── reports.ts          # Phase 9 Report models, comparisons & export interfaces
│   │   │   └── savings.ts          # Phase 6 Savings goals, contributions & planning interfaces
│   │   ├── App.tsx                 # Root application with live ledger, budget, savings & bills state
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
├── .env.example                    # Centralized reference template for all platform variables
├── .gitignore                      # Security-focused ignore rules
├── ci-pipeline.yml                 # GitHub Actions CI workflow template (tests, builds & audits)
├── netlify.toml                    # Netlify production deployment & security header configuration
├── package.json                    # Workspace script coordinator
├── README.md                       # Comprehensive platform documentation
└── render.yaml                     # Render Infrastructure-as-Code blueprint for backend service
```

---

## 🎯 Phase 7: Bills, Payments & Recurring Expenses Engine

### 1. Database Architecture
- **`Bill` Model (`backend/src/models/bill.model.ts`)**:
  - `userId`: `ObjectId` reference to `User`, strictly required and indexed. Every bill is cryptographically scoped to its authenticated owner.
  - `name`: String (1–150 chars), trimmed.
  - `description`: String (optional, up to 500 chars).
  - `category`: String (e.g. `'Electricity'`, `'Water'`, `'Internet'`, `'Mobile'`, `'Rent'`, `'Insurance'`, `'Education'`, `'Loan EMI'`, `'Streaming subscriptions'`, `'Transportation'`, `'Healthcare'`, `'Technology'`, `'Utilities'`, `'Other'`).
  - `provider`: String (optional, up to 150 chars, e.g. `'AT&T'`, `'PG&E'`).
  - `amountInCents`: Positive integer minor units (e.g. 8500 cents = $85.00). Eliminates IEEE 754 precision drift.
  - `currency`: String (default: `'USD'`).
  - `frequency`: Enum (`'one_time' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'`).
  - `startDate`: Date.
  - `dueDate`: Date, current obligation boundary.
  - `nextDueDate`: Date, calculated next recurrence occurrence.
  - `autoRenew`: Boolean (default `true` for recurring obligations).
  - `reminderDays`: Array of non-negative integers (default: `[7, 3, 1]`).
  - `status`: Enum (`'active' | 'paused' | 'cancelled' | 'completed'`).
  - **Indexes**:
    - Compound: `{ userId: 1, status: 1 }` (fast retrieval of active obligations).
    - Compound: `{ userId: 1, dueDate: 1 }` (chronological sorting by due date).
    - Compound: `{ userId: 1, nextDueDate: 1 }` (upcoming cycle scheduling).
    - Compound: `{ userId: 1, category: 1 }` (category-based aggregation).

- **`BillPayment` Sub-Ledger Model (`backend/src/models/bill-payment.model.ts`)**:
  - `userId`: `ObjectId` reference to `User`, indexed.
  - `billId`: `ObjectId` reference to `Bill`, indexed.
  - `amountInCents`: Positive integer minor units.
  - `paymentDate`: Date of payment record.
  - `status`: Enum (`'paid' | 'failed' | 'pending'`).
  - `paymentMethod`: String (`'bank_transfer' | 'credit_card' | 'debit_card' | 'upi' | 'auto_debit' | 'cash' | 'other'`).
  - `transactionId`: Optional `ObjectId` linking to a corresponding Phase 4 ledger transaction.
  - `referenceNumber`: Optional alphanumeric confirmation string.
  - `notes`: Optional notes.
  - **Indexes**:
    - Compound: `{ billId: 1, paymentDate: -1 }` (chronological payment ledger).
    - Compound: `{ userId: 1, paymentDate: -1 }` (user-wide payment history).
    - Sparse Index: `{ transactionId: 1 }` (prevents duplicate transaction linking).

### 2. Deterministic Recurring Schedule Engine
Recurrence calculations implement a deterministic month-end clamping policy preventing JavaScript date overflow:
- **Weekly**: Adds exactly 7 calendar days.
- **Monthly**: Clamps to target month's maximum days (e.g., January 31 + 1 month becomes February 28 in non-leap years, or February 29 in leap years, **never** overflowing into March).
- **Quarterly**: Adds 3 calendar months with month-end clamp.
- **Yearly**: Clamps leap-year February 29 to February 28 on subsequent non-leap years.
- **One-Time**: Returns `null` for `nextDueDate`.

### 3. Payment Reminders & Alerts Engine
Computes real-time actionable reminders dynamically from active bills:
- `overdue`: $\text{daysUntilDue} < 0$ (Urgent critical warning banner).
- `due_today`: $\text{daysUntilDue} = 0$ (Urgent action banner).
- `1_day`: 1 day before due date.
- `3_days`: 3 days before due date.
- `7_days`: 7 days before due date.
- *Exclusions*: Fully paid bills and paused/cancelled bills are excluded from reminder generation.

### 4. Financial Integrity Guarantees
1. **User-Reported Status**: The application records user-reported payments and does not initiate automatic bank transfers.
2. **Transaction Preservation**: Deleting or archiving a bill **never** deletes or alters financial bank transactions. Completed payment records are safely preserved in the ledger.
3. **Transaction Linking**:
   - Allows linking an existing Phase 4 expense transaction belonging to the authenticated user.
   - Rejects cross-user transaction links and duplicate transaction links.
   - Supports optional atomic creation of a Phase 4 expense transaction upon recording payment.
4. **Partial Payments**: Tracks `totalPaid` and `remainingDue` for the current cycle. Automatically rolls recurring due dates forward once full cycle amount is satisfied.

---

## 🎯 Phase 6: Complete Savings Goals & Financial Planning Engine

### 1. Database Architecture
- **`SavingsGoal` Model**: Target amounts, integer minor units, priority, color, icon, and milestones.
- **`GoalContribution` Sub-Ledger Model**: Granular deposit and withdrawal records tracking balance movements toward a specific goal.
- **Milestone Detection**: Automatically records milestone checkpoints at 25%, 50%, 75%, and 100% completion.
- **Predictive Velocity**: Analyzes required monthly savings against net monthly cash surplus from Phase 4 transactions.

---

## 🎯 Phase 5: Complete Budget Management System

- **Dynamic Aggregation Pipeline**: Spending dynamically aggregated from Phase 4 expense transactions matching category and dates.
- **Threshold Alert Hierarchy**: Status transitions (`normal`, `moderate`, `warning`, `critical`, `exceeded`) with alert deduplication.
- **Predictive Spending Velocity**: Daily burn rate, projected total spend, and early warning signals.

---

## 📡 REST API Endpoints

### Bills & Payments Endpoints (`/api/bills`)
| Method | Endpoint | Access | Query Parameters / Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/bills` | Authenticated | Body: `{ name, category, provider?, amount, frequency?, startDate?, dueDate, reminderDays?, autoRenew? }` | Creates a new bill with recurrence schedule |
| `GET` | `/api/bills` | Authenticated | `?status=active&category=Utilities&frequency=monthly&search=text&page=1&limit=20` | Returns paginated bills with cycle payment status |
| `GET` | `/api/bills/overview` | Authenticated | None | Returns total recurring, paid this month, overdue count, and reminders |
| `GET` | `/api/bills/upcoming` | Authenticated | `?days=30` | Returns upcoming bills in chronological order |
| `GET` | `/api/bills/:id` | Authenticated | URL param `:id` | Retrieves single bill with payment history |
| `PATCH` | `/api/bills/:id` | Authenticated | URL param `:id`, Body: partial updates | Updates bill recurrence, amount, due date, status, or reminders |
| `DELETE` | `/api/bills/:id` | Authenticated | URL param `:id`, `?archive=true` | Archives or deletes bill (transactions strictly preserved) |
| `POST` | `/api/bills/:id/payments` | Authenticated | URL param `:id`, Body: `{ amount, paymentDate?, paymentMethod?, referenceNumber?, notes?, transactionId?, createTransaction? }` | Records payment (with optional ledger transaction creation) |
| `GET` | `/api/bills/:id/payments` | Authenticated | URL param `:id`, `?page=1&limit=20` | Returns paginated payment history for bill |
| `DELETE` | `/api/bills/:id/payments/:paymentId` | Authenticated | URL params `:id`, `:paymentId` | Reverts payment record (recalculates due dates; preserves transactions) |
| `GET` | `/api/bills/:id/analytics` | Authenticated | URL param `:id` | Returns monthly payment trends and annualized recurring cost |

### Savings Goals Endpoints (`/api/savings-goals`)
| Method | Endpoint | Access | Query Parameters / Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/savings-goals` | Authenticated | Body: `{ name, targetAmount, deadline, category, currentAmount?, startDate?, priority?, color?, iconName? }` | Creates a new savings goal with milestones |
| `GET` | `/api/savings-goals` | Authenticated | `?status=in_progress&priority=high&category=Vehicle&page=1&limit=20` | Returns enriched goals with velocities and health status |
| `GET` | `/api/savings-goals/overview` | Authenticated | None | Returns total saved, targets, velocity recommendations and metrics |
| `GET` | `/api/savings-goals/:id` | Authenticated | URL param `:id` | Retrieves a single savings goal with full enriched metrics |
| `PATCH` | `/api/savings-goals/:id` | Authenticated | URL param `:id`, Body: partial updates | Updates goal targets, deadline, priority, status or styling |
| `DELETE` | `/api/savings-goals/:id` | Authenticated | URL param `:id` | Deletes savings goal (ledger transactions strictly preserved) |
| `POST` | `/api/savings-goals/:id/contributions` | Authenticated | URL param `:id`, Body: `{ amount, type, contributionDate?, notes? }` | Adds a deposit or withdrawal contribution to the goal sub-ledger |
| `GET` | `/api/savings-goals/:id/contributions` | Authenticated | URL param `:id`, `?page=1&limit=20` | Returns paginated contribution history for the goal |
| `DELETE` | `/api/savings-goals/:id/contributions/:cid` | Authenticated | URL params `:id`, `:cid` | Reverts a contribution and recalculates goal balance and milestones |
| `GET` | `/api/savings-goals/:id/analytics` | Authenticated | URL param `:id` | Returns savings trajectory, velocity analysis, and milestone status |

### Budget Endpoints (`/api/budgets`)
| Method | Endpoint | Access | Query Parameters / Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/budgets` | Authenticated | Body: `{ name, category, period, limit, startDate, endDate, alertThresholds? }` | Creates a new budget with integer minor units |
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

### 1. Run Automated Unit & Integration Tests (138 Tests Passing)
```bash
npm test
# or
npm --prefix backend test
```
The test suite validates:
- **Authentication (16 tests)**: Bcrypt hashing, JWT generation/verification/tamper rejection, cookie/Bearer auth, rate limiting, MongoDB degradation.
- **Transactions (18 tests)**: CRUD operations, integer minor units, positive amount validation, cross-user isolation, financial summary arithmetic, category breakdowns.
- **Budgets (21 tests)**: Minor-unit schema validation, negative limit rejection, invalid period/date rejection, dynamic utilization levels, alert deduplication, unauthenticated 401s, unconfigured MongoDB 503s.
- **Savings Goals (23 tests)**: Goal schema validation, integer minor units conversion, negative target rejection, date ordering, sub-ledger contributions, goal enrichment, milestone calculations, unauthenticated 401s, unconfigured MongoDB 503s.
- **Bills & Recurring Payments (31 tests)**: Bill schema validation, integer minor units, recurrence schedule calculations (weekly, monthly, quarterly, yearly, Jan 31 month-end clamp, leap-year Feb 29 clamp), payment ledger, reminder engine (overdue, due today, 1d, 3d, 7d), unauthenticated 401s, unconfigured MongoDB 503s.
- **AI Financial Assistant & Gemini Engine (29 tests)**: AI conversation schema validation, role & message length boundaries, deterministic financial health index (0-100), transparent scoring breakdown, prompt injection sanitization, read-only safety guardrails, Gemini SDK error sanitization (timeouts, 429 rate limits, 404 models), 401 unauthenticated guards, 503 unconfigured DB degradation, and conversation ownership security.
- **Financial Reports & Analytics (38 tests)**: Period-over-period delta & percentage comparisons, safe zero-previous baseline handling, validator constraints (3-year cap, start <= end, valid quarters/months), RFC 4180 CSV formula injection defense (`=`, `+`, `-`, `@`, `\t`, `\r` escaped with single quote `'`), multi-sheet Excel generation (`exceljs`), PDF statement generation (`pdfkit`), Gemini AI report insights with mock fallback, 401 unauthenticated guards, and 503 DB degradation.

### 2. Google Gemini API Setup & Configuration
To enable live AI assistant responses with Google's official Gemini API:
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Add your credentials to `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...your_actual_key
   GEMINI_MODEL=gemini-2.5-flash
   AI_MAX_OUTPUT_TOKENS=1500
   AI_TEMPERATURE=0.3
   ```
3. Restart the backend server. The AI Copilot will automatically transition from simulation standby to live Gemini intelligence.

---

### 3. AI Endpoints Table
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/chat` | Send financial inquiry grounded in user context | Yes (Rate limited) |
| `GET` | `/api/ai/insights` | Retrieve calculated health score & spending metrics | Yes |
| `GET` | `/api/ai/context` | Safe status of available user financial modules | Yes |
| `GET` | `/api/ai/conversations` | Paginated list of user conversation summaries | Yes |
| `GET` | `/api/ai/conversations/:id` | Get full message history for conversation | Yes |
| `DELETE`| `/api/ai/conversations/:id` | Delete specific conversation | Yes |
| `DELETE`| `/api/ai/conversations` | Clear all AI conversation history for user | Yes |

---

### 4. Financial Reports & Export Engine
The ArthaAI Reporting Engine delivers deterministic financial consolidation, multi-module rollups, and multi-format statements:
- **Periodic Rollups**: Monthly, quarterly (Q1-Q4), annual (calendar/fiscal), and custom date-range statements.
- **Deterministic Minor-Unit Math**: Total income, total expenses, net cash flow, and savings rates aggregated strictly in integer minor units (cents/paise) to prevent IEEE 754 precision drift.
- **Period-over-Period Variance**: Automatic benchmark calculation against prior equivalent periods with safe handling of zero-baseline scenarios.
- **Mandatory Net Worth Policy**: Net worth is never fabricated from cash-flow ledgers. When unverified, the system displays the mandatory compliance disclosure: `"Net worth unavailable — additional asset and liability information is required."`
- **Multi-Format Export Engine**:
  - **PDF Statements**: Branded executive summary statements compiled dynamically via `pdfkit`.
  - **Excel Workbooks (.xlsx)**: Multi-sheet workbooks (`Executive Summary`, `Category Breakdown`, `Budgets`, `Savings`, `Bills`, `Cash Flow`) compiled via `exceljs`.
  - **CSV Exports**: RFC 4180 compliant datasets with UTF-8 BOM encoding.
  - **Formula Injection Defense**: All exported string cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r` are prepended with a single quote (`'`) to neutralize CSV/Excel DDE attacks.
- **Gemini AI Report Insights**: Automated executive commentary, spending anomalies, and strategic budget recommendations generated on-demand via Google's Gemini models with graceful offline synthesis.

#### Reports Endpoints Table
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/overview` | Quick financial health summary for current calendar month | Yes |
| `GET` | `/api/reports/monthly` | Full monthly statement with prior month comparison (`?year=&month=`) | Yes |
| `GET` | `/api/reports/quarterly` | Full quarterly statement with prior quarter comparison (`?year=&quarter=`) | Yes |
| `GET` | `/api/reports/annual` | Full annual statement with prior fiscal year comparison (`?year=`) | Yes |
| `GET` | `/api/reports/custom` | Custom date-range statement (`?startDate=&endDate=`, max 3 years) | Yes |
| `GET` | `/api/reports/categories` | Expense breakdown by category with variance deltas | Yes |
| `GET` | `/api/reports/cash-flow` | Chronological cash-flow timeline points | Yes |
| `GET` | `/api/reports/budget-performance` | Budget variance, adherence, and overspend metrics | Yes |
| `GET` | `/api/reports/savings-performance` | Savings goals trajectory and period contribution totals | Yes |
| `GET` | `/api/reports/bills-analysis` | Recurring payment commitments and overdue obligations | Yes |
| `POST`| `/api/reports/ai-insights` | Gemini executive report commentary & recommendations | Yes |
| `GET` | `/api/reports/export/pdf` | Stream binary PDF financial statement | Yes |
| `GET` | `/api/reports/export/excel`| Stream binary multi-sheet Excel (.xlsx) workbook | Yes |
| `GET` | `/api/reports/export/csv` | Download RFC 4180 CSV export with formula injection defense | Yes |

---

## 🚀 Phase 10: Complete Security Audit, Deployment & Production Launch

### 1. Production Deployment Configurations

#### Backend: Render Web Service (`render.yaml`)
The backend is configured as an Infrastructure-as-Code service on [Render](https://render.com):
- **Blueprint**: `render.yaml`
- **Build Command**: `npm --prefix backend install && npm --prefix backend run build`
- **Start Command**: `node backend/dist/server.js`
- **Health Check Probe**: `/api/health/live`
- **Auto-Deploy**: Enabled on `main` branch push.
- **Port Handling**: Dynamic binding using Render's assigned `PORT` environment variable.
- **Security**: Auto-generated cryptographically secure `JWT_SECRET` (32+ characters) via Render secrets vault.

#### Frontend: Netlify SPA (`netlify.toml`)
The client dashboard is deployed to [Netlify](https://www.netlify.com):
- **Configuration**: `netlify.toml` + `frontend/public/_redirects`
- **Base Directory**: `frontend`
- **Publish Directory**: `dist`
- **Build Command**: `npm run build`
- **SPA Fallback**: `/* -> /index.html (200)` prevents 404 errors on deep-link refreshes.
- **Security Headers**: HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
- **Static Asset Caching**: 1-year immutable cache header for hashed `/assets/*` bundles.

---

### 2. Database Backup & Disaster Recovery Strategy (MongoDB Atlas)

For production deployment on MongoDB Atlas:
- **Continuous Cloud Backups**: Enable continuous backups with 1-second Point-in-Time Recovery (PITR) across the trailing 7 days.
- **Snapshot Retention Policy**:
  - Daily snapshots: Retained for 7 days.
  - Weekly snapshots: Retained for 4 weeks.
  - Monthly snapshots: Retained for 12 months.
- **Recovery Time Objective (RTO)**: <= 30 minutes for complete cluster restoration.
- **Recovery Point Objective (RPO)**: <= 1 minute via Atlas oplog replay.
- **Security & Access Control**:
  - Database access restricted to Render static outbound IP addresses or VPC peering.
  - SCRAM-SHA-256 / X.509 credential authentication.
  - In-flight TLS 1.3 encryption and AES-256 rest encryption.

---

### 3. Continuous Integration Pipeline (`ci-pipeline.yml`)

The production pipeline template (`ci-pipeline.yml`) provides a complete GitHub Actions configuration (copy to `.github/workflows/ci.yml` in repos with workflow permissions):
1. **Source Checkout & Node.js Setup**: Node.js 20 LTS environment with dependency caching.
2. **Dependency Installation**: Isolated workspace installation for backend and frontend.
3. **Automated Test Execution**: Complete execution of 195 automated tests across 24 suites.
4. **Production Build Verification**: Compiles backend TypeScript (`tsc`) and frontend bundle (`vite build`).
5. **Security Audit**: Dependency vulnerability scan via `npm audit`.

---

### 4. Full Production Health & Telemetry Probes

ArthaAI provides standardized orchestrator health probes conforming to container guidelines:
- **Liveness Probe** (`GET /api/health/live`): Verifies process vitality and HTTP responsiveness (HTTP 200).
- **Readiness Probe** (`GET /api/health/ready`): Verifies database connectivity and dependency readiness (HTTP 200 when connected, HTTP 503 during standby or reconnection).
- **Comprehensive Diagnostics** (`GET /api/health`): Returns memory usage (RSS, heap), process uptime, platform telemetry, and database connection state.

---

### 5. Automated Test Suite Metrics
```bash
npm test
# or
npm --prefix backend test
```
The test suite validates:
- **Authentication (16 tests)**: Bcrypt hashing, JWT generation/verification/tamper rejection, cookie/Bearer auth, rate limiting, MongoDB degradation.
- **Transactions (18 tests)**: CRUD operations, integer minor units, positive amount validation, cross-user isolation, financial summary arithmetic, category breakdowns.
- **Budgets (21 tests)**: Minor-unit schema validation, negative limit rejection, invalid period/date rejection, dynamic utilization levels, alert deduplication, unauthenticated 401s, unconfigured MongoDB 503s.
- **Savings Goals (23 tests)**: Goal schema validation, integer minor units conversion, negative target rejection, date ordering, sub-ledger contributions, goal enrichment, milestone calculations, unauthenticated 401s, unconfigured MongoDB 503s.
- **Bills & Recurring Payments (31 tests)**: Bill schema validation, integer minor units, recurrence schedule calculations (weekly, monthly, quarterly, yearly, Jan 31 month-end clamp, leap-year Feb 29 clamp), payment ledger, reminder engine (overdue, due today, 1d, 3d, 7d), unauthenticated 401s, unconfigured MongoDB 503s.
- **AI Financial Assistant & Gemini Engine (29 tests)**: AI conversation schema validation, role & message length boundaries, deterministic financial health index (0-100), transparent scoring breakdown, prompt injection sanitization, read-only safety guardrails, Gemini SDK error sanitization (timeouts, 429 rate limits, 404 models), 401 unauthenticated guards, 503 unconfigured DB degradation, and conversation ownership security.
- **Financial Reports & Analytics (38 tests)**: Period-over-period delta & percentage comparisons, safe zero-previous baseline handling, validator constraints (3-year cap, start <= end, valid quarters/months), RFC 4180 CSV formula injection defense (`=`, `+`, `-`, `@`, `\t`, `\r` escaped with single quote `'`), multi-sheet Excel generation (`exceljs`), PDF statement generation (`pdfkit`), Gemini AI report insights with mock fallback, 401 unauthenticated guards, and 503 DB degradation.
- **Security Audit & Production Readiness (19 tests)**: Multi-tenant cross-user authorization isolation, client-supplied ID discarding, Helmet security headers, CORS origin whitelisting & rejection, 1MB payload limits (413), malformed JSON rejection (400), production stack trace masking, spreadsheet injection sanitization, and orchestrator health probes.

**Total Test Suite Execution: 195 / 195 Passing Tests across 24 Test Suites (100% Pass Rate).**

---

### 6. Production Build Verification
```bash
npm run build
```
Compiles both backend TypeScript (`tsc`) and frontend bundle (`vite build`).

### 7. Development Server
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
- [x] Integer minor units prevent IEEE 754 financial calculation drift across transactions, budgets, savings goals, bills, and reports.
- [x] Zero-amount and negative-amount limits rejected at model & controller levels.
- [x] Cross-user access blocked via compound database ownership queries.
- [x] Multi-tenant cross-user isolation verified between separate test user sessions.
- [x] Helmet security headers enforce `X-Content-Type-Options: nosniff` and CSP protections.
- [x] Strict CORS origin validation: whitelisted origins accepted with credentials; unauthorized origins rejected with HTTP 403 Forbidden.
- [x] Request payload body limits capped at 1MB, rejecting oversized bodies with HTTP 413.
- [x] Malformed JSON syntax rejected with standardized HTTP 400 Bad Request.
- [x] Non-operational error stack traces and internal secrets masked in production environments.
- [x] Formula injection defense sanitizes all CSV and Excel cells (`=`, `+`, `-`, `@`, `\t`, `\r` escaped with single quote `'`) to prevent spreadsheet remote code execution.
- [x] RFC 4180 CSV compliance guaranteed with standard UTF-8 BOM encoding for international currency display.
- [x] Net worth disclosure strictly adheres to compliance: never fabricates balance sheet metrics without verified asset/liability ledgers.
- [x] All 14 report endpoints strictly scope database queries to authenticated `userId` context.
- [x] Deleting or archiving a bill leaves historical financial bank transaction records completely intact.
- [x] Duplicate linking of transactions to multiple bill payments is rejected via unique indexing and ownership checks.
- [x] Sub-ledger payments maintain historical chronological integrity with safe deletion & rollback.
- [x] GEMINI_API_KEY is strictly secured on backend; never exposed to browser or frontend client code.
- [x] AI Assistant operates strictly as a READ-ONLY advisor — execution of bank transfers, transaction deletion, or account changes is strictly prevented.
- [x] Prompt injection defenses sanitize untrusted inputs (transaction titles, notes, merchant names, bill names).
- [x] Clearing AI conversations strictly deletes chat history documents and never touches financial transactions, budgets, or bills.
- [x] Sensitive authentication and AI chat routes protected by IP rate limiters.
- [x] HttpOnly, SameSite cookies prevent credential access from browser JavaScript.
- [x] 100% test pass rate across 195 automated unit and integration tests (24 test suites).
- [x] Zero secrets, tokens, or credentials stored in repository or frontend code.
