"use client";

import { useState, useEffect, use } from "react";
import { ShoppingCart, Search, Plus, Minus, X, ArrowRight, Store as StoreIcon, ChevronLeft, ChevronRight, ChevronDown, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShopSettings } from "@/hooks/shop";
import { useProducts, Product } from "@/hooks/products";
import { useFAQ } from "@/hooks/faq";
import { useInvoices, Invoice } from "@/hooks/invoices";
import { useClients, Client } from "@/hooks/clients";
import { useMessages } from "@/hooks/messages";
import { useOrders, Order } from "@/hooks/orders";
import { decreasePublicStockAction } from "@/app/actions/products.actions";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};

function ShopProductCard({ product, cart, formatCurrency, updateQuantity, handleAddToCartClick }: any) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const images = [product.imageUrl, ...(product.galleryUrls || [])].filter(Boolean);
  const currentImage = images[currentImageIdx] || null;

  useEffect(() => {
    if (images.length <= 1 || isFullscreen) return;
    
    const delay = currentImageIdx === 0 ? 5000 : 3000;
    const timer = setTimeout(() => {
      setCurrentImageIdx((prev) => (prev + 1) % images.length);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [currentImageIdx, images.length]);

  return (
    <>
      <div className="bg-white dark:bg-[#0a192f] rounded-2xl border border-slate-100 dark:border-[#152a4d] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 group flex flex-col">
        <div 
          className="aspect-square bg-slate-50 dark:bg-[#06101e] relative overflow-hidden flex-shrink-0 group/image cursor-pointer"
          onClick={() => { if (currentImage) setIsFullscreen(true); }}
        >
        {product.promotionalPrice && (
          <div className="absolute top-2 left-2 z-10 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold shadow-sm">
            PROMO
          </div>
        )}
        {currentImage && currentImage.trim() !== "" && currentImage !== "undefined" && currentImage !== "null" ? (
          <Image src={currentImage} alt={product.name} fill unoptimized className="object-cover group-hover/image:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <StoreIcon className="h-12 w-12 text-slate-300" />
          </div>
        )}
        
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
            {images.map((_, idx) => (
              <button 
                key={idx}
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(idx); }}
                className={cn("h-1.5 rounded-full transition-all shadow-sm", currentImageIdx === idx ? "w-4 bg-white dark:bg-[#0a192f]" : "w-1.5 bg-white dark:bg-[#0a192f]/50")}
              />
            ))}
          </div>
        )}

        <div className={cn(
          "absolute top-2 right-2 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm backdrop-blur-sm border",
          product.stock <= 5 
            ? "bg-red-500/90 text-white border-red-400 animate-pulse" 
            : "bg-white dark:bg-[#0a192f]/90 text-slate-700 dark:text-slate-200 border-white/50"
        )}>
          {product.stock <= 5 ? `🔥 Vite, plus que ${product.stock} !` : `Stock: ${product.stock}`}
        </div>
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-1 bg-gradient-to-b from-transparent to-slate-50/50">
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm sm:text-base group-hover:text-[#0b213f] transition-colors">{product.name}</h3>
          {product.description && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
          )}
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div className="flex flex-col">
            {product.promotionalPrice ? (
              <>
                <div className="text-xs font-medium text-slate-400 line-through mb-0.5"><span className="font-mono">{formatCurrency(product.salePrice)}</span></div>
                <div className="font-black text-red-600 text-lg sm:text-xl"><span className="font-mono">{formatCurrency(product.promotionalPrice)}</span></div>
              </>
            ) : (
              <div className="font-black text-[#0b213f] text-lg sm:text-xl"><span className="font-mono">{formatCurrency(product.salePrice)}</span></div>
            )}
          </div>
        </div>
        {(() => {
          const qtyInCart = cart.filter((item: any) => item.product.id === product.id).reduce((sum: number, item: any) => sum + item.quantity, 0);
          if (qtyInCart > 0) {
            return (
              <div className="w-full mt-4 flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl overflow-hidden shadow-sm">
                <button 
                  onClick={() => {
                    const cartItem = cart.find((i: any) => i.product.id === product.id);
                    if (cartItem) updateQuantity(cartItem.id, -1);
                  }}
                  className="px-4 py-2 text-orange-600 hover:bg-orange-100 transition-colors font-bold text-lg"
                >
                  -
                </button>
                <div className="flex-1 text-center font-bold text-orange-700">
                  {qtyInCart} au panier
                </div>
                <button 
                  onClick={() => {
                    if (qtyInCart >= product.stock) return;
                    const cartItem = cart.find((i: any) => i.product.id === product.id);
                    if (cartItem) updateQuantity(cartItem.id, 1);
                  }}
                  className={cn("px-4 py-2 text-orange-600 hover:bg-orange-100 transition-colors font-bold text-lg", qtyInCart >= product.stock && "opacity-50 cursor-not-allowed")}
                >
                  +
                </button>
              </div>
            );
          }
          return (
            <Button 
              onClick={() => handleAddToCartClick(product)}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm shadow-orange-500/20"
            >
              Ajouter au panier
            </Button>
          );
        })()}
      </div>
      </div>
      
      {isFullscreen && currentImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button 
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-2 text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors z-50 shadow-lg"
          >
            <X size={24} />
          </button>
          
          <div className="relative w-full max-w-5xl aspect-square md:aspect-video flex items-center justify-center">
            <Image src={currentImage} alt={product.name} fill className="object-contain" />
          </div>
          
          {images.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(prev => prev === 0 ? images.length - 1 : prev - 1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white dark:bg-[#0a192f]/10 hover:bg-white dark:bg-[#0a192f]/20 text-white rounded-full transition-colors z-50 backdrop-blur-sm"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(prev => (prev + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white dark:bg-[#0a192f]/10 hover:bg-white dark:bg-[#0a192f]/20 text-white rounded-full transition-colors z-50 backdrop-blur-sm"
              >
                <ChevronRight size={32} />
              </button>
              
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-50">
                {images.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentImageIdx(idx)}
                    className={cn("h-2 rounded-full transition-all shadow-sm", currentImageIdx === idx ? "w-6 bg-white dark:bg-[#0a192f]" : "w-2 bg-white dark:bg-[#0a192f]/50")}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

function ShopContent({ shopUuid }: { shopUuid: string }) {
  const { shopSettings, isLoaded: shopLoaded } = useShopSettings(shopUuid);
  const { faqs, isLoaded: faqLoaded } = useFAQ(shopUuid);
  const { products, isLoaded: productsLoaded } = useProducts(shopUuid);
  const { invoices, addInvoice } = useInvoices(shopUuid);
  const { clients, addClient, updateClient } = useClients(shopUuid);
  const { sendMessage } = useMessages(shopUuid);
  const { orders, addOrder } = useOrders(shopUuid);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<{id: string, product: Product, quantity: number, selectedOptions?: Record<string, string>}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductForOptions, setSelectedProductForOptions] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  
  // Checkout form
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState(""); // Can be used for Details
  const [customerCountry, setCustomerCountry] = useState("Bénin");
  const [customerPhoneCode, setCustomerPhoneCode] = useState("+229");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState("Aujourd'hui");
  
  // Auth state
  const [loggedInCustomer, setLoggedInCustomer] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authForm, setAuthForm] = useState({ name: "", phone: "", email: "", password: "" });

  // Filter products that are in stock and published
  const availableProducts = products.filter(p => p.stock > 0 && p.isPublishedOnStore !== false);
  const categories = Array.from(new Set(availableProducts.map(p => p.category).filter(Boolean))).sort();
  
  const displayedProducts = availableProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCartClick = (product: Product) => {
    if (product.options && product.options.length > 0) {
      setSelectedProductForOptions(product);
      const defaultOpts: Record<string, string> = {};
      product.options.forEach(opt => {
        if (opt.values.length > 0) defaultOpts[opt.name] = opt.values[0];
      });
      setSelectedOptions(defaultOpts);
    } else {
      addToCart(product);
    }
  };

  const addToCart = (product: Product, options?: Record<string, string>) => {
    setCart(prev => {
      const existing = prev.find(item => {
        if (item.product.id !== product.id) return false;
        return JSON.stringify(options || {}) === JSON.stringify(item.selectedOptions || {});
      });
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: Math.random().toString(), product, quantity: 1, selectedOptions: options }];
    });
    setSelectedProductForOptions(null);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === cartItemId) {
          const newQ = item.quantity + delta;
          if (newQ > item.product.stock) return item;
          return { ...item, quantity: newQ };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const cartTotal = cart.reduce((total, item) => {
    let itemTotal = 0;
    const basePrice = item.product.promotionalPrice || item.product.salePrice;
    
    if (item.product.packOffers && item.product.packOffers.length > 0) {
      const sortedPacks = [...item.product.packOffers].sort((a, b) => b.quantity - a.quantity);
      let remainingQty = item.quantity;
      for (const pack of sortedPacks) {
        if (remainingQty >= pack.quantity) {
          const numPacks = Math.floor(remainingQty / pack.quantity);
          itemTotal += numPacks * pack.price;
          remainingQty %= pack.quantity;
        }
      }
      itemTotal += remainingQty * basePrice;
    } else {
      itemTotal = item.quantity * basePrice;
    }
    return total + itemTotal;
  }, 0);
  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  const handleWhatsAppCheckout = () => {
    if (!customerName) {
      alert("Veuillez entrer votre nom.");
      return;
    }
    
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `CMD-${Math.floor(Math.random() * 10000)}`,
      clientId: "client-online",
      clientName: customerName,
      clientEmail: customerAddress || "N/A",
      issueDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      items: cart.map(item => ({
        id: `item-${Date.now()}-${Math.random()}`,
        description: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.salePrice,
        total: item.product.salePrice * item.quantity,
        productId: item.product.id
      })),
      subtotal: cartTotal,
      taxAmount: 0,
      total: cartTotal,
      status: "Brouillon"
    };
    
    addInvoice(newInvoice);
    
    // Create Order for Ventes Dashboard
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: newInvoice.invoiceNumber, // Match invoice number
      clientName: customerName,
      totalAmount: cartTotal,
      itemsCount: cartItemsCount,
      status: "En attente",
      date: new Date().toISOString(),
      paymentMethod: "Espèces", // Default to Cash on delivery
      source: "En ligne",
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.salePrice,
      }))
    };
    addOrder(newOrder);
    
    // Create or find client
    let clientId = "client-online";
    const existingClient = clients.find(c => c.name.toLowerCase() === customerName.toLowerCase());
    
    if (existingClient) {
      clientId = existingClient.id;
      const updatedClient = {
        ...existingClient,
        totalAmount: (existingClient.totalAmount || 0) + cartTotal,
        lastOrderDate: new Date().toISOString()
      };
      updateClient(updatedClient);
    } else {
      clientId = `client-${Date.now()}`;
      const newClient: Client = {
        id: clientId,
        name: customerName,
        email: "",
        phone: customerPhone ? `${customerPhoneCode} ${customerPhone}` : "",
        address: customerAddress || "",
        status: "Actif",
        type: "Client",
        source: "En ligne",
        totalAmount: cartTotal,
        lastOrderDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      addClient(newClient);
    }

    // Generate WhatsApp message
    let message = `*NOUVELLE COMMANDE*\n\n`;
    message += `👤 Client: ${customerName}\n`;
    message += `🌍 Pays: ${customerCountry}\n`;
    message += `🏙️ Ville: ${customerCity}\n`;
    message += `📱 Tél: ${customerPhoneCode} ${customerPhone}\n`;
    message += `🕒 Livraison souhaitée: ${deliveryTime}\n`;
    if (showDetails && customerAddress) message += `📝 Détails: ${customerAddress}\n`;
    message += `\n*Détails de la commande:*\n`;
    
    cart.forEach(item => {
      let optionsStr = "";
      if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
        optionsStr = ` [${Object.entries(item.selectedOptions).map(([k,v]) => `${k}: ${v}`).join(", ")}]`;
      }
      
      let itemTotal = 0;
      const basePrice = item.product.promotionalPrice || item.product.salePrice;
      if (item.product.packOffers && item.product.packOffers.length > 0) {
        const sortedPacks = [...item.product.packOffers].sort((a, b) => b.quantity - a.quantity);
        let remainingQty = item.quantity;
        for (const pack of sortedPacks) {
          if (remainingQty >= pack.quantity) {
            const numPacks = Math.floor(remainingQty / pack.quantity);
            itemTotal += numPacks * pack.price;
            remainingQty %= pack.quantity;
          }
        }
        itemTotal += remainingQty * basePrice;
      } else {
        itemTotal = item.quantity * basePrice;
      }
      
      message += `- ${item.quantity}x ${item.product.name}${optionsStr} (${formatCurrency(itemTotal)})\n`;
    });
    
    message += `\n*TOTAL: ${formatCurrency(cartTotal)}*`;
    
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${shopSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    
    window.open(waUrl, "_blank");
    
    // Auto-create a message in StockHub messages
    sendMessage(clientId, `Nouvelle commande passée en ligne : ${cart.length} article(s) pour un total de ${formatCurrency(cartTotal)}. Le client a été redirigé vers WhatsApp.`, clientId);
    
    // Diminuer le stock automatiquement
    decreasePublicStockAction(shopUuid, cart.map(item => ({
      id: item.product.id,
      quantity: item.quantity
    }))).catch(err => console.error("Erreur diminution stock:", err));
    
    // Clear cart and show success (optional, but good UX)
    setCart([]);
    setIsCartOpen(false);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.phone || !authForm.password || (authMode === "register" && !authForm.name)) {
      alert("Veuillez remplir les champs obligatoires.");
      return;
    }

    let customer = null;

    if (authMode === "register") {
      // Create new client
      const newClientId = `client-shop-${Date.now()}`;
      const newClient: Client = {
        id: newClientId,
        name: authForm.name,
        email: authForm.email,
        phone: authForm.phone,
        address: "",
        status: "Actif",
        type: "Client",
        source: "En ligne",
        totalAmount: 0,
        lastOrderDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      addClient(newClient);
      customer = newClient;
    } else {
      // Mock Login
      customer = clients.find(c => c.phone === authForm.phone || c.email === authForm.email);
      if (!customer) {
        // Fallback create for mock
        customer = { name: "Client Connecté", phone: authForm.phone, email: authForm.email };
      }
    }

    setLoggedInCustomer(customer);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    if (customer.address) setCustomerAddress(customer.address);
    setShowAuthModal(false);
  };

  const handleCheckoutClick = () => {
    handleWhatsAppCheckout();
  };

  if (!shopLoaded || !productsLoaded) return null;

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-[#06101e] font-sans pb-24">
      {/* Header */}
      <header className="bg-white dark:bg-[#0a192f] shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {shopSettings.logoUrl ? (
              <img src={shopSettings.logoUrl} alt="Logo" width="40" height="40" className="h-10 w-10 object-contain rounded-xl shadow-md" />
            ) : (
              <div className="h-10 w-10 bg-gradient-to-br from-[#0b213f] to-blue-800 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                {shopSettings.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="text-xl font-bold text-slate-900 dark:text-white hidden sm:block">{shopSettings.name}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-80 lg:w-96 bg-slate-100 dark:bg-[#112240] border-transparent focus:bg-white dark:bg-[#0a192f] focus:border-blue-500 rounded-full text-sm transition-all outline-none ring-0"
              />
            </div>
            {/* Button removed to simplify flow as requested */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-[#0b213f] transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white translate-x-1 -translate-y-1">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden p-4 bg-white dark:bg-[#0a192f] border-b border-slate-100 dark:border-[#152a4d]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2.5 w-full bg-slate-100 dark:bg-[#112240] border-transparent focus:bg-white dark:bg-[#0a192f] focus:border-blue-500 rounded-xl text-sm transition-all outline-none ring-0"
          />
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl mx-4 mt-4 md:mt-6 bg-[#0b213f] text-white py-16 md:py-28 px-6 text-center shadow-2xl shadow-[#0b213f]/40 isolate">
        {/* Decorative background glows */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0d8f76]/40 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-[#0d8f76]/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Floating Emoji Cards */}
        <div className="hidden md:flex absolute top-[15%] left-[8%] w-20 h-20 rounded-2xl bg-white dark:bg-[#0a192f]/10 backdrop-blur-lg border border-white/20 items-center justify-center text-4xl shadow-[0_15px_35px_rgba(0,0,0,0.2)] animate-[bounce_6s_ease-in-out_infinite] rotate-12">
          🛍️
        </div>
        <div className="absolute top-[10%] right-[10%] md:right-[20%] w-14 h-14 md:w-16 md:h-16 rounded-full bg-white dark:bg-[#0a192f]/10 backdrop-blur-lg border border-white/20 flex items-center justify-center text-2xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] animate-[bounce_5s_ease-in-out_infinite_reverse] -rotate-12">
          🎁
        </div>
        <div className="hidden lg:flex absolute top-[40%] right-[5%] w-24 h-24 rounded-3xl bg-white dark:bg-[#0a192f]/10 backdrop-blur-lg border border-white/20 items-center justify-center text-5xl shadow-[0_15px_35px_rgba(0,0,0,0.2)] animate-[bounce_7s_ease-in-out_infinite] -rotate-6">
          🛒
        </div>
        <div className="absolute bottom-[20%] left-[10%] md:left-[25%] w-16 h-16 rounded-full bg-white dark:bg-[#0a192f]/10 backdrop-blur-lg border border-white/20 flex items-center justify-center text-3xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] animate-[pulse_4s_ease-in-out_infinite] rotate-45">
          ✨
        </div>
        <div className="hidden md:flex absolute bottom-[10%] right-[15%] w-16 h-16 rounded-2xl bg-white dark:bg-[#0a192f]/10 backdrop-blur-lg border border-white/20 items-center justify-center text-3xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] animate-[bounce_8s_ease-in-out_infinite] rotate-12">
          💎
        </div>
        <div className="hidden lg:flex absolute top-[60%] left-[5%] w-14 h-14 rounded-full bg-white dark:bg-[#0a192f]/10 backdrop-blur-lg border border-white/20 items-center justify-center text-2xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] animate-[pulse_5s_ease-in-out_infinite_reverse] -rotate-45">
          👟
        </div>
        
        <div className="relative max-w-4xl mx-auto space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white dark:bg-[#0a192f]/10 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
             <span className="flex h-2.5 w-2.5 rounded-full bg-[#0d8f76] shadow-[0_0_12px_rgba(13,143,118,1)] animate-pulse"></span>
             <span className="text-sm font-semibold tracking-wider uppercase text-white/90">Bienvenue sur notre boutique</span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            {shopSettings.name}
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed" style={{ textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
            {shopSettings.description}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="flex overflow-x-auto gap-2 pb-4 mb-6 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
                selectedCategory === null 
                  ? "bg-[#0b213f] text-white shadow-md" 
                  : "bg-white dark:bg-[#0a192f] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1c3a66] hover:border-[#0b213f]/50 hover:bg-slate-50 dark:bg-[#06101e]"
              )}
            >
              Tous les produits
            </button>
            {categories.map((category: any) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
                  selectedCategory === category
                    ? "bg-[#0b213f] text-white shadow-md" 
                    : "bg-white dark:bg-[#0a192f] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1c3a66] hover:border-[#0b213f]/50 hover:bg-slate-50 dark:bg-[#06101e]"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayedProducts.map(product => (
            <ShopProductCard
              key={product.id}
              product={product}
              cart={cart}
              formatCurrency={formatCurrency}
              updateQuantity={updateQuantity}
              handleAddToCartClick={handleAddToCartClick}
            />
          ))}
        </div>
        
        {displayedProducts.length === 0 && (
          <div className="text-center py-20">
            <ShoppingCart className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            {availableProducts.length === 0 ? (
              <>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">De nouveaux articles arrivent bientôt !</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2">Nous préparons actuellement notre prochaine collection. Restez connectés, nos nouveautés seront disponibles très prochainement pour vous satisfaire.</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Aucun produit trouvé</h3>
                <p className="text-slate-500 dark:text-slate-400">Essayez une autre recherche.</p>
              </>
            )}
          </div>
        )}
      </main>

      {/* FAQ Section */}
      {faqLoaded && faqs.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 py-12 border-t border-slate-200 dark:border-[#1c3a66]">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Foire Aux Questions</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Trouvez rapidement des réponses à vos questions.</p>
          </div>
          <div className="space-y-4">
            {faqs.filter(faq => faq.is_active !== false).map((faq) => (
              <details 
                key={faq.id} 
                className="group bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-[#1c3a66] rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-slate-800 dark:text-slate-100 hover:text-[#0b213f] transition-colors">
                  {faq.question}
                  <span className="transition group-open:rotate-180">
                    <ChevronDown size={20} className="text-slate-400 group-hover:text-[#0b213f]" />
                  </span>
                </summary>
                <div className="p-5 pt-0 text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0a192f] border-t border-slate-100 dark:border-[#152a4d]">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#0a192f] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-slate-100 dark:border-[#152a4d] flex items-center justify-between bg-white dark:bg-[#0a192f]">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" /> Mon Panier
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:bg-[#112240] rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#06101e]/50">
              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <div className="h-20 w-20 bg-slate-100 dark:bg-[#112240] rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Votre panier est vide</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 bg-white dark:bg-[#0a192f] p-3 rounded-2xl border border-slate-100 dark:border-[#152a4d] shadow-sm">
                    <div className="h-20 w-20 bg-slate-100 dark:bg-[#112240] rounded-xl overflow-hidden relative flex-shrink-0">
                      {item.product.imageUrl && item.product.imageUrl.trim() !== "" && item.product.imageUrl !== "undefined" && item.product.imageUrl !== "null" ? (
                        <Image src={item.product.imageUrl} alt={item.product.name} fill unoptimized className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <StoreIcon className="h-6 w-6 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white text-sm line-clamp-2">{item.product.name}</h4>
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-1">
                              {Object.entries(item.selectedOptions).map(([k, v]) => (
                                <span key={k} className="bg-slate-100 dark:bg-[#112240] px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#1c3a66]">{v}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-slate-400 hover:text-red-500">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="font-bold text-[#0b213f]">
                          <span className="font-mono">{formatCurrency(item.product.promotionalPrice || item.product.salePrice)}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-100 dark:bg-[#112240] px-2 py-1 rounded-lg">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center"><span className="font-mono">{item.quantity}</span></span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white disabled:opacity-30"
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {cart.length > 0 && (
                <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-[#1c3a66] shadow-sm mt-6 rounded-lg overflow-hidden">
                  <div className="bg-[#0d8f76] text-white font-bold text-center py-3">
                    Formulaire de commande
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between text-sm border-b border-slate-100 dark:border-[#152a4d] pb-2">
                      <span className="text-slate-500 dark:text-slate-400">Sous-total:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200"><span className="font-mono">{formatCurrency(cartTotal)}</span></span>
                    </div>
                    <div className="flex justify-between text-base font-bold pb-2">
                      <span className="text-slate-800 dark:text-slate-100">Total:</span>
                      <span className="text-[#0d8f76]"><span className="font-mono">{formatCurrency(cartTotal)}</span></span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Nom complet <span className="text-red-500">*</span></label>
                        <input 
                          type="text"
                          placeholder="Votre nom et prénom" 
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          className="w-full bg-white dark:bg-[#0a192f] border border-slate-300 dark:border-[#244b82] rounded-md p-2.5 text-sm focus:outline-none focus:border-[#0d8f76] focus:ring-1 focus:ring-[#0d8f76]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Numéro WhatsApp <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={customerPhoneCode}
                            onChange={(e) => setCustomerPhoneCode(e.target.value)}
                            className="w-20 bg-white dark:bg-[#0a192f] border border-slate-300 dark:border-[#244b82] rounded-md p-2.5 text-sm focus:outline-none focus:border-[#0d8f76] focus:ring-1 focus:ring-[#0d8f76]"
                          />
                          <input 
                            type="tel"
                            placeholder="Votre numéro" 
                            value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value)}
                            className="flex-1 bg-white dark:bg-[#0a192f] border border-slate-300 dark:border-[#244b82] rounded-md p-2.5 text-sm focus:outline-none focus:border-[#0d8f76] focus:ring-1 focus:ring-[#0d8f76]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Ville</label>
                      <input 
                        type="text"
                        placeholder="Votre ville" 
                        value={customerCity}
                        onChange={e => setCustomerCity(e.target.value)}
                        className="w-full bg-white dark:bg-[#0a192f] border border-slate-300 dark:border-[#244b82] rounded-md p-2.5 text-sm focus:outline-none focus:border-[#0d8f76] focus:ring-1 focus:ring-[#0d8f76]"
                      />
                    </div>

                    <div className="flex items-center justify-between mt-4 border-t border-slate-100 dark:border-[#152a4d] pt-4">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
                        Je veux ajouter des détails
                      </label>
                      <button 
                        onClick={() => setShowDetails(!showDetails)}
                        className={cn("w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out", showDetails ? "bg-[#0d8f76]" : "bg-slate-200")}
                      >
                        <span className={cn("absolute top-0.5 left-0.5 bg-white dark:bg-[#0a192f] w-4 h-4 rounded-full shadow transition-transform duration-200 ease-in-out", showDetails ? "translate-x-5" : "translate-x-0")} />
                      </button>
                    </div>
                    
                    {showDetails && (
                      <textarea 
                        placeholder="Précisions sur l'adresse, instructions spéciales..." 
                        value={customerAddress}
                        onChange={e => setCustomerAddress(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-50 dark:bg-[#06101e] border border-slate-200 dark:border-[#1c3a66] rounded-md p-2.5 text-sm focus:outline-none focus:border-[#0d8f76] focus:ring-1 focus:ring-[#0d8f76] resize-none mt-2"
                      />
                    )}

                    <div className="border border-[#0d8f76]/20 bg-[#0d8f76]/5 rounded-xl p-4 mt-4">
                      <label className="block text-xs font-bold text-[#0d8f76] mb-3 border-l-4 border-[#0d8f76] pl-2">Livrez-moi dans :</label>
                      <div className="flex flex-wrap gap-2">
                        {['Aujourd\'hui', '24h', '48h', '72h', '1 semaine'].map(d => (
                          <button 
                            key={d}
                            onClick={() => setDeliveryTime(d)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors", 
                              deliveryTime === d ? "bg-[#0d8f76] text-white border-[#0d8f76] shadow-sm" : "bg-white dark:bg-[#0a192f] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1c3a66] hover:border-[#0d8f76]/50"
                            )}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 bg-white dark:bg-[#0a192f] border-t border-slate-100 dark:border-[#152a4d] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <Button 
                  onClick={handleCheckoutClick}
                  className="w-full py-6 bg-[#f39c12] hover:bg-[#e67e22] text-white text-lg font-bold rounded-xl shadow-lg shadow-[#f39c12]/30 flex items-center justify-center gap-2"
                >
                  <StoreIcon className="h-5 w-5" /> Commander
                </Button>
                <p className="text-center text-xs text-slate-400 mt-3 font-medium">Paiement à la livraison</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                {authMode === "login" ? "Connexion" : "Créer un compte"}
              </h3>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-slate-700 dark:text-slate-200 transition-colors bg-slate-100 dark:bg-[#112240] p-1.5 rounded-full">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Nom complet *</label>
                  <input 
                    type="text" 
                    required
                    value={authForm.name}
                    onChange={e => setAuthForm({...authForm, name: e.target.value})}
                    className="w-full border border-slate-300 dark:border-[#244b82] rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Votre nom"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Numéro WhatsApp *</label>
                <input 
                  type="tel" 
                  required
                  value={authForm.phone}
                  onChange={e => setAuthForm({...authForm, phone: e.target.value})}
                  className="w-full border border-slate-300 dark:border-[#244b82] rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ex: 97000000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Email (facultatif)</label>
                <input 
                  type="email" 
                  value={authForm.email}
                  onChange={e => setAuthForm({...authForm, email: e.target.value})}
                  className="w-full border border-slate-300 dark:border-[#244b82] rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Mot de passe *</label>
                <input 
                  type="password" 
                  required
                  value={authForm.password}
                  onChange={e => setAuthForm({...authForm, password: e.target.value})}
                  className="w-full border border-slate-300 dark:border-[#244b82] rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" className="w-full bg-[#0b213f] hover:bg-[#18355c] text-white py-5 rounded-xl font-bold mt-2">
                {authMode === "login" ? "Se connecter" : "Créer mon compte"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {authMode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}
              <button 
                onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                className="ml-1 font-bold text-blue-600 hover:underline"
              >
                {authMode === "login" ? "S'inscrire" : "Se connecter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && loggedInCustomer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">Mon Profil</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-700 dark:text-slate-200 transition-colors bg-slate-100 dark:bg-[#112240] p-1.5 rounded-full">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex flex-col items-center mb-6">
              <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl mb-3 shadow-inner">
                {loggedInCustomer.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{loggedInCustomer.name}</h2>
              <div className="mt-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Client Actif
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 dark:bg-[#06101e] p-4 rounded-xl border border-slate-100 dark:border-[#152a4d]">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">WhatsApp / Téléphone</label>
                <div className="font-semibold text-slate-700 dark:text-slate-200">{loggedInCustomer.phone}</div>
              </div>
              {loggedInCustomer.email && (
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Email</label>
                  <div className="font-semibold text-slate-700 dark:text-slate-200">{loggedInCustomer.email}</div>
                </div>
              )}
            </div>

            <Button 
              onClick={() => {
                setLoggedInCustomer(null);
                setShowProfileModal(false);
              }}
              variant="outline"
              className="w-full mt-6 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 py-5 rounded-xl font-bold"
            >
              Se déconnecter
            </Button>
          </div>
        </div>
      )}

      {/* Options Selection Modal */}
      {selectedProductForOptions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-[#152a4d] pb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Choisir les options</h3>
              <button onClick={() => setSelectedProductForOptions(null)} className="text-slate-400 hover:text-slate-700 dark:text-slate-200 transition-colors bg-slate-100 dark:bg-[#112240] p-1.5 rounded-full">
                <X size={18} />
              </button>
            </div>
            <div className="flex gap-4 items-center mb-6">
              <div className="h-16 w-16 bg-slate-100 dark:bg-[#112240] rounded-xl overflow-hidden relative shadow-sm border border-slate-200 dark:border-[#1c3a66]">
                {selectedProductForOptions.imageUrl ? (
                  <Image src={selectedProductForOptions.imageUrl} alt="" fill className="object-cover" />
                ) : (
                  <StoreIcon className="h-6 w-6 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-white line-clamp-2">{selectedProductForOptions.name}</div>
                <div className="text-orange-500 font-bold mt-1">
                  <span className="font-mono">{formatCurrency(selectedProductForOptions.promotionalPrice || selectedProductForOptions.salePrice)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-5 mb-6 max-h-[40vh] overflow-y-auto custom-scrollbar">
              {selectedProductForOptions.options?.map(opt => (
                <div key={opt.name}>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">{opt.name}</label>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map(val => (
                      <button
                        key={val}
                        onClick={() => setSelectedOptions({...selectedOptions, [opt.name]: val})}
                        className={cn(
                          "px-4 py-2 border rounded-xl text-sm font-semibold transition-all",
                          selectedOptions[opt.name] === val 
                            ? "border-[#0b213f] bg-[#0b213f] text-white shadow-md shadow-blue-900/20" 
                            : "border-slate-200 dark:border-[#1c3a66] text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:border-[#244b82] hover:bg-slate-50 dark:bg-[#06101e]"
                        )}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={() => addToCart(selectedProductForOptions, selectedOptions)}
              className="w-full bg-[#0b213f] hover:bg-[#18355c] text-white rounded-xl py-6 font-bold shadow-lg shadow-blue-900/20"
            >
              Confirmer et Ajouter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicShopPage({ params }: { params: Promise<{ shopId: string }> }) {
  const resolvedParams = use(params);
  const { shopId } = resolvedParams;

  const [shopUuid, setShopUuid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShopId() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        
        // 1. Try Supabase first
        const { data, error } = await supabase
          .from('shops')
          .select('id')
          .eq('slug', shopId)
          .abortSignal(controller.signal)
          .single();
          
        clearTimeout(timeoutId);
          
        if (data && !error) {
          setShopUuid(data.id);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Supabase fetch timeout or error, falling back...");
      }
      
      // 2. Fallback to localStorage (utile si la bdd n'est pas encore peuplée)
      const localShop = localStorage.getItem("stockhub_settings_shop");
      if (localShop) {
        const shopSettings = JSON.parse(localShop);
        if (shopSettings.slug === shopId) {
            // We use a dummy shopUuid for local mock viewing
            setShopUuid("local-fallback");
            setLoading(false);
            return;
        }
      }
      
      setLoading(false);
    }
    fetchShopId();
  }, [shopId]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50 dark:bg-[#06101e] p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!shopUuid) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50 dark:bg-[#06101e] p-4 text-center">
        <div>
          <div className="h-16 w-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-2xl">🏪</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Boutique introuvable</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">L'adresse que vous avez saisie ne correspond à aucune boutique active.</p>
        </div>
      </div>
    );
  }

  return <ShopContent shopUuid={shopUuid} />;
}

