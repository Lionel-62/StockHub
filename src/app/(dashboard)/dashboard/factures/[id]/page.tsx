"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Edit, Trash2, Printer, Send, CreditCard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInvoices } from "@/hooks/invoices";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { invoices, isLoaded, updateInvoiceStatus, deleteInvoice } = useInvoices();

  if (!isLoaded) {
    return (
      <div className="p-3 md:p-0 max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 h-16 flex items-center">
          <Skeleton className="h-8 w-1/3" />
        </div>
        <div className="bg-white p-8 md:p-12 rounded-sm border border-slate-200 h-[600px]">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  const invoice = invoices.find(inv => inv.id === id);

  if (!invoice) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Facture introuvable</h2>
        <p className="text-slate-500 mb-4">L'identifiant de la facture est incorrect.</p>
        <Button onClick={() => router.push("/dashboard/factures")}>Retour aux factures</Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  return (
    <div className="p-3 md:p-0 max-w-5xl mx-auto space-y-6">
      
      {/* Barre d'actions */}
      <div className="print:hidden flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100" onClick={() => router.push("/dashboard/factures")}>
            <ChevronLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{invoice.invoiceNumber}</h1>
              <div className="relative inline-flex items-center">
                <select 
                  value={invoice.status}
                  onChange={(e) => updateInvoiceStatus(invoice.id, e.target.value as any)}
                  className={cn("text-xs font-medium rounded-full px-2.5 py-0.5 border cursor-pointer outline-none appearance-none pr-7 transition-colors", 
                    invoice.status === "Payée" ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : 
                    invoice.status === "En attente" ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" : 
                    invoice.status === "Envoyée" ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" : 
                    invoice.status === "Brouillon" ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200" :
                    "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  )}
                >
                  <option value="Brouillon">Brouillon</option>
                  <option value="En attente">En attente</option>
                  <option value="Envoyée">Envoyée</option>
                  <option value="Non payée">Non payée</option>
                  <option value="Payée">Payée</option>
                  <option value="En retard">En retard</option>
                </select>
                <ChevronDown className={cn("absolute right-2 h-3 w-3 pointer-events-none",
                  invoice.status === "Payée" ? "text-green-700" : 
                  invoice.status === "En attente" ? "text-amber-700" : 
                  invoice.status === "Envoyée" ? "text-blue-700" : 
                  invoice.status === "Brouillon" ? "text-slate-700" :
                  "text-red-700"
                )} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            className="text-slate-600 bg-white border-slate-200 hover:bg-slate-50"
            onClick={() => router.push("/dashboard/factures/nouvelle?edit=" + invoice.id)}
          >
            <Edit size={16} className="mr-2" />
            Modifier
          </Button>
          <Button 
            variant="outline" 
            className="text-blue-600 bg-white border-slate-200 hover:bg-blue-50 hover:border-blue-200"
            onClick={() => window.print()}
          >
            <Printer size={16} className="mr-2" />
            Enregistrer en PDF
          </Button>
          <Button 
            variant="outline" 
            className="text-[#25D366] bg-white border-slate-200 hover:bg-[#25D366]/10 hover:border-[#25D366]/30"
            onClick={() => {
              const text = encodeURIComponent(`Bonjour ${invoice.clientName},\n\nVoici le résumé de votre facture ${invoice.invoiceNumber}.\n\n*Montant Total : ${formatCurrency(invoice.total)}*\n\nMerci de votre confiance !\n- StockHub`);
              window.open(`https://wa.me/?text=${text}`, "_blank");
            }}
          >
            <Send size={16} className="mr-2" />
            Envoyer via WhatsApp
          </Button>
          <Button 
            variant="outline" 
            className="text-red-600 bg-white border-slate-200 hover:bg-red-50 hover:border-red-200 ml-2"
            onClick={async () => {
              if (confirm("Voulez-vous vraiment supprimer cette facture ?")) {
                await deleteInvoice(invoice.id);
                router.push("/dashboard/factures");
              }
            }}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Affichage de la Facture (Même style que la prévisualisation) */}
      <div className="bg-white w-full rounded-sm shadow-md p-8 md:p-12 text-slate-800 flex flex-col relative border border-slate-200 print:shadow-none print:border-none print:m-0 print:p-0">
        
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-light text-slate-900 tracking-tight">FACTURE</h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <div className="h-12 w-12 bg-[#0b213f] text-white rounded-lg flex items-center justify-center font-bold text-xl ml-auto">
              SH
            </div>
            <h3 className="font-bold text-slate-900 mt-2">StockHub Inc.</h3>
            <p className="text-xs text-slate-500">123 Avenue de la Paix</p>
            <p className="text-xs text-slate-500">Cotonou, Bénin</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Facturé à</p>
            <h3 className="font-bold text-slate-900">{invoice.clientName}</h3>
            <p className="text-sm text-slate-500">{invoice.clientEmail}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date d'émission</p>
              <p className="text-sm font-medium text-slate-900">{new Date(invoice.issueDate).toLocaleDateString("fr-FR")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Échéance</p>
              <p className="text-sm font-medium text-slate-900">{new Date(invoice.dueDate).toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
        </div>

        <div className="mb-8 flex-1 min-h-[300px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left font-semibold text-slate-500 py-3">Description</th>
                <th className="text-center font-semibold text-slate-500 py-3 w-16">Qté</th>
                <th className="text-right font-semibold text-slate-500 py-3 w-28">Prix U.</th>
                <th className="text-right font-semibold text-slate-500 py-3 w-32">Montant</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((line, idx) => (
                <tr key={idx} className="border-b border-slate-100 last:border-0">
                  <td className="py-4 text-slate-800 font-medium">{line.description}</td>
                  <td className="py-4 text-center text-slate-600">{line.quantity}</td>
                  <td className="py-4 text-right text-slate-600"><span className="font-mono">{formatCurrency(line.unitPrice)}</span></td>
                  <td className="py-4 text-right font-semibold text-slate-900"><span className="font-mono">{formatCurrency(line.total)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-12">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Sous-total</span>
              <span className="text-slate-900 font-semibold"><span className="font-mono">{formatCurrency(invoice.subtotal)}</span></span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">TVA (18%)</span>
              <span className="text-slate-900 font-semibold"><span className="font-mono">{formatCurrency(invoice.taxAmount)}</span></span>
            </div>
            <div className="flex justify-between text-lg pt-3 border-t border-slate-200">
              <span className="font-bold text-slate-900">Total TTC</span>
              <span className="font-bold text-slate-900"><span className="font-mono">{formatCurrency(invoice.total)}</span></span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
