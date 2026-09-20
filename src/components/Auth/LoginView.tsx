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
    <div className="min-h-screen bg-[#0B0D10] text-[#E8E9EB] flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden font-sans selection:bg-[#252A33] selection:text-[#E8E9EB]">
      {/* Subtle structural grid background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Terminal Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151922] border border-[#252A33] text-xs font-mono text-[#8B919C]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7FA6C9]" />
            <span>EquityLens Research Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#E8E9EB]">
            Institutional Market Access
          </h1>
          <p className="text-xs sm:text-sm text-[#8B919C] max-w-sm mx-auto leading-relaxed">
            Fundamental equity screener, valuation benchmarking, and in-house AI stock analysis for US & Indian equities.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#11141A] border border-[#252A33] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-[#0B0D10] p-1 border border-[#252A33]">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${
                tab === 'login'
                  ? 'bg-[#151922] text-[#E8E9EB] shadow-sm border border-[#252A33]'
                  : 'text-[#8B919C] hover:text-[#E8E9EB]'
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
                  ? 'bg-[#151922] text-[#E8E9EB] shadow-sm border border-[#252A33]'
                  : 'text-[#8B919C] hover:text-[#E8E9EB]'
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
                  ? 'bg-[#151922] text-[#E8E9EB] shadow-sm border border-[#252A33]'
                  : 'text-[#8B919C] hover:text-[#E8E9EB]'
              }`}
            >
              Guest Access
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#151922] border border-[#B87878]/50 text-[#B87878] text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B87878] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'guest' ? (
            /* Guest Direct Entry */
            <div className="space-y-4 py-2 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#151922] border border-[#252A33] flex items-center justify-center text-[#7FA6C9]">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#E8E9EB]">Continue as Guest Analyst</h3>
                <p className="text-xs text-[#8B919C] leading-relaxed max-w-xs mx-auto">
                  Instant access to the screener, peer benchmark tables, 5-year growth models, and AI assistant without saving persistent cloud profiles.
                </p>
              </div>

              <button
                id="continue-as-guest-btn"
                type="button"
                onClick={loginAsGuest}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-[#7FA6C9] hover:bg-[#7FA6C9]/90 text-[#0B0D10] shadow-md transition-all cursor-pointer font-sans"
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
                  <label className="text-xs font-mono text-[#E8E9EB] block">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8B919C] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      required={tab === 'signup'}
                      className="w-full bg-[#0B0D10] border border-[#252A33] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#E8E9EB] placeholder-[#8B919C] focus:outline-none focus:border-[#7FA6C9] transition font-sans"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#E8E9EB] block">Work / Analyst Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8B919C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@firm.com"
                    required
                    className="w-full bg-[#0B0D10] border border-[#252A33] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#E8E9EB] placeholder-[#8B919C] focus:outline-none focus:border-[#7FA6C9] transition font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-[#E8E9EB] block">Password</label>
                  {tab === 'login' && (
                    <span className="text-[11px] text-[#8B919C]">Any password for demo</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8B919C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0B0D10] border border-[#252A33] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#E8E9EB] placeholder-[#8B919C] focus:outline-none focus:border-[#7FA6C9] transition font-sans"
                  />
                </div>
              </div>

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-[#7FA6C9] hover:bg-[#7FA6C9]/90 text-[#0B0D10] shadow-md transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                <span>{tab === 'login' ? 'Sign In to Terminal' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={loginAsGuest}
                  className="w-full text-center text-xs text-[#8B919C] hover:text-[#E8E9EB] py-1 transition underline decoration-[#252A33] underline-offset-4"
                >
                  Or continue as a Guest Analyst
                </button>
              </div>
            </form>
          )}

          {/* Feature Badges */}
          <div className="pt-4 border-t border-[#252A33] grid grid-cols-2 gap-2 text-[11px] text-[#8B919C]">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#7FA6C9]" />
              <span>US & Indian Equities</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-[#7FA6C9]" />
              <span>5Y Financial Statements</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-[#7FA6C9]" />
              <span>In-House AI Analyst</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#7FA6C9]" />
              <span>Excel & PDF Export</span>
            </div>
          </div>
        </div>

        {/* Security & Regulatory Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[#8B919C]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#7FA6C9]" />
          <span>Local session encryption • Normalized Yahoo Finance v2 BFF</span>
        </div>
      </div>
    </div>
  );
};
