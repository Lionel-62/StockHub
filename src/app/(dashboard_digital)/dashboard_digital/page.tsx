"use client";

import { useAuth } from "@/hooks/auth";
import Link from "next/link";

export default function DigitalDashboardPage() {
  const { currentUser } = useAuth();

  return (
    <div className="px-4 sm:px-6 md:px-8 py-5 md:py-7 space-y-6">
      {/* En-tête de bienvenue & Actions Rapides */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4" data-purpose="header-section">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Espace Produits Digitaux</h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-100 text-amber-800 border border-amber-200">Pro</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Gérez vos téléchargements numériques, accès membres, licences et suivez vos ventes en temps réel.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors w-full sm:w-auto justify-center">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
            </svg>
            Paiement rapide
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors flex-1 sm:flex-none justify-center">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Exporter
          </button>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-sm transition-colors flex-1 sm:flex-none justify-center">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nouveau produit digital
          </button>
        </div>
      </section>

      {/* KPICards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="metrics-summary">
        {/* Revenus Digitaux */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Revenus digitaux (Mois)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">4 850,00 €</span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
              +18.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">vs 4 095 € le mois précédent</p>
        </div>

        {/* Ventes Digitales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Ventes digitales</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">342 ventes</span>
            <span className="text-[11px] font-semibold text-emerald-600">+12%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Livraison instantanée à 100%</p>
        </div>

        {/* Taux de conversion */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Taux de conversion</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">4.6%</span>
            <span className="text-[11px] font-semibold text-emerald-600">+0.8%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Moyenne secteur digital : 3.1%</p>
        </div>

        {/* Clients & Membres */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Clients &amp; Membres</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">1 280</span>
            <span className="text-[11px] font-semibold text-emerald-600">+89 récents</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Communauté active &amp; abonnés</p>
        </div>
      </section>

      {/* ContentTwoColumns */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-purpose="main-analytics-and-products">
        {/* Colonne Principale (8 colonnes) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Graphique d'évolution des ventes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Activité des téléchargements &amp; Revenus</h3>
                <p className="text-xs text-slate-400">Performances journalières des ventes numériques</p>
              </div>
              <div className="flex flex-wrap items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600 sm:self-auto gap-1">
                <button className="px-2.5 py-1 rounded-md text-slate-500 hover:text-slate-900">7j</button>
                <button className="px-2.5 py-1 rounded-md bg-white text-slate-900 shadow-sm">30j</button>
                <button className="px-2.5 py-1 rounded-md text-slate-500 hover:text-slate-900">1 an</button>
              </div>
            </div>
            
            <div className="pt-6">
              <div className="h-56 w-full relative">
                {/* SVG Graph Placeholder */}
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 200">
                  <defs>
                    <linearGradient id="digitalGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25"></stop>
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0"></stop>
                    </linearGradient>
                  </defs>
                  <line stroke="#f1f5f9" strokeDasharray="4" strokeWidth="1" x1="0" x2="600" y1="40" y2="40"></line>
                  <line stroke="#f1f5f9" strokeDasharray="4" strokeWidth="1" x1="0" x2="600" y1="90" y2="90"></line>
                  <line stroke="#f1f5f9" strokeDasharray="4" strokeWidth="1" x1="0" x2="600" y1="140" y2="140"></line>
                  <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="600" y1="190" y2="190"></line>
                  
                  <path d="M 0,160 Q 60,140 120,120 T 240,110 T 360,70 T 480,95 T 600,30 L 600,190 L 0,190 Z" fill="url(#digitalGrad)"></path>
                  <path d="M 0,160 Q 60,140 120,120 T 240,110 T 360,70 T 480,95 T 600,30" fill="none" stroke="#d97706" strokeLinecap="round" strokeWidth="2.5"></path>
                  
                  <circle cx="360" cy="70" fill="#ffffff" r="4" stroke="#d97706" strokeWidth="2"></circle>
                  <circle cx="600" cy="30" fill="#f59e0b" r="5" stroke="#ffffff" strokeWidth="2"></circle>
                </svg>
                
                <div className="absolute top-2 right-12 bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-md shadow-lg pointer-events-none flex items-center gap-1.5">
                  <span className="font-bold">Aujourd'hui :</span> 489,00 € (38 livraisons)
                </div>
              </div>
              
              <div className="flex justify-between text-[11px] font-medium text-slate-400 mt-2 px-1">
                <span>01 Mars</span>
                <span>08 Mars</span>
                <span>15 Mars</span>
                <span>22 Mars</span>
                <span>Aujourd'hui</span>
              </div>
            </div>
          </div>

          {/* Tableau des Dernières ventes digitales */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dernières ventes de produits digitaux</h3>
                <p className="text-xs text-slate-400">Transactions avec envoi automatisé des accès</p>
              </div>
              <a className="text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors" href="#">Voir toutes</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Produit Digital</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Montant</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                          AM
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">Alexandre Mercier</p>
                          <p className="text-[11px] text-slate-400">alex.mercier@gmail.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      Masterclass E-commerce 2025
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Vidéo HD
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">149,00 €</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Téléchargé
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-slate-400 hover:text-slate-700 p-1" title="Renvoyer l'accès">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[11px]">
                          SL
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">Sophie Laurens</p>
                          <p className="text-[11px] text-slate-400">sophie@agency-boost.co</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      Pack Templates Notion Pro
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Lien Notion
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">47,00 €</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Délivré
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-slate-400 hover:text-slate-700 p-1" title="Renvoyer l'accès">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Colonne Latérale Droite (4 colonnes) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Carte Top Produits Digitaux */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Meilleures ventes digitales</h3>
            <p className="text-xs text-slate-400 mb-4">Par volume de revenus générés</p>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800">Masterclass E-commerce</span>
                  <span className="font-semibold text-slate-900">2 235 €</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>15 ventes • 4.9 ★</span>
                  <span className="text-emerald-600 font-medium">+24% ce mois</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800">Pack Notion Pro 2025</span>
                  <span className="font-semibold text-slate-900">1 410 €</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '54%' }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>30 ventes • 5.0 ★</span>
                  <span className="text-emerald-600 font-medium">+15% ce mois</span>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration & Outils Produits Digitaux */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Outils de distribution</h3>
            <div className="space-y-2.5">
              <a className="group p-3 rounded-lg border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/70 transition-all flex items-start gap-3" href="#">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors">Livraison automatisée</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Modèles d'e-mails avec pièces jointes.</p>
                </div>
              </a>

              <a className="group p-3 rounded-lg border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/70 transition-all flex items-start gap-3" href="#">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">Protection (DRM)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Filigrane dynamique avec e-mail.</p>
                </div>
              </a>
            </div>
          </div>

          {/* Santé du store */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Délivrabilité des téléchargements</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">99.8%</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Vos serveurs CDN de fichiers sont optimisés. Latence : <span className="text-white font-semibold">142 ms</span>.
            </p>
            <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '99.8%' }}></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
