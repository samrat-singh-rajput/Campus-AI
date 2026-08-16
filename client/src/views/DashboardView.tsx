import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { StatCards } from '../components/dashboard/StatCards';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecommendedJobs } from '../components/dashboard/RecommendedJobs';
import { CareerInsights } from '../components/dashboard/CareerInsights';

interface DashboardViewProps {
  user: any;
  onSelectTab: (tabId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ user, onSelectTab }) => {
  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Welcome Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden glow-border">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CampusMate AI Student Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="gradient-text">{user?.name || 'Student'}</span>! 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {user?.college ? `${user.college} • ${user.degree || 'Degree Program'}` : 'Student Account Verified.'}{' '}
              Your AI career companion is ready to optimize your resume, evaluate job eligibility, and coach your next interview.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <button
              onClick={() => onSelectTab('resume')}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <span>Upload Resume</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectTab('assistant')}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all"
            >
              <span>Chat AI Agent</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Statistics Cards */}
      <StatCards user={user} onSelectTab={onSelectTab} />

      {/* 2. Quick AI Actions Grid */}
      <QuickActions onSelectTab={onSelectTab} />

      {/* 3. Recommended Jobs & Career Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <RecommendedJobs onSelectTab={onSelectTab} />
        </div>
        <div className="lg:col-span-5">
          <CareerInsights user={user} onSelectTab={onSelectTab} />
        </div>
      </div>

    </div>
  );
};
