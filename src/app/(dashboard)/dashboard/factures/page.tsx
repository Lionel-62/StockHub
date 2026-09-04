"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreHorizontal, Eye, FileEdit, Trash2, ChevronLeft, ChevronRight, CheckCircle, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useInvoices } from "@/hooks/invoices";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const { invoices, deleteInvoice, updateInvoiceStatus, isLoaded } = useInvoices();
  
  const itemsPerPage = 20;
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.action-menu-btn') && !target.closest('.action-menu-content')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Tous" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statuses = ["Tous", "Brouillon", "Envoyée", "Payée", "En retard", "Annulée"];

  if (!isMounted) return null;

  return (
    <div className="p-3 md:p-0 max-w-7xl mx-auto space-y-6">
      
      {/* En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Factures</h1>
          <p className="text-slate-500 mt-1">Gérez vos factures, suivez les paiements et relancez les retards.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher (n° facture, client)..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 w-full sm:w-64 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
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
            
            <Link href="/dashboard/factures/nouvelle" className="w-full sm:w-auto block">
              <Button className="w-full bg-[#0b213f] hover:bg-[#18355c] text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md">
                <Plus size={16} className="mr-2" />
                Créer une facture
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tableau des factures */}
      <Card className="shadow-none border-0 ring-0 bg-white rounded-none sm:rounded-xl overflow-visible border-x-0 sm:border-x">
        <CardContent className="p-0 overflow-visible">
          <div className="overflow-x-auto overflow-y-visible min-h-[300px]">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>N° Facture</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date d'émission</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant TTC</TableHead>
                  <TableHead className="text-center w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isLoaded ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-md" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-6 w-6 rounded-md mx-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  paginatedInvoices.map((inv) => (
                    <TableRow 
                      key={inv.id} 
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/dashboard/factures/${inv.id}`)}
                    >
                      <TableCell>
                        <div className="font-semibold text-slate-900"><span className="font-mono">{inv.invoiceNumber}</span></div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-700">{inv.clientName}</div>
                        <div className="text-xs text-slate-500">{inv.clientEmail}</div>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(inv.issueDate).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(inv.dueDate).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={cn("font-medium", 
                            inv.status === "Payée" ? "bg-green-50 text-green-700 border-green-200" : 
                            inv.status === "Envoyée" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                            inv.status === "Brouillon" ? "bg-slate-100 text-slate-700 border-slate-200" :
                            "bg-red-50 text-red-700 border-red-200"
                          )}
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900">
                        <span className="font-mono">{formatCurrency(inv.total)}</span>
                      </TableCell>
                      <TableCell className="text-center relative">
                        <button 
                          className="action-menu-btn p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === inv.id ? null : inv.id);
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        
                        {activeDropdown === inv.id && (
                          <div 
                            className="action-menu-content absolute right-8 top-10 w-48 bg-white border border-slate-200 shadow-lg rounded-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              onClick={() => { setActiveDropdown(null); router.push(`/dashboard/factures/${inv.id}`); }}
                            >
                              <Eye size={16} className="text-slate-400" /> Voir les détails
                            </button>
                            <button 
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              onClick={() => { setActiveDropdown(null); router.push(`/dashboard/factures/nouvelle?edit=${inv.id}`); }}
                            >
                              <FileEdit size={16} className="text-slate-400" /> Modifier la facture
                            </button>
                            
                            <div className="h-px bg-slate-100 my-1 mx-2"></div>
                            
                            {inv.status !== "Payée" && (
                              <button 
                                className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                                onClick={() => { setActiveDropdown(null); updateInvoiceStatus(inv.id, "Payée"); }}
                              >
                                <CheckCircle size={16} className="text-green-500" /> Marquer comme payée
                              </button>
                            )}
                            
                            {inv.status === "Brouillon" && (
                              <button 
                                className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                                onClick={() => { setActiveDropdown(null); updateInvoiceStatus(inv.id, "Envoyée"); }}
                              >
                                <Send size={16} className="text-blue-500" /> Marquer comme envoyée
                              </button>
                            )}
  
                            {inv.status !== "En retard" && inv.status !== "Payée" && (
                              <button 
                                className="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 flex items-center gap-2"
                                onClick={() => { setActiveDropdown(null); updateInvoiceStatus(inv.id, "En retard"); }}
                              >
                                <XCircle size={16} className="text-orange-500" /> Marquer en retard
                              </button>
                            )}
  
                            <div className="h-px bg-slate-100 my-1 mx-2"></div>
                            <button 
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(null);
                                setItemToDelete(inv.id);
                                setDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 size={16} className="text-red-500" /> Supprimer
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                
                {isLoaded && paginatedInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                      Aucune facture ne correspond à votre recherche.
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
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} sur {filteredInvoices.length} factures
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
            deleteInvoice(itemToDelete);
            setItemToDelete(null);
          }
        }}
        title="Supprimer la facture"
        message="Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible."
      />
    </div>
  );
}
