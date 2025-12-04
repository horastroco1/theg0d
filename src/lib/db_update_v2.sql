
-- Update users table to store cached chart data
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS chart_data JSONB;

-- Optional: Add index for faster lookups if you have millions of users
CREATE INDEX IF NOT EXISTS idx_users_name ON public.users (name);

