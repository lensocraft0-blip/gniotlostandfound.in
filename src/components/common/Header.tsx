import React, { useState } from 'react';
import { PageId } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { GniotLogo } from './GniotLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { Bell, Shield, User as UserIcon, Menu, X, Database, LogOut } from 'lucide-react';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  unreadCount?: number;
  onOpenSupabaseGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  unreadCount = 0,
  onOpenSupabaseGuide,
}) => {
  const { user, isAdmin, signOut, isConfigured } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleNav = (page: PageId) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8EDF2]/10 bg-[#1D1020]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Zone 1: Official GNIOT Logo & Wordmark */}
        <button
          onClick={() => handleNav('landing')}
          className="text-left shrink-0 transition-opacity hover:opacity-90 flex items-center"
          aria-label="GNIOT Lost and Found Home"
        >
          <GniotLogo size="md" showSubtitle />
        </button>

        {/* Zone 2: Concise Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#BFC8D2]">
          <button
            onClick={() => handleNav('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#E8EDF2] ${
              currentPage === 'dashboard' ? 'text-[#D9A441] font-semibold' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNav('browse')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#E8EDF2] ${
              currentPage === 'browse' ? 'text-[#D9A441] font-semibold' : ''
            }`}
          >
            Browse Registry
          </button>
          <button
            onClick={() => handleNav('ai_matches')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#E8EDF2] ${
              currentPage === 'ai_matches' ? 'text-[#D9A441] font-semibold' : ''
            }`}
          >
            AI Matches
          </button>
          <button
            onClick={() => handleNav('visual_search')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#E8EDF2] ${
              currentPage === 'visual_search' ? 'text-[#D9A441] font-semibold' : ''
            }`}
          >
            Visual Search
          </button>
          <button
            onClick={() => handleNav('aura_assistant')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#E8EDF2] ${
              currentPage === 'aura_assistant' ? 'text-[#D9A441] font-semibold' : ''
            }`}
          >
            AURA AI
          </button>
          <button
            onClick={() => handleNav('campus_locations')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#E8EDF2] ${
              currentPage === 'campus_locations' ? 'text-[#D9A441] font-semibold' : ''
            }`}
          >
            Campus Locations
          </button>
        </nav>

        {/* Zone 3: Primary Action & User Drawer */}
        <div className="flex items-center gap-3 shrink-0">
          <PWAInstallButton compact />

          {/* Database Setup Button */}
          <button
            onClick={onOpenSupabaseGuide}
            className={`p-2 rounded-lg border transition-colors ${
              isConfigured
                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                : 'border-[#D9A441]/40 text-[#D9A441] bg-[#D9A441]/10 hover:bg-[#D9A441]/20'
            }`}
            title={isConfigured ? 'Supabase connected' : 'Supabase setup required'}
            aria-label="Database Configuration"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Notifications */}
          {user && (
            <button
              onClick={() => handleNav('notifications')}
              className="relative p-2 rounded-lg text-[#BFC8D2] hover:text-[#E8EDF2] hover:bg-[#30152F] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D9A441] ring-2 ring-[#1D1020]" />
              )}
            </button>
          )}

          {/* User Profile or Sign In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-[#E8EDF2]/10 bg-[#30152F]/60 hover:border-[#D9A441]/50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#D9A441] text-[#1D1020] font-bold text-xs flex items-center justify-center">
                  {user.display_name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-[#E8EDF2] hidden sm:inline max-w-[110px] truncate">
                  {user.display_name}
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-mono text-[#D9A441] bg-[#D9A441]/10 px-1 rounded border border-[#D9A441]/30">
                    ADMIN
                  </span>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl glass-card bg-[#1D1020] border border-[#E8EDF2]/15 shadow-2xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-[#E8EDF2]/10">
                    <p className="font-semibold text-[#E8EDF2] truncate">{user.display_name}</p>
                    <p className="text-[#BFC8D2] text-[11px] truncate">{user.email}</p>
                    <span className="text-[10px] font-mono uppercase text-[#D9A441] mt-0.5 block">
                      {user.campus_role} {isAdmin ? '· Campus Administrator' : ''}
                    </span>
                  </div>

                  <button
                    onClick={() => handleNav('profile_settings')}
                    className="w-full px-4 py-2 text-left text-[#E8EDF2] hover:bg-[#30152F] flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#D9A441]" />
                    <span>Profile &amp; Settings</span>
                  </button>

                  <button
                    onClick={() => handleNav('my_reports')}
                    className="w-full px-4 py-2 text-left text-[#E8EDF2] hover:bg-[#30152F] flex items-center gap-2"
                  >
                    <span>My Reports</span>
                  </button>

                  <button
                    onClick={() => handleNav('my_claims')}
                    className="w-full px-4 py-2 text-left text-[#E8EDF2] hover:bg-[#30152F] flex items-center gap-2"
                  >
                    <span>My Claims</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleNav('admin_dashboard')}
                      className="w-full px-4 py-2 text-left text-[#D9A441] hover:bg-[#30152F] flex items-center gap-2 font-medium"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#D9A441]" />
                      <span>Administrator Portal</span>
                    </button>
                  )}

                  <div className="border-t border-[#E8EDF2]/10 my-1 pt-1">
                    <button
                      onClick={() => {
                        signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#30152F] flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNav('login')}
                className="text-xs font-medium text-[#BFC8D2] hover:text-[#E8EDF2] px-2.5 py-1.5"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Report Item Action Button */}
          <button
            onClick={() => handleNav(user ? 'report_lost' : 'login')}
            className="px-3.5 py-2 text-xs font-semibold text-[#1D1020] bg-[#D9A441] rounded-lg hover:bg-[#F3C35C] transition-colors whitespace-nowrap shadow-sm"
          >
            Report Item
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#BFC8D2] hover:text-[#E8EDF2]"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8EDF2]/10 bg-[#1D1020] px-4 py-3 space-y-2 text-sm">
          <button
            onClick={() => handleNav('dashboard')}
            className="block w-full text-left py-2 text-[#E8EDF2] font-medium"
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNav('browse')}
            className="block w-full text-left py-2 text-[#BFC8D2] hover:text-[#E8EDF2]"
          >
            Browse Registry
          </button>
          <button
            onClick={() => handleNav('report_lost')}
            className="block w-full text-left py-2 text-[#D9A441] font-medium"
          >
            Report Lost Item
          </button>
          <button
            onClick={() => handleNav('report_found')}
            className="block w-full text-left py-2 text-[#D9A441] font-medium"
          >
            Report Found Item
          </button>
          <button
            onClick={() => handleNav('ai_matches')}
            className="block w-full text-left py-2 text-[#BFC8D2] hover:text-[#E8EDF2]"
          >
            AI Matches
          </button>
          <button
            onClick={() => handleNav('visual_search')}
            className="block w-full text-left py-2 text-[#BFC8D2] hover:text-[#E8EDF2]"
          >
            Visual Search
          </button>
          <button
            onClick={() => handleNav('aura_assistant')}
            className="block w-full text-left py-2 text-[#BFC8D2] hover:text-[#E8EDF2]"
          >
            AURA AI Assistant
          </button>
          <button
            onClick={() => handleNav('campus_locations')}
            className="block w-full text-left py-2 text-[#BFC8D2] hover:text-[#E8EDF2]"
          >
            Campus Locations &amp; Desks
          </button>
          {isAdmin && (
            <button
              onClick={() => handleNav('admin_dashboard')}
              className="block w-full text-left py-2 text-[#D9A441] font-medium"
            >
              Administrator Portal
            </button>
          )}
        </div>
      )}
    </header>
  );
};
