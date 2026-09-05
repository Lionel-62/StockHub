"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/hooks/products";

interface AlertListProps {
  products: Product[];
}

export function AlertList({ products }: AlertListProps) {
  const isLoaded = true; // Data is already loaded by the parent component
  
  // Filter products with low stock (<= 15) and sort by stock ascending
  const alerts = products
    .filter(p => p.stock <= 15)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5); // Take top 5

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 mb-4">
        <CardTitle className="text-base font-bold text-slate-900">
          Alertes de rupture
        </CardTitle>
        <Badge variant="secondary" className="bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-full px-2.5 py-0.5">
          {products.filter(p => p.stock <= 15).length}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!isLoaded ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index}>
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
                {index < 4 && <div className="h-px bg-slate-100 w-full mt-2" />}
              </div>
            ))
          ) : (
            alerts.map((alert, index) => (
              <div key={alert.id}>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{alert.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {alert.sku}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "font-semibold rounded-md",
                      alert.stock === 0 
                        ? "bg-red-50 text-red-600 hover:bg-red-100" 
                        : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                    )}
                  >
                    {alert.stock === 0 ? "Épuisé" : `${alert.stock} restant(s)`}
                  </Badge>
                </div>
                {index < alerts.length - 1 && <div className="h-px bg-slate-100 w-full mt-2" />}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
