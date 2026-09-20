import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Lock,
  Mail,
  User,
  Database,
  BarChart3,
  Bot,
  FileSpreadsheet,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, signup, loginAsGuest } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup' | 'guest'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        if (!email.trim()) {
          setError('Please enter your email address.');
          setLoading(false);
          return;
        }
        await login(email, password);
      } else if (tab === 'signup') {
        if (!email.trim() || !name.trim()) {
          setError('Please enter both name and email.');
          setLoading(false);
          return;
        }
        await signup(name, email, password);
      }
    } catch {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden font-sans selection:bg-slate-700 selection:text-white">
      {/* Subtle structural grid background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Terminal Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span>EquityLens Research Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Institutional Market Access
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Fundamental equity screener, valuation benchmarking, and in-house AI stock analysis for US & Indian equities.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#0D121D] border border-[#1E2638] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-[#090D15] p-1 border border-[#182030]">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${
                tab === 'login'
                  ? 'bg-[#151D2C] text-white shadow-sm border border-slate-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-tab-signup"
              type="button"
              onClick={() => {
                setTab('signup');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${
                tab === 'signup'
                  ? 'bg-[#151D2C] text-white shadow-sm border border-slate-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
            <button
              id="auth-tab-guest"
              type="button"
              onClick={() => {
                setTab('guest');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${
                tab === 'guest'
                  ? 'bg-[#151D2C] text-white shadow-sm border border-slate-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Guest Access
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'guest' ? (
            /* Guest Direct Entry */
            <div className="space-y-4 py-2 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">Continue as Guest Analyst</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Instant access to the screener, peer benchmark tables, 5-year growth models, and AI assistant without saving persistent cloud profiles.
                </p>
              </div>

              <button
                id="continue-as-guest-btn"
                type="button"
                onClick={loginAsGuest}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-white hover:bg-slate-200 text-slate-900 shadow-md transition-all cursor-pointer font-sans"
              >
                <span>Enter Terminal as Guest</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Sign In / Sign Up Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 block">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      required={tab === 'signup'}
                      className="w-full bg-[#090D15] border border-[#1E2638] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-400 transition"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 block">Work / Analyst Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@firm.com"
                    required
                    className="w-full bg-[#090D15] border border-[#1E2638] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-400 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-300 block">Password</label>
                  {tab === 'login' && (
                    <span className="text-[11px] text-slate-500">Any password for demo</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#090D15] border border-[#1E2638] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-400 transition"
                  />
                </div>
              </div>

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-white hover:bg-slate-200 text-slate-900 shadow-md transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                <span>{tab === 'login' ? 'Sign In to Terminal' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={loginAsGuest}
                  className="w-full text-center text-xs text-slate-400 hover:text-slate-200 py-1 transition underline decoration-slate-600 underline-offset-4"
                >
                  Or continue as a Guest Analyst
                </button>
              </div>
            </form>
          )}

          {/* Feature Badges */}
          <div className="pt-4 border-t border-[#182030] grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>US & Indian Equities</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
              <span>5Y Financial Statements</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-slate-400" />
              <span>In-House AI Analyst</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
              <span>Excel & PDF Export</span>
            </div>
          </div>
        </div>

        {/* Security & Regulatory Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Local session encryption • Normalized Yahoo Finance v2 BFF</span>
        </div>
      </div>
    </div>
  );
};
