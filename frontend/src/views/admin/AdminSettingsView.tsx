import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  RefreshCw, 
  User, 
  Database, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  KeyRound, 
  ExternalLink 
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { fetchAdminSettings, changeAdminPassword } from '../../services/adminAuthService';
import type { AdminUser } from '../../services/adminAuthService';
import { getErrorMessage } from '../../services/api';

interface AdminSettingsViewProps {
  admin: AdminUser;
  onLogout: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({ admin, onLogout, onNavigateTab }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsData, setSettingsData] = useState<any>(null);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [pwdSubmitting, setPwdSubmitting] = useState<boolean>(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminSettings();
      setSettingsData(data);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Something went wrong while loading admin settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!currentPassword) {
      setPwdError('Please enter your current admin password.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPwdError('Password does not meet the security requirements. Minimum length is 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setPwdSubmitting(true);
    try {
      const res = await changeAdminPassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      setPwdSuccess(res.message || 'Admin password changed successfully. Please log in again.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Auto logout after 2 seconds to force fresh login
      setTimeout(() => {
        onLogout();
      }, 2000);
    } catch (err: any) {
      setPwdError(getErrorMessage(err) || 'Failed to change admin password.');
    } finally {
      setPwdSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar */}
      <AdminSidebar
        admin={admin}
        activeTab="settings"
        onSelectTab={onNavigateTab}
        onLogout={onLogout}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Header */}
        <AdminHeader
          admin={admin}
          onLogout={onLogout}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Title Banner */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 glow-border">
            <div>
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Settings className="w-3.5 h-3.5" />
                <span>System Administration</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Settings & Platform Configuration
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time operational status, database metrics, security configuration, and administrator access controls.
              </p>
            </div>

            <button
              onClick={loadSettings}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Settings</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between text-rose-300 text-xs">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadSettings}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 rounded-xl font-bold transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* System Status Summary Grid */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Platform Service Health Summary</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Backend API</span>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Operational</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">MongoDB Atlas</span>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">ChromaDB Store</span>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Operational</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">JWT Security</span>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Audit Logging</span>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active</span>
                </div>
              </div>

            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Admin Profile & Account Security */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6 glow-border">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-2xl">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Administrator Account</h3>
                    <p className="text-xs text-slate-400">Active session identity and permissions</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Admin Username</span>
                  <p className="font-extrabold text-white">{admin.username}</p>
                </div>
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Access Role</span>
                  <p className="font-extrabold text-indigo-400 capitalize">{admin.role}</p>
                </div>
              </div>

              {/* Password Change Form */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-indigo-400" />
                  <span>Change Admin Password</span>
                </h4>

                {pwdError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
                    {pwdError}
                  </div>
                )}

                {pwdSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{pwdSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password..."
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">New Password</label>
                      <input
                        type="password"
                        placeholder="Min 8 characters..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Repeat new password..."
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={pwdSubmitting}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {pwdSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Update Admin Password</span>
                    )}
                  </button>
                </form>

              </div>

            </div>

            {/* 2. Database & Storage Status */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6 glow-border">
              
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
                <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-2xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">MongoDB Atlas Database</h3>
                  <p className="text-xs text-slate-400">Collection metrics and persistence health</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Database Name</span>
                  <span className="font-mono text-purple-300 font-bold">{settingsData?.database?.name || 'campusmate'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Connection Status</span>
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{settingsData?.database?.status || 'Operational'}</span>
                  </span>
                </div>
              </div>

              {/* Collections Document Counts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">users</span>
                  <p className="text-lg font-black text-white">{settingsData?.database?.metrics?.users_count ?? 0}</p>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-teal-400 uppercase block font-bold">resumes</span>
                  <p className="text-lg font-black text-teal-300">{settingsData?.database?.metrics?.resumes_count ?? 0}</p>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-purple-400 uppercase block font-bold">jobs</span>
                  <p className="text-lg font-black text-purple-300">{settingsData?.database?.metrics?.jobs_count ?? 0}</p>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-cyan-400 uppercase block font-bold">applications</span>
                  <p className="text-lg font-black text-cyan-300">{settingsData?.database?.metrics?.applications_count ?? 0}</p>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase block font-bold">interviews</span>
                  <p className="text-lg font-black text-amber-300">{settingsData?.database?.metrics?.interviews_count ?? 0}</p>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-indigo-400 uppercase block font-bold">audit_logs</span>
                  <p className="text-lg font-black text-indigo-300">{settingsData?.database?.metrics?.audit_logs_count ?? 0}</p>
                </div>

              </div>

              {/* Maintenance Control Buttons */}
              <div className="pt-2">
                <button
                  onClick={() => onNavigateTab('audit-logs')}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold rounded-xl transition-colors text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>View Security Audit Logs</span>
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                </button>
              </div>

            </div>

          </div>

        </main>

      </div>
    </div>
  );
};
