import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm">
        <Link href="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour à l'accueil
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Politique de Confidentialité</h1>
        <div className="prose prose-slate max-w-none">
          <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">1. Collecte des données</h2>
          <p>Nous collectons les données suivantes : nom, adresse email, et informations de connexion (Google ou Code PIN) nécessaires à l'utilisation de la plateforme StockHub.</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">2. Utilisation des données</h2>
          <p>Les données collectées sont utilisées uniquement pour le fonctionnement de l'application (gestion de votre boutique, accès sécurisé) et ne sont jamais revendues à des tiers.</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">3. Vos droits</h2>
          <p>Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez exercer ce droit en nous contactant.</p>
        </div>
      </div>
    </div>
  );
}
