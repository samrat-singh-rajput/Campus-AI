import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Eye, 
  Edit3, 
  Trash2, 
  Lock, 
  Unlock, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  Users,
  Loader2
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { 
  fetchAdminJobsList, 
  createAdminJob, 
  updateAdminJob, 
  updateAdminJobStatus, 
  deleteAdminJob 
} from '../../services/adminAuthService';
import type { 
  AdminUser, 
  AdminJobsListResponse, 
  AdminJobListItem, 
  CreateJobInput, 
  UpdateJobInput 
} from '../../services/adminAuthService';
import { getErrorMessage } from '../../services/api';

interface AdminJobsViewProps {
  admin: AdminUser;
  onLogout: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminJobsView: React.FC<AdminJobsViewProps> = ({ admin, onLogout, onNavigateTab }) => {
  const [data, setData] = useState<AdminJobsListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Modals
  const [selectedJobDetail, setSelectedJobDetail] = useState<AdminJobListItem | null>(null);
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<AdminJobListItem | null>(null);
  const [submittingForm, setSubmittingForm] = useState<boolean>(false);

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [jobType, setJobType] = useState<string>('Full-time');
  const [description, setDescription] = useState<string>('');
  const [skillsInput, setSkillsInput] = useState<string>('');
  const [preferredDegree, setPreferredDegree] = useState<string>('B.S. Computer Science');
  const [salaryRange, setSalaryRange] = useState<string>('$110,000 - $140,000 / yr');
  const [jobStatus, setJobStatus] = useState<string>('Active');

  const loadJobsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminJobsList({
        q: searchQuery,
        status_filter: statusFilter,
        job_type_filter: jobTypeFilter,
        sort_by: sortBy,
        page,
        limit
      });
      setData(res);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Unable to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobsList();
  }, [searchQuery, statusFilter, jobTypeFilter, sortBy, page, limit]);

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setTitle('');
    setCompany('');
    setLocation('Remote');
    setJobType('Full-time');
    setDescription('');
    setSkillsInput('Python, FastAPI, React, TypeScript, MongoDB');
    setPreferredDegree('B.S. Computer Science');
    setSalaryRange('$110,000 - $140,000 / yr');
    setJobStatus('Active');
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (job: AdminJobListItem) => {
    setEditingJob(job);
    setTitle(job.title);
    setCompany(job.company);
    setLocation(job.location);
    setJobType(job.job_type);
    setDescription(job.description);
    setSkillsInput(job.required_skills.join(', '));
    setPreferredDegree(job.preferred_degree || 'B.S. Computer Science');
    setSalaryRange(job.salary_range || '$110,000 - $140,000 / yr');
    setJobStatus(job.status || 'Active');
    setFormModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !description.trim() || !skillsInput.trim()) {
      alert('Please fill in all mandatory fields (Title, Company, Description, and Skills).');
      return;
    }

    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    if (skills.length === 0) {
      alert('At least one required skill is mandatory.');
      return;
    }

    setSubmittingForm(true);
    try {
      if (editingJob) {
        const updatePayload: UpdateJobInput = {
          title: title.trim(),
          company: company.trim(),
          location: location.trim(),
          job_type: jobType,
          description: description.trim(),
          required_skills: skills,
          preferred_degree: preferredDegree.trim(),
          salary_range: salaryRange.trim(),
          status: jobStatus
        };
        await updateAdminJob(editingJob.id, updatePayload);
      } else {
        const createPayload: CreateJobInput = {
          title: title.trim(),
          company: company.trim(),
          location: location.trim(),
          job_type: jobType,
          description: description.trim(),
          required_skills: skills,
          preferred_degree: preferredDegree.trim(),
          salary_range: salaryRange.trim()
        };
        await createAdminJob(createPayload);
      }

      setFormModalOpen(false);
      await loadJobsList();
    } catch (err: any) {
      alert(getErrorMessage(err) || 'Unable to save job posting.');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleStatusToggle = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Closed' ? 'Active' : 'Closed';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'Closed' ? 'CLOSE' : 'REOPEN'} this placement opening?`)) {
      return;
    }

    try {
      await updateAdminJobStatus(jobId, newStatus);
      await loadJobsList();
    } catch (err: any) {
      alert(getErrorMessage(err) || 'Unable to update job status.');
    }
  };

  const handleDeleteJob = async (job: AdminJobListItem) => {
    if (job.applications_count > 0) {
      alert('This job has existing applications and cannot be deleted safely. Please close the job position instead.');
      return;
    }

    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE job "${job.title}" at "${job.company}"?`)) {
      return;
    }

    try {
      await deleteAdminJob(job.id);
      await loadJobsList();
    } catch (err: any) {
      alert(getErrorMessage(err) || 'Unable to delete job.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar */}
      <AdminSidebar
        admin={admin}
        activeTab="jobs"
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

        {/* Jobs Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Title Banner */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 glow-border">
            <div>
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Placement Postings & Positions</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Jobs Management
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Post, manage, and monitor placement openings and skill vectors across the campus platform.
              </p>
            </div>

            <div className="flex items-center space-x-3 self-start sm:self-auto">
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Job</span>
              </button>

              <button
                onClick={loadJobsList}
                disabled={loading}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-colors cursor-pointer"
                title="Refresh Jobs"
              >
                <RefreshCw className={`w-4 h-4 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between text-rose-300 text-xs">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadJobsList}
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
                <span className="text-xs font-semibold text-slate-400">Total Jobs</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {data?.total_jobs ?? 0}
              </p>
              <p className="text-[10px] text-slate-500">Placement Positions</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Active Jobs</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                {data?.active_jobs ?? 0}
              </p>
              <p className="text-[10px] text-slate-500">Open for Applications</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Closed Jobs</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-300">
                {data?.closed_jobs ?? 0}
              </p>
              <p className="text-[10px] text-slate-500">Applications Paused</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Job Applications</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-purple-300">
                {data?.total_job_applications ?? 0}
              </p>
              <p className="text-[10px] text-slate-500">Submitted Applications</p>
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
                  placeholder="Search jobs by title, company, location, skills..."
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
                  <option value="closed">Status: Closed</option>
                </select>
              </div>

              {/* Employment Type Filter */}
              <div className="lg:col-span-2">
                <select
                  value={jobTypeFilter}
                  onChange={(e) => { setJobTypeFilter(e.target.value); setPage(1); }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Type: All</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
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
                  <option value="title">Sort: Job Title</option>
                  <option value="applications">Sort: Most Applications</option>
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

          {/* Jobs Table */}
          <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden glow-border">
            
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">Loading job postings...</p>
              </div>
            ) : data?.jobs && data.jobs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Position Title</th>
                      <th className="p-3.5">Company & Location</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Required Skills</th>
                      <th className="p-3.5">Applications</th>
                      <th className="p-3.5">Created</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {data.jobs.map((j) => (
                      <tr key={j.id} className="hover:bg-slate-900/40 transition-colors">
                        
                        {/* Title */}
                        <td className="p-3.5 font-bold text-white max-w-[200px]">
                          <div className="truncate">{j.title}</div>
                          {j.salary_range && (
                            <span className="text-[10px] text-slate-400 font-mono font-normal block">{j.salary_range}</span>
                          )}
                        </td>

                        {/* Company & Location */}
                        <td className="p-3.5 text-slate-300 truncate max-w-[180px]">
                          <div className="font-bold text-slate-200">{j.company}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{j.location}</div>
                        </td>

                        {/* Employment Type */}
                        <td className="p-3.5 font-semibold text-slate-300">
                          {j.job_type}
                        </td>

                        {/* Skills Vector */}
                        <td className="p-3.5 max-w-[220px]">
                          <div className="flex flex-wrap gap-1">
                            {j.required_skills.slice(0, 3).map((sk, idx) => (
                              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-indigo-300 font-mono">
                                {sk}
                              </span>
                            ))}
                            {j.required_skills.length > 3 && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                +{j.required_skills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Applications Count */}
                        <td className="p-3.5 font-extrabold text-purple-300 font-mono">
                          {j.applications_count} Apps
                        </td>

                        {/* Created Date */}
                        <td className="p-3.5 text-[11px] text-slate-500 font-mono">
                          {j.created_at ? new Date(j.created_at).toLocaleDateString() : 'Recent'}
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            j.status === 'Closed'
                              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          }`}>
                            {j.status || 'Active'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => setSelectedJobDetail(j)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                            title="View Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(j)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-blue-400 hover:text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                            title="Edit Job"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleStatusToggle(j.id, j.status)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-colors inline-flex items-center ${
                              j.status === 'Closed'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                            }`}
                            title={j.status === 'Closed' ? 'Reopen Job' : 'Close Job'}
                          >
                            {j.status === 'Closed' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleDeleteJob(j)}
                            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-colors inline-flex items-center"
                            title="Delete Job"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center space-y-3">
                <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-white">No jobs available.</p>
                <p className="text-[11px] text-slate-500">Create a placement job opening to start accepting candidate applications.</p>
              </div>
            )}

            {/* Pagination Controls */}
            {data && data.total_pages > 1 && (
              <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                
                <span className="text-slate-400 text-[11px]">
                  Showing <strong>{(data.page - 1) * data.limit + 1}</strong> – <strong>{Math.min(data.page * data.limit, data.total_jobs)}</strong> of <strong>{data.total_jobs}</strong> Jobs
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

        {/* View Job Detail Modal */}
        {selectedJobDetail && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass-card max-w-2xl w-full rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative space-y-6 glow-border my-auto max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">{selectedJobDetail.title}</h3>
                    <p className="text-xs text-slate-400">{selectedJobDetail.company} • {selectedJobDetail.location}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedJobDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Type</span>
                  <span className="text-xs font-bold text-white">{selectedJobDetail.job_type}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-purple-400 uppercase font-bold block">Applications</span>
                  <span className="text-xs font-bold text-purple-300">{selectedJobDetail.applications_count} Submitted</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">Status</span>
                  <span className="text-xs font-bold text-emerald-300">{selectedJobDetail.status}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Salary Range</span>
                  <span className="text-xs font-bold text-slate-200">{selectedJobDetail.salary_range || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Description</label>
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedJobDetail.description}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Skills Vector</label>
                <div className="flex flex-wrap gap-2">
                  {selectedJobDetail.required_skills.map((s, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-900 border border-slate-800 text-indigo-300 rounded-xl text-xs font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Create / Edit Job Modal */}
        {formModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass-card max-w-2xl w-full rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative space-y-6 glow-border my-auto max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="text-lg font-extrabold text-white">
                  {editingJob ? 'Edit Placement Opening' : 'Create New Placement Job'}
                </h3>

                <button
                  onClick={() => setFormModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveJob} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Job Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Full Stack Engineer"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Company *</label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. TechCorp Solutions"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA (Remote)"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Employment Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Job Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe role responsibilities, team structure, architectural requirements..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Required Skills (Comma Separated) *</label>
                  <input
                    type="text"
                    required
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="e.g. Python, FastAPI, React, TypeScript, MongoDB"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Salary Range</label>
                    <input
                      type="text"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                      placeholder="e.g. $110,000 - $140,000 / yr"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {editingJob && (
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Opening Status</label>
                      <select
                        value={jobStatus}
                        onChange={(e) => setJobStatus(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Active">Active (Open)</option>
                        <option value="Closed">Closed (Paused)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFormModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl font-bold hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingForm}
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-1.5"
                  >
                    {submittingForm && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                    <span>{editingJob ? 'Save Changes' : 'Publish Job Posting'}</span>
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
