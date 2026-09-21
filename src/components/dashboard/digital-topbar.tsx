"use client";

import { useAuth } from "@/hooks/auth";
import { Search, ArrowLeft, ExternalLink, Copy, Box, Bell, LayoutGrid, Plus, Store } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DigitalTopbar() {
  const { currentUser } = useAuth();
  const shopUrl = `https://stockhub.com/b/${currentUser?.shopSlug || ''}`;

  return (
    <div className="h-[72px] bg-white px-6 flex items-center justify-between sticky top-0 z-30 font-sans">
      
      {/* Left part */}
      <div className="flex items-center gap-4 w-1/4">
        <button className="flex items-center gap-2 text-[#555] hover:text-[#111] transition-colors font-medium text-[14px]">
          <ArrowLeft size={16} strokeWidth={2} />
          Aperçu
        </button>
      </div>

      {/* Center part (Search) */}
      <div className="flex-1 flex justify-center max-w-xl hidden md:flex">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={16} className="text-[#888]" strokeWidth={2} />
          </div>
          <input 
            type="text" 
            placeholder="Trouvez n'importe quoi : Appuyez sur ⌘K sur votre clavier" 
            className="block w-full pl-10 pr-3 py-2 border-0 bg-[#F6F6F6] hover:bg-[#F0F0F0] text-[#111] rounded-full leading-5 placeholder-[#888] focus:outline-none focus:ring-1 focus:ring-slate-300 sm:text-[13px] font-medium transition-all"
          />
        </div>
      </div>

      {/* Right part */}
      <div className="flex items-center justify-end gap-2.5 w-1/4">
        <Link href={`/b/${currentUser?.shopSlug}`} target="_blank" className="mr-2">
          <Button variant="outline" className="hidden md:flex items-center gap-2 rounded-full border-slate-200 text-[#555] bg-white hover:bg-slate-50 hover:text-[#111] h-[36px] px-4 font-semibold text-[13px] shadow-sm">
            <Store size={14} strokeWidth={2} />
            Visiter ma boutique
          </Button>
        </Link>
        
        <button className="w-[36px] h-[36px] flex items-center justify-center text-[#555] bg-white hover:bg-[#F6F6F6] rounded-full border border-slate-200 shadow-sm transition-all">
          <Copy size={16} strokeWidth={2} />
        </button>

        <button className="w-[36px] h-[36px] flex items-center justify-center text-[#555] bg-white hover:bg-[#F6F6F6] rounded-full border border-slate-200 shadow-sm transition-all">
          <Bell size={16} strokeWidth={2} />
        </button>
        
        <div className="w-[36px] h-[36px] ml-1 rounded-full bg-[#111] flex items-center justify-center font-bold text-white text-[13px] overflow-hidden shadow-sm border border-transparent cursor-pointer">
          {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>

    </div>
  );
}

