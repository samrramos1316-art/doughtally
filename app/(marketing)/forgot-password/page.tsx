import { AuthShell } from "@/components/marketing/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a link to choose a new one.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
