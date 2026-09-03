"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, MessageCircle, TrendingUp } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden" data-purpose="hero-section">
      {/* Floating Decorative Elements Collage (Hero Accents) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-20 select-none">
        
        {/* 1. Top Left tilted receipt */}
        <div className="hidden lg:flex items-start absolute left-[4%] top-24 transform -rotate-6 transition-transform duration-300 hover:rotate-0 hover:scale-105 pointer-events-auto">
          <div className="relative bg-amber-50 border border-amber-200/90 rounded-xl p-3.5 shadow-xl shadow-slate-900/10 w-48 font-mono">
            <div className="absolute -top-3.5 left-8 w-7 h-5 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 rounded-sm shadow-md border border-amber-200 flex items-center justify-center">
              <div className="w-3.5 h-1.5 border border-amber-100 rounded-full"></div>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-sans font-bold flex items-center justify-between mt-1">
              <span>Reçu de caisse</span>
              <span className="text-[#0f9d58] font-bold font-sans">✓ PAYÉ</span>
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1 font-sans">Ticket #1489</div>
            <div className="text-sm font-extrabold text-[#0f9d58] mt-0.5">18 500 FCFA</div>
            <div className="text-[9px] text-slate-500 font-sans flex items-center gap-1 mt-1.5 pt-1.5 border-t border-dashed border-amber-300/70">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              <span>Règlement Wave</span>
            </div>
          </div>
        </div>

        {/* 2. Top Centered Payment Notification Badge */}
        <div className="hidden md:flex items-center gap-2.5 absolute top-20 right-[24%] transform rotate-3 bg-white/95 backdrop-blur-md border border-amber-200/90 rounded-full py-1.5 px-3.5 shadow-lg shadow-slate-900/5 animate-float-slow pointer-events-auto">
          <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-xs shadow-md shadow-orange-500/30 tracking-tighter border border-white">OM</div>
          <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <span className="text-orange-500 font-bold uppercase text-[10px] tracking-wider">Orange Money</span>
            <span className="text-slate-300">•</span>
            <span className="text-[#0f9d58] font-extrabold">+42 000 FCFA</span>
          </div>
        </div>

        {/* 3. Top Right Floating WhatsApp Order Capsule */}
        <div className="hidden lg:flex flex-col gap-3 items-end absolute right-[5%] top-28 transform rotate-6 pointer-events-auto animate-float-med">
          <div className="bg-white/95 backdrop-blur-sm border border-[#0f9d58]/40 rounded-2xl p-2.5 shadow-xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0f9d58] text-white flex items-center justify-center shadow-md shadow-[#0f9d58]/30">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-[#0f9d58]">WhatsApp Store</div>
              <div className="text-xs font-bold text-slate-900">Nouvelle commande #482</div>
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] bg-[#0b213f]/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-subtle"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        
        {/* Trust Pill Badge */}
        <div className="flex justify-center mb-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#0f9d58] animate-ping"></span>
            <span>La solution tout-en-un pour les commerçants d&apos;Afrique</span>
          </motion.div>
        </div>

        {/* Hero Punchy Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.08] mb-6"
          >
            Fini les cahiers de stock et les commandes <span className="bg-gradient-to-r from-[#0b213f] to-[#305886] bg-clip-text text-transparent">WhatsApp en désordre.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10 font-normal"
          >
            Gérez vos stocks, ventes et factures en temps réel, tout en offrant à vos clients une vitrine e-commerce connectée directement à votre WhatsApp en 2 minutes chrono.
          </motion.p>
          
          {/* CTA Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-12"
          >
            <Link href="/login" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0b213f] hover:bg-slate-900 text-white font-semibold text-base px-8 py-4 rounded-full transition-all duration-200 shadow-xl shadow-[#0b213f]/15 hover:shadow-2xl"
              >
                <span>Commencer gratuitement (14 jours)</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            
            <Link href="#demo" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base px-6 py-4 rounded-full border border-slate-200 shadow-sm transition-all hover:border-slate-300"
              >
                <Play className="w-5 h-5 text-[#0f9d58]" />
                <span>Voir la démo</span>
              </motion.button>
            </Link>
          </motion.div>
          
          {/* Social Proof Micro-metrics */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs sm:text-sm text-slate-500 font-medium"
          >
            Rejoint par plus de <span className="font-bold text-slate-800">5 000 commerçants</span> à Dakar, Abidjan, Douala, Lomé, Cotonou & Yaoundé.
          </motion.p>
        </div>

        {/* HERO MOCKUP: Dual High-Impact Layout */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-14 sm:mt-16 relative" 
          id="demo"
        >
          {/* Floating sticker 1 (Left): WhatsApp Order */}
          <div className="hidden md:flex items-center gap-3 glass-card border border-[#0f9d58]/40 text-slate-800 p-3.5 rounded-2xl shadow-xl absolute -left-6 top-16 z-30 animate-float-slow">
            <div className="w-10 h-10 rounded-xl bg-[#0f9d58] text-white flex items-center justify-center shadow-md shadow-[#0f9d58]/30">
              <MessageCircle className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <span>WhatsApp Store</span>
                <span>•</span>
                <span className="text-[#0f9d58] font-bold">À l&apos;instant</span>
              </div>
              <div className="text-sm font-bold text-slate-900">📦 Commande reçue (32 500 F)</div>
              <div className="text-xs text-slate-500">Awa D. • Robe Wax Royale (M)</div>
            </div>
          </div>

          {/* Floating sticker 2 (Right): Instant Cash / Invoicing */}
          <div className="hidden md:flex items-center gap-3 glass-card border border-slate-200/80 text-slate-800 p-3.5 rounded-2xl shadow-xl absolute -right-6 top-28 z-30 animate-float-med">
            <div className="w-10 h-10 rounded-xl bg-[#0b213f] text-white flex items-center justify-center shadow-md shadow-[#0b213f]/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Caisse du jour • Abidjan</div>
              <div className="text-sm font-extrabold text-slate-900">+125 000 FCFA</div>
              <div className="text-[11px] text-[#0f9d58] font-semibold flex items-center gap-1">
                <span>●</span> Reçu généré #849
              </div>
            </div>
          </div>

          {/* Main Workspace Frame */}
          <div className="rounded-3xl p-2 sm:p-4 bg-gradient-to-b from-slate-200/70 via-slate-100/50 to-white border border-slate-200/90 shadow-card-lift relative z-10">
            <div className="rounded-2xl overflow-hidden border border-slate-200/60 shadow-inner bg-slate-950 flex items-center justify-center">
              <img 
                src="/dashboard-preview.png" 
                alt="Aperçu du tableau de bord StockHub" 
                className="w-full h-auto max-h-[600px] object-cover object-top"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
