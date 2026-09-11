async function test() {
  try {
    const key = process.env.GEMINI_API_KEY.replace('AIzaSyAIzaSy', 'AIzaSy').replace('AIzaSyAQ', 'AQ');
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
