import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  PlusCircle,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { DateFilterOption } from '../../types/finance';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenAddTransaction: () => void;
  dateFilter: DateFilterOption;
  onChangeDateFilter: (filter: DateFilterOption) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenAddTransaction,
  dateFilter,
  onChangeDateFilter,
  searchQuery,
  onSearchChange,
  onOpenProfile,
}) => {
  const { user, isGuestMode } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Member';
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const notifications = [
    {
      id: 1,
      title: 'Dividend Credit Received',
      detail: '+$384.50 Vanguard Dividend credited to Brokerage',
      time: '2 hours ago',
      type: 'success',
    },
    {
      id: 2,
      title: 'Upcoming Bill Reminder',
      detail: 'AT&T Fiber ($85.00) scheduled for auto-debit on Nov 12',
      time: '5 hours ago',
      type: 'warning',
    },
    {
      id: 3,
      title: 'Monthly Savings Target Met',
      detail: 'You have exceeded your 35% savings rate benchmark (38.6%)',
      time: '1 day ago',
      type: 'info',
    },
  ];

  return (
    <header className="h-20 bg-navy-900/60 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Welcome Message */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 lg:hidden transition"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Welcome back, {firstName}</span>
            {isGuestMode ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                <Sparkles className="w-3 h-3" /> Guest Demo
              </span>
            ) : (
              <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Health 86/100
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            Intelligent Portfolio Overview • Net worth up +4.8% this month
          </p>
        </div>
      </div>

      {/* Middle: Global Search Input */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search transactions, merchants, categories..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
          />
        </div>
      </div>

      {/* Right: Actions, Date Filter & Profile */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Date Filter Selector */}
        <div className="relative hidden sm:flex items-center space-x-1.5 bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-brand-400" />
          <select
            value={dateFilter}
            onChange={(e) => onChangeDateFilter(e.target.value as DateFilterOption)}
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
          >
            <option value="this_month" className="bg-navy-900 text-white">
              This Month
            </option>
            <option value="last_30_days" className="bg-navy-900 text-white">
              Last 30 Days
            </option>
            <option value="quarter_to_date" className="bg-navy-900 text-white">
              Q4 to Date
            </option>
            <option value="year_to_date" className="bg-navy-900 text-white">
              Year to Date (2026)
            </option>
          </select>
        </div>

        {/* Add Transaction Button */}
        <button
          onClick={onOpenAddTransaction}
          className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-glow-violet transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 relative transition cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 bg-brand-500 rounded-full absolute top-1.5 right-1.5 ring-2 ring-navy-900 animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-navy-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl z-50 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                <span className="text-[11px] text-brand-400 cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="py-3 flex items-start space-x-3">
                    {n.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="text-xs font-medium text-white">{n.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.detail}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Trigger Avatar */}
        <button
          onClick={onOpenProfile}
          className="flex items-center space-x-2 pl-1 group cursor-pointer focus:outline-none"
          title="Account Profile & Security Settings"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-glow-violet group-hover:ring-2 group-hover:ring-brand-400 transition border border-brand-400/30">
            {initials}
          </div>
        </button>
      </div>
    </header>
  );
};
