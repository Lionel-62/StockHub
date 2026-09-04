"use client";

import { Menu, Search, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Topbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isDashboardHome = pathname === "/dashboard";

  // Automatically close mobile menu when navigating to a new page
  useEffect(() => {
    setMobileMenuOpen(false);
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

            {/* Desktop Greeting (Only on Dashboard Home) */}
            {isDashboardHome && (
              <div className="hidden md:flex flex-col">
                <h2 className="text-xl font-bold text-slate-900">Bonjour, Lionel</h2>
                <p className="text-sm text-slate-500">Jeudi 27 août 2026 — Voici l'activité de votre boutique</p>
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
    </>
  );
}
