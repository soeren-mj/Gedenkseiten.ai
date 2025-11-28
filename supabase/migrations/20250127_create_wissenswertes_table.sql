-- Migration: Create wissenswertes table for notable facts about memorials
-- Allows users to add up to 12 short facts/achievements about the deceased

CREATE TABLE IF NOT EXISTS wissenswertes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL DEFAULT '⭐',
  text TEXT NOT NULL CHECK (char_length(text) <= 60),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast loading by memorial
CREATE INDEX IF NOT EXISTS idx_wissenswertes_memorial_id ON wissenswertes(memorial_id);

-- Enable Row Level Security
ALTER TABLE wissenswertes ENABLE ROW LEVEL SECURITY;

-- SELECT: Public memorials are viewable by everyone, private only by creator
CREATE POLICY "wissenswertes_select" ON wissenswertes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memorials m
    WHERE m.id = memorial_id
    AND (m.privacy_level = 'public' OR m.creator_id = auth.uid())
  )
);

-- INSERT: Only memorial creator can add entries
CREATE POLICY "wissenswertes_insert" ON wissenswertes FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM memorials WHERE id = memorial_id AND creator_id = auth.uid())
);

-- UPDATE: Only memorial creator can update entries
CREATE POLICY "wissenswertes_update" ON wissenswertes FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM memorials WHERE id = memorial_id AND creator_id = auth.uid())
);

-- DELETE: Only memorial creator can delete entries
CREATE POLICY "wissenswertes_delete" ON wissenswertes FOR DELETE
USING (
  EXISTS (SELECT 1 FROM memorials WHERE id = memorial_id AND creator_id = auth.uid())
);

-- Add comments for documentation
COMMENT ON TABLE wissenswertes IS 'Notable facts, achievements, or traits about the deceased';
COMMENT ON COLUMN wissenswertes.emoji IS 'Single emoji representing the fact (e.g., 🏃, 👵, 🎓)';
COMMENT ON COLUMN wissenswertes.text IS 'Short description (max 60 characters)';
COMMENT ON COLUMN wissenswertes.order_index IS 'Display order for drag-and-drop sorting';
