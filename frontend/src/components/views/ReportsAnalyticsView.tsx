import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { reportService } from '../../services/reports';
import {
  ComprehensiveFinancialReport,
  ReportFilterPreset,
  ReportPeriodType,
} from '../../types/reports';
import { getDemoFinancialReport } from '../../data/mockReportsData';
import { DateRangeSelector } from '../reports/DateRangeSelector';
import { ReportOverviewCards } from '../reports/ReportOverviewCards';
import { PeriodComparison } from '../reports/PeriodComparison';
import { CashFlowChart } from '../reports/CashFlowChart';
import { CategoryBreakdownChart } from '../reports/CategoryBreakdownChart';
import { BudgetPerformanceChart } from '../reports/BudgetPerformanceChart';
import { SavingsPerformanceChart } from '../reports/SavingsPerformanceChart';
import { BillsObligationsCard } from '../reports/BillsObligationsCard';
import { AIReportInsights } from '../reports/AIReportInsights';
import { ExportReportMenu } from '../reports/ExportReportMenu';

interface ReportsAnalyticsViewProps {
  isGuestDemo?: boolean;
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({ isGuestDemo = false }) => {
  const [preset, setPreset] = useState<ReportFilterPreset>('this_month');
  const [periodType, setPeriodType] = useState<ReportPeriodType>('monthly');
  const [startDate, setStartDate] = useState<string>('2026-03-01');
  const [endDate, setEndDate] = useState<string>('2026-03-31');
  const [year, setYear] = useState<number | undefined>(new Date().getFullYear());
  const [month, setMonth] = useState<number | undefined>(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState<number | undefined>();

  const [report, setReport] = useState<ComprehensiveFinancialReport>(() =>
    getDemoFinancialReport('this_month')
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setErrorNotice(null);

    if (isGuestDemo) {
      setReport(getDemoFinancialReport(preset));
      setIsLoading(false);
      return;
    }

    try {
      const data = await reportService.getReport({
        type: periodType,
        startDate,
        endDate,
        year,
        month,
        quarter,
      });
      setReport(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch financial report.';
      setErrorNotice(msg);
      // Fallback to demo report for uninterrupted user experience
      setReport(getDemoFinancialReport(preset));
    } finally {
      setIsLoading(false);
    }
  }, [isGuestDemo, preset, periodType, startDate, endDate, year, month, quarter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleDateRangeChange = (newPreset: ReportFilterPreset, start: string, end: string) => {
    setPreset(newPreset);
    setStartDate(start);
    setEndDate(end);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;

    if (newPreset === 'this_year') {
      setPeriodType('annual');
      setYear(currentYear);
      setMonth(undefined);
      setQuarter(undefined);
    } else if (newPreset === 'last_year') {
      setPeriodType('annual');
      setYear(currentYear - 1);
      setMonth(undefined);
      setQuarter(undefined);
    } else if (newPreset === 'this_quarter') {
      setPeriodType('quarterly');
      setYear(currentYear);
      setQuarter(currentQuarter);
      setMonth(undefined);
    } else if (newPreset === 'last_quarter') {
      const prevQ = currentQuarter === 1 ? 4 : currentQuarter - 1;
      const qYear = currentQuarter === 1 ? currentYear - 1 : currentYear;
      setPeriodType('quarterly');
      setYear(qYear);
      setQuarter(prevQ);
      setMonth(undefined);
    } else if (newPreset === 'last_month') {
      const prevM = currentMonth === 1 ? 12 : currentMonth - 1;
      const mYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      setPeriodType('monthly');
      setYear(mYear);
      setMonth(prevM);
      setQuarter(undefined);
    } else if (newPreset === 'custom') {
      setPeriodType('custom');
      setYear(undefined);
      setMonth(undefined);
      setQuarter(undefined);
    } else {
      setPeriodType('monthly');
      setYear(currentYear);
      setMonth(currentMonth);
      setQuarter(undefined);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 text-violet-400 border border-violet-500/30 shadow-inner">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Reports & Financial Analytics
              </h2>
              {isGuestDemo && (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Demo Sandbox
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Deterministic period accounting, variance analysis & multi-format exports
            </p>
          </div>
        </div>

        {/* Action Controls: Date Picker & Exports */}
        <div className="flex flex-wrap items-center gap-3">
          <DateRangeSelector
            currentPreset={preset}
            startDate={startDate}
            endDate={endDate}
            onApplyFilter={handleDateRangeChange}
            isLoading={isLoading}
          />

          <ExportReportMenu
            periodType={periodType}
            startDate={startDate}
            endDate={endDate}
            year={year}
            month={month}
            quarter={quarter}
          />

          <button
            onClick={fetchReport}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-violet-500/50 transition disabled:opacity-50"
            title="Refresh current report"
            aria-label="Refresh report"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-violet-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Degradation / Offline Error Alert */}
      {errorNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Notice:</strong> {errorNotice} Displaying simulated demonstration metrics.
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-400/80 uppercase">Offline Resilient</span>
        </div>
      )}

      {/* Mandatory Net Worth Disclaimer Banner */}
      <div className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
        <span>
          <strong>Accounting Disclosure:</strong>{' '}
          {report.summary.netWorthNote ||
            'Net worth unavailable — additional asset and liability information is required.'}
        </span>
      </div>

      {/* 1. Summary KPI Metric Cards */}
      <ReportOverviewCards
        summary={report.summary}
        comparison={report.comparison}
        isLoading={isLoading}
      />

      {/* 2. Period-over-Period Variance */}
      <PeriodComparison
        comparison={report.comparison}
        currentPeriodLabel={report.period.label}
      />

      {/* 3. Cash Flow Trend & Category Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart
          data={report.cashFlowTrend}
          isLoading={isLoading}
        />
        <CategoryBreakdownChart categories={report.categories} />
      </div>

      {/* 4. Budget Variance & Savings Trajectory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetPerformanceChart budgets={report.budgetPerformance} />
        <SavingsPerformanceChart savings={report.savingsPerformance} />
      </div>

      {/* 5. Recurring Bills & Payment Obligations */}
      <BillsObligationsCard bills={report.billsAnalysis} />

      {/* 6. Gemini AI Report Synthesis */}
      <AIReportInsights
        initialInsights={report.aiAnalysis}
        periodType={periodType}
        startDate={startDate}
        endDate={endDate}
        year={year}
        month={month}
        quarter={quarter}
        isGuestDemo={isGuestDemo}
      />
    </div>
  );
};
