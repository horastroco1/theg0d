---
name: Fix API Error & Input Glitch
overview: Switch the AI model back to `gemini-1.5-flash` to resolve the persistent "Interference" errors. Fix the input field visual glitches by forcing caret color and handling browser autofill styles.
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

# Mission: Stabilize Core Systems

We need to fix the AI connection errors and polish the input field visual glitch.

## 1. Restore Neural Link (Fix API Error)

- **File:** `src/lib/ai/engine.ts`
- **Action:** Change `MODEL_NAME` from `gemini-1.5-pro` to `gemini-1.5-flash`.
- **Reason:** `1.5-pro` has stricter rate limits and can be slower. `1.5-flash` is built for high-frequency chat and will stop the "Interference from Rahu" (Fallback) errors.

## 2. Debug Input Field (Fix Glitch)

- **File:** `src/app/globals.css`
- **Action:** Update `.ios-input` class.
    - Add `caret-color: #00FF41;` (Make cursor Green).
    - Add `text-white` explicitly again.
    - Add `placeholder-gray-500` for better contrast.
    - **CRITICAL:** Add the `:-webkit-autofill` override hack. Browsers turn transparent inputs *white* when autofilling, which looks like a "glitch". We will force the autofill background to match our dark theme.

## 3. Verify

- Confirm chat works without "Interference" errors.
- Confirm input looks clean even when typing or using autofill.