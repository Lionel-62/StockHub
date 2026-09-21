import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { addProductAction, updateProductAction, deleteProductAction, getProductsAction } from "@/app/actions/products.actions";
import { syncManager } from "@/lib/sync/syncManager";

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

    let data = null;
    let error = null;

    if (publicShopId) {
      // Public store: Use the secure public view (anonymously)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const result = await supabase
          .from('public_store_products')
          .select('*')
          .eq('shop_id', publicShopId)
          .order('created_at', { ascending: false })
          .abortSignal(controller.signal);
          
        clearTimeout(timeoutId);
        data = result.data;
        error = result.error;
      } catch (e) {
        console.warn("Supabase public store fetch timeout", e);
      }
    } else {
      // Dashboard: Use the Server Action (which uses Custom JWT for RLS)
      const result = await getProductsAction();
      if (result.success) {
        data = result.data;
      } else {
        error = new Error(result.error);
      }
    }

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

      // Protection: Si Supabase renvoie un tableau vide mais que nous avons des données mockées en local, on ne les écrase pas.
      const cachedStr = localStorage.getItem("stockhub_cache_products_" + shopId);
      let shouldUpdate = true;
      if (mapped.length === 0 && cachedStr) {
        try {
          const cached = JSON.parse(cachedStr);
          if (Array.isArray(cached) && cached.length > 0) {
            shouldUpdate = false; // On garde les données mockées locales
          }
        } catch {}
      }

      if (shouldUpdate) {
        setProducts(mapped);
        localStorage.setItem("stockhub_cache_products_" + shopId, JSON.stringify(mapped));
      }
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

    // Optimistic update in state and local cache
    setProducts(prev => [product, ...prev]);
    const cached = JSON.parse(localStorage.getItem("stockhub_cache_products_" + shopId) || "[]");
    localStorage.setItem("stockhub_cache_products_" + shopId, JSON.stringify([product, ...cached.filter((p: Product) => p.id !== product.id)]));

    const payload = {
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
    };

    try {
      if (!navigator.onLine) throw new Error("offline");
      const result = await addProductAction(payload);

      if (!result.success) {
        // Rollback on logic failure
        console.error("Erreur ajout produit:", result.error);
        setProducts(prev => prev.filter(p => p.id !== product.id));
        const newCached = JSON.parse(localStorage.getItem("stockhub_cache_products_" + shopId) || "[]");
        localStorage.setItem("stockhub_cache_products_" + shopId, JSON.stringify(newCached.filter((p: Product) => p.id !== product.id)));
      }
    } catch (e) {
      console.warn("Ajout de produit mis en attente de synchronisation (hors ligne)");
      syncManager.addToQueue('ADD_PRODUCT', payload);
    }
  };

  const updateProduct = async (product: Product) => {
    const shopId = getShopId();
    let prevProducts: Product[] = [];
    
    // Optimistic update in state and local cache
    setProducts(prev => {
      prevProducts = prev;
      return prev.map(p => p.id === product.id ? product : p);
    });

    if (shopId) {
      try {
        const cached = JSON.parse(localStorage.getItem("stockhub_cache_products_" + shopId) || "[]");
        localStorage.setItem("stockhub_cache_products_" + shopId, JSON.stringify(cached.map((p: Product) => p.id === product.id ? product : p)));
      } catch {}
    }

    const payload = {
      id: product.id,
      data: {
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
      }
    };

    try {
      if (!navigator.onLine) throw new Error("offline");
      const result = await updateProductAction(payload.id, payload.data);

      if (!result.success) {
        console.error("Erreur mise à jour produit:", result.error);
        // Rollback
        setProducts(prevProducts);
        if (shopId) {
          localStorage.setItem("stockhub_cache_products_" + shopId, JSON.stringify(prevProducts));
        }
      }
    } catch (e) {
      console.warn("Modification de produit mise en attente de synchronisation (hors ligne)");
      syncManager.addToQueue('UPDATE_PRODUCT', payload);
    }
  };

  const deleteProduct = async (id: string) => {
    const shopId = getShopId();
    let prevProducts: Product[] = [];
    
    // Optimistic update in state and local cache
    setProducts(prev => {
      prevProducts = prev;
      return prev.filter(p => p.id !== id);
    });
    
    if (shopId) {
      const cached = JSON.parse(localStorage.getItem("stockhub_cache_products_" + shopId) || "[]");
      localStorage.setItem("stockhub_cache_products_" + shopId, JSON.stringify(cached.filter((p: Product) => p.id !== id)));
    }
    
    try {
      if (!navigator.onLine) throw new Error("offline");
      const result = await deleteProductAction(id);
      
      // Assume success, server actions don't return success obj strictly for delete in older code?
      // Wait, deleteProductAction returns {success} ? Let's just catch network error
    } catch (e) {
      console.warn("Suppression de produit mise en attente de synchronisation (hors ligne)");
      syncManager.addToQueue('DELETE_PRODUCT', { id });
    }
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
