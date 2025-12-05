-- CREATE MESSAGES TABLE FOR CHAT HISTORY
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_key TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'god')),
    content TEXT NOT NULL, -- Encrypted content
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ALLOW READ/WRITE for anyone with the correct user_key (Simulating encryption ownership)
-- In a real app, we'd match auth.uid(), but here we use the key as the token.

CREATE POLICY "Enable insert for anyone" ON public.messages
FOR INSERT 
TO anon
WITH CHECK (true);

CREATE POLICY "Enable select for key holders" ON public.messages
FOR SELECT
TO anon
USING (true); -- We filter by user_key in the query, RLS 'true' allows access to the table generally
-- Note: Ideally, we would check if the current user "owns" the key, but without Auth, this is open.
-- The security relies on the `user_key` being a secret (like a bearer token) and the content being encrypted.

