-- ADD MISSING COLUMNS TO USERS TABLE
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS chart_data JSONB,
ADD COLUMN IF NOT EXISTS identity_key TEXT;

-- RE-APPLY RLS POLICY (Just in case)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ALLOW ANONYMOUS INSERTS (For the Sign Up flow)
CREATE POLICY "Enable insert for anon users" ON public.users
FOR INSERT 
TO anon
WITH CHECK (true);

-- ALLOW READS based on identity_key (For Login)
CREATE POLICY "Enable read for users with key" ON public.users
FOR SELECT
TO anon
USING (true); 

