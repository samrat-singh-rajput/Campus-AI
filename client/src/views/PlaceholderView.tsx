import React from 'react';
import { ArrowLeft, Clock, ShieldCheck } from 'lucide-react';
import { NAV_ITEMS } from '../components/dashboard/Sidebar';

interface PlaceholderViewProps {
  tabId: string;
  user: any;
  onBackToDashboard: () => void;
}

const STEP_DETAILS: Record<string, { title: string; subtitle: string; targetStep: string; features: string[] }> = {
  assistant: {
    title: 'LangGraph Autonomous AI Agent',
    subtitle: 'Multi-tool agent powered by LangGraph, ChromaDB vector store, and LLM APIs.',
    targetStep: 'STEP 9 — LangGraph AI Agent Orchestration',
    features: [
      'Interactive chat interface with career vector search',
      'Custom tools for salary benchmarking & cover letter creation',
      'Persistent conversation context & RAG document grounding'
    ]
  },
  resume: {
    title: 'Smart Resume Parsing & Upload Service',
    subtitle: 'Upload PDF resumes to extract structured skills, work history, and ATS optimization score.',
    targetStep: 'STEP 5 — Resume Parsing & Upload Service',
    features: [
      'PyPDF text extraction & metadata parser',
      'ATS score & missing keyword identifier',
      'MongoDB Atlas resume document store integration'
    ]
  },
  jobs: {
    title: 'Job Matches & Eligibility Classifier',
    subtitle: 'Scikit-Learn Random Forest model calculating candidate job match percentages.',
    targetStep: 'STEP 7 & 8 — ML Job Recommendation & Eligibility Engine',
    features: [
      'Random Forest ML feature extraction & scoring',
      'Job database CRUD & filtering engine',
      'Detailed skill gap breakdown & candidate probability score'
    ]
  },
  applications: {
    title: 'Application Kanban Pipeline Tracker',
    subtitle: 'Drag-and-drop visual application tracking board for all your campus drives.',
    targetStep: 'STEP 11 — Application Kanban Tracker',
    features: [
      'Drag-and-drop columns: Saved, Applied, Interviewing, Offered',
      'Application deadline reminders & status updates',
      'MongoDB Atlas persistence for all tracked jobs'
    ]
  },
  interview: {
    title: 'AI Mock Interview Coach',
    subtitle: 'Interactive real-time voice & text interview coach with AI feedback.',
    targetStep: 'STEP 10 — AI Mock Interview Coach',
    features: [
      'Speech-to-Text & Text-to-Speech audio integration',
      'Role-specific behavioral & technical question bank',
      'Real-time feedback on confidence, clarity, and correctness'
    ]
  },
  insights: {
    title: 'AI Career Analytics & Trend Insights',
    subtitle: 'Comprehensive market trend data, skill gap analysis, and placement statistics.',
    targetStep: 'STEP 12 — User Profile & Settings',
    features: [
      'Skill trajectory & market demand insights',
      'Historical interview performance metrics',
      'Personalized placement readiness report'
    ]
  },
  settings: {
    title: 'Account Profile & Preferences',
    subtitle: 'Manage your authenticated user profile, security settings, and university details.',
    targetStep: 'STEP 12 — User Profile & Settings',
    features: [
      'Edit user name, college, degree, and skills list',
      'Manage JWT security tokens & password reset',
      'MongoDB Atlas profile synchronization'
    ]
  }
};

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ tabId, user, onBackToDashboard }) => {
  const navItem = NAV_ITEMS.find(n => n.id === tabId) || NAV_ITEMS[0];
  const info = STEP_DETAILS[tabId] || {
    title: navItem.label,
    subtitle: 'Module placeholder ready for next development step.',
    targetStep: navItem.stepBadge || 'Upcoming Step',
    features: ['Modular component architecture ready', 'API router binding ready', 'MongoDB schema integration ready']
  };

  const IconComp = navItem.icon;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Back Button */}
      <button
        onClick={onBackToDashboard}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Main Feature Card */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 relative overflow-hidden glow-border">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-indigo-400">
              <IconComp className="w-7 h-7" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{info.title}</h2>
              <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs px-3 py-1 rounded-full font-bold">
                {info.targetStep}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">{info.subtitle}</p>
          </div>
        </div>

        {/* User Context Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-8 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authenticated User Context: <strong>{user?.name || 'Student'}</strong> ({user?.email})</span>
          </div>
          <span className="text-indigo-400 font-mono text-[11px] hidden sm:inline">JWT Token Valid</span>
        </div>

        {/* Upcoming Features Checklist */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Capabilities:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {info.features.map((feat, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-medium text-slate-300 flex items-start space-x-2">
                <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Step 4 Layout & Route Binding Verified</span>
          <button
            onClick={onBackToDashboard}
            className="text-indigo-400 hover:text-indigo-300 font-bold"
          >
            Return to Main Dashboard →
          </button>
        </div>

      </div>

    </div>
  );
};
