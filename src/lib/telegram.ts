export async function sendAdminTelegram(text: string) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!token || !chatId) {
      console.warn("⚠️ Configuration Telegram manquante. Le message n'a pas été envoyé.");
      return false;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });

    if (!response.ok) {
      console.error(`Erreur Telegram: ${response.status} ${response.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    // Ne jamais bloquer le thread principal avec une exception Telegram
    console.error("Erreur critique lors de l'envoi du message Telegram:", error);
    return false;
  }
}
