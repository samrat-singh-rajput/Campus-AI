import React from 'react';
import { FileText, Target, Mic, Kanban, Bot, Database, Sparkles, ArrowRight } from 'lucide-react';

export const Features: React.FC = () => {
  const featureList = [
    {
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      accent: 'text-blue-400',
      bgGlow: 'bg-blue-500/10',
      title: 'Smart Resume Parser & ATS Optimizer',
      description: 'Extract skills, education, and experience from PDF resumes instantly. Get an objective ATS score with specific missing keyword alerts to bypass recruiters\' automated filters.',
      badge: 'Step 5 Engine'
    },
    {
      icon: Target,
      color: 'from-indigo-500 to-purple-600',
      accent: 'text-indigo-400',
      bgGlow: 'bg-indigo-500/10',
      title: 'AI Job Matcher & Eligibility Engine',
      description: 'Powered by a Scikit-Learn Random Forest ML model. Evaluates candidate skill vectors against real job descriptions to provide eligibility probabilities and skill gap breakdown.',
      badge: 'Step 7 ML Model'
    },
    {
      icon: Mic,
      color: 'from-purple-500 to-pink-600',
      accent: 'text-purple-400',
      bgGlow: 'bg-purple-500/10',
      title: 'AI Mock Interview Coach',
      description: 'Practice interactive voice and text technical/behavioral mock interviews tailored to your target company. Receive actionable feedback on clarity, technical accuracy, and tone.',
      badge: 'Step 10 Voice & Speech'
    },
    {
      icon: Kanban,
      color: 'from-emerald-500 to-teal-600',
      accent: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/10',
      title: 'Application Kanban Tracker',
      description: 'Organize your job search visual pipeline with drag-and-drop Kanban columns: Saved, Applied, Interviewing, Offered, and Rejected. Never miss a deadline again.',
      badge: 'Step 11 Pipeline'
    },
    {
      icon: Bot,
      color: 'from-amber-500 to-orange-600',
      accent: 'text-amber-400',
      bgGlow: 'bg-amber-500/10',
      title: 'LangGraph Autonomous AI Agent',
      description: 'Multi-tool agent powered by LangGraph & ChromaDB vector RAG. Ask complex career questions, receive salary benchmarks, and generate tailored cover letters on demand.',
      badge: 'Step 9 Orchestration'
    },
    {
      icon: Database,
      color: 'from-cyan-500 to-blue-600',
      accent: 'text-cyan-400',
      bgGlow: 'bg-cyan-500/10',
      title: 'Secure Student Data Vault',
      description: 'Your career data is protected with JWT token authentication, bcrypt password encryption, MongoDB Atlas primary storage, and local persistent ChromaDB embeddings.',
      badge: 'Step 1 & 2 Security'
    }
  ];

  return (
    <section id="features" className="py-24 relative bg-slate-950/60 border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comprehensive Suite</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Everything You Need to Land Your <span className="gradient-text">Dream Career</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            CampusMate AI combines machine learning, vector RAG search, and autonomous AI agents to give every student an unfair advantage in placement drives.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="glass-card rounded-3xl p-8 border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 group hover:-translate-y-1.5 glow-border relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Icon & Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.color} p-0.5 shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform`}>
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                        <IconComponent className={`w-7 h-7 ${item.accent}`} />
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Footer Link */}
                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
