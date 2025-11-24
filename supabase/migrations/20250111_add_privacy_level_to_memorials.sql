-- Migration: Add privacy_level column to memorials table
-- Date: 2025-01-11
-- Description: Adds privacy_level field for controlling memorial visibility

-- Add privacy_level column
ALTER TABLE memorials
ADD COLUMN IF NOT EXISTS privacy_level text DEFAULT 'public' CHECK (privacy_level IN ('public', 'private'));

-- Add invite_link column for private memorials
ALTER TABLE memorials
ADD COLUMN IF NOT EXISTS invite_link text;

-- Add comments
COMMENT ON COLUMN memorials.privacy_level IS 'Sichtbarkeit: public (öffentlich sichtbar) oder private (nur mit Einladung)';
COMMENT ON COLUMN memorials.invite_link IS 'Einladungslink für private Gedenkseiten';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_memorials_privacy_level ON memorials(privacy_level);
