import {
  ComprehensiveFinancialReport,
  ReportSummaryMetrics,
  AIReportInsightsResponse,
  ReportPeriodType,
} from '../types/reports';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

export interface ReportQueryParams {
  type?: ReportPeriodType | string;
  year?: number;
  month?: number;
  quarter?: number;
  startDate?: string;
  endDate?: string;
  question?: string;
  [key: string]: any;
}

class ReportApiClient {
  private toQueryString(params: string | Record<string, any>): string {
    if (typeof params === 'string') return params;
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    }
    return searchParams.toString();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // Includes HttpOnly session cookies
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data.data as T;
    } catch (err: any) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('Network error. Unable to connect to ArthaAI backend service.');
      }
      throw err;
    }
  }

  /**
   * Quick overview metrics for current month
   */
  public async getOverview(): Promise<ReportSummaryMetrics> {
    return this.request<ReportSummaryMetrics>('/api/reports/overview');
  }

  /**
   * Monthly report
   */
  public async getMonthlyReport(year: number, month: number): Promise<ComprehensiveFinancialReport> {
    return this.request<ComprehensiveFinancialReport>(
      `/api/reports/monthly?year=${year}&month=${month}`
    );
  }

  /**
   * Quarterly report
   */
  public async getQuarterlyReport(
    year: number,
    quarter: number
  ): Promise<ComprehensiveFinancialReport> {
    return this.request<ComprehensiveFinancialReport>(
      `/api/reports/quarterly?year=${year}&quarter=${quarter}`
    );
  }

  /**
   * Annual report
   */
  public async getAnnualReport(year: number): Promise<ComprehensiveFinancialReport> {
    return this.request<ComprehensiveFinancialReport>(`/api/reports/annual?year=${year}`);
  }

  /**
   * Custom date range report
   */
  public async getCustomReport(
    startDate: string,
    endDate: string
  ): Promise<ComprehensiveFinancialReport> {
    return this.request<ComprehensiveFinancialReport>(
      `/api/reports/custom?startDate=${startDate}&endDate=${endDate}`
    );
  }

  /**
   * Flexible unified report getter
   */
  public async getReport(params: ReportQueryParams): Promise<ComprehensiveFinancialReport> {
    if (params.type === 'monthly' && params.year && params.month) {
      return this.getMonthlyReport(params.year, params.month);
    }
    if (params.type === 'quarterly' && params.year && params.quarter) {
      return this.getQuarterlyReport(params.year, params.quarter);
    }
    if (params.type === 'annual' && params.year) {
      return this.getAnnualReport(params.year);
    }
    if (params.startDate && params.endDate) {
      return this.getCustomReport(params.startDate, params.endDate);
    }
    const query = this.toQueryString(params);
    return this.request<ComprehensiveFinancialReport>(`/api/reports/custom?${query}`);
  }

  /**
   * Generate AI explanation for selected report
   */
  public async getAIInsights(
    params: ReportQueryParams
  ): Promise<AIReportInsightsResponse> {
    return this.request<AIReportInsightsResponse>('/api/reports/ai-insights', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Helper to trigger browser download from binary endpoints
   */
  private async triggerDownload(endpoint: string, defaultFilename: string): Promise<void> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = 'Failed to download report.';
      try {
        const parsed = JSON.parse(errorText);
        errorMsg = parsed.message || errorMsg;
      } catch {
        // Fallback
      }
      throw new Error(errorMsg);
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = defaultFilename;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  /**
   * Download PDF Statement
   */
  public async downloadPdf(params: string | ReportQueryParams): Promise<void> {
    const qs = this.toQueryString(params);
    await this.triggerDownload(`/api/reports/export/pdf?${qs}`, 'ArthaAI-Report.pdf');
  }

  /**
   * Download Excel Workbook
   */
  public async downloadExcel(params: string | ReportQueryParams): Promise<void> {
    const qs = this.toQueryString(params);
    await this.triggerDownload(`/api/reports/export/excel?${qs}`, 'ArthaAI-Report.xlsx');
  }

  /**
   * Download CSV file
   */
  public async downloadCsv(params: string | ReportQueryParams): Promise<void> {
    const qs = this.toQueryString(params);
    await this.triggerDownload(`/api/reports/export/csv?${qs}`, 'ArthaAI-Report.csv');
  }
}

export const reportService = new ReportApiClient();
