import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { ONBOARDING_FOLDER } from "./upload";

// Menu and recipe photos are only needed while an import is being read and
// reviewed. The import deletes its files when it's saved; this removes the
// rest (imports never finished, files the invoice scanner handed over)
// once they're a day old. Run by the daily cron with the service role.
export const ONBOARDING_FILE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export async function purgeOldOnboardingFiles(now = Date.now()) {
  const admin = createAdminClient();
  const cutoff = now - ONBOARDING_FILE_MAX_AGE_MS;
  let removed = 0;
  for (let from = 0; ; from += 1000) {
    const { data: orgs, error } = await admin.from("organizations").select("id").order("id").range(from, from + 999);
    if (error) throw new Error(`organizations: ${error.message}`);
    for (const { id } of orgs ?? []) {
      const folder = `${id}/${ONBOARDING_FOLDER}`;
      const old: string[] = [];
      for (let offset = 0; ; offset += 1000) {
        const { data: files, error: listErr } = await admin.storage.from("invoices").list(folder, { limit: 1000, offset });
        if (listErr) throw new Error(`storage: ${listErr.message}`);
        for (const f of files ?? []) if (f.id && f.created_at && Date.parse(f.created_at) < cutoff) old.push(`${folder}/${f.name}`);
        if (!files || files.length < 1000) break;
      }
      for (let i = 0; i < old.length; i += 100) {
        const { error: rmErr } = await admin.storage.from("invoices").remove(old.slice(i, i + 100));
        if (rmErr) throw new Error(`storage: ${rmErr.message}`);
      }
      removed += old.length;
    }
    if (!orgs || orgs.length < 1000) return { removed };
  }
}
