import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import http from 'http';
import { Budget } from '../src/models/budget.model.js';
import { BudgetService } from '../src/services/budget.service.js';
import { generateToken } from '../src/utils/token.js';
import { createApp } from '../src/app.js';

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
    if (options.body) {
      req.write(postData);
    }
    req.end();
  });
};

describe('ArthaAI Phase 5 Budget Management System Test Suite', () => {
  let server: http.Server;
  const testUserToken = generateToken({ id: 'usr-budget-tester-001', email: 'budget.tester@artha.ai' });

  before(async () => {
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => resolve());
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  // 1. Model & Schema Validation Tests
  it('should validate and create a valid budget document and transform to JSON', () => {
    const start = new Date('2026-11-01');
    const end = new Date('2026-11-30');
    const budgetDoc = new Budget({
      userId: new mongoose.Types.ObjectId('65d000000000000000000010'),
      name: 'Groceries & Dining Cap',
      period: 'monthly',
      category: 'Food & Dining',
      limitInCents: 85000, // $850.00
      startDate: start,
      endDate: end,
      alertThresholds: [50, 75, 90, 100],
    });

    const json = budgetDoc.toJSON();
    assert.equal(json.name, 'Groceries & Dining Cap');
    assert.equal(json.limit, 850);
    assert.equal(json.limitInCents, 85000);
    assert.equal(json.period, 'monthly');
    assert.equal(json.category, 'Food & Dining');
    assert.equal(json.isActive, true);
    assert.equal(json._id, undefined);
    assert.equal(json.__v, undefined);
  });

  it('should reject budget with negative or zero spending limit', async () => {
    const zeroBudget = new Budget({
      userId: new mongoose.Types.ObjectId(),
      name: 'Zero Cap',
      period: 'monthly',
      category: 'Utilities',
      limitInCents: 0,
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-11-30'),
    });

    await assert.rejects(async () => {
      await zeroBudget.validate();
    }, /greater than zero/);

    const negBudget = new Budget({
      userId: new mongoose.Types.ObjectId(),
      name: 'Neg Cap',
      period: 'monthly',
      category: 'Utilities',
      limitInCents: -5000,
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-11-30'),
    });

    await assert.rejects(async () => {
      await negBudget.validate();
    }, /greater than zero/);
  });

  it('should reject budget with non-integer limitInCents', async () => {
    const floatBudget = new Budget({
      userId: new mongoose.Types.ObjectId(),
      name: 'Float Cap',
      period: 'monthly',
      category: 'Utilities',
      limitInCents: 1500.5,
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-11-30'),
    });

    await assert.rejects(async () => {
      await floatBudget.validate();
    }, /integer minor unit/);
  });

  it('should reject budget where endDate is before or equal to startDate', async () => {
    const invalidDateBudget = new Budget({
      userId: new mongoose.Types.ObjectId(),
      name: 'Invalid Dates',
      period: 'monthly',
      category: 'Shopping',
      limitInCents: 50000,
      startDate: new Date('2026-11-30'),
      endDate: new Date('2026-11-01'),
    });

    await assert.rejects(async () => {
      await invalidDateBudget.validate();
    }, /End date must be strictly after start date/);
  });

  it('should reject budget with invalid period', async () => {
    const invalidPeriodBudget = new Budget({
      userId: new mongoose.Types.ObjectId(),
      name: 'Weekly Budget',
      period: 'weekly' as unknown as 'monthly',
      category: 'Shopping',
      limitInCents: 50000,
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-11-08'),
    });

    await assert.rejects(async () => {
      await invalidPeriodBudget.validate();
    }, /Budget period must be either 'monthly' or 'yearly'/);
  });

  // 2. Calculation & Threshold Logic Unit Tests
  it('should correctly determine status levels based on utilization percentage', () => {
    assert.equal(BudgetService.getStatusLevel(25), 'normal');
    assert.equal(BudgetService.getStatusLevel(49.9), 'normal');
    assert.equal(BudgetService.getStatusLevel(50), 'moderate');
    assert.equal(BudgetService.getStatusLevel(74.9), 'moderate');
    assert.equal(BudgetService.getStatusLevel(75), 'warning');
    assert.equal(BudgetService.getStatusLevel(89.9), 'warning');
    assert.equal(BudgetService.getStatusLevel(90), 'critical');
    assert.equal(BudgetService.getStatusLevel(99.9), 'critical');
    assert.equal(BudgetService.getStatusLevel(100), 'exceeded');
    assert.equal(BudgetService.getStatusLevel(135), 'exceeded');
  });

  it('should generate accurate threshold alerts and prevent duplicate alerts', () => {
    // 78% spent of $1,000 budget ($780.00)
    const alerts = BudgetService.generateAlerts(
      'bg-123',
      'Food Budget',
      'Food & Dining',
      100000,
      78000,
      [50, 75, 90, 100]
    );

    assert.equal(alerts.length, 1);
    assert.equal(alerts[0].threshold, 75);
    assert.equal(alerts[0].level, 'warning');
    assert.equal(alerts[0].utilizationPercentage, 78);
    assert.match(alerts[0].message, /has reached 78%/);
    assert.equal(alerts[0].remaining, 220);
  });

  it('should handle budgets exceeded over 100% without arithmetic overflow', () => {
    // 125% spent of $800 budget ($1,000.00 spent)
    const alerts = BudgetService.generateAlerts(
      'bg-456',
      'Tech Budget',
      'Technology & SaaS',
      80000,
      100000,
      [50, 75, 90, 100]
    );

    assert.equal(alerts.length, 1);
    assert.equal(alerts[0].threshold, 100);
    assert.equal(alerts[0].level, 'exceeded');
    assert.equal(alerts[0].utilizationPercentage, 125);
    assert.match(alerts[0].message, /has exceeded its limit by \$200\.00/);
    assert.equal(alerts[0].remaining, -200);
  });

  it('should handle zero spending without NaN or division by zero errors', () => {
    const alerts = BudgetService.generateAlerts(
      'bg-789',
      'Zero Spend',
      'Healthcare',
      50000,
      0,
      [50, 75, 90, 100]
    );

    assert.equal(alerts.length, 0);
  });

  // 3. API Security & Authentication Tests
  it('should reject unauthenticated GET /api/budgets (401)', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/budgets',
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Authentication required/);
  });

  it('should reject unauthenticated POST /api/budgets (401)', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/budgets',
      body: {
        name: 'Secret Budget',
        category: 'Food',
        limit: 500,
        startDate: '2026-11-01',
        endDate: '2026-11-30',
      },
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('should reject unauthenticated GET /api/budgets/overview (401)', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/budgets/overview',
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('should reject unauthenticated GET /api/budgets/history (401)', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/budgets/history',
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('should reject unauthenticated PATCH /api/budgets/:id (401)', async () => {
    const res = await makeRequest(server, {
      method: 'PATCH',
      path: '/api/budgets/65d000000000000000000099',
      body: { name: 'Unauthorized Change' },
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('should reject unauthenticated DELETE /api/budgets/:id (401)', async () => {
    const res = await makeRequest(server, {
      method: 'DELETE',
      path: '/api/budgets/65d000000000000000000099',
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  // 4. Input Validation & Graceful MongoDB Degradation
  it('should return 503 on POST /api/budgets when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/budgets',
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: {
        name: 'Dining Budget',
        category: 'Food & Dining',
        period: 'monthly',
        limit: 600,
        startDate: '2026-11-01',
        endDate: '2026-11-30',
      },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Database is unconfigured/);
  });

  it('should return 503 on GET /api/budgets when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/budgets',
      headers: { Authorization: `Bearer ${testUserToken}` },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Database is unconfigured/);
  });

  it('should return 503 on GET /api/budgets/overview when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/budgets/overview',
      headers: { Authorization: `Bearer ${testUserToken}` },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Database is unconfigured/);
  });

  it('should return 503 on GET /api/budgets/history when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/budgets/history',
      headers: { Authorization: `Bearer ${testUserToken}` },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Database is unconfigured/);
  });

  it('should return 503 on PATCH /api/budgets/:id when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'PATCH',
      path: '/api/budgets/65d000000000000000000099',
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: { limit: 750 },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Database is unconfigured/);
  });

  it('should return 503 on DELETE /api/budgets/:id when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'DELETE',
      path: '/api/budgets/65d000000000000000000099',
      headers: { Authorization: `Bearer ${testUserToken}` },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Database is unconfigured/);
  });
});
