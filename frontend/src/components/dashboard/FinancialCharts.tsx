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
import { DateFilterOption } from '../../types/finance';
import { ArrowUpRight, TrendingUp, PieChart as PieIcon } from 'lucide-react';

interface FinancialChartsProps {
  dateFilter?: DateFilterOption;
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
        <div className="font-semibold text-slate-300 mb-1.5">{label} 2026</div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between space-x-4 py-0.5">
            <span className="flex items-center space-x-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="capitalize">{entry.name}:</span>
            </span>
            <span className="font-mono font-bold text-white">
              ${entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ dateFilter = 'this_month' }) => {
  const [activeMetric, setActiveMetric] = useState<'both' | 'income' | 'expenses'>('both');

  const cashFlowData = DEMO_CASH_FLOW_BY_DATE_FILTER[dateFilter] || DEMO_MONTHLY_CASH_FLOW;
  const totalExpenseVal = DEMO_EXPENSE_CATEGORIES.reduce((acc, curr) => acc + curr.value, 0);

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
            <p className="text-xs text-slate-400 mt-1">Monthly Inflow vs Outflow trajectory (Jan - Jul 2026)</p>
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
            <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val / 1000}k`}
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

        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Inflow ($9,450 peak)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
              <span>Outflow ($4,830 current)</span>
            </span>
          </div>
          <span className="text-emerald-400 font-semibold flex items-center">
            Net Surplus: +$4,620.00
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      </div>

      {/* Donut Expense Category Breakdown */}
      <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <PieIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-white">Expense Distribution</h3>
          </div>
          <p className="text-xs text-slate-400">Allocation across active budget categories</p>
        </div>

        {/* Donut Chart */}
        <div className="h-52 relative flex items-center justify-center my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DEMO_EXPENSE_CATEGORIES}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={88}
                paddingAngle={4}
                dataKey="value"
              >
                {DEMO_EXPENSE_CATEGORIES.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`$${Number(value || 0).toLocaleString()}`, 'Spend']}
                contentStyle={{
                  backgroundColor: '#0b1021',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '11px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Donut Label */}
          <div className="absolute text-center pointer-events-none">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Total Spend</div>
            <div className="text-lg font-extrabold text-white font-mono">
              ${totalExpenseVal.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          {DEMO_EXPENSE_CATEGORIES.slice(0, 4).map((cat) => {
            const percentage = Math.round((cat.value / totalExpenseVal) * 100);
            return (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-300 truncate max-w-[130px]">{cat.name}</span>
                </div>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="text-white font-medium">{cat.formattedAmount}</span>
                  <span className="text-slate-500 text-[11px]">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
