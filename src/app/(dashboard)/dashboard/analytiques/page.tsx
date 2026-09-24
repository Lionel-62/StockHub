"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/auth";
import { useOrders } from "@/hooks/orders";
import { useClients } from "@/hooks/clients";
import { Calendar, Filter, Info, Eye, Users, DollarSign, Target, AlignJustify } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "Résumé" | "Ventes" | "Visites" | "Clients" | "Taux de conversion";

export default function AnalytiquesPage() {
  const { currentUser } = useAuth();
  const { orders } = useOrders();
  const { clients } = useClients();
  const themeColor = currentUser?.themeColor || '#0b213f';

  const [activeTab, setActiveTab] = useState<Tab>("Résumé");

  const tabs: { id: Tab, label: string, icon: any }[] = [
    { id: "Résumé", label: "Résumé", icon: AlignJustify },
    { id: "Ventes", label: "Ventes", icon: DollarSign },
    { id: "Visites", label: "Visites", icon: Eye },
    { id: "Clients", label: "Clients", icon: Users },
    { id: "Taux de conversion", label: "Taux de conversion", icon: Target },
  ];

  const stats = useMemo(() => {
    let revenue = 0;
    let productsSold = 0;
    const salesCount = orders.filter(o => o.status === "Payée" || o.status === "Livrée").length;
    
    orders.forEach(order => {
      if (order.status === "Payée" || order.status === "Livrée") {
        revenue += order.totalAmount;
      }
      productsSold += order.itemsCount;
    });

    const averageBasket = salesCount > 0 ? revenue / salesCount : 0;
    const totalClients = clients.length;
    
    // For now, these are mocked as per the design requirements
    const visits = 0; 
    const conversionRate = 0;
    const newClients = 0; 

    return {
      revenue,
      averageBasket,
      productsSold,
      salesCount,
      visits,
      conversionRate,
      totalClients,
      newClients
    };
  }, [orders, clients]);

  const formatCurrency = (amount: number) => {
    let curr = currentUser?.currency || "XOF";
    if (curr === "FCFA") curr = "XOF"; // Fallback to a valid ISO code
    
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const AnalytiqueCard = ({ value, label }: { value: string | number, label: string }) => (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex flex-col relative h-32 hover:shadow-md transition-shadow">
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-[28px] font-extrabold text-slate-800 tracking-tight leading-none mb-2">
          {value}
        </h3>
        <p className="text-sm font-medium text-slate-500">
          {label}
        </p>
      </div>
      <button className="absolute bottom-6 right-6 text-slate-300 hover:text-slate-400 transition-colors">
        <Info size={16} />
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500 min-h-screen bg-[#F9FAFB]">
      
      {/* Top Bar with Date & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-sm border border-slate-200/60 w-full max-w-2xl mx-auto">
          <Calendar size={18} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-600 flex-1 text-center">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <button className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all relative
                ${isActive ? "text-slate-800 bg-white shadow-sm border border-slate-200" : "text-slate-500 hover:bg-white/50 hover:text-slate-700"}
              `}
            >
              <Icon size={14} className={isActive ? "" : "opacity-70"} style={isActive ? { color: themeColor } : {}} />
              {tab.label}
              {isActive && (
                <div 
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full" 
                  style={{ backgroundColor: themeColor }}
                ></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Areas */}
      <div className="space-y-8 max-w-4xl mx-auto">
        
        {/* Ventes Section */}
        {(activeTab === "Résumé" || activeTab === "Ventes") && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 ml-1">Ventes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnalytiqueCard value={formatCurrency(stats.revenue)} label="Revenu total" />
              <AnalytiqueCard value={formatCurrency(stats.averageBasket)} label="Panier moyen" />
              <AnalytiqueCard value={stats.productsSold} label="Produits vendus" />
              <AnalytiqueCard value={stats.salesCount} label="Total des ventes" />
            </div>
          </div>
        )}

        {/* Visites Section */}
        {(activeTab === "Résumé" || activeTab === "Visites" || activeTab === "Taux de conversion") && (
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-bold text-slate-800 ml-1">Visites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnalytiqueCard value={stats.visits} label="Nombre total de visites" />
              <AnalytiqueCard value={`${stats.conversionRate}%`} label="Taux de conversion" />
            </div>
          </div>
        )}

        {/* Clients Section */}
        {(activeTab === "Résumé" || activeTab === "Clients") && (
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-bold text-slate-800 ml-1">Clients</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnalytiqueCard value={stats.totalClients} label="Nombre total de clients" />
              <AnalytiqueCard value={stats.newClients} label="Nouveaux clients" />
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
