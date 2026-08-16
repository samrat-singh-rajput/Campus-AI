import React from 'react';
import { FileText, Target, Kanban, Mic, ArrowUpRight, CheckCircle } from 'lucide-react';

interface StatCardsProps {
  user?: any;
  onSelectTab: (tabId: string) => void;
  atsScore?: number | null;
  applicationsCount?: number | null;
}

export const StatCards: React.FC<StatCardsProps> = ({ user: _user, onSelectTab, atsScore, applicationsCount }) => {
  const stats = [
    {
      id: 'resume',
      title: 'ATS Resume Score',
      value: atsScore != null ? `${atsScore} / 100` : 'Not analyzed yet',
      change: atsScore != null ? 'Parsed PDF ATS Rating' : 'Upload resume to calculate',
      isPositive: atsScore != null,
      badge: 'Step 5 Parser',
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      accent: 'text-blue-400',
      tabId: 'resume'
    },
    {
      id: 'jobs',
      title: 'Job Matches',
      value: 'Available after upload',
      change: 'Awaiting resume analysis',
      isPositive: false,
      badge: 'Step 7 Classifier',
      icon: Target,
      color: 'from-indigo-500 to-purple-600',
      accent: 'text-indigo-400',
      tabId: 'jobs'
    },
    {
      id: 'applications',
      title: 'Active Applications',
      value: applicationsCount != null ? `${applicationsCount} Active` : '0',
      change: applicationsCount != null && applicationsCount > 0 ? 'Applications in Pipeline' : 'Kanban pipeline ready',
      isPositive: true,
      badge: 'Step 8 Tracker',
      icon: Kanban,
      color: 'from-emerald-500 to-teal-600',
      accent: 'text-emerald-400',
      tabId: 'applications'
    },
    {
      id: 'interview',
      title: 'AI Mock Interviews',
      value: 'Start your first interview',
      change: '0 sessions completed',
      isPositive: true,
      badge: 'Step 10 Coach',
      icon: Mic,
      color: 'from-purple-500 to-pink-600',
      accent: 'text-purple-400',
      tabId: 'interview'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((item) => {
        const IconComp = item.icon;
        return (
          <div
            key={item.id}
            onClick={() => onSelectTab(item.tabId)}
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 cursor-pointer group glow-border flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} p-0.5 shadow-md group-hover:scale-105 transition-transform`}>
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <IconComp className={`w-5 h-5 ${item.accent}`} />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-400">{item.title}</p>
              <h3 className="text-2xl font-extrabold text-white mt-1 group-hover:text-indigo-300 transition-colors">
                {item.value}
              </h3>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-medium flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>{item.change}</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
