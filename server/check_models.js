// Run this file using: node check_models.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log("Checking available models for your API Key...");
    const models = await genAI.getGenerativeModel({ model: "gemini-pro" }).apiKey; // Dummy call to init
    
    // Actually fetching the list needs the model manager
    // But a simpler way to debug 404 is just to print the key status:
    console.log("API Key found:", process.env.GEMINI_API_KEY ? "YES" : "NO");

    // Let's try to hit the API with a fallback model that ALWAYS exists
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello");
    console.log("Success! 'gemini-pro' works.");
    console.log("If this works but 'flash' failed, your account might not have Flash access yet.");
  } catch (error) {
    console.error("Error Details:", error.message);
    if (error.message.includes("404")) {
      console.log("--- DIAGNOSIS ---");
      console.log("The API Key is valid, but the Model Name is rejected.");
      console.log("Try using 'gemini-pro' in your main code temporarily.");
    }
  }
}

listModels();