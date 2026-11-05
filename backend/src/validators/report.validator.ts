import { AppError } from '../utils/apiError.js';

export interface ValidatedDateRange {
  startDate: Date;
  endDate: Date;
}

export class ReportValidator {
  /**
   * Validate arbitrary start and end date query parameters
   */
  public static validateDateRange(query: any): ValidatedDateRange {
    const { startDate, endDate } = query;

    if (!startDate || !endDate) {
      throw AppError.badRequest('Both startDate and endDate query parameters are required');
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime())) {
      throw AppError.badRequest('Invalid startDate format. Use YYYY-MM-DD');
    }

    if (isNaN(end.getTime())) {
      throw AppError.badRequest('Invalid endDate format. Use YYYY-MM-DD');
    }

    if (start > end) {
      throw AppError.badRequest('startDate cannot be after endDate');
    }

    // Maximum 3-year query span to prevent excessive database stress
    const threeYearsMs = 3 * 365.25 * 24 * 60 * 60 * 1000;
    if (end.getTime() - start.getTime() > threeYearsMs) {
      throw AppError.badRequest('Date range cannot exceed 3 years');
    }

    // Ensure end date covers full end-of-day
    const fullEnd = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999));
    const fullStart = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0));

    return {
      startDate: fullStart,
      endDate: fullEnd,
    };
  }

  /**
   * Validate year and month query parameters
   */
  public static validateMonthlyParams(query: any): { year: number; month: number } {
    const now = new Date();
    const year = query.year ? parseInt(query.year as string, 10) : now.getFullYear();
    const month = query.month ? parseInt(query.month as string, 10) : now.getMonth() + 1;

    if (isNaN(year) || year < 2000 || year > 2100) {
      throw AppError.badRequest('Year must be an integer between 2000 and 2100');
    }

    if (isNaN(month) || month < 1 || month > 12) {
      throw AppError.badRequest('Month must be an integer between 1 and 12');
    }

    return { year, month };
  }

  /**
   * Validate year and quarter query parameters
   */
  public static validateQuarterlyParams(query: any): { year: number; quarter: number } {
    const now = new Date();
    const year = query.year ? parseInt(query.year as string, 10) : now.getFullYear();
    const quarter = query.quarter
      ? parseInt(query.quarter as string, 10)
      : Math.floor(now.getMonth() / 3) + 1;

    if (isNaN(year) || year < 2000 || year > 2100) {
      throw AppError.badRequest('Year must be an integer between 2000 and 2100');
    }

    if (isNaN(quarter) || quarter < 1 || quarter > 4) {
      throw AppError.badRequest('Quarter must be an integer between 1 and 4');
    }

    return { year, quarter };
  }

  /**
   * Validate annual query parameters
   */
  public static validateAnnualParams(query: any): { year: number } {
    const now = new Date();
    const year = query.year ? parseInt(query.year as string, 10) : now.getFullYear();

    if (isNaN(year) || year < 2000 || year > 2100) {
      throw AppError.badRequest('Year must be an integer between 2000 and 2100');
    }

    return { year };
  }
}

