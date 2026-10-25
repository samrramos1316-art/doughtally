"use client";

import { useActionState } from "react";
import { updatePasswordAction, type AuthActionState } from "@/app/(marketing)/auth-actions";
import { FormMessage, PasswordField, SubmitButton } from "@/components/marketing/FormFields";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<AuthActionState, FormData>(updatePasswordAction, null);
  return (
    <form action={action} className="space-y-4">
      {state && "error" in state && <FormMessage kind="error">{state.error}</FormMessage>}
      <PasswordField label="New password" autoComplete="new-password" required minLength={8} maxLength={72} hint="At least 8 characters." />
      <PasswordField id="passwordAgain" label="New password again" autoComplete="new-password" required minLength={8} maxLength={72} />
      <SubmitButton pending={pending} pendingText="Saving…">
        Save new password
      </SubmitButton>
    </form>
  );
}
