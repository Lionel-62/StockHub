import { useState, useEffect } from "react";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const defaultFAQs: FAQ[] = [];

export function useFAQ(publicShopId?: string) {
  const [faqs, setFaqs] = useState<FAQ[]>(defaultFAQs);
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
    const stored = localStorage.getItem(`stockhub_faqs_v2_${shopId}`);
    if (stored) {
      try {
        setFaqs(JSON.parse(stored));
      } catch (e) {
        setFaqs(defaultFAQs);
      }
    } else {
      setFaqs(defaultFAQs);
      localStorage.setItem(`stockhub_faqs_v2_${shopId}`, JSON.stringify(defaultFAQs));
    }
  };

  useEffect(() => {
    loadFromStorage();
    setIsLoaded(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "stockhub_faqs_v2") {
        loadFromStorage();
      }
    };
    
    const handleCustomEvent = () => loadFromStorage();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("faqsUpdated", handleCustomEvent);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("faqsUpdated", handleCustomEvent);
    };
  }, []);

  const saveFaqs = (newFaqs: FAQ[]) => {
    const shopId = getShopId();
    setFaqs(newFaqs);
    localStorage.setItem(`stockhub_faqs_v2_${shopId}`, JSON.stringify(newFaqs));
    window.dispatchEvent(new Event("faqsUpdated"));
  };

  const addFaq = (faq: Omit<FAQ, "id">) => {
    const newFaq: FAQ = {
      id: `faq-${Date.now()}`,
      ...faq
    };
    saveFaqs([...faqs, newFaq]);
  };

  const updateFaq = (id: string, updatedFaq: Partial<FAQ>) => {
    saveFaqs(faqs.map(faq => faq.id === id ? { ...faq, ...updatedFaq } : faq));
  };

  const deleteFaq = (id: string) => {
    saveFaqs(faqs.filter(faq => faq.id !== id));
  };

  return { faqs, saveFaqs, addFaq, updateFaq, deleteFaq, isLoaded };
}
