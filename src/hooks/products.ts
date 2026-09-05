import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { addProductAction, updateProductAction, deleteProductAction } from "@/app/actions/products.actions";

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  status: "En stock" | "Stock faible" | "Rupture";
  imageUrl: string;
  isPublishedOnStore?: boolean;
  promotionalPrice?: number;
  galleryUrls?: string[];
  packOffers?: { quantity: number; price: number }[];
  options?: { name: string; values: string[] }[];
}

export function useProducts(publicShopId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get shopId either from props (public store) or from session (dashboard)
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
      const cached = localStorage.getItem("stockhub_cache_products_" + shopId);
      if (cached) {
        setProducts(JSON.parse(cached));
        setIsLoaded(true);
      }
    }
    fetchProducts();
  }, [publicShopId]);

  const fetchProducts = async () => {
    const shopId = getShopId();
    if (!shopId) {
      setIsLoaded(true);
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped: Product[] = data.map(d => ({
        id: d.id,
        sku: d.barcode || "",
        name: d.name,
        description: d.description || undefined,
        category: d.category || "",
        purchasePrice: d.purchase_price,
        salePrice: d.sale_price,
        promotionalPrice: d.promotional_price || undefined,
        stock: d.stock,
        status: d.status as any,
        imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?q=80&w=200&auto=format&fit=crop",
        packOffers: typeof d.pack_offers === 'string' ? JSON.parse(d.pack_offers) : d.pack_offers,
        isPublishedOnStore: true
      }));
      setProducts(mapped);
      localStorage.setItem("stockhub_cache_products_" + shopId, JSON.stringify(mapped));
    }
    setIsLoaded(true);
  };

  const addProduct = async (product: Product) => {
    const shopId = getShopId();
    if (!shopId) return;

    // Optimistic update
    setProducts(prev => [product, ...prev]);

    const result = await addProductAction({
      id: product.id,
      name: product.name,
      category: product.category,
      stock: product.stock,
      purchase_price: product.purchasePrice,
      sale_price: product.salePrice,
      promotional_price: product.promotionalPrice ?? null,
      pack_offers: product.packOffers ?? null,
      description: product.description ?? null,
      barcode: product.sku,
      status: product.status,
    });

    if (!result.success) {
      // Rollback on failure
      console.error("Erreur ajout produit:", result.error);
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } else {
      const cached = JSON.parse(localStorage.getItem("stockhub_cache_products_" + shopId) || "[]");
      localStorage.setItem("stockhub_cache_products_" + shopId, JSON.stringify([product, ...cached.filter((p: Product) => p.id !== product.id)]));
    }
  };

  const updateProduct = async (product: Product) => {
    const shopId = getShopId();
    // Optimistic update
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));

    const result = await updateProductAction(product.id, {
      name: product.name,
      category: product.category,
      stock: product.stock,
      purchase_price: product.purchasePrice,
      sale_price: product.salePrice,
      promotional_price: product.promotionalPrice ?? null,
      pack_offers: product.packOffers ?? null,
      description: product.description ?? null,
      barcode: product.sku,
      status: product.status,
    });

    if (!result.success) {
      console.error("Erreur mise à jour produit:", result.error);
    } else if (shopId) {
      const cached = JSON.parse(localStorage.getItem("stockhub_cache_products_" + shopId) || "[]");
      localStorage.setItem("stockhub_cache_products_" + shopId, JSON.stringify(cached.map((p: Product) => p.id === product.id ? product : p)));
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    const shopId = getShopId();
    if (shopId) {
      const cached = JSON.parse(localStorage.getItem("stockhub_cache_products_" + shopId) || "[]");
      localStorage.setItem("stockhub_cache_products_" + shopId, JSON.stringify(cached.filter((p: Product) => p.id !== id)));
    }
    await deleteProductAction(id);
  };

  // For compatibility with older code that used setProducts(newArray)
  const replaceAllProducts = async (newProducts: Product[]) => {
    setProducts(newProducts);
    for (const prod of newProducts) {
      await updateProductAction(prod.id, { stock: prod.stock, status: prod.status });
    }
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    setProducts: replaceAllProducts,
    isLoaded
  };
}
