import { useState, useEffect } from "react";

export interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logo?: string;
}

export const defaultSettings: CompanySettings = {
  name: "",
  email: "",
  phone: "",
  address: "",
  website: ""
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

  const loadFromStorage = () => {
    const shopId = getShopId();
    const stored = localStorage.getItem(`stockhub_settings_v2_${shopId}`);
    if (stored) {
      setSettings(JSON.parse(stored));
    } else {
      setSettings(defaultSettings);
      localStorage.setItem(`stockhub_settings_v2_${shopId}`, JSON.stringify(defaultSettings));
    }
  };

  useEffect(() => {
    loadFromStorage();
    setIsLoaded(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "stockhub_settings_v2") {
        loadFromStorage();
      }
    };
    
    const handleCustomEvent = () => loadFromStorage();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("settingsUpdated", handleCustomEvent);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("settingsUpdated", handleCustomEvent);
    };
  }, []);

  const saveSettings = (newSettings: CompanySettings) => {
    const shopId = getShopId();
    setSettings(newSettings);
    localStorage.setItem(`stockhub_settings_v2_${shopId}`, JSON.stringify(newSettings));
    window.dispatchEvent(new Event("settingsUpdated"));
  };

  return { settings, saveSettings, isLoaded };
}
