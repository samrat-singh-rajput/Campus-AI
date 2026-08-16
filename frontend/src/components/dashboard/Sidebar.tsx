import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  FileText, 
  Target, 
  Kanban, 
  Mic, 
  TrendingUp, 
  Settings, 
  Sparkles, 
  LogOut, 
  X, 
  ChevronRight
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  stepBadge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'assistant', label: 'AI Assistant', icon: Bot, path: '/dashboard/assistant' },
  { id: 'resume', label: 'My Resume', icon: FileText, path: '/dashboard/resume' },
  { id: 'jobs', label: 'Job Matches', icon: Target, path: '/dashboard/jobs' },
  { id: 'applications', label: 'Applications', icon: Kanban, path: '/dashboard/applications' },
  { id: 'interview', label: 'Interview Coach', icon: Mic, path: '/dashboard/interview' },
  { id: 'insights', label: 'AI Insights', icon: TrendingUp, path: '/dashboard/insights' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' }
];

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  user: any;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onGoHome: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  user,
  onLogout,
  mobileOpen,
  onCloseMobile,
  onGoHome
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Branding */}
        <div>
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/80">
            <button
              onClick={() => { onGoHome(); onCloseMobile(); }}
              className="flex items-center space-x-3 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  CampusMate AI
                </span>
                <p className="text-[10px] text-slate-400 font-medium">Student Dashboard</p>
              </div>
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="p-4 space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
            {NAV_ITEMS.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/10 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl transition-colors ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 group-hover:text-indigo-400'
                    }`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  {item.stepBadge ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-500 group-hover:border-slate-700">
                      {item.stepBadge}
                    </span>
                  ) : (
                    isActive && <ChevronRight className="w-4 h-4 text-indigo-400" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Account Card & Logout */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Authenticated Student'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'student@campus.edu'}</p>
              </div>
            </div>

            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="JWT Session Active"></span>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
