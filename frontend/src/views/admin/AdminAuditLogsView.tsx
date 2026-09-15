import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Activity
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminAuditDetailModal } from '../../components/admin/AdminAuditDetailModal';
import { fetchAdminAuditLogs, fetchAdminAuditAnalytics } from '../../services/adminAuthService';
import type { AdminUser } from '../../services/adminAuthService';
import { getErrorMessage } from '../../services/api';

interface AdminAuditLogsViewProps {
  admin: AdminUser;
  onLogout: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminAuditLogsView: React.FC<AdminAuditLogsViewProps> = ({ admin, onLogout, onNavigateTab }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('all');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Data states
  const [logs, setLogs] = useState<any[]>([]);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [analytics, setAnalytics] = useState<any>(null);

  // Modal State
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const loadAuditData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsRes, analyticsRes] = await Promise.all([
        fetchAdminAuditLogs({
          q: searchTerm,
          resource_type_filter: categoryFilter,
          time_range: timeRange,
          page: currentPage,
          limit: pageSize
        }),
        fetchAdminAuditAnalytics()
      ]);

      setLogs(logsRes.logs || []);
      setTotalLogs(logsRes.total_logs || 0);
      setTotalPages(logsRes.total_pages || 1);
      setAnalytics(analyticsRes);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Unable to load administrative audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, [searchTerm, categoryFilter, timeRange, currentPage, pageSize]);

  const getActionColor = (act: string) => {
    if (act.includes('LOGIN_SUCCESS') || act.includes('CREATED') || act.includes('ENABLED')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (act.includes('FAILED') || act.includes('DISABLED') || act.includes('DELETED')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    if (act.includes('UPDATED') || act.includes('CLOSED')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar */}
      <AdminSidebar
        admin={admin}
        activeTab="audit-logs"
        onSelectTab={onNavigateTab}
        onLogout={onLogout}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Header */}
        <AdminHeader
          admin={admin}
          onLogout={onLogout}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Page Banner */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 glow-border">
            <div>
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Security & Governance</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Admin Audit Logs & Activity Tracking
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time MongoDB Atlas audit trail for administrator logins, candidate account updates, job postings, and system configuration.
              </p>
            </div>

            <button
              onClick={loadAuditData}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Audit Trail</span>
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
                onClick={loadAuditData}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 rounded-xl font-bold transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Events</span>
              <p className="text-2xl font-black text-white">{analytics?.total_audit_events ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Events Today</span>
              <p className="text-2xl font-black text-emerald-300">{analytics?.events_today ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Events This Week</span>
              <p className="text-2xl font-black text-indigo-300">{analytics?.events_this_week ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Most Common Action</span>
              <p className="text-sm font-extrabold text-purple-300 font-mono truncate">{analytics?.most_common_action ?? 'None'}</p>
            </div>

          </div>

          {/* Filters Bar */}
          <div className="glass-card rounded-3xl p-5 border border-slate-800 space-y-4">
            
            <div className="flex flex-col md:flex-row gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search audit logs by admin, action, target, or description..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Resource Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Category: All Actions</option>
                  <option value="auth">Authentication</option>
                  <option value="user">Users</option>
                  <option value="job">Jobs</option>
                  <option value="application">Applications</option>
                  <option value="resume">Resumes</option>
                  <option value="interview">Interviews</option>
                  <option value="analytics">Analytics</option>
                  <option value="system">System</option>
                </select>
              </div>

              {/* Date Filter */}
              <select
                value={timeRange}
                onChange={(e) => {
                  setTimeRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Date: All Time</option>
                <option value="today">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>

              {/* Page Size Selector */}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>

            </div>
          </div>

          {/* Activity Timeline Section & Logs Table Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Timeline Sidebar */}
            <div className="glass-card rounded-3xl p-5 border border-slate-800 space-y-4 glow-border h-fit">
              <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>Recent Admin Activity</span>
              </h3>

              <div className="space-y-3">
                {analytics?.recent_activity && analytics.recent_activity.length > 0 ? (
                  analytics.recent_activity.slice(0, 5).map((act: any) => (
                    <div key={act.id} className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded border ${getActionColor(act.action)}`}>
                          {act.action}
                        </span>
                      </div>
                      <p className="text-slate-300 font-semibold text-[11px] truncate">{act.description}</p>
                      <span className="text-[10px] text-slate-500 block">
                        {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center">No admin activity recorded yet.</p>
                )}
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="lg:col-span-3 glass-card rounded-3xl border border-slate-800 overflow-hidden flex flex-col">
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3.5 pl-6">Date & Time</th>
                      <th className="p-3.5">Admin</th>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Target</th>
                      <th className="p-3.5">Description</th>
                      <th className="p-3.5 pr-6 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400 mb-2" />
                          <span>Loading audit records from MongoDB Atlas...</span>
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          No audit log events match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-3.5 pl-6 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                          </td>
                          <td className="p-3.5 font-bold text-white whitespace-nowrap">
                            {log.admin_username || 'admin'}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg border ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-300 capitalize whitespace-nowrap">
                            {log.resource_type}
                          </td>
                          <td className="p-3.5 text-slate-300 font-semibold max-w-[140px] truncate">
                            {log.target_name || 'N/A'}
                          </td>
                          <td className="p-3.5 text-slate-400 max-w-[200px] truncate">
                            {log.description}
                          </td>
                          <td className="p-3.5 pr-6 text-right whitespace-nowrap">
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 rounded-lg transition-colors inline-flex items-center space-x-1 cursor-pointer font-bold text-[11px]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Showing page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> ({totalLogs} audit records)
                </span>
                
                <div className="flex items-center space-x-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </main>

      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <AdminAuditDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}

    </div>
  );
};
