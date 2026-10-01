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
  MoreHorizontal,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Store,
  Plus,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ConfirmModal } from "@/components/ui/confirm-modal";

const digitalMenu = [
  { name: "Accueil", href: "/dashboard_digital", icon: Home },
  { name: "Ventes", href: "/dashboard_digital/ventes", icon: ShoppingBag },
  { name: "Produits", href: "/dashboard_digital/produits", icon: Package },
  { name: "Clients", href: "/dashboard_digital/clients", icon: Users },
  { name: "Revenus", href: "/dashboard_digital/revenus", icon: DollarSign },
  { name: "Analytiques", href: "/dashboard_digital/analytiques", icon: BarChart2 },
  { name: "Marketing", href: "/dashboard_digital/marketing", icon: Megaphone },
  { name: "Affiliation", href: "/dashboard_digital/affiliation", icon: Network },
];

const bottomMenu = [
  { name: "Plus", href: "/dashboard_digital/plus", icon: MoreHorizontal },
  { name: "Paramètres", href: "/dashboard_digital/parametres", icon: Settings },
  { name: "Centre d'aide", href: "/dashboard_digital/aide", icon: HelpCircle },
];

export function DigitalSidebar({ forceShowMobile = false }: { forceShowMobile?: boolean }) {
  const pathname = usePathname();
  const { currentUser, logout, isLoaded } = useAuth();
  const router = useRouter();
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  
  if (!isLoaded || !currentUser) return null;
  
  const userShops = (currentUser.myShops && currentUser.myShops.length > 0)
    ? currentUser.myShops.filter((s: any) => s.shop_type === 'digital')
    : currentUser.shopId
      ? [{ id: currentUser.shopId, name: currentUser.shopName || "Ma Boutique", slug: currentUser.shopSlug || "", shop_type: currentUser.shopType || "digital" }]
      : [];

  const handleSwitchEnvironment = (env: 'physique' | 'digital') => {
    if (env === 'digital') {
      const firstDigital = currentUser.myShops?.find((s: any) => s.shop_type === 'digital');
      if (firstDigital && firstDigital.id !== currentUser.shopId) {
        const newUser = {
          ...currentUser,
          shopId: firstDigital.id,
          shopName: firstDigital.name,
          shopSlug: firstDigital.slug,
          shopType: 'digital',
          themeColor: firstDigital.theme_color || currentUser.themeColor,
          currency: firstDigital.currency || currentUser.currency,
        };
        localStorage.setItem("stockhub_session", JSON.stringify(newUser));
      }
      window.location.href = '/dashboard_digital';
    } else {
      const firstPhysique = currentUser.myShops?.find((s: any) => s.shop_type !== 'digital');
      if (firstPhysique && firstPhysique.id !== currentUser.shopId) {
        const newUser = {
          ...currentUser,
          shopId: firstPhysique.id,
          shopName: firstPhysique.name,
          shopSlug: firstPhysique.slug,
          shopType: firstPhysique.shop_type || 'physique',
          themeColor: firstPhysique.theme_color || currentUser.themeColor,
          currency: firstPhysique.currency || currentUser.currency,
        };
        localStorage.setItem("stockhub_session", JSON.stringify(newUser));
      }
      window.location.href = '/dashboard';
    }
  };

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

  const isItemActive = (href: string) => {
    if (href === "/dashboard_digital") {
      return pathname === "/dashboard_digital";
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className={cn(
      "h-full w-64 flex-col bg-[#0b213f] text-slate-300 transition-all duration-300 font-sans",
      forceShowMobile ? "flex w-full" : "hidden md:flex"
    )}>
      {/* Logo */}
      <div className="flex h-20 items-center px-5 border-b border-white/10 shrink-0">
        <Link href="/dashboard_digital" className="bg-white/5 hover:bg-white/10 rounded-lg p-2 w-full flex items-center justify-center transition-all">
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
        
        {/* Switcher d'Espace (Visible uniquement pour l'admin) */}
        {currentUser?.identifier === 'lionnelgodjo@gmail.com' && (currentUser.shopType === 'libre' || (currentUser.myShops && currentUser.myShops.some(s => s.shop_type === 'digital') && currentUser.myShops.some(s => s.shop_type === 'physique'))) && (
          <div className="flex bg-black/20 p-1 rounded-lg mb-3">
            <button 
              onClick={() => handleSwitchEnvironment('physique')}
              className={cn(
                "flex-1 text-center text-[11px] font-bold py-1.5 rounded-md transition-colors",
                !pathname.includes("dashboard_digital") ? "bg-[#0d8f76] text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              Physique
            </button>
            <button 
              onClick={() => handleSwitchEnvironment('digital')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 text-center text-[11px] font-bold py-1.5 rounded-md transition-colors",
                pathname.includes("dashboard_digital") ? "bg-[#0d8f76] text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              Digital
            </button>
          </div>
        )}

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
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d2647] border border-white/15 rounded-xl shadow-2xl overflow-hidden p-1.5 flex flex-col gap-1 z-50">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Vos boutiques</span>
                <span className="text-[10px] bg-white dark:bg-[#0a192f]/10 px-1.5 py-0.2 rounded font-mono text-slate-300">
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
                        isCurrent ? "bg-blue-600/30 border border-blue-500/30" : "hover:bg-white/5"
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
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate">
                            /{shop.slug}
                          </span>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {currentUser?.role === 'owner' && (
                <div className="p-1.5 pt-1 mt-1 border-t border-white/10">
                  <Link
                    href="/onboarding?action=new-shop&type=digital"
                    onClick={() => setShopDropdownOpen(false)}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 hover:text-white text-xs font-semibold transition-colors border border-blue-500/30"
                  >
                    <Plus size={13} />
                    Nouvelle boutique
                  </Link>
                </div>
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
          {digitalMenu.map((item) => {
            const isActive = isItemActive(item.href);
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

        <div className="text-[11px] font-bold text-slate-400 mb-2.5 px-2 tracking-wider">
          AUTRES
        </div>
        <nav className="flex flex-col gap-1">
          {bottomMenu.map((item) => {
            const isActive = isItemActive(item.href);
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

    </div>
  );
}
