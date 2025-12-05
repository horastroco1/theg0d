---
name: "Phase 7: The Artifact's Awakening (Boot Sequence Redesign)"
overview: Redesign the initial `BootSequence` to match the new "Foundation/Void" aesthetic. Replace the "Matrix Green" and "Ugly White" with a cinematic, high-end monochromatic "Artifact" opening sequence using the Geist Mono font and smooth motion physics.
todos:
  - id: redesign-boot-ui
    content: Rewrite BootSequence.tsx with new 'Foundation' aesthetic (White/Void/Gold)
    status: completed
  - id: boot-text-fx
    content: Implement 'Decoding' text animation and new 'Mystic' messages
    status: completed
    dependencies:
      - redesign-boot-ui
  - id: boot-transition
    content: Tune transition timing for seamless entry into TheGate
    status: completed
    dependencies:
      - boot-text-fx
---

# Phase 7: The Artifact's Awakening (Boot Sequence Redesign)

The goal is to replace the generic "Hacker" boot sequence with a cinematic, high-end "Artifact" opening that feels like it's from 10,000 years in the future.

### 1. Visual Language (The Foundation)

- **Palette**: Strictly "Starlight White" (`#F5F5F7`) and "Void Black" (`#000000`) with subtle "Golden" (`#FFD700`) accents for completion states.
- **Typography**: `Geist Mono` (or `SF Mono`), Uppercase, `tracking-[0.3em]` (very wide spacing).
- **Motion**: Slow, deliberate fades (`ease-out`) instead of jittery "typing".

### 2. Implementation: `BootSequence.tsx`

- **Remove**: The `#00FF41` (Matrix Green) text color.
- **Refine**: The message list. Replace generic tech jargon with "Mystic/Protocol" language.
    - *Old*: "INITIALIZING KERNEL..."
    - *New*: "PROTOCOL: ZERO // DETECTING SOUL SIGNATURE...", "SYNCING CELESTIAL GRID...", "ARTIFACT AWAKENING..."
- **Add**:
    - A central "Breathing" or "Pulsing" geometric element (minimalist circle or line) while loading.
    - A "decoding" text effect (scrambled characters resolving to text) for a sci-fi feel.
    - A smooth opacity fade-out that reveals `TheGate` login screen seamlessly.

### 3. Files to Modify

- [`src/components/BootSequence.tsx`](src/components/BootSequence.tsx): Complete rewrite of the visual layer.

### 4. Verification

- Ensure no "Green" flashes.
- Ensure the transition to `TheGate` is seamless (black-to-black).