import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginViewProps {
  onSwitchToRegister: () => void;
  onOpenForgotPassword: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onSwitchToRegister,
  onOpenForgotPassword,
}) => {
  const { login, enterGuestMode, error, clearError, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (!email.trim()) {
      setValidationError('Please enter your email address');
      return;
    }
    if (!password) {
      setValidationError('Please enter your password');
      return;
    }

    await login({ email: email.trim(), password });
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Ambient background glow elements */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 shadow-glow-violet mb-2">
            <span className="font-black text-white text-2xl tracking-wider">A</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ArthaAI
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Intelligent Personal Finance & Wealth Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white tracking-tight">Sign in to your account</h2>
            <p className="text-xs text-slate-400 mt-1">Enter your credentials to access your financial dashboard</p>
          </div>

          {/* Validation or API Error Alerts */}
          {(validationError || error) && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">
                <span>{validationError || error}</span>
                {error && error.includes('Database is unconfigured') && (
                  <p className="mt-1 text-[11px] text-rose-400/80">
                    Tip: Use the Guest Demo Mode below to preview the application while MongoDB Atlas is connecting.
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onOpenForgotPassword}
                  className="text-[11px] text-brand-400 hover:text-brand-300 transition hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-glow-violet transition duration-200 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-semibold">
              <span className="bg-navy-900/95 px-3 text-slate-500 tracking-wider">
                Or Instant Preview
              </span>
            </div>
          </div>

          {/* Guest Demo Access Button */}
          <button
            type="button"
            onClick={enterGuestMode}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-brand-950/50 via-slate-900 to-indigo-950/50 border border-brand-500/30 hover:border-brand-400/60 transition group cursor-pointer text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30 group-hover:scale-105 transition">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Explore Demo as Alex Morgan</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    Live Demo
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Inspect the complete Phase 2 dashboard & interactive ledger
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-300 group-hover:translate-x-0.5 transition" />
          </button>

          {/* Switch to Register */}
          <div className="mt-6 text-center text-xs text-slate-400">
            <span>Don't have an account yet? </span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-brand-400 font-semibold hover:text-brand-300 transition hover:underline"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Security / Architecture Footer Note */}
        <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500">
          <Shield className="w-3.5 h-3.5 text-brand-400" />
          <span>Protected by HttpOnly JWT cookies, bcrypt hashing & rate limiting</span>
        </div>
      </div>
    </div>
  );
};
