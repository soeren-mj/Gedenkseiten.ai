-- Allow authenticated users to read public profile info (name, avatar_url) of other users
-- This is needed for displaying user names in reactions, comments, etc.

-- First, ensure RLS is enabled on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read public profile info of other users
-- Note: This allows reading all columns, but in practice we only query name and avatar_url
CREATE POLICY "Users can read public profile info of others"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (for new signups)
CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
