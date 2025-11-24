-- Enable RLS on memorials table
ALTER TABLE memorials ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own memorials
CREATE POLICY "Users can insert their own memorials"
ON memorials
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

-- Policy: Users can view memorials they created
CREATE POLICY "Users can view their own memorials"
ON memorials
FOR SELECT
TO authenticated
USING (auth.uid() = creator_id);

-- Policy: Users can update their own memorials
CREATE POLICY "Users can update their own memorials"
ON memorials
FOR UPDATE
TO authenticated
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- Policy: Users can delete their own memorials
CREATE POLICY "Users can delete their own memorials"
ON memorials
FOR DELETE
TO authenticated
USING (auth.uid() = creator_id);

-- Policy: Public memorials are viewable by anyone (for future public pages)
CREATE POLICY "Public memorials are viewable by anyone"
ON memorials
FOR SELECT
TO anon, authenticated
USING (privacy_level = 'public');
