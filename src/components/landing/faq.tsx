"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "StockHub est-il vraiment gratuit ?",
    answer: "Oui, le plan gratuit est permanent (jusqu'à 20 produits). Les plans payants offrent en plus 14 jours d'essai gratuit, sans carte bancaire."
  },
  {
    question: "Ai-je besoin de compétences techniques ?",
    answer: "Non. Tout se configure depuis votre téléphone en quelques minutes, sans coder."
  },
  {
    question: "Quels paiements mes clients peuvent-ils utiliser ?",
    answer: "Mobile Money (MTN, Moov, Orange Money, Wave), et paiement à la livraison selon votre zone."
  },
  {
    question: "Mes données sont-elles en sécurité ?",
    answer: "Oui. Vos données sont sauvegardées automatiquement et vos marges/prix d'achat restent 100% confidentiels, même pour vos vendeurs."
  },
  {
    question: "Puis-je annuler à tout moment ?",
    answer: "Oui, aucun engagement. Vous pouvez arrêter ou changer de plan quand vous voulez."
  },
  {
    question: "Comment mes clients passent-ils commande ?",
    answer: "Ils parcourent votre vitrine en ligne et valident en un clic : vous recevez la commande pré-remplie directement sur WhatsApp."
  }
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-white" data-purpose="faq" id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-[#0b213f] bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Foire Aux Questions
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-3">
            Questions Fréquentes
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={cn(
                  "border rounded-2xl transition-colors duration-200 overflow-hidden",
                  isOpen ? "border-[#0b213f]/30 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                >
                  <span className="font-bold text-slate-900 pr-4">{faq.question}</span>
                  <ChevronDown 
                    className={cn(
                      "w-5 h-5 text-slate-500 shrink-0 transition-transform duration-300",
                      isOpen && "rotate-180 text-[#0b213f]"
                    )} 
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-slate-600 leading-relaxed text-sm">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Support direct WhatsApp */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 text-sm mb-3">Vous avez une autre question qui ne figure pas ici ?</p>
          <a
            href="https://wa.me/2290162579394?text=Bonjour%20StockHub%2C%20j%27ai%20une%20question%20sur%20votre%20plateforme."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-slate-800 hover:text-emerald-700 font-bold text-sm bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 px-5 py-2.5 rounded-full transition-all shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Discuter avec nous sur WhatsApp</span>
            <span className="text-emerald-600 font-bold">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
