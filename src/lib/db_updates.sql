-- 1. UPGRADE USERS TABLE
-- Add columns for RPG elements and persistence
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS energy INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS max_energy INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0;

-- 2. CREATE SAVED SCANS TABLE (THE GRIMOIRE)
-- Stores premium reports and deep insights
CREATE TABLE IF NOT EXISTS saved_scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_key TEXT NOT NULL, -- Links to users.identity_key
    type TEXT NOT NULL, -- 'DEEP_SCAN', 'DREAM_ANALYSIS', 'FULL_MOON_RITUAL'
    title TEXT, -- Optional title for the entry
    content TEXT NOT NULL, -- The full AI response
    moon_phase TEXT, -- Phase during scan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_saved_scans_user_key ON saved_scans(user_key);

