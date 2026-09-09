import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const shopData = body.data ?? {};

    const systemPrompt = `Tu es l'Assistant IA de l'application StockHub. 
Tu aides le commerçant à analyser ses ventes, gérer son stock et répondre à ses questions.
Voici les données de sa boutique (format JSON) :
${JSON.stringify(shopData)}

Consignes :
1. Analyse les données fournies pour répondre aux questions.
2. Si une donnée manque, dis-le clairement.
3. Sois concis, professionnel et direct dans tes réponses. N'invente jamais de chiffres.
4. Tu peux utiliser du Markdown pour formater ta réponse (gras, listes).`;

    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse({
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Erreur API Chat:', error);
    return new Response(
      JSON.stringify({ error: "Une erreur est survenue avec l'assistant IA." }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
