import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

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
          error: "Clé API introuvable. Veuillez ajouter GOOGLE_GENERATIVE_AI_API_KEY ou GEMINI_API_KEY dans les variables d'environnement Vercel."
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const google = createGoogleGenerativeAI({ apiKey });

    const body = await req.json();
    const messages = body.messages ?? [];
    const shopData = body.data ?? {};

    const systemPrompt = `Tu es l'Assistant IA expert de l'application StockHub. 
Tu aides le commerçant avec enthousiasme et précision à analyser ses ventes, gérer son stock et piloter sa boutique.
Voici les données réelles et actuelles de sa boutique :
${JSON.stringify(shopData, null, 2)}

Consignes :
1. Réponds toujours en français de manière chaleureuse, professionnelle et concise.
2. Utilise les chiffres et informations fournis dans les données JSON ci-dessus pour répondre avec exactitude.
3. Si une information n'est pas présente dans les données fournies, mentionne-le poliment.
4. Formate tes réponses avec du Markdown propre (listes à puces, mise en gras des montants ou noms de produits).`;

    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages,
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
