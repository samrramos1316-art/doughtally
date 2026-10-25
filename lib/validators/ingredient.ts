import { z } from "zod";

// The largest amount the money and quantity columns hold (numeric(12,4)).
export const MAX_AMOUNT = 99_999_999;

export const createIngredientSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  category: z.string().trim().max(60).optional(),
  base_unit: z.string().trim().min(1, "Base unit is required").max(30),
  current_unit_cost: z.coerce.number().nonnegative().max(MAX_AMOUNT).optional(),
  commodity_code: z.string().trim().max(60).optional(),
  // Waste/loss % (migration 027): what's bought but lost to trim, scrap or
  // spoilage; every recipe line using the material follows it unless it
  // has its own. Left out on create: the industry's default (0 for food).
  waste_pct: z.coerce.number().min(0, "Waste can't be negative").lt(100, "Waste must be under 100%").optional(),
});

export const updateIngredientSchema = createIngredientSchema.partial().extend({
  // A base unit change with no fixed conversion (lb → case): how many of the
  // new unit are in one of the old (lib/costing/rebaseUnit.ts).
  new_unit_per_old: z.coerce.number().positive("A unit size must be more than 0").optional(),
});
