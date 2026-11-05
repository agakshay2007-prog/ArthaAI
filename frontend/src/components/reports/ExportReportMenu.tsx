import React, { useState } from 'react';
import { FileText, FileSpreadsheet, Table, Loader2, Check } from 'lucide-react';
import { reportService } from '../../services/reports';
import { ReportPeriodType } from '../../types/reports';

interface ExportReportMenuProps {
  periodType: ReportPeriodType;
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
  quarter?: number;
}

export const ExportReportMenu: React.FC<ExportReportMenuProps> = ({
  periodType,
  startDate,
  endDate,
  year,
  month,
  quarter,
}) => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setDownloadingFormat(format);
    setErrorMessage(null);
    setDownloadSuccess(null);

    const params = {
      type: periodType,
      startDate,
      endDate,
      year,
      month,
      quarter,
    };

    try {
      if (format === 'pdf') {
        await reportService.downloadPdf(params);
      } else if (format === 'excel') {
        await reportService.downloadExcel(params);
      } else if (format === 'csv') {
        await reportService.downloadCsv(params);
      }

      setDownloadSuccess(format.toUpperCase());
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed. Please try again.';
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* PDF Export Button */}
        <button
          onClick={() => handleExport('pdf')}
          disabled={downloadingFormat !== null}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700/80 hover:border-violet-500/50 transition shadow-sm disabled:opacity-50"
          title="Export statement as PDF"
        >
          {downloadingFormat === 'pdf' ? (
            <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
          ) : downloadSuccess === 'PDF' ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span>PDF</span>
        </button>

        {/* Excel Export Button */}
        <button
          onClick={() => handleExport('excel')}
          disabled={downloadingFormat !== null}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700/80 hover:border-violet-500/50 transition shadow-sm disabled:opacity-50"
          title="Export multi-sheet workbook as Excel (.xlsx)"
        >
          {downloadingFormat === 'excel' ? (
            <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
          ) : downloadSuccess === 'EXCEL' ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>Excel</span>
        </button>

        {/* CSV Export Button */}
        <button
          onClick={() => handleExport('csv')}
          disabled={downloadingFormat !== null}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700/80 hover:border-violet-500/50 transition shadow-sm disabled:opacity-50"
          title="Export transactions & summaries as CSV"
        >
          {downloadingFormat === 'csv' ? (
            <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
          ) : downloadSuccess === 'CSV' ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Table className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span>CSV</span>
        </button>
      </div>

      {errorMessage && (
        <div className="absolute top-full mt-2 right-0 z-50 bg-rose-950/90 border border-rose-500/30 text-rose-300 text-[11px] px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
