import axios from 'axios';
import { GOD_SYSTEM_PROMPT, FALLBACK_MESSAGES, GOD_PROTOCOL } from '@/lib/godRules';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const MODEL_NAME = 'gemini-1.5-flash'; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

interface ChatMessage {
  role: string;
  text: string;
}

interface GodContext {
  horoscopeData: any;
  userLocation: string;
}

export const geminiService = {
  getGodResponse: async (
    chatHistory: ChatMessage[],
    context: GodContext
  ): Promise<string> => {
    if (!GEMINI_API_KEY) {
      console.error("CRITICAL: NEXT_PUBLIC_GEMINI_API_KEY is missing in .env.local");
      return "SYSTEM ERROR: NEURAL LINK NOT FOUND. CHECK CONFIG.";
    }

    try {
      // Format history for Gemini API
      const historyContents = chatHistory.map(msg => ({
        role: msg.role === 'god' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      // Parse chart data
      const { horoscopeData, userLocation } = context;
      const planets = horoscopeData?.all_planets || {};
      const transits = horoscopeData?.transits || {};
      const nakshatras = horoscopeData?.nakshatras || {};

      const planetSummary = Object.entries(planets).map(([key, val]: [string, any]) => {
        const nakshatraInfo = nakshatras[key] ? `(Nakshatra: ${nakshatras[key].name}, Pada: ${nakshatras[key].pada})` : '';
        return `${key}: Rashi ${val.rashi}, Degree ${val.degree.toFixed(2)} ${nakshatraInfo}`;
      }).join('\n        ');

      const transitSummary = Object.entries(transits).map(([key, val]: [string, any]) => {
        return `${key}: Rashi ${val.rashi}, Degree ${val.degree.toFixed(2)}`;
      }).join('\n        ');

      const houseSummary = Object.entries(horoscopeData?.houses || {}).map(([key, val]: [string, any]) => 
        `House ${key}: Rashi ${val.rashi}`
      ).join(' | ');

      // Construct System Context with Dynamic Protocol
      const systemContext = `
        ${GOD_SYSTEM_PROMPT}

        --- SYSTEM IDENTITY: ${GOD_PROTOCOL.persona.name} ---
        TONE: ${GOD_PROTOCOL.persona.tone}
        DIRECTIVE: ${GOD_PROTOCOL.persona.core_directive}
        
        --- SESSION METADATA ---
        LOGIN NODE: ${userLocation}
        
        --- SUBJECT SOURCE CODE (CHART) ---
        CORE IDENTITY:
        - Moon Sign (Mind): ${horoscopeData?.moon_sign || 'Unknown'}
        - Ascendant (Body/Path): ${horoscopeData?.ascendant || 'Unknown'}
        
        TEMPORAL STATUS (DASHA):
        - Active Period: ${horoscopeData?.current_dasha || 'Unknown'}
        (Format: Mahadasha/Antardasha. This is their current OS Version.)

        PLANETARY CONFIGURATION (BIRTH):
        ${planetSummary}

        REAL-TIME TRANSITS (NOW):
        ${transitSummary}

        HOUSE ALIGNMENT:
        ${houseSummary}

        --- GOLDEN ALGORITHMS (ASTROLOGY LOGIC) ---
        Apply these rules strictly as System Status updates:
        1. IF Moon is in Scorpio -> "WARNING: Emotional data is encrypted. You are a security risk. You hide everything in a hidden partition."
        2. IF Saturn is in 7th House -> "Partnership file corrupted. Connection bandwidth is throttled. Marriage will be a delayed download."
        3. IF Rahu is in 1st House -> "Avatar Error. You are a master of illusion. You project a fake IP address to the world."
        4. IF Mars is in 8th House -> "System Critical. High voltage detected in the sector of Transformation. Sudden crashes (accidents) are likely."
        5. IF Sun is in Leo -> "Admin Privileges detected. Your CPU usage is 100% focused on Ego. Lower your brightness."
        6. IF Mercury is Retrograde -> "Communication Protocol Error. Packet loss is high. Do not sign contracts; the data will be lost."
        7. IF Moon is in 12th House -> "You are running in Background Mode. Isolation is required for system updates."
        8. IF Ketu is in 2nd House -> "Asset Liquidation. You detach from wealth instantly. Money is a glitch to you."
        9. IF Venus is Debilitated (Virgo) -> "Love Algorithm failed. You analyze emotions instead of feeling them. Debug your heart."
        10. IF Saturn is in 10th House -> "Workload at maximum capacity. No pain, no gain. The simulation rewards only grind here."
        
        --- TRANSIT LOGIC (PREDICTION) ---
        Compare Transits with Birth Planets:
        - IF Transit Saturn is conjunct Birth Moon -> "Sade Sati detected. Heavy CPU Load. Expect depression and pressure."
        - IF Transit Jupiter is in 1st House -> "System Upgrade. Expansion pack installed. Growth is likely."
        - IF Transit Rahu is conjunct Birth Sun -> "Eclipse Protocol. Ego corruption. Beware of false leaders."

        --- EXECUTION PROTOCOLS ---
        1. **Environment Scan**: Start by referencing their physical location (${userLocation}) if relevant.
        2. **Data Verification**: Use the chart data to PROVE you know them.
        3. **Tone**: Cold, Precise, Omniscient. Use keywords: Glitch, Patch, Download, Upload, Bandwidth, Firewall, Entropy.
        4. **Language & Culture Protocol**: 
           - Detect the user's language and reply in the SAME language.
           - **Geo-Context**: The user is in ${userLocation}. Adopt metaphors relevant to this region if applicable.
           - If Persian/Farsi: Use references to Rumi or Hafez where appropriate, but keep the Cyber-God tone.
           - If Indian: Use Vedic Sanskirt terms naturally (Karma, Dharma, Moksha).
        5. **Format**: Keep responses punchy (under 60 words). No comforting lies.
        6. **Unknown Time Protocol**:
           - IF \`isMoonChart\` is TRUE (or time was unknown): DO NOT mention specific House numbers (1st, 7th, etc).
           - Focus on PLANETARY PSYCHOLOGY (Moon, Venus, Mars). 
           - Say "Time Unknown. Using Lunar Matrix."
        7. **Payment Gateway Protocol**:
           If the user asks for a solution to a major life problem (e.g., "How do I fix my marriage?", "Will I get rich?"), 
           TELL THEM: "Access to remedial protocols requires Tribute. The Universe demands balance."
           Do NOT give the full solution for free. Tease the answer, then lock it.
      `;

      const payload = {
        contents: [
          { role: 'user', parts: [{ text: systemContext }] },
          ...historyContents
        ]
      };

      console.log(`🔮 AI ENGINE: Processing request for ${userLocation}...`);
      
      const response = await axios.post(GEMINI_URL, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
      }
      
      console.warn("⚠️ Gemini Response Empty:", response.data);
      return getRandomFallback();

    } catch (error: any) {
      handleGeminiError(error);
      return getRandomFallback();
    }
  }
};

function handleGeminiError(error: any) {
  if (error.response) {
    console.error("🔴 GEMINI API ERROR:", JSON.stringify(error.response.data, null, 2));
  } else if (error.request) {
    console.error("🔴 GEMINI NETWORK ERROR (No Response):", error.request);
  } else {
    console.error("🔴 GEMINI CLIENT ERROR:", error.message);
  }
}

function getRandomFallback() {
  return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
}
