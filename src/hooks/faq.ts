import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export interface FAQ {
  id: string;
  shop_id?: string;
  question: string;
  answer: string;
  order_index?: number;
  is_active?: boolean;
}

const defaultFAQs: FAQ[] = [];

export function useFAQ(publicShopId?: string) {
  const [faqs, setFaqs] = useState<FAQ[]>(defaultFAQs);
  const [isLoaded, setIsLoaded] = useState(false);

  const getShopId = () => {
    if (publicShopId) return publicShopId;
    const session = localStorage.getItem("stockhub_session");
    if (session) {
      try {
        const user = JSON.parse(session);
        return user.shopId;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const fetchFaqsFromDb = async () => {
    const shopId = getShopId();
    if (!shopId) {
      setIsLoaded(true);
      return;
    }

    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('shop_id', shopId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (!error && data) {
      setFaqs(data as FAQ[]);
      localStorage.setItem(`stockhub_faqs_v3_${shopId}`, JSON.stringify(data));
    } else {
      // Fallback to cache if offline or error
      const cached = localStorage.getItem(`stockhub_faqs_v3_${shopId}`);
      if (cached) {
        try {
          setFaqs(JSON.parse(cached));
        } catch (e) { }
      }
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    fetchFaqsFromDb();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicShopId]);

  const addFaq = async (faq: Omit<FAQ, "id">) => {
    const shopId = getShopId();
    if (!shopId) return;

    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    const newFaq = { ...faq, id: tempId, shop_id: shopId, order_index: faqs.length, is_active: true };
    setFaqs([...faqs, newFaq as FAQ]);

    const { data, error } = await supabase
      .from('faqs')
      .insert({
        shop_id: shopId,
        question: faq.question,
        answer: faq.answer,
        order_index: faqs.length,
        is_active: true
      })
      .select()
      .single();

    if (!error && data) {
      setFaqs(prev => prev.map(f => f.id === tempId ? data : f));
    } else {
      // Rollback
      setFaqs(prev => prev.filter(f => f.id !== tempId));
    }
  };

  const updateFaq = async (id: string, updatedFaq: Partial<FAQ>) => {
    const shopId = getShopId();
    if (!shopId) return;

    // Optimistic UI
    setFaqs(prev => prev.map(faq => faq.id === id ? { ...faq, ...updatedFaq } : faq));

    await supabase
      .from('faqs')
      .update(updatedFaq)
      .eq('id', id)
      .eq('shop_id', shopId);
  };

  const deleteFaq = async (id: string) => {
    const shopId = getShopId();
    if (!shopId) return;

    // Optimistic UI
    setFaqs(prev => prev.filter(faq => faq.id !== id));

    await supabase
      .from('faqs')
      .delete()
      .eq('id', id)
      .eq('shop_id', shopId);
  };

  // Helper to reorder faqs
  const reorderFaqs = async (newOrderedFaqs: FAQ[]) => {
    const shopId = getShopId();
    if (!shopId) return;

    // Optimistic UI
    const updatedWithOrder = newOrderedFaqs.map((faq, index) => ({ ...faq, order_index: index }));
    setFaqs(updatedWithOrder);

    // Update in DB (batch update is tricky in supabase without RPC, so we do it sequentially or promise.all)
    await Promise.all(
      updatedWithOrder.map((faq) => 
        supabase.from('faqs').update({ order_index: faq.order_index }).eq('id', faq.id).eq('shop_id', shopId)
      )
    );
  };

  return { faqs, addFaq, updateFaq, deleteFaq, reorderFaqs, isLoaded };
}
