import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { ReportFilterPreset } from '../../types/reports';

interface DateRangeSelectorProps {
  currentPreset: ReportFilterPreset;
  startDate: string;
  endDate: string;
  onApplyFilter: (preset: ReportFilterPreset, startDate: string, endDate: string) => void;
  isLoading?: boolean;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  currentPreset,
  startDate,
  endDate,
  onApplyFilter,
  isLoading = false,
}) => {
  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);
  const [showCustomInputs, setShowCustomInputs] = useState(currentPreset === 'custom');

  const presets: { id: ReportFilterPreset; label: string }[] = [
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_quarter', label: 'This Quarter' },
    { id: 'last_quarter', label: 'Last Quarter' },
    { id: 'this_year', label: 'This Year' },
    { id: 'last_year', label: 'Last Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const handlePresetSelect = (preset: ReportFilterPreset) => {
    if (preset === 'custom') {
      setShowCustomInputs(true);
      return;
    }

    setShowCustomInputs(false);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed

    let start = '';
    let end = '';

    if (preset === 'this_month') {
      start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      end = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    } else if (preset === 'last_month') {
      const pYear = month === 0 ? year - 1 : year;
      const pMonth = month === 0 ? 12 : month;
      start = `${pYear}-${String(pMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(pYear, pMonth, 0).getDate();
      end = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    } else if (preset === 'this_quarter') {
      const q = Math.floor(month / 3);
      const qStartMonth = q * 3 + 1;
      const qEndMonth = qStartMonth + 2;
      start = `${year}-${String(qStartMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(year, qEndMonth, 0).getDate();
      end = `${year}-${String(qEndMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    } else if (preset === 'last_quarter') {
      const currentQ = Math.floor(month / 3);
      const prevQ = currentQ === 0 ? 3 : currentQ - 1;
      const pYear = currentQ === 0 ? year - 1 : year;
      const qStartMonth = prevQ * 3 + 1;
      const qEndMonth = qStartMonth + 2;
      start = `${pYear}-${String(qStartMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(pYear, qEndMonth, 0).getDate();
      end = `${pYear}-${String(qEndMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    } else if (preset === 'this_year') {
      start = `${year}-01-01`;
      end = `${year}-12-31`;
    } else if (preset === 'last_year') {
      start = `${year - 1}-01-01`;
      end = `${year - 1}-12-31`;
    }

    onApplyFilter(preset, start, end);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    onApplyFilter('custom', customStart, customEnd);
  };

  return (
    <div className="glass-card rounded-2xl p-3 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Presets Horizontal Pills */}
      <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mr-1 shrink-0">
          <Calendar className="w-4 h-4 text-brand-400" />
          <span>Period:</span>
        </div>

        {presets.map((p) => {
          const isActive = currentPreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handlePresetSelect(p.id)}
              disabled={isLoading}
              className={`text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium ${
                isActive
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-glow-violet'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Inputs Modal / Inline Bar */}
      {showCustomInputs && (
        <form
          onSubmit={handleCustomSubmit}
          className="flex items-center gap-2 text-xs w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80"
        >
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-brand-500"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={isLoading || !customStart || !customEnd}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition cursor-pointer font-medium disabled:opacity-50"
          >
            Apply
          </button>
        </form>
      )}
    </div>
  );
};

