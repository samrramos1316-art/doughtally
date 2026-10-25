import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrgId } from "@/lib/supabase/org";
import { selectAll } from "@/lib/supabase/selectAll";

export const maxDuration = 120;

// Settings → Download my data: everything DoughTally holds for this account
// and its business, as one JSON file (the right to know and to a portable
// copy, CCPA §1798.100 / §1798.110). Read with the caller's own session, so
// RLS limits it to their business. Embeddings are left out: they're
// derived numbers (1,024 per row) for matching, not information about
// anyone. Uploaded photos/PDFs are listed by path; each opens from its
// invoice's page.
const INGREDIENT_COLUMNS = "id, org_id, name, category, base_unit, current_unit_cost, current_unit_cost_updated_at, commodity_code, waste_pct, pack_sizes, created_at, updated_at";
const LINE_COLUMNS =
  "id, org_id, invoice_id, position, raw_text, parsed_item_name, parsed_quantity, parsed_unit, parsed_unit_cost, parsed_line_total, parsed_pack_quantity, parsed_pack_unit, entry_method, match_status, matched_ingredient_id, match_confidence, candidate_matches, base_unit_cost, price_applied_at, price_note, created_at, updated_at";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const orgId = await getCurrentOrgId(supabase);
  if (!user || !orgId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Untyped: this copies whole rows out whatever their shape.
  const db = supabase as unknown as SupabaseClient;
  const all = (table: string, columns = "*", order = "id") =>
    selectAll((a, b) => db.from(table).select(columns).order(order).range(a, b)).then((r) => {
      if (r.error) throw new Error(`${table}: ${r.error.message}`);
      return r.data ?? [];
    });

  try {
    const [organization, profile, vendors, ingredients, priceHistory, invoices, lineItems, aliases, recipes, recipeIngredients, menuItems, alerts, impacts, aiUsage, files] = await Promise.all([
      all("organizations"),
      all("profiles"),
      all("vendors"),
      all("ingredients", INGREDIENT_COLUMNS),
      all("ingredient_price_history"),
      all("invoices"),
      all("invoice_line_items", LINE_COLUMNS),
      all("vendor_ingredient_aliases"),
      all("recipes"),
      all("recipe_ingredients"),
      all("menu_items"),
      all("price_alerts"),
      all("menu_item_margin_impacts"),
      all("ai_usage", "*", "day").catch(() => []), // before migration 033
      listFiles(supabase, orgId),
    ]);
    const body = {
      exported_at: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        // What was given at signup, including which terms were agreed to and when.
        signup_details: user.user_metadata,
      },
      organization: organization[0] ?? null,
      profile: profile[0] ?? null,
      vendors,
      ingredients,
      ingredient_price_history: priceHistory,
      invoices,
      invoice_line_items: lineItems,
      vendor_ingredient_aliases: aliases,
      recipes,
      recipe_ingredients: recipeIngredients,
      menu_items: menuItems,
      price_alerts: alerts,
      menu_item_margin_impacts: impacts,
      ai_usage: aiUsage,
      uploaded_files: files,
    };
    const date = new Date().toISOString().slice(0, 10);
    return new Response(JSON.stringify(body, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="doughtally-my-data-${date}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[export] building the data export failed:", err);
    return NextResponse.json({ error: "Couldn't build your export. Try again, or email us." }, { status: 500 });
  }
}

// Every file in this business's folder of the private bucket, any depth.
async function listFiles(supabase: Awaited<ReturnType<typeof createClient>>, folder: string): Promise<{ path: string; size: number | null; created_at: string | null }[]> {
  const out: { path: string; size: number | null; created_at: string | null }[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage.from("invoices").list(folder, { limit: 1000, offset });
    if (error) throw new Error(`storage: ${error.message}`);
    for (const item of data ?? []) {
      const path = `${folder}/${item.name}`;
      if (item.id) out.push({ path, size: (item.metadata?.size as number | undefined) ?? null, created_at: item.created_at ?? null });
      else out.push(...(await listFiles(supabase, path)));
    }
    if (!data || data.length < 1000) return out;
  }
}
