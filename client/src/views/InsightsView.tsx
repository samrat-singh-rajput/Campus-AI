import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Award, 
  Target, 
  Sparkles, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  FileText, 
  Kanban, 
  BrainCircuit
} from 'lucide-react';
import { fetchMyCareerInsights } from '../services/insightsService';
import type { CareerInsightsResponse } from '../services/insightsService';

interface InsightsViewProps {
  user: any;
  onBackToDashboard: () => void;
  onSelectTab: (tabId: string) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ user: _user, onBackToDashboard, onSelectTab }) => {
  const [data, setData] = useState<CareerInsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMyCareerInsights();
      setData(result);
    } catch (err: any) {
      setError('Failed to calculate career readiness insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center space-x-1.5 font-mono">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>STEP 11 Platform Analytics</span>
        </span>
      </div>

      {error && (
        <p className="text-xs text-rose-400 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">{error}</p>
      )}

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">Aggregating Platform Analytics & Computing Readiness Score...</p>
        </div>
      ) : data && (
        <div className="space-y-8">
          
          {/* Main Hero Readiness Score Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 glow-border flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Career Readiness Metric</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {data.user_name}'s Placement Readiness
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculated across your parsed ATS resume score, verified skill vector, Scikit-Learn Random Forest job fit, and mock interview performance.
              </p>

              <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                <button
                  onClick={() => onSelectTab('jobs')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1"
                >
                  <span>Explore High Fit Jobs</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSelectTab('interview')}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:text-white"
                >
                  <span>Practice Mock Interview</span>
                </button>
              </div>
            </div>

            {/* Score Ring Display */}
            <div className="text-center p-6 bg-slate-950 rounded-3xl border border-slate-800/80 shadow-2xl flex-shrink-0 w-52">
              <div className="text-5xl font-black text-white gradient-text">{data.career_readiness_score}%</div>
              <p className="text-xs font-bold text-indigo-400 mt-1 uppercase tracking-wider">
                {data.career_readiness_score >= 80 ? 'Placement Ready 🚀' : data.career_readiness_score >= 60 ? 'Competitive Candidate' : 'Building Foundation'}
              </p>
            </div>
          </div>

          {/* 4 Analytics Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">ATS Resume Rating</span>
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">
                {data.ats_score ? `${data.ats_score} / 100` : 'Not analyzed'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">PyPDF Step 5 Parser</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">High Fit Job Roles</span>
                <Target className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">
                {data.high_fit_jobs_count} Roles
              </p>
              <p className="text-[10px] text-slate-500 font-mono">Random Forest ML Classifier</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Application Pipeline</span>
                <Kanban className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">
                {data.applications_count} Submitted
              </p>
              <p className="text-[10px] text-slate-500 font-mono">Step 8 Tracker</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2 glow-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Mock Interview Avg</span>
                <BrainCircuit className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">
                {data.interviews_count > 0 ? `${data.average_interview_score}%` : '0 Sessions'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">Step 10 Coach</p>
            </div>

          </div>

          {/* Strengths vs Skill Gaps Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Verified Strengths</span>
              </h3>

              <div className="space-y-2.5">
                {data.top_strengths.map((s, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-emerald-300 font-medium flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Gaps Alert */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Target Skill Gaps for 100% Fit</span>
              </h3>

              <div className="space-y-2.5">
                {data.recommended_skill_gaps.length > 0 ? (
                  data.recommended_skill_gaps.map((sg, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between">
                      <span className="font-bold text-white">{sg.skill}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono">
                        Affects {sg.associated_job_count} Jobs ({sg.importance} Priority)
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 p-4 border border-dashed border-slate-800 rounded-xl">No critical skill gaps identified!</p>
                )}
              </div>
            </div>

          </div>

          {/* Actionable Growth Plan */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <span>Personalized AI Career Growth Plan</span>
            </h3>

            <div className="space-y-3">
              {data.growth_advice.map((adv, idx) => (
                <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed pt-0.5">{adv}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
