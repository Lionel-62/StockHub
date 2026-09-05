import { useState, useEffect } from "react";
import { getShopSettingsAction, updateShopSettingsAction } from "@/app/actions/shop.actions";

export interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logo?: string;
  country?: string;
  city?: string;
  countryCode?: string;
  category?: string;
  description?: string;
}

export const defaultSettings: CompanySettings = {
  name: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  country: "Bénin",
  city: "",
  countryCode: "+229",
  category: "autre",
  description: ""
};

export function useSettings(publicShopId?: string) {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  const getShopId = () => {
    if (publicShopId) return publicShopId;
    const session = localStorage.getItem("stockhub_session");
    if (session) {
      const user = JSON.parse(session);
      return user.shopId;
    }
    return "default";
  };

  const loadFromStorageAndDB = async () => {
    const shopId = getShopId();
    
    // Fallback to local storage
    const stored = localStorage.getItem(`stockhub_settings_v2_${shopId}`);
    let initialSettings = defaultSettings;
    if (stored) {
      initialSettings = JSON.parse(stored);
    }
    
    // Fetch from Supabase
    if (shopId !== "default") {
      const res = await getShopSettingsAction();
      if (res.success && res.data) {
        const dbShop = res.data;
        initialSettings = {
          ...initialSettings,
          name: dbShop.name || initialSettings.name,
          phone: dbShop.whatsapp_number || initialSettings.phone,
          category: dbShop.category || initialSettings.category,
          description: dbShop.description || initialSettings.description,
          country: dbShop.country || initialSettings.country,
          city: dbShop.city || initialSettings.city,
          countryCode: dbShop.country_code || initialSettings.countryCode,
        };
      }
    }
    
    setSettings(initialSettings);
    localStorage.setItem(`stockhub_settings_v2_${shopId}`, JSON.stringify(initialSettings));
    setIsLoaded(true);
  };

  useEffect(() => {
    loadFromStorageAndDB();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "stockhub_settings_v2") {
        loadFromStorageAndDB();
      }
    };
    
    const handleCustomEvent = () => loadFromStorageAndDB();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("settingsUpdated", handleCustomEvent);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("settingsUpdated", handleCustomEvent);
    };
  }, []);

  const saveSettings = async (newSettings: CompanySettings) => {
    const shopId = getShopId();
    let finalPhone = newSettings.phone;
    if (newSettings.countryCode && !finalPhone.startsWith("+")) {
      const cleanPhone = finalPhone.replace(/\s+/g, "");
      finalPhone = `${newSettings.countryCode}${cleanPhone.startsWith("0") ? cleanPhone.substring(1) : cleanPhone}`;
    }
    
    // Update local state with the potentially modified phone
    const settingsToSave = { ...newSettings, phone: finalPhone };
    setSettings(settingsToSave);
    localStorage.setItem(`stockhub_settings_v2_${shopId}`, JSON.stringify(settingsToSave));

    // Sync to DB
    if (shopId !== "default") {
      await updateShopSettingsAction({
        name: settingsToSave.name,
        whatsapp_number: settingsToSave.phone,
        category: settingsToSave.category,
        description: settingsToSave.description,
        country: settingsToSave.country,
        city: settingsToSave.city,
        country_code: settingsToSave.countryCode
      });
    }
    
    window.dispatchEvent(new Event("settingsUpdated"));
  };

  return { settings, saveSettings, isLoaded };
}
