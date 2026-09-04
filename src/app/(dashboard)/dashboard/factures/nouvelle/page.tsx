"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Save, Send, Plus, Trash2, Calendar as CalendarIcon, PackageOpen, ChevronDown, Search, Download, CheckCircle2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent } from "@/components/ui/card";
import { useClients } from "@/hooks/clients";
import { useProducts, Product } from "@/hooks/products";
import { useInvoices, Invoice } from "@/hooks/invoices";
import { useOrders } from "@/hooks/orders";
import { useSettings } from "@/hooks/settings";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface InvoiceLine {
  id: string;
  description: string;
  productId?: string;
  quantity: number | string;
  unitPrice: number | string;
}

export default function CreateInvoicePage() {
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [applyTax, setApplyTax] = useState(true);
  const [isFromOrder, setIsFromOrder] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [status, setStatus] = useState<"Brouillon" | "Envoyée" | "Payée" | "En retard">("Brouillon");
  
  const [lines, setLines] = useState<InvoiceLine[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0 }
  ]);

  const { products, setProducts } = useProducts();
  const { invoices, addInvoice, updateInvoice } = useInvoices();
  const { orders, isLoaded: isOrdersLoaded } = useOrders();
  const { clients, isLoaded: isClientsLoaded } = useClients();
  const { settings } = useSettings();
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fix hydration mismatch en initialisant les valeurs aléatoires et temporelles au montage côté client
  useEffect(() => {
    setIssueDate(new Date().toISOString().split('T')[0]);
    setInvoiceNumber(`#INV-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`);
  }, []);

  // Pre-remplissage via orderId
  useEffect(() => {
    if (typeof window !== "undefined" && isOrdersLoaded) {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get("orderId");
      const urlClientId = params.get("clientId");
      const editInvoiceId = params.get("edit");

      if (urlClientId) {
        setClientId(urlClientId);
      }
      
      if (editInvoiceId && invoices.length > 0) {
        const invoiceToEdit = invoices.find(inv => inv.id === editInvoiceId);
        if (invoiceToEdit) {
          setEditId(invoiceToEdit.id);
          setInvoiceNumber(invoiceToEdit.invoiceNumber);
          setClientId(invoiceToEdit.clientId || "");
          setStatus(invoiceToEdit.status);
          setIssueDate(new Date(invoiceToEdit.issueDate).toISOString().split('T')[0]);
          setDueDate(new Date(invoiceToEdit.dueDate).toISOString().split('T')[0]);
          setApplyTax(invoiceToEdit.taxAmount > 0);
          
          if (invoiceToEdit.items && invoiceToEdit.items.length > 0) {
            setLines(invoiceToEdit.items.map((item, index) => ({
              id: item.id || `line-${Date.now()}-${index}`,
              productId: undefined, // Mock data might not have productId, but it's fine for edit
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice
            })));
          }
        }
      }

      if (orderId && !editInvoiceId) {
        setIsFromOrder(true);
        const order = orders.find(o => o.id === orderId);
        if (order) {
          // Gérer le client
          if (order.clientId) {
            setClientId(order.clientId);
          } else {
            // Tentative de retrouver le client par son nom
            const foundClient = clients.find(c => c.name === order.clientName);
            if (foundClient) setClientId(foundClient.id);
          }
          
          // Gérer les articles (avec fallback pour les anciennes commandes)
          if (order.items && order.items.length > 0) {
            setLines(order.items.map((item, index) => ({
              id: `line-${Date.now()}-${index}`,
              productId: item.productId,
              description: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice
            })));
          } else {
            // Ancienne commande sans items détaillés
            setLines([{
              id: `line-${Date.now()}`,
              description: `Achat global pour la commande ${order.orderNumber}`,
              quantity: 1,
              unitPrice: order.totalAmount
            }]);
          }
        }
      }
    }
  }, [isOrdersLoaded, orders, invoices]);

  const addLine = () => {
    setLines([...lines, { id: Math.random().toString(), description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter(l => l.id !== id));
    }
  };

  const updateLine = (id: string, field: keyof InvoiceLine, value: string | number) => {
    setLines(prevLines => prevLines.map(l => {
      if (l.id === id) {
        return { ...l, [field]: value };
      }
      return l;
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  const selectedClient = clients.find(c => c.id === clientId);
  
  const subtotal = lines.reduce((acc, line) => {
    const q = typeof line.quantity === 'number' ? line.quantity : (parseFloat(line.quantity) || 0);
    const p = typeof line.unitPrice === 'number' ? line.unitPrice : (parseFloat(line.unitPrice) || 0);
    return acc + (q * p);
  }, 0);
  const tax = applyTax ? subtotal * 0.18 : 0;
  const total = subtotal + tax;

  const handleSave = async (status: "Brouillon" | "Envoyée" | "Payée" | "En retard") => {
    if (!clientId) {
      alert("Veuillez sélectionner un client.");
      return;
    }

    const newInvoice: Invoice = {
      id: editId || `inv-${Date.now()}`,
      invoiceNumber,
      clientId,
      clientName: selectedClient?.name || "Client inconnu",
      clientEmail: selectedClient?.email || "",
      issueDate: issueDate ? new Date(issueDate).toISOString() : new Date().toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
      items: lines.map(l => ({
        id: l.id,
        description: l.description,
        quantity: Number(l.quantity) || 0,
        unitPrice: Number(l.unitPrice) || 0,
        total: (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0)
      })),
      subtotal,
      taxAmount: tax,
      total,
      status
    };

    if (editId) {
      updateInvoice(newInvoice);
    } else {
      addInvoice(newInvoice);
    }

    // Update stock if not a draft and NOT generated from an existing order (to prevent double deduction)
    if (status !== "Brouillon" && !isFromOrder) {
      let updatedProducts = [...products];
      lines.forEach(line => {
        if (line.productId) {
          const productIndex = updatedProducts.findIndex(p => p.id === line.productId);
          if (productIndex !== -1) {
            const product = updatedProducts[productIndex];
            const qty = Number(line.quantity) || 0;
            const newStock = Math.max(0, product.stock - qty);
            const newStatus = newStock === 0 ? "Rupture" : newStock <= 15 ? "Stock faible" : "En stock";
            updatedProducts[productIndex] = { ...product, stock: newStock, status: newStatus as any };
          }
        }
      });
      setProducts(updatedProducts);
    }

    setShowSuccessModal(true);
  };

  const handleDownloadPDF = () => {
    // La fonction native d'impression va utiliser le @media print
    // pour cacher le reste de l'interface et ouvrir la boite de dialogue
    // permettant "d'enregistrer au format PDF".
    window.print();
  };

  const clientOptions = clients.map(c => ({ value: c.id, label: c.name }));
  const productOptions = products.map(p => ({ value: p.id, label: `${p.name} (${p.stock} en stock)` }));

  return (
    <div className="p-3 md:p-0 h-full flex flex-col space-y-4">
      {/* Header compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/factures">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100">
              <ChevronLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Créer une facture</h1>
            <p className="text-sm text-slate-500">Générez et envoyez instantanément.</p>
          </div>
        </div>
        <div className="flex w-full md:w-auto items-center gap-3">
          {!editId && (
            <Button 
              variant="outline" 
              onClick={() => handleSave("Brouillon")}
              className="flex-1 md:flex-none text-slate-600 bg-white border-slate-200 hover:bg-slate-50 transition-all"
            >
              <Save size={16} className="mr-2" />
              Brouillon
            </Button>
          )}
          <Button 
            onClick={() => handleSave(editId ? status : "Envoyée")}
            className="flex-1 md:flex-none bg-[#0b213f] hover:bg-[#18355c] text-white transition-all shadow-sm"
          >
            <Save size={16} className="mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* COLONNE GAUCHE : FORMULAIRE */}
        <div className="w-full lg:w-[45%] flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-10">
          
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Informations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 relative z-20">
                <label className="text-xs font-semibold text-slate-600">Client Facturé *</label>
                
                <CustomSelect
                  options={clientOptions}
                  value={clientId}
                  onChange={setClientId}
                  placeholder="Sélectionner un client..."
                  searchPlaceholder="Rechercher un client..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Numéro de Facture</label>
                <input 
                  type="text" 
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Date d'émission *</label>
                <DatePicker 
                  value={issueDate}
                  onChange={setIssueDate}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Date d'échéance *</label>
                <DatePicker 
                  value={dueDate}
                  onChange={setDueDate}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2 mt-2">
                <label className="text-xs font-semibold text-slate-600">Application de la TVA *</label>
                <div className="flex bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                  <button 
                    type="button"
                    onClick={() => setApplyTax(true)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${applyTax ? "bg-white text-[#0b213f] shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Avec TVA (18%)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setApplyTax(false)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${!applyTax ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Sans TVA
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Articles & Services</h2>
            </div>
            
            <div className="space-y-3">
              {lines.map((line, index) => (
                <div key={line.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3 relative group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-500">Ligne {index + 1}</span>
                    <button 
                      onClick={() => removeLine(line.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Supprimer la ligne"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="space-y-1.5 relative z-20">
                    <label className="text-xs font-medium text-slate-600">Produit / Service</label>
                    <CustomSelect
                      options={productOptions}
                      value={line.productId || ""}
                      onChange={(val) => {
                        updateLine(line.id, "productId", val);
                        const selectedProduct = products.find(p => p.id === val);
                        if (selectedProduct) {
                          updateLine(line.id, "description", selectedProduct.name);
                          updateLine(line.id, "unitPrice", selectedProduct.salePrice);
                        }
                      }}
                      placeholder="Sélectionner un produit..."
                      searchPlaceholder="Rechercher un produit..."
                      className="py-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Quantité</label>
                      <input 
                        type="number" 
                        min="1"
                        value={line.quantity ?? ""}
                        onChange={(e) => updateLine(line.id, "quantity", e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Prix unitaire (FCFA)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={line.unitPrice ?? ""}
                        onChange={(e) => updateLine(line.id, "unitPrice", e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 text-right">
                    <span className="text-xs text-slate-500 mr-2">Total ligne :</span>
                    <span className="font-semibold text-slate-900">
                      <span className="font-mono">{formatCurrency((typeof line.quantity === 'number' ? line.quantity : (parseFloat(line.quantity) || 0)) * (typeof line.unitPrice === 'number' ? line.unitPrice : (parseFloat(line.unitPrice) || 0)))}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              onClick={addLine}
              className="w-full border-dashed border-2 border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 bg-white"
            >
              <Plus size={16} className="mr-2" />
              Ajouter une ligne
            </Button>
          </div>
          
        </div>

        {/* COLONNE DROITE : PREVISUALISATION */}
        <div className="w-full lg:w-[55%] bg-slate-100 rounded-xl p-2 sm:p-4 lg:p-8 flex justify-center overflow-y-auto custom-scrollbar border border-slate-200 shadow-inner">
          
          <div id="invoice-preview" className="bg-white w-full max-w-2xl rounded-sm shadow-md p-4 sm:p-6 md:p-12 min-h-[500px] md:min-h-[800px] text-slate-800 flex flex-col relative transition-all">
            {/* Header Facture */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 md:mb-12">
              <div>
                <h1 className="text-3xl md:text-4xl font-light text-slate-900 tracking-tight">FACTURE</h1>
                <p className="text-sm font-semibold text-slate-500 mt-1">{invoiceNumber}</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="h-10 w-10 md:h-12 md:w-12 bg-[#0b213f] text-white rounded-lg flex items-center justify-center font-bold text-lg md:text-xl sm:ml-auto mb-2 sm:mb-0">
                  {settings.name.substring(0, 2).toUpperCase()}
                </div>
                <h3 className="font-bold text-slate-900 mt-2">{settings.name}</h3>
                {settings.address.split('\n').map((line, idx) => (
                  <p key={idx} className="text-xs text-slate-500">{line}</p>
                ))}
                {settings.phone && <p className="text-xs text-slate-500 mt-1">{settings.phone}</p>}
                {settings.email && <p className="text-xs text-slate-500">{settings.email}</p>}
              </div>
            </div>

            {/* Adresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
              <div className="order-2 sm:order-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Facturé à</p>
                <h3 className="font-bold text-slate-900">{selectedClient?.name || "Sélectionnez un client..."}</h3>
                <p className="text-sm text-slate-500">{selectedClient?.email || "email@client.com"}</p>
                <p className="text-sm text-slate-500">{selectedClient?.phone || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 order-1 sm:order-2">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date d'émission</p>
                  <p className="text-sm font-medium text-slate-900">{issueDate ? new Date(issueDate).toLocaleDateString("fr-FR") : "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Échéance</p>
                  <p className="text-sm font-medium text-slate-900">{dueDate ? new Date(dueDate).toLocaleDateString("fr-FR") : "-"}</p>
                </div>
              </div>
            </div>

            {/* Tableau Articles */}
            <div className="mb-8 md:mb-12 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-900">
                    <th className="text-left font-semibold text-slate-500 py-3">Description</th>
                    <th className="text-center font-semibold text-slate-500 py-3 w-16">Qté</th>
                    <th className="text-right font-semibold text-slate-500 py-3 w-28">Prix U.</th>
                    <th className="text-right font-semibold text-slate-500 py-3 w-32">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-0">
                      <td className="py-4 text-slate-800 font-medium">{line.description || <span className="text-slate-300 italic">Article sans nom</span>}</td>
                      <td className="py-4 text-center text-slate-600">{line.quantity}</td>
                      <td className="py-4 text-right text-slate-600"><span className="font-mono">{formatCurrency(typeof line.unitPrice === 'number' ? line.unitPrice : (parseFloat(line.unitPrice) || 0))}</span></td>
                      <td className="py-4 text-right font-semibold text-slate-900"><span className="font-mono">{formatCurrency((typeof line.quantity === 'number' ? line.quantity : (parseFloat(line.quantity) || 0)) * (typeof line.unitPrice === 'number' ? line.unitPrice : (parseFloat(line.unitPrice) || 0)))}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totaux */}
            <div className="flex justify-end mb-8 md:mb-12">
              <div className="w-full sm:w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Sous-total</span>
                  <span className="text-slate-900 font-semibold"><span className="font-mono">{formatCurrency(subtotal)}</span></span>
                </div>
                {applyTax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">TVA (18%)</span>
                    <span className="text-slate-900 font-semibold"><span className="font-mono">{formatCurrency(tax)}</span></span>
                  </div>
                )}
                <div className="flex justify-between text-lg pt-3 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Total TTC</span>
                  <span className="font-bold text-slate-900"><span className="font-mono">{formatCurrency(total)}</span></span>
                </div>
              </div>
            </div>

            {/* Footer Facture */}
            <div className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-end">
              <p className="text-xs text-slate-400">
                Note : Tout retard de paiement pourra entraîner des pénalités de retard conformes à la législation en vigueur.
              </p>
            </div>
            
          </div>
        </div>

      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden border border-slate-200 transform scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Facture enregistrée !</h2>
                <p className="text-slate-500 text-sm">
                  La facture {invoiceNumber} a été enregistrée avec succès. Que souhaitez-vous faire ?
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  onClick={handleDownloadPDF}
                  className="w-full bg-[#0b213f] hover:bg-[#18355c] text-white py-6"
                >
                  <Download size={18} className="mr-2" />
                  Télécharger la facture (PDF)
                </Button>
                <Button 
                  onClick={() => router.push("/dashboard/factures")}
                  variant="outline" 
                  className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 py-6"
                >
                  <List size={18} className="mr-2" />
                  Retour aux factures
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
