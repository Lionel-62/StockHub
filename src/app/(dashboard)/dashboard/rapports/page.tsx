"use client";

import { useState, useMemo } from "react";
import { BarChart2, TrendingUp, DollarSign, Package, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrders } from "@/hooks/orders";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-3 md:p-0 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Rapports & Analyses</h1>
          <p className="text-slate-500 mt-1">Consultez les performances de votre activité.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm overflow-x-auto hide-scrollbar">
          {[
            { id: "today", label: "Aujourd'hui" },
            { id: "week", label: "Cette Semaine" },
            { id: "month", label: "Ce Mois" },
            { id: "year", label: "Cette Année" },
            { id: "all", label: "Tout le temps" }
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id as TimeRange)}
              className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                timeRange === range.id 
                  ? "bg-[#0b213f] text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Chiffre d'affaires</p>
              <h3 className="text-xl font-bold text-slate-900"><span className="font-mono">{formatCurrency(stats.ca)}</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">CA En ligne</p>
              <h3 className="text-xl font-bold text-slate-900"><span className="font-mono">{formatCurrency(stats.caOnline)}</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">CA Sur place</p>
              <h3 className="text-xl font-bold text-slate-900"><span className="font-mono">{formatCurrency(stats.caInStore)}</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-slate-100 text-slate-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Ventes totales</p>
              <h3 className="text-xl font-bold text-slate-900">{stats.salesCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-orange-100 text-orange-600">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Articles vendus</p>
              <h3 className="text-xl font-bold text-slate-900">{stats.itemsCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
              <BarChart2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Panier moyen</p>
              <h3 className="text-xl font-bold text-slate-900"><span className="font-mono">{formatCurrency(stats.averageBasket)}</span></h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200 lg:col-span-2">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Ventes récentes de la période</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Commande</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Statut</th>
                      <th className="px-4 py-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.slice(0, 5).map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900"><span className="font-mono">{order.orderNumber}</span></td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(order.date).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === "Payée" ? "bg-green-100 text-green-700" :
                            order.status === "Livrée" ? "bg-blue-100 text-blue-700" :
                            "bg-orange-100 text-orange-700"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900"><span className="font-mono">{formatCurrency(order.totalAmount)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <Clock className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <p>Aucune vente sur cette période.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Tendances (CA)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col items-center justify-center min-h-[250px] w-full">
            {chartData.length > 0 && chartData.some(d => d.total > 0) ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [`${formatCurrency(Number(value))}`, "CA"]}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Bar dataKey="total" fill="#0b213f" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 py-10">
                <BarChart2 size={48} className="mx-auto text-slate-300 mb-4" />
                <p>Aucune donnée à afficher</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
