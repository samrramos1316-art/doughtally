"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type AuthActionState } from "@/app/(marketing)/auth-actions";
import { Field, FormMessage, SubmitButton } from "@/components/marketing/FormFields";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthActionState, FormData>(requestPasswordResetAction, null);
  const typed = state && "error" in state ? state.values : undefined;
  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        {state && "error" in state && <FormMessage kind="error">{state.error}</FormMessage>}
        {state && "notice" in state && <FormMessage kind="notice">{state.notice}</FormMessage>}
        <Field id="email" label="Email" type="email" autoComplete="email" required placeholder="you@yourbusiness.com" defaultValue={typed?.email} />
        <SubmitButton pending={pending} pendingText="Sending…">
          Send reset link
        </SubmitButton>
      </form>
      <p className="text-center text-sm text-stone-600">
        <Link href="/login" className="font-medium text-stone-900 underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
