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

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  // User Auth state
  const [user, setUser] = useState<any | null>(null);
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
      } catch (e) {
        localStorage.removeItem('campusmate_token');
        setUser(null);
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
  };

  const handleLogout = () => {
    localStorage.removeItem('campusmate_token');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
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
