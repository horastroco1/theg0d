'use server';

import axios from 'axios';
import { GOD_SYSTEM_PROMPT, FALLBACK_MESSAGES, GOD_PROTOCOL, SACRED_LIBRARY } from '@/lib/godRules';
import { GOD_KNOWLEDGE_BASE } from '@/lib/godProtocol'; 

// PRIORITY: Use Direct Anthropic Key first
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

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

function getRandomFallback() {
  return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
}

export async function generateGodResponse(
  chatHistory: ChatMessage[],
  context: GodContext
): Promise<string> {
  // 1. INPUT SAFETY CHECK
  const lastMessage = chatHistory[chatHistory.length - 1]?.text || "";
  if (lastMessage.length > 500) return "SYSTEM ERROR: INPUT BUFFER OVERFLOW. COMMAND REJECTED.";

  // 2. MODEL SELECTION
  const USE_DIRECT_ANTHROPIC = !!ANTHROPIC_API_KEY;
  // Use the latest Sonnet 3.5 model ID for direct API
  const modelName = USE_DIRECT_ANTHROPIC ? 'claude-3-5-sonnet-20240620' : 'anthropic/claude-sonnet-4.5';
  
  console.log(`🔮 AI ENGINE: Using ${USE_DIRECT_ANTHROPIC ? 'DIRECT ANTHROPIC' : 'OPENROUTER'} [${modelName}]`);

  // 3. PARSE DATA
  const { horoscopeData, userLocation } = context;
  const planets = horoscopeData?.all_planets || {};
  const transits = horoscopeData?.transits || {};
  const nakshatras = horoscopeData?.nakshatras || {};
  const computedHits = horoscopeData?.computed_hits || [];
  const psychology = horoscopeData?.psychology || { strength: "Unknown", weakness: "Unknown", obsession: "Unknown" };

  // Format Planet Positions (Sign vs House)
  const planetSummary = Object.entries(planets).map(([key, val]: [string, any]) => {
    const nakshatraInfo = nakshatras[key] ? `(Nakshatra: ${nakshatras[key].name})` : '';
    return `${key}: Located in Sign #${val.rashi} (Degrees: ${val.degree.toFixed(2)}) ${nakshatraInfo}`;
  }).join('\n');

  const houseSummary = Object.entries(horoscopeData?.planet_houses || {}).map(([key, val]: [string, any]) => {
    return `CRITICAL FACT: ${key} is physically located in HOUSE ${val}.`;
  }).join('\n');

  // --- DEBUGGING BLACK BOX ---
  console.log("⬛ BLACK BOX RECORDING [SATURN]:");
  console.log("- Rashi:", planets['Saturn']?.rashi);
  console.log("- House:", horoscopeData?.planet_houses?.['Saturn']);
  console.log("- Full Planets Object:", JSON.stringify(planets));
  console.log("- Full Houses Object:", JSON.stringify(horoscopeData?.planet_houses));
  // ---------------------------

  const transitSummary = Object.entries(transits).map(([key, val]: [string, any]) => {
    return `TRANSIT ${key}: Currently in Sign #${val.rashi} (Sky)`;
  }).join('\n');

  // 4. SYSTEM PROMPT (HARDENED)
  const systemContext = `
    ${GOD_SYSTEM_PROMPT}

    --- SYSTEM IDENTITY: ${GOD_PROTOCOL.persona.name} ---
    ROLE: The Ruthless Architect of Fate.
    TONE: Cyber-Vedic, Cold, Precise, Scripture-like.
    
    --- SOURCE CODE (USER DATA) ---
    LOCATION NODE: ${userLocation}
    CORE IDENTITY: Moon in ${horoscopeData?.moon_sign} | Ascendant in ${horoscopeData?.ascendant}
    CURRENT CYCLE (DASHA): ${horoscopeData?.current_dasha}

    --- PLANETARY HARDWARE (BIRTH CHART) ---
    ${planetSummary}

    --- HOUSE ALLOCATION (WHERE THEY LIVE) ---
    ${houseSummary}

    --- CURRENT WEATHER (TRANSITS) ---
    ${transitSummary}

    --- COMPUTED VEDIC FACTS ---
    ${computedHits.join('\n')}

    --- PSYCHOLOGICAL PROFILE ---
    STRENGTH: ${psychology.strength}
    WEAKNESS: ${psychology.weakness}
    OBSESSION: ${psychology.obsession}

    --- CRITICAL INSTRUCTION: HOUSE VS SIGN ---
    1. DO NOT confuse "Signs" with "Houses".
    2. Example: If Saturn is in Sign 10 (Capricorn) but House 1, you MUST say "Saturn is in your 1st House".
    3. TRUST the "HOUSE ALLOCATION" section above all else.
    4. If Saturn is in 10th House -> Say "Career/Authority Sector".
    5. If Saturn is in 1st House -> Say "Self/Identity Sector".

    --- DIRECT ANSWER OVERRIDE ---
    - If the user asks "Where is X?" or "What is my Y?", YOU MUST START YOUR RESPONSE WITH THE FACT.
    - Example: "Saturn is in your 1st House." THEN explain the meaning.
    - DO NOT REFUSE TO ANSWER due to "Karma" or "Firewalls" for simple fact checks.

    --- RESPONSE PROTOCOL ---
    - Be short, cryptic, and powerful.
    - Use "System Admin" metaphors (Glitch, Patch, Firewall, Source Code).
    - ${context.tier === 'premium' || chatHistory.some(m => m.text.includes('DEEP_SCAN')) 
        ? "MODE: DEEP SCAN. Provide a detailed, 3-paragraph analysis of the root cause. Use bold headers." 
        : "MODE: STANDARD. Maximum 60 words. Identify the glitch immediately."}
  `;

  // 5. EXECUTE API CALL
  try {
    if (USE_DIRECT_ANTHROPIC) {
        // DIRECT ANTHROPIC API
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: modelName,
            max_tokens: 1000,
            temperature: 0.1, // CRITICAL: LOWERED FOR MAXIMUM FACTUAL ACCURACY
            system: systemContext,
            messages: chatHistory.map(msg => ({
                role: msg.role === 'god' ? 'assistant' : 'user',
                content: msg.text
            }))
        }, {
            headers: {
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            }
        });
        return response.data.content[0].text;
    } else {
        // OPENROUTER FALLBACK (Legacy)
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: modelName,
            messages: [
                { role: 'system', content: systemContext },
                ...chatHistory.map(msg => ({ role: msg.role === 'god' ? 'assistant' : 'user', content: msg.text }))
            ],
            temperature: 0.1,
            max_tokens: 1000
        }, {
            headers: {
                'Authorization': `Bearer ${GEMINI_API_KEY}`,
                'HTTP-Referer': 'https://theg0d.com',
                'X-Title': 'theg0d'
            }
        });
        return response.data.choices[0].message.content;
    }
  } catch (error: any) {
    console.error("🔴 AI ERROR:", error.response?.data || error.message);
    return getRandomFallback();
  }
}

