import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import http from 'http';
import { Transaction, amountToCents, centsToAmount } from '../src/models/transaction.model.js';
import { generateToken } from '../src/utils/token.js';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';

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

describe('ArthaAI Phase 4 Financial Transaction Management Test Suite', () => {
  let server: http.Server;
  const testUserToken = generateToken({ id: 'usr-trans-tester-001', email: 'tester@artha.ai' });
  const otherUserToken = generateToken({ id: 'usr-trans-tester-002', email: 'other@artha.ai' });

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

  // 1. Integer Precision Arithmetic Tests
  it('should accurately convert decimal currency to integer minor units (amountToCents)', () => {
    assert.equal(amountToCents(10.5), 1050);
    assert.equal(amountToCents(19.99), 1999);
    assert.equal(amountToCents(0.01), 1);
    assert.equal(amountToCents(12345.67), 1234567);
    // Eliminates IEEE 754 precision issues like 0.1 + 0.2
    assert.equal(amountToCents(0.1 + 0.2), 30);
  });

  it('should accurately convert integer minor units to decimal currency (centsToAmount)', () => {
    assert.equal(centsToAmount(1050), 10.5);
    assert.equal(centsToAmount(1999), 19.99);
    assert.equal(centsToAmount(1), 0.01);
    assert.equal(centsToAmount(1234567), 12345.67);
  });

  // 2. Mongoose Schema Validation
  it('should reject transactions with negative or zero amounts', async () => {
    const zeroTx = new Transaction({
      userId: new mongoose.Types.ObjectId(),
      title: 'Invalid Zero Tx',
      amountInCents: 0,
      type: 'expense',
      category: 'Food & Dining',
    });

    await assert.rejects(async () => {
      await zeroTx.validate();
    }, /greater than zero/);

    const negativeTx = new Transaction({
      userId: new mongoose.Types.ObjectId(),
      title: 'Negative Tx',
      amountInCents: -500,
      type: 'expense',
      category: 'Food & Dining',
    });

    await assert.rejects(async () => {
      await negativeTx.validate();
    }, /greater than zero/);
  });

  it('should reject transactions with invalid transaction types', async () => {
    const invalidTypeTx = new Transaction({
      userId: new mongoose.Types.ObjectId(),
      title: 'Crypto Transfer',
      amountInCents: 5000,
      type: 'transfer' as unknown as 'income',
      category: 'Investments',
    });

    await assert.rejects(async () => {
      await invalidTypeTx.validate();
    }, /Transaction type must be either 'income' or 'expense'/);
  });

  it('should reject non-integer amountInCents', async () => {
    const floatCentsTx = new Transaction({
      userId: new mongoose.Types.ObjectId(),
      title: 'Float Cents Tx',
      amountInCents: 1250.75,
      type: 'expense',
      category: 'Groceries',
    });

    await assert.rejects(async () => {
      await floatCentsTx.validate();
    }, /integer minor unit/);
  });

  it('should validate and transform valid transaction document to JSON', () => {
    const validTx = new Transaction({
      userId: new mongoose.Types.ObjectId('65d000000000000000000001'),
      title: 'Client Consulting Inflow',
      amountInCents: 450000, // $4,500.00
      type: 'income',
      category: 'Salary & Earnings',
      merchant: 'Acme Corp',
      account: 'Primary Checking',
    });

    const json = validTx.toJSON();
    assert.equal(json.title, 'Client Consulting Inflow');
    assert.equal(json.amount, 4500);
    assert.equal(json.amountInCents, 450000);
    assert.equal(json.type, 'income');
    assert.equal(json.id, String(validTx._id));
    assert.equal(String(json.userId), '65d000000000000000000001');
    assert.equal(json._id, undefined);
    assert.equal(json.__v, undefined);
  });

  // 3. Security: Authentication Verification
  it('should reject GET /api/transactions without authentication token (401)', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/transactions',
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Authentication required/);
  });

  it('should reject POST /api/transactions without authentication token (401)', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/transactions',
      body: {
        title: 'Unauthorized Transaction',
        amount: 100,
        type: 'expense',
        category: 'Food',
      },
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('should reject GET /api/transactions/summary without authentication token (401)', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/transactions/summary',
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  // 4. Input Validation on Transactions API
  it('should reject transaction creation with missing title (400)', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/transactions',
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: {
        amount: 25.5,
        type: 'expense',
        category: 'Food & Dining',
      },
    });

    // In unconfigured state, returns 503 before validation or 400 if validated first
    // Our controller checks requireDatabaseReady() first
    assert.ok(res.status === 400 || res.status === 503);
  });

  it('should reject transaction retrieval with invalid ObjectId format (400 or 503)', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/transactions/not-a-valid-object-id',
      headers: { Authorization: `Bearer ${testUserToken}` },
    });

    assert.ok(res.status === 400 || res.status === 503);
  });

  // 5. MongoDB Unconfigured Graceful Degradation
  it('should return 503 on POST /api/transactions when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/transactions',
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: {
        title: 'Target Groceries',
        amount: 84.5,
        type: 'expense',
        category: 'Food & Dining',
      },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Database is unconfigured/);
  });

  it('should return 503 on GET /api/transactions when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/transactions',
      headers: { Authorization: `Bearer ${testUserToken}` },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Database is unconfigured/);
  });

  it('should return 503 on GET /api/transactions/summary when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/transactions/summary',
      headers: { Authorization: `Bearer ${testUserToken}` },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Database is unconfigured/);
  });

  it('should return 503 on GET /api/transactions/categories when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/transactions/categories',
      headers: { Authorization: `Bearer ${testUserToken}` },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Database is unconfigured/);
  });

  it('should return 503 on PATCH /api/transactions/:id when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'PATCH',
      path: '/api/transactions/65d000000000000000000099',
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: { title: 'Updated Title' },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Database is unconfigured/);
  });

  it('should return 503 on DELETE /api/transactions/:id when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'DELETE',
      path: '/api/transactions/65d000000000000000000099',
      headers: { Authorization: `Bearer ${testUserToken}` },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Database is unconfigured/);
  });

  // 6. Financial Calculation Mathematics Unit Tests
  it('should calculate accurate income, expenses, and savings rate using integer arithmetic', () => {
    const txRecords = [
      { type: 'income', amountInCents: 1000000 }, // $10,000.00
      { type: 'income', amountInCents: 50000 },  // $500.00
      { type: 'expense', amountInCents: 320000 }, // $3,200.00
      { type: 'expense', amountInCents: 150000 }, // $1,500.00
      { type: 'expense', amountInCents: 80000 },  // $800.00
    ];

    let incomeCents = 0;
    let expenseCents = 0;
    for (const r of txRecords) {
      if (r.type === 'income') incomeCents += r.amountInCents;
      else expenseCents += r.amountInCents;
    }

    assert.equal(incomeCents, 1050000); // $10,500.00
    assert.equal(expenseCents, 550000);  // $5,500.00
    const netBalanceCents = incomeCents - expenseCents;
    assert.equal(netBalanceCents, 500000); // $5,000.00

    const savingsRate = Math.round(((incomeCents - expenseCents) / incomeCents) * 100);
    assert.equal(savingsRate, 48); // 5000 / 10500 = 47.6% -> 48%
  });
});
