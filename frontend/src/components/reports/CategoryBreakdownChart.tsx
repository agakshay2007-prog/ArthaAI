import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Tag, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CategoryReportItem } from '../../types/reports';

interface CategoryBreakdownChartProps {
  categories: CategoryReportItem[];
}

const CATEGORY_COLORS = [
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#a855f7', // Purple
  '#64748b', // Slate
];

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Tag className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Spending by Category
          </h3>
        </div>
        <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
          <p>No expense transaction data recorded for this period.</p>
        </div>
      </div>
    );
  }

  const chartData = categories.map((cat, idx) => ({
    name: cat.category,
    value: cat.amount,
    percentage: cat.percentage,
    color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  }));

  const totalExpense = categories.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Spending by Category
              </h3>
              <p className="text-xs text-slate-400">
                Outflow allocation across {categories.length} categories
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            Total: ${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Donut Chart */}
        <div className="h-56 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass-card p-3 rounded-xl border border-slate-700 bg-slate-950/90 text-xs shadow-xl">
                        <div className="flex items-center space-x-2 mb-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: data.color }}
                          />
                          <span className="font-bold text-white">{data.name}</span>
                        </div>
                        <p className="text-slate-300 font-mono">
                          ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          <span className="text-violet-400 ml-1.5 font-sans font-semibold">
                            ({data.percentage}%)
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Top Share
            </span>
            <span className="text-sm font-bold text-white font-mono">
              {categories[0]?.percentage || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-4 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
        {categories.map((cat, idx) => {
          const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
          const hasChange = cat.changePercentage !== undefined;
          const isUp = (cat.changePercentage || 0) > 0;
          const isDown = (cat.changePercentage || 0) < 0;

          return (
            <div
              key={cat.category}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 hover:bg-slate-800/40 border border-slate-800/60 transition text-xs"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium text-slate-200 truncate">{cat.category}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  ({cat.transactionCount} tx)
                </span>
              </div>

              <div className="flex items-center space-x-3 flex-shrink-0">
                {hasChange && (
                  <div
                    className={`flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isUp
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : isDown
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                    ) : isDown ? (
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                    ) : (
                      <Minus className="w-3 h-3 mr-0.5" />
                    )}
                    {Math.abs(cat.changePercentage || 0)}%
                  </div>
                )}
                <div className="text-right">
                  <span className="font-mono font-semibold text-white">
                    ${cat.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

