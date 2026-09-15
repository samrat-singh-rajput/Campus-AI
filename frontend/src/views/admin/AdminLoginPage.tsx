import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Eye, EyeOff, Sparkles, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { loginAdmin } from '../../services/adminAuthService';
import type { AdminUser } from '../../services/adminAuthService';
import { getErrorMessage } from '../../services/api';

interface AdminLoginPageProps {
  onLoginSuccess: (admin: AdminUser) => void;
  noticeMessage?: string | null;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess, noticeMessage }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(noticeMessage || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Front-end validation for empty fields
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await loginAdmin({
        username: username.trim(),
        password: password.trim()
      });
      onLoginSuccess(response.admin);
    } catch (err: any) {
      const friendlyMsg = getErrorMessage(err, 'admin_login');
      setError(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-y-auto selection:bg-indigo-500 selection:text-white">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md my-auto relative z-10">
        
        {/* Brand & Badge Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="flex items-center justify-center space-x-3">
            <img
              src="/logo-icon.png"
              alt="CampusMate AI Emblem"
              className="h-12 w-auto object-contain drop-shadow-lg"
            />
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              CampusMate AI
            </span>
          </div>

          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Administrator Access Portal</span>
          </div>
        </div>

        {/* Admin Login Card Box */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 glow-border backdrop-blur-xl">
          
          <div className="text-center space-y-1 pb-2 border-b border-slate-800/80">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Administrator Login
            </h2>
            <p className="text-xs text-slate-400">
              Sign in with your administrative credentials to manage system operations
            </p>
          </div>

          {/* User-friendly Error Alert */}
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start space-x-3 text-rose-300 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter administrator username"
                  disabled={loading}
                  autoComplete="username"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-extrabold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Login as Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          © 2026 CampusMate AI. Authorized Administrative Portal.
        </p>

      </div>
    </div>
  );
};
