"use client";

import { useEffect, useState } from "react";
import { syncManager } from "@/lib/sync/syncManager";
import { CloudOff, Cloud, RefreshCw } from "lucide-react";

export function SyncIndicator() {
  const [queueCount, setQueueCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initial state
    setIsOnline(navigator.onLine);
    setQueueCount(syncManager.getQueueCount());

    // Listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const unsubscribeSync = syncManager.subscribe(() => {
      setQueueCount(syncManager.getQueueCount());
    });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribeSync();
    };
  }, []);

  if (queueCount === 0 && isOnline) return null; // Don't show if everything is fine

  return (
    <div 
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition-all
        ${!isOnline ? "bg-red-50 text-red-600 border-red-200" : "bg-orange-50 text-orange-600 border-orange-200"}`}
      title={!isOnline ? "Hors-ligne. Les modifications sont sauvegardées localement." : `${queueCount} modification(s) en attente de synchronisation`}
    >
      {!isOnline ? (
        <CloudOff size={14} className="animate-pulse" />
      ) : (
        <RefreshCw size={14} className="animate-spin" />
      )}
      
      <span className="hidden sm:inline">
        {!isOnline ? "Hors-ligne" : `${queueCount} en attente`}
      </span>
      {/* On mobile, just show the icon or a small dot, or keep the number */}
      <span className="sm:hidden">{!isOnline ? "" : queueCount}</span>
    </div>
  );
}
