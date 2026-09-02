import { NextResponse } from 'next/server';

// Le token de vérification que vous définirez dans le tableau de bord Meta
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "stockhub_secure_token_123";

/**
 * GET: Vérification du Webhook par Meta (Obligatoire)
 * Meta va envoyer une requête GET lors de la configuration du webhook
 * pour s'assurer que l'URL est valide et vous appartient.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook WhatsApp vérifié avec succès !");
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error("❌ Échec de la vérification du Webhook WhatsApp.");
    return new NextResponse("Forbidden", { status: 403 });
  }
}

/**
 * POST: Réception des messages entrants
 * Meta enverra des requêtes POST ici chaque fois qu'un client vous écrit.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Vérifier s'il s'agit d'un événement WhatsApp
    if (body.object === "whatsapp_business_account") {
      
      // Parcourir toutes les entrées (il peut y en avoir plusieurs groupées)
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === "messages") {
            const messageChange = change.value;
            
            // Si c'est un message reçu
            if (messageChange.messages && messageChange.messages.length > 0) {
              const message = messageChange.messages[0];
              const from = message.from; // Numéro du client
              const messageBody = message.text?.body || "Message non textuel";
              
              console.log(`📩 Nouveau message WhatsApp de ${from}: ${messageBody}`);
              
              // ICI: Vous pouvez sauvegarder le message dans votre base de données
              // ou déclencher un bot/notification dans le dashboard.
            }
            
            // Si c'est un accusé de réception (Envoyé, Distribué, Lu)
            if (messageChange.statuses && messageChange.statuses.length > 0) {
              const status = messageChange.statuses[0];
              console.log(`👁️ Statut du message ${status.id} : ${status.status}`);
            }
          }
        }
      }
      
      return NextResponse.json({ status: "success" }, { status: 200 });
    }
    
    return new NextResponse("Not Found", { status: 404 });
  } catch (error) {
    console.error("❌ Erreur dans le Webhook WhatsApp:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
