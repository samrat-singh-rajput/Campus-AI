import React from 'react';
import { FileUp, Target, Mic, Bot, Sparkles, ArrowRight } from 'lucide-react';

interface QuickActionsProps {
  onSelectTab: (tabId: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelectTab }) => {
  const actions = [
    {
      id: 'resume',
      title: 'Upload & Parse Resume',
      subtitle: 'Extract skills & compute ATS compatibility score',
      icon: FileUp,
      badge: 'PyPDF Parser',
      color: 'from-blue-600 to-indigo-600',
      btnText: 'Upload Resume'
    },
    {
      id: 'jobs',
      title: 'Check Job Eligibility',
      subtitle: 'Classify skills with Random Forest ML model',
      icon: Target,
      badge: 'Random Forest ML',
      color: 'from-indigo-600 to-purple-600',
      btnText: 'Match Jobs'
    },
    {
      id: 'interview',
      title: 'Start AI Mock Interview',
      subtitle: 'Real-time voice & speech practice coach',
      icon: Mic,
      badge: 'AI Voice Coach',
      color: 'from-purple-600 to-pink-600',
      btnText: 'Start Interview'
    },
    {
      id: 'assistant',
      title: 'Ask LangGraph Agent',
      subtitle: 'Multi-tool career RAG assistant',
      icon: Bot,
      badge: 'LangGraph Agent',
      color: 'from-emerald-600 to-teal-600',
      btnText: 'Open Agent'
    }
  ];

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl glow-border">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Quick AI Career Actions</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Modular Pipeline Ready</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const IconComp = action.icon;
          return (
            <div
              key={action.id}
              onClick={() => onSelectTab(action.id)}
              className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
                    {action.badge}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {action.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {action.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                <span>{action.btnText}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
