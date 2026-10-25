import { z } from "zod";
import { MAX_AMOUNT } from "./ingredient";

// Waste, labor and overhead (migration 025) are optional everywhere: left
// out, labor and overhead default to 0 (and the labor rate to null = the
// org's default rate), and a line's waste to null = its material's waste %
// (migration 027), so a food recipe costs what it always did.
export const recipeIngredientSchema = z.object({
  ingredient_id: z.string().uuid(),
  quantity: z.coerce.number().positive().max(MAX_AMOUNT),
  unit: z.string().trim().min(1).max(30),
  waste_pct: z.coerce.number().min(0, "Waste can't be negative").lt(100, "Waste must be under 100%").nullable().optional(),
});

const laborOverhead = {
  labor_minutes: z.coerce.number().min(0, "Labor minutes can't be negative").max(999999).optional(),
  labor_rate_per_hour: z.coerce.number().min(0, "Hourly rate can't be negative").max(999999).nullable().optional(),
  overhead_pct: z.coerce.number().min(0, "Overhead can't be negative").max(999).optional(),
  // Machine time (migration 029); null rate = the org's default machine rate.
  machine_minutes: z.coerce.number().min(0, "Machine minutes can't be negative").max(999999).optional(),
  machine_rate_per_hour: z.coerce.number().min(0, "Machine rate can't be negative").max(999999).nullable().optional(),
};

export const createRecipeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  batch_yield_qty: z.coerce.number().positive().max(MAX_AMOUNT),
  batch_yield_unit: z.string().trim().min(1).max(60),
  notes: z.string().max(5000).optional(),
  ...laborOverhead,
  ingredients: z.array(recipeIngredientSchema).max(300).default([]),
});

export const updateRecipeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200).optional(),
  batch_yield_qty: z.coerce.number().positive().max(MAX_AMOUNT).optional(),
  batch_yield_unit: z.string().trim().min(1).max(60).optional(),
  notes: z.string().max(5000).optional(),
  ...laborOverhead,
  ingredients: z.array(recipeIngredientSchema).max(300).optional(),
});
