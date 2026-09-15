import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserCheck, 
  FileText, 
  Kanban, 
  Search, 
  Eye, 
  Lock, 
  Unlock, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  AlertCircle
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminUserDetailModal } from '../../components/admin/AdminUserDetailModal';
import { 
  fetchAdminUsersList, 
  fetchAdminUserDetail, 
  updateAdminUserStatus 
} from '../../services/adminAuthService';
import type { 
  AdminUser, 
  AdminUsersListResponse, 
  AdminUserDetailResponse 
} from '../../services/adminAuthService';
import { getErrorMessage } from '../../services/api';

interface AdminUsersViewProps {
  admin: AdminUser;
  onLogout: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({ admin, onLogout, onNavigateTab }) => {
  const [data, setData] = useState<AdminUsersListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resumeFilter, setResumeFilter] = useState<string>('all');
  const [appFilter, setAppFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Selected User Detail Modal State
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserDetailResponse | null>(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState<boolean>(false);

  const loadUsersList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminUsersList({
        q: searchQuery,
        status_filter: statusFilter,
        resume_filter: resumeFilter,
        app_filter: appFilter,
        sort_by: sortBy,
        page,
        limit
      });
      setData(res);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Unable to load student information right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersList();
  }, [searchQuery, statusFilter, resumeFilter, appFilter, sortBy, page, limit]);

