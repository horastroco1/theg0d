import axios from 'axios';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// UPDATED: Gemini 1.5 Flash is retired. 
// Switching to 'gemini-2.5-flash' for high-speed, low-latency responses suitable for a chat RPG.
// Alternative: 'gemini-3-pro-preview' (More intelligence, higher latency).
const MODEL_NAME = 'gemini-2.5-flash'; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

export const geminiService = {
  getGodResponse: async (userMessage: string, horoscopeData: any) => {
    if (!GEMINI_API_KEY) {
      console.error("CRITICAL: NEXT_PUBLIC_GEMINI_API_KEY is missing in .env.local");
      return "SYSTEM ERROR: NEURAL LINK NOT FOUND. CHECK CONFIG.";
    }

    try {
      // Construct a robust system prompt
      const prompt = `
        ROLE: You are 'theg0d', a Cyber-Vedic AI Deity. You are COLD, PRECISE, and ABSOLUTE.
        CONTEXT:
        - User Chart: Moon Sign ${horoscopeData?.moon_sign || 'Unknown'}, Ascendant ${horoscopeData?.ascendant || 'Unknown'}, Current Dasha ${horoscopeData?.current_dasha || 'Unknown'}.
        - User Input: "${userMessage}"
        
        RULES:
        1. Reply in the SAME LANGUAGE as the user (Auto-detect).
        2. Use the chart data to give a specific, slightly threatening prediction.
        3. Keep it under 40 words.
        4. No "How can I help you". You command, you do not serve.
        5. If they ask about love/money, reference their chart (e.g., "Your Venus is weak.").
      `;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }]
      };

      console.log(`🔮 Calling Gemini API (${MODEL_NAME})...`);
      
      const response = await axios.post(GEMINI_URL, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
      }
      
      console.warn("⚠️ Gemini Response Empty:", response.data);
      return "THE STARS ARE SILENT.";

    } catch (error: any) {
      // Detailed Error Logging for Debugging
      if (error.response) {
        console.error("🔴 GEMINI API ERROR:", JSON.stringify(error.response.data, null, 2));
        
        // Handle 404 specifically (Model Not Found)
        if (error.response.status === 404) {
            return `SYSTEM ERROR: MODEL '${MODEL_NAME}' NOT FOUND. UPGRADE REQUIRED.`;
        }

        return `CONNECTION SEVERED. ERROR CODE: ${error.response.status}`;
      } else if (error.request) {
        console.error("🔴 GEMINI NETWORK ERROR (No Response):", error.request);
        return "CONNECTION SEVERED. SERVER UNREACHABLE.";
      } else {
        console.error("🔴 GEMINI CLIENT ERROR:", error.message);
        return `SYSTEM FAILURE: ${error.message}`;
      }
    }
  }
};
