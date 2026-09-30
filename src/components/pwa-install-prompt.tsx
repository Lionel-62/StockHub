"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Download, X } from "lucide-react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Empêche le mini-infobar par défaut d'apparaître sur mobile
      e.preventDefault();
      
      const isDismissed = localStorage.getItem('stockhub_pwa_dismissed') === 'true';
      if (isDismissed) return;
      
      // Sauvegarde l'événement pour pouvoir le déclencher plus tard
      setDeferredPrompt(e);
      // Affiche notre bannière personnalisée
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Cache la bannière
    setIsVisible(false);
    
    // Déclenche l'invite d'installation native
    deferredPrompt.prompt();
    
    // Attend que l'utilisateur réponde à l'invite
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`L'utilisateur a ${outcome === "accepted" ? "accepté" : "refusé"} l'installation`);
    
    localStorage.setItem('stockhub_pwa_dismissed', 'true');
    // On ne peut utiliser le prompt qu'une seule fois
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    localStorage.setItem('stockhub_pwa_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[350px] bg-gradient-to-r from-[#0b213f] to-red-800 p-3 rounded-2xl shadow-xl border border-red-500/30 z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5">
      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 relative">
        <div className="absolute inset-0 bg-red-500 rounded-xl animate-ping opacity-20"></div>
        <AlertTriangle className="text-red-400 w-5 h-5 relative z-10" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white text-xs uppercase tracking-wide truncate">Installer StockHub</h3>
        <p className="text-[10px] text-slate-200 mt-0.5 truncate">Pour une meilleure expérience</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button 
          onClick={handleInstallClick}
          className="bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-transform hover:scale-105 flex items-center gap-1 shadow-sm"
        >
          <Download className="w-3 h-3" />
          INSTALLER
        </button>
        <button 
          onClick={handleClose}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
