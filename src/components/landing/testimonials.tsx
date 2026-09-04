"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

export function Testimonials() {
  return (
    <section className="py-24" data-purpose="testimonials" id="temoignages">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-[#0b213f] bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Témoignages
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-3">
            Adopté par les entrepreneurs qui font bouger le continent
          </h2>
          <p className="text-slate-600 mt-3 text-base sm:text-lg">
            Découvrez comment StockHub transforme leur quotidien commercial.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Testimonial 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex text-amber-400 gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">
                &quot;Avant, je passais 3 heures chaque soir à recompter mes robes dans un carnet. Avec StockHub, mes clientes commandent en 30 secondes sur ma vitrine et mon stock baisse automatiquement. C'est le jour et la nuit !&quot;
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm">
                AD
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Awa Diop</div>
                <div className="text-xs text-slate-500">Boutique de Prêt-à-Porter • Dakar</div>
              </div>
            </div>
          </motion.div>

          {/* Testimonial 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5 }}
            className="bg-white border-2 border-[#0b213f] p-8 rounded-3xl shadow-card-lift flex flex-col justify-between relative"
          >
            <div className="absolute -top-3 right-6 bg-[#0b213f] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Top Utilisateur
            </div>
            <div>
              <div className="flex text-amber-400 gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">
                &quot;Mes 3 vendeurs utilisent l'app en magasin sans voir mes bénéfices. Et le récapitulatif de commande direct sur WhatsApp a divisé nos erreurs par dix. Le support client est ultra-réactif.&quot;
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                CN
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Cédric N'Guessan</div>
                <div className="text-xs text-slate-500">Distributeur High-Tech • Abidjan</div>
              </div>
            </div>
          </motion.div>

          {/* Testimonial 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex text-amber-400 gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">
                &quot;Je n&apos;avais pas les moyens de payer une agence 1 million de FCFA pour un site web. En 15 minutes ma vitrine StockHub était en ligne. J'ai doublé mes ventes en 2 mois !&quot;
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                FK
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Fatou Kaboré</div>
                <div className="text-xs text-slate-500">Cosmétiques Bio • Ouagadougou</div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
