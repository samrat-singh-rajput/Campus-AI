import React, { useEffect, useState } from 'react';
import { 
  Kanban, 
  ArrowLeft, 
  Trash2, 
  RefreshCw, 
  ChevronRight
} from 'lucide-react';
import { fetchMyApplications, updateApplicationStatus, withdrawApplication } from '../services/applicationService';
import type { ApplicationResponse } from '../services/applicationService';

interface ApplicationsViewProps {
  user: any;
  onBackToDashboard: () => void;
  onSelectTab: (tabId: string) => void;
  onApplicationsCountChanged?: (count: number) => void;
}

const COLUMNS = [
  { id: 'Applied', title: 'Applied', color: 'from-blue-500/20 to-indigo-500/10 border-indigo-500/30 text-indigo-400' },
  { id: 'Interviewing', title: 'Interviewing', color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400' },
  { id: 'Offered', title: 'Offered 🎉', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400' },
  { id: 'Saved', title: 'Saved / Pending', color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400' }
];

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  user: _user,
  onBackToDashboard,
  onSelectTab,
  onApplicationsCountChanged
}) => {
  const [apps, setApps] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyApplications();
      setApps(data);
      if (onApplicationsCountChanged) {
        onApplicationsCountChanged(data.length);
      }
    } catch (err: any) {
      setError('Failed to fetch applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setUpdatingId(appId);
    try {
      const updated = await updateApplicationStatus(appId, newStatus);
      setApps((prev) => prev.map((a) => (a.id === appId ? updated : a)));
    } catch (err: any) {
      setError('Could not update application status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleWithdraw = async (appId: string) => {
    if (!window.confirm('Withdraw this application?')) return;
    setUpdatingId(appId);
    try {
      await withdrawApplication(appId);
      const nextApps = apps.filter((a) => a.id !== appId);
      setApps(nextApps);
      if (onApplicationsCountChanged) {
        onApplicationsCountChanged(nextApps.length);
      }
    } catch (err: any) {
      setError('Failed to withdraw application.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={() => onSelectTab('jobs')}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all w-fit"
        >
          <span>Find & Apply More Jobs</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Banner */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 glow-border">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Kanban className="w-5 h-5 text-indigo-400" />
            <span>Campus Drive Application Pipeline</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 font-mono">
              Dual Match Pipeline
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tracks submitted applications with Dual Match Scoring (60% Random Forest ML + 40% ChromaDB Vector Search).
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-bold text-slate-300 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
          <span>Total Applications: <strong className="text-indigo-400">{apps.length}</strong></span>
        </div>
      </div>

      {error && (
        <p className="text-xs text-rose-400 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">{error}</p>
      )}

      {/* Loading */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">Loading Application Pipeline...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {COLUMNS.map((col) => {
            const colApps = apps.filter((a) => a.status === col.id || (col.id === 'Applied' && !['Interviewing', 'Offered', 'Saved'].includes(a.status)));
            
            return (
              <div key={col.id} className="space-y-4">
                {/* Column Header */}
                <div className={`p-3.5 rounded-2xl bg-gradient-to-r ${col.color} border flex items-center justify-between font-bold text-xs shadow-sm`}>
                  <span>{col.title}</span>
                  <span className="w-5 h-5 rounded-full bg-slate-950/80 flex items-center justify-center text-[11px]">
                    {colApps.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 min-h-[250px]">
                  {colApps.length > 0 ? (
                    colApps.map((app) => (
                      <div
                        key={app.id}
                        className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 space-y-3 transition-all glow-border"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-white leading-tight">{app.job_snapshot.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{app.job_snapshot.company}</p>
                          </div>

                          <button
                            onClick={() => handleWithdraw(app.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Withdraw Application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Dual Match Score Tag */}
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">Dual Match Score:</span>
                            <span className="font-extrabold text-emerald-400">{app.combined_match_score}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full"
                              style={{ width: `${app.combined_match_score}%` }}
                            ></div>
                          </div>
                          <p className="text-[9px] text-slate-500 font-mono text-right pt-0.5">
                            ML: {app.ml_eligibility_score}% • Vector: {app.vector_similarity_score}%
                          </p>
                        </div>

                        {/* Status Change Selector */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(app.applied_at).toLocaleDateString()}
                          </span>

                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            disabled={updatingId === app.id}
                            className="bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300 font-semibold px-2 py-1 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Offered">Offered</option>
                            <option value="Saved">Saved</option>
                          </select>
                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center border border-dashed border-slate-800/80 rounded-2xl text-[11px] text-slate-600">
                      No applications in this stage
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
