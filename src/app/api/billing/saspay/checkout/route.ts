import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { amount } = await req.json();

    const apiKey = process.env.SASPAY_API_KEY;
    if (!apiKey) {
      console.error("SASPAY_API_KEY is not configured.");
      return NextResponse.json({ error: 'Configuration de paiement manquante.' }, { status: 500 });
    }

    // Récupérer les informations du profil
    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, identifier')
      .eq('id', session.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    // Création de la session SASPay
    // TODO: Ajuster return_url avec l'URL en production
    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    const saspayPayload = {
      amount: amount || "5000.00",
      currency: "XOF",
      description: "Abonnement StockHub",
      customer_email: profile.identifier.includes('@') ? profile.identifier : "admin@stockhub.com",
      customer_name: profile.name,
      return_url: `${baseUrl}/dashboard/parametres/facturation?payment=success`,
      // On peut passer l'ID utilisateur dans les metadata si SASPay le supporte (généralement via description ou metadata)
      // saspay ne supporte pas metadata explicitement dans les docs de base, on peut utiliser un ID interne si besoin
    };

    const response = await fetch('https://api.saspay.me/api/v1/checkout-sessions/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saspayPayload),
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error("SASPay API Error:", errData);
      return NextResponse.json({ error: 'Erreur lors de la création de la session de paiement.' }, { status: 500 });
    }

    const data = await response.json();
    
    // SASPay retourne l'URL de checkout dans data.data.checkout_url (format d'enveloppe non documenté)
    const payloadData = data.data || data;
    const checkoutUrl = payloadData.checkout_url || payloadData.url;

    if (!checkoutUrl) {
      console.error("SASPay API ne retourne pas d'URL de checkout:", data);
      return NextResponse.json({ 
        error: `Erreur API SASPay: ${JSON.stringify(data).substring(0, 100)}...` 
      }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl });

  } catch (error: any) {
    console.error("Checkout route error:", error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
