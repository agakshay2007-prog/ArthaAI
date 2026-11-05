import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import http from 'http';
import { Bill, amountToCents, centsToAmount, calculateNextDueDate } from '../src/models/bill.model.js';
import { BillPayment } from '../src/models/bill-payment.model.js';
import { BillService } from '../src/services/bill.service.js';
import { generateToken } from '../src/utils/token.js';
import { createApp } from '../src/app.js';
import { BillResponse } from '../src/types/index.js';

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

describe('ArthaAI Phase 7 Bills, Payments & Recurring Expenses Test Suite', () => {
  let server: http.Server;
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockToken = generateToken({
    id: mockUserId,
    email: 'alex.morgan@example.com',
    fullName: 'Alex Morgan',
  });

  before(async () => {
    const app = createApp();
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  // ==========================================
  // SECTION 1: Model Validation & Minor Units
  // ==========================================

  it('should validate and create a valid Bill document and transform to JSON', () => {
    const billDoc = new Bill({
      userId: new mongoose.Types.ObjectId(mockUserId),
      name: 'High-Speed Fiber Internet',
      category: 'Internet',
      provider: 'AT&T Fiber',
      amountInCents: 8500,
      currency: 'USD',
      frequency: 'monthly',
      startDate: new Date('2026-11-01'),
      dueDate: new Date('2026-11-15'),
      reminderDays: [7, 3, 1],
      autoRenew: true,
      status: 'active',
    });

    const validationError = billDoc.validateSync();
    assert.equal(validationError, undefined);
    assert.equal(billDoc.amount, 85.0);
    assert.equal(billDoc.amountInCents, 8500);

    const json = billDoc.toJSON();
    assert.equal(json.name, 'High-Speed Fiber Internet');
    assert.equal(json.amount, 85.0);
    assert.equal(json.frequency, 'monthly');
    assert.equal(json.category, 'Internet');
  });

  it('should accurately convert decimal currency to integer minor units and vice versa', () => {
    assert.equal(amountToCents(85.0), 8500);
    assert.equal(amountToCents(142.3), 14230);
    assert.equal(amountToCents(0.99), 99);
    assert.equal(centsToAmount(8500), 85.0);
    assert.equal(centsToAmount(14230), 142.3);
    assert.equal(centsToAmount(99), 0.99);
  });

  it('should reject a Bill with negative or zero amount', () => {
    const negativeBill = new Bill({
      userId: new mongoose.Types.ObjectId(mockUserId),
      name: 'Electric Bill',
      category: 'Electricity',
      amountInCents: -500,
      dueDate: new Date('2026-11-20'),
    });
    const err = negativeBill.validateSync();
    assert.ok(err);
    assert.ok(err.errors['amountInCents']);

    const zeroBill = new Bill({
      userId: new mongoose.Types.ObjectId(mockUserId),
      name: 'Electric Bill',
      category: 'Electricity',
      amountInCents: 0,
      dueDate: new Date('2026-11-20'),
    });
    const errZero = zeroBill.validateSync();
    assert.ok(errZero);
    assert.ok(errZero.errors['amountInCents']);
  });

  it('should reject a Bill with non-integer amountInCents', () => {
    const floatBill = new Bill({
      userId: new mongoose.Types.ObjectId(mockUserId),
      name: 'Electric Bill',
      category: 'Electricity',
      amountInCents: 1200.5,
      dueDate: new Date('2026-11-20'),
    });
    const err = floatBill.validateSync();
    assert.ok(err);
    assert.ok(err.errors['amountInCents']);
  });

  it('should reject a Bill with an invalid recurrence frequency', () => {
    const invalidBill = new Bill({
      userId: new mongoose.Types.ObjectId(mockUserId),
      name: 'Subscription',
      category: 'Other',
      amountInCents: 1500,
      dueDate: new Date('2026-11-20'),
      frequency: 'bi-weekly' as unknown,
    });
    const err = invalidBill.validateSync();
    assert.ok(err);
    assert.ok(err.errors['frequency']);
  });

  it('should validate and create a valid BillPayment document', () => {
    const paymentDoc = new BillPayment({
      userId: new mongoose.Types.ObjectId(mockUserId),
      billId: new mongoose.Types.ObjectId(),
      amountInCents: 8500,
      paymentDate: new Date('2026-11-10'),
      status: 'paid',
      paymentMethod: 'credit_card',
      referenceNumber: 'REF-987654',
      notes: 'Automated card payment',
    });

    const validationError = paymentDoc.validateSync();
    assert.equal(validationError, undefined);
    assert.equal(paymentDoc.amount, 85.0);
    assert.equal(paymentDoc.amountInCents, 8500);
    assert.equal(paymentDoc.paymentMethod, 'credit_card');
  });

  it('should reject a BillPayment with non-positive amount', () => {
    const invalidPayment = new BillPayment({
      userId: new mongoose.Types.ObjectId(mockUserId),
      billId: new mongoose.Types.ObjectId(),
      amountInCents: 0,
      paymentMethod: 'bank_transfer',
    });
    const err = invalidPayment.validateSync();
    assert.ok(err);
    assert.ok(err.errors['amountInCents']);
  });

  // ==========================================
  // SECTION 2: Recurring Schedule Calculations
  // ==========================================

  it('should calculate weekly recurrence by advancing exactly 7 days', () => {
    const currentDue = new Date(Date.UTC(2026, 10, 10, 12, 0, 0)); // Nov 10, 2026
    const nextDue = calculateNextDueDate(currentDue, 'weekly');
    assert.ok(nextDue);
    assert.equal(nextDue.getUTCFullYear(), 2026);
    assert.equal(nextDue.getUTCMonth(), 10); // Nov
    assert.equal(nextDue.getUTCDate(), 17); // Nov 17
  });

  it('should calculate monthly recurrence on standard days', () => {
    const currentDue = new Date(Date.UTC(2026, 10, 15, 12, 0, 0)); // Nov 15, 2026
    const nextDue = calculateNextDueDate(currentDue, 'monthly');
    assert.ok(nextDue);
    assert.equal(nextDue.getUTCFullYear(), 2026);
    assert.equal(nextDue.getUTCMonth(), 11); // Dec
    assert.equal(nextDue.getUTCDate(), 15); // Dec 15
  });

  it('should handle January 31 month-end rollover without JavaScript date overflow (clamp to Feb 28)', () => {
    // 2026 is a non-leap year (February has 28 days)
    const currentDue = new Date(Date.UTC(2026, 0, 31, 12, 0, 0)); // Jan 31, 2026
    const nextDue = calculateNextDueDate(currentDue, 'monthly');
    assert.ok(nextDue);
    assert.equal(nextDue.getUTCFullYear(), 2026);
    assert.equal(nextDue.getUTCMonth(), 1); // Feb (NOT March!)
    assert.equal(nextDue.getUTCDate(), 28); // Feb 28
  });

  it('should handle January 31 in a leap year (clamp to Feb 29)', () => {
    // 2028 is a leap year (February has 29 days)
    const currentDue = new Date(Date.UTC(2028, 0, 31, 12, 0, 0)); // Jan 31, 2028
    const nextDue = calculateNextDueDate(currentDue, 'monthly');
    assert.ok(nextDue);
    assert.equal(nextDue.getUTCFullYear(), 2028);
    assert.equal(nextDue.getUTCMonth(), 1); // Feb
    assert.equal(nextDue.getUTCDate(), 29); // Feb 29
  });

  it('should handle quarterly schedule calculation', () => {
    const currentDue = new Date(Date.UTC(2026, 0, 15, 12, 0, 0)); // Jan 15, 2026
    const nextDue = calculateNextDueDate(currentDue, 'quarterly');
    assert.ok(nextDue);
    assert.equal(nextDue.getUTCFullYear(), 2026);
    assert.equal(nextDue.getUTCMonth(), 3); // April
    assert.equal(nextDue.getUTCDate(), 15); // April 15
  });

  it('should clamp yearly leap-year Feb 29 to Feb 28 on non-leap subsequent year', () => {
    const leapDue = new Date(Date.UTC(2024, 1, 29, 12, 0, 0)); // Feb 29, 2024
    const nextDue = calculateNextDueDate(leapDue, 'yearly');
    assert.ok(nextDue);
    assert.equal(nextDue.getUTCFullYear(), 2025);
    assert.equal(nextDue.getUTCMonth(), 1); // Feb
    assert.equal(nextDue.getUTCDate(), 28); // Feb 28
  });

  it('should return null for one_time bills', () => {
    const oneTimeDue = new Date(Date.UTC(2026, 11, 1, 12, 0, 0));
    const nextDue = calculateNextDueDate(oneTimeDue, 'one_time');
    assert.equal(nextDue, null);
  });

  it('should correctly normalize recurring bill frequencies to monthly equivalents', () => {
    assert.equal(BillService.normalizeMonthlyAmount(12000, 'monthly'), 12000); // $120.00 / mo
    assert.equal(BillService.normalizeMonthlyAmount(36000, 'quarterly'), 12000); // $360.00 / qtr = $120.00 / mo
    assert.equal(BillService.normalizeMonthlyAmount(120000, 'yearly'), 10000); // $1,200.00 / yr = $100.00 / mo
    assert.equal(BillService.normalizeMonthlyAmount(5000, 'one_time'), 0); // one_time not recurring
  });

  // ==========================================
  // SECTION 3: Payment Reminders Engine
  // ==========================================

  it('should generate accurate payment reminders and prioritize urgent statuses', () => {
    const now = new Date();
    const pastDue = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const dueToday = new Date(now.getTime()).toISOString();
    const dueTomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();
    const dueIn3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

    const mockEnrichedBills: BillResponse[] = [
      {
        id: 'bill-overdue',
        userId: mockUserId,
        name: 'Electric Utility',
        category: 'Electricity',
        amountInCents: 14000,
        amount: 140.0,
        currency: 'USD',
        frequency: 'monthly',
        startDate: '2026-10-01',
        dueDate: pastDue,
        autoRenew: true,
        reminderDays: [7, 3, 1],
        status: 'active',
        paymentStatus: 'overdue',
        totalPaidInCents: 0,
        totalPaid: 0,
        remainingDueInCents: 14000,
        remainingDue: 140.0,
        daysUntilDue: -2,
        isOverdue: true,
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
      },
      {
        id: 'bill-today',
        userId: mockUserId,
        name: 'Water Board',
        category: 'Water',
        amountInCents: 4500,
        amount: 45.0,
        currency: 'USD',
        frequency: 'monthly',
        startDate: '2026-10-01',
        dueDate: dueToday,
        autoRenew: true,
        reminderDays: [7, 3, 1],
        status: 'active',
        paymentStatus: 'due_today',
        totalPaidInCents: 0,
        totalPaid: 0,
        remainingDueInCents: 4500,
        remainingDue: 45.0,
        daysUntilDue: 0,
        isOverdue: false,
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
      },
      {
        id: 'bill-tomorrow',
        userId: mockUserId,
        name: 'Internet Fiber',
        category: 'Internet',
        amountInCents: 8500,
        amount: 85.0,
        currency: 'USD',
        frequency: 'monthly',
        startDate: '2026-10-01',
        dueDate: dueTomorrow,
        autoRenew: true,
        reminderDays: [7, 3, 1],
        status: 'active',
        paymentStatus: 'upcoming',
        totalPaidInCents: 0,
        totalPaid: 0,
        remainingDueInCents: 8500,
        remainingDue: 85.0,
        daysUntilDue: 1,
        isOverdue: false,
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
      },
      {
        id: 'bill-paid',
        userId: mockUserId,
        name: 'Health Insurance',
        category: 'Healthcare',
        amountInCents: 34000,
        amount: 340.0,
        currency: 'USD',
        frequency: 'monthly',
        startDate: '2026-10-01',
        dueDate: dueIn3Days,
        autoRenew: true,
        reminderDays: [7, 3, 1],
        status: 'active',
        paymentStatus: 'paid',
        totalPaidInCents: 34000,
        totalPaid: 340.0,
        remainingDueInCents: 0,
        remainingDue: 0,
        daysUntilDue: 3,
        isOverdue: false,
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
      },
    ];

    const reminders = BillService.generateReminders(mockEnrichedBills);
    assert.equal(reminders.length, 3); // Overdue, Due Today, Tomorrow (paid is excluded)
    assert.equal(reminders[0].type, 'overdue');
    assert.equal(reminders[0].isUrgent, true);
    assert.equal(reminders[1].type, 'due_today');
    assert.equal(reminders[1].isUrgent, true);
    assert.equal(reminders[2].type, '1_day');
  });

  // ==========================================
  // SECTION 4: Authentication Enforcement (401)
  // ==========================================

  it('should reject unauthenticated GET /api/bills with 401', async () => {
    const res = await makeRequest(server, { method: 'GET', path: '/api/bills' });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated POST /api/bills with 401', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/bills',
      body: { name: 'Rent', amount: 1500, dueDate: '2026-12-01', category: 'Rent' },
    });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated GET /api/bills/overview with 401', async () => {
    const res = await makeRequest(server, { method: 'GET', path: '/api/bills/overview' });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated GET /api/bills/upcoming with 401', async () => {
    const res = await makeRequest(server, { method: 'GET', path: '/api/bills/upcoming' });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated GET /api/bills/:id with 401', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/bills/65d000000000000000000099',
    });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated PATCH /api/bills/:id with 401', async () => {
    const res = await makeRequest(server, {
      method: 'PATCH',
      path: '/api/bills/65d000000000000000000099',
      body: { name: 'New Name' },
    });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated DELETE /api/bills/:id with 401', async () => {
    const res = await makeRequest(server, {
      method: 'DELETE',
      path: '/api/bills/65d000000000000000000099',
    });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated POST /api/bills/:id/payments with 401', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/bills/65d000000000000000000099/payments',
      body: { amount: 100 },
    });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated GET /api/bills/:id/payments with 401', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/bills/65d000000000000000000099/payments',
    });
    assert.equal(res.status, 401);
  });

  it('should reject unauthenticated GET /api/bills/:id/analytics with 401', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/bills/65d000000000000000000099/analytics',
    });
    assert.equal(res.status, 401);
  });

  // ==========================================
  // SECTION 5: Database Degradation (503)
  // ==========================================

  it('should return 503 on POST /api/bills when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/bills',
      headers: { Authorization: `Bearer ${mockToken}` },
      body: {
        name: 'Internet Bill',
        amount: 85,
        category: 'Internet',
        dueDate: '2026-11-20',
      },
    });
    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.ok(String(res.body.message).includes('Database service is currently unconfigured'));
  });

  it('should return 503 on GET /api/bills when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/bills',
      headers: { Authorization: `Bearer ${mockToken}` },
    });
    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
  });

  it('should return 503 on GET /api/bills/overview when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/bills/overview',
      headers: { Authorization: `Bearer ${mockToken}` },
    });
    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
  });

  it('should return 503 on GET /api/bills/upcoming when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/bills/upcoming',
      headers: { Authorization: `Bearer ${mockToken}` },
    });
    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
  });

  it('should return 503 on POST /api/bills/:id/payments when MongoDB is unconfigured', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/bills/65d000000000000000000099/payments',
      headers: { Authorization: `Bearer ${mockToken}` },
      body: { amount: 50 },
    });
    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
  });
});
