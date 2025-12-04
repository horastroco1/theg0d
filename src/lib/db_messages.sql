
-- Create Messages Table for Persistent Chat
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_key TEXT NOT NULL REFERENCES public.users(identity_key), -- Link to User via Identity Key
    sender TEXT NOT NULL CHECK (sender IN ('user', 'god')),
    content TEXT NOT NULL, -- THIS WILL BE ENCRYPTED CIPHERTEXT
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast retrieval
CREATE INDEX IF NOT EXISTS idx_messages_user_key ON public.messages (user_key);

-- RLS for Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow public insert (since we manage auth via key matching in logic)
CREATE POLICY "Allow Public Insert Messages" 
ON public.messages 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow public select (we will filter by key in the query)
CREATE POLICY "Allow Public Select Messages" 
ON public.messages 
FOR SELECT 
TO anon 
USING (true);

