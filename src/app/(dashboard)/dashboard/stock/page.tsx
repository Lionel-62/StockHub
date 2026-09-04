"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Filter, ArrowUpRight, ArrowDownRight, History, PackageMinus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/custom-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProducts, Product } from "@/lib/mock/products";
import { mockStockMovements } from "@/lib/mock/stock";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function StockPage() {
  const [activeTab, setActiveTab] = useState<"inventaire" | "mouvements">("inventaire");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const { products, setProducts, isLoaded } = useProducts();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Auto-scroll pour mobile (3s) en boucle
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.innerWidth >= 768) return; // Ne s'active que sur mobile
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 768) return;
    if (carouselRef.current && carouselRef.current.children.length >= 3) {
      const card = carouselRef.current.children[activeIndex] as HTMLElement;
      if (card) {
        // Défilement fluide vers la carte active
        carouselRef.current.scrollTo({
          left: card.offsetLeft - 24, // 24px pour la marge
          behavior: "smooth"
        });
      }
    }
  }, [activeIndex]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Calculs KPI
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 15).length;
  const totalItems = products.reduce((acc, curr) => acc + curr.stock, 0);

  // Filtrage Inventaire
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Tous" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statuses = ["Tous", "En stock", "Stock faible", "Rupture"];

  const handleAdjustStock = (id: string, amount: number) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const newStock = Math.max(0, p.stock + amount);
        const newStatus = newStock === 0 ? "Rupture" : newStock <= 15 ? "Stock faible" : "En stock";
        return { ...p, stock: newStock, status: newStatus as any };
      }
      return p;
    }));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Gestion des Stocks</h1>
          <p className="text-slate-500 mt-1">Suivez vos niveaux d'inventaire et les mouvements.</p>
        </div>
      </div>

      {/* Cartes KPI */}
      <div 
        ref={carouselRef}
        className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:overflow-visible snap-x snap-mandatory sm:snap-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <Card className="shadow-sm border-slate-200 min-w-[85vw] sm:min-w-[280px] md:min-w-0 shrink-0 snap-center">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Articles en stock</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalItems}</h3>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <ArrowUpRight size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200 min-w-[85vw] sm:min-w-[280px] md:min-w-0 shrink-0 snap-center">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Stock faible</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{lowStockCount}</h3>
              </div>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <ArrowDownRight size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 min-w-[85vw] sm:min-w-[280px] md:min-w-0 shrink-0 snap-center">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">En rupture</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{outOfStockCount}</h3>
              </div>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <PackageMinus size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et Onglets */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white p-2 rounded-xl shadow-sm border border-slate-200">
        <div className="flex bg-slate-100 rounded-lg p-1 w-full sm:w-auto">
          <button 
            className={cn("flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200", activeTab === "inventaire" ? "bg-white text-[#0b213f] shadow-sm" : "text-slate-500 hover:text-slate-700")}
            onClick={() => { setActiveTab("inventaire"); setCurrentPage(1); }}
          >
            Inventaire
          </button>
          <button 
            className={cn("flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 flex items-center justify-center gap-2", activeTab === "mouvements" ? "bg-white text-[#0b213f] shadow-sm" : "text-slate-500 hover:text-slate-700")}
            onClick={() => { setActiveTab("mouvements"); setCurrentPage(1); }}
          >
            <History size={16} />
            Mouvements
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto px-2 sm:px-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-1.5 w-full border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            />
          </div>
          {activeTab === "inventaire" && (
            <div className="relative w-full sm:w-auto">
              <CustomSelect
                options={statuses.map(s => ({ value: s, label: s }))}
                value={statusFilter}
                onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                placeholder="Tous les statuts"
                searchable={false}
                className="w-full sm:w-[160px] py-0"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tableau */}
      <Card className="shadow-none border-0 ring-0 bg-white rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {activeTab === "inventaire" ? (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="text-center">Stock actuel</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Ajustement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!isLoaded ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-md" /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    paginatedProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div className="font-semibold text-slate-900 line-clamp-1">{product.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5"><span className="font-mono">{product.sku}</span></div>
                        </TableCell>
                        <TableCell className="text-slate-500">{product.category}</TableCell>
                        <TableCell className="text-center font-bold text-slate-900"><span className="font-mono">{product.stock}</span></TableCell>
                        <TableCell>
                          <Badge 
                            className={cn("font-medium", 
                              product.status === "En stock" ? "bg-green-100 text-green-700 hover:bg-green-200" : 
                              product.status === "Stock faible" ? "bg-orange-100 text-orange-700 hover:bg-orange-200" : 
                              "bg-red-100 text-red-700 hover:bg-red-200"
                            )}
                          >
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => handleAdjustStock(product.id, -1)}
                              className="h-8 w-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors bg-slate-100 font-bold hover:text-red-600"
                            >
                              -
                            </button>
                            <button 
                              onClick={() => handleAdjustStock(product.id, 1)}
                              className="h-8 w-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors bg-slate-100 font-bold hover:text-green-600"
                            >
                              +
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {isLoaded && paginatedProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-500">Aucun produit trouvé.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Quantité</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Motif</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStockMovements.map((mov) => (
                    <TableRow key={mov.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(mov.date).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">{mov.productName}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={cn("font-medium", 
                            mov.type === "Entrée" ? "border-green-200 text-green-700 bg-green-50" : 
                            mov.type === "Sortie" ? "border-blue-200 text-blue-700 bg-blue-50" : 
                            "border-orange-200 text-orange-700 bg-orange-50"
                          )}
                        >
                          {mov.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn("text-center font-bold", mov.quantity > 0 ? "text-green-600" : "text-slate-900")}>
                        {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                      </TableCell>
                      <TableCell className="text-slate-500">{mov.user}</TableCell>
                      <TableCell className="text-slate-500 italic text-sm">{mov.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination (pour Inventaire uniquement) */}
          {activeTab === "inventaire" && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
              <span className="text-sm text-slate-500">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredProducts.length)} sur {filteredProducts.length} articles
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
      
    </div>
  );
}
