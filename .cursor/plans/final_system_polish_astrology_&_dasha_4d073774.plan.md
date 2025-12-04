---
name: "Final System Polish: Astrology & Dasha"
overview: Refine the astrological data presentation to explicitly list House placements for the AI and force a fresh Dasha calculation on every session to fix the 'Unsynchronized' display.
todos:
  - id: explicit-houses
    content: Inject Explicit House-Planet List into AI Prompt
    status: completed
  - id: refresh-dasha
    content: Force Dasha Refresh on Dashboard Init
    status: completed
---

# Final System Polish: Astrology & Dasha

The system is live and functional. The AI correctly interprets the API data, but we want to ensure maximum clarity and fix the persistent "Unsynchronized" display.

### 1. Explicit House Context for AI

- **Observation**: The API provides a nested `houses` object (e.g., `houses["10"].graha`).
- **Action**: In `generateGodResponse.ts`, iterate through the `houses` object and generate a plain-text list: `"House 1 contains: [Planets]. House 2 contains: [Planets]..."`.
- **Benefit**: This removes any ambiguity for the AI, forcing it to stick to the API's calculated houses rather than inferring from signs.

### 2. Fix "Unsynchronized" Dasha Display

- **Observation**: The frontend (`GodDashboard`) might be using cached `userData` which contains the old "Unsynchronized" string.
- **Action**: In the `useEffect` initialization of `GodDashboard`, ALWAYS call `astrologyService.calculateHoroscope` afresh, even if `userData` exists, OR specifically recalculate just the Dasha string to update the display.
- **Benefit**: Users will see their correct Dasha immediately upon logging in.

### 3. Final Deployment

- Push these two tweaks to Vercel.