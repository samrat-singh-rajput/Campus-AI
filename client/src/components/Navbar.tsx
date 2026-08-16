import React, { useState } from 'react';
import { Sparkles, Menu, X, ArrowRight, LogIn } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  user: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Branding */}
          <a href="#" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-200" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  CampusMate AI
                </span>
                <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">Your AI Career Companion</p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#demo" className="hover:text-indigo-400 transition-colors">Live ATS Demo</a>
            <a href="#workflow" className="hover:text-indigo-400 transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-indigo-400 transition-colors">Success Stories</a>
            <a href="#health" className="hover:text-indigo-400 transition-colors flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>System Health</span>
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1.5">
                <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                <button
                  onClick={onLogout}
                  className="text-xs text-slate-400 hover:text-rose-400 ml-2 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-colors flex items-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4 text-indigo-400" />
                  <span>Log In</span>
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
                >
                  <div className="px-4 py-2 bg-slate-950 rounded-[10px] text-sm font-bold text-white group-hover:bg-opacity-0 transition-all duration-300 flex items-center space-x-2">
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4 text-indigo-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-b border-slate-800 px-4 pt-2 pb-6 space-y-4">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-indigo-400 py-2 border-b border-slate-800/50"
          >
            Features
          </a>
          <a
            href="#demo"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-indigo-400 py-2 border-b border-slate-800/50"
          >
            Live ATS Demo
          </a>
          <a
            href="#workflow"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-indigo-400 py-2 border-b border-slate-800/50"
          >
            How It Works
          </a>
          <a
            href="#testimonials"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-indigo-400 py-2 border-b border-slate-800/50"
          >
            Success Stories
          </a>
          <a
            href="#health"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-300 hover:text-indigo-400 py-2"
          >
            System Health
          </a>

          <div className="pt-4 flex flex-col space-y-3">
            {user ? (
              <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="text-xs text-rose-400 font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl font-semibold text-sm"
                >
                  Log In
                </button>
                <button
                  onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm"
                >
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
