set search_path to "$user", public, extensions;

-- 1. References stay inside one business.
-- RLS checks a row's own org_id, but a foreign key is checked without RLS,
-- so a row could name another business's ingredient, recipe, vendor or
-- invoice by id. Nothing leaks through that (every read is RLS-filtered),
-- but it isn't valid data, and with ON DELETE rules it could block or
-- cascade into the other business's deletes. This trigger refuses it.
-- security definer: it must see the referenced row whatever its org.
create or replace function enforce_same_org()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ref_table text := tg_argv[0];
  ref_col text := tg_argv[1];
  ref_id uuid;
  ok boolean;
begin
  execute format('select ($1).%I', ref_col) using new into ref_id;
  if ref_id is null then
    return new;
  end if;
  execute format('select exists (select 1 from %I where id = $1 and org_id = $2)', ref_table)
    using ref_id, new.org_id into ok;
  if not ok then
    raise exception '% % is not in this business', ref_table, ref_id using errcode = 'foreign_key_violation';
  end if;
  return new;
end;
$$;

revoke execute on function enforce_same_org() from public, anon, authenticated;

create trigger ingredient_price_history_same_org_ingredient before insert or update of ingredient_id, org_id on ingredient_price_history
  for each row execute function enforce_same_org('ingredients', 'ingredient_id');
create trigger ingredient_price_history_same_org_vendor before insert or update of vendor_id, org_id on ingredient_price_history
  for each row execute function enforce_same_org('vendors', 'vendor_id');
create trigger ingredient_price_history_same_org_invoice before insert or update of invoice_id, org_id on ingredient_price_history
  for each row execute function enforce_same_org('invoices', 'invoice_id');

create trigger invoices_same_org_vendor before insert or update of vendor_id, org_id on invoices
  for each row execute function enforce_same_org('vendors', 'vendor_id');

create trigger invoice_line_items_same_org_invoice before insert or update of invoice_id, org_id on invoice_line_items
  for each row execute function enforce_same_org('invoices', 'invoice_id');
create trigger invoice_line_items_same_org_ingredient before insert or update of matched_ingredient_id, org_id on invoice_line_items
  for each row execute function enforce_same_org('ingredients', 'matched_ingredient_id');

create trigger vendor_ingredient_aliases_same_org_vendor before insert or update of vendor_id, org_id on vendor_ingredient_aliases
  for each row execute function enforce_same_org('vendors', 'vendor_id');
create trigger vendor_ingredient_aliases_same_org_ingredient before insert or update of ingredient_id, org_id on vendor_ingredient_aliases
  for each row execute function enforce_same_org('ingredients', 'ingredient_id');

create trigger recipe_ingredients_same_org_recipe before insert or update of recipe_id, org_id on recipe_ingredients
  for each row execute function enforce_same_org('recipes', 'recipe_id');
create trigger recipe_ingredients_same_org_ingredient before insert or update of ingredient_id, org_id on recipe_ingredients
  for each row execute function enforce_same_org('ingredients', 'ingredient_id');

create trigger menu_items_same_org_recipe before insert or update of recipe_id, org_id on menu_items
  for each row execute function enforce_same_org('recipes', 'recipe_id');

create trigger price_alerts_same_org_ingredient before insert or update of ingredient_id, org_id on price_alerts
  for each row execute function enforce_same_org('ingredients', 'ingredient_id');
create trigger price_alerts_same_org_invoice before insert or update of invoice_id, org_id on price_alerts
  for each row execute function enforce_same_org('invoices', 'invoice_id');

create trigger menu_item_margin_impacts_same_org_alert before insert or update of price_alert_id, org_id on menu_item_margin_impacts
  for each row execute function enforce_same_org('price_alerts', 'price_alert_id');
create trigger menu_item_margin_impacts_same_org_menu_item before insert or update of menu_item_id, org_id on menu_item_margin_impacts
  for each row execute function enforce_same_org('menu_items', 'menu_item_id');
create trigger menu_item_margin_impacts_same_org_recipe before insert or update of recipe_id, org_id on menu_item_margin_impacts
  for each row execute function enforce_same_org('recipes', 'recipe_id');

-- 2. The upload bucket only takes what the app uploads: photos and PDFs,
-- at most 25 MB (the bulk import already stops PDFs at 20 MB). Before, the
-- bucket itself accepted any file type and size from a direct API call.
update storage.buckets
   set file_size_limit = 25 * 1024 * 1024,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
 where id = 'invoices';

-- 3. A daily cap on AI reads per business, so one account (signup is open)
-- can't run up the Claude bill without limit. Counted per UTC day.
-- Readable by the business; written only through claim_ai_read().
create table ai_usage (
  org_id uuid not null references organizations(id) on delete cascade,
  day date not null,
  reads integer not null default 0,
  primary key (org_id, day)
);

alter table ai_usage enable row level security;

create policy "org members can read their ai usage"
  on ai_usage for select
  using (org_id = current_org_id());

-- Counts one read for the caller's business and says whether it's within
-- p_limit. security definer so it can write ai_usage, which callers can't.
create or replace function claim_ai_read(p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  org uuid := current_org_id();
  used integer;
begin
  if org is null then
    return false;
  end if;
  insert into ai_usage (org_id, day, reads)
  values (org, (now() at time zone 'utc')::date, 1)
  on conflict (org_id, day) do update set reads = ai_usage.reads + 1
  returning reads into used;
  return used <= p_limit;
end;
$$;

revoke execute on function claim_ai_read(integer) from public, anon;
grant execute on function claim_ai_read(integer) to authenticated;
