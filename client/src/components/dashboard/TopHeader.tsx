import React, { useState } from 'react';
import { Menu, Search, Bell, LogOut, ChevronDown, ExternalLink } from 'lucide-react';
import { NAV_ITEMS } from './Sidebar';

interface TopHeaderProps {
  activeTab: string;
  user: any;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
  onGoHome: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  user,
  onOpenMobileMenu,
  onLogout,
  onGoHome
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const activeNavItem = NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0];

  return (
    <header className="h-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {activeNavItem.label}
            </h1>
            {activeNavItem.stepBadge && (
              <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {activeNavItem.stepBadge} View
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {user?.college ? `${user.college} • ${user.degree || 'Student'}` : 'CampusMate AI Student Portal'}
          </p>
        </div>
      </div>

      {/* Right: Search, Notifications & User Dropdown */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        
        {/* Quick Search Bar Placeholder */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search jobs, skills, resumes..."
            className="w-56 lg:w-64 bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Home Public Site Button */}
        <button
          onClick={onGoHome}
          className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 bg-slate-900 border border-slate-800 transition-colors hidden sm:flex items-center space-x-1.5 text-xs font-semibold"
          title="View Landing Page"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Landing Page</span>
        </button>

        {/* Notifications Bell */}
        <button
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-1.5 right-1.5"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl p-1.5 sm:px-3 sm:py-1.5 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-semibold text-slate-200 hidden sm:inline">{user?.name?.split(' ')[0] || 'User'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 glass-card rounded-2xl border border-slate-800 p-2 shadow-2xl z-50 animate-fadeIn"
              onClick={() => setProfileDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Student Account'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'student@campus.edu'}</p>
              </div>

              <div className="space-y-0.5 text-xs font-medium">
                <button
                  onClick={onGoHome}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 flex items-center justify-between"
                >
                  <span>View Landing Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <div className="px-3 py-2 text-[10px] text-slate-500 font-mono">
                  JWT Session Valid
                </div>
              </div>

              <div className="pt-1 border-t border-slate-800/80 mt-1">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-bold flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
