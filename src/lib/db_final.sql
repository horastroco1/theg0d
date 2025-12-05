-- FINAL IDEMPOTENT MIGRATION SCRIPT (Phase 24)
-- This script ensures the database is ready for launch.
-- It creates all necessary tables and columns safely.

-- 1. UPGRADE USERS TABLE (Core RPG Stats & Skins)
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE users ADD COLUMN energy INTEGER DEFAULT 5;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE users ADD COLUMN max_energy INTEGER DEFAULT 5;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE users ADD COLUMN active_skin TEXT DEFAULT 'default';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- 2. CREATE SAVED SCANS (The Grimoire)
CREATE TABLE IF NOT EXISTS saved_scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_key TEXT NOT NULL,
    type TEXT NOT NULL, -- 'DEEP_SCAN'
    title TEXT,
    content TEXT NOT NULL,
    moon_phase TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_scans_user_key ON saved_scans(user_key);

-- 3. SKINS SYSTEM (The Store)
CREATE TABLE IF NOT EXISTS skins (
    id TEXT PRIMARY KEY, -- e.g., 'nebula_purple'
    name TEXT NOT NULL,
    description TEXT,
    price_usd DECIMAL(10, 2) DEFAULT 0,
    css_vars JSONB NOT NULL -- Stores the theme colors
);

-- 4. USER SKINS (Inventory)
CREATE TABLE IF NOT EXISTS user_skins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_key TEXT NOT NULL,
    skin_id TEXT REFERENCES skins(id),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_key, skin_id)
);

-- 5. SEED DATA (Launch Content)
INSERT INTO skins (id, name, description, price_usd, css_vars) VALUES
('default', 'Void Black', 'The original darkness. Pure potential.', 0, '{"bg": "#050505", "text": "#F5F5F7", "accent": "#FFD700"}'),
('nebula_purple', 'Nebula Purple', 'Born from the heart of a dying star.', 5.00, '{"bg": "#1a0b2e", "text": "#e0d0ff", "accent": "#b388ff"}'),
('blood_moon', 'Blood Moon', 'The hunger of the cosmos. Aggressive.', 10.00, '{"bg": "#1a0505", "text": "#ffcccc", "accent": "#ff0000"}'),
('matrix_green', 'System Shock', 'Return to the source code.', 5.00, '{"bg": "#000500", "text": "#00ff41", "accent": "#00ff41"}')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, 
    description = EXCLUDED.description, 
    price_usd = EXCLUDED.price_usd, 
    css_vars = EXCLUDED.css_vars;

