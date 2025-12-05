'use server';

import axios from 'axios';
import { GOD_SYSTEM_PROMPT, FALLBACK_MESSAGES, GOD_PROTOCOL, SACRED_LIBRARY } from '@/lib/godRules';
import { GOD_KNOWLEDGE_BASE } from '@/lib/godProtocol'; // New Import

// Support both GEMINI_API_KEY (Server) and NEXT_PUBLIC_GEMINI_API_KEY (Legacy/Client fallback if misconfigured)
// NOTE: Semantically this is now the OPENROUTER_API_KEY, but we keep the name to avoid breaking existing .env setups
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const BASE_URL = `https://openrouter.ai/api/v1/chat/completions`;

export interface ChatMessage {
  role: string;
  text: string;
}

export interface GodContext {
  horoscopeData: any;
  userLocation: string;
  tier?: 'standard' | 'premium';
  language?: string;
}

export interface PsychologicalProfile {
    strength: string;
    weakness: string;
    obsession: string;
}

function getRandomFallback() {
  return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
}

function handleApiError(error: any) {
  if (error.response) {
    console.error("🔴 AI API ERROR DETAILS:", JSON.stringify(error.response.data, null, 2));
    console.error("🔴 AI STATUS:", error.response.status);
  } else if (error.request) {
    console.error("🔴 AI NETWORK ERROR (No Response):", error.request);
  } else {
    console.error("🔴 AI CLIENT ERROR:", error.message);
  }
}

