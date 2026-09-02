export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: "Entrée" | "Sortie" | "Ajustement";
  quantity: number;
  date: string;
  user: string;
  reason?: string;
}

export const mockStockMovements: StockMovement[] = [
  {
    id: "mov-1",
    productId: "prod-1",
    productName: "Riz parfumé 25kg",
    type: "Entrée",
    quantity: 50,
    date: "2026-08-30T09:15:00Z",
    user: "Lionel Godjo",
    reason: "Réception fournisseur",
  },
  {
    id: "mov-2",
    productId: "prod-2",
    productName: "Savon Ariel 1kg",
    type: "Sortie",
    quantity: -2,
    date: "2026-08-29T14:30:00Z",
    user: "Vendeur 1",
    reason: "Vente en boutique",
  },
  {
    id: "mov-3",
    productId: "prod-3",
    productName: "Huile Dinor 5L",
    type: "Sortie",
    quantity: -5,
    date: "2026-08-29T10:10:00Z",
    user: "Vendeur 1",
    reason: "Vente en boutique",
  },
  {
    id: "mov-4",
    productId: "prod-5",
    productName: "Papier hygiénique Lotus",
    type: "Ajustement",
    quantity: -1,
    date: "2026-08-28T16:45:00Z",
    user: "Lionel Godjo",
    reason: "Produit endommagé",
  }
];
