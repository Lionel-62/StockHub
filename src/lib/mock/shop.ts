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
  name: "Ma Super Boutique",
  slug: "ma-super-boutique",
  description: "Découvrez nos meilleurs produits au meilleur prix.",
  whatsappNumber: "+22900000000",
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
    const stored = localStorage.getItem("stockhub_shop_settings");
    if (stored) {
      setShopSettings(JSON.parse(stored));
    } else {
      setShopSettings(defaultShopSettings);
      localStorage.setItem("stockhub_shop_settings", JSON.stringify(defaultShopSettings));
    }
  };

  useEffect(() => {
    loadFromStorage();
    setIsLoaded(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "stockhub_shop_settings") {
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
    localStorage.setItem("stockhub_shop_settings", JSON.stringify(newSettings));
    window.dispatchEvent(new Event("shopSettingsUpdated"));
  };

  return { shopSettings, saveShopSettings, isLoaded };
}
