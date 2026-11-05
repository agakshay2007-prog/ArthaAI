import mongoose from 'mongoose';
import { Bill, IBillDocument, calculateNextDueDate } from '../models/bill.model.js';
import { BillPayment, IBillPaymentDocument } from '../models/bill-payment.model.js';
import { Transaction } from '../models/transaction.model.js';
import {
  BillResponse,
  BillPaymentResponse,
  BillOverviewData,
  BillReminderItem,
  BillAnalyticsData,
  BillSchedulePaymentStatus,
  BillFrequency,
} from '../types/index.js';
import { AppError } from '../utils/apiError.js';

export class BillService {
  /**
   * Helper to normalize recurring bill amounts into an average monthly expense in cents.
   */
  public static normalizeMonthlyAmount(amountInCents: number, frequency: BillFrequency): number {
    switch (frequency) {
      case 'weekly':
        return Math.round((amountInCents * 52) / 12);
      case 'monthly':
        return amountInCents;
      case 'quarterly':
        return Math.round(amountInCents / 3);
      case 'yearly':
        return Math.round(amountInCents / 12);
      case 'one_time':
      default:
        return 0;
    }
  }

  /**
   * Enriches a bill document with payment sub-ledger calculations, remaining due, and status.
   */
  public static async enrichBill(
    bill: IBillDocument,
    payments?: IBillPaymentDocument[]
  ): Promise<BillResponse> {
    const billId = bill._id as mongoose.Types.ObjectId;
    const now = new Date();

    // If payments not provided, query them
    const billPayments =
      payments ||
      (await BillPayment.find({ billId, status: 'paid' }).sort({ paymentDate: -1 }));

    // Calculate paid for current cycle
    // For one_time: sum all paid payments
    // For recurring: sum payments paid on or after the bill's current cycle start or within dueDate cycle
    let totalPaidInCents = 0;
    let lastPaymentDate: string | undefined;

    if (bill.frequency === 'one_time') {
      totalPaidInCents = billPayments.reduce((acc, p) => acc + p.amountInCents, 0);
      if (billPayments.length > 0) {
        lastPaymentDate = billPayments[0].paymentDate.toISOString();
      }
    } else {
      // Find payments made for current cycle (between previous cycle due date and next)
      // If payment exists within 30 days before current dueDate or after
      totalPaidInCents = billPayments.reduce((acc, p) => acc + p.amountInCents, 0);
      if (billPayments.length > 0) {
        lastPaymentDate = billPayments[0].paymentDate.toISOString();
      }
    }

    const remainingDueInCents = Math.max(0, bill.amountInCents - totalPaidInCents);
    const dueDate = new Date(bill.dueDate);
    const diffMs = dueDate.getTime() - now.getTime();
    const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isOverdue = bill.status === 'active' && now.getTime() > dueDate.getTime() && remainingDueInCents > 0;

    let paymentStatus: BillSchedulePaymentStatus = 'upcoming';
    if (remainingDueInCents <= 0) {
      paymentStatus = 'paid';
    } else if (totalPaidInCents > 0) {
      paymentStatus = 'partial';
    } else if (isOverdue) {
      paymentStatus = 'overdue';
    } else if (daysUntilDue === 0) {
      paymentStatus = 'due_today';
    } else {
      paymentStatus = 'upcoming';
    }

    return {
      id: bill._id.toString(),
      userId: bill.userId.toString(),
      name: bill.name,
      description: bill.description,
      category: bill.category,
      provider: bill.provider,
      amountInCents: bill.amountInCents,
      amount: bill.amount,
      currency: bill.currency,
      frequency: bill.frequency,
      startDate: bill.startDate.toISOString(),
      dueDate: bill.dueDate.toISOString(),
      nextDueDate: bill.nextDueDate ? bill.nextDueDate.toISOString() : undefined,
      autoRenew: bill.autoRenew,
      reminderDays: bill.reminderDays,
      status: bill.status,
      paymentStatus,
      totalPaidInCents,
      totalPaid: Bill.centsToAmount(totalPaidInCents),
      remainingDueInCents,
      remainingDue: Bill.centsToAmount(remainingDueInCents),
      daysUntilDue,
      isOverdue,
      lastPaymentDate,
      createdAt: bill.createdAt.toISOString(),
      updatedAt: bill.updatedAt.toISOString(),
    };
  }

