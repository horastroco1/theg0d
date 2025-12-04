---
name: Migration to OpenRouter AI
overview: Migrate the AI infrastructure from direct Google Gemini API to OpenRouter to bypass account/region restrictions and improve stability.
todos:
  - id: refactor-openrouter
    content: Refactor Server Action for OpenRouter
    status: completed
  - id: update-test-script
    content: Update Test Script for OpenRouter
    status: completed
    dependencies:
      - refactor-openrouter
  - id: verify-connection
    content: Verify Connection with New Key
    status: completed
    dependencies:
      - update-test-script
  - id: deploy-migration
    content: Deploy OpenRouter Migration
    status: in_progress
    dependencies:
      - verify-connection
---

# Migration to OpenRouter AI

We are bypassing the Google Cloud permission blockade by switching to OpenRouter.

### 1. Infrastructure Update

- **Endpoint**: Change base URL to `https://openrouter.ai/api/v1/chat/completions`.
- **Headers**: Update to use `Authorization: Bearer $GEMINI_API_KEY` (we will keep the variable name to avoid Vercel hassle, or rename to `OPENROUTER_API_KEY`).
- **Payload**: OpenRouter uses standard OpenAI-compatible JSON (`messages` array instead of `contents`).

### 2. Code Modification

- **File**: [`src/app/actions/generateGodResponse.ts`](src/app/actions/generateGodResponse.ts)
- **Logic**: refactor `axios.post` call to match OpenRouter/OpenAI format.
- **Models**:
- Standard: `google/gemini-flash-1.5`
- Premium: `google/gemini-pro-1.5` (or `anthropic/claude-3-haiku` if we want faster/better).

### 3. Verification

- **Script**: Update `src/scripts/test-gemini.ts` to test the OpenRouter connection.
- **Key**: User will provide new `sk-or-...` key.

### 4. Deployment

- **Git**: Push the new "OpenRouter" logic.
- **Vercel**: User updates `GEMINI_API_KEY` with the new OpenRouter key.