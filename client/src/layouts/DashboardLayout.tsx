import React, { useState } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { TopHeader } from '../components/dashboard/TopHeader';
import { DashboardView } from '../views/DashboardView';
import { ResumeView } from '../views/ResumeView';
import { PlaceholderView } from '../views/PlaceholderView';

interface DashboardLayoutProps {
  user: any;
  onLogout: () => void;
  onGoHome: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, onGoHome }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={user}
        onLogout={onLogout}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onGoHome={onGoHome}
      />

      {/* Main Workspace Area (Margin Left on Desktop for Fixed Sidebar) */}
      <div className="flex-1 lg:pl-72 flex flex-col">
        
        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          user={user}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onLogout={onLogout}
          onGoHome={onGoHome}
        />

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' ? (
            <DashboardView user={user} onSelectTab={setActiveTab} atsScore={atsScore} />
          ) : activeTab === 'resume' ? (
            <ResumeView
              user={user}
              onBackToDashboard={() => setActiveTab('dashboard')}
              onResumeParsed={(score) => setAtsScore(score)}
            />
          ) : (
            <PlaceholderView
              tabId={activeTab}
              user={user}
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          )}
        </main>

      </div>

    </div>
  );
};
