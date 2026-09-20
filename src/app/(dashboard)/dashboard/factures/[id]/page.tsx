"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Edit, Trash2, Printer, Send, CreditCard, ChevronDown, ArrowRightCircle, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInvoices } from "@/hooks/invoices";
import { useSettings } from "@/hooks/settings";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { invoices, isLoaded, updateInvoiceStatus, updateInvoice, deleteInvoice } = useInvoices();
  const { settings } = useSettings();
  const [isConverting, setIsConverting] = useState(false);

  if (!isLoaded) {
    return (
      <div className="p-3 md:p-0 max-w-5xl mx-auto space-y-6">
        <div className="bg-white dark:bg-[#0a192f] p-4 rounded-xl border border-slate-200 dark:border-[#1c3a66] h-16 flex items-center">
          <Skeleton className="h-8 w-1/3" />
        </div>
        <div className="bg-white dark:bg-[#0a192f] p-8 md:p-12 rounded-sm border border-slate-200 dark:border-[#1c3a66] h-[600px]">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  const invoice = invoices.find(inv => inv.id === id);

  if (!invoice) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Document introuvable</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">L'identifiant du document est incorrect.</p>
        <Button onClick={() => router.push("/dashboard/factures")}>Retour aux factures & devis</Button>
      </div>
    );
  }

  const isDevis = invoice.invoiceNumber.startsWith("#DEV-") || invoice.invoiceNumber.startsWith("DEV-");

  const handleConvertToInvoice = async () => {
    if (!confirm("Voulez-vous convertir ce devis en facture officielle ?")) return;
    setIsConverting(true);
    try {
      const newInvoiceNumber = invoice.invoiceNumber.replace(/^#?DEV-/, "#INV-");
      await updateInvoice({
        ...invoice,
        invoiceNumber: newInvoiceNumber,
        status: invoice.status === "Brouillon" ? "Envoyée" : invoice.status
      });
      alert(`Ce devis a été converti avec succès en Facture officielle : ${newInvoiceNumber} !`);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la conversion.");
    } finally {
      setIsConverting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  const calculateValidity = (issue: string, due: string) => {
    if (!issue || !due) return "30 jours";
    const d1 = new Date(issue);
    const d2 = new Date(due);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 80 && diffDays <= 100) return "3 mois";
    if (diffDays >= 50 && diffDays <= 70) return "2 mois";
    if (diffDays >= 25 && diffDays <= 35) return "30 jours";
    return `${diffDays} jours`;
  };

  return (
    <div className="p-3 md:p-0 max-w-5xl mx-auto space-y-6 print:block print:p-0 print:m-0 print:max-w-none print:w-full print:space-y-0">
      
      {/* Barre d'actions */}
      <div className="print:hidden flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0a192f] p-4 rounded-xl border border-slate-200 dark:border-[#1c3a66] shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-[#112240]" onClick={() => router.push("/dashboard/factures")}>
            <ChevronLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border", 
                isDevis 
                  ? "bg-amber-50 text-amber-800 border-amber-200" 
                  : "bg-blue-50 text-blue-800 border-blue-200"
              )}>
                {isDevis ? "Devis" : "Facture"}
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-mono">{invoice.invoiceNumber}</h1>
              <div className="relative inline-flex items-center">
                <select 
                  value={invoice.status}
                  onChange={(e) => updateInvoiceStatus(invoice.id, e.target.value as any)}
                  className={cn("text-xs font-medium rounded-full px-2.5 py-0.5 border cursor-pointer outline-none appearance-none pr-7 transition-colors", 
                    invoice.status === "Payée" ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : 
                    invoice.status === "En attente" ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" : 
                    invoice.status === "Envoyée" ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" : 
                    invoice.status === "Brouillon" ? "bg-slate-100 dark:bg-[#112240] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#1c3a66] hover:bg-slate-200" :
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
                  invoice.status === "Brouillon" ? "text-slate-700 dark:text-slate-200" :
                  "text-red-700"
                )} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {isDevis && (
            <Button 
              onClick={handleConvertToInvoice} 
              disabled={isConverting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-sm text-xs sm:text-sm"
            >
              <ArrowRightCircle size={16} />
              <span>{isConverting ? "Conversion..." : "Convertir en Facture"}</span>
            </Button>
          )}

          <Button 
            variant="outline" 
            className="text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0a192f] border-slate-200 dark:border-[#1c3a66] hover:bg-slate-50 dark:bg-[#06101e] text-xs sm:text-sm"
            onClick={() => router.push("/dashboard/factures/nouvelle?edit=" + invoice.id)}
          >
            <Edit size={16} className="mr-1.5" />
            Modifier
          </Button>
          <Button 
            variant="outline" 
            className="text-blue-600 bg-white dark:bg-[#0a192f] border-slate-200 dark:border-[#1c3a66] hover:bg-blue-50 hover:border-blue-200 text-xs sm:text-sm"
            onClick={() => window.print()}
          >
            <Printer size={16} className="mr-1.5" />
            Enregistrer en PDF
          </Button>
          <Button 
            variant="outline" 
            className="text-[#25D366] bg-white dark:bg-[#0a192f] border-slate-200 dark:border-[#1c3a66] hover:bg-[#25D366]/10 hover:border-[#25D366]/30 text-xs sm:text-sm"
            onClick={() => {
              const text = encodeURIComponent(`Bonjour ${invoice.clientName},\n\nVoici le résumé de votre ${isDevis ? "devis" : "facture"} ${invoice.invoiceNumber}.\n\n*Montant Total : ${formatCurrency(invoice.total)}*\n\nMerci de votre confiance !\n- StockHub`);
              window.open(`https://wa.me/?text=${text}`, "_blank");
            }}
          >
            <Send size={16} className="mr-1.5" />
            Envoyer WhatsApp
          </Button>
          <Button 
            variant="outline" 
            className="text-red-600 bg-white dark:bg-[#0a192f] border-slate-200 dark:border-[#1c3a66] hover:bg-red-50 hover:border-red-200"
            onClick={async () => {
              if (confirm("Voulez-vous vraiment supprimer ce document ?")) {
                await deleteInvoice(invoice.id);
                router.push("/dashboard/factures");
              }
            }}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Bannière spéciale Devis */}
      {isDevis && (
        <div className="print:hidden bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
              <FileCheck2 size={20} />
            </div>
            <div>
              <p className="font-semibold text-amber-900 text-sm">Proposition commerciale en cours (Devis)</p>
              <p className="text-xs text-amber-700">Le client a validé l'offre ? Vous pouvez transformer ce devis en facture officielle immédiatement.</p>
            </div>
          </div>
          <Button 
            onClick={handleConvertToInvoice} 
            disabled={isConverting}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shrink-0 flex items-center gap-1.5 w-full sm:w-auto"
          >
            <ArrowRightCircle size={15} />
            <span>Convertir en Facture</span>
          </Button>
        </div>
      )}

      {/* MODÈLE UNIFIÉ (Devis & Facture avec le design premium) */}
      <div id="invoice-preview" className="bg-[#f2f6f3] w-full rounded-2xl shadow-sm p-6 sm:p-10 md:p-14 text-slate-800 dark:text-slate-100 flex flex-col relative border border-[#d2ded5] print:shadow-none print:border-none print:m-0 print:p-8 print:bg-[#f2f6f3] print:[print-color-adjust:exact]">
        
        {/* En-tête : Titre & Coordonnées Client / Dates */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#11313d] tracking-tight uppercase">
              {isDevis ? "Devis" : "Facture"}
            </h1>
            <div className="mt-4 space-y-1 text-xs sm:text-sm">
              <p className="font-bold text-[#11313d] text-base">Pour</p>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base">{invoice.clientName}</p>
              <p className="text-slate-600 dark:text-slate-300">{invoice.clientEmail}</p>
              <p className="font-bold text-[#11313d] pt-1">
                ID client : <span className="font-mono">{invoice.clientId ? invoice.clientId.slice(0, 6) : "01234"}</span>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1 text-xs sm:text-sm flex flex-col sm:items-end">
            {settings.logo && (
              <img src={settings.logo} alt="Logo" className="h-20 w-auto object-contain mb-2" />
            )}
            <p className="font-bold text-[#11313d]">
              Date d'émission : <span className="font-normal">{new Date(invoice.issueDate).toLocaleDateString("fr-FR")}</span>
            </p>
            <p className="font-bold text-[#11313d]">
              {isDevis ? "Validité" : "Échéance"} : <span className="font-normal">
                {isDevis ? calculateValidity(invoice.issueDate, invoice.dueDate) : new Date(invoice.dueDate).toLocaleDateString("fr-FR")}
              </span>
            </p>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">Réf : {invoice.invoiceNumber}</p>
          </div>
        </div>

        {/* Tableau Moderne avec En-tête Foncé (#11313d) */}
        <div className="mb-6 overflow-x-auto rounded-lg border border-[#11313d]/20 bg-white dark:bg-[#0a192f] shadow-xs">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#11313d] text-white">
                <th className="text-left font-semibold py-2.5 px-3">Détail / description</th>
                <th className="text-center font-semibold py-2.5 px-3 w-16 sm:w-20">Quantité</th>
                <th className="text-right font-semibold py-2.5 px-3 w-24 sm:w-32">Prix HT</th>
                <th className="text-right font-semibold py-2.5 px-3 w-28 sm:w-36">Total HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#11313d]/15">
              {invoice.items.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:bg-[#06101e] transition-colors">
                  <td className="py-3 px-3 text-slate-800 dark:text-slate-100 font-medium">{line.description}</td>
                  <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-200">{line.quantity}</td>
                  <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-200"><span className="font-mono">{formatCurrency(line.unitPrice)}</span></td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-900 dark:text-white"><span className="font-mono">{formatCurrency(line.total)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section Totaux */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
          {/* Message à gauche */}
          <div className="order-2 sm:order-1 pt-4">
            <p className="text-sm font-semibold text-[#11313d]">Merci pour votre confiance !</p>
            {!isDevis && invoice.status === "Payée" && (
              <div className="mt-4 inline-block border-2 border-emerald-600 text-emerald-600 font-bold px-4 py-2 rounded-lg transform -rotate-6 opacity-80">
                PAYÉE
              </div>
            )}
          </div>

          {/* Totaux & Signature à droite */}
          <div className="order-1 sm:order-2 w-full sm:w-80 space-y-4 ml-auto">
            {/* Tableau des Totaux */}
            <div className="border border-[#11313d]/20 rounded-lg overflow-hidden bg-white dark:bg-[#0a192f] text-xs sm:text-sm shadow-2xs">
              <div className="flex justify-between py-2 px-3 border-b border-[#11313d]/10">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Total Hors Taxe</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between py-2 px-3 border-b border-[#11313d]/10">
                <span className="text-slate-600 dark:text-slate-300 font-medium">TVA ({invoice.taxAmount > 0 ? "18%" : "0%"})</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between py-2.5 px-3 bg-[#11313d]/5 font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                <span>Total TTC</span>
                <span className="font-mono">{formatCurrency(invoice.total)}</span>
              </div>
            </div>

            {/* Encadré spécifique selon le type */}
            {isDevis ? (
              <div>
                <p className="text-xs font-bold text-[#11313d] mb-1.5">Bon pour accord</p>
                <div className="w-full h-24 bg-white dark:bg-[#0a192f] border border-[#11313d]/20 rounded-lg flex flex-col justify-end p-2 shadow-inner">
                  <div className="border-t border-dashed border-slate-300 dark:border-[#244b82] pt-1 text-[10px] text-slate-400 text-right">
                    Date et signature du client
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1 text-right">à retourner daté et signé</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-[#11313d] mb-1.5">Modalités de paiement</p>
                <div className="w-full bg-white dark:bg-[#0a192f] border border-[#11313d]/20 rounded-lg p-3 shadow-inner">
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
                    Le paiement de la présente facture est dû au plus tard le <span className="font-bold">{new Date(invoice.dueDate).toLocaleDateString("fr-FR")}</span>.<br />
                    En cas de retard de paiement, des pénalités pourront être appliquées conformément aux conditions générales de vente.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pied de page : Bandeau distinctif */}
        <div className="bg-[#cbd8d1]/80 border border-[#b8c9c0] rounded-xl sm:rounded-2xl p-5 sm:p-6 mt-4">
          {settings.logo ? (
            <img src={settings.logo} alt="Logo" className="h-16 object-contain mb-3" />
          ) : (
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#11313d] mb-3">{settings.name}</h2>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#11313d]/90">
            <div className="space-y-1">
              {settings.phone && <p className="font-medium">{settings.phone}</p>}
              {settings.email && <p>{settings.email}</p>}
              {settings.address && <p>{settings.address.replace(/\n/g, ', ')}</p>}
            </div>

            <div className="sm:border-l sm:border-[#11313d]/20 sm:pl-4 space-y-1 flex flex-col justify-center">
              <p className="font-medium">www.stockhub.shop</p>
              <p>WhatsApp : {settings.phone || "Contact direct"}</p>
            </div>
          </div>

          <div className="border-t border-[#11313d]/15 mt-4 pt-3 text-center text-[10px] text-[#11313d]/70">
            Infos administratives : RCCM / IFU • Enregistré au registre du commerce • Merci de votre confiance
          </div>
        </div>

      </div>
    </div>
  );
}
