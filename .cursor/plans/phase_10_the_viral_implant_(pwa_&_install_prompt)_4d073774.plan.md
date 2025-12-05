---
name: "Phase 10: The Viral Implant (PWA & Install Prompt)"
overview: Transform the app into a Progressive Web App (PWA) that aggressively but playfully prompts users to 'Install the Interface' on their devices. This includes a custom 'Install Modal' designed in the 'Foundation' aesthetic that detects the user's device (iOS/Android/Desktop) and gives specific, mystic instructions.
todos:
  - id: create-install-prompt
    content: Create src/components/InstallPrompt.tsx with device detection logic
    status: completed
  - id: update-manifest
    content: Update public/manifest.json for full PWA compliance
    status: completed
    dependencies:
      - create-install-prompt
  - id: integrate-prompt
    content: Integrate InstallPrompt into GodDashboard.tsx
    status: completed
    dependencies:
      - create-install-prompt
---

# Phase 10: The Viral Implant (PWA & Install Prompt)

The goal is to make `theg0d` "infect" devices by prompting users to install it as a native app. Since we can't force an install on iOS (it requires manual steps), we will create a custom, high-end "Install Modal" that guides them.

### 1. PWA Manifest Upgrade (`public/manifest.json`)

- Ensure `display: standalone`.
- Ensure high-res icons are linked.
- Theme color: `#050505`.

### 2. The "Implant" Component (`src/components/InstallPrompt.tsx`)

- **Logic**: Detects if the app is running in a browser (not standalone).
- **Trigger**: Appears after the user has interacted for 30 seconds or sent 3 messages.
- **Visuals**: "Foundation Glass" aesthetic.
- **Content**:
    - **iOS**: "TAP 'SHARE' -> 'ADD TO HOME SCREEN'. INITIALIZE NEURAL LINK."
    - **Android/Desktop**: "CLICK TO INSTALL PROTOCOL." (Uses `beforeinstallprompt` event).

### 3. Implementation

- [`src/components/InstallPrompt.tsx`](src/components/InstallPrompt.tsx): New component.
- [`src/components/GodDashboard.tsx`](src/components/GodDashboard.tsx): Import and render the prompt.
- [`public/manifest.json`](public/manifest.json): Verify config.

### 4. The "Gift"

- This isn't just an install button. It's framed as "Accepting the Permanent Link."

### 5. Verification

- Verify the prompt appears on mobile web.
- Verify the instructions are accurate for iOS vs Android.