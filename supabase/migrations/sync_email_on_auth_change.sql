-- ⚠️ THIS FILE IS NOT NEEDED ANYMORE ⚠️
--
-- Migration: Sync email changes from auth.users to public.users
--
-- ❌ PROBLEM: Requires Superuser privileges on auth.users table
-- Error: "42501: must be owner of relation users"
--
-- ✅ SOLUTION IMPLEMENTED: Manual sync in application code
-- Location: src/app/auth/callback/page.tsx (lines 66-77)
--
-- The email sync now happens client-side after email confirmation:
-- 1. User confirms new email via link
-- 2. Auth callback detects type=email_change
-- 3. Callback handler manually updates public.users.email
-- 4. Success redirect to settings
--
-- This approach:
-- ✅ Works without superuser privileges
-- ✅ No database trigger needed
-- ✅ Guaranteed to sync on every email change
-- ✅ Simpler debugging (visible in app logs)
--
-- This file is kept for reference only.
-- You do NOT need to run this SQL script.

-------------------------------------------------------------------
-- REFERENCE: Original Database Trigger Approach (NOT USED)
-------------------------------------------------------------------

-- Create a function that syncs email from auth.users to public.users
-- Note: This requires SUPERUSER privileges and will fail on Supabase
CREATE OR REPLACE FUNCTION public.sync_user_email_from_auth()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only update if email has actually changed
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    -- Update the email in public.users table
    UPDATE public.users
    SET
      email = NEW.email,
      updated_at = NOW()
    WHERE id = NEW.id;

    RAISE NOTICE 'Email synced for user %: % -> %', NEW.id, OLD.email, NEW.email;
  END IF;

  RETURN NEW;
END;
$$;

-- Create a trigger on auth.users
-- ⚠️ THIS WILL FAIL: Requires superuser access to auth schema
CREATE TRIGGER on_auth_user_email_change
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.sync_user_email_from_auth();
