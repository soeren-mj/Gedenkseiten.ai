-- Add relationship degree fields to memorials table
-- These fields are used to track the relationship between the memorial creator and the deceased person
-- Only relevant for person memorials (not pets)

-- Add relationship_degree column (stores the selected relationship type)
ALTER TABLE memorials
ADD COLUMN relationship_degree TEXT;

-- Add relationship_custom column (stores custom text when "Sonstiges" is selected)
ALTER TABLE memorials
ADD COLUMN relationship_custom TEXT;

-- Add comments for documentation
COMMENT ON COLUMN memorials.relationship_degree IS 'The relationship degree between creator and deceased (e.g., Vater, Mutter, Sohn, etc.). Only used for person memorials.';
COMMENT ON COLUMN memorials.relationship_custom IS 'Custom relationship description when relationship_degree is "Sonstiges". Only used for person memorials.';
