import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import http from 'http';
import { ReportComparisonService } from '../src/services/reports/report-comparison.service.js';
import { ReportExportService } from '../src/services/reports/report-export.service.js';
import { ReportValidator } from '../src/validators/report.validator.js';
import { ReportService } from '../src/services/reports/report.service.js';
import { GeminiService } from '../src/services/ai/gemini.service.js';
import { generateToken } from '../src/utils/token.js';
import { createApp } from '../src/app.js';
import { ComprehensiveFinancialReport } from '../src/types/index.js';

// HTTP test client helper
const makeRequest = async (
  server: http.Server,
  options: {
    method: string;
    path: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
    cookies?: string;
  }
): Promise<{ status: number; body: Record<string, unknown>; headers: http.IncomingHttpHeaders }> => {
  const address = server.address() as { port: number };
  const port = address.port;

  return new Promise((resolve, reject) => {
    const postData = options.body ? JSON.stringify(options.body) : '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (options.cookies) {
      headers['Cookie'] = options.cookies;
    }

    if (options.body) {
      headers['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path: options.path,
        method: options.method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const body = rawData ? JSON.parse(rawData) : {};
            resolve({ status: res.statusCode || 500, body, headers: res.headers });
          } catch {
            resolve({ status: res.statusCode || 500, body: { raw: rawData }, headers: res.headers });
          }
        });
      }
    );

    req.on('error', reject);

    if (options.body) {
      req.write(postData);
    }
    req.end();
  });
};

