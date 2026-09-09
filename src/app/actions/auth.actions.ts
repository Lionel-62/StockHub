'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { setSession, deleteSession } from '@/lib/auth/session';
import { checkRateLimit, incrementRateLimit, resetRateLimit } from '@/lib/auth/rate-limit';

export async function loginAction(identifier: string, pinCode: string, allowedRole?: "owner" | "employee", shopSlug?: string) {
  const rateLimit = checkRateLimit(identifier);
  if (!rateLimit.allowed) {
    return { success: false, error: `Trop de tentatives. Veuillez réessayer dans ${rateLimit.retryAfter} secondes.` };
  }

  const supabase = createAdminClient();
  
  let query = supabase
    .from('profiles')
    .select('*, shops!inner(slug, name)')
    .eq('identifier', identifier)
    .eq('pin_code', pinCode);
    
  if (allowedRole === "employee" && shopSlug) {
    query = query.eq('shops.slug', shopSlug);
  }

  const { data, error } = await query.single();
  const userRecord = data;

  if (!error && userRecord) {
    if (allowedRole && userRecord.role !== allowedRole) {
      return { success: false, error: allowedRole === "owner" ? "Veuillez utiliser l'espace employé." : "Veuillez utiliser l'espace propriétaire." };
    }

    resetRateLimit(identifier);

    // Build session data securely (do not include PIN)
    const sessionData = {
      id: userRecord.id,
      name: userRecord.name,
      identifier: userRecord.identifier,
      role: userRecord.role,
      shopId: userRecord.shop_id,
      shopSlug: userRecord.shops?.slug || userRecord.shop_slug,
      shopName: userRecord.shops?.name || userRecord.shop_name,
      onboardingCompleted: userRecord.onboarding_completed,
      permissions: typeof userRecord.permissions === 'string' ? JSON.parse(userRecord.permissions) : userRecord.permissions,
      createdAt: userRecord.created_at || new Date().toISOString()
    };

    await setSession(sessionData);
    
    // We also return it to the frontend for optimistic UI state
    return { success: true, user: sessionData };
  }

  incrementRateLimit(identifier);
  return { success: false, error: "Identifiant ou code PIN incorrect." };
}

export async function logoutAction() {
  await deleteSession();
  return { success: true };
}

export async function syncSessionAction(sessionData: any) {
  console.log("syncSessionAction called with:", sessionData);
  await setSession(sessionData);
  return { success: true };
}

export async function registerOwnerAction(payload: {
  userId: string;
  name: string;
  email: string;
}) {
  try {
    const supabase = createAdminClient();

    // Check if profile already exists (e.g. created by Supabase DB Trigger)
    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', payload.userId).single();
    if (existingProfile) {
      return { success: true };
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: payload.userId,
      name: payload.name,
      identifier: payload.email,
      pin_code: '0000',
      role: 'owner',
      permissions: { canViewDashboard: true },
      created_at: new Date().toISOString()
      // shop_id is null for now
    });
    
    if (profileError) {
      console.error("Profile creation error:", profileError);
      return { success: false, error: "Erreur lors de la création du profil." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Register Error:", err);
    return { success: false, error: err.message || "Erreur interne lors de l'inscription." };
  }
}

export async function updateProfileNameAction(userId: string, newName: string) {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('profiles')
      .update({ name: newName })
      .eq('id', userId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur interne" };
  }
}

export async function completeGoogleSignupAction(userId: string, email: string, name: string) {
  try {
    const supabase = createAdminClient();
    
    // Check if profile already exists to prevent duplicate insertion
    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', userId).single();
    if (existingProfile) {
      return { success: true };
    }

    // 1. Create the profile (shop_id is null for now)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name: name || email,
        identifier: email,
        role: 'owner',
        permissions: { canViewDashboard: true },
      });

    if (profileError) {
      throw profileError;
    }

    return { success: true };
  } catch (err: any) {
    console.error("Google Signup Complete Error:", err);
    return { success: false, error: err.message || "Erreur lors de la création du compte Google." };
  }
}

