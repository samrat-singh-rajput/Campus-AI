import React from 'react';
import { Sparkles, Heart, Globe, Share2, MessageSquare, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 py-16 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                CampusMate AI
              </span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed text-xs">
              CampusMate AI is a production-quality full-stack AI career platform. Empowering students with ATS resume optimization, ML job matching, AI mock interviews, and application tracking.
            </p>
            <div className="flex items-center space-x-4 pt-2 text-slate-400">
              <a href="#" className="hover:text-white transition-colors" aria-label="Website"><Globe className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Share"><Share2 className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Community"><MessageSquare className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Contact Email"><Mail className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Features Suite</h4>
            <ul className="space-y-2 font-medium">
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Smart Resume Parser</a></li>
              <li><a href="#demo" className="hover:text-indigo-400 transition-colors">AI Job Matcher Simulator</a></li>
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">AI Mock Interview Coach</a></li>
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Application Kanban Board</a></li>
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">LangGraph AI Assistant</a></li>
            </ul>
          </div>

          {/* Platform Status */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Architecture Stack</h4>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Frontend:</span>
                <span className="text-slate-300">React 19 + Vite + Tailwind v4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Backend:</span>
                <span className="text-slate-300">Python FastAPI + JWT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Databases:</span>
                <span className="text-emerald-400">MongoDB Atlas + ChromaDB</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© 2026 CampusMate AI. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Campus Placement Success</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
