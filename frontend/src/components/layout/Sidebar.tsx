import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  PiggyBank,
  Target,
  CalendarClock,
  Sparkles,
  BarChart3,
  SlidersHorizontal,
  Activity,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { NavigationTab } from '../../types/finance';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsedDesktop: boolean;
  onToggleCollapseDesktop: () => void;
  onOpenSystemStatus: () => void;
  onOpenProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop,
  onToggleCollapseDesktop,
  onOpenSystemStatus,
  onOpenProfile,
}) => {
  const { user, isGuestMode, logout } = useAuth();

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as NavigationTab, label: 'Transactions', icon: ReceiptText, badge: '10' },
    { id: 'budgeting' as NavigationTab, label: 'Budgeting', icon: PiggyBank },
    { id: 'savings' as NavigationTab, label: 'Savings & Goals', icon: Target },
    { id: 'bills' as NavigationTab, label: 'Bills & Payments', icon: CalendarClock, badge: '1 Due' },
    { id: 'ai-assistant' as NavigationTab, label: 'AI Assistant', icon: Sparkles, glow: true },
    { id: 'reports' as NavigationTab, label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: SlidersHorizontal },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out bg-navy-900/90 backdrop-blur-xl border-r border-slate-800/80 ${
          isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsedDesktop ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="h-10 w-10 min-w-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-glow-violet">
              <span className="font-extrabold text-white text-lg tracking-wider">A</span>
            </div>
            {!isCollapsedDesktop && (
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-base text-white tracking-tight">ArthaAI</span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    Pro
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Personal Finance</span>
              </div>
            )}
          </div>

          {/* Close on Mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapseDesktop}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition"
            title={isCollapsedDesktop ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsedDesktop ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center rounded-xl font-medium text-xs transition-all duration-200 cursor-pointer ${
                  isCollapsedDesktop ? 'justify-center px-0 py-3' : 'px-3.5 py-2.5 justify-between'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-glow-violet font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
                title={isCollapsedDesktop ? item.label : undefined}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-white'
                        : item.glow
                        ? 'text-brand-400 animate-pulse'
                        : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  {!isCollapsedDesktop && <span className="tracking-wide">{item.label}</span>}
                </div>

                {!isCollapsedDesktop && item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-brand-500/10 text-brand-300 border border-brand-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          {/* Phase 1 System Health Quick Trigger */}
          <button
            onClick={onOpenSystemStatus}
            className={`w-full flex items-center rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer ${
              isCollapsedDesktop ? 'justify-center p-2.5' : 'px-3 py-2 justify-between'
            }`}
            title="Inspect Phase 1 System Health & Architecture"
          >
            <div className="flex items-center space-x-2.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              {!isCollapsedDesktop && <span className="text-[11px]">System Status</span>}
            </div>
            {!isCollapsedDesktop && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Online
              </span>
            )}
          </button>

          {/* User Profile Mini & Logout Trigger */}
          {!isCollapsedDesktop ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/30 border border-slate-800/50">
              <button
                onClick={onOpenProfile}
                className="flex items-center space-x-2.5 overflow-hidden text-left hover:opacity-80 transition cursor-pointer"
                title="Open Profile & Account Settings"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow shrink-0">
                  {initials}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-white truncate">
                    {user?.fullName || 'User'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {user?.email || (isGuestMode ? 'alex.morgan@artha.ai' : '')}
                  </div>
                </div>
              </button>

              <button
                onClick={() => logout()}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                title={isGuestMode ? 'Exit Demo Session' : 'Sign Out'}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={onOpenProfile}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow cursor-pointer hover:ring-2 hover:ring-brand-400 transition"
                title="Account Settings"
              >
                {initials}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
