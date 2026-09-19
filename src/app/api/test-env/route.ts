import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  
  return NextResponse.json({
    tokenExists: !!token,
    tokenPrefix: token ? token.substring(0, 5) + '...' : null,
    chatIdExists: !!chatId,
    chatIdPrefix: chatId ? chatId.substring(0, 3) + '...' : null,
  });
}
