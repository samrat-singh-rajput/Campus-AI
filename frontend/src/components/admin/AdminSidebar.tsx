import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Kanban, 
  Mic, 
  BarChart2, 
  Activity, 
  LogOut, 
  X,
  ShieldCheck,
  Settings
} from 'lucide-react';
import type { AdminUser } from '../../services/adminAuthService';

interface AdminSidebarProps {
  admin: AdminUser;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  comingSoon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, comingSoon: false },
  { id: 'users', label: 'Users', icon: Users, comingSoon: false },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, comingSoon: false },
  { id: 'applications', label: 'Applications', icon: Kanban, comingSoon: false },
  { id: 'resumes', label: 'Resumes', icon: FileText, comingSoon: false },
  { id: 'interviews', label: 'Interviews', icon: Mic, comingSoon: false },
  { id: 'analytics', label: 'Analytics', icon: BarChart2, comingSoon: false },
  { id: 'audit-logs', label: 'Audit Logs', icon: ShieldCheck, comingSoon: false },
  { id: 'health', label: 'System Health', icon: Activity, comingSoon: false },
  { id: 'settings', label: 'Settings', icon: Settings, comingSoon: false },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  admin,
  activeTab,
  onSelectTab,
  onLogout,
  isOpenMobile,
  onCloseMobile
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6 p-6">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/logo-icon.png"
                alt="CampusMate AI Emblem"
                className="h-8 w-auto object-contain drop-shadow-md"
              />
              <div>
                <span className="text-base font-extrabold text-white tracking-tight block">
                  CampusMate AI
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold tracking-wider inline-block mt-0.5">
                  ADMIN PANEL
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1 pt-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!item.comingSoon) {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : item.comingSoon
                      ? 'text-slate-500 cursor-not-allowed hover:bg-slate-900/40'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.comingSoon && (
                    <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-500 border border-slate-800/80 font-mono">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Bottom Administrator Profile Card */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 m-3 rounded-2xl border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{admin.username}</p>
                <p className="text-[10px] text-slate-400 truncate">Administrator</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
};
