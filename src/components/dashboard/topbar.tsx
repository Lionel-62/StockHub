"use client";

import { Menu, Search, Plus, X, ChevronDown, Store, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/auth";
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

  const userShops = (currentUser?.myShops && currentUser.myShops.length > 0)
    ? currentUser.myShops
    : currentUser?.shopId
      ? [{ id: currentUser.shopId, name: currentUser.shopName || "Ma Boutique", slug: currentUser.shopSlug || "" }]
      : [];

  const handleSwitchShop = (shop: { id: string; name: string; slug: string }) => {
    if (shop.id === currentUser?.shopId) {
      setShopMenuOpen(false);
      return;
    }
    const newUser = {
      ...currentUser,
      shopId: shop.id,
      shopName: shop.name,
      shopSlug: shop.slug
    };
    localStorage.setItem("stockhub_session", JSON.stringify(newUser));
    setShopMenuOpen(false);
    window.location.reload();
  };

  const handleDeleteShop = async () => {
    if (!shopToDelete || !currentUser) return;
    setIsDeleting(true);
    const res = await deleteShopAction(shopToDelete.id);
    setIsDeleting(false);
    
    if (res.success) {
      const newShops = currentUser.myShops?.filter(s => s.id !== shopToDelete.id) || [];
      
      let nextActiveShopId = currentUser.shopId;
      let nextActiveShopName = currentUser.shopName;
      let nextActiveShopSlug = currentUser.shopSlug;
      
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
      setShopToDelete(null);
      window.location.reload();
    } else {
      alert(res.error || "Erreur lors de la suppression");
    }
  };

  // Close menus when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
    setShopMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className={`flex flex-col md:flex-row items-center justify-between border-b bg-white px-3 py-2.5 sm:px-4 sm:py-3 shrink-0 gap-2.5 ${isDashboardHome ? "md:h-20 md:px-8 md:py-0 md:gap-0" : "md:hidden"}`}>
        
        {/* Top Row (Mobile) / Left Section (Desktop) */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger Button */}
            <button 
              type="button"
              className="md:hidden text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-all duration-200 active:scale-95 border border-slate-200 shrink-0"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>
            
            {/* Mobile Logo */}
            <Link href="/dashboard" className="md:hidden flex items-center shrink-0">
              <Image 
                src="/logo.png" 
                alt="StockHub" 
                width={100} 
                height={32} 
                className="object-contain h-7 w-auto" 
                priority
              />
            </Link>



            {/* Desktop Greeting (Only on Dashboard Home) */}
            {isDashboardHome && currentUser && (
              <div className="hidden md:flex flex-col relative">
                <h2 className="text-xl font-bold text-slate-900">Bonjour, {currentUser.name.split(' ')[0]}</h2>
              </div>
            )}
          </div>
          
          {/* Mobile Right Actions */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            {isDashboardHome && (
              <Link href="/dashboard/ventes/nouvelle">
                <Button className="bg-[#0b213f] hover:bg-[#18355c] text-white flex items-center gap-1.5 rounded-xl px-2.5 py-1 h-8 shadow-xs transition-all active:scale-95">
                  <Plus size={15} />
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
                className="pl-9 pr-4 py-1.5 sm:py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-full md:w-64 md:focus:w-80 transition-all duration-300"
              />
            </div>
          )}
          
          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isDashboardHome && (
              <Link href="/dashboard/ventes/nouvelle">
                <Button className="bg-[#0b213f] hover:bg-[#18355c] text-white flex items-center gap-2 rounded-xl px-4 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95">
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
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar Drawer */}
          <div className="relative w-72 max-w-[85vw] h-full bg-[#0b213f] shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar />
            <button 
              type="button"
              className="absolute top-5 right-3 text-white/60 hover:text-white transition-colors bg-white/10 rounded-full p-1.5"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Fermer le menu"
            >
              <X size={18} />
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
