---
name: "Super Engineer Protocol: Client-Side Dasha Engine"
overview: Implement a robust client-side Vimshottari Dasha calculator that uses the Moon's longitude from the API to locally determine the current planetary period, eliminating API dependencies and 'Unsynchronized' errors.
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

# Super Engineer Protocol: Client-Side Dasha Engine

We are cutting the cord on the API's Dasha logic. We will build our own engine.

### 1. Create `src/lib/dashaEngine.ts`

- **Input**: `moonLongitude` (number, 0-360), `birthDate` (Date).
- **Logic**:

1. **Nakshatra Map**: Define the 27 Nakshatras and their Lords (Ke, Ve, Su, Mo, Ma, Ra, Ju, Sa, Me).
2. **Find Start**:

 - `Nakshatra Index = Floor(MoonLon / 13.3333)`
 - `Lord = Lords[Index % 9]`
 - `Elapsed in Nakshatra = (MoonLon % 13.3333) / 13.3333`
 - `Balance of Dasha = (1 - Elapsed) * YearsOfLord`

3. **Time Travel**:

 - Start at `birthDate`.
 - Add `Balance of Dasha`.
 - Cycle through Lords (adding their full years) until `CurrentDate < EndDate`.

4. **Sub-Periods (Antardasha)**:

 - Once Mahadasha is found, subdivide it using the same planetary proportion logic.

### 2. Integrate into `astrologyService.ts`

- **Action**:
- Call API with `infolevel=basic` (Fast, Reliable).
- Get `data.chart.graha.Mo.longitude`.
- Call `dashaEngine.calculate(moonLon, birthDate)`.
- Overwrite `current_dasha` with our calculated value.

### 3. Deployment

- Deploy and verify "Unsynchronized" is gone forever.