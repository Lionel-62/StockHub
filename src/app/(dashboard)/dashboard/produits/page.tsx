"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash2, X, Save, Camera, Upload, ChevronLeft, ChevronRight, Store as StoreIcon, Package, CheckSquare, Sparkles, Loader2 } from "lucide-react";
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
import { ConfirmModal } from "@/components/ui/confirm-modal";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const { products, addProduct, updateProduct, deleteProduct, isLoaded } = useProducts();
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [isImprovingDesc, setIsImprovingDesc] = useState(false);
  const [isImprovingImage, setIsImprovingImage] = useState(false);

  const handleImproveImage = async () => {
    if (!currentProduct.imageUrl) return;
    setIsImprovingImage(true);
    
    // Simulate AI API call (e.g., Background removal + Studio lighting via Nano Banana or GPT)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Apply filters to make the image "pop" (simulate professional lighting)
        ctx.filter = "brightness(1.1) contrast(1.15) saturate(1.2)";
        ctx.drawImage(img, 0, 0);
        
        const enhancedUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCurrentProduct(prev => ({ ...prev, imageUrl: enhancedUrl }));
      }
      setIsImprovingImage(false);
    };
    img.src = currentProduct.imageUrl;
  };

  const [improvingGalleryIdx, setImprovingGalleryIdx] = useState<number | null>(null);

  const handleImproveGalleryImage = async (idx: number) => {
    if (!currentProduct.galleryUrls || !currentProduct.galleryUrls[idx]) return;
    setImprovingGalleryIdx(idx);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.filter = "brightness(1.1) contrast(1.15) saturate(1.2)";
        ctx.drawImage(img, 0, 0);
        
        const enhancedUrl = canvas.toDataURL("image/jpeg", 0.9);
        const newGallery = [...(currentProduct.galleryUrls || [])];
        newGallery[idx] = enhancedUrl;
        setCurrentProduct(prev => ({ ...prev, galleryUrls: newGallery }));
      }
      setImprovingGalleryIdx(null);
    };
    img.src = currentProduct.galleryUrls[idx];
  };


  const handleImproveDescription = async () => {
    if (!currentProduct.description || currentProduct.description.trim() === "") return;
    setIsImprovingDesc(true);
    
    // Simulate AI API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let improved = currentProduct.description.trim()
      .replace(/([.,!?])([^\s])/g, '$1 $2') // Fix spacing after punctuation
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .replace(/\. \s*([a-z])/g, (match, letter) => `. ${letter.toUpperCase()}`);
      
    if (!improved.endsWith(".")) improved += ".";
    
    // Make it sound professional
    if (improved.length < 30) {
      improved = `✨ Découvrez notre produit de qualité supérieure : ${improved} Idéal pour répondre à tous vos besoins avec une satisfaction garantie.`;
    } else {
      improved = `✨ ${improved} \n\nUne excellente opportunité à ne pas manquer, conçu spécialement pour vous offrir la meilleure qualité possible.`;
    }
    
    setCurrentProduct(prev => ({ ...prev, description: improved }));
    setIsImprovingDesc(false);
  };

  // Dropdown State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const categoryOptions = useMemo(() => {
    const baseCategories = [
      "Alimentation", "Électronique", "Mode & Vêtements", "Maison & Décoration",
      "Sport & Loisirs", "Streaming & Contenu Digital", "Téléphonie", 
      "Télétravail & Bureau à distance", "Véhicules Électriques", "Voyage & Bagages",
      "Beauté & Santé", "Jouets & Enfants", "Livres & Culture", "Services", "Autre"
    ];
    
    // Extract unique categories from existing products
    const uniqueExistingCats = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    const existingCats = uniqueExistingCats.filter(c => !baseCategories.includes(c)); // Don't duplicate base ones

    if (currentProduct?.category && !baseCategories.includes(currentProduct.category) && !existingCats.includes(currentProduct.category)) {
      existingCats.push(currentProduct.category);
    }
    
    return [...baseCategories, ...existingCats].map(cat => ({
      value: cat,
      label: cat
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [products, currentProduct?.category]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Tous" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statuses = ["Tous", "En stock", "Stock faible", "Rupture"];

  const handleOpenAdd = () => {
    setModalMode("add");
    setCurrentProduct({ 
      name: "", 
      sku: `SKU-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`, 
      category: "Alimentation", 
      purchasePrice: 0, 
      salePrice: 0, 
      stock: 0, 
      status: "Rupture",
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?q=80&w=200&auto=format&fit=crop",
      isPublishedOnStore: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setModalMode("edit");
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      deleteProduct(itemToDelete);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSave = () => {
    const stockNum = Number(currentProduct.stock) || 0;
    const statusVal = stockNum === 0 ? "Rupture" : stockNum < 15 ? "Stock faible" : "En stock";
    
    if (modalMode === "add") {
      const newProduct = {
        ...currentProduct,
        id: `prod-${Date.now()}`,
        sku: currentProduct.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        stock: stockNum,
        purchasePrice: Number(currentProduct.purchasePrice) || 0,
        salePrice: Number(currentProduct.salePrice) || 0,
        status: statusVal
      } as Product;
      addProduct(newProduct);
    } else {
      const updatedProduct = {
        ...currentProduct,
        stock: stockNum,
        purchasePrice: Number(currentProduct.purchasePrice) || 0,
        salePrice: Number(currentProduct.salePrice) || 0,
        status: statusVal
      } as Product;
      updateProduct(updatedProduct);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 relative">
      
      {/* En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Produits</h1>
          <p className="text-slate-500 mt-1">Gérez votre catalogue d'articles et vos prix.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, SKU..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 w-full sm:w-64 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
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
            
            <Button onClick={handleOpenAdd} className="w-full sm:w-auto bg-[#0b213f] hover:bg-[#18355c] text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md">
              <Plus size={16} className="mr-2" />
              Nouveau produit
            </Button>
          </div>
        </div>
      </div>

      {/* Tableau des produits */}
      <Card className="shadow-sm border-slate-200 bg-white rounded-xl overflow-visible">
        <CardContent className="p-0 overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Prix d'achat</TableHead>
                  <TableHead className="text-right">Prix de vente</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50 transition-colors group">
                    <TableCell>
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative shrink-0">
                        <Image 
                          src={product.imageUrl} 
                          alt={product.name} 
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900 line-clamp-1">{product.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{product.sku}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-medium">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-slate-500 font-medium">
                      {formatCurrency(product.purchasePrice)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      {formatCurrency(product.salePrice)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        className={cn("font-medium", 
                          product.status === "En stock" ? "bg-green-100 text-green-700 hover:bg-green-200" : 
                          product.status === "Stock faible" ? "bg-orange-100 text-orange-700 hover:bg-orange-200" : 
                          "bg-red-100 text-red-700 hover:bg-red-200"
                        )}
                      >
                        {product.stock}
                      </Badge>
                      {product.isPublishedOnStore !== false ? (
                        <div className="flex items-center justify-center mt-1 text-xs text-blue-600 bg-blue-50 w-fit mx-auto px-2 py-0.5 rounded-full gap-1" title="Publié sur la boutique">
                          <StoreIcon size={10} />
                          En ligne
                        </div>
                      ) : (
                        <div className="flex items-center justify-center mt-1 text-xs text-slate-500 bg-slate-100 w-fit mx-auto px-2 py-0.5 rounded-full gap-1" title="Non publié">
                          <StoreIcon size={10} />
                          Hors ligne
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleOpenEdit(product); }}
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setItemToDelete(product.id);
                            setDeleteModalOpen(true);
                          }}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {paginatedProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                      Aucun produit ne correspond à votre recherche.
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
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredProducts.length)} sur {filteredProducts.length} produits
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
      
      {/* Modal Ajouter/Modifier Produit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden border border-slate-200 transform scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {modalMode === "add" ? "Nouveau Produit" : "Modifier le Produit"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Nom du produit *</label>
                  <input 
                    type="text" 
                    value={currentProduct.name || ""}
                    onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    placeholder="Ex: Riz parfumé"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">Description (Optionnelle)</label>
                    {currentProduct.description && currentProduct.description.trim() !== "" && (
                      <button 
                        onClick={handleImproveDescription}
                        disabled={isImprovingDesc}
                        type="button"
                        className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
                      >
                        {isImprovingDesc ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        Améliorer via IA
                      </button>
                    )}
                  </div>
                  <textarea 
                    value={currentProduct.description || ""}
                    onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}
                    rows={4}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 bg-slate-50 resize-none transition-all"
                    placeholder="Ex: Sac de 5kg de riz très parfumé..."
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">Image du produit</label>
                    {currentProduct.imageUrl && !currentProduct.imageUrl.startsWith("http") && (
                      <button 
                        onClick={handleImproveImage}
                        disabled={isImprovingImage}
                        type="button"
                        className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
                        title="Détourage et amélioration Studio (Fonctionnalité Premium)"
                      >
                        {isImprovingImage ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        Sublimer (Premium)
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 relative group">
                      {currentProduct.imageUrl && !currentProduct.imageUrl.startsWith("http") ? (
                        <Image src={currentProduct.imageUrl} alt="Preview" fill className="object-cover" />
                      ) : (
                        <Camera size={24} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-sm font-semibold text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all w-full">
                        <Upload size={16} className="mr-2 text-slate-500" />
                        Importer ou Prendre une photo
                        <input 
                          type="file" 
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const img = new window.Image();
                                img.onload = () => {
                                  const canvas = document.createElement("canvas");
                                  let width = img.width;
                                  let height = img.height;
                                  const MAX = 1600; // Resize to max 1600px for high quality
                                  if (width > height) {
                                    if (width > MAX) {
                                      height *= MAX / width;
                                      width = MAX;
                                    }
                                  } else {
                                    if (height > MAX) {
                                      width *= MAX / height;
                                      height = MAX;
                                    }
                                  }
                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext("2d");
                                  ctx?.drawImage(img, 0, 0, width, height);
                                  const dataUrl = canvas.toDataURL("image/jpeg", 0.9); // High quality
                                  setCurrentProduct({...currentProduct, imageUrl: dataUrl});
                                };
                                img.src = event.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <p className="text-xs text-slate-500 mt-2">Format JPG, PNG ou capture directe via caméra.</p>
                    </div>
                  </div>
                </div>

                {currentProduct.imageUrl && (
                  <div className="space-y-1.5 md:col-span-2 pt-2 border-t border-slate-100">
                    <label className="text-sm font-medium text-slate-700">Images supplémentaires (jusqu'à 3)</label>
                    <div className="flex items-center gap-4 flex-wrap">
                      {currentProduct.galleryUrls?.map((url, idx) => (
                        <div key={idx} className="h-16 w-16 rounded-xl border border-slate-200 bg-slate-50 relative group overflow-visible">
                          {improvingGalleryIdx === idx && (
                            <div className="absolute inset-0 z-20 bg-black/40 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                              <Loader2 size={16} className="text-white animate-spin" />
                            </div>
                          )}
                          <Image src={url} alt={`Gallery ${idx}`} fill className="object-cover rounded-xl" />
                          
                          <button 
                            type="button"
                            className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-30"
                            onClick={() => {
                              const newGallery = [...(currentProduct.galleryUrls || [])];
                              newGallery.splice(idx, 1);
                              setCurrentProduct({...currentProduct, galleryUrls: newGallery});
                            }}
                          >
                            <X size={12} />
                          </button>

                          {!url.startsWith("http") && improvingGalleryIdx !== idx && (
                            <button
                              type="button"
                              onClick={() => handleImproveGalleryImage(idx)}
                              className="absolute inset-0 z-10 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Sublimer l'image (Premium)"
                            >
                              <Sparkles size={20} className="text-amber-400" />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {(!currentProduct.galleryUrls || currentProduct.galleryUrls.length < 3) && (
                        <label className="cursor-pointer h-16 w-16 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-colors relative">
                          <Plus size={20} />
                          <input 
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const img = new window.Image();
                                  img.onload = () => {
                                    const canvas = document.createElement("canvas");
                                    let width = img.width;
                                    let height = img.height;
                                    const MAX = 1600;
                                    if (width > height) {
                                      if (width > MAX) {
                                        height *= MAX / width;
                                        width = MAX;
                                      }
                                    } else {
                                      if (height > MAX) {
                                        width *= MAX / height;
                                        height = MAX;
                                      }
                                    }
                                    canvas.width = width;
                                    canvas.height = height;
                                    const ctx = canvas.getContext("2d");
                                    ctx?.drawImage(img, 0, 0, width, height);
                                    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
                                    setCurrentProduct(prev => ({
                                      ...prev, 
                                      galleryUrls: [...(prev.galleryUrls || []), dataUrl].slice(0, 3)
                                    }));
                                  };
                                  img.src = event.target?.result as string;
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">SKU / Code *</label>
                  <input 
                    type="text" 
                    value={currentProduct.sku || ""}
                    onChange={(e) => setCurrentProduct({...currentProduct, sku: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Catégorie</label>
                  <CustomSelect 
                    options={categoryOptions}
                    value={currentProduct.category || ""}
                    onChange={(val) => setCurrentProduct({...currentProduct, category: val})}
                    placeholder="Sélectionnez une catégorie"
                    searchPlaceholder="Rechercher ou créer une catégorie..."
                    allowCreate={true}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Prix d'achat</label>
                  <input 
                    type="number"
                    min="0"
                    value={currentProduct.purchasePrice || ""}
                    onChange={(e) => setCurrentProduct({...currentProduct, purchasePrice: Number(e.target.value)})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Prix de vente *</label>
                  <input 
                    type="number"
                    min="0"
                    value={currentProduct.salePrice || ""}
                    onChange={(e) => setCurrentProduct({...currentProduct, salePrice: Number(e.target.value)})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Stock initial *</label>
                  <input 
                    type="number"
                    min="0"
                    value={currentProduct.stock || 0}
                    onChange={(e) => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={currentProduct.isPublishedOnStore !== false} // default to true if undefined
                        onChange={(e) => setCurrentProduct({...currentProduct, isPublishedOnStore: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <StoreIcon size={14} className="text-blue-600" /> Afficher sur ma Boutique en Ligne
                      </span>
                      <span className="text-xs text-slate-500">Si activé, ce produit sera visible par vos clients sur votre lien public.</span>
                    </div>
                  </label>
                </div>

                <div className="space-y-4 md:col-span-2 pt-4 border-t border-slate-100">
                  {/* Promotion */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">Promotion</span>
                        <span className="text-xs text-slate-500">Activer une promotion pour ce produit</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={currentProduct.promotionalPrice !== undefined}
                          onChange={(e) => setCurrentProduct({...currentProduct, promotionalPrice: e.target.checked ? currentProduct.salePrice : undefined})}
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </label>
                    {currentProduct.promotionalPrice !== undefined && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <label className="text-sm font-medium text-slate-700">Nouveau prix promotionnel</label>
                        <input 
                          type="number"
                          min="0"
                          value={currentProduct.promotionalPrice || ""}
                          onChange={(e) => setCurrentProduct({...currentProduct, promotionalPrice: Number(e.target.value)})}
                          className="w-full mt-1.5 p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                          placeholder="Ex: 4500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Offres en pack */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                          <Package size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">Offres en pack</span>
                          <span className="text-xs text-slate-500">Proposez des packs à prix réduit pour encourager les achats en quantité.</span>
                        </div>
                      </div>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={currentProduct.packOffers !== undefined}
                          onChange={(e) => setCurrentProduct({...currentProduct, packOffers: e.target.checked ? [{ quantity: 2, price: (currentProduct.salePrice || 0) * 1.8 }] : undefined})}
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </label>
                    {currentProduct.packOffers !== undefined && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                        {currentProduct.packOffers.map((pack, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <div className="flex-1">
                              <input 
                                type="number" 
                                placeholder="Quantité" 
                                value={pack.quantity || ""} 
                                onChange={(e) => {
                                  const newOffers = [...(currentProduct.packOffers || [])];
                                  newOffers[idx].quantity = Number(e.target.value);
                                  setCurrentProduct({...currentProduct, packOffers: newOffers});
                                }}
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50"
                              />
                            </div>
                            <div className="flex-1">
                              <input 
                                type="number" 
                                placeholder="Prix total" 
                                value={pack.price || ""} 
                                onChange={(e) => {
                                  const newOffers = [...(currentProduct.packOffers || [])];
                                  newOffers[idx].price = Number(e.target.value);
                                  setCurrentProduct({...currentProduct, packOffers: newOffers});
                                }}
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50"
                              />
                            </div>
                            <button 
                              onClick={() => {
                                const newOffers = currentProduct.packOffers!.filter((_, i) => i !== idx);
                                setCurrentProduct({...currentProduct, packOffers: newOffers.length ? newOffers : undefined});
                              }}
                              className="p-2.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const newOffers = [...(currentProduct.packOffers || []), { quantity: 3, price: 0 }];
                            setCurrentProduct({...currentProduct, packOffers: newOffers});
                          }}
                          className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Plus size={14} className="mr-1" /> Ajouter une offre
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Options du produit */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckSquare size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">Options du produit</span>
                          <span className="text-xs text-slate-500">Optionnel - ajoutez les choix disponibles pour l'acheteur (couleur, taille, etc.).</span>
                        </div>
                      </div>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={currentProduct.options !== undefined}
                          onChange={(e) => setCurrentProduct({...currentProduct, options: e.target.checked ? [{ name: "Taille", values: ["S", "M", "L"] }] : undefined})}
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </label>
                    {currentProduct.options !== undefined && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                        {currentProduct.options.map((opt, idx) => (
                          <div key={idx} className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Nom (ex: Taille)" 
                                value={opt.name} 
                                onChange={(e) => {
                                  const newOpts = [...(currentProduct.options || [])];
                                  newOpts[idx].name = e.target.value;
                                  setCurrentProduct({...currentProduct, options: newOpts});
                                }}
                                className="flex-1 p-2 border border-slate-200 rounded-lg text-sm bg-white"
                              />
                              <button 
                                onClick={() => {
                                  const newOpts = currentProduct.options!.filter((_, i) => i !== idx);
                                  setCurrentProduct({...currentProduct, options: newOpts.length ? newOpts : undefined});
                                }}
                                className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors bg-white border border-slate-200"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <input 
                              type="text" 
                              placeholder="Valeurs séparées par des virgules (ex: S, M, L)" 
                              value={opt.values.join(", ")} 
                              onChange={(e) => {
                                const newOpts = [...(currentProduct.options || [])];
                                newOpts[idx].values = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                                setCurrentProduct({...currentProduct, options: newOpts});
                              }}
                              className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                            />
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const newOpts = [...(currentProduct.options || []), { name: "Couleur", values: [] }];
                            setCurrentProduct({...currentProduct, options: newOpts});
                          }}
                          className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Plus size={14} className="mr-1" /> Ajouter une option
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
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
        title="Supprimer le produit"
        message="Êtes-vous sûr de vouloir supprimer ce produit du catalogue ? Cette action est irréversible."
      />
    </div>
  );
}
