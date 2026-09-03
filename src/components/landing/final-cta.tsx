"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";

export function FinalCta() {
  return (
    <section className="py-20 md:py-28 bg-[#0b213f] text-white relative overflow-hidden" data-purpose="final-call-to-action">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1c3958]/80 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6"
        >
          Rejoignez les commerçants qui ont digitalisé leur business avec succès.
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-xl text-[#93bade]/90 max-w-2xl mx-auto mb-10 font-normal"
        >
          Testez StockHub gratuitement pendant 14 jours. Aucune carte bancaire requise, configuration en moins de 2 minutes.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/login" className="w-full sm:w-auto">
            <motion.button 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0f9d58] text-white hover:bg-emerald-600 font-bold text-base px-8 py-4 rounded-full transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              <span>Créer ma vitrine gratuitement</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          
          <Link href="#comment-ca-marche" className="w-full sm:w-auto">
            <motion.button 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800/80 border border-slate-700 hover:bg-slate-700 text-white font-semibold text-base px-6 py-4 rounded-full transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Poser une question</span>
            </motion.button>
          </Link>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#c2d6eb]/80 font-medium"
        >
          <span className="flex items-center gap-1.5">✓ 14 jours d&apos;essai offerts</span>
          <span className="flex items-center gap-1.5">✓ Sans engagement</span>
          <span className="flex items-center gap-1.5">✓ Support en français 7j/7</span>
        </motion.div>
      </div>
    </section>
  );
}
