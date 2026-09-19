"use client";

import { useState, useMemo } from "react";
import { BarChart2, TrendingUp, DollarSign, Package, Clock, Download, Printer, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrders } from "@/hooks/orders";
import { useProducts } from "@/hooks/products";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Utilitaires de date natifs
const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfWeek = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7; // Convertir dimanche (0) en 7
  if (day !== 1) d.setHours(-24 * (day - 1));
  return d;
};

const startOfMonth = (date: Date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfYear = (date: Date) => {
  const d = new Date(date);
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isAfter = (date: Date, dateToCompare: Date) => {
  return date.getTime() > dateToCompare.getTime();
};

type TimeRange = "today" | "week" | "month" | "year" | "all";

export default function RapportsPage() {
  const { orders } = useOrders();
  const { products } = useProducts();
  const [timeRange, setTimeRange] = useState<TimeRange>("today");

  const filteredOrders = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;

    switch (timeRange) {
      case "today":
        startDate = startOfDay(now);
        break;
      case "week":
        startDate = startOfWeek(now); // Semaine commence lundi
        break;
      case "month":
        startDate = startOfMonth(now);
        break;
      case "year":
        startDate = startOfYear(now);
        break;
      case "all":
      default:
        startDate = null;
    }

    return orders.filter(order => {
      if (order.status === "Annulée") return false;
      if (startDate) {
        return isAfter(new Date(order.date), startDate);
      }
      return true;
    });
  }, [orders, timeRange]);

  const stats = useMemo(() => {
    let ca = 0;
    let caOnline = 0;
    let caInStore = 0;
    let itemsCount = 0;
    let salesCount = filteredOrders.length;

    filteredOrders.forEach(order => {
      if (order.status === "Payée" || order.status === "Livrée") {
        ca += order.totalAmount;
        if (order.source === "En ligne") {
          caOnline += order.totalAmount;
        } else {
          caInStore += order.totalAmount;
        }
      }
      itemsCount += order.itemsCount;
    });

    const averageBasket = salesCount > 0 ? ca / salesCount : 0;

    return {
      ca,
      caOnline,
      caInStore,
      itemsCount,
      salesCount,
      averageBasket
    };
  }, [filteredOrders]);

  const chartData = useMemo(() => {
    const dataMap = new Map<string, number>();

    if (timeRange === "week") {
      const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
      days.forEach(d => dataMap.set(d, 0));
    } else if (timeRange === "year") {
      const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
      months.forEach(m => dataMap.set(m, 0));
    } else if (timeRange === "month") {
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for(let i=1; i<=daysInMonth; i++) {
        dataMap.set(i.toString(), 0);
      }
    }

    filteredOrders.forEach(order => {
      if (order.status !== "Payée" && order.status !== "Livrée") return;
      
      const d = new Date(order.date);
      let key = "";
      
      if (timeRange === "today") {
        key = `${d.getHours()}h`;
      } else if (timeRange === "week") {
        const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
        key = days[d.getDay()];
      } else if (timeRange === "month") {
        key = d.getDate().toString();
      } else if (timeRange === "year") {
        const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
        key = months[d.getMonth()];
      } else {
        key = `${d.getMonth()+1}/${d.getFullYear()}`;
      }
      
      const current = dataMap.get(key) || 0;
      dataMap.set(key, current + order.totalAmount);
    });

    let result = Array.from(dataMap.entries()).map(([name, total]) => ({ name, total }));
    
    if (timeRange === "today" || timeRange === "month") {
      result.sort((a,b) => parseInt(a.name) - parseInt(b.name));
    } else if (timeRange === "all") {
      result.sort((a,b) => {
        const [m1,y1] = a.name.split('/');
        const [m2,y2] = b.name.split('/');
        if(y1 !== y2) return parseInt(y1) - parseInt(y2);
        return parseInt(m1) - parseInt(m2);
      });
    }

    return result;
  }, [filteredOrders, timeRange]);

  const topProducts = useMemo(() => {
    const productSales = new Map<string, { id: string, name: string, qty: number, revenue: number }>();
    
    filteredOrders.forEach(order => {
      if (order.status !== "Payée" && order.status !== "Livrée") return;
      order.items.forEach(item => {
        const existing = productSales.get(item.productId) || { id: item.productId, name: item.name, qty: 0, revenue: 0 };
        existing.qty += item.quantity;
        existing.revenue += (item.unitPrice * item.quantity);
        productSales.set(item.productId, existing);
      });
    });

    const sorted = Array.from(productSales.values()).sort((a, b) => b.qty - a.qty).slice(0, 5);
    
    // Attach image URLs
    return sorted.map(sale => {
      const p = products.find(prod => prod.id === sale.id);
      return { ...sale, imageUrl: p?.imageUrl };
    });
  }, [filteredOrders, products]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const timeRangeLabels: Record<TimeRange, string> = {
    today: "Aujourd'hui",
    week: "Cette Semaine",
    month: "Ce Mois",
    year: "Cette Année",
    all: "Tout le temps"
  };

  const exportReportToCSV = () => {
    const escapeCsv = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const summaryLines = [
      ["RAPPORT D'ANALYSE COMMERCIALE - STOCKHUB"],
      ["Periode analysee", escapeCsv(timeRangeLabels[timeRange])],
      ["Date d'exportation", escapeCsv(new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR"))],
      [""],
      ["INDICATEURS CLES DE PERFORMANCE"],
      ["Chiffre d'affaires total (XOF)", stats.ca],
      ["CA Ventes en ligne (XOF)", stats.caOnline],
      ["CA Ventes sur place (XOF)", stats.caInStore],
      ["Nombre total de ventes", stats.salesCount],
      ["Total articles vendus", stats.itemsCount],
      ["Panier moyen (XOF)", Math.round(stats.averageBasket)],
      [""],
      ["DETAIL DES VENTES SUR LA PERIODE"],
      ["Numero Commande", "Date & Heure", "Client", "Canal / Source", "Statut", "Montant Total (XOF)"]
    ];

    const orderRows = filteredOrders.map(o => [
      escapeCsv(o.orderNumber),
      escapeCsv(new Date(o.date).toLocaleDateString("fr-FR") + " " + new Date(o.date).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })),
      escapeCsv(o.clientName || "Client comptoir"),
      escapeCsv(o.source || "Sur place"),
      escapeCsv(o.status),
      o.totalAmount
    ]);

    const csvContent = "\uFEFF" + [
      ...summaryLines.map(r => r.join(";")),
      ...orderRows.map(r => r.join(";"))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rapport_financier_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3 md:p-4 max-w-7xl mx-auto space-y-4 min-h-[90dvh]">
      
      {/* En-tête visible à l'écran */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-0.5">Sales Performance & Business Analytics.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Sélecteur de période */}
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto hide-scrollbar">
            {[
              { id: "today", label: "Aujourd'hui" },
              { id: "week", label: "Semaine" },
              { id: "month", label: "Mois" },
              { id: "year", label: "Année" },
              { id: "all", label: "Tout" }
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id as TimeRange)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all duration-300 ${
                  timeRange === range.id 
                    ? "bg-[#0b213f] text-white shadow-sm scale-100" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 scale-95"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Boutons d'export */}
          <div className="flex items-center gap-2">
            <Button
              onClick={exportReportToCSV}
              variant="outline"
              size="sm"
              className="bg-white border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 shadow-sm rounded-xl h-9"
            >
              <Download size={14} className="text-slate-500" />
              <span className="hidden sm:inline text-xs font-semibold text-slate-700">Export</span>
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="sm"
              className="bg-white border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 shadow-sm rounded-xl h-9"
            >
              <Printer size={14} className="text-blue-600" />
              <span className="hidden sm:inline text-xs font-semibold text-blue-700">Print</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Left/Main Column */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-4 lg:space-y-6">
          
          {/* BIG CHART CARD */}
          <Card className="bg-[#0b213f] border-0 shadow-lg overflow-hidden rounded-2xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <CardHeader className="border-b border-white/5 pb-3 pt-4 px-5 relative z-10 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-white">Croissance du Chiffre d'Affaires</CardTitle>
                <p className="text-blue-200/60 text-xs mt-0.5">Évolution sur {timeRangeLabels[timeRange].toLowerCase()}</p>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-medium text-blue-200/60">Total CA Période</p>
                <p className="text-xl font-black text-white tracking-tight"><span className="font-mono">{formatCurrency(stats.ca)}</span></p>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-5 pt-4 relative z-10 w-full flex flex-col justify-end">
              {chartData.length > 0 && chartData.some(d => d.total > 0) ? (
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                        tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                      />
                      <Tooltip 
                        cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px -3px rgb(0 0 0 / 0.1)', padding: '10px 14px' }}
                        itemStyle={{ color: '#0b213f', fontWeight: 'bold' }}
                        formatter={(value: any) => [`${formatCurrency(Number(value))}`, "Revenus"]}
                        labelStyle={{ color: '#64748b', fontSize: '11px', fontWeight: '600', marginBottom: '2px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#ffffff" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorTotal)"
                        activeDot={{ r: 5, fill: '#0b213f', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-blue-200/40 h-[220px]">
                  <TrendingUp size={36} className="mb-3 opacity-50" />
                  <p className="font-medium text-sm">Aucune donnée pour cette période</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* KPI CARDS (Glassmorphism/Premium White) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-0 shadow-sm rounded-xl bg-white hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-xs font-semibold text-slate-500">Revenu Total</p>
                  <div className="h-6 w-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                    <DollarSign size={14} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none mb-1"><span className="font-mono">{formatCurrency(stats.ca)}</span></h3>
                  <p className="text-[10px] font-medium text-slate-400">Période sélectionnée</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-xl bg-white hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-xs font-semibold text-slate-500">CA En ligne</p>
                  <div className="h-6 w-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign size={14} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none mb-1"><span className="font-mono">{formatCurrency(stats.caOnline)}</span></h3>
                  <p className="text-[10px] font-medium text-slate-400">Commandes Web</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-xl bg-white hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-xs font-semibold text-slate-500">CA Sur place</p>
                  <div className="h-6 w-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                    <DollarSign size={14} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none mb-1"><span className="font-mono">{formatCurrency(stats.caInStore)}</span></h3>
                  <p className="text-[10px] font-medium text-slate-400">Ventes au comptoir</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-xl bg-white hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-xs font-semibold text-slate-500">Panier Moyen</p>
                  <div className="h-6 w-6 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center">
                    <ShoppingBag size={14} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none mb-1"><span className="font-mono">{formatCurrency(stats.averageBasket)}</span></h3>
                  <p className="text-[10px] font-medium text-slate-400">Sur {stats.salesCount} ventes</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
        
        {/* Right Column */}
        <div className="lg:col-span-1 xl:col-span-1 h-full">
          
          {/* TOP SELLING PRODUCTS */}
          <Card className="border-0 shadow-sm rounded-2xl bg-white h-full flex flex-col">
            <CardHeader className="border-b border-slate-100 pb-3 px-4 pt-4 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-800">Top Ventes</CardTitle>
                <div className="p-1 bg-slate-100 rounded-md text-slate-500"><TrendingUp size={14}/></div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              {topProducts.length > 0 ? (
                <div className="flex flex-col divide-y divide-slate-50">
                  {topProducts.map((prod, idx) => (
                    <div key={prod.id} className="flex items-center gap-3 p-3 hover:bg-slate-50/50 transition-colors group">
                      <div className="flex-shrink-0 w-4 font-bold text-slate-300 text-xs">{idx + 1}</div>
                      <div className="h-8 w-8 rounded-full bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200 group-hover:border-slate-300">
                        {prod.imageUrl && prod.imageUrl !== "undefined" && prod.imageUrl !== "null" ? (
                          <Image src={prod.imageUrl} alt={prod.name} fill className="object-cover" unoptimized/>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-300"><Package size={12}/></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{prod.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{prod.qty} vendus</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-slate-900"><span className="font-mono">{formatCurrency(prod.revenue)}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 h-full flex flex-col justify-center">
                  <Package size={24} className="mx-auto opacity-20 mb-2" />
                  <p className="text-xs">Aucun produit vendu</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
