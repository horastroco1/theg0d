import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// This now expects an OpenRouter Key (sk-or-...)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const BASE_URL = `https://openrouter.ai/api/v1/chat/completions`;

async function testOpenRouter() {
  console.log("🧪 STARTING OPENROUTER API TEST...");

  if (!GEMINI_API_KEY) {
    console.error("❌ CRITICAL: GEMINI_API_KEY is missing in .env.local");
    process.exit(1);
  }

  console.log(`🔑 Key found: ${GEMINI_API_KEY.substring(0, 8)}...`);

  try {
    console.log(`📡 Listing available models...`);
    const listResponse = await axios.get('https://openrouter.ai/api/v1/models');
    const models = listResponse.data?.data?.filter((m: any) => m.id.includes('gemini')).map((m: any) => m.id) || [];
    console.log(`✅ Available Gemini Models:`);
    models.forEach((m: string) => console.log(`   - ${m}`));
    
    const validModel = models[0] || 'google/gemini-2.0-flash-exp:free';
    console.log(`👉 Selecting: ${validModel}`);
    
    // ... continue with test using validModel
    const payload = {
        model: validModel,
        messages: [
            { role: 'user', content: "System Status Check. Reply with 'ONLINE'." }
        ]
    };

    console.log(`📡 Sending request to [${validModel}] via OpenRouter...`);
    const response = await axios.post(BASE_URL, payload, {
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMINI_API_KEY}`,
          'HTTP-Referer': 'https://localhost:3000',
          'X-Title': 'Test Script'
      }
    });
    
    // ... rest of success handling
    const reply = response.data?.choices?.[0]?.message?.content;
    if (reply) {
      console.log(`✅ SUCCESS! AI Responded: "${reply.trim()}"`);
    }

  } catch (error: any) {
      // ... error handling
      console.error("❌ API ERROR:", error.message);
      if (error.response) console.error("Data:", error.response.data);
  }
}

testOpenRouter();