-- ========================================================================
-- Cleanup Script: Remove Orphaned Auth User
-- ========================================================================
--
-- PURPOSE:
-- This script removes an orphaned user from auth.users who does not have
-- a corresponding profile in public.users. This typically happens when:
--
-- 1. Magic link authentication creates auth.users entry
-- 2. Profile creation in public.users fails (RLS, network, race condition)
-- 3. User appears in auth.users but not in public.users
--
-- SYMPTOM:
-- - Password reset says "user already exists"
-- - But user cannot login (no profile found)
-- - Email change fails or behaves incorrectly
--
-- ========================================================================
-- ⚠️ WARNING: This operation is PERMANENT
-- ========================================================================
-- - Deleting from auth.users will CASCADE to auth.identities
-- - User will lose all authentication data
-- - User must re-register with magic link to create clean state
-- - Consider creating a backup before running!
--
-- ========================================================================

-- STEP 1: Verify the orphaned user exists
-- ========================================================================
-- This should return 1 row (user exists in auth.users)
SELECT
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'info@memorial-journey.de';

-- This should return 0 rows (user NOT in public.users)
SELECT
  id,
  email,
  created_at
FROM public.users
WHERE email = 'info@memorial-journey.de';


-- ========================================================================
-- STEP 2: Create backup (RECOMMENDED)
-- ========================================================================
-- Copy user data to a backup table for safety
-- Uncomment and run if you want a backup:

-- CREATE TABLE IF NOT EXISTS auth.users_backup_orphaned AS
-- SELECT * FROM auth.users WHERE 1=0;

-- INSERT INTO auth.users_backup_orphaned
-- SELECT * FROM auth.users
-- WHERE email = 'info@memorial-journey.de';


-- ========================================================================
-- STEP 3: Delete the orphaned user
-- ========================================================================
-- This will CASCADE delete from:
-- - auth.identities (OAuth connections)
-- - auth.sessions (active sessions)
-- - auth.refresh_tokens (refresh tokens)

BEGIN;

DELETE FROM auth.users
WHERE email = 'info@memorial-journey.de'
AND id NOT IN (SELECT id FROM public.users);

-- Verify deletion (should return 0 rows)
SELECT COUNT(*) as deleted_count
FROM auth.users
WHERE email = 'info@memorial-journey.de';

-- If everything looks good, commit the transaction
COMMIT;

-- If something went wrong, rollback instead:
-- ROLLBACK;


-- ========================================================================
-- STEP 4: Verify cleanup was successful
-- ========================================================================
-- Both queries should now return 0 rows
SELECT COUNT(*) as auth_users_count FROM auth.users WHERE email = 'info@memorial-journey.de';
SELECT COUNT(*) as public_users_count FROM public.users WHERE email = 'info@memorial-journey.de';


-- ========================================================================
-- FUTURE: How to find ALL orphaned users
-- ========================================================================
-- Run this query to detect any orphaned users in your database:
/*
SELECT
  au.id,
  au.email,
  au.created_at,
  au.last_sign_in_at,
  CASE
    WHEN pu.id IS NULL THEN '❌ ORPHANED'
    ELSE '✅ Synced'
  END as sync_status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;
*/


-- ========================================================================
-- NOTES
-- ========================================================================
-- After running this script:
-- 1. User can re-register with info@memorial-journey.de via magic link
-- 2. New registration will create BOTH auth.users and public.users entries
-- 3. Profile creation is now protected by new prevention measures:
--    - Callback handler checks and creates profiles
--    - AuthContext has retry logic for failed inserts
--    - Error messages shown to user if profile creation fails
--
-- Prevention measures are implemented in:
-- - src/app/auth/callback/page.tsx (profile creation check)
-- - src/contexts/AuthContext.tsx (retry logic + error handling)
-- ========================================================================
