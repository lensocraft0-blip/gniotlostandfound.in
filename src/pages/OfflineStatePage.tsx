import React, { useEffect, useState } from 'react';
import { PageId } from '../types/navigation';
import {
  getSavedDrafts,
  removeReportDraft,
  ReportDraft,
  getPendingSyncQueue,
  clearPendingSyncQueue,
  SyncPendingItem,
} from '../lib/offline';
import { DataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  Send,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface OfflineStatePageProps {
  onNavigate: (page: PageId, itemId?: string) => void;
}

export const OfflineStatePage: React.FC<OfflineStatePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [drafts, setDrafts] = useState<ReportDraft[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncPendingItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    loadLocalData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadLocalData = () => {
    setDrafts(getSavedDrafts());
    setSyncQueue(getPendingSyncQueue());
  };

  const handleDeleteDraft = (id: string) => {
    removeReportDraft(id);
    loadLocalData();
  };

  const handleSyncDraft = async (draft: ReportDraft) => {
    if (!isOnline) {
      setSyncMessage('Cannot submit while device is offline. Please connect to campus Wi-Fi or mobile data.');
      return;
    }

    setSyncing(true);
    setSyncMessage(null);
    try {
      const created = await DataService.createItem({
        owner_id: user?.id || 'anonymous-user',
        owner_name: user?.display_name || 'GNIOT Campus User',
        report_type: draft.report_type,
        title: draft.title,
        category: draft.category as any,
        description: draft.description,
        brand: draft.brand,
        color: draft.color,
        campus_location: draft.campus_location,
        campus_zone: draft.campus_zone,
        event_date: draft.event_date,
        event_time: draft.event_time,
        reported_at: new Date().toISOString(),
        image_paths: draft.image_previews || [],
        status: 'open',
        contact_preference: (draft.contact_preference as any) || 'in_app',
        private_verification_question: draft.private_verification_question,
        private_verification_answer: draft.private_verification_answer,
      });

      removeReportDraft(draft.id);
      loadLocalData();
      setSyncMessage(`Report "${draft.title}" successfully submitted to campus registry!`);
      setTimeout(() => {
        onNavigate('item_details', created.id);
      }, 1500);
    } catch (err: unknown) {
      setSyncMessage(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncAll = async () => {
    if (!isOnline) {
      setSyncMessage('Cannot sync while offline. Reconnect to sync.');
      return;
    }

    setSyncing(true);
    let successCount = 0;

    for (const draft of drafts) {
      try {
        await DataService.createItem({
          owner_id: user?.id || 'anonymous-user',
          owner_name: user?.display_name || 'GNIOT Campus User',
          report_type: draft.report_type,
          title: draft.title,
          category: draft.category as any,
          description: draft.description,
          brand: draft.brand,
          color: draft.color,
          campus_location: draft.campus_location,
          campus_zone: draft.campus_zone,
          event_date: draft.event_date,
          event_time: draft.event_time,
          reported_at: new Date().toISOString(),
          image_paths: draft.image_previews || [],
          status: 'open',
          contact_preference: (draft.contact_preference as any) || 'in_app',
          private_verification_question: draft.private_verification_question,
          private_verification_answer: draft.private_verification_answer,
        });
        removeReportDraft(draft.id);
        successCount++;
      } catch (err) {
        console.warn('Failed syncing draft:', err);
      }
    }

    clearPendingSyncQueue();
    loadLocalData();
    setSyncing(false);
    setSyncMessage(`Successfully synced ${successCount} report(s) to PostgreSQL database.`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header with Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
                <Wifi className="w-3.5 h-3.5" />
                <span>ONLINE · SYNC READY</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                <WifiOff className="w-3.5 h-3.5" />
                <span>OFFLINE MODE ACTIVE</span>
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold font-display text-[#E8EDF2]">
            Offline Vault &amp; Sync Manager
          </h1>
          <p className="text-xs text-[#BFC8D2] mt-0.5">
            Your unfinished drafts and queued actions preserved securely in local device storage.
          </p>
        </div>

        {drafts.length > 0 && isOnline && (
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="self-start sm:self-auto px-4 py-2 rounded-lg bg-[#D9A441] text-[#1D1020] text-xs font-semibold hover:bg-[#F3C35C] flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing Vault...' : 'Sync All Drafts Now'}</span>
          </button>
        )}
      </div>

      {syncMessage && (
        <div className="p-3 rounded-xl bg-[#30152F] border border-[#D9A441]/40 text-xs text-[#E8EDF2] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#D9A441] shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Offline Status Diagnostics */}
      <div className="p-5 rounded-2xl glass-card border border-[#E8EDF2]/10 bg-[#30152F]/30 space-y-3 text-xs">
        <h3 className="font-semibold text-sm font-display text-[#E8EDF2] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#D9A441]" />
          <span>Offline Architecture Status</span>
        </h3>
        <p className="text-[#BFC8D2] leading-relaxed">
          The GNIOT platform operates with an offline-first client architecture. If your device loses connection while moving between campus academic blocks or hostel basements, your unfinished forms and photos remain stored safely in local device memory until you choose to submit.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-[11px] font-mono text-[#E8EDF2]">
          <div className="bg-[#130b15] p-2 rounded">
            Network State: <span className={isOnline ? 'text-emerald-400' : 'text-amber-400'}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
          <div className="bg-[#130b15] p-2 rounded">
            Drafts on Device: <span className="text-[#D9A441]">{drafts.length}</span>
          </div>
          <div className="bg-[#130b15] p-2 rounded">
            PWA Service Worker: <span className="text-emerald-400">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Saved Drafts List */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-[#E8EDF2]">
          Local Saved Drafts ({drafts.length})
        </h2>

        {drafts.length === 0 ? (
          <div className="p-12 rounded-2xl glass-card border border-[#E8EDF2]/10 text-center space-y-2 text-xs text-[#BFC8D2]">
            <Clock className="w-8 h-8 mx-auto text-[#BFC8D2]/40" />
            <p className="text-sm font-semibold text-[#E8EDF2]">No offline drafts pending</p>
            <p>All previously drafted reports have been submitted to the server or cleared.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="p-5 rounded-2xl glass-card border border-[#E8EDF2]/10 bg-[#1D1020]/90 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8EDF2]/10 pb-2.5">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] text-[#D9A441] font-bold uppercase">
                      LOCAL DRAFT · {draft.report_type.toUpperCase()}
                    </span>
                    <h3 className="text-base font-semibold text-[#E8EDF2] font-display">
                      {draft.title || 'Untitled Draft'}
                    </h3>
                  </div>

                  <span className="text-[11px] text-[#BFC8D2]/60 font-mono">
                    Saved on device: {new Date(draft.saved_at).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-xs text-[#BFC8D2] line-clamp-2">
                  {draft.description || 'No description entered yet.'}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-[#BFC8D2]/80">
                  <span>Location: {draft.campus_location}</span>
                  <span>·</span>
                  <span>Category: {draft.category}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E8EDF2]/10">
                  <button
                    onClick={() => handleDeleteDraft(draft.id)}
                    className="p-1.5 rounded text-red-400 hover:bg-red-500/10 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Discard Draft</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate(draft.report_type === 'lost' ? 'report_lost' : 'report_found')}
                      className="px-3 py-1.5 rounded-lg border border-[#E8EDF2]/15 text-[#E8EDF2] hover:bg-[#30152F]"
                    >
                      Resume Editing
                    </button>
                    <button
                      onClick={() => handleSyncDraft(draft)}
                      disabled={!isOnline || syncing}
                      className="px-3.5 py-1.5 rounded-lg bg-[#D9A441] text-[#1D1020] font-semibold hover:bg-[#F3C35C] disabled:opacity-40 flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Submit Now</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
