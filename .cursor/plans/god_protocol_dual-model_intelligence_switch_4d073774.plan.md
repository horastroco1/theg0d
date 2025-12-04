---
name: "God Protocol: Dual-Model Intelligence Switch"
overview: Implement a dual-model architecture where standard chat uses the fast/cheap 'gemini-1.5-flash' model, while paid "Deep Scan" requests dynamically switch to the powerful 'gemini-1.5-pro' model for superior analysis.
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

# Mission: Dual-Model Intelligence Switch

We will differentiate the "Free" vs. "Paid" experience by using different AI brains.

## 1. Update AI Engine (`src/lib/ai/engine.ts`)

- **Variable Models**: Change `MODEL_NAME` from a constant to a variable parameter.
- **Function Signature**: Update `getGodResponse` to accept an optional `tier` argument (`'standard' | 'premium'`).
- **Logic**:
    - If `tier === 'premium'`, use `gemini-1.5-pro`.
    - Else, use `gemini-1.5-flash`.

## 2. Update Dashboard Logic (`src/components/GodDashboard.tsx`)

- **Track Paid Status**: We already have payment logic. We need to link it to the next message sent.
- **The "Deep Scan" Flow**:

    1. User clicks "Deep Scan ($10)".
    2. User pays (QR Code).
    3. On success, set a temporary state `isPremiumAccess = true`.
    4. The *next* message sent by the user triggers the `premium` tier in the API call.
    5. Reset `isPremiumAccess = false` after the response (one-time use) or keep it for 24h (better value).

## 3. Prompt differentiation

- **Flash (Standard)**: "Be punchy, witty, and brief. Maximum 60 words."
- **Pro (Premium)**: "Be analytical, profound, and detailed. Use 3 paragraphs. Cross-reference multiple planetary transits."

## 4. Visual Feedback

- When "Pro" mode is active, change the UI slightly (e.g., Gold Border instead of Green) to show they are in "High Bandwidth" mode.