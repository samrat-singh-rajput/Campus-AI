import React, { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  Briefcase, 
  Kanban, 
  Target, 
  Mic, 
  Award, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  UserCheck,
  Building2
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { fetchAdminDashboardStats } from '../../services/adminAuthService';
import type { AdminUser, AdminDashboardData } from '../../services/adminAuthService';
import { getErrorMessage } from '../../services/api';

interface AdminDashboardViewProps {
  admin: AdminUser;
  onLogout: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ admin, onLogout, onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const statsData = await fetchAdminDashboardStats();
      setData(statsData);
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg || 'Unable to load dashboard information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar Navigation */}
      <AdminSidebar
        admin={admin}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          onNavigateTab(tab);
        }}
        onLogout={onLogout}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Header */}
        <AdminHeader
          admin={admin}
          onLogout={onLogout}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Dashboard Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Welcome Banner */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 glow-border">
            <div>
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Real-Time System Overview</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Welcome, <span className="gradient-text">{admin.username}</span> 👋
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Aggregated platform metrics and database records across student profiles, resumes, job applications, and mock interviews.
              </p>
            </div>

            <button
              onClick={loadStats}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-colors flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between text-rose-300 text-xs">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadStats}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 rounded-xl font-bold transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* 8 Real-time Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* Card 1: Total Students */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Students</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              {loading ? (
                <div className="h-8 w-20 bg-slate-900 animate-pulse rounded-lg" />
              ) : (
                <p className="text-2xl sm:text-3xl font-black text-white">
                  {data?.total_students ?? 0}
                </p>
              )}
              <p className="text-[10px] text-slate-500">Registered Student Accounts</p>
            </div>

            {/* Card 2: Total Resumes */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Resumes</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              {loading ? (
                <div className="h-8 w-20 bg-slate-900 animate-pulse rounded-lg" />
              ) : (
                <p className="text-2xl sm:text-3xl font-black text-white">
                  {data?.total_resumes ?? 0}
                </p>
              )}
              <p className="text-[10px] text-slate-500">Uploaded PDF Resumes</p>
            </div>

            {/* Card 3: Total Jobs */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Jobs</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              {loading ? (
                <div className="h-8 w-20 bg-slate-900 animate-pulse rounded-lg" />
              ) : (
                <p className="text-2xl sm:text-3xl font-black text-white">
                  {data?.total_jobs ?? 0}
                </p>
              )}
              <p className="text-[10px] text-slate-500">Active Campus Openings</p>
            </div>

            {/* Card 4: Total Applications */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Applications</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Kanban className="w-4 h-4" />
                </div>
              </div>
              {loading ? (
                <div className="h-8 w-20 bg-slate-900 animate-pulse rounded-lg" />
              ) : (
                <p className="text-2xl sm:text-3xl font-black text-white">
                  {data?.total_applications ?? 0}
                </p>
              )}
              <p className="text-[10px] text-slate-500">Submitted Applications</p>
            </div>

            {/* Card 5: Active Applications */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Active Applications</span>
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              {loading ? (
                <div className="h-8 w-20 bg-slate-900 animate-pulse rounded-lg" />
              ) : (
                <p className="text-2xl sm:text-3xl font-black text-white">
                  {data?.active_applications ?? 0}
                </p>
              )}
              <p className="text-[10px] text-slate-500">Applied & Interviewing</p>
            </div>

            {/* Card 6: Completed Interviews */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Completed Interviews</span>
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <Mic className="w-4 h-4" />
                </div>
              </div>
              {loading ? (
                <div className="h-8 w-20 bg-slate-900 animate-pulse rounded-lg" />
              ) : (
                <p className="text-2xl sm:text-3xl font-black text-white">
                  {data?.completed_interviews ?? 0}
                </p>
              )}
              <p className="text-[10px] text-slate-500">Mock Practice Sessions</p>
            </div>

            {/* Card 7: Average ATS Score */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Average ATS Score</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              {loading ? (
                <div className="h-8 w-20 bg-slate-900 animate-pulse rounded-lg" />
              ) : (
                <p className="text-2xl sm:text-3xl font-black text-amber-300">
                  {data?.average_ats_score ? `${data.average_ats_score}%` : 'No data yet'}
                </p>
              )}
              <p className="text-[10px] text-slate-500">Across Parsed Resumes</p>
            </div>

            {/* Card 8: Average Career Readiness */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Avg Career Readiness</span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              {loading ? (
                <div className="h-8 w-20 bg-slate-900 animate-pulse rounded-lg" />
              ) : (
                <p className="text-2xl sm:text-3xl font-black text-indigo-300">
                  {data?.average_career_readiness ? `${data.average_career_readiness}%` : 'No data yet'}
                </p>
              )}
              <p className="text-[10px] text-slate-500">Overall Readiness Metric</p>
            </div>

          </div>

          {/* Quick Platform Overview Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 7 Cols: Recent Students Table */}
            <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Recently Registered Students</h3>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 font-mono">
                  Latest MongoDB Records
                </span>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs text-slate-500">Loading student records...</div>
              ) : data?.recent_users && data.recent_users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="p-2.5 rounded-l-xl">Name</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">College</th>
                        <th className="p-2.5 rounded-r-xl">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {data.recent_users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-2.5 font-bold text-white flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate">{u.name}</span>
                          </td>
                          <td className="p-2.5 font-mono text-slate-400 text-[11px] truncate">{u.email}</td>
                          <td className="p-2.5 text-slate-400 truncate">{u.college || 'N/A'}</td>
                          <td className="p-2.5 text-[11px] text-slate-500 font-mono">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-slate-500">
                  No students registered yet.
                </div>
              )}
            </div>

            {/* Right 5 Cols: Recent Applications & Activity Feed */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Recent Applications Card */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Recent Applications</h3>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 font-mono">
                    Real Pipeline
                  </span>
                </div>

                {loading ? (
                  <div className="py-6 text-center text-xs text-slate-500">Loading applications...</div>
                ) : data?.recent_applications && data.recent_applications.length > 0 ? (
                  <div className="space-y-3">
                    {data.recent_applications.map((app) => (
                      <div key={app.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white truncate max-w-[180px]">{app.job_title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold font-mono">
                            {app.match_score}% Match
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{app.student_name} • {app.company}</span>
                          <span className="font-mono text-[10px] text-slate-500">{app.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No applications submitted yet.
                  </div>
                )}
              </div>

              {/* Platform Activity Feed Card */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white">Recent Platform Activity</h3>
                  </div>
                </div>

                {loading ? (
                  <div className="py-6 text-center text-xs text-slate-500">Loading activity feed...</div>
                ) : data?.recent_activity && data.recent_activity.length > 0 ? (
                  <div className="space-y-3">
                    {data.recent_activity.map((act) => (
                      <div key={act.id} className="flex items-start space-x-3 text-xs">
                        <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-200">{act.title}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">{act.description}</p>
                          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No recent activity.
                  </div>
                )}
              </div>

            </div>

          </div>

        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
          © 2026 CampusMate AI. All rights reserved. Administrator System Dashboard.
        </footer>

      </div>
    </div>
  );
};
