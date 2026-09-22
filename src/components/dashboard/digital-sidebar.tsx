"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { deleteShopAction } from "@/app/actions/shop.actions";
import {
  Home,
  ShoppingBag,
  Package,
  Users,
  DollarSign,
  BarChart2,
  Megaphone,
  Network,
  Zap,
  MoreHorizontal,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Store,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";

// Digital Menu matching Chariow screenshot
const digitalMenu = [
  { name: "Accueil", href: "/dashboard_digital", icon: Home },
  { name: "Ventes", href: "/dashboard_digital/ventes", icon: ShoppingBag },
  { name: "Produits", href: "/dashboard_digital/produits", icon: Package },
  { name: "Clients", href: "/dashboard_digital/clients", icon: Users },
  { name: "Revenus", href: "/dashboard_digital/revenus", icon: DollarSign },
  { name: "Analytiques", href: "/dashboard_digital/analytiques", icon: BarChart2 },
  { name: "Marketing", href: "/dashboard_digital/marketing", icon: Megaphone },
  { name: "Affiliation", href: "/dashboard_digital/affiliation", icon: Network },
  { name: "Automatisations", href: "/dashboard_digital/automatisations", icon: Zap },
];

const bottomMenu = [
  { name: "Plus", href: "/dashboard_digital/plus", icon: MoreHorizontal },
  { name: "Paramètres", href: "/dashboard_digital/parametres", icon: Settings },
  { name: "Centre d'aide", href: "/dashboard_digital/aide", icon: HelpCircle },
];

export function DigitalSidebar() {
  const pathname = usePathname();
  const { currentUser, logout, isLoaded } = useAuth();
  const router = useRouter();
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  
  if (!isLoaded || !currentUser) return null;
  
  const userShops = (currentUser.myShops && currentUser.myShops.length > 0)
    ? currentUser.myShops
    : currentUser.shopId
      ? [{ id: currentUser.shopId, name: currentUser.shopName || "Ma Boutique", slug: currentUser.shopSlug || "", shop_type: currentUser.shopType || "digital" }]
      : [];

  const handleSwitchShop = (shop: { id: string; name: string; slug: string; shop_type?: string; theme_color?: string; currency?: string }) => {
    if (shop.id === currentUser.shopId) {
      setShopDropdownOpen(false);
      return;
    }
    const newUser = {
      ...currentUser,
      shopId: shop.id,
      shopName: shop.name,
      shopSlug: shop.slug,
      shopType: shop.shop_type || currentUser.shopType,
      themeColor: shop.theme_color || currentUser.themeColor,
      currency: shop.currency || currentUser.currency,
    };
    localStorage.setItem("stockhub_session", JSON.stringify(newUser));
    setShopDropdownOpen(false);
    if (newUser.shopType === 'digital') {
      window.location.href = '/dashboard_digital';
    } else {
      window.location.href = '/dashboard';
    }
  };
  
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="hidden md:flex flex-col bg-[#F7F7F8] w-[260px] h-screen transition-all duration-300 font-sans border-r border-[#EAEBEB]">
      
      {/* Top Shop Dropdown (Chariow style) */}
      <div className="p-4 pt-5 pb-2 relative z-50">
        <button 
          onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
          className="w-full flex items-center justify-between bg-white border border-slate-200/60 rounded-[10px] px-3 py-2 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-[22px] h-[22px] bg-[#111] rounded-[6px] flex items-center justify-center shrink-0">
              <Store size={12} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-[13px] text-[#222] truncate">
              {currentUser?.shopName || "Dova chop"}
            </span>
          </div>
          <ChevronDown size={14} className={cn("text-[#888] shrink-0 transition-transform duration-200", shopDropdownOpen && "rotate-180")} strokeWidth={2.5} />
        </button>

        {/* Dropdown Menu */}
        {shopDropdownOpen && (
          <div className="absolute top-full left-4 right-4 mt-1 bg-white border border-slate-200 rounded-[10px] shadow-lg overflow-hidden flex flex-col gap-1 p-1 z-50">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Vos boutiques</span>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-500">
                {userShops.length}
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto flex flex-col gap-1 scrollbar-thin">
              {userShops.map((shop) => {
                const isCurrent = shop.id === currentUser.shopId;
                return (
                  <button
                    key={shop.id}
                    onClick={() => handleSwitchShop(shop)}
                    className={cn(
                      "flex items-center justify-between rounded-lg p-1.5 transition-colors text-left",
                      isCurrent ? "bg-slate-50" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center shrink-0 border",
                        isCurrent ? "bg-white border-slate-200" : "bg-white border-slate-100"
                      )}>
                        <Store size={12} className={isCurrent ? "text-[#111]" : "text-slate-400"} />
                      </div>
                      <div className="flex flex-col min-w-0 overflow-hidden">
                        <span className={cn(
                          "text-[12px] truncate",
                          isCurrent ? "font-bold text-[#111]" : "font-medium text-slate-600"
                        )}>
                          {shop.name}
                        </span>
                        {shop.shop_type && (
                          <span className="text-[9px] text-slate-400 capitalize">
                            {shop.shop_type}
                          </span>
                        )}
                      </div>
                    </div>
                    {isCurrent && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shrink-0"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Switcher d'Espace (pour Mixte/Libre ou si l'utilisateur a les deux types de boutiques) */}
      {(currentUser.shopType === 'libre' || (currentUser.myShops && currentUser.myShops.some(s => s.shop_type === 'digital') && currentUser.myShops.some(s => s.shop_type === 'physique'))) && (
        <div className="px-4 mt-1 mb-2 shrink-0">
          <div className="flex bg-[#EAEBEB] p-1 rounded-lg border border-slate-200/50">
            <Link 
              href="/dashboard"
              className="flex-1 text-center text-[11.5px] font-bold py-1.5 rounded-md transition-colors text-[#555] hover:text-[#111] hover:bg-black/5"
            >
              Physique
            </Link>
            <Link 
              href="/dashboard_digital"
              className="flex-1 text-center text-[11.5px] font-bold py-1.5 rounded-md transition-colors bg-white text-[#111] shadow-sm border border-slate-200/50"
            >
              Digital
            </Link>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-0.5 mt-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {digitalMenu.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-[10px] transition-all group",
                isActive 
                  ? "bg-[#EAEBEB] text-[#111]" 
                  : "text-[#555] hover:bg-black/5 hover:text-[#111]"
              )}
            >
              <item.icon size={16} strokeWidth={isActive ? 2 : 2} className={cn(isActive ? "text-[#D3A000]" : "text-[#777] group-hover:text-[#555]")} />
              <span className={cn("text-[13.5px]", isActive ? "font-semibold" : "font-medium")}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 space-y-0.5 mb-2">
        {bottomMenu.map((item) => {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-[10px] transition-all text-[#555] hover:bg-black/5 hover:text-[#111] group"
            >
              <item.icon size={16} strokeWidth={2} className="text-[#777] group-hover:text-[#555]" />
              <span className="text-[13.5px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Footer Area */}
      <div className="px-5 py-4 border-t border-[#EAEBEB] bg-[#F7F7F8]">
        <div className="flex items-center justify-between">
           <div className="flex flex-col min-w-0 flex-1">
             <span className="text-[10px] font-semibold text-[#888] uppercase tracking-wider">Connecté en tant que</span>
             <span className="text-[12px] font-medium text-[#222] truncate">{currentUser.name}</span>
           </div>
           <button onClick={handleLogout} className="p-1.5 hover:bg-black/5 rounded-lg text-[#777] hover:text-[#222] transition-colors" title="Déconnexion">
             <LogOut size={16} strokeWidth={2} />
           </button>
        </div>
      </div>
    </div>
  );
}
