"use client";

import { Menu, Search, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/hooks/auth";
import { ChevronDown, Store, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { deleteShopAction } from "@/app/actions/shop.actions";

export function Topbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const pathname = usePathname();
  const isDashboardHome = pathname === "/dashboard";
  const { currentUser } = useAuth();
  const [shopToDelete, setShopToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteShop = async () => {
    if (!shopToDelete || !currentUser) return;
    setIsDeleting(true);
    const res = await deleteShopAction(shopToDelete.id);
    setIsDeleting(false);
    
    if (res.success) {
      // Remove from session
      const newShops = currentUser.myShops?.filter(s => s.id !== shopToDelete.id) || [];
      
      let nextActiveShopId = currentUser.shopId;
      let nextActiveShopName = currentUser.shopName;
      let nextActiveShopSlug = currentUser.shopSlug;
      
      // If we deleted the active shop, fallback to the first available shop
      if (currentUser.shopId === shopToDelete.id && newShops.length > 0) {
        nextActiveShopId = newShops[0].id;
        nextActiveShopName = newShops[0].name;
        nextActiveShopSlug = newShops[0].slug;
      }

      const newUser = { 
        ...currentUser, 
        myShops: newShops,
        shopId: nextActiveShopId,
        shopName: nextActiveShopName,
        shopSlug: nextActiveShopSlug
      };
      
      localStorage.setItem("stockhub_session", JSON.stringify(newUser));
      window.location.reload();
    } else {
      alert(res.error || "Erreur lors de la suppression");
    }
  };

  // Automatically close mobile menu when navigating to a new page
  useEffect(() => {
    setMobileMenuOpen(false);
    setShopMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className={`flex flex-col md:flex-row items-center justify-between border-b bg-white px-4 py-3 shrink-0 gap-3 ${isDashboardHome ? "md:h-20 md:px-8 md:py-0 md:gap-0" : "md:hidden"}`}>
        
        {/* Top Row for Mobile / Left Section for Desktop */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              className="md:hidden text-slate-500 hover:bg-slate-100 p-2 rounded-lg transition-all duration-200 active:scale-95"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            {/* Mobile Logo */}
            <Link href="/dashboard" className="md:hidden flex items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="StockHub" 
                width={120} 
                height={40} 
                className="object-contain h-8 w-auto hover:opacity-80 transition-opacity" 
                priority
              />
            </Link>

            {/* Desktop Greeting & Shop Selector (Only on Dashboard Home) */}
            {isDashboardHome && currentUser && (
              <div className="hidden md:flex flex-col relative">
                <h2 className="text-xl font-bold text-slate-900">Bonjour, {currentUser.name.split(' ')[0]}</h2>
                <div className="relative mt-1">
                  <button 
                    onClick={() => setShopMenuOpen(!shopMenuOpen)}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
                  >
                    <Store size={14} className="text-[#0b213f]" />
                    {currentUser.shopName}
                    <ChevronDown size={14} />
                  </button>
                  
                  {/* Shop Dropdown */}
                  {shopMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden z-50">
                      <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b">
                        Vos Boutiques
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {currentUser.myShops?.map((shop, index) => (
                          <div key={shop.id} className="relative group flex items-center border-b border-slate-50 last:border-0">
                            <button
                              className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors flex flex-col ${shop.id === currentUser.shopId ? "bg-blue-50/50 border-l-4 border-[#0b213f]" : "pl-[20px]"}`}
                              onClick={() => {
                                const newUser = { ...currentUser, shopId: shop.id, shopName: shop.name, shopSlug: shop.slug };
                                localStorage.setItem("stockhub_session", JSON.stringify(newUser));
                                window.location.reload();
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">{shop.name}</span>
                                {index === 0 && (
                                  <span className="text-[10px] font-bold text-white bg-emerald-500 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                    Principale
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500">/{shop.slug}</span>
                            </button>
                            
                            {/* Actions (Delete only if not index 0) */}
                            {index > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShopToDelete({ id: shop.id, name: shop.name });
                                }}
                                className="absolute right-3 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                title="Supprimer la boutique"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {currentUser.role === 'owner' && (
                        <div className="p-2 border-t bg-slate-50">
                          <Link href="/onboarding?action=new-shop">
                            <Button variant="outline" className="w-full h-8 text-xs font-semibold flex items-center justify-center gap-1.5 border-dashed border-slate-300 hover:border-slate-400 hover:bg-white text-slate-700">
                              <Plus size={14} /> Nouvelle Boutique
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile Right Actions */}
          <div className="flex md:hidden items-center gap-2">
            {isDashboardHome && (
              <Link href="/dashboard/ventes/nouvelle">
                <Button className="bg-[#0b213f] hover:bg-[#18355c] text-white flex items-center gap-2 rounded-lg px-2 py-1 h-9 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95">
                  <Plus size={16} />
                  <span className="text-xs font-semibold">Vente</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Bottom Row for Mobile / Right Section for Desktop */}
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
          {isDashboardHome && (
            <div className="relative flex items-center w-full md:w-auto">
              <Search className="absolute left-3 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher un produit..." 
                className="pl-9 pr-4 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-full md:w-64 md:focus:w-80 transition-all duration-300"
              />
            </div>
          )}
          
          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isDashboardHome && (
              <Link href="/dashboard/ventes/nouvelle">
                <Button className="bg-[#0b213f] hover:bg-[#18355c] text-white flex items-center gap-2 rounded-lg px-4 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95">
                  <Plus size={18} />
                  <span>Nouvelle vente</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Menu Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="relative w-64 h-full bg-[#0b213f] shadow-2xl animate-in slide-in-from-left duration-300">
            <Sidebar />
            <button 
              className="absolute top-6 right-4 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full p-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!shopToDelete}
        onClose={() => setShopToDelete(null)}
        onConfirm={handleDeleteShop}
        title="Supprimer la boutique"
        message={`Êtes-vous sûr de vouloir supprimer définitivement la boutique "${shopToDelete?.name}" ? Tous les produits, ventes et clients associés seront perdus.`}
        confirmText={isDeleting ? "Suppression..." : "Oui, supprimer"}
      />
    </>
  );
}
