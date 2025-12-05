# Phase 3: Empire & Eclipse (Admin, RTL, Moon Events)

The "Body" is beautiful. Now we build the "Empire" (Business Logic) and the "Soul" (Persian/Lunar Optimization).

## 1. Persian Soul (RTL & Vazirmatn)
- [ ] **Font Integration**: Import `Vazirmatn` (Google Fonts). Apply it globally ONLY when `[dir="rtl"]` is active.
- [ ] **Deep RTL Polish**: Fix padding/margin flips in `TheGate` and `GodDashboard` that were missed. Ensure input icons (User, Key) align correctly on the right for Farsi.
- [ ] **Location-Based Auto-Switch**: Ensure the app detects Iran/UAE/Afghan IPs and *instantly* switches to Farsi + RTL without asking.

## 2. The God Admin (Dashboard)
- [ ] **Route**: Create `/admin` (Protected by `ADMIN_SECRET_KEY` in env).
- [ ] **Features**:
    - **Live User Feed**: Who is online?
    - **Revenue Ticker**: Total crypto collected.
    - **Chat Voyeur**: View decrypted user sessions (for debugging/monitoring).
    - **System Override**: Button to "Gift Energy" to a specific user ID.

## 3. The User Nexus (Profile)
- [ ] **Profile Modal**: A sleek modal in the Dashboard.
    - **Wallet**: Show "Energy Balance" and "Transaction History".
    - **Settings**: Toggle Language, Notifications.
    - **Logout**: Secure session clear.

## 4. The Moon Engine (Event Protocol)
- [ ] **Lunar Calculation**: Implement `getMoonPhase()` in `astrologyService`.
- [ ] **Full Moon Mode**:
    - **Trigger**: If `Phase === 'Full Moon'`.
    - **Effect**: UI accent changes from Green to **Gold**.
    - **Bonus**: "Prophecy Mode" enabled (AI becomes more poetic/intense).
    - **Discount**: "Deep Scan" drops to $5 (simulated discount logic).

## 5. Global Language Sync
- [ ] **Detection Upgrade**: Refine the `locationService` to map Country Codes (IR, AF, TJ) -> 'fa'.
- [ ] **Content Sync**: Ensure all static UI text (Buttons, Placeholders) pulls from a centralized `translations` object.

