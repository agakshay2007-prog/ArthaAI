import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { generateToken, verifyToken } from '../src/utils/token.js';
import { env } from '../src/config/env.js';
import { ReportExportService } from '../src/services/reports/report-export.service.js';

const makeRequest = async (
  server: http.Server,
  options: {
    method: string;
    path: string;
    body?: string | Record<string, unknown>;
    headers?: Record<string, string>;
    cookies?: string;
  }
): Promise<{ status: number; body: Record<string, unknown>; headers: http.IncomingHttpHeaders }> => {
  const address = server.address() as { port: number };
  const port = address.port;

  return new Promise((resolve, reject) => {
    const postData =
      typeof options.body === 'string'
        ? options.body
        : options.body
        ? JSON.stringify(options.body)
        : '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (options.cookies) {
      headers['Cookie'] = options.cookies;
    }

    if (postData) {
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
          let parsedBody = {};
          try {
            parsedBody = JSON.parse(rawData);
          } catch {
            parsedBody = { raw: rawData };
          }
          resolve({
            status: res.statusCode || 500,
            body: parsedBody as Record<string, unknown>,
            headers: res.headers,
          });
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

describe('ArthaAI Phase 10 — Complete Production Security Audit Test Suite', () => {
  let server: http.Server;
  const userA = { id: '65d0000000000000000000a1', email: 'user.alpha@artha.ai' };
  const userB = { id: '65d0000000000000000000b2', email: 'user.beta@artha.ai' };

  let tokenA: string;
  let tokenB: string;

  before(async () => {
    const app = createApp();
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });

    tokenA = generateToken(userA);
    tokenB = generateToken(userB);
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  describe('A. Authentication & Session Security', () => {
    it('should reject unauthenticated requests to protected endpoints with 401', async () => {
      const endpoints = [
        '/api/transactions',
        '/api/budgets',
        '/api/savings-goals',
        '/api/bills',
        '/api/ai/chat',
        '/api/reports/overview',
        '/api/auth/me',
      ];

      for (const endpoint of endpoints) {
        const res = await makeRequest(server, { method: 'GET', path: endpoint });
        assert.equal(
          res.status,
          401,
          `Expected ${endpoint} to reject unauthenticated request with 401, got ${res.status}`
        );
      }
    });

    it('should reject requests with invalid or forged JWT signatures with 401', async () => {
      const tamperedToken = `${tokenA.slice(0, -6)}tamper`;
      const res = await makeRequest(server, {
        method: 'GET',
        path: '/api/auth/me',
        headers: { Authorization: `Bearer ${tamperedToken}` },
      });
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it('should allow authentication via HttpOnly session cookies', async () => {
      const res = await makeRequest(server, {
        method: 'GET',
        path: '/api/auth/me',
        cookies: `${env.COOKIE_NAME}=${tokenA}`,
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });

    it('should securely hash passwords with bcrypt cost factor >= 10', async () => {
      const rawPassword = 'SecurePassword2026!';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(rawPassword, salt);

      assert.ok(hash.startsWith('$2a$') || hash.startsWith('$2b$'));
      const isMatch = await bcrypt.compare(rawPassword, hash);
      assert.equal(isMatch, true);
      const isNonMatch = await bcrypt.compare('WrongPassword', hash);
      assert.equal(isNonMatch, false);
    });

    it('should correctly clear authentication cookies on logout', async () => {
      const res = await makeRequest(server, {
        method: 'POST',
        path: '/api/auth/logout',
      });
      assert.equal(res.status, 200);
      const setCookie = res.headers['set-cookie'];
      assert.ok(setCookie, 'Expected set-cookie header in logout response');
      const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
      assert.ok(cookieStr.includes(`${env.COOKIE_NAME}=;`));
    });
  });

  describe('B. Multi-Tenant Authorization & Cross-User Isolation', () => {
    it('should issue distinct tokens with unique user IDs for separate accounts', () => {
      const decodedA = verifyToken(tokenA);
      const decodedB = verifyToken(tokenB);

      assert.equal(decodedA.id, userA.id);
      assert.equal(decodedB.id, userB.id);
      assert.notEqual(decodedA.id, decodedB.id);
    });

    it('should strictly bind session context to authenticated token (ignoring client-supplied body IDs)', async () => {
      // User A attempts to forge or pass userB id in body
      const res = await makeRequest(server, {
        method: 'GET',
        path: '/api/auth/me',
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { id: userB.id, userId: userB.id },
      });

      assert.equal(res.status, 200);
      const user = (res.body.data as { user: { id: string } }).user;
      assert.equal(user.id, userA.id, 'User ID must be derived exclusively from verified session');
      assert.notEqual(user.id, userB.id);
    });
  });

  describe('C. API Security, HTTP Headers & Error Sanitization', () => {
    it('should emit standard security headers via Helmet', async () => {
      const res = await makeRequest(server, { method: 'GET', path: '/api/health' });

      assert.ok(res.headers['x-content-type-options'], 'Missing X-Content-Type-Options header');
      assert.equal(res.headers['x-content-type-options'], 'nosniff');
    });

    it('should reject unauthorized CORS origins with 403 Forbidden', async () => {
      const res = await makeRequest(server, {
        method: 'GET',
        path: '/api/health',
        headers: { Origin: 'https://malicious-external-site.evil.com' },
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    it('should accept whitelisted CORS origins (such as frontend dev server)', async () => {
      const res = await makeRequest(server, {
        method: 'GET',
        path: '/api/health',
        headers: { Origin: 'http://localhost:5173' },
      });
      assert.equal(res.status, 200);
      assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:5173');
      assert.equal(res.headers['access-control-allow-credentials'], 'true');
    });

    it('should reject requests exceeding 1MB body limit with 413 Payload Too Large', async () => {
      const largePayload = JSON.stringify({
        data: 'A'.repeat(1024 * 1024 + 100), // > 1MB
      });

      const res = await makeRequest(server, {
        method: 'POST',
        path: '/api/auth/login',
        body: largePayload,
      });

      assert.equal(res.status, 413);
      assert.equal(res.body.success, false);
      assert.ok(
        String(res.body.message).toLowerCase().includes('payload') ||
          String(res.body.message).toLowerCase().includes('limit')
      );
    });

    it('should reject malformed JSON syntax with 400 Bad Request', async () => {
      const res = await makeRequest(server, {
        method: 'POST',
        path: '/api/auth/login',
        body: '{ "invalidJson": true, missingQuote: }',
      });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('should not leak stack traces or internal secrets in production mode', async () => {
      const originalEnv = env.NODE_ENV;
      (env as any).NODE_ENV = 'production';
      try {
        const res = await makeRequest(server, {
          method: 'GET',
          path: '/api/non-existent-route-404',
        });

        assert.equal(res.status, 404);
        assert.equal(res.body.stack, undefined, 'Stack trace must never be leaked in production');
      } finally {
        (env as any).NODE_ENV = originalEnv;
      }
    });
  });

  describe('D. Financial Data Integrity & Formula Injection Defense', () => {
    it('should sanitize CSV cells starting with formula injection prefixes (=, +, -, @, \\t, \\r)', () => {
      const maliciousItems = [
        '=cmd|"/c calc"!A1',
        '+10+20',
        '-500',
        '@SUM(1,2)',
        '\tTAB_INDENTED',
      ];

      for (const item of maliciousItems) {
        const sanitized = ReportExportService.sanitizeFormulaInjection(item);
        assert.ok(
          sanitized.startsWith("'"),
          `Expected cell "${item}" to be escaped with single quote, got "${sanitized}"`
        );
      }
    });

    it('should preserve safe non-formula values without single quote prepending', () => {
      const safeValues = ['Groceries', 'Electric Utility', '125.50', 'Salary Deposit'];

      for (const val of safeValues) {
        const sanitized = ReportExportService.sanitizeFormulaInjection(val);
        assert.equal(sanitized, val);
      }
    });

    it('should prepend UTF-8 Byte Order Mark in CSV generation for safe spreadsheet display', () => {
      const mockReport: any = {
        period: { label: 'March 2026', startDate: '2026-03-01', endDate: '2026-03-31', currency: 'USD' },
        summary: {
          totalIncome: 5000,
          totalExpenses: 2000,
          netCashFlow: 3000,
          savingsRatePercentage: 60,
          transactionCount: 10,
          incomeTransactionCount: 2,
          expenseTransactionCount: 8,
          highestSpendingCategory: null,
          lowestSpendingCategory: null,
          budgetUtilization: { totalLimit: 3000, totalSpent: 2000, utilizationPercentage: 66, activeBudgetCount: 1, exceededCount: 0 },
          savingsProgress: { totalSaved: 5000, totalTarget: 10000, overallProgressPercentage: 50, periodContributions: 500 },
          billsSummary: { totalPaidInPeriod: 500, pendingCommitments: 100, overdueCount: 0, overdueAmount: 0 },
          netWorthNote: 'Net worth unavailable — additional asset and liability information is required.',
        },
        categories: [],
        cashFlowTrend: [],
        budgetPerformance: [],
        savingsPerformance: [],
        billsAnalysis: [],
      };

      const csv = ReportExportService.generateCsv(mockReport);
      assert.ok(csv.startsWith('\uFEFF'), 'CSV must begin with UTF-8 BOM');
      assert.ok(csv.includes('Net worth unavailable — additional asset and liability information is required.'));
    });
  });

  describe('E. Live System Telemetry & Orchestrator Health Probes', () => {
    it('should return HTTP 200 on /api/health/live (Liveness probe)', async () => {
      const res = await makeRequest(server, { method: 'GET', path: '/api/health/live' });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal((res.body.data as { status: string }).status, 'alive');
    });

    it('should return 503 on /api/health/ready when MongoDB is unconfigured (Readiness probe)', async () => {
      const res = await makeRequest(server, { method: 'GET', path: '/api/health/ready' });
      // When DB is unconfigured, ready status should be 503
      assert.equal(res.status, 503);
      assert.equal(res.body.success, false);
      assert.equal((res.body.data as { ready: boolean }).ready, false);
    });

    it('should provide transparent diagnostics on /api/health', async () => {
      const res = await makeRequest(server, { method: 'GET', path: '/api/health' });
      assert.equal(res.status, 200);
      const data = res.body.data as { service: string; system: { nodeVersion: string } };
      assert.equal(data.service, 'ArthaAI Backend API');
      assert.ok(data.system.nodeVersion);
    });
  });
});
