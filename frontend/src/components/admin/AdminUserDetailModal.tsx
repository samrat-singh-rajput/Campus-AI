import React, { useState } from 'react';
import { 
  X, 
  User, 
  FileText, 
  Kanban, 
  Mic, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Mail, 
  Lock, 
  Unlock, 
  Loader2
} from 'lucide-react';
import type { AdminUserDetailResponse } from '../../services/adminAuthService';

interface AdminUserDetailModalProps {
  user: AdminUserDetailResponse;
  onClose: () => void;
  onStatusToggle: (userId: string, currentStatus: string) => Promise<void>;
}

export const AdminUserDetailModal: React.FC<AdminUserDetailModalProps> = ({
  user,
  onClose,
  onStatusToggle
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'applications' | 'interviews' | 'insights'>('profile');
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  const handleConfirmToggle = async () => {
    setUpdatingStatus(true);
    try {
      await onStatusToggle(user.id, user.status);
      setConfirmModalOpen(false);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto selection:bg-indigo-500 selection:text-white">
      
      <div className="glass-card max-w-4xl w-full rounded-3xl border border-slate-800 shadow-2xl relative space-y-6 glow-border overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/90 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 flex-shrink-0 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white font-extrabold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-white tracking-tight">{user.name}</h2>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  user.status === 'Disabled'
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                }`}>
                  {user.status} Account
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{user.email}</span>
                {user.college && (
                  <>
                    <span>•</span>
                    <span>{user.college}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setConfirmModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center space-x-1.5 cursor-pointer ${
                user.status === 'Disabled'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
              }`}
            >
              {user.status === 'Disabled' ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Enable Account</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Disable Account</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto flex-shrink-0 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Skills ({user.skills_count})</span>
          </button>

          <button
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'resume'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resume ({user.resume.has_resume ? `${user.resume.ats_score || 75}% ATS` : 'None'})</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'applications'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Applications ({user.applications.total_applications})</span>
          </button>

          <button
            onClick={() => setActiveTab('interviews')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'interviews'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Interviews ({user.interviews.total_sessions})</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'insights'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Career Insights ({user.insights?.career_readiness_score || 0}%)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: PROFILE & SKILLS */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Full Name</span>
                  <p className="text-sm font-bold text-white">{user.name}</p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email Address</span>
                  <p className="text-sm font-bold text-white font-mono">{user.email}</p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">College / Institution</span>
                  <p className="text-sm font-bold text-white">{user.college || 'Not specified'}</p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Degree & Graduation</span>
                  <p className="text-sm font-bold text-white">
                    {user.degree || 'Degree N/A'} {user.graduationYear ? `(${user.graduationYear})` : ''}
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Account Registration Date</span>
                  <p className="text-sm font-bold text-white font-mono">
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Account Status</span>
                  <p className={`text-sm font-bold ${user.status === 'Disabled' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {user.status}
                  </p>
                </div>
              </div>

              {/* Skills Vector Section */}
              <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Candidate Verified Skills ({user.skills_count})</span>
                  <span className="text-[10px] text-indigo-400 font-mono">Real Skill Vector</span>
                </h4>

                {user.skills && user.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-indigo-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No skills added to profile yet.</p>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: RESUME ANALYSIS */}
          {activeTab === 'resume' && (
            <div className="space-y-6">
              {user.resume.has_resume ? (
                <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{user.resume.filename}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {user.resume.file_size_bytes ? `${(user.resume.file_size_bytes / 1024).toFixed(1)} KB • ` : ''}
                          Uploaded {user.resume.upload_date ? new Date(user.resume.upload_date).toLocaleDateString() : 'recently'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs px-3.5 py-1 rounded-full font-extrabold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        {user.resume.ats_score}% ATS Compatibility Score
                      </span>
                    </div>
                  </div>

                  {/* Extracted Skills */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Extracted Resume Skills:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {user.resume.extracted_skills.map((s, idx) => (
                        <span key={idx} className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  {user.resume.missing_keywords.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-rose-400">Recommended Missing Keywords:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {user.resume.missing_keywords.map((mk, idx) => (
                          <span key={idx} className="text-xs px-2.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-medium">
                            {mk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="glass-card rounded-2xl p-12 border border-slate-800 text-center space-y-3">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No Resume Uploaded Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    This candidate has not uploaded a PDF resume to the platform yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              
              {/* Counter Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total</span>
                  <span className="text-lg font-extrabold text-white">{user.applications.total_applications}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-indigo-400 uppercase font-bold block">Applied</span>
                  <span className="text-lg font-extrabold text-indigo-300">{user.applications.applied_count}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-purple-400 uppercase font-bold block">Interviewing</span>
                  <span className="text-lg font-extrabold text-purple-300">{user.applications.interviewing_count}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">Offered</span>
                  <span className="text-lg font-extrabold text-emerald-300">{user.applications.offered_count}</span>
                </div>
              </div>

              {/* Table */}
              {user.applications.recent_applications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="p-2.5 rounded-l-xl">Job Title</th>
                        <th className="p-2.5">Company</th>
                        <th className="p-2.5">Match Fit</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5 rounded-r-xl">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {user.applications.recent_applications.map((app) => (
                        <tr key={app.id}>
                          <td className="p-2.5 font-bold text-white">{app.job_title}</td>
                          <td className="p-2.5 text-slate-400">{app.company}</td>
                          <td className="p-2.5 font-extrabold text-emerald-400 font-mono">{app.match_score}%</td>
                          <td className="p-2.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-300 font-bold">
                              {app.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-[11px] text-slate-500 font-mono">
                            {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-slate-500">
                  No applications submitted yet.
                </div>
              )}

            </div>
          )}

          {/* TAB 4: INTERVIEWS */}
          {activeTab === 'interviews' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Sessions</span>
                  <span className="text-lg font-extrabold text-white">{user.interviews.total_sessions}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">Completed</span>
                  <span className="text-lg font-extrabold text-emerald-300">{user.interviews.completed_sessions}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-indigo-400 uppercase font-bold block">Avg Score</span>
                  <span className="text-lg font-extrabold text-indigo-300">{user.interviews.average_score}%</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-purple-400 uppercase font-bold block">Best Score</span>
                  <span className="text-lg font-extrabold text-purple-300">{user.interviews.best_score}%</span>
                </div>
              </div>

              {user.interviews.recent_sessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="p-2.5 rounded-l-xl">Domain</th>
                        <th className="p-2.5">Score</th>
                        <th className="p-2.5">Rating</th>
                        <th className="p-2.5 rounded-r-xl">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {user.interviews.recent_sessions.map((sess, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-bold text-white">{sess.domain}</td>
                          <td className="p-2.5 font-extrabold text-emerald-400 font-mono">{sess.score}%</td>
                          <td className="p-2.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-purple-300 font-bold">
                              {sess.rating}
                            </span>
                          </td>
                          <td className="p-2.5 text-[11px] text-slate-500 font-mono">
                            {sess.date ? new Date(sess.date).toLocaleDateString() : 'Recent'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-slate-500">
                  No mock interview sessions yet.
                </div>
              )}

            </div>
          )}

          {/* TAB 5: INSIGHTS & CAREER READINESS */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              
              <div className="glass-card rounded-2xl p-6 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Overall Career Readiness Score</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Calculated across resume ATS fit, skill vector depth, application activity & interviews.</p>
                </div>
                <div className="text-3xl font-black text-indigo-400 font-mono">
                  {user.insights?.career_readiness_score || 0}%
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Strengths */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Candidate Strengths</span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {user.insights?.top_strengths?.map((str: string, idx: number) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Growth Recommendations</span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {user.insights?.growth_advice?.map((adv: string, idx: number) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* Account Status Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-5 text-center glow-border animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                Confirm Account Status Change
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Are you sure you want to {user.status === 'Disabled' ? 'ENABLE' : 'DISABLE'} the account for <strong className="text-white">{user.name}</strong>?
                {user.status !== 'Disabled' && ' Disabled students will be blocked from logging into the portal.'}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                disabled={updatingStatus}
                className="flex-1 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmToggle}
                disabled={updatingStatus}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center space-x-1.5 ${
                  user.status === 'Disabled'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20'
                }`}
              >
                {updatingStatus && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                <span>Yes, {user.status === 'Disabled' ? 'Enable' : 'Disable'} Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
