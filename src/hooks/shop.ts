import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export interface ShopSettings {
  id?: string;
  name: string;
  slug: string;
  description: string;
  whatsappNumber: string;
  isActive: boolean;
  themeColor: string;
  metaApiEnabled?: boolean;
  metaPhoneNumberId?: string;
  metaAccessToken?: string;
}

const defaultShopSettings: ShopSettings = {
  name: "",
  slug: "",
  description: "",
  whatsappNumber: "",
  isActive: true,
  themeColor: "blue",
  metaApiEnabled: false,
  metaPhoneNumberId: "",
  metaAccessToken: "",
};

export function useShopSettings(publicShopId?: string) {
  const [shopSettings, setShopSettings] = useState<ShopSettings>(defaultShopSettings);
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

  const loadFromSupabase = async () => {
    const shopId = getShopId();
    if (!shopId) {
      setIsLoaded(true);
      return;
    }

    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .single();

    if (!error && data) {
      setShopSettings({
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        whatsappNumber: data.whatsapp_number || "",
        isActive: data.is_active,
        themeColor: data.theme_color || "blue",
        metaApiEnabled: data.meta_api_enabled,
        metaPhoneNumberId: data.meta_phone_number_id || "",
        metaAccessToken: data.meta_access_token || ""
      });
    } else {
      // Fallback local if DB not configured yet
      const localShop = localStorage.getItem("stockhub_settings_shop");
      if (localShop) {
        setShopSettings(JSON.parse(localShop));
      }
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    loadFromSupabase();
  }, [publicShopId]);

  const saveShopSettings = async (newSettings: ShopSettings) => {
    const shopId = getShopId();
    if (!shopId) return;

    setShopSettings(newSettings);
    
    await supabase.from('shops').upsert({
      id: shopId,
      name: newSettings.name,
      slug: newSettings.slug,
      description: newSettings.description,
      whatsapp_number: newSettings.whatsappNumber,
      is_active: newSettings.isActive,
      theme_color: newSettings.themeColor,
      meta_api_enabled: newSettings.metaApiEnabled,
      meta_phone_number_id: newSettings.metaPhoneNumberId,
      meta_access_token: newSettings.metaAccessToken
    });
    
    // Dispatch event for other tabs just in case, though they should really listen to Supabase realtime
    window.dispatchEvent(new Event("shopSettingsUpdated"));
  };

  return { shopSettings, saveShopSettings, isLoaded };
}
