"use client";

import { DollarSign, ShoppingCart, AlertTriangle, Package } from "lucide-react";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { AlertList } from "@/components/dashboard/alert-list";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { useOrders } from "@/lib/mock/orders";
import { useProducts } from "@/lib/mock/products";

export default function DashboardPage() {
  const { orders, isLoaded: ordersLoaded } = useOrders();
  const { products, isLoaded: productsLoaded } = useProducts();

  // Calculate real stats
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalSales = orders.length;
  
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.salePrice), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(Math.round(amount));
  };

  return (
    <div className="space-y-6">
      <div className="flex overflow-x-auto pb-4 -mx-6 px-6 md:pb-0 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 snap-x snap-mandatory sm:snap-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {(!ordersLoaded || !productsLoaded) ? (
          <>
            <div className="min-w-[85vw] sm:min-w-[280px] md:min-w-0 shrink-0 snap-center"><StatCardSkeleton /></div>
            <div className="min-w-[85vw] sm:min-w-[280px] md:min-w-0 shrink-0 snap-center"><StatCardSkeleton /></div>
            <div className="min-w-[85vw] sm:min-w-[280px] md:min-w-0 shrink-0 snap-center"><StatCardSkeleton /></div>
            <div className="min-w-[85vw] sm:min-w-[280px] md:min-w-0 shrink-0 snap-center"><StatCardSkeleton /></div>
          </>
        ) : (
          <>
            <div className="min-w-[85vw] sm:min-w-[280px] md:min-w-0 shrink-0 snap-center">
              <StatCard 
              title="Chiffre d'affaires (Total)" 
              value={formatCurrency(totalRevenue)} 
              subValue="FCFA"
              trend="+12,4%"
              trendText="Cumul total"
              trendType="up"
              icon={DollarSign} 
              iconColorClass="text-blue-600" 
              iconBgClass="bg-blue-100" 
            />
            </div>
            <div className="min-w-[85vw] sm:min-w-[280px] md:min-w-0 shrink-0 snap-center">
            <StatCard 
              title="Ventes (Total)" 
              value={totalSales.toString()} 
              trend="Commandes enregistrées"
              trendText=""
              trendType="up"
              icon={ShoppingCart} 
              iconColorClass="text-green-600" 
              iconBgClass="bg-green-100" 
            />
            </div>
            <div className="min-w-[85vw] sm:min-w-[280px] md:min-w-0 shrink-0 snap-center">
            <StatCard 
              title="Produits en rupture" 
              value={outOfStockCount.toString()} 
              trend="À réapprovisionner"
              trendType="alert"
              icon={AlertTriangle} 
              iconColorClass="text-red-600" 
              iconBgClass="bg-red-100" 
            />
            </div>
            <div className="min-w-[85vw] sm:min-w-[280px] md:min-w-0 shrink-0 snap-center">
            <StatCard 
              title="Valeur totale du stock" 
              value={formatCurrency(totalStockValue)} 
              subValue="FCFA"
              trend={`${products.length} références`}
              trendType="neutral"
              icon={Package} 
              iconColorClass="text-slate-600" 
              iconBgClass="bg-slate-200" 
            />
            </div>
          </>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <SalesChart />
        <div className="md:col-span-1">
          <AlertList />
        </div>
      </div>

      <RecentOrders />
    </div>
  );
}
