"use client";

import { motion } from "framer-motion";
import { BookX, MonitorOff, MessageSquareWarning } from "lucide-react";

export function Problem() {
  return (
    <section className="py-20 bg-slate-50/80 border-y border-slate-200/60" data-purpose="problem-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Le Constat Actuel
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Pourquoi continuer à perdre du temps et de l'argent ?
          </h2>
          <p className="text-slate-600 mt-3 text-base sm:text-lg">
            90% des commerçants d&apos;Afrique francophone jonglent avec des méthodes obsolètes qui freinent leur expansion.
          </p>
        </div>

        {/* Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Card 1: Cahier / Excel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BookX className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Gestion sur cahier ou Excel dépassée
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Risques permanents de perte de données, pages déchirées, erreurs d&apos;inventaires, vols non détectés et calculs de bénéfices approximatifs.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-rose-600 gap-1.5">
              <span>~4 heures perdues chaque semaine</span>
            </div>
          </motion.div>

          {/* Card 2: Complex Sites */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <MonitorOff className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Sites web trop chers & compliqués
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Dépenser des centaines de milliers de FCFA pour un site WooCommerce ou Shopify lourd, mal adapté au réseau mobile et boudé par vos acheteurs.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-amber-600 gap-1.5">
              <span>Paiement par carte bancaire peu utilisé localement</span>
            </div>
          </motion.div>

          {/* Card 3: WhatsApp Clutter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-100 text-[#0b213f] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              WhatsApp saturé & mal organisé
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Des centaines de messages &quot;prix svp&quot;, clients sans réponse rapide, oubli de commande au fond des discussions et litiges réguliers.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-[#0b213f] gap-1.5">
              <span>30% des ventes perdues par manque de suivi</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
