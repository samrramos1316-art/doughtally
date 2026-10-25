import { z } from "zod";
import { MAX_AMOUNT } from "./ingredient";

export const createMenuItemSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  recipe_id: z.string().uuid().optional(),
  selling_price: z.coerce.number().nonnegative().max(MAX_AMOUNT),
  servings_per_batch: z.coerce.number().positive().max(MAX_AMOUNT).optional(),
  is_active: z.boolean().optional(),
});

// null unlinks the recipe, or goes back to the recipe's own yield.
export const updateMenuItemSchema = createMenuItemSchema.partial().extend({
  recipe_id: z.string().uuid().nullable().optional(),
  servings_per_batch: z.coerce.number().positive().max(MAX_AMOUNT).nullable().optional(),
});
