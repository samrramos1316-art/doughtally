import { redirect } from "next/navigation";
import { AuthShell } from "@/components/marketing/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { hasResetGrant, RESET_GRANT_COOKIE } from "@/lib/auth/resetGrant";

// Where a password reset link lands (via /auth/confirm, signed in, with the
// signed grant it sets). Signed in alone isn't enough.
export default async function ResetPasswordPage() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user || !hasResetGrant((await cookies()).get(RESET_GRANT_COOKIE)?.value, user.id)) redirect("/login?error=reset_expired");
  return (
    <AuthShell title="Choose a new password" subtitle={user.email ? `For ${user.email}` : "For your DoughTally account"}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
