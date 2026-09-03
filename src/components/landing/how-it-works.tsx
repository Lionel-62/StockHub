"use client";

import { motion } from "framer-motion";
import { Camera, Link as LinkIcon, Rocket } from "lucide-react";

export function HowItWorks() {
  return (
    <section className="py-20 bg-slate-50/70 border-t border-slate-200/70" data-purpose="how-it-works" id="comment-ca-marche">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-[#0b213f] bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Prise en main
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Opérationnel en 3 étapes simples
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Pas besoin d&apos;être un génie de l'informatique. Tout a été conçu pour être configuré depuis votre téléphone.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 p-8 rounded-3xl relative shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-5xl font-extrabold text-slate-100 absolute top-6 right-6 font-mono">01</span>
            <div className="w-12 h-12 rounded-2xl bg-[#0b213f] text-white flex items-center justify-center mb-6 shadow-md shadow-[#0b213f]/20">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 z-10 relative">Créez votre catalogue</h3>
            <p className="text-slate-600 text-sm leading-relaxed relative z-10">
              Ajoutez vos articles avec leurs photos, variantes (tailles, couleurs), stocks disponibles et prix en FCFA depuis votre smartphone.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 p-8 rounded-3xl relative shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-5xl font-extrabold text-slate-100 absolute top-6 right-6 font-mono">02</span>
            <div className="w-12 h-12 rounded-2xl bg-[#0b213f] text-white flex items-center justify-center mb-6 shadow-md shadow-[#0b213f]/20">
              <LinkIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 z-10 relative">Partagez votre lien</h3>
            <p className="text-slate-600 text-sm leading-relaxed relative z-10">
              Placez le lien de votre vitrine en bio Instagram, TikTok, statut WhatsApp ou envoyez-le directement à vos prospects.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 p-8 rounded-3xl relative shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-5xl font-extrabold text-slate-100 absolute top-6 right-6 font-mono">03</span>
            <div className="w-12 h-12 rounded-2xl bg-[#0f9d58] text-white flex items-center justify-center mb-6 shadow-md shadow-[#0f9d58]/20">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 z-10 relative">Encaissez & Synchronisez</h3>
            <p className="text-slate-600 text-sm leading-relaxed relative z-10">
              Recevez les commandes prêtes à livrer sur WhatsApp. Dès validation, votre stock se déduit automatiquement en boutique physique et en ligne.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