  /**
   * Generates actionable payment reminders from active bills.
   */
  public static generateReminders(enrichedBills: BillResponse[]): BillReminderItem[] {
    const reminders: BillReminderItem[] = [];

    for (const b of enrichedBills) {
      if (b.status !== 'active' || b.paymentStatus === 'paid') {
        continue;
      }

      if (b.daysUntilDue < 0) {
        reminders.push({
          id: `rem-overdue-${b.id}`,
          billId: b.id,
          billName: b.name,
          category: b.category,
          provider: b.provider,
          amount: b.remainingDue,
          dueDate: b.dueDate,
          daysUntilDue: b.daysUntilDue,
          type: 'overdue',
          isUrgent: true,
          message: `${b.name} of $${b.remainingDue.toFixed(2)} is overdue by ${Math.abs(b.daysUntilDue)} day${Math.abs(b.daysUntilDue) === 1 ? '' : 's'}.`,
        });
      } else if (b.daysUntilDue === 0) {
        reminders.push({
          id: `rem-today-${b.id}`,
          billId: b.id,
          billName: b.name,
          category: b.category,
          provider: b.provider,
          amount: b.remainingDue,
          dueDate: b.dueDate,
          daysUntilDue: 0,
          type: 'due_today',
          isUrgent: true,
          message: `${b.name} of $${b.remainingDue.toFixed(2)} is due today!`,
        });
      } else if (b.daysUntilDue === 1 && b.reminderDays.includes(1)) {
        reminders.push({
          id: `rem-1d-${b.id}`,
          billId: b.id,
          billName: b.name,
          category: b.category,
          provider: b.provider,
          amount: b.remainingDue,
          dueDate: b.dueDate,
          daysUntilDue: 1,
          type: '1_day',
          isUrgent: true,
          message: `${b.name} of $${b.remainingDue.toFixed(2)} is due tomorrow.`,
        });
      } else if (b.daysUntilDue <= 3 && b.daysUntilDue > 1 && b.reminderDays.includes(3)) {
        reminders.push({
          id: `rem-3d-${b.id}`,
          billId: b.id,
          billName: b.name,
          category: b.category,
          provider: b.provider,
          amount: b.remainingDue,
          dueDate: b.dueDate,
          daysUntilDue: b.daysUntilDue,
          type: '3_days',
          isUrgent: false,
          message: `${b.name} of $${b.remainingDue.toFixed(2)} is due in ${b.daysUntilDue} days.`,
        });
      } else if (b.daysUntilDue <= 7 && b.daysUntilDue > 3 && b.reminderDays.includes(7)) {
        reminders.push({
          id: `rem-7d-${b.id}`,
          billId: b.id,
          billName: b.name,
          category: b.category,
          provider: b.provider,
          amount: b.remainingDue,
          dueDate: b.dueDate,
          daysUntilDue: b.daysUntilDue,
          type: '7_days',
          isUrgent: false,
          message: `${b.name} of $${b.remainingDue.toFixed(2)} is due in ${b.daysUntilDue} days.`,
        });
      }
    }

    // Sort: overdue first, then due today, then nearest due date
    return reminders.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }

