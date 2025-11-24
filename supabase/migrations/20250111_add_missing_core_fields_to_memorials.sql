-- Migration: Add missing core fields to memorials table
-- Date: 2025-01-11
-- Description: Adds birth_date, death_date, places, avatar_type, quotes, etc.

-- Add date fields
ALTER TABLE memorials
ADD COLUMN IF NOT EXISTS birth_date date NOT NULL DEFAULT '1900-01-01',
ADD COLUMN IF NOT EXISTS death_date date NOT NULL DEFAULT '2000-01-01';

-- Remove defaults after adding (they were just for existing rows)
ALTER TABLE memorials
ALTER COLUMN birth_date DROP DEFAULT,
ALTER COLUMN death_date DROP DEFAULT;

-- Add place fields
ALTER TABLE memorials
ADD COLUMN IF NOT EXISTS birth_place text,
ADD COLUMN IF NOT EXISTS death_place text;

-- Add person-specific fields that might be missing
ALTER TABLE memorials
ADD COLUMN IF NOT EXISTS birth_name text,
ADD COLUMN IF NOT EXISTS nickname text;

-- Add avatar type (defaults to 'initials')
ALTER TABLE memorials
ADD COLUMN IF NOT EXISTS avatar_type text DEFAULT 'initials' CHECK (avatar_type IN ('initials', 'icon', 'image'));

-- Add content fields
ALTER TABLE memorials
ADD COLUMN IF NOT EXISTS memorial_quote text,
ADD COLUMN IF NOT EXISTS obituary text;

-- Add CHECK constraint for privacy_level if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'memorials_privacy_level_check'
    ) THEN
        ALTER TABLE memorials
        ADD CONSTRAINT memorials_privacy_level_check
        CHECK (privacy_level IN ('public', 'private'));
    END IF;
END $$;

-- Add CHECK constraint for type if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'memorials_type_check'
    ) THEN
        ALTER TABLE memorials
        ADD CONSTRAINT memorials_type_check
        CHECK (type IN ('person', 'pet'));
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN memorials.birth_date IS 'Geburtsdatum (required)';
COMMENT ON COLUMN memorials.death_date IS 'Sterbedatum (required)';
COMMENT ON COLUMN memorials.birth_place IS 'Geburtsort (optional)';
COMMENT ON COLUMN memorials.death_place IS 'Sterbeort (optional)';
COMMENT ON COLUMN memorials.birth_name IS 'Geburtsname (optional, für Personen)';
COMMENT ON COLUMN memorials.nickname IS 'Spitzname (optional)';
COMMENT ON COLUMN memorials.avatar_type IS 'Avatar-Typ: initials, icon, oder image';
COMMENT ON COLUMN memorials.avatar_url IS 'URL zum Avatar-Bild (wenn avatar_type=image)';
COMMENT ON COLUMN memorials.memorial_quote IS 'Gedenkspruch (max 160 Zeichen)';
COMMENT ON COLUMN memorials.obituary IS 'Nachruf (max 5000 Zeichen)';
COMMENT ON COLUMN memorials.type IS 'Memorial-Typ: person oder pet';
COMMENT ON COLUMN memorials.privacy_level IS 'Sichtbarkeit: public oder private';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_memorials_type ON memorials(type);
CREATE INDEX IF NOT EXISTS idx_memorials_creator_id ON memorials(creator_id);
CREATE INDEX IF NOT EXISTS idx_memorials_created_at ON memorials(created_at);
CREATE INDEX IF NOT EXISTS idx_memorials_is_active ON memorials(is_active);
