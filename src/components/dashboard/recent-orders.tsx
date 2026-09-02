"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

import { useOrders } from "@/lib/mock/orders";

export function RecentOrders() {
  const { orders, isLoaded } = useOrders();
  const recentOrders = orders.slice(0, 5); // Get top 5 most recent orders

  return (
    <Card className="shadow-sm border-slate-200 col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-bold text-slate-900">
          Commandes récentes
        </CardTitle>
        <Link href="/dashboard/ventes" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:translate-x-1 transition-transform duration-200">
          Voir tout &rarr;
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider h-10">Commande</TableHead>
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider h-10">Client</TableHead>
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider h-10">Montant</TableHead>
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider h-10">Statut</TableHead>
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider h-10 text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoaded ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-slate-100">
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-md" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-28 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : (
              recentOrders.map((order) => (
                <TableRow key={order.id} className="border-slate-100">
                  <TableCell className="font-bold text-slate-900">{order.orderNumber}</TableCell>
                  <TableCell className="text-slate-600">{order.clientName}</TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={cn(
                        "font-semibold rounded-md",
                        order.status === "Payée" ? "bg-green-100 text-green-700 hover:bg-green-200" :
                        order.status === "En attente" ? "bg-orange-100 text-orange-700 hover:bg-orange-200" :
                        order.status === "Livrée" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" :
                        "bg-slate-100 text-slate-700"
                      )}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-500 text-sm">
                    {new Date(order.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
