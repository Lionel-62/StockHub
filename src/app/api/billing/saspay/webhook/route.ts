import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendAdminTelegram } from '@/lib/telegram';

import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    
    // Vérification de sécurité de la signature webhook SASPay
    const secret = process.env.SASPAY_WEBHOOK_SECRET;
    const signature = req.headers.get('x-webhook-signature');
    const timestamp = req.headers.get('x-webhook-timestamp');

    if (secret) {
      if (!signature || !timestamp) {
        console.error("Tentative d'accès au Webhook sans signature !");
        return NextResponse.json({ error: 'Signature requise' }, { status: 401 });
      }
      
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(`${timestamp}.${rawBody}`);
      const expectedSignature = hmac.digest('hex');
      
      if (expectedSignature !== signature) {
        console.error("Signature Webhook invalide !");
        return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
      }
      
      // Vérification de l'horodatage (5 minutes max) pour éviter le rejeu
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime - parseInt(timestamp, 10) > 300) {
        console.error("Webhook expiré !");
        return NextResponse.json({ error: 'Webhook expiré' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    console.log("SASPay Webhook reçu (sécurisé):", payload);

    // Supposons que le payload SASPay ressemble à : { status: "SUCCESS", amount: 5000, customer_email: "...", ... }
    // ou { event: "payment.successful", data: { ... } }
    
    // Simplifions l'extraction
    const status = payload.status || (payload.data && payload.data.status);
    const email = payload.customer_email || (payload.data && payload.data.customer_email);
    const amount = payload.amount || (payload.data && payload.data.amount);

    if (status === 'SUCCESS' || status === 'COMPLETED' || payload.event === 'payment.successful') {
      
      const supabase = createAdminClient();
      
      // On cherche l'utilisateur par son email / identifier
      if (email) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('identifier', email)
          .single();

        if (profile) {
          // Mettre à jour le statut du plan
          // Note: Il faut s'assurer que le champ planStatus existe dans la table profiles
          // S'il n'existe pas, on peut juste enregistrer le succès pour le moment.
          // await supabase.from('profiles').update({ planStatus: 'active' }).eq('id', profile.id);

          // Notification Telegram de l'admin
          await sendAdminTelegram(`💰 Abonnement payé par ${profile.name} (${email}) – ${amount} FCFA – le ${new Date().toLocaleString('fr-FR')}`);
        } else {
          // Notification même si l'utilisateur n'est pas trouvé (pour debug)
          await sendAdminTelegram(`💰 Paiement SASPay reçu mais commerçant introuvable : ${email} – ${amount} FCFA`);
        }
      }

      return NextResponse.json({ received: true, status: "processed" });
    }

    return NextResponse.json({ received: true, status: "ignored" });

  } catch (error: any) {
    console.error("SASPay Webhook error:", error);
    return NextResponse.json({ error: 'Erreur interne du webhook' }, { status: 500 });
  }
}
