import React, { useEffect, useState } from 'react';
import { PageId } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { ItemReport, ItemMatch, ItemClaim, CampusNotification } from '../types/database';
import { DataService } from '../services/dataService';
import { ItemCard } from '../components/items/ItemCard';
import { GniotLogo } from '../components/common/GniotLogo';
import {
  PlusCircle,
  Search,
  Sparkles,
  Shield,
  Bell,
  FileText,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Clock,
  PackageX,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: PageId, itemId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, isConfigured } = useAuth();
  const [items, setItems] = useState<ItemReport[]>([]);
  const [myReports, setMyReports] = useState<ItemReport[]>([]);
  const [suggestedMatches, setSuggestedMatches] = useState<ItemMatch[]>([]);
  const [myClaims, setMyClaims] = useState<ItemClaim[]>([]);
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const allItems = await DataService.getItems();
      setItems(allItems);

      if (user) {
        const userReports = allItems.filter((i) => i.owner_id === user.id);
        setMyReports(userReports);

        // Fetch matches for user's lost reports
        const userLost = userReports.filter((i) => i.report_type === 'lost');
        const matchesList: ItemMatch[] = [];
        for (const lost of userLost) {
          const hits = await DataService.getSuggestedMatches(lost);
          matchesList.push(...hits);
        }
        setSuggestedMatches(matchesList);

        // Fetch user claims
        const userClaims = await DataService.getClaims({ claimant_id: user.id });
        setMyClaims(userClaims);

        // Fetch notifications
        const notifs = await DataService.getNotifications(user.id);
        setNotifications(notifs.slice(0, 5));
      }
    } catch (err: unknown) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Database query error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  return (
    <div className="space-y-10 pb-16">
      {/* Welcome & Identity Banner */}
      <div className="rounded-2xl glass-card border border-[#E8EDF2]/10 p-6 sm:p-8 bg-gradient-to-r from-[#30152F]/70 via-[#1D1020] to-[#30152F]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-3">
          <GniotLogo size="md" showSubtitle />
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#E8EDF2]">
              {user ? `Welcome back, ${user.display_name}` : 'GNIOT Campus Recovery Network'}
            </h1>
            <p className="text-xs text-[#BFC8D2] max-w-xl leading-relaxed">
              Real-time campus lost property registry for Greater Noida Institute of Technology. Search reports, track verified ownership claims, and check AI heuristic matches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate(user ? 'report_lost' : 'login')}
            className="px-4 py-2.5 rounded-xl bg-[#D9A441] text-[#1D1020] text-xs font-semibold hover:bg-[#F3C35C] transition-colors flex items-center gap-1.5 shadow-md whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Lost</span>
          </button>
          <button
            onClick={() => onNavigate(user ? 'report_found' : 'login')}
            className="px-4 py-2.5 rounded-xl border border-[#E8EDF2]/20 bg-[#30152F]/80 text-[#E8EDF2] text-xs font-semibold hover:border-[#D9A441]/40 transition-colors whitespace-nowrap"
          >
            <span>Report Found</span>
          </button>
        </div>
      </div>

      {/* Database Error Banner if Request Fails */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>Database query encountered an issue: {error}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600 text-white font-medium flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Query</span>
          </button>
        </div>
      )}

      {/* Metrics Row (Derived strictly from genuine records) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-card border border-[#E8EDF2]/10">
          <span className="text-xs text-[#BFC8D2]">Active Database Reports</span>
          <p className="text-2xl font-bold font-display text-[#E8EDF2] mt-1 tabular-nums">
            {items.filter((i) => i.status === 'open').length}
          </p>
        </div>

        <div className="p-4 rounded-xl glass-card border border-[#E8EDF2]/10">
          <span className="text-xs text-[#BFC8D2]">My Filed Reports</span>
          <p className="text-2xl font-bold font-display text-[#E8EDF2] mt-1 tabular-nums">
            {myReports.length}
          </p>
        </div>

        <div className="p-4 rounded-xl glass-card border border-[#E8EDF2]/10">
          <span className="text-xs text-[#BFC8D2]">Matching Candidates</span>
          <p className="text-2xl font-bold font-display text-[#D9A441] mt-1 tabular-nums">
            {suggestedMatches.length}
          </p>
        </div>

        <div className="p-4 rounded-xl glass-card border border-[#E8EDF2]/10">
          <span className="text-xs text-[#BFC8D2]">My Active Claims</span>
          <p className="text-2xl font-bold font-display text-emerald-400 mt-1 tabular-nums">
            {myClaims.length}
          </p>
        </div>
      </div>

      {/* Suggested AI Matches (If any genuine match records exist) */}
      {suggestedMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D9A441]" />
              <h2 className="text-lg font-bold font-display text-[#E8EDF2]">
                Possible Match Candidates ({suggestedMatches.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('ai_matches')}
              className="text-xs font-semibold text-[#D9A441] hover:underline flex items-center gap-1"
            >
              <span>Inspect Match Explanations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestedMatches.slice(0, 2).map((match) => (
              <div
                key={match.id}
                className="p-5 rounded-xl glass-card border border-[#D9A441]/40 bg-[#30152F]/40 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#D9A441]">
                    Compatibility: {match.score}%
                  </span>
                  <span className="text-[11px] text-[#BFC8D2]">Heuristic Engine</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#E8EDF2]">
                    {match.found_item?.title || 'Found Belonging'}
                  </p>
                  <p className="text-[#BFC8D2] text-[11px] leading-relaxed whitespace-pre-wrap mt-1">
                    {match.explanation}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('item_details', match.found_item_id)}
                    className="px-3 py-1.5 rounded-lg bg-[#D9A441] text-[#1D1020] font-semibold hover:bg-[#F3C35C] transition-colors"
                  >
                    View Found Item &amp; Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Grid: Real Database Reports & User Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Real Reports */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-display text-[#E8EDF2]">Recent Campus Reports</h2>
              <p className="text-xs text-[#BFC8D2]">Genuine items registered in the database</p>
            </div>
            {items.length > 0 && (
              <button
                onClick={() => onNavigate('browse')}
                className="text-xs font-semibold text-[#D9A441] hover:underline"
              >
                Browse All ({items.length}) &rarr;
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-64 rounded-xl glass-card animate-pulse border border-[#E8EDF2]/10 bg-[#30152F]/20"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 rounded-2xl glass-card border border-[#E8EDF2]/10 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#30152F] border border-[#E8EDF2]/10 flex items-center justify-center text-[#BFC8D2]">
                <PackageX className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#E8EDF2]">No reports in database yet</p>
                <p className="text-xs text-[#BFC8D2] max-w-sm mx-auto">
                  Be the first to file a lost or found report on the GNIOT campus network.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate(user ? 'report_lost' : 'login')}
                  className="px-4 py-2 rounded-lg bg-[#D9A441] text-[#1D1020] text-xs font-semibold hover:bg-[#F3C35C]"
                >
                  Report Lost Item
                </button>
                <button
                  onClick={() => onNavigate(user ? 'report_found' : 'login')}
                  className="px-4 py-2 rounded-lg border border-[#E8EDF2]/20 bg-[#30152F] text-xs text-[#E8EDF2]"
                >
                  Report Found Item
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.slice(0, 4).map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onSelect={(i) => onNavigate('item_details', i.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): User Activity & Security Desks */}
        <div className="lg:col-span-4 space-y-6">
          {/* User's Reports */}
          <div className="p-5 rounded-xl glass-card border border-[#E8EDF2]/10 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold font-display text-[#E8EDF2] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#D9A441]" />
                <span>My Reports</span>
              </h3>
              {user && myReports.length > 0 && (
                <button
                  onClick={() => onNavigate('my_reports')}
                  className="text-[11px] text-[#D9A441] hover:underline"
                >
                  Manage ({myReports.length})
                </button>
              )}
            </div>

            {!user ? (
              <div className="py-3 text-center space-y-2">
                <p className="text-[#BFC8D2]">Sign in to track your reported belongings.</p>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3 py-1.5 rounded-lg bg-[#30152F] border border-[#D9A441]/40 text-[#D9A441] font-semibold"
                >
                  Sign In
                </button>
              </div>
            ) : myReports.length === 0 ? (
              <p className="text-[#BFC8D2]/70 py-2">You have not reported any items yet.</p>
            ) : (
              <div className="space-y-2">
                {myReports.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => onNavigate('item_details', r.id)}
                    className="p-2.5 rounded-lg bg-[#130b15]/60 hover:bg-[#30152F] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-[#E8EDF2] truncate max-w-[170px]">{r.title}</span>
                      <span className="text-[10px] uppercase font-mono text-[#D9A441]">
                        {r.report_type}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#BFC8D2]/70">{r.campus_location}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User's Notifications */}
          {user && (
            <div className="p-5 rounded-xl glass-card border border-[#E8EDF2]/10 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold font-display text-[#E8EDF2] flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-[#D9A441]" />
                  <span>Recent Notifications</span>
                </h3>
                {notifications.length > 0 && (
                  <button
                    onClick={() => onNavigate('notifications')}
                    className="text-[11px] text-[#D9A441] hover:underline"
                  >
                    View All
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="text-[#BFC8D2]/70 py-2">No new notifications.</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onNavigate('notifications')}
                      className="p-2.5 rounded-lg bg-[#130b15]/60 hover:bg-[#30152F] cursor-pointer transition-colors space-y-0.5"
                    >
                      <p className="font-medium text-[#E8EDF2]">{n.title}</p>
                      <p className="text-[11px] text-[#BFC8D2] line-clamp-1">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Campus Desk Info */}
          <div className="p-5 rounded-xl glass-card border border-[#D9A441]/20 bg-[#30152F]/40 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-[#D9A441] font-semibold">
              <Shield className="w-4 h-4" />
              <span>Gate 1 Security &amp; Admin Block</span>
            </div>
            <p className="text-[#BFC8D2] text-[11px] leading-relaxed">
              Drop off or collect verified belongings at Main Gate 1 Security Desk. Bring your physical GNIOT Student ID card.
            </p>
            <button
              onClick={() => onNavigate('campus_locations')}
              className="text-[#D9A441] text-[11px] font-semibold hover:underline"
            >
              Check campus desks &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
