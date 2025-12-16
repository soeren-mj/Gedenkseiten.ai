-- Migration: Remove 'icon' from avatar_type options
-- Date: 2025-12-16
-- Description: Simplify avatar options to only 'initials' and 'image'

-- Step 1: Convert existing 'icon' values to 'initials' (the default)
UPDATE memorials
SET avatar_type = 'initials'
WHERE avatar_type = 'icon';

-- Step 2: Drop the old constraint
ALTER TABLE memorials
DROP CONSTRAINT IF EXISTS memorials_avatar_type_check;

-- Step 3: Add the new constraint with only 'initials' and 'image'
ALTER TABLE memorials
ADD CONSTRAINT memorials_avatar_type_check
CHECK (avatar_type IN ('initials', 'image'));

-- Verify: This query should return 0 rows after migration
-- SELECT COUNT(*) FROM memorials WHERE avatar_type = 'icon';
