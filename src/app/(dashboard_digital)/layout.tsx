"use client";

import { Topbar } from "@/components/dashboard/topbar";
import { AIAssistantButton } from "@/components/dashboard/ai-assistant-button";
import { AuthGuard } from "@/components/dashboard/auth-guard";
import { AutoClearZero } from "@/components/dashboard/auto-clear-zero";
import { ThemeInjector } from "@/components/dashboard/theme-injector";
import { DigitalSidebar } from "@/components/dashboard/digital-sidebar";
import { DigitalTopbar } from "@/components/dashboard/digital-topbar";
import { useAuth } from "@/hooks/auth";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <ThemeInjector />
      <div className="flex h-dvh overflow-hidden bg-white transition-colors duration-200 font-sans">
        <DigitalSidebar />
        <div className="flex flex-1 flex-col overflow-hidden bg-white">
          <DigitalTopbar />
          <main className="flex-1 overflow-y-auto px-4 md:px-8 py-10 bg-white flex flex-col items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-[#F7F7F8] border border-[#EAEBEB] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-4xl">🚧</span>
              </div>
              <h1 className="text-2xl font-bold text-[#111] mb-3">Espace Digital en construction</h1>
              <p className="text-[#555] mb-8 text-[14px]">
                Le tableau de bord de la boutique en ligne est actuellement en cours de développement. Les fonctionnalités seront bientôt disponibles.
              </p>
            </div>
          </main>
        </div>
        <div className="print:hidden">
          <AIAssistantButton />
          <AutoClearZero />
        </div>
      </div>
    </AuthGuard>
  );
}
