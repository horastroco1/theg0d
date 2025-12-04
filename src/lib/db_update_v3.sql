
-- Update users table to store identity key
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS identity_key TEXT UNIQUE;

-- Index for fast login
CREATE INDEX IF NOT EXISTS idx_users_identity_key ON public.users (identity_key);

