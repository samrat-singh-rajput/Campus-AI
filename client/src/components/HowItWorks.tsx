import React from 'react';
import { Upload, Sparkles, Target, Award } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Upload Your Resume',
      description: 'Upload your existing PDF resume or create one using our guided builder. Our parser extracts all technical skills and experience.'
    },
    {
      number: '02',
      icon: Sparkles,
      title: 'AI ATS Optimization',
      description: 'Get instant ATS score feedback, format compliance checks, and recommended industry keywords tailored to high-paying tech roles.'
    },
    {
      number: '03',
      icon: Target,
      title: 'Job Matching & Eligibility',
      description: 'Our Random Forest ML engine scores your profile against active job postings, highlighting exact skill gaps you need to bridge.'
    },
    {
      number: '04',
      icon: Award,
      title: 'AI Coaching & Placement',
      description: 'Practice interactive AI mock interviews, track applications on your Kanban board, and get hired faster.'
    }
  ];

  return (
    <section id="workflow" className="py-24 relative bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>4-Step Career Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            How <span className="gradient-text">CampusMate AI</span> Works
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            From initial resume upload to your final job offer, follow our automated 4-step placement pipeline.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <div
                key={idx}
                className="glass-card rounded-3xl p-6 border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 relative group glow-border flex flex-col justify-between"
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold text-slate-700 group-hover:text-indigo-400 transition-colors font-mono">
                      {step.number}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-[11px] font-semibold text-slate-500 group-hover:text-indigo-400 transition-colors">
                  <span>Step {idx + 1} Pipeline</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
