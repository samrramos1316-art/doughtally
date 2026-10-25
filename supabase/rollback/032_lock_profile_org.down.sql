-- Rollback for migrations/032_lock_profile_org.sql (not run by the CLI):
--   npx supabase db query --linked -f supabase/rollback/032_lock_profile_org.down.sql
--   npx supabase migration repair --status reverted 032
-- Restores Supabase's default table-wide grant, re-opening what 032 closed.
set search_path to "$user", public, extensions;

grant update on profiles to anon, authenticated;
