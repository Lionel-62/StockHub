import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { to, message, templateName, type = 'text', accessToken, phoneNumberId } = await request.json();

    // Vérification des clés API
    if (!accessToken || !phoneNumberId) {
      return NextResponse.json(
        { error: "Configuration API Meta manquante. Veuillez ajouter votre Token et Phone Number ID dans les paramètres." },
        { status: 400 }
      );
    }

    if (!to) {
      return NextResponse.json({ error: "Numéro de destination manquant" }, { status: 400 });
    }

    // Préparation du payload pour l'API Meta
    let payload: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to.replace(/[^0-9]/g, ''), // Nettoyage du numéro
      type: type,
    };

    if (type === 'text') {
      payload.text = { preview_url: false, body: message };
    } else if (type === 'template' && templateName) {
      // Les templates sont requis pour initier une conversation si plus de 24h
      payload.template = {
        name: templateName,
        language: { code: "fr" },
        // Si vous avez des variables dynamiques dans le template, ajoutez-les ici :
        // components: [...] 
      };
    }

    // Appel à l'API Meta officielle
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erreur API Meta:", data);
      return NextResponse.json(
        { error: "Échec de l'envoi via Meta", details: data },
        { status: response.status }
      );
    }

    console.log("✅ Message WhatsApp envoyé avec succès via API !", data);
    return NextResponse.json({ success: true, messageId: data.messages[0].id }, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur serveur (Envoi WhatsApp):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
