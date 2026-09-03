"use client";

import { motion } from "framer-motion";
import { PackageSearch, Globe, Smartphone, ShieldCheck } from "lucide-react";

export function Features() {
  return (
    <section className="py-24" data-purpose="features-section" id="fonctionnalites">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs uppercase tracking-widest font-bold text-[#0b213f] bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Fonctionnalités Clés
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-3">
            Tout pour piloter votre commerce, de A à Z.
          </h2>
          <p className="text-slate-600 mt-3 text-base sm:text-lg">
            Une suite d&apos;outils puissants pensée exclusivement pour les réalités du marché africain (Mobile Money, multi-vendeurs, livraisons WhatsApp).
          </p>
        </div>

        {/* Features Grid (4 detailed modules) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Feature 1: Inventory & Invoicing */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200/90 rounded-3xl p-8 hover:border-[#0b213f]/30 shadow-sm hover:shadow-card-lift transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#0b213f] flex items-center justify-center mb-6">
              <PackageSearch className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Gestion de stock & Facturation intelligente
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Mise à jour automatique à chaque vente. Factures PDF personnalisées avec logo, QR code de validation et envoi direct aux clients par WhatsApp ou impression thermique bluetooth.
            </p>
            {/* Mini UI Preview */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs font-mono space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span>RÉF: #ART-809</span>
                <span className="text-[#0f9d58] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">En stock (48)</span>
              </div>
              <div className="flex justify-between items-center text-slate-800 font-bold font-sans">
                <span>Montre Connectée Sport Pro</span>
                <span>25 000 FCFA</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#0b213f] h-full w-3/4"></div>
              </div>
            </div>
          </motion.div>

          {/* Feature 2: Automated Storefront */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200/90 rounded-3xl p-8 hover:border-[#0b213f]/30 shadow-sm hover:shadow-card-lift transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#0b213f] flex items-center justify-center mb-6">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Vitrine en ligne instantanée sans coder
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Obtenez un site web e-commerce ultra-rapide (ex: <i>stockhub.store/votre-nom</i>). Vos clients parcourent vos articles, choisissent les tailles et couleurs, et passent commande facilement.
            </p>
            {/* Mini UI Preview */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0b213f] text-white flex items-center justify-center font-bold">SH</div>
                <div>
                  <div className="font-bold text-slate-900">stockhub.store/sen-mode</div>
                  <div className="text-slate-500 text-[11px]">Temps de chargement: 0.4s (ultra-léger)</div>
                </div>
              </div>
              <span className="text-[#0b213f] font-semibold text-[11px] underline cursor-pointer">Aperçu ↗</span>
            </div>
          </motion.div>

          {/* Feature 3: WhatsApp Direct Checkout */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200/90 rounded-3xl p-8 hover:border-[#0f9d58]/30 shadow-sm hover:shadow-card-lift transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0f9d58] flex items-center justify-center mb-6">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Checkout optimisé vers WhatsApp Business
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Le client valide son panier en un clic. Vous recevez un message WhatsApp pré-rempli avec le nom, l'adresse de livraison, les articles exacts et le montant total calculé.
            </p>
            {/* Mini UI Preview */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-slate-800 space-y-1">
              <div className="font-bold text-emerald-800">📥 Récapitulatif automatique reçu:</div>
              <div className="text-slate-700 italic">&quot;Bonjour ! Commande de Fatou S. (Marcory, Abidjan): 1x Robe Rouge (L) + 1x Ceinture. Total: 34 000 FCFA. Paiement: Wave / Orange Money.&quot;</div>
            </div>
          </motion.div>

          {/* Feature 4: Staff Access & Permissions */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200/90 rounded-3xl p-8 hover:border-amber-300 shadow-sm hover:shadow-card-lift transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Accès multi-rôles & Sécurité anti-fraude
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Déléguez en toute tranquillité. Donnez des comptes limités à vos vendeurs en magasin et vos livreurs, tout en gardant l'historique de vos marges et prix d&apos;achat 100% confidentiels.
            </p>
            {/* Mini UI Preview */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0f9d58]"></span>
                <span className="font-semibold text-slate-800">Rôle Vendeur Magasin:</span>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-medium">Créer Vente ✓</span>
                <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-medium">Bénéfices Masqués ✕</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
