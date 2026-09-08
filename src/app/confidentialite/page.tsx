import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: 'Politique de Confidentialité - StockHub',
  description: 'Politique de confidentialité de StockHub',
};

export default function Confidentialite() {
  return (
    <div className="bg-[#fcfdfe] text-slate-800 font-sans min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">POLITIQUE DE CONFIDENTIALITÉ</h1>
        
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <p>
            StockHub attache une grande importance à la protection de vos données. Cette politique explique quelles données nous collectons et comment nous les utilisons.
          </p>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">1. Données que nous collectons</h2>
            <p>Données de compte (nom, e-mail, numéro WhatsApp) ; données de votre boutique (produits, prix, stocks, ventes, factures) ; données de vos clients que vous saisissez (nom, contact, historique de commandes) ; données techniques de connexion.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">2. Pourquoi nous les utilisons</h2>
            <p>Créer et gérer votre compte et votre boutique ; traiter ventes, commandes, factures et alertes de stock ; transmettre les commandes vers votre WhatsApp ; améliorer et sécuriser le service et vous assister.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">3. Paiements</h2>
            <p>Les paiements sont traités par des prestataires tiers (Mobile Money via KKiaPay, FedaPay ou équivalent). StockHub ne stocke pas les codes ou identifiants de paiement ; ils sont gérés par le prestataire.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">4. Partage des données</h2>
            <p>Nous ne vendons jamais vos données. Elles ne sont partagées qu'avec les prestataires techniques nécessaires (hébergement, base de données, paiement, envoi de messages).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">5. Conservation</h2>
            <p>Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression de votre compte et des données associées à tout moment.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">6. Sécurité</h2>
            <p>Données hébergées sur une infrastructure sécurisée avec sauvegarde automatique. L'accès aux données financières est restreint selon les rôles (propriétaire/employé).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">7. Vos droits</h2>
            <p>Vous pouvez accéder à vos données, les corriger ou en demander la suppression via lgodjo62@gmail.com.</p>
          </section>

          <section>
            <p className="font-semibold">Contact : lgodjo62@gmail.com</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
