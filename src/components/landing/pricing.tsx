"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

export function Pricing() {
  return (
    <section className="py-24 bg-slate-50/80 border-t border-slate-200/70" data-purpose="pricing" id="tarifs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-[#0b213f] bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Tarification Transparente
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-3">
            Un investissement rentabilisé dès la première semaine
          </h2>
          <p className="text-slate-600 mt-3 text-base sm:text-lg">
            Sans engagement. Aucun frais caché. Choisissez l&apos;offre qui correspond à votre volume de vente.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Plan Gratuit */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="text-lg font-bold text-slate-900">Plan Gratuit</div>
              <div className="text-xs text-slate-500 mt-1">Pour tester et démarrer sereinement</div>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-slate-900">0</span>
                <span className="text-slate-500 font-medium"> FCFA /mois</span>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58]" /> 1 boutique connectée
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58]" /> Jusqu'à 20 produits
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58]" /> 1 compte utilisateur
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58]" /> Vitrine e-commerce de base
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58]" /> Lien WhatsApp direct
                </li>
              </ul>
            </div>
            <Link 
              href="/login"
              className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-6 rounded-full transition-colors text-sm"
            >
              Démarrer sans frais
            </Link>
          </motion.div>

          {/* Plan Pro (Featured) */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white border-2 border-[#0b213f] rounded-3xl p-8 flex flex-col justify-between shadow-glow relative transform lg:-translate-y-2"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0b213f] text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
              ⭐ Le Plus Populaire
            </div>
            <div>
              <div className="text-lg font-bold text-[#0b213f]">Plan Pro</div>
              <div className="text-xs text-slate-500 mt-1">Pour les boutiques actives en pleine croissance</div>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-[#0b213f]">5 000</span>
                <span className="text-slate-500 font-medium"> FCFA /mois</span>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 mb-8 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58]" /> <strong>Produits & ventes illimités</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58]" /> Jusqu'à 3 comptes vendeurs
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58]" /> Vitrine 100% à votre image
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58]" /> Alertes rupture par SMS & WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58]" /> Reçus PDF professionnels personnalisés
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58]" /> Export comptable Excel / CSV
                </li>
              </ul>
            </div>
            <Link 
              href="/login"
              className="w-full text-center bg-[#0b213f] hover:bg-slate-900 text-white font-semibold py-3.5 px-6 rounded-full transition-all shadow-md shadow-[#0b213f]/20 text-sm"
            >
              Choisir le Plan Pro (14j d&apos;essai)
            </Link>
          </motion.div>

          {/* Plan Business */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="text-lg font-bold text-slate-900">Plan Business</div>
              <div className="text-xs text-slate-500 mt-1">Pour chaînes de magasins & franchises</div>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-slate-900">15 000</span>
                <span className="text-slate-500 font-medium"> FCFA /mois</span>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58]" /> Tout ce qui est inclus dans le Plan Pro
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58]" /> Multi-points de vente (jusqu'à 5)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58]" /> Vendeurs & livreurs illimités
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58]" /> Gestion des permissions avancée
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0f9d58]" /> Chargé de compte VIP dédié 7j/7
                </li>
              </ul>
            </div>
            <Link 
              href="/login"
              className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-6 rounded-full transition-colors text-sm"
            >
              Contacter l'équipe commerciale
            </Link>
          </motion.div>

        </div>

        {/* Payment methods note */}
        <div className="mt-12 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-4">
          <span className="font-medium text-slate-500 mr-1">Règlement mensuel sans engagement via :</span>
          <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 bg-white border border-orange-200 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="w-3.5 h-3.5 rounded-full bg-orange-500 text-white text-[8px] font-black flex items-center justify-center">OM</span>Orange Money
          </span>
          <span className="font-bold text-slate-700 bg-white border border-cyan-200 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>Wave
          </span>
          <span className="font-bold text-slate-700 bg-white border border-amber-200 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>MTN MoMo
          </span>
          <span className="font-bold text-slate-700 bg-white border border-blue-200 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>Moov Money
          </span>
        </div>
      </div>
    </section>
  );
}
