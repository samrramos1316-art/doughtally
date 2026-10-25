-- Rollback for migrations/033_hardening.sql (not run by the CLI):
--   npx supabase db query --linked -f supabase/rollback/033_hardening.down.sql
--   npx supabase migration repair --status reverted 033
set search_path to "$user", public, extensions;

drop function if exists claim_ai_read(integer);
drop table if exists ai_usage;

update storage.buckets set file_size_limit = null, allowed_mime_types = null where id = 'invoices';

drop trigger if exists ingredient_price_history_same_org_ingredient on ingredient_price_history;
drop trigger if exists ingredient_price_history_same_org_vendor on ingredient_price_history;
drop trigger if exists ingredient_price_history_same_org_invoice on ingredient_price_history;
drop trigger if exists invoices_same_org_vendor on invoices;
drop trigger if exists invoice_line_items_same_org_invoice on invoice_line_items;
drop trigger if exists invoice_line_items_same_org_ingredient on invoice_line_items;
drop trigger if exists vendor_ingredient_aliases_same_org_vendor on vendor_ingredient_aliases;
drop trigger if exists vendor_ingredient_aliases_same_org_ingredient on vendor_ingredient_aliases;
drop trigger if exists recipe_ingredients_same_org_recipe on recipe_ingredients;
drop trigger if exists recipe_ingredients_same_org_ingredient on recipe_ingredients;
drop trigger if exists menu_items_same_org_recipe on menu_items;
drop trigger if exists price_alerts_same_org_ingredient on price_alerts;
drop trigger if exists price_alerts_same_org_invoice on price_alerts;
drop trigger if exists menu_item_margin_impacts_same_org_alert on menu_item_margin_impacts;
drop trigger if exists menu_item_margin_impacts_same_org_menu_item on menu_item_margin_impacts;
drop trigger if exists menu_item_margin_impacts_same_org_recipe on menu_item_margin_impacts;
drop function if exists enforce_same_org();

alter table organizations drop constraint if exists organizations_name_length;
alter table profiles drop constraint if exists profiles_full_name_length;
alter table ingredients drop constraint if exists ingredients_name_length;
alter table recipes drop constraint if exists recipes_name_length;
alter table menu_items drop constraint if exists menu_items_name_length;
alter table vendors drop constraint if exists vendors_name_length;
-- handle_new_user: re-run its definition from migrations/026_industry_profiles.sql.
