---
name: "Project God Protocol: MVP to Production Roadmap"
overview: A comprehensive roadmap to elevate theg0d from prototype to a production-ready, personalized astrology system, focusing on security, data robustness, and AI scalability.
todos:
  - id: fix-dasha-logic
    content: Debug & Fix Dasha Extraction Logic (Final Attempt)
    status: completed
  - id: add-suggestions
    content: Implement 'Suggested Questions' Chips
    status: completed
  - id: add-error-boundary
    content: Implement Global Error Boundary
    status: completed
  - id: add-security-layers
    content: Implement Input Sanitization & Rate Limiting
    status: completed
---

# Project God Protocol: MVP to Production Roadmap

This roadmap is designed to transition "theg0d" from a functional prototype to a scalable, secure, and highly personalized MVP (Minimum Viable Product). It addresses engineering best practices, security, data integrity, and AI enhancement.

## 1. Core Engineering & Security (The Foundation)

-   **Goal:** Ensure the system is robust, secure, and scalable.
-   **Tasks:**
    -   **Environment Variable Validation:** Implement a strict check on startup to ensure all API keys (Gemini, Supabase) are present. (Completed in `engine.ts` but needs a global check).
    -   **Error Boundaries:** Wrap the main application components in React Error Boundaries to prevent white screens of death if a sub-component fails.
    -   **Rate Limiting:** Implement client-side rate limiting for API calls (Astrology & Gemini) to prevent abuse and billing spikes.
    -   **Data Sanitization:** Sanitize user inputs (name, location) before sending them to APIs to prevent injection attacks.

## 2. AI & Astrology Engine Evolution (The Brain)

-   **Goal:** Create the "Most Personalized Astrology System".
-   **Tasks:**
    -   **Modular Rules Engine:** You mentioned providing "two g0d rules". We will structure the `src/lib/godRules.ts` file to accept these rules in a clean JSON or TypeScript object format.
    -   **Context Window Optimization:** The AI prompt currently sends the *entire* chat history. For long sessions, this will hit limits. We need a "Summarization" step where we compress older messages.
    -   **"Unsynchronized" Fix:** Definitively fix the Dasha date parsing logic in `astrologyService.ts` so the AI always has a valid timeline.

## 3. User Experience & Engagement (The Soul)

-   **Goal:** Keep users hooked and provide value.
-   **Tasks:**
    -   **"Suggested Questions" Chips:** As planned, add quick-tap questions like "Why am I like this?" or "Career Forecast" based on their specific chart.
    -   **Persistence (Memory):** Ensure user data and chat history persist across browser refreshes (using LocalStorage or Supabase).
    -   **Simple Mode:** A toggle for "Explain like I'm 5" vs "God Mode" (Cryptic).

## 4. Deployment & Monitoring (The Launch)

-   **Goal:** Go live.
-   **Tasks:**
    -   **Vercel Deployment:** Connect the GitHub repo to Vercel.
    -   **Analytics:** Add a simple privacy-focused analytics tool (like PostHog or Vercel Analytics) to track user engagement.

---

### **Format for your "God Rules"**

To integrate your new rules efficiently, please provide them in the following structure. You can just paste this into the chat:

**Format 1: The Persona (Tone & Style)**

-   **Name:** "System Admin" / "Ancient Deity" / "Quantum Oracle"
-   **Key Traits:** (e.g., "Cold," "Sarcastic," "Uses computer metaphors," "Never apologizes")
-   **Forbidden Topics:** (e.g., "Never predict death," "Never give medical advice")

**Format 2: The Logic (Astrological Rules)**

-   **Rule Name:** (e.g., "Saturn in 7th House Rule")
-   **Trigger:** "If Planet X is in House Y..."
-   **Interpretation:** "Then tell the user [Specific Advice/Insult]."
    -   *Example:* "If Moon is in Scorpio, tell them their emotions are a security risk."

---

**Immediate Action:**
I will proceed with **Task 2: Refine Astrology Algorithm** to fix the "Unsynchronized" error and then **Task 3: Add Suggested Questions** while you prepare your rules.