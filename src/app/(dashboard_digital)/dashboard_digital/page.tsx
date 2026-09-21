"use client";

import { DollarSign, ShoppingCart, PackageOpen, Sparkles, Rocket, ArrowRight } from "lucide-react";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { useOrders } from "@/hooks/orders";
import { useProducts } from "@/hooks/products";
import { useAuth } from "@/hooks/auth";
import { Button } from "@/components/ui/button";

import Link from "next/link";

export default function DashboardPage() {
  const { orders: rawOrders, isLoaded: ordersLoaded } = useOrders();
  const orders = rawOrders.filter(o => o.status !== "Annulée");
  const { products, isLoaded: productsLoaded } = useProducts();

  // Calculate real stats
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalSales = orders.length;
  
  // Calculate trend
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthOrders = orders.filter(o => {
    if (!o?.date) return false;
    const d = new Date(o.date);
    return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const previousMonthOrders = orders.filter(o => {
    if (!o?.date) return false;
    const d = new Date(o.date);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return !isNaN(d.getTime()) && d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });

  const currentMonthRevenue = currentMonthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const previousMonthRevenue = previousMonthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  let revenueTrend = 0;
  if (previousMonthRevenue > 0) {
    revenueTrend = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
  } else if (currentMonthRevenue > 0) {
    revenueTrend = 100;
  }

  const formattedTrend = revenueTrend > 0 
    ? `+${revenueTrend.toFixed(1).replace('.', ',')}%` 
    : revenueTrend < 0 
      ? `${revenueTrend.toFixed(1).replace('.', ',')}%` 
      : "0%";
  const trendType = revenueTrend >= 0 ? "up" : "down";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(Math.round(amount));
  };
  
  const { currentUser } = useAuth();
  const themeColor = currentUser?.themeColor || '#FACC15';

  // Empty State for brand new shops (0 products, 0 orders)
  if (productsLoaded && ordersLoaded && products.length === 0 && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] max-w-2xl mx-auto text-center space-y-8 px-4 animate-in fade-in duration-700">
        
        <h1 className="text-[32px] font-medium tracking-tight text-[#222222] font-serif flex items-center justify-center gap-2">
          Bonsoir {currentUser?.name?.split(' ')[0] || "l'ami"} ! <span className="text-[28px]">🌙</span>
        </h1>
        
        {/* Box Illustration Area */}
        <div className="relative w-full max-w-[420px] aspect-[2/1] mx-auto bg-[#F6F6F6] rounded-2xl flex items-center justify-center overflow-hidden">
          {/* Simple Box Drawing (using CSS/SVG) */}
          <div className="relative w-32 h-24">
            <svg width="100%" height="100%" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 70 L100 100 L160 70 L100 40 Z" fill="white" stroke="#333" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M40 70 L40 110 L100 140 L100 100" fill="white" stroke="#333" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M160 70 L160 110 L100 140 L100 100" fill="white" stroke="#333" strokeWidth="2" strokeLinejoin="round"/>
              {/* Flaps */}
              <path d="M40 70 L20 40 L80 10" fill="transparent" stroke="#333" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M160 70 L180 40 L120 10" fill="transparent" stroke="#333" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            
            {/* The yellow square sticking out */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80%] w-12 h-14 rounded-md rotate-[-5deg] shadow-sm flex items-center justify-center border border-black/10" style={{ backgroundColor: themeColor }}>
              <div className="w-4 h-4 rounded-full bg-black/20 absolute top-2 left-2"></div>
            </div>
            
            {/* Some floating shapes */}
            <div className="absolute top-0 right-0 w-8 h-10 border-2 border-[#333] bg-white -rotate-12 translate-x-4 -translate-y-4 rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 border border-[#333] rounded-full"></div>
            </div>
            <div className="absolute bottom-4 left-0 w-8 h-8 border-2 border-[#333] bg-white rotate-12 -translate-x-6 flex flex-col gap-1 p-1">
              <div className="w-full h-1 bg-[#333] rounded-full"></div>
              <div className="w-2/3 h-1 bg-[#333] rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[13px] font-medium text-[#555] flex items-center justify-center gap-1.5">
            <span className="text-[14px]">🛍️</span> Les heures de shopping sont là - optimisez vos offres :
          </p>
          
          <h2 className="text-[26px] font-bold text-[#111] flex items-center justify-center gap-2">
            Ajouter votre premier produit <span className="text-[24px]">🚀</span>
          </h2>
        </div>

        <Link href="/dashboard_digital/produits" className="mt-2">
          <Button className="font-semibold px-8 py-5 rounded-full text-[15px] transition-all hover:scale-105 border-0 text-black flex items-center gap-2 shadow-sm" style={{ backgroundColor: themeColor }}>
            Continuer <ArrowRight size={16} strokeWidth={2.5} />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex overflow-x-auto pb-4 -mx-6 px-6 md:pb-0 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 snap-x snap-mandatory sm:snap-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {(!ordersLoaded || !productsLoaded) ? (
          <>
            <div className="min-w-[85vw] sm:min-w-[280px] md:min-w-0 shrink-0 snap-center"><StatCardSkeleton /></div>
            <div className="min-w-[85vw] sm:min-w-[280px] md:min-w-0 shrink-0 snap-center"><StatCardSkeleton /></div>
          </>
        ) : (
          <>
            <div className="min-w-[85vw] sm:min-w-[280px] md:min-w-0 shrink-0 snap-center">
              <StatCard 
              title="Revenus (Digital)" 
              value={formatCurrency(totalRevenue)} 
              subValue="FCFA"
              trend={formattedTrend}
              trendText="vs mois précédent"
              trendType={trendType}
              icon={DollarSign} 
              iconColorClass="text-slate-800" 
              iconBgClass="bg-slate-100" 
            />
            </div>
            <div className="min-w-[85vw] sm:min-w-[280px] md:min-w-0 shrink-0 snap-center">
            <StatCard 
              title="Ventes (Digital)" 
              value={totalSales.toString()} 
              trend="Commandes enregistrées"
              trendText=""
              trendType="up"
              icon={ShoppingCart} 
              iconColorClass="text-slate-800" 
              iconBgClass="bg-slate-100" 
            />
            </div>
          </>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <SalesChart orders={orders} />
      </div>

      <RecentOrders orders={orders} />
    </div>
  );
}
