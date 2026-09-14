import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm">
        <Link href="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour à l'accueil
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Mentions Légales</h1>
        <div className="prose prose-slate max-w-none">
          <h2 className="text-xl font-semibold mt-6 mb-3">Éditeur du site</h2>
          <p>Le site StockHub est édité par l'équipe StockHub.</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Hébergement</h2>
          <p>Le site est hébergé sur Vercel, Inc.<br />
          Adresse : 340 S Lemon Ave #4133 Walnut, CA 91789, USA.</p>

          <h2 className="text-xl font-semibold mt-6 mb-3">Contact</h2>
          <p>Pour toute question ou demande d'information, vous pouvez nous contacter via notre page d'Aide.</p>
        </div>
      </div>
    </div>
  );
}