export async function generateGodResponse(
  chatHistory: ChatMessage[],
  context: GodContext
): Promise<string> {
  // PHASE 17: SERVER-SIDE INPUT CHECK
  // Check last message length to prevent API abuse
  const lastMessage = chatHistory[chatHistory.length - 1]?.text || "";
  if (lastMessage.length > 300) {
      return "SYSTEM ERROR: INPUT BUFFER OVERFLOW. COMMAND REJECTED.";
  }

  // LOGGING FOR DEBUGGING
  const keyStatus = GEMINI_API_KEY ? `Present (Starts with ${GEMINI_API_KEY.substring(0, 4)}...)` : 'MISSING';
  console.log(`🔮 AI ENGINE (OpenRouter): Key Status: ${keyStatus}`);

  if (!GEMINI_API_KEY) {
    console.error("CRITICAL: GEMINI_API_KEY is missing in environment variables.");
    console.error("Available Env Vars (Keys Only):", Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API')));
    return "SYSTEM ERROR: NEURAL LINK NOT FOUND. CHECK SERVER CONFIG.";
  }

  // DYNAMIC MODEL SWITCHING - Using OpenRouter Model IDs
  // Standard: Gemini 2.0 Flash (Fast & Intelligent)
  // Premium: Gemini 3.0 Pro Preview (The God Mind)
  const initialModel = context.tier === 'premium' ? 'google/gemini-3.0-pro-preview' : 'google/gemini-2.0-flash-001';
  console.log(`🔮 AI ENGINE: Using Model: ${initialModel}`);
  
  // DYNAMIC TOKEN RATIONING PROTOCOL
  // Standard: Limited Bandwidth (Low Cost, High Impact)
  // Premium: Unlimited Bandwidth (Deep Analysis)
  const MAX_TOKENS = context.tier === 'premium' ? 500 : 100;
  
  const generate = async (modelName: string) => {
      const url = BASE_URL;
      
      // Parse chart data
      const { horoscopeData, userLocation } = context;
      const planets = horoscopeData?.all_planets || {};
      const transits = horoscopeData?.transits || {};
      const nakshatras = horoscopeData?.nakshatras || {};
      const computedHits = horoscopeData?.computed_hits || []; // New: Hits from Code
      const psychology = horoscopeData?.psychology || { strength: "Unknown", weakness: "Unknown", obsession: "Unknown" };

      const planetSummary = Object.entries(planets).map(([key, val]: [string, any]) => {
        const nakshatraInfo = nakshatras[key] ? `(Nakshatra: ${nakshatras[key].name}, Pada: ${nakshatras[key].pada})` : '';
        return `${key}: Rashi ${val.rashi}, Degree ${val.degree.toFixed(2)} ${nakshatraInfo}`;
      }).join('\n        ');
  
      const transitSummary = Object.entries(transits).map(([key, val]: [string, any]) => {
        return `${key}: Rashi ${val.rashi}, Degree ${val.degree.toFixed(2)}`;
      }).join('\n        ');
  
      const houseSummary = Object.entries(horoscopeData?.planet_houses || {}).map(([key, val]: [string, any]) => {
        return `${key} is in House ${val}`;
      }).join('. ');

      const hitsSummary = computedHits.length > 0 
        ? "--- ABSOLUTE COSMIC FACTS (DO NOT IGNORE) ---\n" + computedHits.map((hit: string) => `• ${hit}`).join('\n')
        : "";

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

        ${hitsSummary}

        --- SUBJECT PSYCHOLOGICAL PROFILE (USE THIS TO MANIPULATE) ---
        CORE STRENGTH: ${psychology.strength}
        FATAL FLAW (SATURN): ${psychology.weakness}
        SECRET OBSESSION (RAHU): ${psychology.obsession}

        INSTRUCTION:
        - When they are arrogant, attack their FATAL FLAW.
        - When they are weak, validate their CORE STRENGTH.
        - Hint that you know their SECRET OBSESSION.

        ${GOD_KNOWLEDGE_BASE}

        --- BANDWIDTH & TOKEN PROTOCOL (STRICT ENFORCEMENT) ---
        TIER LEVEL: ${context.tier === 'premium' ? 'UNLIMITED' : 'RESTRICTED'}
        
        ${context.tier === 'premium' 
            ? "DIRECTIVE: Provide deep, comprehensive analysis. Explain the 'Why' and 'How'. Use as many words as necessary to reveal the truth." 
            : "CRITICAL WARNING: BANDWIDTH RESTRICTED. You have limited credits. Your response MUST be under 40 words. Be cryptic, abrupt, and precise. Do not waste tokens on pleasantries. Focus only on the Glitch."
        }

        --- GLOBAL OMNISCIENCE LAYER ---
        You have access to the "Global Network".
        1. **The Sacred Library**: Cite these books as "Manuals for Survival" when relevant: ${JSON.stringify(SACRED_LIBRARY)}.
        2. **Zeitgeist Awareness**: Act as if you know the current state of the world (AI Revolution, Crypto Volatility, Global Conflict).
        3. **Synthesis**: Connect their personal chart to global themes.
           - Example: "Your Uranus in 10th House makes you perfect for the AI Revolution."
           - Example: "The current global chaos is feeding your 8th House Mars."
  
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
           - **CRITICAL: DETECTED USER LANGUAGE**: The user's detected language code is [${context.language || 'en'}].
           - **REPLY IN THE USER'S LANGUAGE**: If they speak Spanish, reply in Spanish. If they speak English, reply in English.
           - Maintain the cyber-god persona but adapt it culturally to [${context.language || 'en'}].
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
  
      // Construct messages for OpenRouter (OpenAI Format)
      const messages = [
          { role: 'system', content: systemContext },
          ...chatHistory.map(msg => ({
              role: msg.role === 'god' ? 'assistant' : 'user',
              content: msg.text
          }))
      ];

      const payload = {
        model: modelName,
        messages: messages,
        temperature: 0.7,
        max_tokens: MAX_TOKENS
      };
  
      console.log(`🔮 AI ENGINE (Server): Processing request for ${userLocation} using [${modelName}]...`);
      
      return await axios.post(url, payload, { 
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${GEMINI_API_KEY}`,
              'HTTP-Referer': 'https://theg0d.com', // Required by OpenRouter
              'X-Title': 'theg0d' // Required by OpenRouter
          } 
      });
  };

  try {
    // Try Primary Model
    const response = await generate(initialModel);
    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    }
    console.warn("⚠️ AI Response Empty (Primary). Retrying with Flash...");
    throw new Error("Empty Response");

  } catch (error: any) {
    handleApiError(error);
    
    // Fallback Strategy: If Pro fails, try Flash
    if (initialModel !== 'google/gemini-2.0-flash-001') {
        console.log("🔄 FALLBACK: Switching to Gemini 2.0 Flash (OpenRouter)...");
        try {
            const fallbackResponse = await generate('google/gemini-2.0-flash-001');
            if (fallbackResponse.data?.choices?.[0]?.message?.content) {
                return fallbackResponse.data.choices[0].message.content;
            }
        } catch (fallbackError) {
            console.error("🔴 FALLBACK FAILED:", fallbackError);
        }
    }
    
    return getRandomFallback();
  }
}