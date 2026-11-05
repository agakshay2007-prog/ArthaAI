import { Response } from 'express';
import { ReportService } from '../services/reports/report.service.js';
import { ReportExportService } from '../services/reports/report-export.service.js';
import { ReportValidator } from '../validators/report.validator.js';
import { isDatabaseReady } from '../config/database.js';
import { AppError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ComprehensiveFinancialReport } from '../types/index.js';

export class ReportController {
  /**
   * Helper: parse report request from query params (type, year, month, quarter, dates)
   */
  private static async resolveReport(
    userId: string,
    query: any
  ): Promise<ComprehensiveFinancialReport> {
    const type = (query.type as string) || 'monthly';

    if (type === 'monthly') {
      const { year, month } = ReportValidator.validateMonthlyParams(query);
      return ReportService.generateMonthlyReport(userId, year, month);
    }

    if (type === 'quarterly') {
      const { year, quarter } = ReportValidator.validateQuarterlyParams(query);
      return ReportService.generateQuarterlyReport(userId, year, quarter);
    }

    if (type === 'annual') {
      const { year } = ReportValidator.validateAnnualParams(query);
      return ReportService.generateAnnualReport(userId, year);
    }

    // Default to custom date range
    const { startDate, endDate } = ReportValidator.validateDateRange(query);
    return ReportService.generateCustomReport(userId, startDate, endDate);
  }

  /**
   * GET /api/reports/overview - Quick current-month KPI overview
   */
  public static async getOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live report operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const overview = await ReportService.getReportOverview(userId);
    ApiResponse.success(res, 'Report overview retrieved successfully', overview);
  }

  /**
   * GET /api/reports/monthly - Monthly financial report
   */
  public static async getMonthlyReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live report operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const { year, month } = ReportValidator.validateMonthlyParams(req.query);
    const report = await ReportService.generateMonthlyReport(userId, year, month);

    ApiResponse.success(res, 'Monthly report generated successfully', report);
  }

  /**
   * GET /api/reports/quarterly - Quarterly financial report
   */
  public static async getQuarterlyReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live report operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const { year, quarter } = ReportValidator.validateQuarterlyParams(req.query);
    const report = await ReportService.generateQuarterlyReport(userId, year, quarter);

    ApiResponse.success(res, 'Quarterly report generated successfully', report);
  }

  /**
   * GET /api/reports/annual - Annual financial report
   */
  public static async getAnnualReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live report operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const { year } = ReportValidator.validateAnnualParams(req.query);
    const report = await ReportService.generateAnnualReport(userId, year);

    ApiResponse.success(res, 'Annual report generated successfully', report);
  }

  /**
   * GET /api/reports/custom - Custom date range report
   */
  public static async getCustomReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live report operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const { startDate, endDate } = ReportValidator.validateDateRange(req.query);
    const report = await ReportService.generateCustomReport(userId, startDate, endDate);

    ApiResponse.success(res, 'Custom date range report generated successfully', report);
  }

  /**
   * GET /api/reports/categories - Category breakdown analysis
   */
  public static async getCategoryAnalysis(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live report operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const report = await ReportController.resolveReport(userId, req.query);
    ApiResponse.success(res, 'Category analysis retrieved successfully', {
      categories: report.categories,
      highestSpendingCategory: report.summary.highestSpendingCategory,
      lowestSpendingCategory: report.summary.lowestSpendingCategory,
      totalExpenses: report.summary.totalExpenses,
    });
  }

  /**
   * GET /api/reports/cash-flow - Cash flow trajectory points
   */
  public static async getCashFlowAnalysis(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live report operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const report = await ReportController.resolveReport(userId, req.query);
    ApiResponse.success(res, 'Cash flow analysis retrieved successfully', {
      trend: report.cashFlowTrend,
      summary: {
        totalIncome: report.summary.totalIncome,
        totalExpenses: report.summary.totalExpenses,
        netCashFlow: report.summary.netCashFlow,
        savingsRatePercentage: report.summary.savingsRatePercentage,
      },
    });
  }

  /**
   * GET /api/reports/budgets - Budget performance analysis
   */
  public static async getBudgetPerformance(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live report operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const report = await ReportController.resolveReport(userId, req.query);
    ApiResponse.success(res, 'Budget performance retrieved successfully', {
      budgets: report.budgetPerformance,
      summary: report.summary.budgetUtilization,
    });
  }

  /**
   * GET /api/reports/savings - Savings goals performance
   */
  public static async getSavingsPerformance(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live report operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const report = await ReportController.resolveReport(userId, req.query);
    ApiResponse.success(res, 'Savings performance retrieved successfully', {
      goals: report.savingsPerformance,
      summary: report.summary.savingsProgress,
    });
  }

  /**
   * GET /api/reports/bills - Bills analysis
   */
  public static async getBillsAnalysis(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live report operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const report = await ReportController.resolveReport(userId, req.query);
    ApiResponse.success(res, 'Bills analysis retrieved successfully', {
      bills: report.billsAnalysis,
      summary: report.summary.billsSummary,
    });
  }

  /**
   * POST /api/reports/ai-insights - AI-powered report explanation
   */
  public static async getAIReportInsights(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live AI operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const report = await ReportController.resolveReport(userId, req.body);
    const question = req.body?.question as string | undefined;

    const insights = await ReportService.generateAIReportInsights(report, question);

    ApiResponse.success(res, 'AI report explanation generated successfully', {
      insights,
      reportLabel: report.period.label,
      generatedAt: new Date().toISOString(),
    });
  }

  /**
   * GET /api/reports/export/pdf - Export PDF financial statement
   */
  public static async exportPdf(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live report operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const report = await ReportController.resolveReport(userId, req.query);
    const pdfBuffer = await ReportExportService.generatePdf(report);

    const filename = `ArthaAI-Report-${report.period.startDate}-${report.period.endDate}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  }

  /**
   * GET /api/reports/export/excel - Export multi-sheet Excel workbook
   */
  public static async exportExcel(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live report operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const report = await ReportController.resolveReport(userId, req.query);
    const excelBuffer = await ReportExportService.generateExcel(report);

    const filename = `ArthaAI-Report-${report.period.startDate}-${report.period.endDate}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);
  }

  /**
   * GET /api/reports/export/csv - Export CSV financial data
   */
  public static async exportCsv(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live report operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const report = await ReportController.resolveReport(userId, req.query);
    const csvContent = ReportExportService.generateCsv(report);

    const filename = `ArthaAI-Report-${report.period.startDate}-${report.period.endDate}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(csvContent);
  }
}

