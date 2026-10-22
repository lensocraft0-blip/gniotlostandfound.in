import React, { useEffect, useState } from 'react';
import { Download, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled) {
    return null;
  }

  if (isInstallable(deferredPrompt)) {
    return (
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 rounded-lg border border-[#D9A441]/40 bg-[#30152F]/70 text-[#E8EDF2] hover:bg-[#30152F] hover:border-[#D9A441] transition-colors whitespace-nowrap text-xs font-medium ${
          compact ? 'px-2.5 py-1.5' : 'px-3 py-1.5'
        }`}
        title="Install GNIOT Lost & Found app on your device for offline use"
      >
        <Download className="w-3.5 h-3.5 text-[#D9A441]" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-[#E8EDF2]/20 bg-[#30152F]/50 text-[#E8EDF2] hover:border-[#D9A441] transition-colors whitespace-nowrap text-xs font-medium ${
            compact ? 'px-2.5 py-1.5' : 'px-3 py-1.5'
          }`}
        >
          <Download className="w-3.5 h-3.5 text-[#D9A441]" />
          <span>Install (iOS)</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-xl glass-card border border-[#E8EDF2]/20 p-6 shadow-2xl bg-[#1D1020]">
              <h3 className="text-base font-semibold text-[#E8EDF2] font-display">Install on iPhone / iPad</h3>
              <p className="mt-3 text-xs text-[#BFC8D2] leading-relaxed">
                1. Tap the <strong className="text-[#E8EDF2]">Share</strong> button in the Safari toolbar at the bottom.<br />
                2. Scroll down and tap <strong className="text-[#D9A441]">Add to Home Screen</strong>.<br />
                3. Launch the app directly from your home screen with offline draft support.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-[#30152F] hover:bg-[#30152F]/80 text-[#E8EDF2] py-2 text-xs font-medium border border-[#E8EDF2]/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

function isInstallable(prompt: BeforeInstallPromptEvent | null): boolean {
  return prompt !== null;
}
