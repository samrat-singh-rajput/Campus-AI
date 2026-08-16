import React from 'react';
import { TrendingUp, Bot, CheckCircle2, ArrowRight } from 'lucide-react';

interface CareerInsightsProps {
  user: any;
  onSelectTab: (tabId: string) => void;
}

export const CareerInsights: React.FC<CareerInsightsProps> = ({ user, onSelectTab }) => {
  const userSkills: string[] = user?.skills && user.skills.length > 0 ? user.skills : [];

  // Compute profile completion dynamically based on authenticated user data presence
  let completionScore = 20;
  if (user?.name) completionScore += 20;
  if (user?.email) completionScore += 20;
  if (user?.college) completionScore += 20;
  if (userSkills.length > 0) completionScore += 20;

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl glow-border">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Career Progress & AI Insights</h3>
        </div>
        <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
          {user ? 'Account Authenticated' : 'Demo Profile'}
        </span>
      </div>

      <div className="space-y-6">
        
        {/* Overall Profile Completion Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300">Profile Completion</span>
            <span className="text-emerald-400">{completionScore}% Complete</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionScore}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Authenticated as <strong className="text-slate-200">{user?.name || 'Demo User'}</strong> ({user?.college || 'University Not Specified'}).
          </p>
        </div>

        {/* AI Agent Insight Recommendation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">AI Agent Recommendation</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Upload your PDF resume in Step 5 to receive tailored ATS optimization and Random Forest job eligibility matching.
            </p>
            <button
              onClick={() => onSelectTab('assistant')}
              className="mt-3 text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center space-x-1 transition-colors"
            >
              <span>Chat with LangGraph Career Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Active Skills List */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Verified Skill Vector:</label>
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
