export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "Client" | "Fournisseur";
  status: "Actif" | "Inactif";
  totalAmount: number;
  lastOrderDate: string;
  address?: string;
  source?: "En ligne" | "Sur place";
}

export const mockClients: Contact[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `cli-${i + 1}`,
  type: "Client",
  name: ["Fatou Alassane", "Moussa Idrissou", "Aïcha Djibril", "Kwami Mensah", "Marie Claire"][i % 5] + (i > 4 ? ` ${i}` : ""),
  email: `client${i}@email.com`,
  phone: `+229 90 ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`,
  address: "Cotonou, Bénin",
  status: i % 4 === 0 ? "Inactif" : "Actif",
  totalAmount: Math.floor(Math.random() * 1000000) + 15000,
  lastOrderDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
  source: i % 5 === 0 ? "En ligne" : "Sur place"
}));

export const mockSuppliers: Contact[] = [
  {
    id: "sup-1",
    name: "Grossiste Cotonou",
    email: "contact@grossiste-cotonou.bj",
    phone: "+229 21 33 44 55",
    type: "Fournisseur",
    status: "Actif",
    totalAmount: 1500000,
    lastOrderDate: "2026-08-28T09:00:00Z"
  },
  {
    id: "sup-2",
    name: "Import-Export Abidjan",
    email: "ventes@import-abj.ci",
    phone: "+225 07 00 11 22 33",
    type: "Fournisseur",
    status: "Actif",
    totalAmount: 4200000,
    lastOrderDate: "2026-08-10T14:15:00Z"
  }
];
