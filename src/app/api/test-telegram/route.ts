import { NextResponse } from 'next/server';
import { sendAdminTelegram } from '@/lib/telegram';

export async function GET() {
  try {
    const success = await sendAdminTelegram(`🤖 Test de notification StockHub Admin le ${new Date().toLocaleString('fr-FR')}`);
    
    if (success) {
      return NextResponse.json({ success: true, message: "Notification Telegram envoyée avec succès !" });
    } else {
      return NextResponse.json({ success: false, error: "L'envoi Telegram a échoué. Vérifiez vos variables d'environnement." }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
