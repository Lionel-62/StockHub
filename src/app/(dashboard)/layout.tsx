import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { AIAssistantButton } from "@/components/dashboard/ai-assistant-button";
import { AuthGuard } from "@/components/dashboard/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-0 md:p-8">
            {children}
          </main>
        </div>
        <AIAssistantButton />
      </div>
    </AuthGuard>
  );
}
