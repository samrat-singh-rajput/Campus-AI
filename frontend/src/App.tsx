import React, { useEffect, useState } from 'react';
import { checkHealth } from './services/api';
import type { HealthResponse } from './services/api';
import { fetchMyProfile } from './services/authService';
import { fetchAdminProfile, logoutAdmin } from './services/adminAuthService';
import type { AdminUser } from './services/adminAuthService';
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
import { GlobalLoader } from './components/GlobalLoader';
import { AdminLoginPage } from './views/admin/AdminLoginPage';
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { AdminUsersView } from './views/admin/AdminUsersView';
import { AdminJobsView } from './views/admin/AdminJobsView';
import { AdminApplicationsView } from './views/admin/AdminApplicationsView';
import { AdminResumesView } from './views/admin/AdminResumesView';
import { AdminInterviewsView } from './views/admin/AdminInterviewsView';
import { AdminSystemHealthView } from './views/admin/AdminSystemHealthView';
import { AdminAnalyticsView } from './views/admin/AdminAnalyticsView';
import { AdminAuditLogsView } from './views/admin/AdminAuditLogsView';
import { AdminSettingsView } from './views/admin/AdminSettingsView';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  // User Auth & View state
  const [user, setUser] = useState<any | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'admin_login' | 'admin_dashboard' | 'admin_users' | 'admin_jobs' | 'admin_applications' | 'admin_resumes' | 'admin_interviews' | 'admin_health' | 'admin_analytics' | 'admin_audit' | 'admin_settings'>('landing');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

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

  // Check stored student & admin tokens on load / route check
  const checkAuthToken = async () => {
    const pathname = window.location.pathname;

    if (pathname.startsWith('/admin/')) {
      const adminToken = localStorage.getItem('campusmate_admin_token');
      if (adminToken) {
        try {
          const adminProfile = await fetchAdminProfile();
          setAdminUser(adminProfile);
          if (pathname === '/admin/login') {
            window.history.replaceState({}, '', '/admin/dashboard');
            setCurrentView('admin_dashboard');
          } else if (pathname === '/admin/users') {
            setCurrentView('admin_users');
          } else if (pathname === '/admin/jobs') {
            setCurrentView('admin_jobs');
          } else if (pathname === '/admin/applications') {
            setCurrentView('admin_applications');
          } else if (pathname === '/admin/resumes') {
            setCurrentView('admin_resumes');
          } else if (pathname === '/admin/interviews') {
            setCurrentView('admin_interviews');
          } else if (pathname === '/admin/system-health') {
            setCurrentView('admin_health');
          } else if (pathname === '/admin/analytics') {
            setCurrentView('admin_analytics');
          } else if (pathname === '/admin/audit-logs') {
            setCurrentView('admin_audit');
          } else if (pathname === '/admin/settings') {
            setCurrentView('admin_settings');
          } else {
            setCurrentView('admin_dashboard');
          }
          return;
          return;
        } catch (e) {
          logoutAdmin();
          setAdminUser(null);
        }
      }

      if (pathname !== '/admin/login') {
        window.history.replaceState({}, '', '/admin/login');
        setAdminNotice('Please log in as an administrator to continue.');
        setCurrentView('admin_login');
      } else {
        setCurrentView('admin_login');
      }
      return;
    }

    // Default Student Auth check
    const token = localStorage.getItem('campusmate_token');
    if (token) {
      try {
        const profile = await fetchMyProfile();
        setUser(profile);
        setCurrentView('dashboard');
      } catch (e) {
        localStorage.removeItem('campusmate_token');
        setUser(null);
        setCurrentView('landing');
      }
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    const maxAttempts = 8;

    const checkWithRetry = async () => {
      try {
        const data = await checkHealth();
        setHealth(data);
        setHealthError(null);
        setLoadingHealth(false);
      } catch (err: any) {
        attempts += 1;
        if (attempts < maxAttempts) {
          timer = setTimeout(checkWithRetry, 2000);
        } else {
          setHealthError(err.message || 'Failed to connect to CampusMate AI backend API');
          setLoadingHealth(false);
        }
      }
    };

    checkWithRetry();
    checkAuthToken();

    const handlePopState = () => {
      checkAuthToken();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('popstate', handlePopState);
    };
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

  const handleAdminLoginSuccess = (admin: AdminUser) => {
    setAdminUser(admin);
    setAdminNotice(null);
    window.history.pushState({}, '', '/admin/dashboard');
    setCurrentView('admin_dashboard');
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setAdminUser(null);
    setAdminNotice(null);
    window.history.pushState({}, '', '/admin/login');
    setCurrentView('admin_login');
  };

  const handleAdminNavigateTab = (tab: string) => {
    if (tab === 'users') {
      window.history.pushState({}, '', '/admin/users');
      setCurrentView('admin_users');
    } else if (tab === 'jobs') {
      window.history.pushState({}, '', '/admin/jobs');
      setCurrentView('admin_jobs');
    } else if (tab === 'applications') {
      window.history.pushState({}, '', '/admin/applications');
      setCurrentView('admin_applications');
    } else if (tab === 'resumes') {
      window.history.pushState({}, '', '/admin/resumes');
      setCurrentView('admin_resumes');
    } else if (tab === 'interviews') {
      window.history.pushState({}, '', '/admin/interviews');
      setCurrentView('admin_interviews');
    } else if (tab === 'health') {
      window.history.pushState({}, '', '/admin/system-health');
      setCurrentView('admin_health');
    } else if (tab === 'analytics') {
      window.history.pushState({}, '', '/admin/analytics');
      setCurrentView('admin_analytics');
    } else if (tab === 'audit-logs') {
      window.history.pushState({}, '', '/admin/audit-logs');
      setCurrentView('admin_audit');
    } else if (tab === 'settings') {
      window.history.pushState({}, '', '/admin/settings');
      setCurrentView('admin_settings');
    } else if (tab === 'dashboard') {
      window.history.pushState({}, '', '/admin/dashboard');
      setCurrentView('admin_dashboard');
    }
  };

  // Render Admin Login
  if (currentView === 'admin_login') {
    return (
      <AdminLoginPage
        onLoginSuccess={handleAdminLoginSuccess}
        noticeMessage={adminNotice}
      />
    );
  }

  // Render Admin Dashboard
  if (currentView === 'admin_dashboard') {
    if (!adminUser) {
      return (
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          noticeMessage="Please log in as an administrator to continue."
        />
      );
    }
    return (
      <AdminDashboardView
        admin={adminUser}
        onLogout={handleAdminLogout}
        onNavigateTab={handleAdminNavigateTab}
      />
    );
  }

  // Render Admin Users Management
  if (currentView === 'admin_users') {
    if (!adminUser) {
      return (
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          noticeMessage="Please log in as an administrator to continue."
        />
      );
    }
    return (
      <AdminUsersView
        admin={adminUser}
        onLogout={handleAdminLogout}
        onNavigateTab={handleAdminNavigateTab}
      />
    );
  }

  // Render Admin Jobs Management
  if (currentView === 'admin_jobs') {
    if (!adminUser) {
      return (
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          noticeMessage="Please log in as an administrator to continue."
        />
      );
    }
    return (
      <AdminJobsView
        admin={adminUser}
        onLogout={handleAdminLogout}
        onNavigateTab={handleAdminNavigateTab}
      />
    );
  }

  // Render Admin Applications Management
  if (currentView === 'admin_applications') {
    if (!adminUser) {
      return (
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          noticeMessage="Please log in as an administrator to continue."
        />
      );
    }
    return (
      <AdminApplicationsView
        admin={adminUser}
        onLogout={handleAdminLogout}
        onNavigateTab={handleAdminNavigateTab}
      />
    );
  }

  // Render Admin Resumes & ATS Analytics
  if (currentView === 'admin_resumes') {
    if (!adminUser) {
      return (
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          noticeMessage="Please log in as an administrator to continue."
        />
      );
    }
    return (
      <AdminResumesView
        admin={adminUser}
        onLogout={handleAdminLogout}
        onNavigateTab={handleAdminNavigateTab}
      />
    );
  }

  // Render Admin Interviews & AI Analytics
  if (currentView === 'admin_interviews') {
    if (!adminUser) {
      return (
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          noticeMessage="Please log in as an administrator to continue."
        />
      );
    }
    return (
      <AdminInterviewsView
        admin={adminUser}
        onLogout={handleAdminLogout}
        onNavigateTab={handleAdminNavigateTab}
      />
    );
  }

  // Render Admin System Health & Infrastructure Monitoring
  if (currentView === 'admin_health') {
    if (!adminUser) {
      return (
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          noticeMessage="Please log in as an administrator to continue."
        />
      );
    }
    return (
      <AdminSystemHealthView
        admin={adminUser}
        onLogout={handleAdminLogout}
        onNavigateTab={handleAdminNavigateTab}
      />
    );
  }

  // Render Admin Analytics & Reports
  if (currentView === 'admin_analytics') {
    if (!adminUser) {
      return (
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          noticeMessage="Please log in as an administrator to continue."
        />
      );
    }
    return (
      <AdminAnalyticsView
        admin={adminUser}
        onLogout={handleAdminLogout}
        onNavigateTab={handleAdminNavigateTab}
      />
    );
  }

  // Render Admin Audit Logs & Activity Tracking
  if (currentView === 'admin_audit') {
    if (!adminUser) {
      return (
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          noticeMessage="Please log in as an administrator to continue."
        />
      );
    }
    return (
      <AdminAuditLogsView
        admin={adminUser}
        onLogout={handleAdminLogout}
        onNavigateTab={handleAdminNavigateTab}
      />
    );
  }

  // Render Admin Settings & Platform Configuration
  if (currentView === 'admin_settings') {
    if (!adminUser) {
      return (
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          noticeMessage="Please log in as an administrator to continue."
        />
      );
    }
    return (
      <AdminSettingsView
        admin={adminUser}
        onLogout={handleAdminLogout}
        onNavigateTab={handleAdminNavigateTab}
      />
    );
  }

  return (
    <>
      <GlobalLoader />
      {currentView === 'dashboard' ? (
        !user ? (
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
        ) : (
          <DashboardLayout
            user={user}
            onLogout={handleLogout}
            onGoHome={() => setCurrentView('landing')}
          />
        )
      ) : (
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
      )}
    </>
  );
};

export default App;
