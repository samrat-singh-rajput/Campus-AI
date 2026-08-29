import React from 'react';
import { Heart, Globe, Share2, MessageSquare, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 py-16 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/logo-icon.png"
                alt="CampusMate AI Emblem"
                className="h-[38px] sm:h-[44px] w-auto object-contain drop-shadow-md"
              />
              <span className="text-xl font-extrabold text-white tracking-tight">
                CampusMate AI
              </span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed text-xs">
              CampusMate AI is a production-quality full-stack AI career platform. Empowering students with ATS resume optimization, AI job matching, mock interview coaching, and application tracking.
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
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">AI Career Assistant</a></li>
            </ul>
          </div>

          {/* Platform Status */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Platform System Status</h4>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Core Services:</span>
                <span className="text-emerald-400 font-semibold">Active & Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AI Match Engine:</span>
                <span className="text-emerald-400 font-semibold">Fully Available</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Data Security:</span>
                <span className="text-indigo-300 font-semibold">Enterprise Encryption</span>
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
