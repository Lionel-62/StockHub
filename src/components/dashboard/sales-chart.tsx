"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Order } from "@/hooks/orders";

interface SalesChartProps {
  orders: Order[];
}

export function SalesChart({ orders }: SalesChartProps) {
  const [period, setPeriod] = useState<"7" | "30">("7");

  const data = useMemo(() => {
    const days = period === "7" ? 7 : 30;
    const now = new Date();
    const result = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      
      const dayStr = d.toISOString().split('T')[0];
      const ordersForDay = orders.filter(o => o.date.startsWith(dayStr) && o.status !== "Annulée");
      const ventes = ordersForDay.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      result.push({
        name: period === "7" 
          ? d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')
          : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        ventes,
        fullDate: dayStr
      });
    }
    return result;
  }, [orders, period]);

  const [activeIndex, setActiveIndex] = useState(data.length - 1);

  return (
    <Card className="shadow-sm border-slate-200 col-span-2">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">Ventes des {period} derniers jours</CardTitle>
          <p className="text-xs text-slate-400 mt-1">Boutique physique + boutique en ligne</p>
        </div>
        <div className="flex bg-slate-100 rounded-full p-1">
          <button 
            className={cn("px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 active:scale-95", period === "7" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50")}
            onClick={() => { setPeriod("7"); setActiveIndex(6); }}
          >
            7 jours
          </button>
          <button 
            className={cn("px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 active:scale-95", period === "30" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50")}
            onClick={() => { setPeriod("30"); setActiveIndex(29); }}
          >
            30 jours
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
              onMouseMove={(state) => {
                if (state.activeTooltipIndex !== undefined) {
                  setActiveIndex(state.activeTooltipIndex as number);
                }
              }}
              onMouseLeave={() => setActiveIndex(data.length - 1)}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={false}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#0b213f', color: 'white' }}
                itemStyle={{ color: 'white' }}
                formatter={(value: any) => [`${new Intl.NumberFormat('fr-FR').format(Math.round(Number(value)))} FCFA`, 'Ventes']}
              />
              <Bar dataKey="ventes" radius={[4, 4, 4, 4]} barSize={period === "7" ? 40 : 10}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === activeIndex ? '#0b213f' : '#dbeafe'} 
                    style={{ transition: 'fill 0.2s ease' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
