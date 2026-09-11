import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { AIAssistantButton } from "@/components/dashboard/ai-assistant-button";
import { AuthGuard } from "@/components/dashboard/auth-guard";
import { AutoClearZero } from "@/components/dashboard/auto-clear-zero";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-slate-50 print:h-auto print:overflow-visible print:block print:bg-white">
        <div className="hidden md:block print:hidden">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden print:block print:overflow-visible">
          <div className="print:hidden">
            <Topbar />
          </div>
          <main className="flex-1 overflow-y-auto p-0 md:p-8 print:overflow-visible print:block print:p-0">
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
