import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Sparkles, 
  Code, 
  BarChart2
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { 
  fetchAdminResumesList, 
  fetchAdminResumeDetail 
} from '../../services/adminAuthService';
import type { 
  AdminUser, 
  AdminResumesListResponse, 
  AdminResumeDetailResponse 
} from '../../services/adminAuthService';
import { getErrorMessage } from '../../services/api';

interface AdminResumesViewProps {
  admin: AdminUser;
  onLogout: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminResumesView: React.FC<AdminResumesViewProps> = ({ admin, onLogout, onNavigateTab }) => {
  const [data, setData] = useState<AdminResumesListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [atsFilter, setAtsFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Resume Detail Modal State
  const [selectedResumeDetail, setSelectedResumeDetail] = useState<AdminResumeDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const loadResumesList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminResumesList({
        q: searchQuery,
        ats_filter: atsFilter,
        sort_by: sortBy,
        page,
        limit
      });
      setData(res);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Unable to load resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumesList();
  }, [searchQuery, atsFilter, sortBy, page, limit]);

  const handleViewDetail = async (resumeId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await fetchAdminResumeDetail(resumeId);
      setSelectedResumeDetail(detail);
    } catch (err: any) {
      alert(getErrorMessage(err) || 'Resume details could not be loaded.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const getAtsBadgeClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    if (score >= 65) return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    if (score >= 50) return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar */}
      <AdminSidebar
        admin={admin}
        activeTab="resumes"
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

        {/* Resumes Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Title Banner */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 glow-border">
            <div>
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Resume & ATS Analytics Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Resume & ATS Analytics
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Monitor student resume uploads, ATS score distributions, section checks, and skill taxonomies across campus.
              </p>
            </div>

            <button
              onClick={loadResumesList}
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
                onClick={loadResumesList}
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
                <span className="text-xs font-semibold text-slate-400">Total Resumes</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {data?.total_resumes ?? 0}
              </p>
              <p className="text-[10px] text-slate-500">Parsed PDF Resumes</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Average ATS Score</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">
                {data?.total_resumes && data.total_resumes > 0 ? `${data.average_ats_score}%` : 'No data yet'}
              </p>
              <p className="text-[10px] text-slate-500">Overall ATS Metric</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Excellent Resumes</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                {data?.excellent_count ?? 0}
              </p>
              <p className="text-[10px] text-slate-500">ATS Score 80–100</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Needs Improvement</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-300">
                {data?.needs_improvement_count ?? 0}
              </p>
              <p className="text-[10px] text-slate-500">ATS Score &lt;65</p>
            </div>

          </div>

          {/* ATS Performance & Analytics Visual Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ATS Score Distribution Bar */}
            <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                    <BarChart2 className="w-4 h-4 text-indigo-400" />
                    <span>ATS Score Distribution</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time candidate score breakdown from MongoDB parsed resumes.</p>
                </div>
              </div>

              {data?.total_resumes && data.total_resumes > 0 ? (
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
                            dist.category === '80-100' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                            dist.category === '65-79' ? 'bg-gradient-to-r from-blue-500 to-indigo-400' :
                            dist.category === '50-64' ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
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
                  No ATS data available yet.
                </div>
              )}
            </div>

            {/* Top Extracted Skills Analytics */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <Code className="w-4 h-4 text-purple-400" />
                <span>Most Common Skills</span>
              </h3>
              <p className="text-xs text-slate-400">Top technical skills extracted across all candidate resumes.</p>

              {data?.most_common_skills && data.most_common_skills.length > 0 ? (
                <div className="space-y-2 pt-1 max-h-56 overflow-y-auto">
                  {data.most_common_skills.map((sk) => (
                    <div key={sk.skill} className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
                      <span className="font-semibold text-slate-200">{sk.skill}</span>
                      <span className="font-mono text-purple-300 font-bold px-2 py-0.5 bg-purple-500/10 rounded-md border border-purple-500/20">
                        {sk.count} {sk.count === 1 ? 'resume' : 'resumes'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500 font-semibold">
                  No data available.
                </div>
              )}
            </div>

          </div>

          {/* Controls Bar: Search & Filters */}
          <div className="glass-card rounded-3xl p-4 sm:p-6 border border-slate-800 space-y-4 glow-border">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              
              {/* Search Box */}
              <div className="lg:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Search resumes by student name, email, college, degree..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* ATS Filter */}
              <div className="lg:col-span-3">
                <select
                  value={atsFilter}
                  onChange={(e) => { setAtsFilter(e.target.value); setPage(1); }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">ATS Rating: All</option>
                  <option value="excellent">Excellent (80–100)</option>
                  <option value="strong">Strong (65–79)</option>
                  <option value="needs_improvement">Needs Improvement (50–64)</option>
                  <option value="critical">Critical (0–49)</option>
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
                  <option value="ats_high">Sort: Highest ATS</option>
                  <option value="ats_low">Sort: Lowest ATS</option>
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

          {/* Resumes Table */}
          <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden glow-border">
            
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">Loading student resumes...</p>
              </div>
            ) : data?.resumes && data.resumes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Student Candidate</th>
                      <th className="p-3.5">College & Degree</th>
                      <th className="p-3.5">ATS Score & Rating</th>
                      <th className="p-3.5">Skills Extracted</th>
                      <th className="p-3.5">Upload Date</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {data.resumes.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                        
                        {/* Student */}
                        <td className="p-3.5 font-bold text-white max-w-[200px]">
                          <div className="truncate">{r.student_name}</div>
                          <div className="text-[10px] font-mono text-slate-400 font-normal truncate">{r.student_email}</div>
                        </td>

                        {/* College & Degree */}
                        <td className="p-3.5 text-slate-300 max-w-[200px]">
                          <div className="font-bold text-slate-200 truncate">{r.student_college || 'University N/A'}</div>
                          <div className="text-[10px] text-slate-500 font-normal truncate">{r.student_degree || 'Degree N/A'}</div>
                        </td>

                        {/* ATS Score & Rating */}
                        <td className="p-3.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-sm font-mono text-white">{r.ats_score}%</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getAtsBadgeClass(r.ats_score)}`}>
                              {r.ats_rating}
                            </span>
                          </div>
                        </td>

                        {/* Skills Count */}
                        <td className="p-3.5 font-bold text-purple-300 font-mono">
                          {r.skills_count} Skills
                        </td>

                        {/* Upload Date */}
                        <td className="p-3.5 text-[11px] text-slate-500 font-mono">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleViewDetail(r.id)}
                            disabled={loadingDetail}
                            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ATS Detail</span>
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center space-y-3">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-white">No resumes found.</p>
                <p className="text-[11px] text-slate-500">Resumes uploaded by students will automatically appear here once parsed.</p>
              </div>
            )}

            {/* Pagination Controls */}
            {data && data.total_pages > 1 && (
              <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                
                <span className="text-slate-400 text-[11px]">
                  Showing <strong>{(data.page - 1) * data.limit + 1}</strong> – <strong>{Math.min(data.page * data.limit, data.total_resumes)}</strong> of <strong>{data.total_resumes}</strong> Resumes
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

        {/* View Resume ATS Detail Modal */}
        {selectedResumeDetail && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass-card max-w-3xl w-full rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative space-y-6 glow-border my-auto max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Parsed Resume & ATS Breakdown</h3>
                    <p className="text-xs text-slate-400">ID: {selectedResumeDetail.id}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedResumeDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student Header */}
              <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-extrabold text-white">{selectedResumeDetail.student_name}</h4>
                  <p className="text-xs text-slate-400 font-mono">{selectedResumeDetail.student_email}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedResumeDetail.student_college || 'University N/A'} • {selectedResumeDetail.student_degree || 'Degree N/A'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall ATS Score</span>
                  <div className="text-3xl font-black text-indigo-400 font-mono">
                    {selectedResumeDetail.ats_score}%
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border inline-block mt-1 ${getAtsBadgeClass(selectedResumeDetail.ats_score)}`}>
                    {selectedResumeDetail.ats_rating}
                  </span>
                </div>
              </div>

              {/* ATS Section Checks */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Section Completeness Checks</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedResumeDetail.section_checks.map((sc, idx) => (
                    <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start space-x-2.5 text-xs">
                      {sc.present ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold text-white block">{sc.name}</span>
                        <span className="text-[11px] text-slate-400 block">{sc.feedback}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Skills Categorized */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <Code className="w-4 h-4 text-purple-400" />
                  <span>Extracted Technical Skills</span>
                </h4>
                {Object.keys(selectedResumeDetail.skill_categories).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(selectedResumeDetail.skill_categories).map(([cat, skills]) => (
                      <div key={cat} className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-indigo-400 block">{cat}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((sk, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-purple-300 rounded-xl text-xs font-semibold">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-500 text-center">
                    No categorized skills extracted.
                  </div>
                )}
              </div>

              {/* Missing Recommended Keywords */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Missing Recommended Keywords</span>
                </h4>
                {selectedResumeDetail.missing_keywords && selectedResumeDetail.missing_keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedResumeDetail.missing_keywords.map((kw, idx) => (
                      <span key={idx} className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold">
                        + {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-emerald-400 font-semibold">
                    No major keyword gaps detected.
                  </div>
                )}
              </div>

              {/* ATS Improvement Suggestions */}
              {selectedResumeDetail.suggestions && selectedResumeDetail.suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ATS Improvement Suggestions</h4>
                  <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-300">
                    {selectedResumeDetail.suggestions.map((sug, idx) => (
                      <li key={idx}>{sug}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
