"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, Search, Eye, ReceiptText, ChevronLeft, ChevronRight, X, Trash2, Download, 
  Globe, CheckCircle2, Clock, Truck, Ban, ChevronDown, MessageCircle, Check, 
  Store, AlertCircle, ShoppingBag
} from "lucide-react";
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
import { useOrders, Order } from "@/hooks/orders";
import { useClients } from "@/hooks/clients";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function SalesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState<string | null>(null);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { orders, updateOrder, deleteOrder, isLoaded } = useOrders();
  const { clients } = useClients();
  const itemsPerPage = 20;

  // Fermer les dropdowns quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.status-dropdown-container')) {
        setOpenStatusDropdownId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Auto-hide notification après 3 secondes
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleStatusChange = async (order: Order, newStatus: Order["status"]) => {
    if (order.status === newStatus) {
      setOpenStatusDropdownId(null);
      return;
    }

    try {
      const updated = { ...order, status: newStatus };
      await updateOrder(updated);

      if (selectedOrderForDetail?.id === order.id) {
        setSelectedOrderForDetail(updated);
      }

      setNotification({
        message: `Commande ${order.orderNumber} passée en "${newStatus}"`,
        type: "success"
      });
    } catch (err) {
      setNotification({
        message: "Erreur lors de la mise à jour du statut.",
        type: "error"
      });
    }
    setOpenStatusDropdownId(null);
  };

  const getClientPhone = (clientName: string) => {
    const match = clients.find(c => c.name.toLowerCase().trim() === clientName.toLowerCase().trim());
    return match?.phone || "";
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
    const headers = ["N° Commande", "Source", "Date", "Client", "Statut", "Paiement", "Total (XOF)"];
    
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.source || "Sur place",
        new Date(order.date).toLocaleDateString("fr-FR"),
        `"${order.clientName}"`,
        order.status,
        order.paymentMethod,
        order.totalAmount
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `commandes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statuses: ("Tous" | Order["status"])[] = ["Tous", "Payée", "Livrée", "En attente", "Annulée"];

  const getStatusBadgeStyle = (status: Order["status"]) => {
    switch (status) {
      case "Payée":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70";
      case "Livrée":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/70";
      case "En attente":
        return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70";
      case "Annulée":
        return "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/70";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "Payée":
        return <CheckCircle2 size={13} className="text-emerald-600" />;
      case "Livrée":
        return <Truck size={13} className="text-blue-600" />;
      case "En attente":
        return <Clock size={13} className="text-amber-600" />;
      case "Annulée":
        return <Ban size={13} className="text-rose-600" />;
    }
  };

  return (
    <div className="p-3 md:p-0 max-w-7xl mx-auto space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div className={cn(
          "fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in fade-in slide-in-from-top-4",
          notification.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-rose-50 border-rose-200 text-rose-800"
        )}>
          {notification.type === "success" ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-rose-600" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Ventes & Commandes</h1>
          <p className="text-slate-500 mt-1">Gérez vos commandes en ligne et sur place avec modification de statut instantanée.</p>
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
      <Card className="shadow-none border-0 ring-0 bg-transparent sm:bg-white sm:shadow-sm sm:ring-1 sm:ring-slate-200 rounded-none sm:rounded-xl overflow-visible border-x-0 sm:border-x">
        <CardContent className="p-0 overflow-visible">
          <div className="overflow-x-auto overflow-y-visible min-h-[300px]">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Commande</TableHead>
                  <TableHead>Client & Source</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut (Cliquer pour changer)</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Paiement</TableHead>
                  <TableHead className="text-center w-24">Actions</TableHead>
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
                      <TableCell><Skeleton className="h-6 w-24 rounded-md" /></TableCell>
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
                  paginatedOrders.map((order) => {
                    const isOnline = order.source === "En ligne";
                    const isDropdownOpen = openStatusDropdownId === order.id;

                    return (
                      <TableRow 
                        key={order.id} 
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedOrderForDetail(order)}
                      >
                        <TableCell>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span className="font-mono">{order.orderNumber}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{order.itemsCount} article(s)</div>
                        </TableCell>

                        <TableCell>
                          <div className="font-medium text-slate-800">{order.clientName}</div>
                          <div className="mt-0.5">
                            {isOnline ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
                                <Globe size={10} /> Vitrine en ligne
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                <Store size={10} /> Sur place
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-slate-500 text-sm">
                          {new Date(order.date).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </TableCell>

                        {/* Cellule Statut avec Sélecteur interactif 1-clic */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block status-dropdown-container">
                            <button
                              type="button"
                              onClick={() => setOpenStatusDropdownId(isDropdownOpen ? null : order.id)}
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer shadow-xs",
                                getStatusBadgeStyle(order.status)
                              )}
                              title="Cliquer pour changer de statut"
                            >
                              {getStatusIcon(order.status)}
                              <span>{order.status}</span>
                              <ChevronDown size={12} className={cn("transition-transform text-current opacity-70", isDropdownOpen && "rotate-180")} />
                            </button>

                            {/* Menu Déroulant Statuts */}
                            {isDropdownOpen && (
                              <div className="absolute left-0 top-full mt-1.5 z-40 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs font-medium animate-in fade-in zoom-in-95">
                                <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                                  Changer le statut
                                </div>
                                {(["Payée", "Livrée", "En attente", "Annulée"] as Order["status"][]).map((st) => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleStatusChange(order, st)}
                                    className={cn(
                                      "w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors",
                                      order.status === st && "font-bold text-[#0b213f] bg-blue-50/50"
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(st)}
                                      <span>{st}</span>
                                    </div>
                                    {order.status === st && <Check size={14} className="text-[#0b213f]" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-right font-bold text-slate-900">
                          <span className="font-mono">{formatCurrency(order.totalAmount)}</span>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="text-xs sm:text-sm text-slate-600 font-medium">{order.paymentMethod}</div>
                        </TableCell>

                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              onClick={() => setSelectedOrderForDetail(order)}
                              title="Voir les détails complets"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              onClick={() => router.push(`/dashboard/factures/nouvelle?orderId=${order.id}`)}
                              title="Générer une facture"
                            >
                              <ReceiptText size={16} />
                            </button>
                            <button 
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              onClick={() => {
                                setItemToDelete(order.id);
                                setDeleteModalOpen(true);
                              }}
                              title="Supprimer la commande"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
      
      {/* Modal Détail Commande Complet */}
      {selectedOrderForDetail && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedOrderForDetail(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="p-5 bg-gradient-to-r from-[#0b213f] to-blue-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold font-mono">{selectedOrderForDetail.orderNumber}</h2>
                    {selectedOrderForDetail.source === "En ligne" ? (
                      <span className="text-[10px] font-bold bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/40">
                        🌐 En ligne
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-white/10 text-slate-200 px-2 py-0.5 rounded-full">
                        🏬 Sur place
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-blue-200 mt-0.5">
                    {new Date(selectedOrderForDetail.date).toLocaleDateString("fr-FR", { 
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrderForDetail(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Corps Modal */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              
              {/* Carte Client */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Client</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{selectedOrderForDetail.clientName}</div>
                  {getClientPhone(selectedOrderForDetail.clientName) ? (
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                      <span>WhatsApp : {getClientPhone(selectedOrderForDetail.clientName)}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 mt-0.5 italic">Aucun numéro renseigné</div>
                  )}
                </div>

                {getClientPhone(selectedOrderForDetail.clientName) && (
                  <a
                    href={`https://wa.me/${getClientPhone(selectedOrderForDetail.clientName).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Bonjour ${selectedOrderForDetail.clientName}, concernant votre commande ${selectedOrderForDetail.orderNumber} sur notre boutique...`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Sélecteur de Statut */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Statut de la commande :
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["Payée", "Livrée", "En attente", "Annulée"] as Order["status"][]).map((st) => {
                    const isCurrent = selectedOrderForDetail.status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(selectedOrderForDetail, st)}
                        className={cn(
                          "py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all",
                          isCurrent 
                            ? cn("ring-2 ring-offset-1", getStatusBadgeStyle(st), 
                                st === "Payée" ? "ring-emerald-500 font-extrabold" :
                                st === "Livrée" ? "ring-blue-500 font-extrabold" :
                                st === "En attente" ? "ring-amber-500 font-extrabold" : "ring-rose-500 font-extrabold"
                              )
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {getStatusIcon(st)}
                        <span>{st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Articles commandés */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Articles ({selectedOrderForDetail.itemsCount})</span>
                  <span className="text-xs text-slate-500">Paiement : <strong>{selectedOrderForDetail.paymentMethod}</strong></span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {selectedOrderForDetail.items && selectedOrderForDetail.items.length > 0 ? (
                      selectedOrderForDetail.items.map((it, idx) => (
                        <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs sm:text-sm">
                          <div>
                            <div className="font-semibold text-slate-900">{it.name}</div>
                            <div className="text-slate-500 text-[11px]">
                              {it.quantity} × {formatCurrency(it.unitPrice)}
                            </div>
                          </div>
                          <div className="font-bold font-mono text-slate-900">
                            {formatCurrency(it.quantity * it.unitPrice)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-white text-xs text-slate-500 italic text-center">
                        Détail des articles non disponible (commande groupée)
                      </div>
                    )}
                  </div>
                  
                  {/* Total */}
                  <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">Montant Total :</span>
                    <span className="font-extrabold text-base sm:text-lg text-[#0b213f] font-mono">
                      {formatCurrency(selectedOrderForDetail.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  router.push(`/dashboard/factures/nouvelle?orderId=${selectedOrderForDetail.id}`);
                }}
                className="w-full sm:w-auto text-xs font-semibold flex items-center justify-center gap-1.5 border-slate-300 hover:bg-white"
              >
                <ReceiptText size={15} />
                <span>Générer Facture / Reçu</span>
              </Button>

              <Button
                onClick={() => setSelectedOrderForDetail(null)}
                className="w-full sm:w-auto bg-[#0b213f] hover:bg-blue-900 text-white text-xs font-semibold px-6"
              >
                Fermer
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          if (itemToDelete) {
            await deleteOrder(itemToDelete);
            setItemToDelete(null);
            setDeleteModalOpen(false);
            setNotification({
              message: "Commande supprimée avec succès.",
              type: "success"
            });
          }
        }}
        title="Supprimer la vente"
        message="Êtes-vous sûr de vouloir supprimer cette commande ? Cette action retirera la transaction de vos statistiques."
      />
    </div>
  );
}
