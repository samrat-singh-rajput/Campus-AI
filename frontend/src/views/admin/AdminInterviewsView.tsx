import React, { useEffect, useState } from 'react';
import { 
  Mic, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  BarChart2, 
  Target, 
  HelpCircle
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { 
  fetchAdminInterviewsList, 
  fetchAdminInterviewDetail 
} from '../../services/adminAuthService';
import type { 
  AdminUser, 
  AdminInterviewsListResponse, 
  AdminInterviewDetailResponse 
} from '../../services/adminAuthService';
import { getErrorMessage } from '../../services/api';

interface AdminInterviewsViewProps {
  admin: AdminUser;
  onLogout: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminInterviewsView: React.FC<AdminInterviewsViewProps> = ({ admin, onLogout, onNavigateTab }) => {
  const [data, setData] = useState<AdminInterviewsListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Detail Modal State
  const [selectedInterviewDetail, setSelectedInterviewDetail] = useState<AdminInterviewDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const loadInterviewsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminInterviewsList({
        q: searchQuery,
        status_filter: statusFilter,
        domain_filter: domainFilter,
        rating_filter: ratingFilter,
        sort_by: sortBy,
        page,
        limit
      });
      setData(res);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Unable to load interview sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviewsList();
  }, [searchQuery, statusFilter, domainFilter, ratingFilter, sortBy, page, limit]);

  const handleViewDetail = async (sessionId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await fetchAdminInterviewDetail(sessionId);
      setSelectedInterviewDetail(detail);
    } catch (err: any) {
      alert(getErrorMessage(err) || 'Interview details could not be loaded.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const getRatingBadgeClass = (rating: string) => {
    const r = rating.toLowerCase();
    if (r.includes('master')) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    if (r.includes('proficient')) return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    if (r.includes('develop')) return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar */}
      <AdminSidebar
        admin={admin}
        activeTab="interviews"
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

        {/* Interviews Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Title Banner */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 glow-border">
            <div>
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Mic className="w-3.5 h-3.5" />
                <span>AI Mock Interview Coach Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Interview & AI Analytics
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Monitor candidate mock interview sessions, evaluation scores, domain mastery, and detailed question scorecards.
              </p>
            </div>

            <button
              onClick={loadInterviewsList}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-colors flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Analytics</span>
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
                onClick={loadInterviewsList}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 rounded-xl font-bold transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* 6 Summary Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 glow-border text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Sessions</span>
              <p className="text-xl sm:text-2xl font-black text-white">{data?.total_interviews ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 glow-border text-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Completed</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-300">{data?.completed_interviews ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 glow-border text-center">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Avg Score</span>
              <p className="text-xl sm:text-2xl font-black text-indigo-300 font-mono">
                {data?.completed_interviews && data.completed_interviews > 0 ? `${data.average_score}%` : 'No data'}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 glow-border text-center">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Candidates</span>
              <p className="text-xl sm:text-2xl font-black text-purple-300">{data?.unique_candidates_count ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 glow-border text-center">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">Highest Score</span>
              <p className="text-xl sm:text-2xl font-black text-teal-300 font-mono">
                {data?.completed_interviews && data.completed_interviews > 0 ? `${data.highest_score}%` : '0%'}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 glow-border text-center">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Lowest Score</span>
              <p className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                {data?.completed_interviews && data.completed_interviews > 0 ? `${data.lowest_score}%` : '0%'}
              </p>
            </div>

          </div>

          {/* AI Analytics Visual Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Score Distribution */}
            <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <span>AI Rating Distribution</span>
              </h3>
              <p className="text-xs text-slate-400">Candidate mastery breakdown evaluated by the AI Mock Interview Coach.</p>

              {data?.completed_interviews && data.completed_interviews > 0 ? (
                <div className="space-y-4 pt-2">
                  {data.score_distribution.map((dist) => (
                    <div key={dist.category} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{dist.label}</span>
                        <span className="font-mono text-indigo-300">
                          {dist.count} ({dist.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            dist.category === '85-100' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                            dist.category === '70-84' ? 'bg-gradient-to-r from-blue-500 to-indigo-400' :
                            dist.category === '50-69' ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                            'bg-gradient-to-r from-rose-500 to-pink-500'
                          }`}
                          style={{ width: `${Math.max(4, dist.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-slate-500 font-semibold">
                  No interview score data available yet.
                </div>
              )}
            </div>

            {/* Domain Performance */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span>Domain Averages</span>
              </h3>
              <p className="text-xs text-slate-400">Average candidate performance by technical track.</p>

              {data?.domain_analytics && data.domain_analytics.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {data.domain_analytics.map((dom) => (
                    <div key={dom.domain} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white truncate max-w-[170px]">{dom.domain}</span>
                        <span className="font-black text-indigo-400 font-mono">{dom.average_score}%</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">{dom.sessions_count} sessions completed</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500 font-semibold">
                  No domain metrics available yet.
                </div>
              )}
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
                  placeholder="Search by student name, email, domain, session ID..."
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
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>

              {/* Domain Filter */}
              <div className="lg:col-span-2">
                <select
                  value={domainFilter}
                  onChange={(e) => { setDomainFilter(e.target.value); setPage(1); }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Domain: All</option>
                  <option value="Full Stack Engineering">Full Stack</option>
                  <option value="AI & Machine Learning">AI & ML</option>
                  <option value="Backend Engineering">Backend</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div className="lg:col-span-2">
                <select
                  value={ratingFilter}
                  onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Rating: All</option>
                  <option value="Mastered">Mastered (85+)</option>
                  <option value="Proficient">Proficient (70+)</option>
                  <option value="Developing">Developing (&lt;70)</option>
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
                  <option value="score_high">Sort: Highest Score</option>
                  <option value="score_low">Sort: Lowest Score</option>
                  <option value="name">Sort: Student Name</option>
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

          {/* Interviews Table */}
          <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden glow-border">
            
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">Loading mock interview sessions...</p>
              </div>
            ) : data?.interviews && data.interviews.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Candidate Student</th>
                      <th className="p-3.5">Interview Domain</th>
                      <th className="p-3.5">Difficulty</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">AI Score & Rating</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {data.interviews.map((item) => (
                      <tr key={item.session_id} className="hover:bg-slate-900/40 transition-colors">
                        
                        {/* Student */}
                        <td className="p-3.5 font-bold text-white max-w-[200px]">
                          <div className="truncate">{item.student_name}</div>
                          <div className="text-[10px] font-mono text-slate-400 font-normal truncate">{item.student_email}</div>
                        </td>

                        {/* Domain */}
                        <td className="p-3.5 text-slate-200 font-semibold max-w-[180px] truncate">
                          {item.domain}
                        </td>

                        {/* Difficulty */}
                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                          {item.difficulty}
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                            item.status === 'Completed'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          }`}>
                            {item.status}
                          </span>
                        </td>

                        {/* Score & Rating */}
                        <td className="p-3.5">
                          {item.status === 'Completed' ? (
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-sm font-mono text-white">{item.average_score}%</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getRatingBadgeClass(item.overall_rating)}`}>
                                {item.overall_rating}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">In Progress</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="p-3.5 text-[11px] text-slate-500 font-mono">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleViewDetail(item.session_id)}
                            disabled={loadingDetail}
                            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Scorecard</span>
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center space-y-3">
                <Mic className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-white">No interview sessions found.</p>
                <p className="text-[11px] text-slate-500">Mock interview sessions completed by students will automatically appear here.</p>
              </div>
            )}

            {/* Pagination Controls */}
            {data && data.total_pages > 1 && (
              <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                
                <span className="text-slate-400 text-[11px]">
                  Showing <strong>{(data.page - 1) * data.limit + 1}</strong> – <strong>{Math.min(data.page * data.limit, data.total_interviews)}</strong> of <strong>{data.total_interviews}</strong> Sessions
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

        {/* View Interview Scorecard Detail Modal */}
        {selectedInterviewDetail && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass-card max-w-3xl w-full rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative space-y-6 glow-border my-auto max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Interview Session Scorecard</h3>
                    <p className="text-xs text-slate-400">Session ID: {selectedInterviewDetail.session_id}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedInterviewDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student Header */}
              <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-extrabold text-white">{selectedInterviewDetail.student_name}</h4>
                  <p className="text-xs text-slate-400 font-mono">{selectedInterviewDetail.student_email}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Domain: <strong className="text-indigo-300">{selectedInterviewDetail.domain}</strong> • Difficulty: <strong>{selectedInterviewDetail.difficulty}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall AI Score</span>
                  <div className="text-3xl font-black text-indigo-400 font-mono">
                    {selectedInterviewDetail.average_score}%
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border inline-block mt-1 ${getRatingBadgeClass(selectedInterviewDetail.overall_rating)}`}>
                    {selectedInterviewDetail.overall_rating}
                  </span>
                </div>
              </div>

              {/* Feedback Summary */}
              {selectedInterviewDetail.feedback_summary && (
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-slate-300 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-indigo-400 block">AI Coach Evaluation Summary</span>
                  <p>{selectedInterviewDetail.feedback_summary}</p>
                </div>
              )}

              {/* Individual Question Evaluations */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span>Question Evaluations & Candidate Answers</span>
                </h4>

                {selectedInterviewDetail.evaluations && selectedInterviewDetail.evaluations.length > 0 ? (
                  <div className="space-y-4">
                    {selectedInterviewDetail.evaluations.map((ev, idx) => (
                      <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                        
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Question {idx + 1} ({ev.category || 'Technical'})</span>
                            <p className="text-xs font-bold text-white mt-0.5">{ev.question_text || ev.question_id}</p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="font-black text-indigo-400 font-mono text-sm block">{ev.score}%</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border inline-block ${getRatingBadgeClass(ev.rating)}`}>
                              {ev.rating}
                            </span>
                          </div>
                        </div>

                        {/* Candidate Answer */}
                        {ev.candidate_answer && (
                          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1 text-xs">
                            <span className="text-[10px] font-bold text-slate-400 block">Candidate Answer</span>
                            <p className="text-slate-300 whitespace-pre-line italic">"{ev.candidate_answer}"</p>
                          </div>
                        )}

                        {/* Strengths & Missing Concepts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {ev.strengths && ev.strengths.length > 0 && (
                            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                              <span className="text-[10px] font-bold text-emerald-400 uppercase block">Strengths Detected</span>
                              <ul className="pl-3 list-disc text-emerald-200 text-[11px]">
                                {ev.strengths.map((s, sIdx) => <li key={sIdx}>{s}</li>)}
                              </ul>
                            </div>
                          )}

                          {ev.missing_concepts && ev.missing_concepts.length > 0 && (
                            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                              <span className="text-[10px] font-bold text-amber-400 uppercase block">Missing Key Concepts</span>
                              <div className="flex flex-wrap gap-1">
                                {ev.missing_concepts.map((mc, mIdx) => (
                                  <span key={mIdx} className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-mono text-[10px]">
                                    {mc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Ideal Response */}
                        {ev.ideal_sample_response && (
                          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 text-xs">
                            <span className="text-[10px] font-bold text-purple-400 uppercase block">Ideal Sample Answer</span>
                            <p className="text-slate-300 leading-relaxed text-[11px]">{ev.ideal_sample_response}</p>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-500 text-center">
                    Detailed evaluations not available for this session.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
