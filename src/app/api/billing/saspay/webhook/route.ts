import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendAdminTelegram } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    // Dans un cas de production avec SASPay, on vérifierait la signature webhook ici
    // avec process.env.SASPAY_WEBHOOK_SECRET

    const payload = await req.json();
    console.log("SASPay Webhook reçu:", payload);

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
