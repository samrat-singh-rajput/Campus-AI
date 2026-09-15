import React from 'react';
import { ShieldCheck, LogOut, Menu } from 'lucide-react';
import type { AdminUser } from '../../services/adminAuthService';

interface AdminHeaderProps {
  admin: AdminUser;
  onLogout: () => void;
  onOpenMobileSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  admin,
  onLogout,
  onOpenMobileSidebar
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-4">
      <div className="flex items-center justify-between">
        
        {/* Left Title & Mobile Menu Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>CampusMate AI</span>
              <span className="text-slate-500 font-normal text-sm hidden sm:inline">|</span>
              <span className="text-indigo-400 font-bold text-sm sm:text-base hidden sm:inline">
                Administrator Dashboard
              </span>
            </h1>

            <div className="flex items-center space-x-2 mt-0.5">
              <span className="inline-flex items-center space-x-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>System Status: Operational</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Admin Controls */}
        <div className="flex items-center space-x-3">
          
          <div className="hidden md:flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">{admin.username}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider">
              Admin
            </span>
          </div>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-rose-400 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

        </div>

      </div>
    </header>
  );
};
