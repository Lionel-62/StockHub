import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { getProductsAction, addProductAction, updateProductAction, deleteProductAction } from "@/app/actions/products.actions";

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
        sku: d.barcode || "", // using barcode for sku
        name: d.name,
        description: d.description || undefined,
        category: d.category || "",
        purchasePrice: d.purchase_price,
        salePrice: d.sale_price,
        promotionalPrice: d.promotional_price || undefined,
        stock: d.stock,
        status: d.status as any,
        imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?q=80&w=200&auto=format&fit=crop", // Placeholder since we don't have images yet
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

    setProducts([product, ...products]);
    await supabase.from('products').insert({
      id: product.id,
      shop_id: shopId,
      name: product.name,
      category: product.category,
      stock: product.stock,
      purchase_price: product.purchasePrice,
      sale_price: product.salePrice,
      promotional_price: product.promotionalPrice,
      pack_offers: product.packOffers,
      description: product.description,
      barcode: product.sku,
      status: product.status
    });
  };

  const updateProduct = async (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
    await supabase.from('products').update({
      name: product.name,
      category: product.category,
      stock: product.stock,
      purchase_price: product.purchasePrice,
      sale_price: product.salePrice,
      promotional_price: product.promotionalPrice,
      pack_offers: product.packOffers,
      description: product.description,
      barcode: product.sku,
      status: product.status
    }).eq('id', product.id);
  };

  const deleteProduct = async (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    await deleteProductAction(id);
  };

  // For compatibility with older code that used setProducts(newArray)
  const replaceAllProducts = async (newProducts: Product[]) => {
    setProducts(newProducts);
    // Sync only stock changes to Supabase to keep it simple for now
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
