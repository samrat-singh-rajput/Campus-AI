import React from 'react';
import { Target, Building2, MapPin, Briefcase, ChevronRight, Check } from 'lucide-react';

interface RecommendedJobsProps {
  onSelectTab: (tabId: string) => void;
}

export const RecommendedJobs: React.FC<RecommendedJobsProps> = ({ onSelectTab }) => {
  const sampleJobs = [
    {
      id: 'job-1',
      title: 'Full Stack Engineer',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA (Remote)',
      matchScore: 94,
      skills: ['Python', 'FastAPI', 'React', 'MongoDB'],
      type: 'Full-time'
    },
    {
      id: 'job-2',
      title: 'AI / Machine Learning Engineer',
      company: 'NextGen Intelligence',
      location: 'New York, NY (Hybrid)',
      matchScore: 89,
      skills: ['Python', 'PyTorch', 'FastAPI', 'ChromaDB'],
      type: 'Full-time'
    },
    {
      id: 'job-3',
      title: 'Backend API Developer',
      company: 'CloudScale Data',
      location: 'Austin, TX (Remote)',
      matchScore: 85,
      skills: ['Python', 'FastAPI', 'REST APIs', 'SQL'],
      type: 'Full-time'
    }
  ];

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl glow-border">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Recommended Job Matches</h3>
        </div>
        <button
          onClick={() => onSelectTab('jobs')}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition-colors"
        >
          <span>View All Matches</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {sampleJobs.map((job) => (
          <div
            key={job.id}
            onClick={() => onSelectTab('jobs')}
            className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/30 rounded-2xl p-4 transition-all duration-200 cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {job.title}
                  </h4>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5 font-medium">
                    <span className="flex items-center space-x-1">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      <span>{job.company}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{job.location}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Skill Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {job.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium flex items-center space-x-1"
                  >
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                    <span>{s}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Match Score Badge & CTA */}
            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                {job.matchScore}% Match
              </span>
              <span className="text-xs font-semibold text-slate-400 group-hover:text-indigo-400 flex items-center space-x-1 transition-colors">
                <span>Evaluate Eligibility</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
