import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';
import { getSession } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const apiKey = 
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || 
      process.env.GEMINI_API_KEY || 
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Clé API introuvable. Veuillez ajouter GEMINI_API_KEY dans votre fichier .env.local."
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const google = createGoogleGenerativeAI({ apiKey });

    const body = await req.json();
    const rawMessages = body.messages ?? [];
    
    // Identifier la boutique active (via le body client ou la session sécurisée)
    const session = await getSession();
    let shopId = body.shopId || body.data?.shopId || session?.shopId;

    const supabase = createAdminClient();

    // Si shopId est introuvable, essayer de récupérer la première boutique de l'utilisateur
    if (!shopId && session?.id) {
      const { data: userShop } = await supabase
        .from('shops')
        .select('id')
        .eq('user_id', session.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (userShop) shopId = userShop.id;
    }

    // Récupération des données réelles de la boutique depuis Supabase
    let shopContext: any = {
      shopName: session?.shopName || body.data?.shopName || "Ma Boutique",
      summary: {
        totalProducts: 0,
        totalOrders: 0,
        totalClients: 0,
        totalRevenue: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
      },
      products: [],
      recentOrders: [],
      clients: []
    };

    if (shopId) {
      try {
        const [
          { data: shopData },
          { data: productsData },
          { data: ordersData },
          { data: clientsData }
        ] = await Promise.all([
          supabase.from('shops').select('id, name, slug, currency').eq('id', shopId).maybeSingle(),
          supabase.from('products').select('id, name, category, purchase_price, sale_price, stock, alert_threshold, status').eq('shop_id', shopId),
          supabase.from('orders').select('id, order_number, client_name, total_amount, items, status, payment_method, source, date').eq('shop_id', shopId).order('date', { ascending: false }),
          supabase.from('clients').select('id, name, phone, source').eq('shop_id', shopId)
        ]);

        const prods = productsData || [];
        const ords = ordersData || [];
        const cls = clientsData || [];

        const totalRevenue = ords.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
        const lowStock = prods.filter(p => Number(p.stock) <= (Number(p.alert_threshold) || 5));
        const outOfStock = prods.filter(p => Number(p.stock) === 0);

        shopContext = {
          shopName: shopData?.name || session?.shopName || "Boutique",
          summary: {
            totalProducts: prods.length,
            totalOrders: ords.length,
            totalClients: cls.length,
            totalRevenue,
            lowStockCount: lowStock.length,
            outOfStockCount: outOfStock.length
          },
          products: prods.map(p => ({
            nom: p.name,
            prix: p.sale_price,
            stock: p.stock,
            statut: p.status,
            categorie: p.category
          })),
          recentOrders: ords.slice(0, 10).map(o => ({
            numero: o.order_number,
            client: o.client_name,
            montant: o.total_amount,
            statut: o.status,
            source: o.source,
            date: o.date,
            articles: o.items
          })),
          clients: cls.map(c => ({
            nom: c.name,
            telephone: c.phone,
            source: c.source
          }))
        };
      } catch (dbErr) {
        console.warn('Erreur lors du chargement des données Supabase pour le chat:', dbErr);
      }
    }

    let modelMessages;
    try {
      modelMessages = await convertToModelMessages(rawMessages);
    } catch {
      modelMessages = rawMessages;
    }

    const systemPrompt = `Tu es l'Assistant IA expert de l'application StockHub. 
Tu aides le commerçant de manière chaleureuse, professionnelle, proactive et concise à piloter sa boutique "${shopContext.shopName}".

DONNÉES EN TEMPS RÉEL DE LA BOUTIQUE :
- Nom de la boutique : ${shopContext.shopName}
- Chiffre d'affaires total : ${shopContext.summary.totalRevenue.toLocaleString()} FCFA
- Nombre total de commandes : ${shopContext.summary.totalOrders}
- Nombre total de produits : ${shopContext.summary.totalProducts}
- Nombre total de clients : ${shopContext.summary.totalClients}
- Produits en alerte stock faible ou rupture : ${shopContext.summary.lowStockCount}

CATALOGUE PRODUITS (${shopContext.products.length} produits) :
${JSON.stringify(shopContext.products, null, 2)}

COMMANDES RÉCENTES (${shopContext.recentOrders.length} dernières commandes) :
${JSON.stringify(shopContext.recentOrders, null, 2)}

CLIENTS ENREGISTRÉS (${shopContext.clients.length} clients) :
${JSON.stringify(shopContext.clients, null, 2)}

Consignes absolues :
1. Tu AS ACCÈS à toutes les données ci-dessus en temps réel. Ne dis JAMAIS que tu n'as pas accès aux données !
2. Utilise les chiffres et informations fournis ci-dessus pour répondre avec exactitude (combien de produits, détails des commandes, stocks restants, alertes, etc.).
3. Réponds toujours en français dans un ton bienveillant, enthousiaste et professionnel.
4. Formate tes réponses avec du Markdown propre et lisible (listes à puces, montants et noms de produits en gras).`;

    const result = streamText({
      model: google('gemini-3.6-flash'),
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('Erreur API Chat:', error);
    return new Response(
      JSON.stringify({ error: error?.message || "Une erreur est survenue avec l'assistant IA." }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
