// Run this with: node find_models.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ No API Key found in .env");
    return;
  }

  console.log("🔍 Checking available models with Google...");
  
  // We use the generic client to fetch the list
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // This is the specific method to list models
    // Note: If your SDK is very old, this might fail, so ensure you ran 'npm install @google/generative-ai@latest'
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy init
    
    // We have to use the direct API because the SDK helper for listing is sometimes hidden
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
        console.error("❌ API Error:", data.error.message);
        return;
    }

    console.log("\n✅ SUCCESS! Here are the models you can use:");
    console.log("---------------------------------------------");
    data.models.forEach(m => {
        // We only care about models that support 'generateContent'
        if (m.supportedGenerationMethods.includes("generateContent")) {
            console.log(`Model Name: ${m.name.replace("models/", "")}`);
        }
    });
    console.log("---------------------------------------------");
    console.log("👉 Pick one of the names above and update your aiController.js");

  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
}

checkAvailableModels();