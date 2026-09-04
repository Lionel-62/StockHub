"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Mail, Phone, MoreHorizontal, Edit, Trash2, X, Save, ChevronLeft, ChevronRight, Receipt, Download } from "lucide-react";
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
import { Contact } from "@/hooks/contacts";
import { useClients } from "@/hooks/clients";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const { clients: allClients, addClient, updateClient, deleteClient, isLoaded } = useClients();
  const clients = allClients.filter(c => c.type === "Client");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [isMounted, setIsMounted] = useState(false);

  // Dropdown State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentClient, setCurrentClient] = useState<Partial<Contact>>({});

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

  if (!isMounted) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "Tous" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportToCSV = () => {
    const headers = ["ID", "Nom", "Email", "Téléphone", "Statut", "Total Acheté"];
    
    const csvContent = [
      headers.join(","),
      ...filteredClients.map(client => [
        client.id,
        `"${client.name}"`,
        client.email,
        client.phone,
        client.status,
        client.totalAmount
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `export_clients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statuses = ["Tous", "Actif", "Inactif"];

  const handleOpenAdd = () => {
    setModalMode("add");
    setCurrentClient({ name: "", email: "", phone: "", status: "Actif", totalAmount: 0, lastOrderDate: new Date().toISOString() });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Contact) => {
    setModalMode("edit");
    setCurrentClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      deleteClient(itemToDelete);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSave = () => {
    if (modalMode === "edit") {
      updateClient(currentClient as Contact);
    } else {
      const newClient = { ...currentClient, type: "Client", id: Date.now().toString(), createdAt: new Date().toISOString() } as Contact;
      addClient(newClient);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-3 md:p-0 max-w-7xl mx-auto space-y-6 relative">
      
      {/* En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Clients</h1>
          <p className="text-slate-500 mt-1">Gérez votre base de données clients et leur historique.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
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
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button onClick={exportToCSV} variant="outline" className="w-full sm:w-auto hover:bg-slate-100 transition-colors border-slate-200 shadow-sm flex items-center justify-center">
                <Download size={16} className="mr-2" />
                <span>Exporter CSV</span>
              </Button>
              <Button onClick={handleOpenAdd} className="w-full sm:w-auto bg-[#0b213f] hover:bg-[#18355c] text-white transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center">
                <Plus size={16} className="mr-2" />
                Nouveau client
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des clients */}
      <Card className="shadow-none border-0 ring-0 bg-white rounded-none sm:rounded-xl overflow-visible border-x-0 sm:border-x">
        <CardContent className="p-0 overflow-visible">
          <div className="overflow-x-auto overflow-y-visible min-h-[300px]">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Total Achats</TableHead>
                  <TableHead className="text-center w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isLoaded ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-md" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-6 w-6 rounded-md mx-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  paginatedClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-slate-50 transition-colors group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 line-clamp-1">{client.name}</div>
                            {client.source === "En ligne" && (
                              <Badge className="mt-1 bg-purple-100 text-purple-700 hover:bg-purple-200 text-[10px] px-1.5 py-0 border-purple-200">
                                Boutique en ligne
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-sm text-slate-600">
                            <Mail size={14} className="mr-2 text-slate-400 shrink-0" />
                            <span className="line-clamp-1">{client.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <Phone size={14} className="mr-2 text-slate-400 shrink-0" />
                            <span className="line-clamp-1">{client.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={cn("font-medium", 
                            client.status === "Actif" ? "bg-green-100 text-green-700 hover:bg-green-200" : 
                            "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          )}
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-900">
                        <span className="font-mono">{formatCurrency(client.totalAmount || 0)}</span>
                      </TableCell>
                      <TableCell className="text-center relative">
                        <button 
                          className="action-menu-btn p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === client.id ? null : client.id);
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>
  
                        {activeDropdown === client.id && (
                          <div 
                            className="action-menu-content absolute right-8 top-10 w-48 bg-white border border-slate-200 shadow-lg rounded-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              onClick={() => { setActiveDropdown(null); handleOpenEdit(client); }}
                            >
                              <Edit size={16} className="text-slate-400" /> Modifier client
                            </button>
                            <button 
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              onClick={() => { setActiveDropdown(null); router.push(`/dashboard/factures/nouvelle?clientId=${client.id}`); }}
                            >
                              <Receipt size={16} className="text-slate-400" /> Générer une facture
                            </button>
                            <div className="h-px bg-slate-100 my-1 mx-2"></div>
                            <button 
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              onClick={() => { 
                                setActiveDropdown(null); 
                                setItemToDelete(client.id);
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
                
                {isLoaded && paginatedClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                      Aucun client ne correspond à votre recherche.
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
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredClients.length)} sur {filteredClients.length} clients
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
      
      {/* Modal Ajouter/Modifier Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden border border-slate-200 transform scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {modalMode === "add" ? "Nouveau Client" : "Modifier le Client"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Nom complet *</label>
                <input 
                  type="text" 
                  value={currentClient.name || ""}
                  onChange={(e) => setCurrentClient({...currentClient, name: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  placeholder="Jean Dupont"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input 
                  type="email" 
                  value={currentClient.email || ""}
                  onChange={(e) => setCurrentClient({...currentClient, email: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  placeholder="jean@exemple.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Téléphone</label>
                <input 
                  type="tel" 
                  value={currentClient.phone || ""}
                  onChange={(e) => setCurrentClient({...currentClient, phone: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  placeholder="+229 XX XX XX XX"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Statut</label>
                <CustomSelect
                  options={[
                    { value: "Actif", label: "Actif" },
                    { value: "Inactif", label: "Inactif" }
                  ]}
                  value={currentClient.status || "Actif"}
                  onChange={(val) => setCurrentClient({ ...currentClient, status: val as "Actif" | "Inactif" })}
                  searchable={false}
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="bg-white">
                Annuler
              </Button>
              <Button onClick={handleSave} className="bg-[#0b213f] hover:bg-[#18355c] text-white">
                <Save size={16} className="mr-2" />
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer le client"
        message="Êtes-vous sûr de vouloir supprimer ce client ? Toutes ses données seront effacées. Cette action est irréversible."
      />
    </div>
  );
}
