-- Migration: Add Person-specific fields to memorials table
-- Date: 2025-01-11
-- Description: Adds gender, salutation, title, second_name, and name_suffix fields for person memorials

-- Add new person-specific columns
ALTER TABLE memorials
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS salutation text,
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS second_name text,
ADD COLUMN IF NOT EXISTS name_suffix text;

-- Add comments for documentation
COMMENT ON COLUMN memorials.gender IS 'Geschlecht: männlich, weiblich, divers, keine Angabe';
COMMENT ON COLUMN memorials.salutation IS 'Ansprache: Herr, Frau, keine Angabe';
COMMENT ON COLUMN memorials.title IS 'Titel: Dr., Prof., Prof. Dr., etc.';
COMMENT ON COLUMN memorials.second_name IS 'Zweiter Vorname';
COMMENT ON COLUMN memorials.name_suffix IS 'Namenszusatz';
