import React, { useEffect, useState } from 'react';
import { PageId } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { ItemClaim, ItemReport } from '../types/database';
import { DataService } from '../services/dataService';
import { Shield, Check, X, ArrowLeft, Clock, CheckCircle2, Lock, MessageSquare, HelpCircle, AlertCircle } from 'lucide-react';

interface AdminClaimsPageProps {
  onNavigate: (page: PageId, itemId?: string) => void;
}

export const AdminClaimsPage: React.FC<AdminClaimsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<ItemClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingClaim, setReviewingClaim] = useState<ItemClaim | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | 'evidence_requested'>('approved');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const all = await DataService.getClaims();
      for (const c of all) {
        if (!c.item) {
          const item = await DataService.getItemById(c.item_id);
          if (item) c.item = item;
        }
      }
      setClaims(all);
    } catch (err) {
      console.warn('Failed loading admin claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (claim: ItemClaim, action: 'approved' | 'rejected' | 'evidence_requested') => {
    setReviewingClaim(claim);
    setReviewAction(action);
    setReviewNotes(
      action === 'approved'
        ? 'Verified ownership against physical security logs and student ID credentials. Handover authorized at Main Gate 1.'
        : action === 'evidence_requested'
        ? 'Please provide additional ownership evidence (such as a purchase invoice, serial number document, or photo proving prior possession) to the Main Gate 1 Security Desk.'
        : 'Verification answer did not match distinctive traits recorded by the finder.'
    );
  };

  const handleConfirmDecision = async () => {
    if (!reviewingClaim || !user) return;
    setProcessing(true);
    try {
      await DataService.reviewClaim(
        reviewingClaim.id,
        reviewAction,
        user.id,
        reviewNotes
      );
      setReviewingClaim(null);
      loadClaims();
    } catch (err) {
      console.warn('Error recording claim decision:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (!user?.is_admin) {
    return (
      <div className="py-16 text-center text-xs text-[#BFC8D2]">
        Restricted to authorized campus security administrators.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <button
          onClick={() => onNavigate('admin_dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-[#BFC8D2] hover:text-[#E8EDF2] mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Admin Portal</span>
        </button>
        <h1 className="text-3xl font-bold font-display text-[#E8EDF2]">
          Claim Verification Desk
        </h1>
        <p className="text-xs text-[#BFC8D2]">
          Review confidential claimant verification details, evaluate proof of ownership, and authorize custody handovers.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-36 rounded-xl glass-card animate-pulse border border-[#E8EDF2]/10 bg-[#30152F]/20"
            />
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="p-12 rounded-2xl glass-card border border-[#E8EDF2]/10 text-center space-y-2 text-xs text-[#BFC8D2]">
          <Shield className="w-8 h-8 mx-auto text-[#BFC8D2]/40" />
          <p className="text-sm font-semibold text-[#E8EDF2]">No claims filed yet</p>
          <p>All claims submitted by campus students will appear here for verification.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="p-6 rounded-2xl glass-card border border-[#E8EDF2]/10 bg-[#1D1020]/90 space-y-4 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8EDF2]/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#D9A441] font-bold">
                    Claim ID: {claim.id}
                  </span>
                  <h3 className="text-base font-semibold text-[#E8EDF2] font-display mt-0.5">
                    Item: {claim.item?.title || claim.item_id}
                  </h3>
                  <p className="text-[11px] text-[#BFC8D2]">
                    Claimant: <strong>{claim.claimant_name || 'Anonymous Student'}</strong> ({claim.claimant_id.slice(0, 10)})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] uppercase px-2.5 py-1 rounded font-bold ${
                      claim.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : claim.status === 'rejected'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : claim.status === 'evidence_requested'
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    STATUS: {claim.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Private Claimant Answer (Protected) */}
              <div className="p-3.5 rounded-xl bg-[#130b15] border border-[#D9A441]/30 space-y-1">
                <div className="flex items-center gap-1.5 text-[#D9A441] font-semibold text-[11px]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confidential Claimant Verification Answer:</span>
                </div>
                <p className="text-xs text-[#E8EDF2] leading-relaxed">
                  "{claim.private_verification_answers}"
                </p>
              </div>

              {/* Found Item Secret Question & Answer (from original finder report) */}
              {claim.item?.private_verification_question && (
                <div className="p-3 rounded-xl bg-[#30152F]/40 border border-[#E8EDF2]/10 space-y-1 text-[11px]">
                  <span className="text-[#BFC8D2] font-medium">Original Finder's Challenge:</span>
                  <p className="text-[#E8EDF2]">
                    Q: "{claim.item.private_verification_question}"
                  </p>
                  {claim.item.private_verification_answer && (
                    <p className="text-[#D9A441]">
                      Expected Secret: "{claim.item.private_verification_answer}"
                    </p>
                  )}
                </div>
              )}

              {/* Reviewer Feedback Notes */}
              {claim.reviewer_notes && (
                <div className="text-[11px] text-[#BFC8D2] bg-[#30152F]/20 p-2.5 rounded-lg border border-[#E8EDF2]/10">
                  <strong className="text-[#E8EDF2]">Reviewer Note:</strong> {claim.reviewer_notes}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-[#BFC8D2]/60">
                  Submitted {new Date(claim.created_at).toLocaleString()}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onNavigate('item_details', claim.item_id)}
                    className="px-3 py-1.5 rounded-lg border border-[#E8EDF2]/15 text-[#E8EDF2] hover:bg-[#30152F]"
                  >
                    View Item
                  </button>
                  <button
                    onClick={() => handleOpenReview(claim, 'approved')}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Claim</span>
                  </button>
                  <button
                    onClick={() => handleOpenReview(claim, 'evidence_requested')}
                    className="px-3 py-1.5 rounded-lg bg-orange-600/90 hover:bg-orange-600 text-white font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Request Evidence</span>
                  </button>
                  <button
                    onClick={() => handleOpenReview(claim, 'rejected')}
                    className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Confirmation Dialog */}
      {reviewingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl glass-card border border-[#E8EDF2]/20 bg-[#1D1020] text-[#E8EDF2] p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-semibold font-display text-[#E8EDF2] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#D9A441]" />
              <span>Confirm Verification Decision: {reviewAction.replace('_', ' ').toUpperCase()}</span>
            </h3>

            <p className="text-[#BFC8D2] leading-relaxed">
              You are about to mark claim <strong className="text-[#E8EDF2]">#{reviewingClaim.id}</strong> as{' '}
              <strong
                className={
                  reviewAction === 'approved'
                    ? 'text-emerald-400'
                    : reviewAction === 'evidence_requested'
                    ? 'text-orange-400'
                    : 'text-red-400'
                }
              >
                {reviewAction.replace('_', ' ').toUpperCase()}
              </strong>. The claimant will be notified with your recorded notes.
            </p>

            <div>
              <label className="block text-[#E8EDF2] font-medium mb-1">
                Official Security / Reviewer Note *
              </label>
              <textarea
                rows={3}
                required
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewingClaim(null)}
                className="px-3.5 py-1.5 rounded-lg border border-[#E8EDF2]/15 text-[#BFC8D2]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleConfirmDecision}
                className={`px-4 py-1.5 rounded-lg text-white font-semibold ${
                  reviewAction === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : reviewAction === 'evidence_requested'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing ? 'Recording...' : `Confirm ${reviewAction.replace('_', ' ').toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