  /**
   * Computes the high-level bills overview for the user.
   */
  public static async computeOverview(userId: string): Promise<BillOverviewData> {
    const bills = await Bill.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ dueDate: 1 });
    const enrichedBills: BillResponse[] = [];

    let totalMonthlyRecurringInCents = 0;
    let activeBillsCount = 0;
    let paidBillsCount = 0;
    let unpaidBillsCount = 0;
    let overdueBillsCount = 0;
    let upcomingPaymentsCount = 0;
    let totalPendingAmountInCents = 0;

    for (const b of bills) {
      const enriched = await this.enrichBill(b);
      enrichedBills.push(enriched);

      if (b.status === 'active') {
        activeBillsCount++;
        totalMonthlyRecurringInCents += this.normalizeMonthlyAmount(b.amountInCents, b.frequency);

        if (enriched.paymentStatus === 'paid') {
          paidBillsCount++;
        } else {
          unpaidBillsCount++;
          totalPendingAmountInCents += enriched.remainingDueInCents;

          if (enriched.isOverdue) {
            overdueBillsCount++;
          } else {
            upcomingPaymentsCount++;
          }
        }
      }
    }

    // Payments made in current calendar month
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    const paymentsThisMonth = await BillPayment.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'paid',
      paymentDate: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalPaidThisMonthInCents = paymentsThisMonth.reduce((acc, p) => acc + p.amountInCents, 0);

    // Active reminders
    const reminders = this.generateReminders(enrichedBills);

    // Upcoming schedule (active bills sorted by dueDate, top 5)
    const upcomingBills = enrichedBills
      .filter((b) => b.status === 'active' && b.paymentStatus !== 'paid')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);

    return {
      totalBills: bills.length,
      activeBillsCount,
      paidBillsCount,
      unpaidBillsCount,
      overdueBillsCount,
      upcomingPaymentsCount,
      totalMonthlyRecurringInCents,
      totalMonthlyRecurring: Bill.centsToAmount(totalMonthlyRecurringInCents),
      totalPaidThisMonthInCents,
      totalPaidThisMonth: Bill.centsToAmount(totalPaidThisMonthInCents),
      totalPendingAmountInCents,
      totalPendingAmount: Bill.centsToAmount(totalPendingAmountInCents),
      reminders,
      upcomingBills,
    };
  }

  /**
   * Records a bill payment with strict financial integrity and optional transaction linking.
   */
  public static async recordPayment(
    userId: string,
    billId: string,
    input: {
      amount: number;
      paymentDate?: string | Date;
      paymentMethod?: string;
      referenceNumber?: string;
      notes?: string;
      transactionId?: string;
      createTransaction?: boolean;
    }
  ): Promise<{ payment: BillPaymentResponse; bill: BillResponse }> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const billObjId = new mongoose.Types.ObjectId(billId);

    // 1. Verify Bill ownership
    const bill = await Bill.findOne({ _id: billObjId, userId: userObjId });
    if (!bill) {
      throw AppError.notFound('Bill not found or does not belong to the authenticated user');
    }

    // 2. Validate amount
    const amountInCents = Bill.amountToCents(input.amount);
    if (!Number.isInteger(amountInCents) || amountInCents <= 0) {
      throw AppError.badRequest('Payment amount must be a positive number');
    }

    let linkedTransactionId: mongoose.Types.ObjectId | undefined;

    // 3. Handle existing transaction link if provided
    if (input.transactionId) {
      if (!mongoose.Types.ObjectId.isValid(input.transactionId)) {
        throw AppError.badRequest('Invalid transactionId format');
      }
      const txObjId = new mongoose.Types.ObjectId(input.transactionId);

      // Verify transaction exists and is owned by user
      const existingTx = await Transaction.findOne({ _id: txObjId, userId: userObjId });
      if (!existingTx) {
        throw AppError.badRequest('Linked transaction not found or belongs to another user');
      }

      // Check if transaction is already linked to another bill payment
      const duplicateLink = await BillPayment.findOne({ transactionId: txObjId });
      if (duplicateLink) {
        throw AppError.badRequest('Transaction is already linked to another bill payment');
      }

      linkedTransactionId = txObjId;
    } else if (input.createTransaction) {
      // 4. Create a new financial transaction atomically
      const newTx = await Transaction.create({
        userId: userObjId,
        title: `Bill Payment: ${bill.name}`,
        description: input.notes || `Payment for ${bill.name} (${bill.category})`,
        amountInCents,
        type: 'expense',
        category: bill.category || 'Utilities',
        merchant: bill.provider || bill.name,
        paymentMethod: input.paymentMethod || 'bank_transfer',
        transactionDate: input.paymentDate ? new Date(input.paymentDate) : new Date(),
        status: 'completed',
        account: 'Primary Account',
      });
      linkedTransactionId = newTx._id as mongoose.Types.ObjectId;
    }

    // 5. Create BillPayment record
    const payment = await BillPayment.create({
      userId: userObjId,
      billId: billObjId,
      amountInCents,
      paymentDate: input.paymentDate ? new Date(input.paymentDate) : new Date(),
      status: 'paid',
      paymentMethod: input.paymentMethod || 'bank_transfer',
      transactionId: linkedTransactionId,
      referenceNumber: input.referenceNumber?.trim(),
      notes: input.notes?.trim(),
    });

    // 6. Check if payment covers the bill cycle
    // Query all payments for this bill
    const allPayments = await BillPayment.find({ billId: billObjId, status: 'paid' });
    const currentPaidInCents = allPayments.reduce((acc, p) => acc + p.amountInCents, 0);

    if (currentPaidInCents >= bill.amountInCents) {
      if (bill.frequency === 'one_time') {
        bill.status = 'completed';
      } else if (bill.autoRenew && bill.nextDueDate) {
        // Advance schedule: current dueDate becomes nextDueDate, calculate subsequent nextDueDate
        bill.dueDate = bill.nextDueDate;
        bill.nextDueDate = calculateNextDueDate(bill.dueDate, bill.frequency) ?? undefined;
      }
      await bill.save();
    }

    const enrichedBill = await this.enrichBill(bill, allPayments);

    const paymentResponse: BillPaymentResponse = {
      id: payment._id.toString(),
      userId: payment.userId.toString(),
      billId: payment.billId.toString(),
      billName: bill.name,
      amountInCents: payment.amountInCents,
      amount: payment.amount,
      paymentDate: payment.paymentDate.toISOString(),
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId ? payment.transactionId.toString() : undefined,
      referenceNumber: payment.referenceNumber,
      notes: payment.notes,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };

    return {
      payment: paymentResponse,
      bill: enrichedBill,
    };
  }

  /**
   * Reverts a bill payment while preserving any linked financial ledger transactions.
   */
  public static async revertPayment(
    userId: string,
    billId: string,
    paymentId: string
  ): Promise<BillResponse> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const billObjId = new mongoose.Types.ObjectId(billId);
    const paymentObjId = new mongoose.Types.ObjectId(paymentId);

    const payment = await BillPayment.findOne({
      _id: paymentObjId,
      billId: billObjId,
      userId: userObjId,
    });

    if (!payment) {
      throw AppError.notFound('Payment record not found or does not belong to the user');
    }

    // Delete payment record (never delete financial transaction in Transaction collection)
    await BillPayment.deleteOne({ _id: paymentObjId });

    // Recalculate bill state
    const bill = await Bill.findOne({ _id: billObjId, userId: userObjId });
    if (!bill) {
      throw AppError.notFound('Bill not found');
    }

    if (bill.status === 'completed' && bill.frequency === 'one_time') {
      bill.status = 'active';
      await bill.save();
    }

    return await this.enrichBill(bill);
  }

  /**
   * Computes individual bill analytics and payment history.
   */
  public static async computeBillAnalytics(
    userId: string,
    billId: string
  ): Promise<BillAnalyticsData> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const billObjId = new mongoose.Types.ObjectId(billId);

    const bill = await Bill.findOne({ _id: billObjId, userId: userObjId });
    if (!bill) {
      throw AppError.notFound('Bill not found or does not belong to user');
    }

    const payments = await BillPayment.find({ billId: billObjId, status: 'paid' }).sort({
      paymentDate: -1,
    });

    const enriched = await this.enrichBill(bill, payments);

    // Compute monthly spending trend for this bill across the last 6 months
    const monthlyTrendMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyTrendMap[key] = 0;
    }

    let totalPaidInCents = 0;
    for (const p of payments) {
      totalPaidInCents += p.amountInCents;
      const d = new Date(p.paymentDate);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (monthlyTrendMap[key] !== undefined) {
        monthlyTrendMap[key] += p.amount;
      }
    }

    const monthlyTrend = Object.entries(monthlyTrendMap).map(([month, paid]) => ({
      month,
      paid: Math.round(paid * 100) / 100,
    }));

    const paymentHistoryResponses: BillPaymentResponse[] = payments.map((p) => ({
      id: p._id.toString(),
      userId: p.userId.toString(),
      billId: p.billId.toString(),
      billName: bill.name,
      amountInCents: p.amountInCents,
      amount: p.amount,
      paymentDate: p.paymentDate.toISOString(),
      status: p.status,
      paymentMethod: p.paymentMethod,
      transactionId: p.transactionId ? p.transactionId.toString() : undefined,
      referenceNumber: p.referenceNumber,
      notes: p.notes,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    // Annualized recurring estimate
    let recurringEstimateAnnual = 0;
    switch (bill.frequency) {
      case 'weekly':
        recurringEstimateAnnual = bill.amount * 52;
        break;
      case 'monthly':
        recurringEstimateAnnual = bill.amount * 12;
        break;
      case 'quarterly':
        recurringEstimateAnnual = bill.amount * 4;
        break;
      case 'yearly':
        recurringEstimateAnnual = bill.amount;
        break;
      default:
        recurringEstimateAnnual = bill.amount;
    }

    return {
      bill: enriched,
      paymentHistory: paymentHistoryResponses,
      totalPaidInCents,
      totalPaid: Bill.centsToAmount(totalPaidInCents),
      totalPendingInCents: enriched.remainingDueInCents,
      totalPending: enriched.remainingDue,
      paymentCount: payments.length,
      monthlyTrend,
      nextDueDate: bill.nextDueDate ? bill.nextDueDate.toISOString() : undefined,
      recurringEstimateAnnual: Math.round(recurringEstimateAnnual * 100) / 100,
    };
  }
}
