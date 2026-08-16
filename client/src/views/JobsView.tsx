import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  ArrowLeft, 
  Check, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  BrainCircuit,
  DollarSign
} from 'lucide-react';
import { fetchMyJobRecommendations, evaluateSingleJobEligibility } from '../services/jobService';
import { submitApplication } from '../services/applicationService';
import type { JobResponse, MLEligibilityResult } from '../services/jobService';

interface JobsViewProps {
  user: any;
  onBackToDashboard: () => void;
  onSelectTab?: (tabId: string) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({ user: _user, onBackToDashboard, onSelectTab: _onSelectTab }) => {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterTier, setFilterTier] = useState<'all' | 'high' | 'moderate'>('all');
  const [selectedJobEval, setSelectedJobEval] = useState<MLEligibilityResult | null>(null);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyJobRecommendations();
      setJobs(data);
    } catch (err: any) {
      setError('Failed to fetch Scikit-Learn ML job recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleApplyJob = async (jobId: string) => {
    setApplyingId(jobId);
    setError(null);
    setSuccessMsg(null);
    try {
      await submitApplication(jobId, 'Applied directly from ML Job Recommendations view');
      setAppliedJobs((prev) => new Set(prev).add(jobId));
      setSuccessMsg('Application submitted successfully! Tracking in Application Pipeline.');
      if (selectedJobEval?.job_id === jobId) {
        setSelectedJobEval(null);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to submit application or already applied.';
      setError(msg);
    } finally {
      setApplyingId(null);
    }
  };

  const handleEvaluateJob = async (jobId: string) => {
    setEvaluatingId(jobId);
    try {
      const result = await evaluateSingleJobEligibility(jobId);
      setSelectedJobEval(result);
    } catch (err: any) {
      setError('Failed to execute ML evaluation.');
    } finally {
      setEvaluatingId(null);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (!j.match_result) return true;
    const score = j.match_result.eligibility_score;
    if (filterTier === 'high') return score >= 75;
    if (filterTier === 'moderate') return score >= 50 && score < 75;
    return true;
  });

  const getScoreBadgeColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    if (score >= 50) return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Scikit-Learn Random Forest Engine</span>
          </span>
        </div>
      </div>

      {/* Filter Tier Tabs */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 glow-border">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <span>Job Matches & Eligibility Classifier</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 font-mono">
              STEP 7 ML
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Random Forest model evaluates candidate skill vector, degree fit, and ATS resume score.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setFilterTier('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterTier === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Roles ({jobs.length})
          </button>

          <button
            onClick={() => setFilterTier('high')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterTier === 'high'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            High Fit (75%+)
          </button>

          <button
            onClick={() => setFilterTier('moderate')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterTier === 'moderate'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Moderate Fit
          </button>
        </div>
      </div>

      {successMsg && (
        <p className="text-xs text-emerald-400 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </p>
      )}

      {error && (
        <p className="text-xs text-rose-400 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">{error}</p>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">Running Random Forest ML Candidate Evaluation...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const result = job.match_result;
            const score = result ? result.eligibility_score : 75;
            const classification = result ? result.classification : 'High Fit';
            const matchedSkills = result ? result.matched_skills : job.required_skills;
            const missingSkills = result ? result.missing_skills : [];

            return (
              <div
                key={job.id}
                className="glass-card rounded-3xl p-6 border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 glow-border flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md flex-shrink-0">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-indigo-400">
                        <Briefcase className="w-5 h-5" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5 font-medium">
                        <span className="flex items-center space-x-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{job.company}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{job.location}</span>
                        </span>
                        {job.salary_range && (
                          <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>{job.salary_range}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{job.description}</p>

                  {/* Skill Chips Comparison */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {matchedSkills.map((s, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium flex items-center space-x-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>{s}</span>
                      </span>
                    ))}
                    {missingSkills.map((s, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-medium flex items-center space-x-1">
                        <X className="w-3 h-3 text-rose-400" />
                        <span>Missing: {s}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score Badge & Action */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800 flex-shrink-0">
                  <div className="text-right">
                    <span className={`text-xs px-3.5 py-1 rounded-full font-extrabold border ${getScoreBadgeColor(score)}`}>
                      {score}% Probability • {classification}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono hidden md:block">Scikit-Learn Model Output</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEvaluateJob(job.id)}
                      disabled={evaluatingId === job.id}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      {evaluatingId === job.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>Fit</span>
                    </button>

                    <button
                      onClick={() => handleApplyJob(job.id)}
                      disabled={applyingId === job.id || appliedJobs.has(job.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        appliedJobs.has(job.id)
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md'
                      }`}
                    >
                      {applyingId === job.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : appliedJobs.has(job.id) ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Briefcase className="w-3.5 h-3.5" />
                      )}
                      <span>{appliedJobs.has(job.id) ? 'Applied' : 'Apply Now'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Single Job ML Evaluation Modal */}
      {selectedJobEval && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative space-y-6 glow-border animate-fadeIn">
            
            <button
              onClick={() => setSelectedJobEval(null)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono">
                RandomForestClassifier Inference
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1">{selectedJobEval.job_title}</h3>
              <p className="text-xs text-slate-400">{selectedJobEval.company}</p>
            </div>

            {/* Score Ring */}
            <div className="text-center py-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="text-5xl font-black text-white gradient-text">
                {selectedJobEval.eligibility_score}%
              </div>
              <p className="text-xs font-bold text-indigo-400 mt-1 uppercase tracking-wider">
                Classification: {selectedJobEval.classification}
              </p>
            </div>

            {/* Recommendation Note */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white block">AI Agent Advice:</span>
              <p className="leading-relaxed">{selectedJobEval.recommendation_note}</p>
            </div>

            {/* Matched vs Missing Breakdown */}
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Matched Candidate Skills:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedJobEval.matched_skills.map((s, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{s}</span>
                    </span>
                  ))}
                </div>
              </div>

              {selectedJobEval.missing_skills.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Recommended Skills to Add:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedJobEval.missing_skills.map((s, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-semibold flex items-center space-x-1">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        <span>{s}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedJobEval(null)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-500/20"
            >
              Close Assessment
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
