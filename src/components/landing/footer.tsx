import Link from "next/link";
import { Store } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0a192f] border-t border-slate-200 dark:border-[#1c3a66]/90 pt-16 pb-12 text-slate-600 dark:text-slate-300 text-sm" data-purpose="footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Footer Column 1: Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group z-50">
              <img src="/logo.png" alt="StockHub Logo" className="h-14 sm:h-16 w-auto object-contain" />
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mb-4">
              La plateforme tout-en-un de gestion de stocks, caisse enregistreuse et vitrine WhatsApp conçue sur-mesure pour les commerces d&apos;Afrique.
            </p>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-100">Email :</span>
                <a href="mailto:lgodjo62@gmail.com" className="hover:text-[#0b213f] hover:underline transition-colors font-mono text-slate-700 dark:text-slate-200">
                  lgodjo62@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-100">WhatsApp :</span>
                <a href="https://wa.me/2290162579394" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 hover:underline transition-colors font-mono text-emerald-600 font-bold">
                  +229 01 62 57 93 94
                </a>
              </div>
            </div>
          </div>

          {/* Footer Column 2: Produit */}
          <div>
            <div className="font-bold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">Produit</div>
            <ul className="space-y-2 text-xs">
              <li><Link href="#fonctionnalites" className="hover:text-[#0b213f] transition-colors">Gestion de stock</Link></li>
              <li><Link href="#fonctionnalites" className="hover:text-[#0b213f] transition-colors">Vitrine WhatsApp</Link></li>
              <li><Link href="#fonctionnalites" className="hover:text-[#0b213f] transition-colors">Facturation PDF</Link></li>
              <li><Link href="#tarifs" className="hover:text-[#0b213f] transition-colors">Tarifs & Plans</Link></li>
              <li><Link href="#demo" className="hover:text-[#0b213f] transition-colors">Boutique démo</Link></li>
            </ul>
          </div>

          {/* Footer Column 3: Ressources */}
          <div>
            <div className="font-bold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">Ressources</div>
            <ul className="space-y-2 text-xs">
              <li><Link href="/aide" className="hover:text-[#0b213f] transition-colors">Guide du commerçant</Link></li>
              <li><Link href="/aide" className="hover:text-[#0b213f] transition-colors">Intégrer Mobile Money</Link></li>
              <li><Link href="/aide" className="hover:text-[#0b213f] transition-colors">Tutoriels vidéo</Link></li>
              <li><Link href="/aide" className="hover:text-[#0b213f] transition-colors">Centre d&apos;aide 24/7</Link></li>
            </ul>
          </div>

          {/* Footer Column 4: Légal */}
          <div>
            <div className="font-bold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">Légal</div>
            <ul className="space-y-2 text-xs mb-4">
              <li><Link href="/cgu" className="hover:text-[#0b213f] transition-colors">Conditions Générales</Link></li>
              <li><Link href="/confidentialite" className="hover:text-[#0b213f] transition-colors">Politique de Confidentialité</Link></li>
              <li><Link href="/mentions-legales" className="hover:text-[#0b213f] transition-colors">Mentions Légales</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-[#1c3a66]/70 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © 2026 StockHub. Tous droits réservés.
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
            <span>Fait avec fierté et passion en Afrique</span>
            <span>❤️🌍</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
