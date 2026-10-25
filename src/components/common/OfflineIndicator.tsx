import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredNotice(true);
      setTimeout(() => setShowRestoredNotice(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestoredNotice) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-fade-in">
      {!isOnline ? (
        <div className="flex items-center gap-2 bg-amber-800 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-xl border border-amber-600">
          <WifiOff className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Offline Mode — Using cached farm data & local storage</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-xl border border-emerald-600">
          <Wifi className="w-4 h-4 text-emerald-300" />
          <span>Network connection restored! Synced live data.</span>
        </div>
      )}
    </div>
  );
};
