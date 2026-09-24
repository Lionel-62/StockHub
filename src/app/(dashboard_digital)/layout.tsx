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
        <div className="flex flex-1 flex-col overflow-hidden bg-[#fafafc]">
          <DigitalTopbar />
          <main className="flex-1 overflow-y-auto">
            {children}
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
