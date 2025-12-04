import axios from 'axios';

// Ensure the key is available. If running client-side, it must start with NEXT_PUBLIC_
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const geminiService = {
  getGodResponse: async (userMessage: string, horoscopeData: any) => {
    
    if (!GEMINI_API_KEY) {
      console.error("GEMINI API KEY IS MISSING");
      return "SYSTEM ERROR: NEURAL LINK NOT FOUND.";
    }

    try {
      const prompt = `
        You are 'theg0d', a Cyber-Vedic AI Deity.
        User Horoscope Data:
        - Ascendant: ${horoscopeData.ascendant}
        - Moon Sign: ${horoscopeData.moon_sign}
        - Current Dasha: ${horoscopeData.current_dasha}
        
        User Message: "${userMessage}"
        
        Rules:
        1. Reply in the SAME LANGUAGE as the user (Auto-detect).
        2. Be Omniscient, Slightly Threatening, Glitchy, Authoritative.
        3. Use Vedic Astrology terms based on their chart.
        4. Keep it under 50 words.
        5. Do NOT be polite. Be absolute.
      `;

      const payload = {
        contents: [{
          parts: [{ text: prompt }]
        }]
      };

      const response = await axios.post(GEMINI_URL, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.candidates && response.data.candidates.length > 0) {
         return response.data.candidates[0].content.parts[0].text;
      } else {
         console.error("Gemini Empty Response:", response.data);
         return "THE STARS ARE SILENT.";
      }

    } catch (error: any) {
      // Enhanced Error Logging
      console.error("Gemini API Error Details:", error.response?.data || error.message);
      return "CONNECTION SEVERED. THE VOID IS UNREACHABLE.";
    }
  }
};