-- Migration: Convert animal fields to Foreign Keys
-- Date: 2025-01-11
-- Description: Replaces string animal_type/breed_group/breed with FK references to Tierarten/Rassengruppe/Rassen tables

-- Step 1: Add new FK columns (nullable to allow migration)
-- Note: IDs are numeric (not uuid) to match existing table structure
ALTER TABLE memorials
ADD COLUMN IF NOT EXISTS animal_type_id numeric REFERENCES "Tierarten"("Tierart_ID") ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS breed_group_id numeric REFERENCES "Rassengruppe"("Rassengruppe_ID") ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS breed_id numeric REFERENCES "Rassen"("Rassen_ID") ON DELETE SET NULL;

-- Step 2: Drop old string columns (only if they exist)
-- Note: This assumes no critical data migration is needed.
-- If you have existing data, you'll need a data migration script first.
ALTER TABLE memorials
DROP COLUMN IF EXISTS animal_type,
DROP COLUMN IF EXISTS breed_group,
DROP COLUMN IF EXISTS breed;

-- Step 3: Add comments for documentation
COMMENT ON COLUMN memorials.animal_type_id IS 'FK zu tierarten Tabelle (z.B. Hund, Katze, Pferd)';
COMMENT ON COLUMN memorials.breed_group_id IS 'FK zu rassengruppen Tabelle (z.B. Retriever, Hütehunde)';
COMMENT ON COLUMN memorials.breed_id IS 'FK zu rassen Tabelle (z.B. Golden Retriever, Labrador)';

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_memorials_animal_type_id ON memorials(animal_type_id);
CREATE INDEX IF NOT EXISTS idx_memorials_breed_group_id ON memorials(breed_group_id);
CREATE INDEX IF NOT EXISTS idx_memorials_breed_id ON memorials(breed_id);
