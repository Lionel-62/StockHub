"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";

export function Testimonials() {
  return (
    <section className="py-24 bg-slate-50" data-purpose="benefits" id="pourquoi">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-[#0b213f] bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            Vos avantages
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-6">
            Pourquoi choisir StockHub ?
          </h2>
          <p className="text-slate-600 mt-4 text-base sm:text-lg">
            La solution pensée pour la réalité de votre commerce.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Benefit 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Zéro perte de stock</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Fini les inventaires qui ne correspondent pas. Votre stock se met à jour automatiquement après chaque vente en magasin ou en ligne. Suivi précis et alertes de rupture.
            </p>
          </motion.div>

          {/* Benefit 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#0f9d58]/10 text-[#0f9d58] flex items-center justify-center mb-6 shadow-inner">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Vendez sur WhatsApp</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Vos clients choisissent sur votre vitrine, et vous recevez la commande déjà calculée et pré-remplie directement sur votre numéro WhatsApp. Zéro malentendu.
            </p>
          </motion.div>

          {/* Benefit 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Sans engagement</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Testez notre plateforme librement. Profitez de notre plan gratuit à vie ou de 14 jours d'essai sur nos plans pros. Résiliable à tout moment, sans frais cachés.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
