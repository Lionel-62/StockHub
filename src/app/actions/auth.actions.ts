'use server';

import { createAdminClient, createAuthenticatedClient } from '@/lib/supabase/server';
import { setSession, deleteSession, getSession } from '@/lib/auth/session';
import { checkRateLimit, incrementRateLimit, resetRateLimit } from '@/lib/auth/rate-limit';
import { sendAdminTelegram } from '@/lib/telegram';

export async function loginAction(identifier: string, pinCode: string, allowedRole?: "owner" | "employee", shopSlug?: string) {
  const rateLimit = checkRateLimit(identifier);
  if (!rateLimit.allowed) {
    return { success: false, error: `Trop de tentatives. Veuillez réessayer dans ${rateLimit.retryAfter} secondes.` };
  }

  const supabase = createAdminClient();
  
  let query = supabase
    .from('profiles')
    .select('*, shops!profiles_shop_id_fkey!inner(slug, name, shop_type, currency), subscription_status, subscription_end_date')
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
      subscriptionStatus: userRecord.subscription_status,
      subscriptionEndDate: userRecord.subscription_end_date,
      shopType: userRecord.shops?.shop_type || userRecord.shop_type || 'physique',
      currency: userRecord.shops?.currency || userRecord.currency || 'FCFA',
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

export async function deleteOwnerAccountAction() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'owner') return { success: false, error: 'Non autorisé' };

    const supabase = createAdminClient();
    
    // 1. Obtenir toutes les boutiques appartenant à cet utilisateur
    const { data: shops } = await supabase.from('shops').select('id').eq('owner_id', session.id);
    
    if (shops && shops.length > 0) {
      const shopIds = shops.map(s => s.id);
      
      // 2. Supprimer tous les employés de ces boutiques
      await supabase.from('profiles').delete().in('shop_id', shopIds).neq('id', session.id);
      
      // 3. Supprimer les boutiques
      for (const shop of shopIds) {
        await supabase.from('shops').delete().eq('id', shop);
      }
    }
    
    // 4. Supprimer le profil du propriétaire
    await supabase.from('profiles').delete().eq('id', session.id);
    
    // 5. Supprimer l'utilisateur du système Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(session.id);
    
    if (authError) {
      console.error("Auth delete error:", authError);
      return { success: false, error: "Impossible de supprimer l'utilisateur système." };
    }
    
    // Envoi de l'alerte Telegram
    await sendAdminTelegram(`🚨 CRITIQUE : Le commerçant ${session.name} (${session.identifier}) a définitivement supprimé son compte et ses boutiques.`);
    
    await deleteSession();
    
    return { success: true };
  } catch (error: any) {
    console.error("Delete Account Error:", error);
    return { success: false, error: error.message || "Erreur interne lors de la suppression." };
  }
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

    // Attendre un peu et vérifier si le profil a été créé par le trigger Supabase
    let retries = 0;
    while (retries < 3) {
      const { data: existingProfile } = await supabase.from('profiles').select('id, name').eq('id', payload.userId).single();
      if (existingProfile) {
        // Notification étape 1
        await sendAdminTelegram(`📝 Inscription (Étape 1) : ${payload.name} (${payload.email}) vient de créer un compte.`);
        return { success: true };
      }
      await new Promise(r => setTimeout(r, 500));
      retries++;
    }

    // Si le trigger a échoué ou n'existe pas, on le crée manuellement en fallback
    const { error: insertError } = await supabase.from('profiles').insert([
      {
        id: payload.userId,
        name: payload.name,
        identifier: payload.email,
        role: 'owner',
        onboarding_completed: false,
        subscription_status: 'trial'
      }
    ]);

    if (insertError) {
      console.error("Manual insert error:", insertError);
      return { success: false, error: "Erreur lors de la création du profil." };
    }

    await sendAdminTelegram(`📝 Inscription (Fallback manuel) : ${payload.name} (${payload.email}) vient de créer un compte.`);
    return { success: true };
  } catch (err: any) {
    console.error("Register Error:", err);
    return { success: false, error: err.message || "Erreur interne lors de l'inscription." };
  }
}

export async function updateProfileNameAction(userId: string, newName: string) {
  try {
    const session = await getSession();
    if (!session || session.id !== userId) return { success: false, error: 'Non autorisé' };

    const supabase = await createAuthenticatedClient(session);
    
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
    
    // Attendre un peu et vérifier si le profil a été créé par le trigger Supabase
    let retries = 0;
    while (retries < 3) {
      const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', userId).single();
      if (existingProfile) {
        await sendAdminTelegram(`📝 Inscription Google (Étape 1) : ${name} (${email}) vient de se connecter via Google.`);
        return { success: true };
      }
      await new Promise(r => setTimeout(r, 500));
      retries++;
    }

    // Fallback manuel si le profil n'a pas été créé
    const { error: insertError } = await supabase.from('profiles').insert([
      {
        id: userId,
        name: name,
        identifier: email,
        role: 'owner',
        onboarding_completed: false,
        subscription_status: 'trial'
      }
    ]);

    if (insertError) {
      console.error("Google Signup Manual Insert Error:", insertError);
      return { success: false, error: "Erreur lors de la création du profil." };
    }

    await sendAdminTelegram(`📝 Inscription Google (Fallback manuel) : ${name} (${email}) vient de se connecter.`);
    return { success: true };
  } catch (err: any) {
    console.error("Google Signup Complete Error:", err);
    return { success: false, error: err.message || "Erreur lors de la création du compte Google." };
  }
}

export async function createShopAction(userId: string, shopName: string, category: string, whatsapp: string, description: string, country?: string, city?: string, countryCode?: string, themeColor: string = '#FACC15', experienceLevel: string = 'debutant', shopType: string = 'physique', currency: string = 'FCFA') {
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
        theme_color: themeColor,
        experience_level: experienceLevel,
        shop_type: shopType,
        currency: currency
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
      .select('*, shops!profiles_shop_id_fkey!inner(slug, name)')
      .eq('id', userId)
      .single();
      
    if (profile) {
      // We also update subscription details since createShop creates a new active profile.
      // Usually trigger sets this, so fetch it back
      const { data: updatedProfile } = await supabase.from('profiles').select('subscription_status, subscription_end_date').eq('id', profile.id).single();

      const sessionData = {
        id: profile.id,
        name: profile.name,
        identifier: profile.identifier,
        role: profile.role,
        shopId: shop.id,
        shopSlug: shop.slug,
        shopName: shop.name,
        onboardingCompleted: true,
        permissions: typeof profile.permissions === 'string' ? JSON.parse(profile.permissions) : profile.permissions,
        subscriptionStatus: updatedProfile?.subscription_status || 'trial',
        subscriptionEndDate: updatedProfile?.subscription_end_date,
        themeColor: themeColor,
        shopType: shopType,
        currency: currency,
        createdAt: profile.created_at
      };
      await setSession(sessionData);
      
      // Notification Admin Telegram
      await sendAdminTelegram(`🆕 Nouveau commerçant inscrit : ${profile.name} – ${profile.identifier} – boutique : ${shopName} – le ${new Date().toLocaleString('fr-FR')}`);
      
      return { success: true, user: sessionData };
    }
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur lors de la création de la boutique." };
  }
}
