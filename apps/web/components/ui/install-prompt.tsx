'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already dismissed this session
    if (sessionStorage.getItem('pwa-dismissed')) {
      setDismissed(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem('pwa-dismissed', 'true');
  }

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📱</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">Install Lakeland Health Navigator</p>
          <p className="text-xs text-gray-500 mt-0.5">Get instant access from your home screen — works offline too.</p>
        </div>
        <button onClick={handleDismiss} className="text-gray-400 text-lg leading-none">×</button>
      </div>
      <button
        onClick={handleInstall}
        className="w-full mt-3 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold"
      >
        Install App
      </button>
    </div>
  );
}
