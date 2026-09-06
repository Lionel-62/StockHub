import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { getInvoicesAction, addInvoiceAction, updateInvoiceAction, deleteInvoiceAction, addPublicInvoiceAction } from "@/app/actions/invoices.actions";

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

export function useInvoices(publicShopId?: string) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const getShopId = () => {
    if (publicShopId) return publicShopId;
    const session = localStorage.getItem("stockhub_session");
    if (session) {
      const user = JSON.parse(session);
      return user.shopId;
    }
    return null;
  };

  useEffect(() => {
    const shopId = getShopId();
    if (shopId) {
      const cached = localStorage.getItem("stockhub_cache_invoices_" + shopId);
      if (cached) {
        setInvoices(JSON.parse(cached));
        setIsLoaded(true);
      }
    }
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const shopId = getShopId();
    if (!shopId) {
      setIsLoaded(true);
      return;
    }

    if (publicShopId) {
       // Storefront has no session and doesn't need to read existing invoices
       setIsLoaded(true);
       return;
    }

    // Use server action for Dashboard
    const res = await getInvoicesAction();
    if (res.success && res.data) {
      const mapped: Invoice[] = res.data.map((d: any) => ({
        id: d.id,
        invoiceNumber: d.invoice_number,
        clientId: d.client_id || undefined,
        clientName: d.client_name,
        clientEmail: d.client_email,
        subtotal: d.subtotal,
        taxAmount: d.tax_amount,
        total: d.total,
        status: d.status,
        items: typeof d.items === 'string' ? JSON.parse(d.items) : d.items,
        issueDate: d.issue_date,
        dueDate: d.due_date
      }));
      setInvoices(mapped);
      localStorage.setItem("stockhub_cache_invoices_" + shopId, JSON.stringify(mapped));
    }
    setIsLoaded(true);
  };

  const addInvoice = async (invoice: Invoice) => {
    const shopId = getShopId();
    if (!shopId) return;

    setInvoices([invoice, ...invoices]);
    
    const dbPayload = {
      id: invoice.id,
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
    };

    if (publicShopId) {
      // Storefront: Use public Server Action because RLS for invoices was removed for public
      await addPublicInvoiceAction(shopId, dbPayload);
    } else {
      // Dashboard: Use standard Server Action
      await addInvoiceAction(dbPayload);
    }
  };

  const updateInvoice = async (invoice: Invoice) => {
    setInvoices(invoices.map(inv => inv.id === invoice.id ? invoice : inv));
    
    const dbPayload = {
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
    };

    if (!publicShopId) {
      await updateInvoiceAction(invoice.id, dbPayload);
    }
  };

  const deleteInvoice = async (id: string) => {
    setInvoices(invoices.filter(inv => inv.id !== id));
    if (!publicShopId) {
      await deleteInvoiceAction(id);
    }
  };

  const updateInvoiceStatus = async (id: string, newStatus: Invoice["status"]) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
    if (!publicShopId) {
      await updateInvoiceAction(id, { status: newStatus });
    }
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
