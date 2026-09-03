import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: "Brouillon" | "Envoyée" | "Payée" | "En retard";
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const getShopId = () => {
    const session = localStorage.getItem("stockhub_session");
    if (session) {
      const user = JSON.parse(session);
      return user.shopId;
    }
    return null;
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const shopId = getShopId();
    if (!shopId) {
      setIsLoaded(true);
      return;
    }

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('shop_id', shopId)
      .order('issue_date', { ascending: false });

    if (!error && data) {
      const mapped: Invoice[] = data.map(d => ({
        id: d.id,
        invoiceNumber: d.invoice_number,
        clientId: d.client_id || undefined,
        clientName: d.client_name,
        clientEmail: d.client_email,
        subtotal: d.subtotal,
        taxAmount: d.tax_amount,
        total: d.total,
        status: d.status as any,
        items: typeof d.items === 'string' ? JSON.parse(d.items) : d.items,
        issueDate: d.issue_date,
        dueDate: d.due_date
      }));
      setInvoices(mapped);
    }
    setIsLoaded(true);
  };

  const addInvoice = async (invoice: Invoice) => {
    const shopId = getShopId();
    if (!shopId) return;

    setInvoices([invoice, ...invoices]);
    await supabase.from('invoices').insert({
      id: invoice.id,
      shop_id: shopId,
      invoice_number: invoice.invoiceNumber,
      client_id: invoice.clientId,
      client_name: invoice.clientName,
      client_email: invoice.clientEmail,
      subtotal: invoice.subtotal,
      tax_amount: invoice.taxAmount,
      total: invoice.total,
      status: invoice.status,
      items: invoice.items,
      issue_date: invoice.issueDate,
      due_date: invoice.dueDate
    });
  };

  const updateInvoice = async (invoice: Invoice) => {
    setInvoices(invoices.map(inv => inv.id === invoice.id ? invoice : inv));
    await supabase.from('invoices').update({
      invoice_number: invoice.invoiceNumber,
      client_id: invoice.clientId,
      client_name: invoice.clientName,
      client_email: invoice.clientEmail,
      subtotal: invoice.subtotal,
      tax_amount: invoice.taxAmount,
      total: invoice.total,
      status: invoice.status,
      items: invoice.items,
      issue_date: invoice.issueDate,
      due_date: invoice.dueDate
    }).eq('id', invoice.id);
  };

  const deleteInvoice = async (id: string) => {
    setInvoices(invoices.filter(inv => inv.id !== id));
    await supabase.from('invoices').delete().eq('id', id);
  };

  const updateInvoiceStatus = async (id: string, newStatus: Invoice["status"]) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
    await supabase.from('invoices').update({ status: newStatus }).eq('id', id);
  };

  return { 
    invoices, 
    addInvoice,
    updateInvoice,
    deleteInvoice, 
    updateInvoiceStatus,
    isLoaded 
  };
}
