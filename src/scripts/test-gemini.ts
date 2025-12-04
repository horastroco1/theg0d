import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models`;

async function testGemini() {
  console.log("🧪 STARTING GEMINI API TEST...");

  if (!GEMINI_API_KEY) {
    console.error("❌ CRITICAL: GEMINI_API_KEY is missing in .env.local");
    process.exit(1);
  }

  console.log(`🔑 Key found: ${GEMINI_API_KEY.substring(0, 5)}...`);

  const model = 'gemini-1.5-flash';
  const url = `${BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
  
  const payload = {
    contents: [{ role: 'user', parts: [{ text: "System Status Check. Reply with 'ONLINE'." }] }]
  };

  try {
    console.log(`📡 Sending request to [${model}]...`);
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (reply) {
      console.log(`✅ SUCCESS! AI Responded: "${reply.trim()}"`);
    } else {
      console.warn("⚠️ Response empty but no error thrown:", response.data);
    }

  } catch (error: any) {
    console.error("❌ API ERROR:");
    if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
        console.error(`   Message: ${error.message}`);
    }
  }
}

testGemini();
