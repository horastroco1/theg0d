---
name: "Soul Injection: Language & Polish"
overview: Implement auto-language detection based on browser/IP, translate key UI elements, ensuring the AI replies in the user's language, and verify audio/social features.
todos:
  - id: lang-detect
    content: Implement Language Detection Utility
    status: completed
  - id: ai-lang-prompt
    content: Inject Language into AI System Prompt
    status: completed
    dependencies:
      - lang-detect
  - id: ui-trans
    content: Translate Boot Sequence & UI Placeholders
    status: completed
    dependencies:
      - lang-detect
  - id: audio-check
    content: Verify Audio & Haptics
    status: completed
---

# Soul Injection: Language & Polish

We are making the app feel native to every user.

### 1. Language Detection Logic

- **File**: [`src/services/locationService.ts`](src/services/locationService.ts)
- **Action**: Add `detectUserLanguage()` using `navigator.language`.
- **Integration**: Pass `language` to `GodContext` in `generateGodResponse`.

### 2. AI Personality Adaptation

- **File**: [`src/app/actions/generateGodResponse.ts`](src/app/actions/generateGodResponse.ts)
- **Prompt Update**: Explicitly instruct Gemini: "DETECTED USER LANGUAGE: [Code]. ALL RESPONSES MUST BE IN [Language]."

### 3. UI Polish

- **Boot Sequence**: Translate "Initializing Neural Link..." based on detected language.
- **Inputs**: Translate placeholders like "What is your query?".

### 4. Audio Verification

- **Check**: Ensure `audioService.play()` is called in `GodDashboard.tsx`.