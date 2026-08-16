import React from 'react';
import { Sparkles, ArrowRight, CheckCircle, Zap, Shield, Play, FileText, Target, Bot, Check } from 'lucide-react';

interface HeroProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuth }) => {
  return (
    <section className="relative pt-12 pb-24 overflow-hidden">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-8">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center space-x-2.5 bg-slate-900/90 border border-indigo-500/30 px-4 py-2 rounded-full shadow-lg shadow-indigo-500/10">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs sm:text-sm font-semibold text-slate-200">
                Next-Gen Full-Stack AI Career Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Accelerate Your Career with <br className="hidden sm:inline" />
              <span className="gradient-text">Next-Gen AI Guidance</span> & ATS Resume Power
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              CampusMate AI helps college students and fresh graduates analyze resumes against ATS algorithms, calculate machine learning job eligibility scores, practice real-time AI mock interviews, and organize job applications seamlessly.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold text-base shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center space-x-2 group"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                </div>
                <span>Try Live ATS Demo</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex items-center justify-center lg:justify-start space-x-6 text-xs text-slate-400 font-medium">
              <div className="flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>JWT Encrypted</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>FastAPI + MongoDB Atlas</span>
              </div>
            </div>

          </div>

          {/* Right Hero Column: Interactive Animated Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative glow-border animate-float">
              
              {/* Card Header Badge */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Live Resume Analysis</h3>
                    <p className="text-xs text-slate-400">Software Engineer Resume #2026</p>
                  </div>
                </div>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold">
                  Demo Score: 94%
                </span>
              </div>

              {/* Simulated Metrics Ring & Breakdown */}
              <div className="py-6 space-y-5">
                
                {/* Score Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Sample ATS Keyword Match</span>
                    <span className="text-emerald-400">94 / 100</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full w-[94%] rounded-full transition-all duration-1000"></div>
                  </div>
                </div>

                {/* Simulated Detected Skills Tags */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400">Matched Core Qualifications:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Python', 'FastAPI', 'React 19', 'TypeScript', 'MongoDB', 'REST APIs', 'ChromaDB'].map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Agent Recommendation Teaser */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">AI Coach Advice (Demo Output)</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      "Strong backend alignment! Add 1 project demonstrating Docker or Kubernetes deployment to achieve a 98% match for Senior Backend roles."
                    </p>
                  </div>
                </div>

              </div>

              {/* Footer Indicator */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Random Forest ML Eligibility Verified</span>
                </span>
                <span className="text-indigo-400 font-bold">Interactive Preview</span>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Metrics Bar */}
        <div className="mt-20 pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="text-2xl font-extrabold text-white gradient-text">RAG Search</div>
            <div className="text-xs text-slate-400 font-medium mt-1">ChromaDB Vector Store</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="text-2xl font-extrabold text-white gradient-text">Random Forest</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Scikit-Learn Job Classifier</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="text-2xl font-extrabold text-white gradient-text">LangGraph</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Autonomous Agent Engine</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="text-2xl font-extrabold text-white gradient-text">JWT & MongoDB</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Encrypted Atlas Storage</div>
          </div>
        </div>

      </div>
    </section>
  );
};
