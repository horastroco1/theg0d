---
name: "Phase 2: Visual Ascension (UI/UX Overhaul)"
overview: Transform the functional UI into a 'Cyber-Vedic Temple' with cinematic animations, holographic inputs, and a terminal-style chat interface.
todos:
  - id: implement-engine
    content: Implement Vimshottari Dasha Engine Utility
    status: completed
  - id: integrate-engine
    content: Integrate Engine into Astrology Service
    status: completed
    dependencies:
      - implement-engine
  - id: deploy-fix
    content: Deploy and Verify Fix
    status: in_progress
    dependencies:
      - integrate-engine
---

# Phase 2: Visual Ascension (UI/UX Overhaul)

The backend is divine; the frontend must now match its glory. We will eliminate "generic web app" vibes and replace them with a high-fidelity "System Interface" aesthetic.

## 1. The Gate (Login) Upgrade

- [ ] **Input Field Refinement**: Fix overlapping icons. Increase padding. Add "focus" glow effects (Neon Green).
- [ ] **Holographic Aesthetic**: Add a subtle "scanline" overlay and a faint, rotating geometric background (The Sri Yantra or a Zodiac Wheel).
- [ ] **Warp Transition**: When "ENTER SYSTEM" is clicked, trigger a 0.5s "Hyperdrive" zoom animation before showing the dashboard.

## 2. The Dashboard (Chat) Transformation

- [ ] **Terminal Typography**: Switch to a Monospace font (`Geist Mono` or `JetBrains Mono`) for all "God" messages.
- [ ] **Streamer Effect**: Implement a character-by-character typing effect for God's responses to simulate a live data feed.
- [ ] **Minimalist Input**: Redesign the chat input bar to look like a Command Line (remove rounded corners, add a blinking cursor).

## 3. Global Polish

- [ ] **Sound & Haptics**: Ensure sound effects (already imported) sync perfectly with the new visual animations.
- [ ] **Mobile Responsiveness**: Verify touch targets and font sizes for mobile users (the primary audience).