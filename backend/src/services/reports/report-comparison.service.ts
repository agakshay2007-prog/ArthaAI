import { MetricComparisonItem } from '../../types/index.js';

export class ReportComparisonService {
  /**
   * Compare two metric numbers and calculate delta and percentage change
   */
  public static compareMetrics(current: number, previous: number): MetricComparisonItem {
    const delta = Math.round((current - previous) * 100) / 100;

    let percentageChange = 0;
    if (previous !== 0) {
      percentageChange = Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
    } else if (current !== 0) {
      percentageChange = current > 0 ? 100 : -100;
    }

    return {
      current,
      previous,
      delta,
      percentageChange,
    };
  }

  /**
   * Determine prior equivalent date range
   */
  public static getPreviousPeriodRange(
    type: 'monthly' | 'quarterly' | 'annual' | 'custom',
    startDate: Date,
    endDate: Date
  ): { prevStartDate: Date; prevEndDate: Date; label: string } {
    if (type === 'monthly') {
      const year = startDate.getFullYear();
      const month = startDate.getMonth(); // 0-indexed

      const prevYear = month === 0 ? year - 1 : year;
      const prevMonth = month === 0 ? 11 : month - 1;

      const prevStart = new Date(Date.UTC(prevYear, prevMonth, 1, 0, 0, 0, 0));
      const prevEnd = new Date(Date.UTC(prevYear, prevMonth + 1, 0, 23, 59, 59, 999));

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return {
        prevStartDate: prevStart,
        prevEndDate: prevEnd,
        label: `${monthNames[prevMonth]} ${prevYear}`,
      };
    }

    if (type === 'quarterly') {
      const year = startDate.getFullYear();
      const currentMonth = startDate.getMonth();
      const currentQuarter = Math.floor(currentMonth / 3) + 1;

      const prevQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
      const prevYear = currentQuarter === 1 ? year - 1 : year;

      const prevStartMonth = (prevQuarter - 1) * 3;
      const prevStart = new Date(Date.UTC(prevYear, prevStartMonth, 1, 0, 0, 0, 0));
      const prevEnd = new Date(Date.UTC(prevYear, prevStartMonth + 3, 0, 23, 59, 59, 999));

      return {
        prevStartDate: prevStart,
        prevEndDate: prevEnd,
        label: `Q${prevQuarter} ${prevYear}`,
      };
    }

    if (type === 'annual') {
      const year = startDate.getFullYear();
      const prevYear = year - 1;

      const prevStart = new Date(Date.UTC(prevYear, 0, 1, 0, 0, 0, 0));
      const prevEnd = new Date(Date.UTC(prevYear, 11, 31, 23, 59, 59, 999));

      return {
        prevStartDate: prevStart,
        prevEndDate: prevEnd,
        label: `${prevYear}`,
      };
    }

    // Custom date range: shift backwards by exact duration
    const durationMs = endDate.getTime() - startDate.getTime();
    const prevEnd = new Date(startDate.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - durationMs);

    return {
      prevStartDate: prevStart,
      prevEndDate: prevEnd,
      label: 'Previous Period',
    };
  }
}

