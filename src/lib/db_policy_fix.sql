
-- Enable RLS (Row Level Security) if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon) to INSERT new rows (for signup)
CREATE POLICY "Allow Public Insert" 
ON public.users 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow anyone (anon) to SELECT rows (for login via key)
-- Note: In a stricter system, we might want to restrict this further,
-- but for this Key-based system, we need to query by key.
CREATE POLICY "Allow Public Select" 
ON public.users 
FOR SELECT 
TO anon 
USING (true);

