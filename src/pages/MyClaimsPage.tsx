import React, { useEffect, useState } from 'react';
import { PageId } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { ItemClaim, ItemReport } from '../types/database';
import { DataService } from '../services/dataService';
import { Shield, Clock, CheckCircle2, XCircle, ArrowRight, MapPin, AlertCircle, HelpCircle } from 'lucide-react';

interface MyClaimsPageProps {
  onNavigate: (page: PageId, itemId?: string) => void;
}

export const MyClaimsPage: React.FC<MyClaimsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<ItemClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClaims();
  }, [user]);

  const loadClaims = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userClaims = await DataService.getClaims({ claimant_id: user.id });
      // Fetch corresponding items
      for (const c of userClaims) {
        if (!c.item) {
          const itm = await DataService.getItemById(c.item_id);
          if (itm) c.item = itm;
        }
      }
      setClaims(userClaims);
    } catch (err) {
      console.warn('Error loading user claims:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-bold font-display text-[#E8EDF2]">My Verification Claims</h1>
        <p className="text-xs text-[#BFC8D2] mt-0.5">
          Track the status of your submitted ownership claims and official review decisions.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-32 rounded-xl glass-card animate-pulse border border-[#E8EDF2]/10 bg-[#30152F]/20"
            />
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="p-12 rounded-2xl glass-card border border-[#E8EDF2]/10 text-center space-y-3">
          <p className="text-sm font-semibold text-[#E8EDF2]">No claims submitted</p>
          <p className="text-xs text-[#BFC8D2] max-w-sm mx-auto">
            When you spot a found item in the registry that belongs to you, submit an ownership claim to initiate verification.
          </p>
          <button
            onClick={() => onNavigate('browse')}
            className="px-4 py-2 rounded-lg bg-[#D9A441] text-[#1D1020] text-xs font-semibold hover:bg-[#F3C35C]"
          >
            Browse Found Items
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="p-6 rounded-2xl glass-card border border-[#E8EDF2]/10 bg-[#1D1020]/90 space-y-4 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8EDF2]/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#BFC8D2]">
                    Claim Reference: {claim.id}
                  </span>
                  <h3 className="text-base font-semibold text-[#E8EDF2] font-display mt-0.5">
                    {claim.item?.title || `Item #${claim.item_id}`}
                  </h3>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  {claim.status === 'pending' && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>PENDING REVIEW</span>
                    </span>
                  )}
                  {claim.status === 'under_review' && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>UNDER VERIFICATION</span>
                    </span>
                  )}
                  {claim.status === 'evidence_requested' && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>ADDITIONAL EVIDENCE REQUESTED</span>
                    </span>
                  )}
                  {claim.status === 'approved' && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>APPROVED · READY FOR PICKUP</span>
                    </span>
                  )}
                  {claim.status === 'rejected' && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>VERIFICATION DECLINED</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Private Verification Answer Preview */}
              <div className="space-y-1 bg-[#130b15] p-3 rounded-xl border border-[#E8EDF2]/10">
                <span className="text-[11px] font-mono text-[#D9A441] block">
                  Your Submitted Verification Answer:
                </span>
                <p className="text-xs text-[#E8EDF2]">
                  {claim.private_verification_answers}
                </p>
              </div>

              {/* Reviewer Note (if present) */}
              {claim.reviewer_notes && (
                <div className="p-3 rounded-xl bg-[#30152F]/40 border border-[#D9A441]/30 space-y-1">
                  <span className="text-[11px] font-mono text-[#D9A441] block font-semibold">
                    Campus Reviewer Feedback:
                  </span>
                  <p className="text-xs text-[#E8EDF2]">
                    {claim.reviewer_notes}
                  </p>
                </div>
              )}

              {/* Evidence Requested Instructions */}
              {claim.status === 'evidence_requested' && (
                <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300 space-y-1.5">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    <span>Action Required: Provide Supporting Evidence</span>
                  </p>
                  <p className="text-[11px] text-[#BFC8D2] leading-relaxed">
                    The reviewer has requested additional proof before authorizing pickup. Please visit Main Gate 1 Security Desk or reply with your invoice/photo/ID details referencing Claim ID <span className="font-mono text-[#D9A441]">{claim.id}</span>.
                  </p>
                </div>
              )}

              {/* Approval Instructions */}
              {claim.status === 'approved' && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1.5">
                  <p className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Handoff Authorized: Main Gate 1 Security Lost Property Desk</span>
                  </p>
                  <p className="text-[11px] text-[#BFC8D2] leading-relaxed">
                    Please visit the Main Gate 1 Security Desk between 08:30 AM and 06:00 PM IST with your physical GNIOT Student Identity Card to claim your item. Mention Claim ID <span className="font-mono text-[#D9A441]">{claim.id}</span>.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#BFC8D2]/70">
                  Submitted {new Date(claim.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => onNavigate('item_details', claim.item_id)}
                  className="text-xs text-[#D9A441] hover:underline flex items-center gap-1"
                >
                  <span>View Original Item</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
