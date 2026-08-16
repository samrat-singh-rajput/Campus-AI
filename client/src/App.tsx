import React, { useEffect, useState } from 'react';
import { checkHealth } from './services/api';
import type { HealthResponse } from './services/api';
import { fetchMyProfile } from './services/authService';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { LiveDemo } from './components/LiveDemo';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { HealthStatus } from './components/HealthStatus';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { DashboardLayout } from './layouts/DashboardLayout';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  // User Auth & View state
  const [user, setUser] = useState<any | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const fetchStatus = async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch (err: any) {
      setHealthError(err.message || 'Failed to connect to CampusMate AI backend API');
    } finally {
      setLoadingHealth(false);
    }
  };

  // Check stored JWT token on load
  const checkAuthToken = async () => {
    const token = localStorage.getItem('campusmate_token');
    if (token) {
      try {
        const profile = await fetchMyProfile();
        setUser(profile);
        setCurrentView('dashboard'); // Default to dashboard for authenticated users
      } catch (e) {
        localStorage.removeItem('campusmate_token');
        setUser(null);
        setCurrentView('landing');
      }
    }
  };

  useEffect(() => {
    fetchStatus();
    checkAuthToken();
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (userData: any, _token: string) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('campusmate_token');
    setUser(null);
    setCurrentView('landing');
  };

  // Protected View Routing logic
  if (currentView === 'dashboard') {
    if (!user) {
      // Unauthenticated access protection
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
          <div className="glass-card max-w-md w-full p-8 rounded-3xl text-center space-y-4">
            <h2 className="text-xl font-bold text-white">Protected Dashboard Access</h2>
            <p className="text-xs text-slate-400">Please log in to your student account to access the dashboard.</p>
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => { setCurrentView('landing'); handleOpenAuth('login'); }}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-xs"
              >
                Log In
              </button>
              <button
                onClick={() => setCurrentView('landing')}
                className="flex-1 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl font-semibold text-xs"
              >
                Landing Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <DashboardLayout
        user={user}
        onLogout={handleLogout}
        onGoHome={() => setCurrentView('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Authenticated user top banner on Landing Page */}
      {user && (
        <div className="bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border-b border-indigo-500/30 px-4 py-2 text-center text-xs font-semibold text-indigo-300 flex items-center justify-center space-x-2">
          <span>Logged in as <strong>{user.name}</strong></span>
          <span>•</span>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="underline font-bold hover:text-white transition-colors"
          >
            Go to Student Dashboard →
          </button>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Landing Sections */}
      <main className="flex-1">
        <Hero onOpenAuth={handleOpenAuth} />
        <Features />
        <LiveDemo />
        <HowItWorks />
        <Testimonials />
        <HealthStatus
          health={health}
          loading={loadingHealth}
          error={healthError}
          onRefresh={fetchStatus}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Pop-up Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default App;
