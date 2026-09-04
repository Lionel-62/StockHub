"use client";

import { useState } from "react";
import { Search, Plus, Minus, Trash2, ArrowLeft, Save, Banknote, CreditCard, ChevronRight, Calculator, User, ShoppingCart, CheckCircle2, Package, Smartphone, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import Link from "next/link";
import Image from "next/image";
import { useProducts, Product } from "@/hooks/products";
import { useOrders, Order } from "@/hooks/orders";
import { useClients } from "@/hooks/clients";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CartItem extends Product {
  cartQuantity: number;
}

export default function PointOfSalePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Espèces");
  const [visibleCount, setVisibleCount] = useState(15);

  const { products, setProducts, isLoaded: productsLoaded } = useProducts();
  const { orders, addOrder } = useOrders();
  const { clients, isLoaded: clientsLoaded } = useClients();
  const router = useRouter();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter products
  const availableProducts = products.filter(p => p.stock > 0);
  const filteredProducts = availableProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  // Cart operations
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = item.cartQuantity + delta;
        if (newQuantity <= item.stock) {
          return { ...item, cartQuantity: newQuantity };
        }
      }
      return item;
    }).filter(item => item.cartQuantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  // Calculations
  const [applyTax, setApplyTax] = useState(true);
  
  const subtotal = cart.reduce((acc, item) => acc + (item.salePrice * item.cartQuantity), 0);
  const tax = applyTax ? subtotal * 0.18 : 0; // 18% TVA or 0
  const total = subtotal + tax;

  const getCategoryColor = (category: string) => {
    if (category.toLowerCase().includes("alim")) return "bg-emerald-100 text-emerald-600";
    if (category.toLowerCase().includes("entre")) return "bg-blue-100 text-blue-600";
    return "bg-slate-100 text-slate-600";
  };

  const paymentMethods = [
    { id: "Espèces", icon: Banknote },
    { id: "Mobile Money", icon: Smartphone },
  ];

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // 1. Créer la nouvelle commande
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `#CMD-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId: selectedClient || undefined,
      clientName: selectedClient ? clients.find(c => c.id === selectedClient)?.name || "Client" : "Client de passage",
      totalAmount: total,
      itemsCount: cart.reduce((acc, item) => acc + item.cartQuantity, 0),
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.cartQuantity,
        unitPrice: item.salePrice
      })),
      status: "Payée",
      date: new Date().toISOString(),
      paymentMethod: paymentMethod as any,
    };

    // 2. Mettre à jour les stocks
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.id === product.id);
      if (cartItem) {
        const newStock = Math.max(0, product.stock - cartItem.cartQuantity);
        const newStatus = newStock === 0 ? "Rupture" : newStock <= 15 ? "Stock faible" : "En stock";
        return { ...product, stock: newStock, status: newStatus as any };
      }
      return product;
    });

    setProducts(updatedProducts);
    addOrder(newOrder);
    setCart([]);

    // 3. Rediriger
    router.push("/dashboard/ventes");
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/ventes">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shadow-sm">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Point de Vente</h1>
            <p className="text-slate-500 text-sm">Caisse rapide - Interface vendeur</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 relative items-start">
        
        {/* Left Column: Catalogue */}
        <div className="flex-1 w-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Top Search Bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Scanner ou rechercher un produit (Nom, Code SKU)..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleCount(15); // Reset count on search
                }}
                className="pl-12 pr-4 py-3.5 w-full border-2 border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-[#0b213f] focus:ring-4 focus:ring-[#0b213f]/10 transition-all duration-300 shadow-sm"
                autoFocus
              />
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="p-3 bg-slate-50/50 min-h-[500px] flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {displayedProducts.map((product) => {
                const cartItem = cart.find(item => item.id === product.id);
                const qtyInCart = cartItem ? cartItem.cartQuantity : 0;
                
                return (
                <div 
                  key={product.id} 
                  onClick={() => { if (qtyInCart === 0) addToCart(product); }}
                  className="group bg-white border border-slate-200/60 rounded-xl p-2.5 hover:border-[#0b213f]/40 hover:shadow-md hover:shadow-slate-200 transition-all duration-200 cursor-pointer active:scale-[0.98] flex flex-col relative"
                >
                  {/* Stock Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm backdrop-blur-sm border", product.stock <= 5 ? "bg-red-50 text-red-600 border-red-100" : "bg-white/90 text-slate-800 border-slate-100")}>
                      <span className="font-mono">{product.stock}</span>
                    </span>
                  </div>

                  {/* Product Image */}
                  <div className="relative w-full aspect-[4/3] rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 mb-2">
                    {product.imageUrl ? (
                      <Image 
                        src={product.imageUrl} 
                        alt={product.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <Package size={24} className="text-slate-300" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col flex-1">
                    <h3 className="font-bold text-slate-700 text-xs sm:text-sm leading-tight line-clamp-2 min-h-[32px]" title={product.name}>
                      {product.name}
                    </h3>
                    
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
                      <span className="text-[#0b213f] font-black text-sm sm:text-[15px]">
                        <span className="font-mono">{formatCurrency(product.salePrice)}</span>
                      </span>
                      
                      {/* Add/Quantity Controls */}
                      {qtyInCart > 0 ? (
                        <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-lg px-1 py-1 shadow-sm" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => updateQuantity(product.id, -1)}
                            className="h-6 w-6 rounded bg-white text-orange-600 flex items-center justify-center hover:bg-orange-100 transition-colors shadow-sm shrink-0"
                          >
                            <Minus size={14} strokeWidth={3} />
                          </button>
                          <span className="font-bold text-orange-700 text-sm min-w-[16px] text-center shrink-0">
                            {qtyInCart}
                          </span>
                          <button 
                            onClick={() => {
                               if (qtyInCart < product.stock) updateQuantity(product.id, 1);
                            }}
                            className={cn("h-6 w-6 rounded bg-white text-orange-600 flex items-center justify-center hover:bg-orange-100 transition-colors shadow-sm shrink-0", qtyInCart >= product.stock && "opacity-50 cursor-not-allowed")}
                          >
                            <Plus size={14} strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#0b213f] group-hover:text-white transition-colors border border-slate-100 shadow-sm">
                          <Plus size={16} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
            
            {filteredProducts.length > visibleCount && (
              <div className="mt-6 mb-4 flex justify-center">
                <Button 
                  variant="outline" 
                  className="rounded-full px-6 py-2 border-slate-200 text-slate-600 hover:text-[#0b213f] hover:bg-slate-100 font-semibold text-sm shadow-sm transition-all"
                  onClick={() => setVisibleCount(prev => prev + 15)}
                >
                  Voir plus de produits
                </Button>
              </div>
            )}
            
            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center text-slate-400 py-20">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="font-medium text-lg text-slate-500">Aucun produit trouvé</p>
                <p className="text-sm">Essayez une autre recherche</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Ticket / Cart */}
        <div id="ticket-section" className="w-full lg:w-[420px] xl:w-[450px] lg:sticky lg:top-6 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 shrink-0 overflow-hidden lg:max-h-[calc(100vh-100px)] mb-20 lg:mb-0">
          
          {/* Cart Header */}
          <div className="p-3 bg-[#0b213f] text-white flex items-center justify-between shrink-0">
            <h2 className="font-bold text-base flex items-center gap-2">
              <ShoppingCart size={18} />
              Ticket en cours
            </h2>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-slate-300 hover:text-white text-xs font-medium transition-colors px-2 py-1 rounded hover:bg-white/10">
                Vider
              </button>
            )}
          </div>
          
          {/* Client Selection */}
          <div className="p-3 border-b border-slate-100 bg-slate-50 shrink-0">
              <CustomSelect
                options={[
                  { value: "", label: "-- Client de passage --" },
                  ...clients.map(c => ({ value: c.id, label: c.name }))
                ]}
                value={selectedClient}
                onChange={setSelectedClient}
                placeholder="Client de passage"
              />
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar bg-slate-50/50 min-h-[100px]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                <ShoppingCart size={40} className="mb-3 opacity-20" />
                <p className="font-medium text-slate-500 text-sm">Le panier est vide</p>
                <p className="text-xs mt-1">Sélectionnez des articles</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex flex-col p-2.5 bg-white border border-slate-100 rounded-lg shadow-sm hover:border-slate-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 pr-2">
                      <h4 className="font-bold text-slate-800 text-xs leading-tight">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{formatCurrency(item.salePrice)} l'unité</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-7 w-7 flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold text-xs text-slate-900"><span className="font-mono">{item.cartQuantity}</span></span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={item.cartQuantity >= item.stock}
                        className="h-7 w-7 flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      <span className="font-mono">{formatCurrency(item.salePrice * item.cartQuantity)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer */}
          <div className="p-3 bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] shrink-0 z-10">
            {/* VAT Toggle */}
            <div className="mb-3">
              <div className="flex p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setApplyTax(true)}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
                    applyTax ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Avec TVA (18%)
                </button>
                <button
                  onClick={() => setApplyTax(false)}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
                    !applyTax ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Sans TVA
                </button>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1 mb-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex justify-between text-slate-500 text-xs">
                <span>Sous-total HT</span>
                <span className="font-medium"><span className="font-mono">{formatCurrency(subtotal)}</span></span>
              </div>
              {applyTax && (
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>TVA (18%)</span>
                  <span className="font-medium"><span className="font-mono">{formatCurrency(tax)}</span></span>
                </div>
              )}
              <div className="h-px w-full bg-slate-200 my-1"></div>
              <div className="flex justify-between text-[#0b213f] text-lg font-black">
                <span>Total</span>
                <span><span className="font-mono">{formatCurrency(total)}</span></span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-3">
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map(method => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2 rounded-lg border-2 transition-all duration-200",
                        paymentMethod === method.id 
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" 
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <Icon size={16} className={paymentMethod === method.id ? "text-blue-600" : "text-slate-400"} />
                      <span className="font-bold text-xs">{method.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full h-12 bg-[#0b213f] hover:bg-[#12305a] text-white font-bold text-base rounded-lg shadow-lg shadow-[#0b213f]/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex justify-between items-center px-4"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} />
                <span>Encaisser</span>
              </div>
              <span><span className="font-mono">{formatCurrency(total)}</span></span>
            </Button>
          </div>
        </div>

      </div>

      {/* Mobile Cart Floating Bar */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-[60px] md:bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-40 flex items-center justify-between animate-in slide-in-from-bottom-10">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">Total ({cart.reduce((a, b) => a + b.cartQuantity, 0)} articles)</span>
            <span className="font-black text-lg text-[#0b213f] leading-none"><span className="font-mono">{formatCurrency(total)}</span></span>
          </div>
          <Button 
            onClick={() => document.getElementById('ticket-section')?.scrollIntoView({ behavior: 'smooth' })} 
            className="bg-[#0f9d58] hover:bg-[#0d8a4d] text-white px-6 shadow-md"
          >
            <ShoppingCart size={18} className="mr-2" />
            Voir Ticket
          </Button>
        </div>
      )}
    </div>
  );
}
