'use client';

import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;

    const register = async () => {
      registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await registration.update();
    };

    const checkForUpdate = () => registration?.update();
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SW_UPDATED' && navigator.serviceWorker.controller) {
        setUpdateAvailable(true);
      }
    };

    void register().catch(() => undefined);
    navigator.serviceWorker.addEventListener('message', handleMessage);
    document.addEventListener('visibilitychange', checkForUpdate);
    const interval = window.setInterval(checkForUpdate, 60 * 60 * 1000);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
      document.removeEventListener('visibilitychange', checkForUpdate);
      window.clearInterval(interval);
    };
  }, []);

  if (!updateAvailable) return null;

  return (
    <button
      type="button"
      className="pwa-update-button"
      onClick={() => window.location.reload()}
      data-ui
    >
      New version available - reload
    </button>
  );
}