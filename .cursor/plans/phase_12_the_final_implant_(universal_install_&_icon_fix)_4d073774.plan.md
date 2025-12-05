---
name: "Phase 12: The Final Implant (Universal Install & Icon Fix)"
overview: Finalize the PWA installation experience. Force the 'Install Prompt' to appear on Desktop (as a guide), ensuring users on all platforms see the call to action. Also, ensure the metadata points to the correct icon paths so the Next.js default icon never returns.
todos:
  - id: universal-prompt
    content: Update InstallPrompt.tsx to support Desktop and add persistence logic
    status: completed
  - id: force-icons
    content: Update layout.tsx metadata to force custom icons
    status: completed
    dependencies:
      - universal-prompt
---

# Phase 12: The Final Implant (Universal Install & Icon Fix)

The goal is to ensure the **Install Prompt** is visible and functional on ALL devices (including Desktop), and that the **App Icon** is correctly linked in the metadata, banishing the default Vercel/Next.js branding forever.

### 1. Universal Install Prompt (`src/components/InstallPrompt.tsx`)

- **Logic Update**: Remove the `platform !== 'DESKTOP'` restriction (or refine it).
- **Desktop Behavior**:
    - If `beforeinstallprompt` fires (Chrome/Edge), show "INSTALL TERMINAL".
    - If not (Safari/Firefox), show a "MANUAL OVERRIDE" guide (e.g., "Click Share/Install in browser menu").
- **Persistence**: Use `localStorage` to ensure if they dismiss it, it stays gone for 24 hours (so it doesn't annoy them on refresh).

### 2. Icon Metadata Hard-Link (`src/app/layout.tsx`)

- Explicitly define `icons` in the metadata export to point to `/icon-512x512.png` (which the user must provide).
- This overrides any lingering `favicon.ico` defaults.

### 3. Files to Modify

- [`src/components/InstallPrompt.tsx`](src/components/InstallPrompt.tsx): Logic update for Desktop support.
- [`src/app/layout.tsx`](src/app/layout.tsx): Metadata icon fix.

### 4. Verification

- Open on Mac (Chrome) -> See "INSTALL" button.
- Open on Mac (Safari) -> See "Add to Dock" guide.
- Open on iPhone -> See "Add to Home" guide.