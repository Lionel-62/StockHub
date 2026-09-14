import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm">
        <Link href="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour à l'accueil
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Conditions Générales d'Utilisation (CGU)</h1>
        <div className="prose prose-slate max-w-none">
          <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. Objet</h2>
          <p>Les présentes Conditions Générales d'Utilisation ont pour objet de définir les modalités de mise à disposition des services du site StockHub.</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">2. Accès au site</h2>
          <p>Le site est accessible gratuitement en tout lieu à tout utilisateur ayant un accès à Internet. Tous les frais supportés par l'utilisateur pour accéder au service (matériel informatique, logiciels, connexion Internet, etc.) sont à sa charge.</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">3. Propriété intellectuelle</h2>
          <p>Les marques, logos, signes ainsi que tous les contenus du site (textes, images, son...) font l'objet d'une protection par le Code de la propriété intellectuelle.</p>
        </div>
      </div>
    </div>
  );
}