export async function createShopAction(userId: string, shopName: string, category: string, whatsapp: string, description: string, country?: string, city?: string, countryCode?: string) {
  try {
    const supabase = createAdminClient();
    
    // Créer un slug basé sur le nom de la boutique (ex: "Mega Store" -> "mega-store-a1b2")
    const baseSlug = shopName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const shopSlug = `${baseSlug || 'boutique'}-${Math.random().toString(36).substring(2, 5)}`;
    
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .insert({
        slug: shopSlug,
        name: shopName,
        category,
        whatsapp_number: whatsapp,
        description,
        country: country || null,
        city: city || null,
        country_code: countryCode || null,
        is_active: true,
        owner_id: userId,
      })
      .select()
      .single();
      
    if (shopError) throw shopError;
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ shop_id: shop.id, onboarding_completed: true })
      .eq('id', userId);
      
    if (profileError) {
      await supabase.from('shops').delete().eq('id', shop.id);
      throw profileError;
    }

    // --- Génération automatique de la FAQ ---
    const faqBase = [
      { question: "Comment passer commande ?", answer: "Parcourez la boutique, ajoutez vos articles au panier, puis validez votre commande sur WhatsApp avec le vendeur." },
      { question: "Quels moyens de paiement acceptez-vous ?", answer: "Mobile Money (MTN, Moov, Orange Money, Wave) et paiement à la livraison selon votre zone." },
      { question: "Livrez-vous dans ma ville et sous quel délai ?", answer: "Nous livrons selon votre zone. Le délai exact vous est confirmé après votre commande." },
      { question: "Puis-je payer à la livraison ?", answer: "Oui, le paiement à la livraison est possible selon votre zone." },
      { question: "Comment vous contacter ?", answer: "Directement via WhatsApp, en cliquant sur le bouton de commande ou de contact de la boutique." }
    ];

    let faqSpecific: { question: string, answer: string }[] = [];
    if (category === "Mode & vêtements") {
      faqSpecific = [
        { question: "Comment choisir ma taille ?", answer: "Contactez-nous sur WhatsApp avant de commander, nous vous guidons pour choisir la bonne taille." },
        { question: "Puis-je échanger si la taille ne convient pas ?", answer: "Oui, un échange est possible selon nos conditions. Contactez-nous rapidement après réception." }
      ];
    } else if (category === "Chaussures & maroquinerie") {
      faqSpecific = [
        { question: "Comment connaître ma pointure ?", answer: "Indiquez-nous votre pointure habituelle sur WhatsApp, nous vérifions la correspondance avec vous." },
        { question: "Un échange est-il possible si ça ne chausse pas ?", answer: "Oui, sous réserve que l'article soit intact. Contactez-nous après réception." }
      ];
    } else if (category === "Cosmétiques & beauté") {
      faqSpecific = [
        { question: "Vos produits sont-ils originaux ?", answer: "Oui, nous ne vendons que des produits authentiques." },
        { question: "Comment vos produits sont-ils conservés et expédiés ?", answer: "Nos produits sont stockés avec soin et emballés proprement pour la livraison." }
      ];
    } else if (category === "Alimentation & épicerie") {
      faqSpecific = [
        { question: "Vos produits sont-ils frais ?", answer: "Oui, nous veillons à la fraîcheur de nos produits à chaque commande." },
        { question: "Sous combien de temps suis-je livré ?", answer: "Nous livrons dans les meilleurs délais selon votre zone, confirmés après commande." }
      ];
    } else if (category === "Électronique & accessoires") {
      faqSpecific = [
        { question: "Vos produits sont-ils neufs et garantis ?", answer: "Oui, nos produits sont neufs. Les conditions de garantie vous sont précisées à la commande." },
        { question: "Que faire en cas de produit défectueux ?", answer: "Contactez-nous rapidement sur WhatsApp, nous trouvons une solution (échange ou remboursement)." }
      ];
    } else if (category === "Bijoux & Accessoires") {
      faqSpecific = [
        { question: "Vos bijoux résistent-ils à l'eau ?", answer: "Consultez la description du produit. Nous recommandons d'éviter le contact avec l'eau pour prolonger leur éclat." },
        { question: "Comment sont emballés les bijoux ?", answer: "Chaque pièce est soigneusement emballée dans un écrin ou pochon, idéal pour offrir." }
      ];
    } else if (category === "Maison & Décoration") {
      faqSpecific = [
        { question: "Les articles fragiles sont-ils bien protégés pour la livraison ?", answer: "Oui, nous utilisons des emballages renforcés pour garantir une livraison sans casse." },
        { question: "Puis-je retourner un article de décoration qui ne convient pas à mon intérieur ?", answer: "Oui, sous réserve que l'article soit dans son état et emballage d'origine." }
      ];
    } else if (category === "Santé & Bien-être") {
      faqSpecific = [
        { question: "Vos produits sont-ils certifiés ?", answer: "Nous travaillons avec des fournisseurs reconnus pour garantir la qualité de nos produits." },
        { question: "Fournissez-vous des conseils d'utilisation ?", answer: "Oui, chaque produit est accompagné de ses précautions d'emploi. Contactez-nous pour plus de détails." }
      ];
    } else if (category === "Auto & Moto") {
      faqSpecific = [
        { question: "Les pièces sont-elles compatibles avec mon véhicule ?", answer: "Contactez-nous sur WhatsApp avec le modèle de votre véhicule pour vérifier la compatibilité." },
        { question: "Vos pièces sont-elles garanties ?", answer: "Oui, nous offrons une garantie selon le type de pièce." }
      ];
    }

    const allFaqs = [...faqBase, ...faqSpecific].map((faq, index) => ({
      shop_id: shop.id,
      question: faq.question,
      answer: faq.answer,
      order_index: index,
      is_active: true
    }));

    // Insert without throwing on error to not block onboarding if it fails
    await supabase.from('faqs').insert(allFaqs);
    // ----------------------------------------
    
    // Fetch updated user details to sync session
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, shops!inner(slug, name)')
      .eq('id', userId)
      .single();
      
    if (profile) {
      const sessionData = {
        id: profile.id,
        name: profile.name,
        identifier: profile.identifier,
        role: profile.role,
        shopId: profile.shop_id,
        shopSlug: profile.shops?.slug,
        shopName: profile.shops?.name,
        onboardingCompleted: profile.onboarding_completed,
        permissions: typeof profile.permissions === 'string' ? JSON.parse(profile.permissions) : profile.permissions,
        createdAt: profile.created_at
      };
      await setSession(sessionData);
      return { success: true, user: sessionData };
    }
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur lors de la création de la boutique." };
  }
}
