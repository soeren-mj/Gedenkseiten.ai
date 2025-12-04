-- Migration: Create memorial_reactions table for user reactions to memorials
-- Users can express their condolences through 5 different reaction types

CREATE TABLE IF NOT EXISTS memorial_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('liebe', 'dankbarkeit', 'freiheit', 'blumen', 'kerze')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one reaction type per user per memorial
  UNIQUE(memorial_id, user_id, reaction_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_memorial_reactions_memorial_id ON memorial_reactions(memorial_id);
CREATE INDEX IF NOT EXISTS idx_memorial_reactions_user_id ON memorial_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_memorial_reactions_created_at ON memorial_reactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE memorial_reactions ENABLE ROW LEVEL SECURITY;

-- SELECT: Anyone can view reactions (for public memorials, or private if creator)
CREATE POLICY "memorial_reactions_select" ON memorial_reactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memorials m
    WHERE m.id = memorial_id
    AND (m.privacy_level = 'public' OR m.creator_id = auth.uid())
  )
);

-- INSERT: Authenticated users can add their own reactions
CREATE POLICY "memorial_reactions_insert" ON memorial_reactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can remove their own reactions
CREATE POLICY "memorial_reactions_delete" ON memorial_reactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE memorial_reactions IS 'User reactions to memorial pages expressing condolences';
COMMENT ON COLUMN memorial_reactions.reaction_type IS 'Type: liebe, dankbarkeit, freiheit, blumen, kerze';
