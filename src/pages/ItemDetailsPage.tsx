import React, { useEffect, useState } from 'react';
import { PageId } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { ItemReport, ItemMatch } from '../types/database';
import { DataService } from '../services/dataService';
import { ItemCard } from '../components/items/ItemCard';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Tag,
  Share2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Lock,
} from 'lucide-react';

interface ItemDetailsPageProps {
  itemId: string;
  onNavigate: (page: PageId, itemId?: string) => void;
}

export const ItemDetailsPage: React.FC<ItemDetailsPageProps> = ({ itemId, onNavigate }) => {
  const { user } = useAuth();
  const [item, setItem] = useState<ItemReport | null>(null);
  const [suggestedMatches, setSuggestedMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Claim Modal State
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [claimEvidence, setClaimEvidence] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      try {
        const found = await DataService.getItemById(itemId);
        setItem(found);
        if (found) {
          const matches = await DataService.getSuggestedMatches(found);
          setSuggestedMatches(matches);
        }
      } catch (err) {
        console.warn('Failed loading item details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [itemId]);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (!verificationAnswer.trim()) {
      setClaimError('Please provide your private verification answer.');
      return;
    }

    setClaimSubmitting(true);
    setClaimError(null);
    try {
      await DataService.submitClaim({
        item_id: item.id,
        claimant_id: user?.id || 'anonymous-claimant',
        claimant_name: user?.display_name || 'Anonymous Student',
        private_verification_answers: verificationAnswer,
        evidence_paths: claimEvidence ? [claimEvidence] : [],
      });

      setClaimSuccess(true);
      setTimeout(() => {
        setIsClaimModalOpen(false);
        setClaimSuccess(false);
        onNavigate('my_claims');
      }, 1500);
    } catch (err: unknown) {
      setClaimError(err instanceof Error ? err.message : 'Claim submission failed');
    } finally {
      setClaimSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full border-2 border-[#D9A441] border-t-transparent animate-spin" />
        <p className="text-xs text-[#BFC8D2]">Loading item record...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold font-display text-[#E8EDF2]">Item Not Found</h2>
        <p className="text-xs text-[#BFC8D2]">
          The requested report may have been resolved, archived, or removed.
        </p>
        <button
          onClick={() => onNavigate('browse')}
          className="px-4 py-2 rounded-lg bg-[#D9A441] text-[#1D1020] text-xs font-semibold"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const isOwner = user?.id === item.owner_id;
  const isFound = item.report_type === 'found';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('browse')}
          className="inline-flex items-center gap-1.5 text-xs text-[#BFC8D2] hover:text-[#E8EDF2]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Browse Registry</span>
        </button>

        <div className="flex items-center gap-2">
          {item.status === 'open' && (
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Status: Open
            </span>
          )}
          {item.status === 'claimed' && (
            <span className="text-xs font-mono uppercase tracking-wider text-[#D9A441] bg-[#D9A441]/10 px-2 py-0.5 rounded border border-[#D9A441]/30">
              Status: Claimed &amp; Verified
            </span>
          )}
        </div>
      </div>

      {/* Main Details Card */}
      <div className="rounded-2xl glass-card border border-[#E8EDF2]/15 p-6 sm:p-8 bg-[#1D1020]/90 shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Photos (Col 5) */}
          <div className="md:col-span-5 space-y-3">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-[#E8EDF2]/15 bg-[#130b15]">
              {item.image_paths && item.image_paths.length > 0 ? (
                <img
                  src={item.image_paths[0]}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-[#BFC8D2]/60 bg-gradient-to-br from-[#30152F]/40 to-[#130b15]">
                  <Tag className="w-10 h-10 text-[#D9A441] mb-2" />
                  <span className="text-xs font-medium text-[#E8EDF2]">{item.category}</span>
                  <span className="text-[11px] text-[#BFC8D2] mt-1">No reference photo provided</span>
                </div>
              )}
            </div>

            {/* Thumbnails if multiple */}
            {item.image_paths && item.image_paths.length > 1 && (
              <div className="flex gap-2">
                {item.image_paths.map((p, idx) => (
                  <div
                    key={idx}
                    className="w-16 h-16 rounded-lg overflow-hidden border border-[#E8EDF2]/20"
                  >
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metadata & Actions (Col 7) */}
          <div className="md:col-span-7 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#BFC8D2] mb-1">
                <span className="font-semibold text-[#D9A441] uppercase tracking-wider">
                  {isFound ? 'FOUND CAMPUS BELONGING' : 'LOST BELONGING REPORT'}
                </span>
                <span>·</span>
                <span>{item.category}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#E8EDF2] leading-tight">
                {item.title}
              </h1>
            </div>

            {/* Clean unboxed attribute list */}
            <div className="space-y-2 text-xs border-y border-[#E8EDF2]/10 py-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D9A441] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#E8EDF2] font-medium">{item.campus_location}</span>
                  {item.campus_zone && (
                    <span className="text-[#BFC8D2] block text-[11px]">{item.campus_zone}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#BFC8D2] shrink-0" />
                <span className="text-[#BFC8D2]">
                  {item.event_date ? new Date(item.event_date).toLocaleDateString() : 'Date not specified'}{' '}
                  {item.event_time ? `at ${item.event_time}` : ''}
                </span>
              </div>

              {item.color && (
                <div className="flex items-center gap-2">
                  <span className="text-[#BFC8D2]">Color:</span>
                  <span className="text-[#E8EDF2] font-medium">{item.color}</span>
                </div>
              )}

              {item.brand && (
                <div className="flex items-center gap-2">
                  <span className="text-[#BFC8D2]">Brand:</span>
                  <span className="text-[#E8EDF2] font-medium">{item.brand}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-[#BFC8D2]">Safekeeping / Contact:</span>
                <span className="text-[#D9A441] font-medium">
                  {item.contact_preference === 'helpdesk'
                    ? 'Main Gate 1 Security Lost Property Desk'
                    : 'In-App Claim Verification'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#BFC8D2] mb-1">
                Item Description
              </h3>
              <p className="text-xs text-[#E8EDF2] leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {/* Public Verification Question (if found item) */}
            {isFound && item.private_verification_question && (
              <div className="p-3.5 rounded-xl bg-[#30152F]/40 border border-[#D9A441]/30 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-[#D9A441] font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Owner Verification Requirement</span>
                </div>
                <p className="text-[#E8EDF2] font-medium">
                  "{item.private_verification_question}"
                </p>
                <p className="text-[11px] text-[#BFC8D2]">
                  You must answer this correctly when submitting a claim to verify genuine ownership.
                </p>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {isFound && !isOwner && item.status !== 'claimed' && (
                <button
                  onClick={() => setIsClaimModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#D9A441] text-[#1D1020] text-xs font-semibold hover:bg-[#F3C35C] transition-colors shadow-lg flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Claim This Item</span>
                </button>
              )}

              {isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      await DataService.updateItem(item.id, {
                        status: item.status === 'resolved' ? 'open' : 'resolved',
                      });
                      setItem({ ...item, status: item.status === 'resolved' ? 'open' : 'resolved' });
                    }}
                    className="px-4 py-2 rounded-xl bg-[#30152F] text-xs text-[#E8EDF2] border border-[#E8EDF2]/15 hover:border-[#D9A441]"
                  >
                    {item.status === 'resolved' ? 'Reopen Report' : 'Mark as Resolved'}
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3 py-2.5 rounded-xl border border-[#E8EDF2]/15 text-[#BFC8D2] hover:text-[#E8EDF2] hover:bg-[#30152F] flex items-center gap-1.5 transition-colors"
                title="Share Item"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-xs">{copied ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Heuristic Matches for this item */}
      {suggestedMatches.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D9A441]" />
            <h2 className="text-xl font-bold font-display text-[#E8EDF2]">
              Potential Corresponding Reports ({suggestedMatches.length})
            </h2>
          </div>
          <p className="text-xs text-[#BFC8D2]">
            Items registered with compatible categories, keywords, colors, and campus proximity.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedMatches.slice(0, 3).map((match) => {
              const matchedItem = item.report_type === 'lost' ? match.found_item : match.lost_item;
              if (!matchedItem) return null;
              return (
                <ItemCard
                  key={match.id}
                  item={matchedItem}
                  matchScore={match.score}
                  onSelect={(i) => onNavigate('item_details', i.id)}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* CLAIM MODAL DIALOG */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl glass-card border border-[#E8EDF2]/20 bg-[#1D1020] text-[#E8EDF2] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8EDF2]/10 pb-3">
              <h3 className="text-base font-semibold font-display text-[#E8EDF2] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#D9A441]" />
                <span>Submit Ownership Claim</span>
              </h3>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="text-xs text-[#BFC8D2] hover:text-white"
              >
                Cancel
              </button>
            </div>

            {claimError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{claimError}</span>
              </div>
            )}

            {claimSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Claim registered! Campus security and finder notified for verification.</span>
              </div>
            )}

            <form onSubmit={handleSubmitClaim} className="space-y-4 text-xs">
              <p className="text-[#BFC8D2] leading-relaxed">
                Item: <strong className="text-[#E8EDF2]">{item.title}</strong>
              </p>

              {item.private_verification_question && (
                <div className="p-3 rounded-xl bg-[#30152F]/50 border border-[#D9A441]/30">
                  <span className="text-[11px] font-mono text-[#D9A441] uppercase block">
                    Verification Question:
                  </span>
                  <p className="text-xs font-semibold text-[#E8EDF2] mt-0.5">
                    {item.private_verification_question}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[#E8EDF2] font-medium mb-1">
                  Private Verification Details *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe secret identifying traits (e.g. scratches, internal engravings, wallpaper theme, specific contents inside pockets)..."
                  value={verificationAnswer}
                  onChange={(e) => setVerificationAnswer(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
                />
                <span className="text-[11px] text-[#BFC8D2]/70 block mt-1">
                  🔒 Strictly protected. Only authorized administrators and item finder can review this answer.
                </span>
              </div>

              <div>
                <label className="block text-[#E8EDF2] font-medium mb-1">
                  Additional Evidence (Optional - Invoice No., Photo link)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Original purchase receipt / serial number snippet"
                  value={claimEvidence}
                  onChange={(e) => setClaimEvidence(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#130b15] border border-[#E8EDF2]/15 text-[#E8EDF2] focus:border-[#D9A441] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#E8EDF2]/15 text-[#BFC8D2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claimSubmitting}
                  className="px-5 py-2 rounded-lg bg-[#D9A441] text-[#1D1020] font-semibold text-xs hover:bg-[#F3C35C] disabled:opacity-50"
                >
                  {claimSubmitting ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
