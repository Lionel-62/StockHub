import { useState, useEffect } from "react";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const defaultFAQs: FAQ[] = [
  {
    id: "faq-1",
    question: "Quels sont les délais de livraison ?",
    answer: "Nous expédions généralement vos commandes dans un délai de 24 à 48 heures. La livraison prend ensuite 1 à 3 jours ouvrés selon votre localisation."
  },
  {
    id: "faq-2",
    question: "Quels sont les moyens de paiement acceptés ?",
    answer: "Nous acceptons les paiements via Mobile Money (MoMo, Celtiis, etc.), ainsi que le paiement à la livraison pour certaines zones."
  },
  {
    id: "faq-3",
    question: "Puis-je retourner ou échanger un produit ?",
    answer: "Oui, vous disposez de 14 jours après réception pour retourner un article non utilisé et dans son emballage d'origine. Les frais de retour peuvent s'appliquer."
  }
];

export function useFAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>(defaultFAQs);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFromStorage = () => {
    const stored = localStorage.getItem("stockhub_faqs");
    if (stored) {
      try {
        setFaqs(JSON.parse(stored));
      } catch (e) {
        setFaqs(defaultFAQs);
      }
    } else {
      setFaqs(defaultFAQs);
      localStorage.setItem("stockhub_faqs", JSON.stringify(defaultFAQs));
    }
  };

  useEffect(() => {
    loadFromStorage();
    setIsLoaded(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "stockhub_faqs") {
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
    setFaqs(newFaqs);
    localStorage.setItem("stockhub_faqs", JSON.stringify(newFaqs));
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
