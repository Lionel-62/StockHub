"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth";
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
  Hexagon,
  Receipt,
  LifeBuoy,
  CalendarClock,
  MessageSquare,
  LogOut,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
  { name: "Équipe", href: "/dashboard/equipe", icon: UserPlus }, // New Team menu
  { name: "Aide et support", href: "/dashboard/aide", icon: LifeBuoy },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, isLoaded } = useAuth();
  
  if (!isLoaded || !currentUser) return null;

  // Filter menus based on role
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

  return (
    <div className="flex h-full w-64 flex-col bg-[#0b213f] text-slate-300">
      <div className="flex h-24 items-center px-6 border-b border-white/10">
        <Link href="/dashboard" className="bg-white rounded-lg p-2 w-full flex items-center justify-center hover:opacity-90 transition-opacity">
          <Image 
            src="/logo.png" 
            alt="StockHub" 
            width={150} 
            height={50} 
            className="object-contain h-12 w-auto" 
            priority
          />
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        <div className="text-xs font-semibold text-slate-500 mb-3 px-2 tracking-wider">
          MENU PRINCIPAL
        </div>
        <nav className="flex flex-col gap-1 mb-8">
          {filteredMainMenu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#18355c] text-white"
                    : "hover:bg-[#18355c]/50 hover:text-white"
                )}
              >
                <item.icon size={18} className={cn(isActive ? "text-white" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="text-xs font-semibold text-slate-500 mb-3 px-2 tracking-wider">
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#18355c] text-white"
                    : "hover:bg-[#18355c]/50 hover:text-white"
                )}
              >
                <item.icon size={18} className={cn(isActive ? "text-white" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 mt-auto border-t border-white/10">
        <div className="flex items-center gap-3 bg-[#18355c]/50 p-3 rounded-xl">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="text-sm font-semibold text-white truncate">{currentUser.name}</span>
            <span className="text-xs text-slate-400 truncate">
              {currentUser.role === "owner" ? "Propriétaire" : "Employé"}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Se déconnecter"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
