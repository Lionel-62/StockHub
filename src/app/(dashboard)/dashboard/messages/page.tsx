"use client";

import { MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MessagesPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center relative">
          <MessageSquare className="h-10 w-10 text-[#0b213f]" />
          <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Sparkles size={10} /> Prochainement
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Module Messages en préparation</h1>
          <p className="text-slate-500 leading-relaxed text-sm">
            Cette fonctionnalité est actuellement en cours de développement. Dans peu de temps, vous pourrez discuter directement avec vos clients depuis StockHub !
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <p className="text-sm font-medium text-slate-700 mb-4">
            En attendant, profitez pleinement des autres fonctionnalités :
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/boutique">
              <Button className="w-full bg-[#0b213f] hover:bg-[#18355c] text-white">
                Gérer ma Boutique en Ligne
              </Button>
            </Link>
            <Link href="/dashboard/ventes">
              <Button variant="outline" className="w-full">
                Voir mes Ventes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
