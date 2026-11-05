import { Response } from 'express';
import mongoose from 'mongoose';
import { Bill, calculateNextDueDate } from '../models/bill.model.js';
import { BillPayment } from '../models/bill-payment.model.js';
import { BillService } from '../services/bill.service.js';
import { isDatabaseReady } from '../config/database.js';
import { AppError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { BillFrequency, BillStatus } from '../types/index.js';

export class BillController {
  /**
   * POST /api/bills - Create a new bill with integer minor units
   */
  public static async createBill(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable('Database service is currently unconfigured. Live bill operations require MongoDB connection.');
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const {
      name,
      description,
      category,
      provider,
      amount,
      currency = 'USD',
      frequency = 'monthly',
      startDate,
      dueDate,
      reminderDays = [7, 3, 1],
      autoRenew = true,
    } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw AppError.badRequest('Bill name is required');
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      throw AppError.badRequest('Bill category is required');
    }

    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (typeof parsedAmount !== 'number' || isNaN(parsedAmount) || parsedAmount <= 0) {
      throw AppError.badRequest('Amount must be a positive number');
    }

    if (!dueDate) {
      throw AppError.badRequest('Due date is required');
    }

    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) {
      throw AppError.badRequest('Invalid due date format');
    }

    const validFrequencies: BillFrequency[] = ['one_time', 'weekly', 'monthly', 'quarterly', 'yearly'];
    if (!validFrequencies.includes(frequency)) {
      throw AppError.badRequest(`Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`);
    }

    const parsedStartDate = startDate ? new Date(startDate) : new Date();
    if (isNaN(parsedStartDate.getTime())) {
      throw AppError.badRequest('Invalid start date format');
    }

    const amountInCents = Bill.amountToCents(parsedAmount);
    const nextDueDate = calculateNextDueDate(parsedDueDate, frequency) ?? undefined;

    const newBill = await Bill.create({
      userId: new mongoose.Types.ObjectId(userId),
      name: name.trim(),
      description: description?.trim(),
      category: category.trim(),
      provider: provider?.trim(),
      amountInCents,
      currency: currency.toUpperCase(),
      frequency,
      startDate: parsedStartDate,
      dueDate: parsedDueDate,
      nextDueDate,
      autoRenew: Boolean(autoRenew),
      reminderDays: Array.isArray(reminderDays) ? reminderDays : [7, 3, 1],
      status: 'active',
    });

    const enriched = await BillService.enrichBill(newBill);
    ApiResponse.created(res, 'Bill created successfully', enriched);
  }

  /**
   * GET /api/bills - Retrieve paginated user-owned bills with filters
   */
  public static async getBills(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable('Database service is currently unconfigured. Live bill operations require MongoDB connection.');
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const {
      status,
      category,
      frequency,
      search,
      page = '1',
      limit = '20',
      sortBy = 'dueDate',
      sortOrder = 'asc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query: Record<string, unknown> = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (frequency && frequency !== 'all') {
      query.frequency = frequency;
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { provider: { $regex: escaped, $options: 'i' } },
        { category: { $regex: escaped, $options: 'i' } },
      ];
    }

    const sortOptions: Record<string, 1 | -1> = {};
    const sortField = typeof sortBy === 'string' ? sortBy : 'dueDate';
    sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;

    const [bills, total] = await Promise.all([
      Bill.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Bill.countDocuments(query),
    ]);

    const enrichedBills = await Promise.all(bills.map((b) => BillService.enrichBill(b)));

    ApiResponse.success(res, 'Bills retrieved successfully', {
      bills: enrichedBills,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }

  /**
   * GET /api/bills/overview - High-level bills summary and active alerts
   */
  public static async getBillOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable('Database service is currently unconfigured. Live bill operations require MongoDB connection.');
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const overview = await BillService.computeOverview(userId);
    ApiResponse.success(res, 'Bills overview retrieved successfully', overview);
  }

  /**
   * GET /api/bills/upcoming - Chronological upcoming bills
   */
  public static async getUpcomingBills(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable('Database service is currently unconfigured. Live bill operations require MongoDB connection.');
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const days = parseInt(req.query.days as string, 10) || 30;
    const now = new Date();
    const maxDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const bills = await Bill.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'active',
      dueDate: { $lte: maxDate },
    }).sort({ dueDate: 1 });

    const enriched = await Promise.all(bills.map((b) => BillService.enrichBill(b)));
    ApiResponse.success(res, 'Upcoming bills retrieved successfully', enriched);
  }

  /**
   * GET /api/bills/:id - Retrieve individual bill
   */
  public static async getBillById(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable('Database service is currently unconfigured. Live bill operations require MongoDB connection.');
    }

    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid bill ID format');
    }

    const bill = await Bill.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!bill) {
      throw AppError.notFound('Bill not found or does not belong to the user');
    }

    const enriched = await BillService.enrichBill(bill);
    ApiResponse.success(res, 'Bill retrieved successfully', enriched);
  }

  /**
   * PATCH /api/bills/:id - Update bill properties safely
   */
  public static async updateBill(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable('Database service is currently unconfigured. Live bill operations require MongoDB connection.');
    }

    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid bill ID format');
    }

    const bill = await Bill.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!bill) {
      throw AppError.notFound('Bill not found or does not belong to the user');
    }

    const {
      name,
      description,
      category,
      provider,
      amount,
      frequency,
      dueDate,
      reminderDays,
      autoRenew,
      status,
    } = req.body;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        throw AppError.badRequest('Bill name cannot be empty');
      }
      bill.name = name.trim();
    }

    if (description !== undefined) {
      bill.description = typeof description === 'string' ? description.trim() : '';
    }

    if (category !== undefined) {
      bill.category = typeof category === 'string' ? category.trim() : 'Other';
    }

    if (provider !== undefined) {
      bill.provider = typeof provider === 'string' ? provider.trim() : '';
    }

    if (amount !== undefined) {
      const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (typeof parsedAmount !== 'number' || isNaN(parsedAmount) || parsedAmount <= 0) {
        throw AppError.badRequest('Amount must be a positive number');
      }
      bill.amountInCents = Bill.amountToCents(parsedAmount);
    }

    if (frequency !== undefined) {
      const validFrequencies: BillFrequency[] = ['one_time', 'weekly', 'monthly', 'quarterly', 'yearly'];
      if (!validFrequencies.includes(frequency)) {
        throw AppError.badRequest(`Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`);
      }
      bill.frequency = frequency;
    }

    if (dueDate !== undefined) {
      const parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        throw AppError.badRequest('Invalid due date format');
      }
      bill.dueDate = parsedDueDate;
    }

    if (reminderDays !== undefined) {
      if (Array.isArray(reminderDays)) {
        bill.reminderDays = reminderDays;
      }
    }

    if (autoRenew !== undefined) {
      bill.autoRenew = Boolean(autoRenew);
    }

    if (status !== undefined) {
      const validStatuses: BillStatus[] = ['active', 'paused', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        throw AppError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      bill.status = status;
    }

    // Recalculate nextDueDate
    if (bill.frequency === 'one_time') {
      bill.nextDueDate = undefined;
    } else {
      bill.nextDueDate = calculateNextDueDate(bill.dueDate, bill.frequency) ?? undefined;
    }

    await bill.save();
    const enriched = await BillService.enrichBill(bill);
    ApiResponse.success(res, 'Bill updated successfully', enriched);
  }

  /**
   * DELETE /api/bills/:id - Safely archive or delete bill while preserving payments and transactions
   */
  public static async deleteBill(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable('Database service is currently unconfigured. Live bill operations require MongoDB connection.');
    }

    const userId = req.user?.id;
    const id = req.params.id as string;
    const { archive = 'false' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid bill ID format');
    }

    const bill = await Bill.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!bill) {
      throw AppError.notFound('Bill not found or does not belong to the user');
    }

    if (archive === 'true') {
      bill.status = 'cancelled';
      await bill.save();
      ApiResponse.success(res, 'Bill archived successfully', { id: bill._id.toString(), status: 'cancelled' });
      return;
    }

    // Hard delete bill document (Bill payments and Transaction records are strictly preserved)
    await Bill.deleteOne({ _id: bill._id });

    ApiResponse.success(res, 'Bill deleted successfully (payment ledger and transactions preserved)', {
      id: bill._id.toString(),
    });
  }

  /**
   * POST /api/bills/:id/payments - Record a payment against a bill
   */
  public static async recordPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable('Database service is currently unconfigured. Live bill operations require MongoDB connection.');
    }

    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid bill ID format');
    }

    const {
      amount,
      paymentDate,
      paymentMethod = 'bank_transfer',
      referenceNumber,
      notes,
      transactionId,
      createTransaction = false,
    } = req.body;

    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (typeof parsedAmount !== 'number' || isNaN(parsedAmount) || parsedAmount <= 0) {
      throw AppError.badRequest('Payment amount must be a positive number');
    }

    const result = await BillService.recordPayment(userId!, id, {
      amount: parsedAmount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      notes,
      transactionId,
      createTransaction: Boolean(createTransaction),
    });

    ApiResponse.created(res, 'Payment recorded successfully', result);
  }

  /**
   * GET /api/bills/:id/payments - Get paginated payments for a bill
   */
  public static async getBillPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable('Database service is currently unconfigured. Live bill operations require MongoDB connection.');
    }

    const userId = req.user?.id;
    const id = req.params.id as string;
    const { page = '1', limit = '20' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid bill ID format');
    }

    const bill = await Bill.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!bill) {
      throw AppError.notFound('Bill not found or does not belong to the user');
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      BillPayment.find({ billId: bill._id }).sort({ paymentDate: -1 }).skip(skip).limit(limitNum),
      BillPayment.countDocuments({ billId: bill._id }),
    ]);

    const paymentResponses = payments.map((p) => ({
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

    ApiResponse.success(res, 'Bill payments retrieved successfully', {
      payments: paymentResponses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }

  /**
   * DELETE /api/bills/:id/payments/:paymentId - Revert a payment
   */
  public static async revertPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable('Database service is currently unconfigured. Live bill operations require MongoDB connection.');
    }

    const userId = req.user?.id;
    const id = req.params.id as string;
    const paymentId = req.params.paymentId as string;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(paymentId)) {
      throw AppError.badRequest('Invalid bill ID or payment ID format');
    }

    const updatedBill = await BillService.revertPayment(userId!, id, paymentId);
    ApiResponse.success(res, 'Payment reverted successfully', updatedBill);
  }

  /**
   * GET /api/bills/:id/analytics - Get spending trend and analytics for a bill
   */
  public static async getBillAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable('Database service is currently unconfigured. Live bill operations require MongoDB connection.');
    }

    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid bill ID format');
    }

    const analytics = await BillService.computeBillAnalytics(userId!, id);
    ApiResponse.success(res, 'Bill analytics retrieved successfully', analytics);
  }
}
