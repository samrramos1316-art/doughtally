set search_path to "$user", public, extensions;

-- The profiles update policy (008) only checks that the row is the caller's
-- own, so any column could change — including org_id, which current_org_id()
-- and so every RLS policy trusts. A user could point their profile at another
-- business's org. The app never updates profiles (the handle_new_user trigger
-- writes them as the definer), so clients may change their name and nothing
-- else; org_id and role stay as the trigger set them.
revoke update on profiles from anon, authenticated;
grant update (full_name) on profiles to authenticated;
