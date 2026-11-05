import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import http from 'http';
import { SavingsGoal, amountToCents, centsToAmount } from '../src/models/savings-goal.model.js';
import { GoalContribution } from '../src/models/goal-contribution.model.js';
import { SavingsService } from '../src/services/savings.service.js';
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
          try {
            const parsed = rawData ? JSON.parse(rawData) : {};
            resolve({ status: res.statusCode || 500, body: parsed, headers: res.headers });
          } catch {
            resolve({ status: res.statusCode || 500, body: { raw: rawData }, headers: res.headers });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (options.body) {
      req.write(postData);
    }
    req.end();
  });
};

describe('ArthaAI Phase 6 Savings Goals & Financial Planning Engine Test Suite', () => {
  let server: http.Server;
  const mockUserId = new mongoose.Types.ObjectId().toString();
  let authToken: string;

  before(async () => {
    const app = createApp();
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });
    authToken = generateToken({
      id: mockUserId,
      email: 'alex.morgan@artha.ai',
      fullName: 'Alex Morgan',
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  // 1. Model Validation & Minor-Unit Math
  it('should validate and create a valid savings goal document and transform to JSON', () => {
    const goal = new SavingsGoal({
      userId: new mongoose.Types.ObjectId(),
      name: 'Emergency Fund',
      category: 'Emergency Fund',
      targetAmountInCents: 2500000, // $25,000.00
      currentAmountInCents: 500000, // $5,000.00
      startDate: new Date('2026-01-01'),
      deadline: new Date('2026-12-31'),
      status: 'in_progress',
      priority: 'high',
    });

    const validationError = goal.validateSync();
    assert.equal(validationError, undefined);

    const json = goal.toJSON();
    assert.equal(json.name, 'Emergency Fund');
    assert.equal(json.targetAmount, 25000);
    assert.equal(json.currentAmount, 5000);
    assert.equal(json.remainingAmount, 20000);
    assert.equal(json.progressPercentage, 20);
  });

  it('should accurately convert decimal currency to integer minor units and vice versa', () => {
    assert.equal(amountToCents(5000), 500000);
    assert.equal(amountToCents(124.95), 12495);
    assert.equal(centsToAmount(500000), 5000);
    assert.equal(centsToAmount(12495), 124.95);
  });

  it('should reject a savings goal with negative or zero target amount', () => {
    const goal = new SavingsGoal({
      userId: new mongoose.Types.ObjectId(),
      name: 'Invalid Target',
      category: 'Emergency Fund',
      targetAmountInCents: 0,
      deadline: new Date('2027-01-01'),
    });

    const error = goal.validateSync();
    assert.ok(error);
    assert.ok(error.errors['targetAmountInCents']);
  });

  it('should reject a savings goal with non-integer targetAmountInCents', () => {
    const goal = new SavingsGoal({
      userId: new mongoose.Types.ObjectId(),
      name: 'Floating Target',
      category: 'Emergency Fund',
      targetAmountInCents: 5000.5,
      deadline: new Date('2027-01-01'),
    });

    const error = goal.validateSync();
    assert.ok(error);
    assert.ok(error.errors['targetAmountInCents']);
  });

  it('should reject a goal where deadline is before startDate', () => {
    const goal = new SavingsGoal({
      userId: new mongoose.Types.ObjectId(),
      name: 'Chronology Error',
      category: 'Emergency Fund',
      targetAmountInCents: 100000,
      startDate: new Date('2027-06-01'),
      deadline: new Date('2027-01-01'),
    });

    const error = goal.validateSync();
    assert.ok(error);
    assert.ok(error.errors['deadline']);
  });

  // 2. Goal Contribution Model Validation
  it('should validate and create a valid goal contribution document', () => {
    const contribution = new GoalContribution({
      userId: new mongoose.Types.ObjectId(),
      goalId: new mongoose.Types.ObjectId(),
      amountInCents: 50000, // $500.00
      type: 'deposit',
      notes: 'Monthly payroll transfer',
    });

    const validationError = contribution.validateSync();
    assert.equal(validationError, undefined);

    const json = contribution.toJSON();
    assert.equal(json.amount, 500);
    assert.equal(json.type, 'deposit');
  });

  it('should reject a goal contribution with negative or zero amount', () => {
    const contribution = new GoalContribution({
      userId: new mongoose.Types.ObjectId(),
      goalId: new mongoose.Types.ObjectId(),
      amountInCents: -500,
      type: 'deposit',
    });

    const error = contribution.validateSync();
    assert.ok(error);
    assert.ok(error.errors['amountInCents']);
  });

  it('should reject an invalid contribution type', () => {
    const contribution = new GoalContribution({
      userId: new mongoose.Types.ObjectId(),
      goalId: new mongoose.Types.ObjectId(),
      amountInCents: 5000,
      type: 'transfer_unknown' as any,
    });

    const error = contribution.validateSync();
    assert.ok(error);
    assert.ok(error.errors['type']);
  });

  // 3. Savings Service Business Logic & Milestone Calculations
  it('should correctly enrich goal with progress, required monthly savings, and health status', () => {
    const startDate = new Date();
    const deadline = new Date(startDate.getTime() + 180 * 24 * 3600 * 1000); // 6 months

    const goal = new SavingsGoal({
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      name: 'Tech Upgrade Fund',
      category: 'Tech & Gadgets',
      targetAmountInCents: 600000, // $6,000
      currentAmountInCents: 300000, // $3,000 (50%)
      startDate,
      deadline,
      status: 'in_progress',
      priority: 'medium',
      createdAt: startDate,
      updatedAt: startDate,
    });

    const enriched = SavingsService.enrichGoal(goal, []);
    assert.equal(enriched.targetAmount, 6000);
    assert.equal(enriched.currentAmount, 3000);
    assert.equal(enriched.remainingAmount, 3000);
    assert.equal(enriched.progressPercentage, 50);
    assert.ok(enriched.requiredMonthlySavings > 0);
    assert.ok(['ahead', 'on_track', 'behind', 'at_risk', 'completed'].includes(enriched.healthStatus));
  });

  it('should mark goal health as completed when currentAmount reaches or exceeds target', () => {
    const startDate = new Date('2026-01-01');
    const deadline = new Date('2026-12-31');

    const goal = new SavingsGoal({
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      name: 'Fully Funded Goal',
      category: 'Emergency Fund',
      targetAmountInCents: 500000,
      currentAmountInCents: 500000, // 100%
      startDate,
      deadline,
      status: 'completed',
      createdAt: startDate,
      updatedAt: startDate,
    });

    const enriched = SavingsService.enrichGoal(goal, []);
    assert.equal(enriched.healthStatus, 'completed');
    assert.equal(enriched.remainingAmount, 0);
    assert.equal(enriched.progressPercentage, 100);
  });

  // 4. Authentication Guards (401 Rejection)
  it('should reject unauthenticated GET /api/savings-goals with 401', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/savings-goals',
    });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated POST /api/savings-goals with 401', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/savings-goals',
      body: { name: 'Unauthorized Goal', targetAmount: 5000 },
    });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated GET /api/savings-goals/overview with 401', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/savings-goals/overview',
    });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated GET /api/savings-goals/:id with 401', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/savings-goals/65d000000000000000000099',
    });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated PATCH /api/savings-goals/:id with 401', async () => {
    const res = await makeRequest(server, {
      method: 'PATCH',
      path: '/api/savings-goals/65d000000000000000000099',
      body: { name: 'Hacked Goal' },
    });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated DELETE /api/savings-goals/:id with 401', async () => {
    const res = await makeRequest(server, {
      method: 'DELETE',
      path: '/api/savings-goals/65d000000000000000000099',
    });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated POST /api/savings-goals/:id/contributions with 401', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/savings-goals/65d000000000000000000099/contributions',
      body: { amount: 500, type: 'deposit' },
    });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated GET /api/savings-goals/:id/contributions with 401', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/savings-goals/65d000000000000000000099/contributions',
    });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated GET /api/savings-goals/:id/analytics with 401', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/savings-goals/65d000000000000000000099/analytics',
    });
    assert.equal(res.status, 401);
  });

  // 5. Graceful 503 Degradation When MongoDB Is Unconfigured
  it('should return 503 on POST /api/savings-goals when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/savings-goals',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        name: 'Unconfigured DB Goal',
        targetAmount: 5000,
        deadline: '2027-12-31',
      },
    });
    assert.equal(res.status, 503);
    assert.match(String(res.body.message), /Database is unconfigured/);
  });

  it('should return 503 on GET /api/savings-goals when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/savings-goals',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(res.status, 503);
    assert.match(String(res.body.message), /Database is unconfigured/);
  });

  it('should return 503 on GET /api/savings-goals/overview when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/savings-goals/overview',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(res.status, 503);
    assert.match(String(res.body.message), /Database is unconfigured/);
  });

  it('should return 503 on POST /api/savings-goals/:id/contributions when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/savings-goals/65d000000000000000000099/contributions',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { amount: 200, type: 'deposit' },
    });
    assert.equal(res.status, 503);
    assert.match(String(res.body.message), /Database is unconfigured/);
  });
});
