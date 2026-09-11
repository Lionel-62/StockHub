import { useState, useEffect, useCallback } from "react";
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
  alertThreshold?: number;
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

  const fetchProducts = useCallback(async () => {
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
      const mapped: Product[] = data.map(d => {
        let safeGalleryUrls: string[] = [];
        if (d.gallery_urls) {
          if (Array.isArray(d.gallery_urls)) {
            safeGalleryUrls = d.gallery_urls;
          } else if (typeof d.gallery_urls === 'string') {
            try {
              const parsed = JSON.parse(d.gallery_urls);
              if (Array.isArray(parsed)) safeGalleryUrls = parsed;
            } catch {}
          }
        }

        let safePackOffers: { quantity: number; price: number }[] | undefined = undefined;
        if (d.pack_offers) {
          if (Array.isArray(d.pack_offers)) {
            safePackOffers = d.pack_offers.length > 0 ? d.pack_offers : undefined;
          } else if (typeof d.pack_offers === 'string') {
            try {
              const parsed = JSON.parse(d.pack_offers);
              if (Array.isArray(parsed) && parsed.length > 0) safePackOffers = parsed;
            } catch {}
          }
        }

        const promoPrice = (d.promotional_price !== null && d.promotional_price !== undefined && Number(d.promotional_price) > 0)
          ? Number(d.promotional_price)
          : undefined;

        const stockNum = Number(d.stock) || 0;
        const alertThresholdNum = d.alert_threshold ?? 5;

        return {
          id: d.id,
          sku: d.barcode || "",
          name: d.name || "",
          description: d.description || undefined,
          category: d.category || "",
          purchasePrice: Number(d.purchase_price) || 0,
          salePrice: Number(d.sale_price) || 0,
          promotionalPrice: promoPrice,
          stock: stockNum,
          status: stockNum === 0 ? "Rupture" : (stockNum <= alertThresholdNum ? "Stock faible" : "En stock"),
          imageUrl: d.image_url || "https://images.unsplash.com/photo-1586201375761-83865001e8ac?q=80&w=200&auto=format&fit=crop",
          galleryUrls: safeGalleryUrls,
          packOffers: safePackOffers,
          isPublishedOnStore: d.is_published_on_store !== false,
          alertThreshold: alertThresholdNum
        };
      });
      setProducts(mapped);
      localStorage.setItem("stockhub_cache_products_" + shopId, JSON.stringify(mapped));
    }
    setIsLoaded(true);
  }, [publicShopId]);

  useEffect(() => {
    const shopId = getShopId();
    if (shopId) {
      const cached = localStorage.getItem("stockhub_cache_products_" + shopId);
      if (cached) {
        try {
          const raw = JSON.parse(cached);
          if (Array.isArray(raw)) {
            const sanitized: Product[] = raw.map((p: any) => ({
              ...p,
              promotionalPrice: (p.promotionalPrice !== null && p.promotionalPrice !== undefined && Number(p.promotionalPrice) > 0) ? Number(p.promotionalPrice) : undefined,
              packOffers: Array.isArray(p.packOffers) && p.packOffers.length > 0 ? p.packOffers : undefined,
              galleryUrls: Array.isArray(p.galleryUrls) ? p.galleryUrls : [],
              options: Array.isArray(p.options) && p.options.length > 0 ? p.options : undefined,
            }));
            setProducts(sanitized);
            setIsLoaded(true);
          }
        } catch {
          // ignore corrupted cache
        }
      }
    }
    fetchProducts();
  }, [publicShopId, fetchProducts]);

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
      status: product.stock === 0 ? "Rupture" : (product.stock <= (product.alertThreshold ?? 5) ? "Stock faible" : "En stock"),
      image_url: product.imageUrl,
      gallery_urls: product.galleryUrls ?? null,
      is_published_on_store: product.isPublishedOnStore,
      alert_threshold: product.alertThreshold ?? 5
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
      status: product.stock === 0 ? "Rupture" : (product.stock <= (product.alertThreshold ?? 5) ? "Stock faible" : "En stock"),
      image_url: product.imageUrl,
      gallery_urls: product.galleryUrls ?? null,
      is_published_on_store: product.isPublishedOnStore,
      alert_threshold: product.alertThreshold ?? 5
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
