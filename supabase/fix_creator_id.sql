-- Fix creator_id NULL values in memorials table
-- This script helps identify and fix memorials that don't have a creator_id set

-- Step 1: Check which memorials need fixing
SELECT
  id,
  first_name,
  last_name,
  type,
  creator_id,
  created_at,
  privacy_level
FROM memorials
WHERE creator_id IS NULL
ORDER BY created_at DESC;

-- Step 2: Get your user ID (replace YOUR_EMAIL with your actual email)
-- SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@example.com';

-- Step 3: Update all NULL creator_id to your user ID
-- IMPORTANT: Replace 'YOUR_USER_UUID_HERE' with your actual user UUID from Step 2
-- Uncomment the following line to execute:

-- UPDATE memorials
-- SET creator_id = 'YOUR_USER_UUID_HERE'
-- WHERE creator_id IS NULL;

-- Step 4: Verify the fix
-- SELECT id, first_name, last_name, creator_id
-- FROM memorials
-- WHERE creator_id IS NULL;
-- This should return 0 rows after the update

-- Alternative: If these are test memorials you want to delete instead:
-- DELETE FROM memorials WHERE creator_id IS NULL;
