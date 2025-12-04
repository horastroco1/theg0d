---
name: "Bhava-First Logic: The Truth Algorithm"
overview: Implement the 'Bhava-First' logic to correctly calculate House placements by reading the Ascendant sign from the API's 'bhava' object and mapping all planets relative to it.
todos:
  - id: bhava-calc
    content: Implement Bhava-First House Calculator
    status: completed
  - id: dasha-refine
    content: Refine Dasha Recursive Finder
    status: completed
  - id: update-context
    content: Update God Context with Calculated Facts
    status: completed
    dependencies:
      - bhava-calc
      - dasha-refine
---

# Bhava-First Logic: The Truth Algorithm

We will align the AI's understanding with the Vedic "Whole Sign" logic derived explicitly from the API's `bhava` (House) data.

### 1. Extract the "Lagna" (Anchor)

- **Source**: `data.chart.bhava["1"].rashi`
- **Meaning**: This is the **Ascendant Sign Number** (1-12).
- **Action**: Store this as `ascendantSign`.

### 2. Map Planets to Houses

- **Algorithm**:

For each Planet (Sun, Moon, Mars, etc.):

  1. Get `planet.rashi` (The Sign it is in).
  2. Calculate **House Number**:
     ```typescript
     let house = (planetRashi - ascendantSign + 1);
     if (house <= 0) house += 12;
     ```

  1. Store: `Mars: House 9 (Scorpio)`

### 3. Dasha Timeline Fix

- **Source**: `data.dasha.periods`
- **Action**: Re-implement the recursive finder to strictly check:

`startDate <= NOW <= endDate`

- **Output**: A clean string "Mars > Rahu" (Current active period).

### 4. Feed the AI

- **Prompt Update**: Send the *calculated* House list to the AI.
  - "Mars is in House 9."
  - "Saturn is in House [X]."
- **Benefit**: The AI stops doing mental gymnastics and just reads the facts.