  const handleViewUser = async (userId: string) => {
    setLoadingUserDetail(true);
    try {
      const detail = await fetchAdminUserDetail(userId);
      setSelectedUserDetail(detail);
    } catch (err: any) {
      alert(getErrorMessage(err) || 'Failed to load user details.');
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Disabled' ? 'Active' : 'Disabled';
    try {
      await updateAdminUserStatus(userId, newStatus);
      if (selectedUserDetail && selectedUserDetail.id === userId) {
        setSelectedUserDetail({ ...selectedUserDetail, status: newStatus });
      }
      await loadUsersList();
    } catch (err: any) {
      alert(getErrorMessage(err) || 'Failed to update account status.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar */}
      <AdminSidebar
        admin={admin}
        activeTab="users"
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

        {/* Users Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Title Banner */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 glow-border">
            <div>
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Candidate Student Records</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                User Management
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage and monitor registered CampusMate AI students from MongoDB Atlas.
              </p>
            </div>

            <button
              onClick={loadUsersList}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-colors flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Students</span>
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
                onClick={loadUsersList}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 rounded-xl font-bold transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* 4 Summary Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Students</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {data?.total_users ?? 0}
              </p>
              <p className="text-[10px] text-slate-500">Registered Accounts</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Active Students</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                {data?.total_active ?? 0}
              </p>
              <p className="text-[10px] text-slate-500">Enabled Login State</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Students With Resume</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-300">
                {data?.total_with_resume ?? 0}
              </p>
              <p className="text-[10px] text-slate-500">Uploaded PDF Resumes</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Students With Applications</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Kanban className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-purple-300">
                {data?.total_with_apps ?? 0}
              </p>
              <p className="text-[10px] text-slate-500">In Campus Drive Pipeline</p>
            </div>

          </div>

          {/* Controls Bar: Search, Filters & Sorting */}
          <div className="glass-card rounded-3xl p-4 sm:p-6 border border-slate-800 space-y-4 glow-border">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              
              {/* Search Box */}
              <div className="lg:col-span-4 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Search student by name, email, college, degree..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Status Filter */}
              <div className="lg:col-span-2">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Status: All</option>
                  <option value="active">Status: Active</option>
                  <option value="disabled">Status: Disabled</option>
                </select>
              </div>

              {/* Resume Filter */}
              <div className="lg:col-span-2">
                <select
                  value={resumeFilter}
                  onChange={(e) => { setResumeFilter(e.target.value); setPage(1); }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Resume: All</option>
                  <option value="uploaded">Uploaded Resume</option>
                  <option value="not uploaded">No Resume</option>
                </select>
              </div>

              {/* Applications Filter */}
              <div className="lg:col-span-2">
                <select
                  value={appFilter}
                  onChange={(e) => { setAppFilter(e.target.value); setPage(1); }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Apps: All</option>
                  <option value="has_apps">Has Applications</option>
                  <option value="no_apps">No Applications</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="lg:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="name">Sort: Name</option>
                  <option value="readiness">Sort: Career Score</option>
                  <option value="applications">Sort: App Count</option>
                </select>
              </div>

              {/* Limit */}
              <div className="lg:col-span-2">
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>

            </div>

          </div>

          {/* Students Table */}
          <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden glow-border">
            
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">Loading student records...</p>
              </div>
            ) : data?.users && data.users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">College & Degree</th>
                      <th className="p-3.5">Skills</th>
                      <th className="p-3.5">Resume</th>
                      <th className="p-3.5">Apps</th>
                      <th className="p-3.5">Readiness</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {data.users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                        
                        {/* Name */}
                        <td className="p-3.5 font-bold text-white">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate">{u.name}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="p-3.5 font-mono text-slate-400 text-[11px] truncate max-w-[180px]">
                          {u.email}
                        </td>

                        {/* College & Degree */}
                        <td className="p-3.5 text-slate-300 truncate max-w-[200px]">
                          <div>{u.college || 'N/A'}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{u.degree || 'Degree N/A'}</div>
                        </td>

                        {/* Skills Count */}
                        <td className="p-3.5 font-bold text-indigo-300 font-mono">
                          {u.skills_count} Skills
                        </td>

                        {/* Resume Status */}
                        <td className="p-3.5">
                          {u.has_resume ? (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                              Uploaded {u.ats_score ? `(${u.ats_score}%)` : ''}
                            </span>
                          ) : (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-500 font-mono">
                              None
                            </span>
                          )}
                        </td>

                        {/* Applications Count */}
                        <td className="p-3.5 font-bold text-purple-300 font-mono">
                          {u.applications_count}
                        </td>

                        {/* Career Readiness */}
                        <td className="p-3.5">
                          <span className="text-xs font-extrabold text-indigo-300 font-mono">
                            {u.career_readiness_score}%
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            u.status === 'Disabled'
                              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          }`}>
                            {u.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => handleViewUser(u.id)}
                            disabled={loadingUserDetail}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => handleStatusToggle(u.id, u.status)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-colors inline-flex items-center ${
                              u.status === 'Disabled'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                            }`}
                            title={u.status === 'Disabled' ? 'Enable Account' : 'Disable Account'}
                          >
                            {u.status === 'Disabled' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center space-y-3">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-white">No students registered yet.</p>
                <p className="text-[11px] text-slate-500">Students registering on CampusMate AI will automatically appear here.</p>
              </div>
            )}

            {/* Pagination Controls Footer */}
            {data && data.total_pages > 1 && (
              <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                
                <span className="text-slate-400 text-[11px]">
                  Showing <strong>{(data.page - 1) * data.limit + 1}</strong> – <strong>{Math.min(data.page * data.limit, data.total_users)}</strong> of <strong>{data.total_users}</strong> Students
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl disabled:opacity-40 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="px-3 py-1 font-bold text-white bg-slate-900 border border-slate-800 rounded-xl text-xs">
                    Page {data.page} of {data.total_pages}
                  </span>

                  <button
                    onClick={() => setPage(Math.min(data.total_pages, page + 1))}
                    disabled={page >= data.total_pages}
                    className="p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl disabled:opacity-40 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

          </div>

        </main>

        {/* User Detail Modal */}
        {selectedUserDetail && (
          <AdminUserDetailModal
            user={selectedUserDetail}
            onClose={() => setSelectedUserDetail(null)}
            onStatusToggle={handleStatusToggle}
          />
        )}

      </div>
    </div>
  );
};
