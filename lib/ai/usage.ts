import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// AI reads (Claude) one business may start per UTC day. A busy shop scans
// a handful of invoices a day and an onboarding import a few dozen files;
// the cap is there so an open signup can't run the bill up without limit.
export function aiDailyLimit() {
  const n = Number(process.env.AI_DAILY_LIMIT);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 150;
}

export const aiLimitMessage = (limit: number) =>
  `You've reached today's limit of ${limit} AI reads. It resets at midnight UTC. You can still type invoices in by hand.`;

// Counts one read for the caller's business (claim_ai_read, migration 033)
// and says whether it's allowed. Fails open: if the count can't be taken
// (the migration isn't applied yet, a blip), reading goes ahead.
export async function claimAiRead(supabase: SupabaseClient<Database>): Promise<{ ok: true } | { ok: false; error: string }> {
  const limit = aiDailyLimit();
  const { data, error } = await supabase.rpc("claim_ai_read", { p_limit: limit });
  if (error) {
    console.error("[ai-usage] couldn't count this read; allowing it:", error.message);
    return { ok: true };
  }
  return data === false ? { ok: false, error: aiLimitMessage(limit) } : { ok: true };
}
