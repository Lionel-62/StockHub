"use client";

import { 
  Percent, 
  Megaphone, 
  Link as LinkIcon, 
  LayoutTemplate, 
  Star,
  ChevronRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Modules actifs (utilisables immédiatement)
const activeModules = [
  {
    id: "discounts",
    title: "Réductions / codes promo",
    description: "Créez des codes promo pour encourager vos clients à déclencher l'achat.",
    icon: Percent,
    href: "/dashboard_digital/marketing/reductions",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: "banners",
    title: "Bannières promotionnelles",
    description: "Ajoutez un bandeau d'annonce en haut de votre boutique (ex: Livraison gratuite).",
    icon: Megaphone,
    href: "/dashboard_digital/marketing/bannieres",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "campaigns",
    title: "Campagnes & Liens",
    description: "Créez des liens de suivi pour savoir quelle source (Facebook, WhatsApp) amène vos clients.",
    icon: LinkIcon,
    href: "/dashboard_digital/marketing/campagnes",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  }
];

// Modules à venir (grisés)
const upcomingModules = [
  {
    id: "popups",
    title: "Popups & Capture d'emails",
    description: "Affichez des fenêtres surgissantes pour capturer l'attention de vos visiteurs.",
    icon: LayoutTemplate,
  },
  {
    id: "proof",
    title: "Social Proof (Avis clients)",
    description: "Affichez automatiquement les récents achats pour créer un effet d'urgence.",
    icon: Star,
  }
];

export default function MarketingPage() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* En-tête */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Marketing & Ventes
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-sm md:text-base">
          Des outils simples et efficaces pour attirer plus de clients, augmenter votre panier moyen et booster vos ventes en ligne.
        </p>
      </div>

      {/* Section Modules Actifs */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-amber-500" />
          Outils disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.id} href={module.href}>
                <div className="group bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-[#1c3a66] rounded-2xl p-6 h-full hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 transition-all flex flex-col cursor-pointer relative overflow-hidden">
                  
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", module.bgColor, module.color)}>
                    <Icon size={24} strokeWidth={2} />
                  </div>
                  
                  <h3 className="text-[17px] font-bold text-slate-900 dark:text-white mb-2">
                    {module.title}
                  </h3>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1">
                    {module.description}
                  </p>
                  
                  <div className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 mt-auto">
                    Configurer
                    <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Section Bientôt disponible */}
      <div>
        <h2 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-4">
          Bientôt disponible
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {upcomingModules.map((module) => {
            const Icon = module.icon;
            return (
              <div 
                key={module.id} 
                className="bg-slate-50/50 dark:bg-[#06101e]/50 border border-slate-200/60 dark:border-[#1c3a66]/50 rounded-2xl p-6 h-full flex flex-col relative opacity-70 grayscale-[30%] select-none"
              >
                <div className="absolute top-4 right-4 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Bientôt
                </div>
                
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
                  <Icon size={24} strokeWidth={2} />
                </div>
                
                <h3 className="text-[17px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                  {module.title}
                </h3>
                
                <p className="text-sm text-slate-400 dark:text-slate-500 flex-1">
                  {module.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
