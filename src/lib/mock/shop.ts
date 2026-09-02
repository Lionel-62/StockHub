import { useState, useEffect } from "react";

export interface ShopSettings {
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

export function useShopSettings() {
  const [shopSettings, setShopSettings] = useState<ShopSettings>(defaultShopSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFromStorage = () => {
    const stored = localStorage.getItem("stockhub_shop_settings_v2");
    if (stored) {
      setShopSettings(JSON.parse(stored));
    } else {
      setShopSettings(defaultShopSettings);
      localStorage.setItem("stockhub_shop_settings_v2", JSON.stringify(defaultShopSettings));
    }
  };

  useEffect(() => {
    loadFromStorage();
    setIsLoaded(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "stockhub_shop_settings_v2") {
        loadFromStorage();
      }
    };
    
    const handleCustomEvent = () => loadFromStorage();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("shopSettingsUpdated", handleCustomEvent);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("shopSettingsUpdated", handleCustomEvent);
    };
  }, []);

  const saveShopSettings = (newSettings: ShopSettings) => {
    setShopSettings(newSettings);
    localStorage.setItem("stockhub_shop_settings_v2", JSON.stringify(newSettings));
    window.dispatchEvent(new Event("shopSettingsUpdated"));
  };

  return { shopSettings, saveShopSettings, isLoaded };
}
