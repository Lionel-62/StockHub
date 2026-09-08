import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: 'CGU - StockHub',
  description: 'Conditions Générales d\'Utilisation de StockHub',
};

export default function CGU() {
  return (
    <div className="bg-[#fcfdfe] text-slate-800 font-sans min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">CONDITIONS GÉNÉRALES D'UTILISATION</h1>
        
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">1. Objet</h2>
            <p>Ces conditions régissent l'utilisation de StockHub (gestion de stock, caisse, facturation et vitrine en ligne connectée à WhatsApp). En créant un compte, vous les acceptez.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">2. Compte</h2>
            <p>Vous êtes responsable de l'exactitude de vos informations et de la confidentialité de vos identifiants (y compris les codes PIN de vos vendeurs).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">3. Offres et tarifs</h2>
            <p>Un plan gratuit permanent (limité) et des plans payants (Pro, Business) facturés mensuellement, sans engagement, avec 14 jours d'essai gratuit. Prix en FCFA.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">4. Paiement</h2>
            <p>Les abonnements payants sont réglés par Mobile Money (Orange Money, Wave, MTN MoMo, Moov Money) via notre prestataire. Le service reste actif tant que l'abonnement est réglé.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">5. Utilisation</h2>
            <p>Vous vous engagez à utiliser StockHub dans le respect de la loi. StockHub est un outil de gestion : vous restez seul responsable des produits et informations publiés sur votre vitrine.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">6. Disponibilité</h2>
            <p>Nous faisons notre possible pour un service continu, sans garantir une disponibilité sans interruption (maintenance, incidents techniques).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">7. Résiliation</h2>
            <p>Vous pouvez arrêter ou changer de plan à tout moment. Nous pouvons suspendre un compte en cas de non-paiement ou de non-respect des conditions.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">8. Responsabilité</h2>
            <p>StockHub ne peut être tenu responsable des pertes indirectes liées à l'utilisation du service. Vous êtes responsable de vos données et de vos relations clients.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">9. Droit applicable</h2>
            <p>Ces conditions sont régies par le droit en vigueur en République du Bénin. Tout litige sera soumis aux tribunaux compétents de Porto-Novo.</p>
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
