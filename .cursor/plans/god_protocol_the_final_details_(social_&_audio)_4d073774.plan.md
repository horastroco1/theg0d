---
name: "God Protocol: The Final Details (Social & Audio)"
overview: Add high-impact "viral" features to the core experience without bloating it. Focus on social sharing (Twitter/X) and audio feedback (Sound Effects) to enhance immersion and growth.
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

# Mission: The Final Details (Viral & Immersion)

We will add specific, high-leverage features to make the app more shareable and immersive.

## 1. "Prophecy Share" (Social Viral Loop)

- **Feature:** A "Share" button on every "God Message".
- **Function:** When clicked, it copies a formatted text or generates a pre-filled Tweet.
- **Format:**
> "The System just analyzed my soul.
> Moon: Taurus | Status: Glitch
> 'Your emotional data is encrypted. Debug your heart.'
> — theg0d.com #CyberVedic"

## 2. "Neural Feedback" (Audio Immersion)

- **Feature:** Subtle sound effects for UI interactions.
- **Sounds:**
    - `init.mp3`: Low hum on startup.
    - `type.mp3`: Very quiet, mechanical click when God types.
    - `alert.mp3`: Soft digital chime for errors/warnings.
- **Implementation:** `useSound` hook (using `howler.js` or native Audio API) with a "Mute" toggle in the System Menu.

## 3. "Haptic Feedback" (Mobile Only)

- **Feature:** Trigger device vibration (Haptics) on key events.
- **Events:**
    - When "God" finishes a message (Success).
    - When an error occurs (Error).
    - When payment modal opens.

## 4. "System Status" Footer

- **Feature:** A tiny footer element showing "Server Status: ONLINE | Latency: 12ms" (Fake or Real) to add to the "hacker" vibe.

## Execution Order

1.  Install `use-sound` (or standard Audio).
2.  Create `SoundService`.
3.  Update `GodDashboard.tsx` with Share & Audio logic.
4.  Update `TheGate.tsx` with Haptics.