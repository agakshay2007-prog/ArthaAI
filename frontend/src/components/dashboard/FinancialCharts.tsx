import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DEMO_MONTHLY_CASH_FLOW,
  DEMO_EXPENSE_CATEGORIES,
  DEMO_CASH_FLOW_BY_DATE_FILTER,
} from '../../data/mockFinanceData';
import {
  DateFilterOption,
  MonthlyCashFlowPoint,
  CategoryExpenseBreakdown,
  ExpenseCategoryShare,
} from '../../types/finance';
import { ArrowUpRight, TrendingUp, PieChart as PieIcon } from 'lucide-react';

interface FinancialChartsProps {
  dateFilter?: DateFilterOption;
  cashFlow?: MonthlyCashFlowPoint[];
  categoryBreakdown?: CategoryExpenseBreakdown[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

const AreaTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-900/95 border border-slate-700/80 backdrop-blur-md rounded-xl p-3 shadow-xl text-xs">
        <div className="font-semibold text-slate-300 mb-1.5">{label}</div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between space-x-4 py-0.5">
            <span className="flex items-center space-x-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="capitalize">{entry.name}:</span>
            </span>
            <span className="font-mono font-bold text-white">
              ${entry.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CATEGORY_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#64748b'];

export const FinancialCharts: React.FC<FinancialChartsProps> = ({
  dateFilter = 'this_month',
  cashFlow,
  categoryBreakdown,
}) => {
  const [activeMetric, setActiveMetric] = useState<'both' | 'income' | 'expenses'>('both');

  // Use dynamic cash flow if available and non-empty, otherwise use filtered demo data
  const chartData =
    cashFlow && cashFlow.length > 0
      ? cashFlow
      : DEMO_CASH_FLOW_BY_DATE_FILTER[dateFilter] || DEMO_MONTHLY_CASH_FLOW;

  // Use dynamic category breakdown if available and non-empty
  const expenseCategories: ExpenseCategoryShare[] =
    categoryBreakdown && categoryBreakdown.length > 0
      ? categoryBreakdown.map((cat, idx) => ({
          name: cat.category,
          value: cat.totalAmount,
          color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
          formattedAmount: `$${cat.totalAmount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        }))
      : DEMO_EXPENSE_CATEGORIES;

  const totalExpenseVal = expenseCategories.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Main Income vs Expenses Area Chart */}
      <div className="lg:col-span-2 glass-card rounded-2xl p-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-white">Cash Flow Analytics</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">Monthly Inflow vs Outflow trajectory</p>
          </div>

          {/* Metric Filter Tabs */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveMetric('both')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                activeMetric === 'both' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setActiveMetric('income')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                activeMetric === 'income' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setActiveMetric('expenses')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                activeMetric === 'expenses' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Expenses
            </button>
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickLine={false}
                tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<AreaTooltip />} />

              {(activeMetric === 'both' || activeMetric === 'income') && (
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#incomeGradient)"
                />
              )}

              {(activeMetric === 'both' || activeMetric === 'expenses') && (
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseGradient)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Inflow</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
              <span>Outflow</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Calculated with precision minor units</span>
        </div>
      </div>

      {/* Expense Allocation Donut Chart */}
      <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <PieIcon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-white">Expense Distribution</h3>
            </div>
            <span className="text-xs text-brand-400 font-semibold cursor-pointer flex items-center space-x-0.5">
              <span>Allocation</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-2">Category-wise spend breakdown</p>

          {/* Donut Chart Container */}
          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {expenseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [
                    `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    'Spent',
                  ]}
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Total Label */}
            <div className="absolute text-center pointer-events-none">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Total</span>
              <span className="text-xs font-bold text-white font-mono">
                ${totalExpenseVal >= 1000 ? `${(totalExpenseVal / 1000).toFixed(1)}k` : totalExpenseVal.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Category Legend List */}
          <div className="mt-4 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {expenseCategories.map((cat) => {
              const pct = totalExpenseVal > 0 ? Math.round((cat.value / totalExpenseVal) * 100) : 0;
              return (
                <div key={cat.name} className="flex items-center justify-between text-xs py-0.5">
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-300 truncate">{cat.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-mono text-slate-100 font-semibold">{cat.formattedAmount}</span>
                    <span className="text-[10px] text-slate-400 w-7 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
