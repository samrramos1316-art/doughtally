import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

type Admin = ReturnType<typeof createAdminClient>;

// Every file under a folder of the private invoices bucket, at any depth
// (invoices sit at {org}/…, onboarding uploads at {org}/onboarding/…).
async function listFiles(admin: Admin, folder: string): Promise<string[]> {
  const out: string[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await admin.storage.from("invoices").list(folder, { limit: 1000, offset });
    if (error) throw new Error(`storage: ${error.message}`);
    for (const item of data ?? []) {
      const path = `${folder}/${item.name}`;
      // Folders come back without an id.
      if (item.id) out.push(path);
      else out.push(...(await listFiles(admin, path)));
    }
    if (!data || data.length < 1000) return out;
  }
}

// Deletes a business and its owner's login for good: uploaded files first,
// then the organization (every tenant table, and the profile, cascade from
// it), then the auth user. Service role, so the caller must have checked
// that userId is the signed-in user, that orgId is their org, and their
// password. Refuses an org that has other members, so one person can't
// delete a shared business.
export async function deleteAccount(userId: string, orgId: string) {
  const admin = createAdminClient();
  const { count, error: countErr } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("org_id", orgId);
  if (countErr) throw new Error(countErr.message);
  if ((count ?? 0) > 1) return { error: "Other people use this business's account, so it can't be deleted from here. Email us and we'll sort it out." };

  const files = await listFiles(admin, orgId);
  for (let i = 0; i < files.length; i += 100) {
    const { error } = await admin.storage.from("invoices").remove(files.slice(i, i + 100));
    if (error) throw new Error(`storage: ${error.message}`);
  }
  const { error: orgErr } = await admin.from("organizations").delete().eq("id", orgId);
  if (orgErr) throw new Error(orgErr.message);
  const { error: userErr } = await admin.auth.admin.deleteUser(userId);
  if (userErr) throw new Error(userErr.message);
  return { ok: true as const };
}
