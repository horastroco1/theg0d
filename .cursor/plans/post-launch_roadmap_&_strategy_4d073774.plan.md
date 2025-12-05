---
name: Post-Launch Roadmap & Strategy
overview: Discuss and plan the next phase of development, focusing on feature polish, monetization, and user acquisition strategy.
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

# Post-Launch Roadmap & Strategy

Now that the core technical foundation (Dasha Engine, AI Integration, Basic UI) is stable, we shift focus to product validation and growth.

## 1. Verification & Polish (Immediate)

- [ ] **Live Test**: Verify Vercel deployment works as expected with the new OpenRouter backend.
- [ ] **Mobile UX Check**: Ensure the "Gate" and Chat interface feel native on mobile (PWA check).

## 2. Feature Expansion (Short Term)

- [ ] **Real Payments**: Replace the "Tribute" mock with Stripe/Razorpay integration?
- [ ] **User Accounts**: Enhance Supabase auth (currently implicit via name/birth data) to persistent login?
- [ ] **Viral Mechanics**: Add "Share My Prediction" button with generated images?

## 3. AI Personality Tuning

- [ ] **Fine-tuning**: Does "God" need to be meaner? Nicer? More cryptic?
- [ ] **Memory**: Should God remember past conversations across different sessions?

## 4. Monetization Strategy

- [ ] Define the "Premium" offering clearly (Infinite Energy? Deeper Insights?).