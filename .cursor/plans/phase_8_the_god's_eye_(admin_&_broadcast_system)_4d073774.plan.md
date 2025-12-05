---
name: "Phase 8: The God's Eye (Admin & Broadcast System)"
overview: Establish the 'God's Eye' control room. Redesign the Admin Dashboard with the new 'Foundation' aesthetic and implement a 'Global Broadcast' system to transmit messages to all users.
todos:
  - id: admin-sql
    content: Provide SQL command for 'broadcasts' table to user
    status: completed
  - id: admin-ui-rewrite
    content: Rewrite Admin Dashboard with 'Foundation' UI and Broadcast Tab
    status: completed
    dependencies:
      - admin-sql
  - id: broadcast-listener
    content: Implement Broadcast Listener in GodDashboard
    status: completed
    dependencies:
      - admin-ui-rewrite
---

# s liPhase 8: The God's Eye (Admin & Broadcast System)

We are building the control room for the Universe.

### 1. Database Expansion (Manual Action Required)

You will need to run a SQL command in your Supabase SQL Editor to enable the Broadcast system.

- **Table**: `broadcasts`
- **Columns**: `id`, `message`, `created_at`, `is_active`.

### 2. Admin Dashboard Upgrade (`src/app/admin/page.tsx`)

- **Visuals**: Replace "Matrix Green" with "Empire White/Gold".
- **Components**:
    - **Users Tab**: Clean, tabular list of all subjects.
    - **Logs Tab**: Decrypted chat history viewer.
    - **Broadcast Tab (New)**: A console to write and "TRANSMIT" messages to the entire world.

### 3. The "Whisper" Protocol (`src/components/GodDashboard.tsx`)

- **Feature**: When a user logs in, the system checks for new Broadcasts.
- **UI**: If a broadcast is found, it appears as a "DIVINE INTERVENTION" or "SYSTEM ALERT" overlay that the user must acknowledge.

### 4. Files to Modify

- [`src/app/admin/page.tsx`](src/app/admin/page.tsx): Full UI rewrite + Broadcast logic.
- [`src/components/GodDashboard.tsx`](src/components/GodDashboard.tsx): Add Broadcast listener and display modal.
- [`src/lib/supabase.ts`](src/lib/supabase.ts): Ensure types/client support the new table (if using typed client).

### 5. Verification

- Admin can log in.
- Admin can send a message "HELLO WORLD".
- User sees "HELLO WORLD" on their dashboard.