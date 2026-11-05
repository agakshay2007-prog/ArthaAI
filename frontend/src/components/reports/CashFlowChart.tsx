import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { CashFlowPoint } from '../../types/reports';

interface CashFlowChartProps {
  data: CashFlowPoint[];
  isLoading?: boolean;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ data, isLoading = false }) => {
  if (isLoading || data.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-center h-72">
        <span className="text-xs text-slate-500">
          {isLoading ? 'Aggregating cash-flow timeline...' : 'No cash-flow points in selected date range.'}
        </span>
      </div>
    );
  }

  const customTooltipFormatter = (value: unknown, name?: string | number) => {
    const val = Number(value || 0);
    return [`$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, String(name || '')];
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Cash Flow & Liquidity Trajectory</h3>
          <p className="text-[11px] text-slate-400">Periodic inflow versus expenditure burn rate</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#f8fafc',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
              formatter={customTooltipFormatter}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
            />
            <Bar dataKey="income" name="Inflow (Income)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
            <Bar dataKey="expenses" name="Outflow (Spend)" fill="#64748b" radius={[4, 4, 0, 0]} maxBarSize={36} />
            <Bar dataKey="netCashFlow" name="Net Surplus/Deficit" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

