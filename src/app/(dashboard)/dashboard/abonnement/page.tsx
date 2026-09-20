"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { CreditCard, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export default function SubscriptionPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Forcer à "expired" si on est ici avec un abonnement qui a expiré selon la date, 
  // mais que currentUser n'est pas encore mis à jour.
  let isExpired = false;
  if (currentUser?.subscriptionStatus === "expired") {
    isExpired = true;
  } else if (currentUser?.subscriptionEndDate) {
    if (new Date(currentUser.subscriptionEndDate).getTime() < new Date().getTime()) {
      isExpired = true;
    }
  }

  const handleSubscribe = async () => {
    setLoading(true);
    // Simulation SASPay pour le moment
    setTimeout(() => {
      alert("Redirection vers SASPay en cours pour payer 5 000 FCFA...");
      setLoading(false);
    }, 1500);
  };

  if (currentUser?.role === "employee") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <ShieldCheck className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Boutique Temporairement Suspendue</h1>
        <p className="text-slate-600 max-w-md">
          L'abonnement de cette boutique est arrivé à expiration. Veuillez contacter le propriétaire ou le gérant pour rétablir l'accès.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {isExpired ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-red-100 p-4 rounded-full flex-shrink-0">
            <ShieldCheck className="w-8 h-8 text-red-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-red-900 mb-1">Votre accès est suspendu</h2>
            <p className="text-red-700">
              Votre période d'essai ou votre abonnement est terminé. Réactivez votre compte pour retrouver l'accès à vos données, vos ventes et votre vitrine en ligne.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-blue-100 p-4 rounded-full flex-shrink-0">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-blue-900 mb-1">Abonnement Actif</h2>
            <p className="text-blue-700">
              Votre abonnement est valide jusqu'au <span className="font-semibold">{new Date(currentUser?.subscriptionEndDate || "").toLocaleDateString("fr-FR")}</span>.
            </p>
          </div>
        </div>
      )}

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Prolongez votre accès à StockHub</h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">
          Profitez d'une gestion de stock simplifiée et de votre vitrine en ligne ouverte 24h/24.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        {/* Carte Mensuelle Unique */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <div className="p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Forfait Mensuel</h3>
            <p className="text-slate-500 mb-6">Idéal pour les boutiques qui démarrent.</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-extrabold text-slate-900">5 000</span>
              <span className="text-lg font-medium text-slate-500">FCFA / mois</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Produits et ventes illimités</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Accès pour 1 gérant et vos employés</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Vitrine en ligne pour vos clients</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Rapports et statistiques avancés</span>
              </li>
            </ul>
            
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl text-white font-medium bg-slate-900 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <CreditCard className="w-5 h-5" />
              {loading ? "Génération du paiement..." : "Payer 5 000 FCFA par Mobile Money"}
            </button>
            <p className="text-xs text-center text-slate-400 mt-4">
              Paiement 100% sécurisé via Mobile Money
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
