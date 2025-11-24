-- Add view_count column to memorials table
-- This tracks the number of times a memorial page has been viewed

ALTER TABLE memorials
ADD COLUMN view_count integer DEFAULT 0 NOT NULL;

-- Add index for performance when sorting by popularity
CREATE INDEX idx_memorials_view_count ON memorials(view_count DESC);

-- Create RPC function to increment view count atomically
-- This prevents race conditions when multiple users view simultaneously
CREATE OR REPLACE FUNCTION increment_memorial_view_count(memorial_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE memorials
  SET view_count = view_count + 1
  WHERE id = memorial_id;
END;
$$;

-- Add RLS policy to allow anyone to increment view count on public memorials
-- This allows unauthenticated users to increment the counter
CREATE POLICY "Anyone can increment view_count on public memorials"
ON memorials
FOR UPDATE
TO anon, authenticated
USING (privacy_level = 'public')
WITH CHECK (privacy_level = 'public');

-- Comment for documentation
COMMENT ON COLUMN memorials.view_count IS 'Number of times the memorial page has been viewed';
COMMENT ON FUNCTION increment_memorial_view_count IS 'Atomically increments the view count for a memorial';
