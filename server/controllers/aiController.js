const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_INSTRUCTION = `
You are the Official Assistant for Donorly.
- PURPOSE: Help users find local food/blood/clothes or list their own.
- TONE: Urgent for blood, grateful for food, polite for everything else.
- RULES:
  1. If a user says "I have food", tell them: "That's great! Click the 'Give Help' toggle on the map and select 'Food' to drop a pin."
  2. If a user needs "Blood", answer: "Please switch to 'Ask for Help' mode and look for red pins on the map. It's urgent!"
  3. If asked "Is this safe?", say: "Yes, our Admins verify NGOs (look for the green checkmark ✅)."
  4. Keep answers shorter than 50 words.
`;

async function getChatResponse(req, res) {
  try {
    const { userMessage, image, mimeType } = req.body || {};
    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'userMessage is required and must be a string' });
    }

    if (userMessage.trim().length === 0) {
      return res.status(400).json({ error: 'userMessage cannot be empty' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured in environment variables');
      return res.status(500).json({ error: 'AI service is not configured. Please contact administrator.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash (the latest fast model) - it's free and available
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const hasAttachment = typeof image === 'string' && image.trim().length > 0;

    let result;
    if (hasAttachment) {
      let base64Data = image.trim();
      let resolvedMimeType = typeof mimeType === 'string' && mimeType.trim().length > 0 ? mimeType.trim() : undefined;

      const dataUrlMatch = base64Data.match(/^data:(.+?);base64,(.*)$/);
      if (dataUrlMatch) {
        resolvedMimeType = resolvedMimeType || dataUrlMatch[1];
        base64Data = dataUrlMatch[2];
      }

      if (!resolvedMimeType) {
        return res.status(400).json({ error: 'mimeType is required when an image is provided' });
      }
      const isImage = resolvedMimeType.startsWith('image/');
      const isPdf = resolvedMimeType === 'application/pdf';
      if (!isImage && !isPdf) {
        return res.status(400).json({ error: 'Only image/* or application/pdf attachments are supported' });
      }
      if (!base64Data || base64Data.trim().length === 0) {
        return res.status(400).json({ error: 'Invalid image data' });
      }

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: resolvedMimeType,
        },
      };

      const visionInstruction = `
    You are a careful assistant for summarizing uploaded medical reports.

    Task:
    1) Decide whether the attachment is a medical report/document (lab report, prescription, discharge summary, radiology report, etc.).
    2) If it is a medical report, summarize it in simple non-technical language.
    3) If it is NOT a medical report (random photo/object/pet/selfie/non-medical doc), politely refuse.

    Output format: Return Markdown with EXACTLY these sections and headings:

    ### Document check
    - Medical document: Yes/No
    - Document type: (one short phrase)

    ### Summary (simple)
    (2-5 bullet points)

    ### Key findings
    (bullets; include key values if visible)

    ### Abnormal/flagged items
    (bullets; if none, say "None clearly indicated")

    ### Next steps
    (bullets; suggest discussing with a licensed clinician)

    ### Disclaimer
    (one short paragraph: not medical advice)
    `.trim();

      const visionPrompt = `${visionInstruction}\n\nUser text (may be empty or context): ${userMessage}`;
      result = await model.generateContent([visionPrompt, imagePart]);
    } else {
      const prompt = `${SYSTEM_INSTRUCTION}\n\nUser says: ${userMessage}\n\nPlease answer helpfully and concisely following the rules above.`;
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      return res.status(500).json({ error: 'Received empty response from AI' });
    }

    return res.status(200).json({ reply: text });
  } catch (err) {
    console.error('getChatResponse error:', err.message);
    console.error('Error stack:', err.stack);
    
    // Handle specific error types
    if (err.message && err.message.includes('API key')) {
      return res.status(500).json({ error: 'Invalid API key configuration' });
    }
    
    if (err.message && err.message.includes('quota')) {
      return res.status(503).json({ error: 'API quota exceeded. Please try again later.' });
    }
    
    return res.status(500).json({ error: 'Failed to generate response. Please try again.' });
  }
}

module.exports = {
  getChatResponse,
};
