import Link from "next/link";
import { Store } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/90 pt-16 pb-12 text-slate-600 text-sm" data-purpose="footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Footer Column 1: Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group z-50">
              <img src="/logo.png" alt="StockHub Logo" className="h-14 sm:h-16 w-auto object-contain" />
            </Link>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-sm mb-6">
              La plateforme tout-en-un de gestion de stocks, caisse enregistreuse et vitrine WhatsApp conçue sur-mesure pour les commerces d&apos;Afrique.
            </p>
          </div>

          {/* Footer Column 2: Produit */}
          <div>
            <div className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Produit</div>
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
            <div className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Ressources</div>
            <ul className="space-y-2 text-xs">
              <li><Link href="#" className="hover:text-[#0b213f] transition-colors">Guide du commerçant</Link></li>
              <li><Link href="#" className="hover:text-[#0b213f] transition-colors">Intégrer Mobile Money</Link></li>
              <li><Link href="#" className="hover:text-[#0b213f] transition-colors">Tutoriels vidéo</Link></li>
              <li><Link href="#" className="hover:text-[#0b213f] transition-colors">Centre d&apos;aide 24/7</Link></li>
            </ul>
          </div>

          {/* Footer Column 4: Légal & Pays */}
          <div>
            <div className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Légal</div>
            <ul className="space-y-2 text-xs mb-4">
              <li><Link href="#" className="hover:text-[#0b213f] transition-colors">Conditions Générales</Link></li>
              <li><Link href="#" className="hover:text-[#0b213f] transition-colors">Politique de Confidentialité</Link></li>
              <li><Link href="#" className="hover:text-[#0b213f] transition-colors">Mentions Légales</Link></li>
            </ul>
            
            {/* Currency selection preview */}
            <div className="text-xs font-semibold text-slate-500 mb-1">Devise d&apos;affichage:</div>
            <select className="text-xs border border-slate-200 rounded-lg py-1 px-2 text-slate-700 bg-slate-50 w-full focus:outline-none focus:border-[#0b213f]">
              <option>FCFA (XOF / XAF)</option>
              <option>GNF (Guinée)</option>
              <option>CDF (Congo)</option>
            </select>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © 2026 StockHub Technologies Inc. Tous droits réservés.
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-500">
            <span>Fait avec fierté et passion en Afrique</span>
            <span>❤️🌍</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
