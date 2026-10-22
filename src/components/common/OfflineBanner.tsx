import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { getSavedDrafts, getPendingSyncQueue } from '../../lib/offline';

export const OfflineBanner: React.FC<{ onOpenOfflinePage: () => void }> = ({ onOpenOfflinePage }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [draftCount, setDraftCount] = useState(0);
  const [syncQueueCount, setSyncQueueCount] = useState(0);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const updateCounts = () => {
      setDraftCount(getSavedDrafts().length);
      setSyncQueueCount(getPendingSyncQueue().length);
    };

    updateCounts();
    const interval = setInterval(updateCounts, 3000);

    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      updateCounts();
      setTimeout(() => setJustReconnected(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateCounts();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (justReconnected) {
    return (
      <aside aria-label="Connection Status" className="bg-[#D9A441]/20 border-b border-[#D9A441]/40 px-4 py-2 text-xs text-[#E8EDF2] flex items-center justify-between z-40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#D9A441]" />
          <span>Connection restored. You are back online.</span>
        </div>
        {(draftCount > 0 || syncQueueCount > 0) && (
          <button
            onClick={onOpenOfflinePage}
            className="text-xs font-semibold text-[#D9A441] underline underline-offset-2 hover:text-white"
          >
            Review {draftCount + syncQueueCount} offline items &rarr;
          </button>
        )}
      </aside>
    );
  }

  if (!isOnline) {
    return (
      <aside aria-label="Connection Status" className="bg-[#30152F] border-b border-[#D9A441]/30 px-4 py-2.5 text-xs text-[#E8EDF2] flex flex-wrap items-center justify-between gap-3 z-40">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <WifiOff className="w-4 h-4 text-[#D9A441]" />
          <span className="font-medium">
            Offline Mode active · Cached campus reports and local drafts remain fully accessible.
          </span>
        </div>
        <div className="flex items-center gap-3">
          {draftCount > 0 && (
            <span className="flex items-center gap-1 text-[#BFC8D2] text-[11px]">
              <Clock className="w-3 h-3 text-[#D9A441]" />
              {draftCount} local draft(s)
            </span>
          )}
          <button
            onClick={onOpenOfflinePage}
            className="px-2.5 py-1 rounded bg-[#D9A441] text-[#1D1020] text-xs font-semibold hover:bg-[#F3C35C] transition-colors"
          >
            Offline Vault
          </button>
        </div>
      </aside>
    );
  }

  // When online, if there are pending offline drafts or queued syncs, show a quiet reminder
  if (draftCount > 0 || syncQueueCount > 0) {
    return (
      <aside aria-label="Connection Status" className="bg-[#30152F]/60 border-b border-[#E8EDF2]/10 px-4 py-1.5 text-xs text-[#BFC8D2] flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D9A441]" />
          <span>You have {draftCount} saved local draft(s) awaiting server submission.</span>
        </div>
        <button
          onClick={onOpenOfflinePage}
          className="text-xs font-medium text-[#D9A441] hover:underline"
        >
          View Drafts
        </button>
      </aside>
    );
  }

  return null;
};
