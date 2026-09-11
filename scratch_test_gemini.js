const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const { generateText } = require('ai');

async function test() {
  const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: 'Bonjour',
    });
    console.log("Success:", text);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
