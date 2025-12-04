---
name: Apple/Grok UI Polish & Mobile Optimization
overview: Enhance the application's aesthetics to match high-end "Apple/Grok" standards and ensure flawless mobile responsiveness. This involves adding texture, refining glassmorphism, preventing mobile zoom issues, and polishing animations.
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

# Mission: Apple/Grok UI Polish & Mobile Optimization

We will refine the UI to achieve a "Cyber-Vedic Luxury" aesthetic and ensure a native-app feel on mobile devices.

## 1. Global Styling Upgrades (`src/app/globals.css`)

- **Texture**: Add a subtle noise/grain overlay to the background to reduce "flatness" and add depth.
- **Refined Glass**: Update `.ios-glass` to have a more sophisticated border gradient and improved blur.
- **Mobile Input Fix**: Ensure `.ios-input` uses `16px` font size on mobile to prevent iOS automatic zooming.
- **Scrollbars**: Refine custom scrollbars to be thinner and more elegant.

## 2. Mobile Responsiveness (`src/components/TheGate.tsx`)

- **Title Scaling**: Adjust the "theg0d" title to be responsive (smaller on mobile) to prevent overflow.
- **Input Stacking**: Ensure the date/time split inputs are touch-friendly and don't break layout on narrow screens (iPhone SE/Mini).
- **Background Elements**: Adjust the blurred orbs to be less intrusive on small screens.

## 3. Dashboard Experience (`src/components/GodDashboard.tsx`)

- **Viewport Height**: Verify usage of `100dvh` (dynamic viewport height) to handle mobile browser address bars correctly.
- **Keyboard Handling**: Ensure the input bar floats correctly above the virtual keyboard.
- **Message Bubbles**: Add a subtle gradient or "glow" to God's messages to make them feel "alive".
- **Typing Indicator**: Polish the typing animation to be smoother.

## 4. "Grok" Details

- **Glow Effects**: Add subtle glows to active elements (like the "Send" button and active inputs).
- **Transitions**: Ensure all hover/active states have `ease-apple` transitions.