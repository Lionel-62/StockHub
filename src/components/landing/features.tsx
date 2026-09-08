"use client";

import { motion } from "framer-motion";
import { PackageSearch, Receipt, Store, BarChart2, ShieldCheck, LayoutDashboard, Boxes, ShoppingCart, Users, Truck, Settings, LifeBuoy } from "lucide-react";

export function Features() {
  return (
    <section className="py-24 bg-white" data-purpose="features-section" id="fonctionnalites">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs uppercase tracking-widest font-bold text-[#0b213f] bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Fonctionnalités
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-3">
            Gérez tout, du stock au client.
          </h2>
          <p className="text-slate-600 mt-3 text-base sm:text-lg">
            Les vrais modules de votre application, pensés pour la croissance de votre entreprise.
          </p>
        </div>

        {/* 5 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4 }}
            className="bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-6">
              <PackageSearch className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Stock & catalogue en temps réel
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Gérez votre catalogue (prix d'achat, prix de vente, promotions, photos, catégories) et vos quantités physiques au même endroit. Réapprovisionnements, ajustements d'inventaire et alertes de rupture automatiques : votre stock se met à jour à chaque vente.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Ventes, commandes & facturation
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Toutes vos ventes en magasin et vos commandes en ligne réunies dans un seul historique, avec suivi du statut de préparation. Générez des factures professionnelles (TVA calculée automatiquement), changez leur statut (payée, en attente...) et envoyez-les en PDF par WhatsApp.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Boutique en ligne connectée à WhatsApp
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Activez votre vitrine e-commerce en un clic, récupérez le lien à partager à vos clients, et recevez chaque commande directement sur le numéro WhatsApp de votre choix, déjà pré-remplie (articles, quantités, total).
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:shadow-md transition-shadow md:col-span-1 lg:col-span-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Clients, fournisseurs & rapports
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Un mini-CRM qui garde l'historique d'achat de chaque client, un carnet fournisseurs pour vos réapprovisionnements, et des rapports détaillés (marges, produits les plus vendus, bilans filtrables par dates) pour décider sereinement.
            </p>
          </motion.div>

          {/* Card 5 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:shadow-md transition-shadow md:col-span-1 lg:col-span-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Équipe & sécurité anti-fraude
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Créez des comptes vendeurs avec code PIN à 4 chiffres et permissions personnalisées. Vos employés accèdent aux outils du quotidien (ventes, factures, stock, clients, produits) sans jamais voir vos bénéfices, vos prix d'achat, vos rapports ni vos paramètres.
            </p>
          </motion.div>
        </div>

        {/* Grid Block "Une plateforme complète, pas un simple gadget" */}
        <div className="mt-16 bg-[#0b213f] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <h3 className="text-2xl sm:text-3xl font-bold mb-10 text-center relative z-10">
            Une plateforme complète, pas un simple gadget
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {[
              { icon: LayoutDashboard, name: "Tableau de bord", desc: "vue d'ensemble (chiffre d'affaires, bénéfices, ventes, alertes stock)" },
              { icon: PackageSearch, name: "Produits", desc: "catalogue avec prix, photos, variantes et catégories" },
              { icon: Boxes, name: "Stock", desc: "réapprovisionnements, inventaires et alertes de rupture" },
              { icon: ShoppingCart, name: "Ventes & commandes", desc: "historique unifié magasin + en ligne" },
              { icon: Receipt, name: "Factures", desc: "factures pro en PDF, envoi WhatsApp, suivi des paiements" },
              { icon: Users, name: "Clients", desc: "carnet d'adresses et historique d'achat (mini-CRM)" },
              { icon: Truck, name: "Fournisseurs", desc: "carnet B2B pour vos réapprovisionnements" },
              { icon: Store, name: "Boutique en ligne", desc: "vitrine e-commerce publique connectée à WhatsApp" },
              { icon: BarChart2, name: "Rapports", desc: "statistiques de marges, meilleures ventes et bilans par dates" },
              { icon: Settings, name: "Paramètres", desc: "identité de la boutique, devise, taxes, infos légales des factures" },
              { icon: ShieldCheck, name: "Équipe", desc: "comptes vendeurs à code PIN avec permissions" },
              { icon: LifeBuoy, name: "Aide & support", desc: "assistance à l'utilisation" },
            ].map((module, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <module.icon className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">{module.name}</div>
                  <div className="text-xs text-slate-300 mt-1 leading-snug">{module.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 text-center relative z-10">
            <p className="text-sm text-slate-300 max-w-2xl mx-auto italic">
              "Deux niveaux d'accès : le Propriétaire voit tout ; l'Employé n'accède qu'aux outils de travail quotidien, sans jamais voir vos marges, vos rapports ni vos paramètres."
            </p>
          </div>
        </div>
        
      </div>
    </section>
  );
}
