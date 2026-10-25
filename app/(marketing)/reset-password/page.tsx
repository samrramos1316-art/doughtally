import { redirect } from "next/navigation";
import { AuthShell } from "@/components/marketing/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";

// Where a password reset link lands (via /auth/confirm, signed in).
export default async function ResetPasswordPage() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) redirect("/login?error=reset_expired");
  return (
    <AuthShell title="Choose a new password" subtitle={user.email ? `For ${user.email}` : "For your DoughTally account"}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
