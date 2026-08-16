import React, { useEffect, useState } from 'react';
import { TrendingUp, Bot, CheckCircle2, ArrowRight } from 'lucide-react';
import { fetchMyCareerInsights } from '../../services/insightsService';
import type { CareerInsightsResponse } from '../../services/insightsService';

interface CareerInsightsProps {
  user: any;
  onSelectTab: (tabId: string) => void;
}

export const CareerInsights: React.FC<CareerInsightsProps> = ({ user, onSelectTab }) => {
  const [insights, setInsights] = useState<CareerInsightsResponse | null>(null);
  const userSkills: string[] = user?.skills && user.skills.length > 0 ? user.skills : [];

  useEffect(() => {
    fetchMyCareerInsights()
      .then((data) => setInsights(data))
      .catch(() => {});
  }, [user]);

  const readinessScore = insights?.career_readiness_score || 50;

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl glow-border">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Career Readiness & AI Insights</h3>
        </div>
        <button
          onClick={() => onSelectTab('insights')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full flex items-center space-x-1"
        >
          <span>Full Analytics Hub</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Overall Career Readiness Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300">AI Career Readiness Score</span>
            <span className="text-emerald-400">{readinessScore}% Readiness</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${readinessScore}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Student: <strong className="text-slate-200">{user?.name || 'Candidate'}</strong> ({user?.college || 'University'}).
          </p>
        </div>

        {/* AI Agent Insight Recommendation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">LangGraph AI Career Advice</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {insights?.growth_advice?.[0] || 'Upload your PDF resume in My Resume to optimize your ATS score and ML job match eligibility.'}
            </p>
            <button
              onClick={() => onSelectTab('assistant')}
              className="mt-3 text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center space-x-1 transition-colors"
            >
              <span>Chat with LangGraph AI Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Active Skills List */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Skill Vector ({userSkills.length}):</label>
          <div className="flex flex-wrap gap-2">
            {userSkills.length > 0 ? (
              userSkills.map((s: string, idx: number) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{s}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No skills registered yet. Upload a resume or add skills in settings.</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
