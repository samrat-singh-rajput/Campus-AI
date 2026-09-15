import React, { useEffect, useState } from 'react';
import { 
  Kanban, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  User,
  X
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { 
  fetchAdminApplicationsList, 
  fetchAdminApplicationDetail, 
  updateAdminApplicationStatus 
} from '../../services/adminAuthService';
import type { 
  AdminUser, 
  AdminApplicationsListResponse, 
  AdminApplicationDetailResponse 
} from '../../services/adminAuthService';
import { getErrorMessage } from '../../services/api';

interface AdminApplicationsViewProps {
  admin: AdminUser;
  onLogout: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminApplicationsView: React.FC<AdminApplicationsViewProps> = ({ admin, onLogout, onNavigateTab }) => {
  const [data, setData] = useState<AdminApplicationsListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [matchFilter, setMatchFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Detail Modal & Status Updating State
  const [selectedAppDetail, setSelectedAppDetail] = useState<AdminApplicationDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [updatingStatusAppId, setUpdatingStatusAppId] = useState<string | null>(null);

  const loadApplicationsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminApplicationsList({
        q: searchQuery,
        status_filter: statusFilter,
        match_filter: matchFilter,
        sort_by: sortBy,
        page,
        limit
      });
      setData(res);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Unable to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicationsList();
  }, [searchQuery, statusFilter, matchFilter, sortBy, page, limit]);

  const handleViewDetail = async (appId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await fetchAdminApplicationDetail(appId);
      setSelectedAppDetail(detail);
    } catch (err: any) {
      alert(getErrorMessage(err) || 'Failed to load application detail.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setUpdatingStatusAppId(appId);
    try {
      await updateAdminApplicationStatus(appId, newStatus);
      if (selectedAppDetail && selectedAppDetail.id === appId) {
        setSelectedAppDetail({ ...selectedAppDetail, status: newStatus });
      }
      await loadApplicationsList();
    } catch (err: any) {
      alert(getErrorMessage(err) || 'Application status could not be updated.');
    } finally {
      setUpdatingStatusAppId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar */}
      <AdminSidebar
        admin={admin}
        activeTab="applications"
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

        {/* Applications Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Title Banner */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 glow-border">
            <div>
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Kanban className="w-3.5 h-3.5" />
                <span>Campus Placement Pipeline</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Applications Management
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage, review, and advance candidate student job applications across placement workflow stages.
              </p>
            </div>

            <button
              onClick={loadApplicationsList}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-colors flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Applications</span>
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
                onClick={loadApplicationsList}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 rounded-xl font-bold transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* 5 Summary Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 glow-border text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Applications</span>
              <p className="text-xl sm:text-2xl font-black text-white">{data?.total_applications ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 glow-border text-center">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Applied</span>
              <p className="text-xl sm:text-2xl font-black text-indigo-300">{data?.applied_count ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 glow-border text-center">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Interviewing</span>
              <p className="text-xl sm:text-2xl font-black text-purple-300">{data?.interviewing_count ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 glow-border text-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Offered</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-300">{data?.offered_count ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 glow-border text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Saved</span>
              <p className="text-xl sm:text-2xl font-black text-amber-300">{data?.saved_count ?? 0}</p>
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
                  placeholder="Search by student name, email, job title, company..."
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
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offered">Offered</option>
                  <option value="Saved">Saved</option>
                </select>
              </div>

              {/* Match Score Filter */}
              <div className="lg:col-span-2">
                <select
                  value={matchFilter}
                  onChange={(e) => { setMatchFilter(e.target.value); setPage(1); }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Match: All</option>
                  <option value="high">High Match (≥75%)</option>
                  <option value="moderate">Moderate (50-74%)</option>
                  <option value="low">Low Match (&lt;50%)</option>
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
                  <option value="oldest">Sort: Oldest</option>
                  <option value="match_score">Sort: Match Score</option>
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

          {/* Applications Table */}
          <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden glow-border">
            
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">Loading student applications...</p>
              </div>
            ) : data?.applications && data.applications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Candidate Student</th>
                      <th className="p-3.5">Job Title & Company</th>
                      <th className="p-3.5">Dual Match Fit</th>
                      <th className="p-3.5">Stage Status</th>
                      <th className="p-3.5">Applied Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {data.applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-900/40 transition-colors">
                        
                        {/* Student */}
                        <td className="p-3.5 font-bold text-white max-w-[200px]">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                              {app.student_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <span className="truncate block">{app.student_name}</span>
                              <span className="text-[10px] font-mono text-slate-400 font-normal truncate block">{app.student_email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Job & Company */}
                        <td className="p-3.5 text-slate-300 max-w-[200px]">
                          <div className="font-bold text-slate-200 truncate">{app.job_title}</div>
                          <div className="text-[10px] text-slate-500 font-normal truncate">{app.company}</div>
                        </td>

                        {/* Match Score */}
                        <td className="p-3.5 font-black text-emerald-400 font-mono text-sm">
                          {app.combined_match_score}%
                        </td>

                        {/* Status Dropdown */}
                        <td className="p-3.5">
                          <select
                            value={app.status}
                            disabled={updatingStatusAppId === app.id}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Offered">Offered</option>
                            <option value="Saved">Saved</option>
                          </select>
                        </td>

                        {/* Applied Date */}
                        <td className="p-3.5 text-[11px] text-slate-500 font-mono">
                          {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent'}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleViewDetail(app.id)}
                            disabled={loadingDetail}
                            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center space-y-3">
                <Kanban className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-white">No applications yet.</p>
                <p className="text-[11px] text-slate-500">Student applications submitted on CampusMate AI will automatically appear here.</p>
              </div>
            )}

            {/* Pagination Controls */}
            {data && data.total_pages > 1 && (
              <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                
                <span className="text-slate-400 text-[11px]">
                  Showing <strong>{(data.page - 1) * data.limit + 1}</strong> – <strong>{Math.min(data.page * data.limit, data.total_applications)}</strong> of <strong>{data.total_applications}</strong> Applications
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

        {/* View Application Detail Modal */}
        {selectedAppDetail && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass-card max-w-3xl w-full rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative space-y-6 glow-border my-auto max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                    <Kanban className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Application Record</h3>
                    <p className="text-xs text-slate-400">ID: {selectedAppDetail.id}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAppDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dual Match Breakdown Header */}
              <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Dual Engine Recommendation Fit</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                    {selectedAppDetail.combined_match_score}% Combined Score
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Random Forest ML</span>
                    <span className="font-bold text-indigo-300">{selectedAppDetail.ml_eligibility_score}%</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">ChromaDB Vector Search</span>
                    <span className="font-bold text-purple-300">{selectedAppDetail.vector_similarity_score}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Candidate Student Card */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>Candidate Student</span>
                  </h4>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-white">{selectedAppDetail.student?.name}</p>
                    <p className="text-slate-400 font-mono">{selectedAppDetail.student?.email}</p>
                    <p className="text-slate-400">{selectedAppDetail.student?.college || 'University N/A'}</p>
                    <p className="text-slate-400">{selectedAppDetail.student?.degree || 'Degree N/A'}</p>
                  </div>
                </div>

                {/* Job Position Card */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <span>Job Position</span>
                  </h4>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-white">{selectedAppDetail.job?.title}</p>
                    <p className="text-slate-400 font-semibold">{selectedAppDetail.job?.company}</p>
                    <p className="text-slate-400">{selectedAppDetail.job?.location}</p>
                    <p className="text-slate-400">{selectedAppDetail.job?.job_type || 'Full-time'}</p>
                  </div>
                </div>

              </div>

              {/* Status Selector */}
              <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Current Application Stage</h4>
                  <p className="text-[11px] text-slate-400">Updating status here immediately syncs with the student's Application Kanban board.</p>
                </div>

                <select
                  value={selectedAppDetail.status}
                  onChange={(e) => handleStatusChange(selectedAppDetail.id, e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offered">Offered</option>
                  <option value="Saved">Saved</option>
                </select>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