describe('ArthaAI Phase 9 Reports, Analytics & Financial Export Engine Test Suite', () => {
  let server: http.Server;
  const testUserId = new mongoose.Types.ObjectId().toString();
  const testToken = generateToken({
    id: testUserId,
    email: 'reporting-analyst@artha.ai',
    fullName: 'Reporting Analyst',
  });

  const authHeader = { Authorization: `Bearer ${testToken}` };

  const sampleReport: ComprehensiveFinancialReport = {
    period: {
      type: 'monthly',
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      label: 'November 2026',
      currency: 'USD',
      generatedAt: '2026-11-05T12:00:00.000Z',
    },
    summary: {
      totalIncome: 9500,
      totalExpenses: 4800,
      netCashFlow: 4700,
      savingsRatePercentage: 49.5,
      transactionCount: 24,
      incomeTransactionCount: 2,
      expenseTransactionCount: 22,
      highestSpendingCategory: { category: 'Housing & Rent', amount: 2400, percentage: 50.0 },
      lowestSpendingCategory: { category: 'Coffee & Snacks', amount: 85 },
      budgetUtilization: {
        totalLimit: 5200,
        totalSpent: 4800,
        utilizationPercentage: 92.3,
        activeBudgetCount: 4,
        exceededCount: 1,
      },
      savingsProgress: {
        totalSaved: 59300,
        totalTarget: 99500,
        overallProgressPercentage: 59.6,
        periodContributions: 1500,
      },
      billsSummary: {
        totalPaidInPeriod: 685,
        pendingCommitments: 340,
        overdueCount: 0,
        overdueAmount: 0,
      },
      netWorthNote: 'Net worth unavailable — additional asset and liability information is required.',
    },
    comparison: {
      income: { current: 9500, previous: 9000, delta: 500, percentageChange: 5.6 },
      expenses: { current: 4800, previous: 5100, delta: -300, percentageChange: -5.9 },
      netCashFlow: { current: 4700, previous: 3900, delta: 800, percentageChange: 20.5 },
      savingsRate: { current: 49.5, previous: 43.3, delta: 6.2, percentageChange: 14.3 },
      previousPeriodLabel: 'October 2026',
    },
    categories: [
      { category: 'Housing & Rent', amount: 2400, percentage: 50.0, transactionCount: 1, previousAmount: 2400, changePercentage: 0 },
      { category: 'Food & Groceries', amount: 950, percentage: 19.8, transactionCount: 12, previousAmount: 1100, changePercentage: -13.6 },
      { category: 'Utilities', amount: 450, percentage: 9.4, transactionCount: 4, previousAmount: 420, changePercentage: 7.1 },
    ],
    cashFlowTrend: [
      { date: '2026-11-01', income: 9500, expenses: 2400, netCashFlow: 7100 },
      { date: '2026-11-05', income: 0, expenses: 450, netCashFlow: -450 },
    ],
    budgetPerformance: [
      {
        name: 'Dining Out',
        category: 'Food & Groceries',
        limit: 800,
        spent: 950,
        remaining: 0,
        utilizationPercentage: 118.8,
        status: 'exceeded',
      },
    ],
    savingsPerformance: [
      {
        name: 'Emergency Fund',
        category: 'Emergency Fund',
        targetAmount: 25000,
        currentAmount: 18000,
        progressPercentage: 72.0,
        periodContributions: 500,
        status: 'in_progress',
      },
    ],
    billsAnalysis: [
      {
        name: 'Electric Power',
        category: 'Utilities',
        amount: 180,
        dueDate: '2026-11-15',
        frequency: 'monthly',
        status: 'active',
        paymentStatus: 'upcoming',
      },
    ],
  };

  before(async () => {
    const app = createApp();
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  // ==========================================
  // 1. REPORT COMPARISON SERVICE TESTS
  // ==========================================
  describe('Report Comparison Engine Tests', () => {
    it('should correctly calculate delta and positive percentage change', () => {
      const comp = ReportComparisonService.compareMetrics(1200, 1000);
      assert.equal(comp.delta, 200);
      assert.equal(comp.percentageChange, 20.0);
    });

    it('should correctly calculate delta and negative percentage change', () => {
      const comp = ReportComparisonService.compareMetrics(800, 1000);
      assert.equal(comp.delta, -200);
      assert.equal(comp.percentageChange, -20.0);
    });

    it('should handle zero previous value without division by zero errors', () => {
      const comp = ReportComparisonService.compareMetrics(500, 0);
      assert.equal(comp.delta, 500);
      assert.equal(comp.percentageChange, 100);
    });

    it('should accurately calculate previous monthly period date range', () => {
      const start = new Date(Date.UTC(2026, 10, 1)); // Nov 2026
      const end = new Date(Date.UTC(2026, 10, 30));
      const prev = ReportComparisonService.getPreviousPeriodRange('monthly', start, end);

      assert.equal(prev.label, 'October 2026');
      assert.equal(prev.prevStartDate.getUTCMonth(), 9); // October (0-indexed)
      assert.equal(prev.prevStartDate.getUTCFullYear(), 2026);
    });

    it('should roll back January previous period to December of prior year', () => {
      const start = new Date(Date.UTC(2026, 0, 1)); // Jan 2026
      const end = new Date(Date.UTC(2026, 0, 31));
      const prev = ReportComparisonService.getPreviousPeriodRange('monthly', start, end);

      assert.equal(prev.label, 'December 2025');
      assert.equal(prev.prevStartDate.getUTCMonth(), 11); // December
      assert.equal(prev.prevStartDate.getUTCFullYear(), 2025);
    });

    it('should accurately calculate previous quarter period range', () => {
      const start = new Date(Date.UTC(2026, 9, 1)); // Q4 (Oct 1)
      const end = new Date(Date.UTC(2026, 11, 31));
      const prev = ReportComparisonService.getPreviousPeriodRange('quarterly', start, end);

      assert.equal(prev.label, 'Q3 2026');
    });

    it('should roll back Q1 previous quarter to Q4 of prior year', () => {
      const start = new Date(Date.UTC(2026, 0, 1)); // Q1 2026
      const end = new Date(Date.UTC(2026, 2, 31));
      const prev = ReportComparisonService.getPreviousPeriodRange('quarterly', start, end);

      assert.equal(prev.label, 'Q4 2025');
    });
  });

  // ==========================================
  // 2. REPORT VALIDATOR UNIT TESTS
  // ==========================================
  describe('Report Validator Tests', () => {
    it('should accept valid date range parameters', () => {
      const validated = ReportValidator.validateDateRange({
        startDate: '2026-01-01',
        endDate: '2026-06-30',
      });
      assert.ok(validated.startDate instanceof Date);
      assert.ok(validated.endDate instanceof Date);
      assert.ok(validated.startDate <= validated.endDate);
    });

    it('should reject missing startDate or endDate', () => {
      assert.throws(() => {
        ReportValidator.validateDateRange({ startDate: '2026-01-01' });
      }, /Both startDate and endDate query parameters are required/);
    });

    it('should reject startDate after endDate', () => {
      assert.throws(() => {
        ReportValidator.validateDateRange({
          startDate: '2026-07-01',
          endDate: '2026-01-01',
        });
      }, /startDate cannot be after endDate/);
    });

    it('should reject date ranges exceeding 3 years', () => {
      assert.throws(() => {
        ReportValidator.validateDateRange({
          startDate: '2020-01-01',
          endDate: '2024-01-01',
        });
      }, /Date range cannot exceed 3 years/);
    });

    it('should validate and parse monthly query parameters', () => {
      const { year, month } = ReportValidator.validateMonthlyParams({ year: '2026', month: '11' });
      assert.equal(year, 2026);
      assert.equal(month, 11);
    });

    it('should reject invalid month numbers', () => {
      assert.throws(() => {
        ReportValidator.validateMonthlyParams({ year: '2026', month: '13' });
      }, /Month must be an integer between 1 and 12/);
    });

    it('should validate and parse quarterly query parameters', () => {
      const { year, quarter } = ReportValidator.validateQuarterlyParams({ year: '2026', quarter: '3' });
      assert.equal(year, 2026);
      assert.equal(quarter, 3);
    });

    it('should reject invalid quarter numbers', () => {
      assert.throws(() => {
        ReportValidator.validateQuarterlyParams({ year: '2026', quarter: '5' });
      }, /Quarter must be an integer between 1 and 4/);
    });
  });

  // ==========================================
  // 3. EXPORT ENGINE TESTS (CSV, EXCEL, PDF)
  // ==========================================
  describe('Export Engine (CSV, Excel, PDF) Tests', () => {
    it('should sanitize formula injection characters in spreadsheets', () => {
      assert.equal(ReportExportService.sanitizeFormulaInjection('=SUM(A1:A10)'), "'=SUM(A1:A10)");
      assert.equal(ReportExportService.sanitizeFormulaInjection('+12345'), "'+12345");
      assert.equal(ReportExportService.sanitizeFormulaInjection('-CMD'), "'-CMD");
      assert.equal(ReportExportService.sanitizeFormulaInjection('@macro'), "'@macro");
      assert.equal(ReportExportService.sanitizeFormulaInjection('Safe Standard Text'), 'Safe Standard Text');
    });

    it('should generate valid RFC 4180 CSV with UTF-8 BOM and formula sanitization', () => {
      const csv = ReportExportService.generateCsv(sampleReport);
      assert.ok(csv.startsWith('\uFEFF')); // UTF-8 BOM
      assert.ok(csv.includes('ArthaAI Personal Financial Report - November 2026'));
      assert.ok(csv.includes('EXECUTIVE SUMMARY'));
      assert.ok(csv.includes('CATEGORY BREAKDOWN'));
      assert.ok(csv.includes('Housing & Rent'));
      assert.ok(csv.includes('BUDGET PERFORMANCE'));
      assert.ok(csv.includes('SAVINGS GOALS PROGRESS'));
      assert.ok(csv.includes('BILLS & RECURRING OBLIGATIONS'));
      assert.ok(csv.includes('Net worth unavailable — additional asset and liability information is required.'));
    });

    it('should generate valid Excel workbook buffer with multiple worksheets', async () => {
      const buffer = await ReportExportService.generateExcel(sampleReport);
      assert.ok(Buffer.isBuffer(buffer));
      assert.ok(buffer.length > 2000); // Excel files with multiple sheets exceed 2KB
      // ZIP magic bytes for .xlsx files (PK..)
      assert.equal(buffer[0], 0x50);
      assert.equal(buffer[1], 0x4b);
    });

    it('should generate valid PDF document buffer with ArthaAI branding', async () => {
      const buffer = await ReportExportService.generatePdf(sampleReport);
      assert.ok(Buffer.isBuffer(buffer));
      assert.ok(buffer.length > 1000);
      // PDF magic bytes (%PDF)
      const header = buffer.subarray(0, 4).toString('utf-8');
      assert.equal(header, '%PDF');
    });
  });

  // ==========================================
  // 4. AI REPORT INSIGHTS SERVICE TESTS
  // ==========================================
  describe('AI Report Explanation Service Tests', () => {
    it('should provide deterministic fallback when Gemini is not configured', async () => {
      GeminiService.resetClient();
      if (!GeminiService.isConfigured()) {
        const text = await ReportService.generateAIReportInsights(sampleReport);
        assert.ok(text.includes('Financial Report Summary (November 2026)'));
        assert.ok(text.includes('$4700.00'));
        assert.ok(text.includes('49.5% savings rate'));
      }
    });

    it('should generate AI insights with mocked Gemini client', async () => {
      const mockClient: any = {
        models: {
          generateContent: async () => ({
            text: '### Executive Financial Evaluation\nYour net surplus of $4,700 represents a remarkable 49.5% savings rate.',
          }),
        },
      };

      GeminiService.resetClient(mockClient);

      const insights = await ReportService.generateAIReportInsights(
        sampleReport,
        'Summarize my spending'
      );

      assert.ok(insights.includes('Executive Financial Evaluation'));
      assert.ok(insights.includes('49.5% savings rate'));

      // Clean up
      GeminiService.resetClient();
    });
  });

  // ==========================================
  // 5. HTTP ENDPOINTS & AUTHENTICATION TESTS
  // ==========================================
  describe('Report HTTP Endpoints & Authentication Security', () => {
    it('should reject unauthenticated GET /api/reports/overview with 401', async () => {
      const res = await makeRequest(server, { method: 'GET', path: '/api/reports/overview' });
      assert.equal(res.status, 401);
    });

    it('should reject unauthenticated GET /api/reports/monthly with 401', async () => {
      const res = await makeRequest(server, { method: 'GET', path: '/api/reports/monthly?year=2026&month=11' });
      assert.equal(res.status, 401);
    });

    it('should reject unauthenticated GET /api/reports/quarterly with 401', async () => {
      const res = await makeRequest(server, { method: 'GET', path: '/api/reports/quarterly?year=2026&quarter=4' });
      assert.equal(res.status, 401);
    });

    it('should reject unauthenticated GET /api/reports/annual with 401', async () => {
      const res = await makeRequest(server, { method: 'GET', path: '/api/reports/annual?year=2026' });
      assert.equal(res.status, 401);
    });

    it('should reject unauthenticated GET /api/reports/custom with 401', async () => {
      const res = await makeRequest(server, {
        method: 'GET',
        path: '/api/reports/custom?startDate=2026-01-01&endDate=2026-03-31',
      });
      assert.equal(res.status, 401);
    });

    it('should reject unauthenticated GET /api/reports/categories with 401', async () => {
      const res = await makeRequest(server, { method: 'GET', path: '/api/reports/categories?year=2026&month=11' });
      assert.equal(res.status, 401);
    });

    it('should reject unauthenticated GET /api/reports/cash-flow with 401', async () => {
      const res = await makeRequest(server, { method: 'GET', path: '/api/reports/cash-flow?year=2026&month=11' });
      assert.equal(res.status, 401);
    });

    it('should reject unauthenticated GET /api/reports/budgets with 401', async () => {
      const res = await makeRequest(server, { method: 'GET', path: '/api/reports/budgets?year=2026&month=11' });
      assert.equal(res.status, 401);
    });

    it('should reject unauthenticated GET /api/reports/savings with 401', async () => {
      const res = await makeRequest(server, { method: 'GET', path: '/api/reports/savings?year=2026&month=11' });
      assert.equal(res.status, 401);
    });

    it('should reject unauthenticated GET /api/reports/bills with 401', async () => {
      const res = await makeRequest(server, { method: 'GET', path: '/api/reports/bills?year=2026&month=11' });
      assert.equal(res.status, 401);
    });

    it('should reject unauthenticated POST /api/reports/ai-insights with 401', async () => {
      const res = await makeRequest(server, {
        method: 'POST',
        path: '/api/reports/ai-insights',
        body: { type: 'monthly', year: 2026, month: 11 },
      });
      assert.equal(res.status, 401);
    });

    it('should reject unauthenticated GET /api/reports/export/pdf with 401', async () => {
      const res = await makeRequest(server, { method: 'GET', path: '/api/reports/export/pdf?year=2026&month=11' });
      assert.equal(res.status, 401);
    });

    it('should reject unauthenticated GET /api/reports/export/excel with 401', async () => {
      const res = await makeRequest(server, { method: 'GET', path: '/api/reports/export/excel?year=2026&month=11' });
      assert.equal(res.status, 401);
    });

    it('should reject unauthenticated GET /api/reports/export/csv with 401', async () => {
      const res = await makeRequest(server, { method: 'GET', path: '/api/reports/export/csv?year=2026&month=11' });
      assert.equal(res.status, 401);
    });

    it('should return 503 on GET /api/reports/overview when MongoDB is unconfigured', async () => {
      const res = await makeRequest(server, {
        method: 'GET',
        path: '/api/reports/overview',
        headers: authHeader,
      });
      assert.equal(res.status, 503);
      assert.equal((res.body as any).success, false);
    });

    it('should return 503 on GET /api/reports/monthly when MongoDB is unconfigured', async () => {
      const res = await makeRequest(server, {
        method: 'GET',
        path: '/api/reports/monthly?year=2026&month=11',
        headers: authHeader,
      });
      assert.equal(res.status, 503);
      assert.equal((res.body as any).success, false);
    });

    it('should return 503 on GET /api/reports/export/pdf when MongoDB is unconfigured', async () => {
      const res = await makeRequest(server, {
        method: 'GET',
        path: '/api/reports/export/pdf?year=2026&month=11',
        headers: authHeader,
      });
      assert.equal(res.status, 503);
      assert.equal((res.body as any).success, false);
    });
  });
});

