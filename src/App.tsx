import React, { useState, useEffect } from 'react';
import { PageId, NavigationState } from './types/navigation';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { OfflineBanner } from './components/common/OfflineBanner';
import { SupabaseSetupModal } from './components/common/SupabaseSetupModal';
import { DataService } from './services/dataService';

// Pages
import { LandingPage } from './pages/LandingPage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { AuthRecoveryPage } from './pages/AuthRecoveryPage';
import { OnboardingProfilePage } from './pages/OnboardingProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportLostPage } from './pages/ReportLostPage';
import { ReportFoundPage } from './pages/ReportFoundPage';
import { BrowseReportsPage } from './pages/BrowseReportsPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { AIMatchesPage } from './pages/AIMatchesPage';
import { VisualSearchPage } from './pages/VisualSearchPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { MyClaimsPage } from './pages/MyClaimsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuraAssistantPage } from './pages/AuraAssistantPage';
import { CampusLocationsPage } from './pages/CampusLocationsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { AdminClaimsPage } from './pages/AdminClaimsPage';
import { AdminAuditPage } from './pages/AdminAuditPage';
import { OfflineStatePage } from './pages/OfflineStatePage';
import { NotFoundPage } from './pages/NotFoundPage';

function AppContent() {
  const { user, isConfigured } = useAuth();
  const [navState, setNavState] = useState<NavigationState>({
    page: 'landing',
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Sync hash routing for GitHub Pages and deep linking
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) return;

      const [pagePart, paramPart] = hash.split('/');
      const validPages: PageId[] = [
        'landing',
        'signup',
        'login',
        'auth_recovery',
        'onboarding',
        'dashboard',
        'report_lost',
        'report_found',
        'browse',
        'item_details',
        'ai_matches',
        'visual_search',
        'my_reports',
        'my_claims',
        'notifications',
        'aura_assistant',
        'campus_locations',
        'profile_settings',
        'admin_dashboard',
        'admin_reports',
        'admin_claims',
        'admin_audit',
        'offline_state',
        'not_found',
      ];

      if (validPages.includes(pagePart as PageId)) {
        setNavState({
          page: pagePart as PageId,
          itemId: paramPart,
        });
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const navigateTo = (page: PageId, itemId?: string) => {
    setNavState({ page, itemId });
    const targetHash = itemId ? `#/${page}/${itemId}` : `#/${page}`;
    window.location.hash = targetHash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Refresh notifications count
  const refreshUnreadCount = async () => {
    if (user) {
      try {
        const notifs = await DataService.getNotifications(user.id);
        const unread = notifs.filter((n) => !n.read_at).length;
        setUnreadCount(unread);
      } catch {
        // Safe fail
      }
    }
  };

  useEffect(() => {
    refreshUnreadCount();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-[#1D1020] text-[#E8EDF2]">
      {/* Global Connectivity Banner */}
      <OfflineBanner onOpenOfflinePage={() => navigateTo('offline_state')} />

      {/* Header */}
      <Header
        currentPage={navState.page}
        onNavigate={navigateTo}
        unreadCount={unreadCount}
        onOpenSupabaseGuide={() => setIsSetupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {navState.page === 'landing' && <LandingPage onNavigate={navigateTo} />}
        {navState.page === 'signup' && <SignUpPage onNavigate={navigateTo} />}
        {navState.page === 'login' && <LoginPage onNavigate={navigateTo} />}
        {navState.page === 'auth_recovery' && <AuthRecoveryPage onNavigate={navigateTo} />}
        {navState.page === 'onboarding' && <OnboardingProfilePage onNavigate={navigateTo} />}
        {navState.page === 'dashboard' && <DashboardPage onNavigate={navigateTo} />}
        {navState.page === 'report_lost' && <ReportLostPage onNavigate={navigateTo} />}
        {navState.page === 'report_found' && <ReportFoundPage onNavigate={navigateTo} />}
        {navState.page === 'browse' && <BrowseReportsPage onNavigate={navigateTo} />}
        {navState.page === 'item_details' && (
          <ItemDetailsPage itemId={navState.itemId || ''} onNavigate={navigateTo} />
        )}
        {navState.page === 'ai_matches' && <AIMatchesPage onNavigate={navigateTo} />}
        {navState.page === 'visual_search' && <VisualSearchPage onNavigate={navigateTo} />}
        {navState.page === 'my_reports' && <MyReportsPage onNavigate={navigateTo} />}
        {navState.page === 'my_claims' && <MyClaimsPage onNavigate={navigateTo} />}
        {navState.page === 'notifications' && (
          <NotificationsPage onNavigate={navigateTo} onRefreshUnreadCount={refreshUnreadCount} />
        )}
        {navState.page === 'aura_assistant' && <AuraAssistantPage onNavigate={navigateTo} />}
        {navState.page === 'campus_locations' && <CampusLocationsPage onNavigate={navigateTo} />}
        {navState.page === 'profile_settings' && <UserProfilePage onNavigate={navigateTo} />}
        {navState.page === 'admin_dashboard' && <AdminDashboardPage onNavigate={navigateTo} />}
        {navState.page === 'admin_reports' && <AdminReportsPage onNavigate={navigateTo} />}
        {navState.page === 'admin_claims' && <AdminClaimsPage onNavigate={navigateTo} />}
        {navState.page === 'admin_audit' && <AdminAuditPage onNavigate={navigateTo} />}
        {navState.page === 'offline_state' && <OfflineStatePage onNavigate={navigateTo} />}
        {navState.page === 'not_found' && <NotFoundPage onNavigate={navigateTo} />}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Supabase Connection & Migration Guide Modal */}
      <SupabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
