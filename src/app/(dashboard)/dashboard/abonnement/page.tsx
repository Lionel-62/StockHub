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

  const handleSubscribe = async (amount: number, planName: string) => {
    setLoading(true);
    setTimeout(() => {
      alert(`Redirection vers SASPay en cours pour payer ${amount} FCFA (${planName})...`);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Carte Mensuelle Standard - 5000 */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative flex flex-col">
          <div className="p-8 flex-1">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Forfait Standard</h3>
            <p className="text-slate-500 mb-6">L'essentiel pour bien démarrer votre activité.</p>
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
                <span className="text-slate-700">Gestion de stock basique</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Vitrine en ligne simple</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Support par email</span>
              </li>
            </ul>
          </div>
          <div className="p-8 pt-0 mt-auto">
            <button
              onClick={() => handleSubscribe(5000, "Standard")}
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl text-slate-700 font-medium bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <CreditCard className="w-5 h-5" />
              Choisir Standard
            </button>
          </div>
        </div>

        {/* Carte Mensuelle Pro - 8000 */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-500 overflow-hidden relative flex flex-col transform md:-translate-y-4">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <div className="bg-blue-600 text-white text-center py-1.5 text-xs font-bold tracking-widest uppercase">
            Le plus populaire
          </div>
          <div className="p-8 flex-1">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Forfait Pro</h3>
            <p className="text-slate-500 mb-6">Pour les commerçants qui veulent passer à la vitesse supérieure.</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-extrabold text-slate-900">8 000</span>
              <span className="text-lg font-medium text-slate-500">FCFA / mois</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 font-medium">Tout ce qui est dans le Standard, plus :</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Accès multi-employés (illimité)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Rapports financiers avancés</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Vitrine en ligne personnalisable</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Assistance prioritaire sur WhatsApp</span>
              </li>
            </ul>
          </div>
          <div className="p-8 pt-0 mt-auto">
            <button
              onClick={() => handleSubscribe(8000, "Pro")}
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl text-white font-medium bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <CreditCard className="w-5 h-5" />
              {loading ? "Génération..." : "Payer 8 000 FCFA"}
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
