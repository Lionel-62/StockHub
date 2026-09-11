"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { useProducts } from "@/hooks/products";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Truck,
  Store,
  BarChart2,
  Settings,
  Receipt,
  LifeBuoy,
  MessageSquare,
  LogOut,
  UserPlus,
  ChevronDown,
  Plus,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { deleteShopAction } from "@/app/actions/shop.actions";

const mainMenu = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Produits", href: "/dashboard/produits", icon: Package },
  { name: "Stock", href: "/dashboard/stock", icon: Boxes },
  { name: "Ventes & commandes", href: "/dashboard/ventes", icon: ShoppingCart },
  { name: "Factures", href: "/dashboard/factures", icon: Receipt },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Fournisseurs", href: "/dashboard/fournisseurs", icon: Truck },
  { name: "Boutique en ligne", href: "/dashboard/boutique", icon: Store },
];

const otherMenu = [
  { name: "Rapports", href: "/dashboard/rapports", icon: BarChart2 },
  { name: "Paramètres", href: "/dashboard/parametres", icon: Settings },
  { name: "Équipe", href: "/dashboard/equipe", icon: UserPlus },
  { name: "Aide et support", href: "/dashboard/aide", icon: LifeBuoy },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, isLoaded } = useAuth();
  const { products } = useProducts();
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  if (!isLoaded || !currentUser) return null;

  const alertsCount = products.filter(p => p.stock <= (p.alertThreshold ?? 5)).length;

  const isEmployee = currentUser.role === "employee";
  
  const filteredMainMenu = mainMenu.filter(item => {
    if (isEmployee) {
      if (item.name === "Tableau de bord" && !currentUser.permissions.canViewDashboard) return false;
      const allowedForEmployee = ["Ventes & commandes", "Factures", "Stock", "Clients", "Produits", "Tableau de bord"];
      return allowedForEmployee.includes(item.name);
    }
    return true;
  });

  const filteredOtherMenu = otherMenu.filter(item => {
    if (isEmployee) {
      return item.name === "Aide et support";
    }
    return true;
  });

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const userShops = (currentUser.myShops && currentUser.myShops.length > 0)
    ? currentUser.myShops
    : currentUser.shopId
      ? [{ id: currentUser.shopId, name: currentUser.shopName || "Ma Boutique", slug: currentUser.shopSlug || "" }]
      : [];

  const handleSwitchShop = (shop: { id: string; name: string; slug: string }) => {
    if (shop.id === currentUser.shopId) {
      setShopDropdownOpen(false);
      return;
    }
    const newUser = {
      ...currentUser,
      shopId: shop.id,
      shopName: shop.name,
      shopSlug: shop.slug
    };
    localStorage.setItem("stockhub_session", JSON.stringify(newUser));
    setShopDropdownOpen(false);
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

  return (
    <div className="flex h-full w-64 flex-col bg-[#0b213f] text-slate-300">
      {/* Logo */}
      <div className="flex h-20 items-center px-5 border-b border-white/10 shrink-0">
        <Link href="/dashboard" className="bg-white rounded-lg p-2 w-full flex items-center justify-center hover:opacity-90 transition-opacity">
          <Image 
            src="/logo.png" 
            alt="StockHub" 
            width={140} 
            height={44} 
            className="object-contain h-10 w-auto" 
            priority
          />
        </Link>
      </div>

      {/* Sélecteur de Boutique (Visible sur desktop et mobile) */}
      <div className="px-4 py-3 border-b border-white/10 bg-[#07172c] shrink-0">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <Store size={16} />
              </div>
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-xs font-bold text-white truncate group-hover:text-blue-200 transition-colors">
                  {currentUser.shopName || "Ma Boutique"}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  /{currentUser.shopSlug || "boutique"}
                </span>
              </div>
            </div>
            <ChevronDown 
              size={15} 
              className={cn("text-slate-400 transition-transform duration-200 shrink-0 ml-1", shopDropdownOpen && "rotate-180")} 
            />
          </button>

          {/* Dropdown / Accordion des boutiques */}
          {shopDropdownOpen && (
            <div className="mt-2 bg-[#0d2647] border border-white/15 rounded-xl shadow-2xl overflow-hidden p-1.5 flex flex-col gap-1">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Vos boutiques</span>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded font-mono text-slate-300">
                  {userShops.length}
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-0.5 scrollbar-thin">
                {userShops.map((shop, idx) => {
                  const isCurrent = shop.id === currentUser.shopId;
                  return (
                    <div 
                      key={shop.id} 
                      className={cn(
                        "flex items-center justify-between rounded-lg p-1.5 transition-colors group",
                        isCurrent ? "bg-blue-600/30 border border-blue-500/30" : "hover:bg-white/10"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleSwitchShop(shop)}
                        className="flex-1 text-left min-w-0 flex items-center gap-2"
                      >
                        <div className={cn("w-2 h-2 rounded-full shrink-0", isCurrent ? "bg-emerald-400" : "bg-slate-500")} />
                        <div className="overflow-hidden min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={cn("text-xs truncate", isCurrent ? "text-white font-bold" : "text-slate-300")}>
                              {shop.name}
                            </span>
                            {idx === 0 && (
                              <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-semibold shrink-0">
                                Principale
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate">
                            /{shop.slug}
                          </span>
                        </div>
                      </button>

                      {idx > 0 && currentUser.role === 'owner' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShopToDelete({ id: shop.id, name: shop.name });
                          }}
                          className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-70 group-hover:opacity-100 shrink-0 ml-1"
                          title="Supprimer la boutique"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {currentUser.role === 'owner' && (
                <Link
                  href="/onboarding?action=new-shop"
                  onClick={() => setShopDropdownOpen(false)}
                  className="mt-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg text-xs font-semibold transition-all"
                >
                  <Plus size={13} />
                  Nouvelle boutique
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-hide">
        <div className="text-[11px] font-bold text-slate-400 mb-2.5 px-2 tracking-wider">
          MENU PRINCIPAL
        </div>
        <nav className="flex flex-col gap-1 mb-6">
          {filteredMainMenu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#18355c] text-white font-semibold"
                    : "hover:bg-[#18355c]/50 hover:text-white"
                )}
              >
                <item.icon size={17} className={cn(isActive ? "text-white" : "text-slate-400")} />
                {item.name}
                {item.name === "Stock" && alertsCount > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {alertsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="text-[11px] font-bold text-slate-400 mb-2.5 px-2 tracking-wider">
          AUTRES
        </div>
        <nav className="flex flex-col gap-1">
          {filteredOtherMenu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#18355c] text-white font-semibold"
                    : "hover:bg-[#18355c]/50 hover:text-white"
                )}
              >
                <item.icon size={17} className={cn(isActive ? "text-white" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile & Logout */}
      <div className="p-3 mt-auto border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 bg-[#18355c]/50 p-2.5 rounded-xl">
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden flex-1 min-w-0">
            <span className="text-xs font-semibold text-white truncate">{currentUser.name}</span>
            <span className="text-[10px] text-slate-400 truncate">
              {currentUser.role === "owner" ? "Propriétaire" : "Employé"}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0"
            title="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!shopToDelete}
        onClose={() => setShopToDelete(null)}
        onConfirm={handleDeleteShop}
        title="Supprimer la boutique"
        message={`Êtes-vous sûr de vouloir supprimer définitivement la boutique "${shopToDelete?.name}" ? Tous les produits, ventes et clients associés seront perdus.`}
        confirmText={isDeleting ? "Suppression..." : "Oui, supprimer"}
      />
    </div>
  );
}
