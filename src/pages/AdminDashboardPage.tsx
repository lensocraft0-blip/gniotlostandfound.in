import React, { useEffect, useState } from 'react';
import { PageId } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { ItemReport, ItemClaim, ItemMatch, AuditLogEntry } from '../types/database';
import { DataService } from '../services/dataService';
import {
  Shield,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  History,
  Lock,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (page: PageId, itemId?: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ItemReport[]>([]);
  const [claims, setClaims] = useState<ItemClaim[]>([]);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [audits, setAudits] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      try {
        const [allItems, allClaims, allMatches, allAudits] = await Promise.all([
          DataService.getItems(),
          DataService.getClaims(),
          DataService.getAllMatches(),
          DataService.getAuditLogs(),
        ]);
        setItems(allItems);
        setClaims(allClaims);
        setMatches(allMatches);
        setAudits(allAudits);
      } catch (err) {
        console.warn('Error loading admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  // Access check
  if (!user?.is_admin) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-display text-[#E8EDF2]">
          Restricted Administrator Area
        </h2>
        <p className="text-xs text-[#BFC8D2] leading-relaxed">
          Access to this portal is restricted to authorized campus security officers and administrators. Client-side role overrides are rejected by PostgreSQL Row Level Security (RLS).
        </p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 rounded-lg bg-[#30152F] text-xs text-[#E8EDF2] border border-[#E8EDF2]/15"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const pendingClaims = claims.filter((c) => c.status === 'pending' || c.status === 'under_review');
  const openReports = items.filter((i) => i.status === 'open');
  const resolvedReports = items.filter((i) => i.status === 'resolved' || i.status === 'claimed');

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#D9A441] mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>CAMPUS SECURITY &amp; RECOVERY CONTROL</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-[#E8EDF2]">
            Administrator Portal
          </h1>
          <p className="text-xs text-[#BFC8D2] mt-0.5">
            Verified database metrics, claim resolution desk, report moderation, and security audits.
          </p>
        </div>

        {/* Fast Jump Sub-Nav */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onNavigate('admin_reports')}
            className="px-3 py-1.5 rounded-lg border border-[#E8EDF2]/15 text-[#E8EDF2] hover:bg-[#30152F]"
          >
            Manage Reports ({items.length})
          </button>
          <button
            onClick={() => onNavigate('admin_claims')}
            className="px-3 py-1.5 rounded-lg bg-[#D9A441] text-[#1D1020] font-semibold hover:bg-[#F3C35C]"
          >
            Review Claims ({pendingClaims.length})
          </button>
          <button
            onClick={() => onNavigate('admin_audit')}
            className="px-3 py-1.5 rounded-lg border border-[#E8EDF2]/15 text-[#BFC8D2] hover:text-[#E8EDF2] hover:bg-[#30152F]"
          >
            Audit Log
          </button>
        </div>
      </div>

      {/* Real Metric Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-[#E8EDF2]/10 bg-[#1D1020]/90">
          <span className="text-xs text-[#BFC8D2]">Pending Claims</span>
          <p className="text-3xl font-bold font-display text-amber-400 mt-1 tabular-nums">
            {pendingClaims.length}
          </p>
          <span className="text-[11px] text-[#BFC8D2]/70 mt-1 block">Awaiting administrator verification</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-[#E8EDF2]/10 bg-[#1D1020]/90">
          <span className="text-xs text-[#BFC8D2]">Open Registry Reports</span>
          <p className="text-3xl font-bold font-display text-[#E8EDF2] mt-1 tabular-nums">
            {openReports.length}
          </p>
          <span className="text-[11px] text-[#BFC8D2]/70 mt-1 block">Active on campus registry</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-[#E8EDF2]/10 bg-[#1D1020]/90">
          <span className="text-xs text-[#BFC8D2]">Recovered &amp; Claimed</span>
          <p className="text-3xl font-bold font-display text-emerald-400 mt-1 tabular-nums">
            {resolvedReports.length}
          </p>
          <span className="text-[11px] text-[#BFC8D2]/70 mt-1 block">Successfully handed over</span>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-[#E8EDF2]/10 bg-[#1D1020]/90">
          <span className="text-xs text-[#BFC8D2]">AI Match Candidates</span>
          <p className="text-3xl font-bold font-display text-[#D9A441] mt-1 tabular-nums">
            {matches.length}
          </p>
          <span className="text-[11px] text-[#BFC8D2]/70 mt-1 block">Above heuristic threshold</span>
        </div>
      </div>

      {/* Urgent Pending Claims Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-[#E8EDF2] flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Pending Verification Claims</span>
          </h2>
          <button
            onClick={() => onNavigate('admin_claims')}
            className="text-xs text-[#D9A441] hover:underline"
          >
            Open Verification Desk &rarr;
          </button>
        </div>

        {pendingClaims.length === 0 ? (
          <div className="p-8 rounded-xl glass-card border border-[#E8EDF2]/10 text-center text-xs text-[#BFC8D2]">
            No pending claims currently requiring verification.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingClaims.map((claim) => (
              <div
                key={claim.id}
                className="p-4 rounded-xl glass-card border border-amber-500/30 bg-[#30152F]/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-amber-400 font-bold uppercase">
                      Action Required
                    </span>
                    <span className="text-[#BFC8D2]">·</span>
                    <span className="text-[#BFC8D2]">Claimant: {claim.claimant_name || 'Anonymous'}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-[#E8EDF2]">
                    Claim for Item #{claim.item_id.slice(0, 12)}
                  </h3>
                  <p className="text-[#BFC8D2] text-[11px] line-clamp-1">
                    Submitted Answer: "{claim.private_verification_answers}"
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('admin_claims')}
                  className="px-4 py-2 rounded-lg bg-[#D9A441] text-[#1D1020] font-semibold text-xs hover:bg-[#F3C35C] whitespace-nowrap self-start md:self-auto"
                >
                  Inspect &amp; Verify
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Security Audits */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-[#E8EDF2] flex items-center gap-2">
            <History className="w-5 h-5 text-[#BFC8D2]" />
            <span>Recent Administrative Actions</span>
          </h2>
          <button
            onClick={() => onNavigate('admin_audit')}
            className="text-xs text-[#D9A441] hover:underline"
          >
            Full Audit Viewer &rarr;
          </button>
        </div>

        <div className="rounded-xl glass-card border border-[#E8EDF2]/10 overflow-hidden text-xs">
          <div className="divide-y divide-[#E8EDF2]/10">
            {audits.slice(0, 4).map((a) => (
              <div key={a.id} className="p-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-mono font-bold text-[10px] text-[#D9A441] uppercase">
                    {a.action}
                  </span>
                  <p className="text-[#E8EDF2]">
                    Actor: {a.actor_name || a.actor_id || 'System'} · Entity: {a.entity_type} ({a.entity_id.slice(0, 10)})
                  </p>
                </div>
                <span className="text-[11px] text-[#BFC8D2]/60 font-mono shrink-0">
                  {new Date(a.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
