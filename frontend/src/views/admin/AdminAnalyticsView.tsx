import React, { useEffect, useState } from 'react';
import { 
  BarChart2, 
  RefreshCw, 
  Download, 
  AlertCircle, 
  Users, 
  Briefcase, 
  FileText, 
  Kanban, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ChevronRight 
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { 
  fetchAdminAnalyticsOverview, 
  fetchAdminAnalyticsStudents, 
  fetchAdminAnalyticsJobs, 
  fetchAdminAnalyticsApplications, 
  fetchAdminAnalyticsResumes, 
  fetchAdminAnalyticsInterviews, 
  fetchAdminAnalyticsReadiness, 
  fetchAdminAnalyticsInsights 
} from '../../services/adminAuthService';
import type { AdminUser } from '../../services/adminAuthService';
import { getErrorMessage } from '../../services/api';

interface AdminAnalyticsViewProps {
  admin: AdminUser;
  onLogout: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({ admin, onLogout, onNavigateTab }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Analytics Data States
  const [overview, setOverview] = useState<any>(null);
  const [studentAnalytics, setStudentAnalytics] = useState<any>(null);
  const [jobAnalytics, setJobAnalytics] = useState<any>(null);
  const [appAnalytics, setAppAnalytics] = useState<any>(null);
  const [resumeAnalytics, setResumeAnalytics] = useState<any>(null);
  const [interviewAnalytics, setInterviewAnalytics] = useState<any>(null);
  const [readinessAnalytics, setReadinessAnalytics] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);

  const loadAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        ovRes,
        studRes,
        jobRes,
        appRes,
        resRes,
        intRes,
        readRes,
        insRes
      ] = await Promise.all([
        fetchAdminAnalyticsOverview(timeRange),
        fetchAdminAnalyticsStudents(timeRange),
        fetchAdminAnalyticsJobs(timeRange),
        fetchAdminAnalyticsApplications(timeRange),
        fetchAdminAnalyticsResumes(timeRange),
        fetchAdminAnalyticsInterviews(timeRange),
        fetchAdminAnalyticsReadiness(timeRange),
        fetchAdminAnalyticsInsights(timeRange)
      ]);

      setOverview(ovRes);
      setStudentAnalytics(studRes);
      setJobAnalytics(jobRes);
      setAppAnalytics(appRes);
      setResumeAnalytics(resRes);
      setInterviewAnalytics(intRes);
      setReadinessAnalytics(readRes);
      setInsights(insRes);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Unable to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalytics();
  }, [timeRange]);

  const handleExportReport = () => {
    if (!overview) return;
    const reportData = {
      exported_at: new Date().toISOString(),
      time_range: timeRange,
      overview,
      student_analytics: studentAnalytics,
      job_analytics: jobAnalytics,
      application_analytics: appAnalytics,
      resume_analytics: resumeAnalytics,
      interview_analytics: interviewAnalytics,
      career_readiness: readinessAnalytics,
      insights
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `campusmate_analytics_report_${timeRange}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar */}
      <AdminSidebar
        admin={admin}
        activeTab="analytics"
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

        {/* Analytics Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Title Banner */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 glow-border">
            <div>
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Executive Platform Intelligence</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Analytics & Reports
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time metrics for student registrations, job postings, application funnels, ATS resumes, and mock interviews.
              </p>
            </div>

            {/* Time Range Filter & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Time Range: All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="12m">Last 12 Months</option>
              </select>

              <button
                onClick={loadAllAnalytics}
                disabled={loading}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleExportReport}
                disabled={loading || !overview}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-colors flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Report</span>
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
                onClick={loadAllAnalytics}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 rounded-xl font-bold transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* 9 Executive Overview Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
            
            <div className="glass-card rounded-2xl p-3.5 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Students</span>
              <p className="text-xl font-black text-white">{overview?.total_students ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-3.5 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">With Resume</span>
              <p className="text-xl font-black text-teal-300">{overview?.students_with_resume_count ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-3.5 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">With Apps</span>
              <p className="text-xl font-black text-indigo-300">{overview?.students_with_applications_count ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-3.5 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Total Jobs</span>
              <p className="text-xl font-black text-purple-300">{overview?.total_jobs ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-3.5 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Active Apps</span>
              <p className="text-xl font-black text-cyan-300">{overview?.active_applications ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-3.5 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Interviews</span>
              <p className="text-xl font-black text-rose-300">{overview?.completed_interviews ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-3.5 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Avg ATS</span>
              <p className="text-xl font-black text-emerald-300 font-mono">
                {overview?.average_ats_score ? `${overview.average_ats_score}%` : '0%'}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-3.5 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Avg Interview</span>
              <p className="text-xl font-black text-amber-300 font-mono">
                {overview?.average_interview_score ? `${overview.average_interview_score}%` : '0%'}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-3.5 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider block">Readiness</span>
              <p className="text-xl font-black text-yellow-300 font-mono">
                {overview?.average_career_readiness_score ? `${overview.average_career_readiness_score}%` : '0%'}
              </p>
            </div>

          </div>

          {/* Platform Insights Cards */}
          {insights && insights.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Grounded Platform Insights</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {insights.map((ins, idx) => (
                  <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                    <div className="flex items-center space-x-2">
                      {ins.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-400" /> :
                       ins.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
                       <Info className="w-4 h-4 text-indigo-400" />}
                      <h4 className="text-xs font-bold text-white">{ins.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed pl-6">{ins.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Student Analytics */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Student Candidates Breakdown</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase block">College Distribution</span>
                  <div className="mt-2 space-y-1">
                    {studentAnalytics?.college_distribution && studentAnalytics.college_distribution.length > 0 ? (
                      studentAnalytics.college_distribution.slice(0, 3).map((c: any) => (
                        <div key={c.college} className="flex justify-between text-[11px]">
                          <span className="text-slate-300 truncate max-w-[120px]">{c.college}</span>
                          <span className="font-bold text-white">{c.count} ({c.percentage}%)</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500">No data</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase block">Top Verified Skills</span>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {studentAnalytics?.top_skills && studentAnalytics.top_skills.length > 0 ? (
                      studentAnalytics.top_skills.slice(0, 5).map((s: any) => (
                        <span key={s.skill} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded font-mono text-[10px]">
                          {s.skill} ({s.count})
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500">No data</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Job Marketplace Analytics */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-purple-400" />
                <span>Job Marketplace Analytics</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase block">Top Hiring Companies</span>
                  <div className="mt-2 space-y-1">
                    {jobAnalytics?.jobs_by_company && jobAnalytics.jobs_by_company.length > 0 ? (
                      jobAnalytics.jobs_by_company.slice(0, 3).map((c: any) => (
                        <div key={c.company} className="flex justify-between text-[11px]">
                          <span className="text-slate-300 truncate max-w-[120px]">{c.company}</span>
                          <span className="font-bold text-white">{c.count} roles</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500">No data</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase block">Frequently Required Skills</span>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {jobAnalytics?.frequent_required_skills && jobAnalytics.frequent_required_skills.length > 0 ? (
                      jobAnalytics.frequent_required_skills.slice(0, 5).map((s: any) => (
                        <span key={s.skill} className="px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded font-mono text-[10px]">
                          {s.skill} ({s.count})
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500">No data</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Application Funnel Analytics */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <Kanban className="w-4 h-4 text-cyan-400" />
                <span>Application Conversion Funnel</span>
              </h3>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Applied</span>
                  <p className="text-lg font-black text-white">{appAnalytics?.funnel?.applied ?? 0}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <div className="text-center">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Interviewing</span>
                  <p className="text-lg font-black text-amber-300">{appAnalytics?.funnel?.interviewing ?? 0}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <div className="text-center">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Offered</span>
                  <p className="text-lg font-black text-emerald-300">{appAnalytics?.funnel?.offered ?? 0}</p>
                </div>
              </div>
            </div>

            {/* 4. Resume / ATS Analytics */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <span>Resume ATS Tier Breakdown</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase block">ATS Score Tiers</span>
                  <div className="mt-2 space-y-1">
                    {resumeAnalytics?.score_distribution && resumeAnalytics.score_distribution.length > 0 ? (
                      resumeAnalytics.score_distribution.map((d: any) => (
                        <div key={d.category} className="flex justify-between text-[11px]">
                          <span className="text-slate-300">{d.label}</span>
                          <span className="font-bold text-white">{d.count}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500">No data</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase block">Common Missing Keywords</span>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {resumeAnalytics?.common_missing_keywords && resumeAnalytics.common_missing_keywords.length > 0 ? (
                      resumeAnalytics.common_missing_keywords.slice(0, 5).map((k: any) => (
                        <span key={k.keyword} className="px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded font-mono text-[10px]">
                          {k.keyword} ({k.count})
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500">No data</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </main>

      </div>
    </div>
  );
};
