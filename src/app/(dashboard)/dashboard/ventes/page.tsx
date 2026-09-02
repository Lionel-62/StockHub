"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, Eye, ReceiptText, ChevronLeft, ChevronRight, Calendar, X, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { DatePicker } from "@/components/ui/date-picker";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrders } from "@/lib/mock/orders";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

import { useRouter } from "next/navigation";

export default function SalesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [dateFilter, setDateFilter] = useState("");
  const [todayStr, setTodayStr] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { orders, isLoaded } = useOrders();
  const itemsPerPage = 20;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.action-menu-btn') && !target.closest('.action-menu-content')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    
    // Déterminer la date d'aujourd'hui en toute sécurité (hydratation)
    const today = new Date().toISOString().split('T')[0];
    setTodayStr(today);

    // Vérifier si le paramètre filter=today est présent
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("filter") === "today") {
        setDateFilter(today);
      }
    }
    
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Tous" || order.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter) {
      const orderStr = new Date(order.date).toISOString().split('T')[0];
      matchesDate = dateFilter === orderStr;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const exportToCSV = () => {
    const headers = ["N° Commande", "Date", "Client", "Statut", "Paiement", "Total (XOF)"];
    
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map(order => [
        order.orderNumber,
        new Date(order.date).toLocaleDateString("fr-FR"),
        `"${order.clientName}"`,
        order.status,
        order.paymentMethod,
        order.total
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `export_commandes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statuses = ["Tous", "Payée", "Livrée", "En attente", "Annulée"];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Ventes & Commandes</h1>
          <p className="text-slate-500 mt-1">Suivez les commandes de vos clients et les encaissements.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher (n° commande, client)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center w-full sm:w-auto relative">
                <DatePicker
                  value={dateFilter}
                  onChange={(val) => { setDateFilter(val || ""); setCurrentPage(1); }}
                  placeholder="Toutes les dates"
                  className="w-full sm:w-[200px]"
                />
                {dateFilter && (
                  <button 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation(); 
                      setDateFilter(""); 
                      setCurrentPage(1); 
                    }}
                    className="absolute z-10 text-slate-400 hover:text-red-500 transition-colors p-1 right-2 bg-white rounded-full"
                    title="Effacer la date"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              
              <div className="relative w-full sm:w-auto">
                <CustomSelect
                  options={statuses.map(s => ({ value: s, label: s }))}
                  value={statusFilter}
                  onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                  placeholder="Tous les statuts"
                  searchable={false}
                  className="w-full sm:w-[160px]"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button onClick={exportToCSV} variant="outline" className="w-full sm:w-auto hover:bg-slate-100 transition-colors border-slate-200 flex items-center justify-center">
                <Download size={16} className="mr-2" />
                <span>Exporter CSV</span>
              </Button>
              <Link href="/dashboard/ventes/nouvelle" className="w-full sm:w-auto block">
                <Button className="w-full bg-[#0b213f] hover:bg-[#18355c] text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center">
                  <Plus size={16} className="mr-2" />
                  Nouvelle vente
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des commandes */}
      <Card className="shadow-none border-0 ring-0 bg-transparent sm:bg-white sm:shadow-sm sm:ring-1 sm:ring-slate-200 rounded-xl overflow-visible">
        <CardContent className="p-0 overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Paiement</TableHead>
                  <TableHead className="text-center w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isLoaded ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-md" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Skeleton className="h-7 w-7 rounded-md" />
                          <Skeleton className="h-7 w-7 rounded-md" />
                          <Skeleton className="h-7 w-7 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50 transition-colors group">
                      <TableCell>
                        <div className="font-semibold text-slate-900">{order.orderNumber}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{order.itemsCount} article(s)</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-700">{order.clientName}</div>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(order.date).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={cn("font-medium", 
                            order.status === "Payée" ? "bg-green-50 text-green-700 border-green-200" : 
                            order.status === "Livrée" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                            order.status === "En attente" ? "bg-orange-50 text-orange-700 border-orange-200" :
                            "bg-red-50 text-red-700 border-red-200"
                          )}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm text-slate-600">{order.paymentMethod}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Détails de la commande ${order.orderNumber}\n\nMontant : ${formatCurrency(order.totalAmount)}\nArticles : ${order.itemsCount}\nStatut : ${order.status}`);
                            }}
                            title="Voir détails"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/factures/nouvelle?orderId=${order.id}`);
                            }}
                            title="Générer facture"
                          >
                            <ReceiptText size={16} />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToDelete(order.id);
                              setDeleteModalOpen(true);
                            }}
                            title="Supprimer la vente"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                
                {isLoaded && paginatedOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                      Aucune commande trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
              <span className="text-sm text-slate-500">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredOrders.length)} sur {filteredOrders.length} commandes
              </span>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft size={16} />
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button 
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    className={cn("h-8 w-8", currentPage === i + 1 ? "bg-[#0b213f] text-white" : "")}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (itemToDelete) {
            // Logique de suppression ici
            // setOrders(orders.filter(o => o.id !== itemToDelete));
            setItemToDelete(null);
            setDeleteModalOpen(false);
          }
        }}
        title="Supprimer la vente"
        message="Êtes-vous sûr de vouloir supprimer cette vente ? Les stocks associés pourraient devoir être ajustés manuellement."
      />
    </div>
  );
}
