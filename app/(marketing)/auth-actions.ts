"use server";

import { redirect } from "next/navigation";
import { CLOSED_MESSAGE, canUseApp } from "@/lib/access";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, signUpSchema } from "@/lib/validators/auth";
import { ONBOARDING_URL } from "@/lib/onboarding/paths";
import { LEGAL_VERSION } from "@/lib/legal";
import { isIndustryEnabled } from "@/lib/industries/gate";
import { RESET_COOKIE } from "@/lib/auth/loginErrors";
import { hasResetGrant, RESET_GRANT_COOKIE } from "@/lib/auth/resetGrant";
import { z } from "zod";

export type AuthActionState =
  | { error: string; unconfirmedEmail?: string; values?: Record<string, string> }
  | { notice: string }
  | null;

// Where Supabase's confirmation link should land: this deployment's own
// /auth/confirm, which finishes the sign-in (app/auth/confirm/route.ts).
async function confirmUrl() {
  const h = await headers();
  const origin = h.get("origin") ?? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  return `${origin}/auth/confirm`;
}

// Supabase's messages are written for developers; say what to do instead.
function friendly(message: string) {
  if (/invalid login credentials/i.test(message)) return "That email and password don't match an account.";
  if (/rate limit/i.test(message)) return "Too many emails sent just now — wait a few minutes and try again.";
  return message;
}

// React resets a form after its action runs, so an error would wipe what was
// typed. Hand the fields back (never the password) for the form to refill.
function keepTyped(formData: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((k) => [k, String(formData.get(k) ?? "")]));
}

export async function signUpAction(prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const result = await signUp(prevState, formData);
  return result && "error" in result ? { ...result, values: keepTyped(formData, ["businessType", "businessName", "fullName", "email", "acceptTerms"]) } : result;
}

async function signUp(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    businessName: formData.get("businessName"),
    businessType: formData.get("businessType") || undefined,
    fullName: formData.get("fullName") || undefined,
    acceptTerms: formData.get("acceptTerms"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password, businessName, businessType, fullName } = parsed.data;
  // Only what the picker offers (ENABLED_INDUSTRIES); a hand-made request
  // can't pick a hidden industry.
  if (!isIndustryEnabled(businessType)) return { error: "Pick a kind of business from the list." };
  // Pre-launch: no new accounts except the allow-list (lib/access.ts).
  if (!canUseApp(email)) return { error: CLOSED_MESSAGE };
  const supabase = await createClient();

  // The DB trigger `handle_new_user` (012_handle_new_user_trigger.sql) reads
  // this metadata to create the organizations + profiles rows atomically.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // terms_*: a record of what this person agreed to, and when.
      data: {
        business_name: businessName,
        business_type: businessType,
        full_name: fullName,
        terms_version: LEGAL_VERSION,
        terms_accepted_at: new Date().toISOString(),
      },
      emailRedirectTo: await confirmUrl(),
    },
  });

  if (error) {
    return { error: friendly(error.message) };
  }

  // With email confirmation on, Supabase creates the user but no session:
  // sending them to /dashboard would just bounce them back to /login with
  // no explanation. Tell them to confirm instead.
  if (!data.session) {
    redirect(`/signup/check-email?email=${encodeURIComponent(email)}`);
  }
  // First stop for a new business: the menu/recipe import (§9.3), shown once.
  redirect(ONBOARDING_URL);
}

export async function logInAction(prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const result = await logIn(prevState, formData);
  return result && "error" in result ? { ...result, values: keepTyped(formData, ["email"]) } : result;
}

async function logIn(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Pre-launch: only the allow-list gets in (lib/access.ts).
  if (!canUseApp(parsed.data.email)) return { error: CLOSED_MESSAGE };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        error: "This account's email address hasn't been confirmed yet. Click the link in the confirmation email, or send a new one.",
        unconfirmedEmail: parsed.data.email,
      };
    }
    return { error: friendly(error.message) };
  }

  redirect("/dashboard");
}

export async function resendConfirmationAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email first." };
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: await confirmUrl() } });
  if (error) return { error: friendly(error.message) };
  return { notice: `Sent a new confirmation link to ${email}. It can take a minute — check spam too.` };
}

// Forgot password: email a reset link. The answer is the same whether or
// not the address has an account, so the form can't be used to find out.
// Supabase's link only works in the browser that asked (PKCE), so a cookie
// here tells /auth/confirm that the sign-in it finishes is a reset.
export async function requestPasswordResetAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = z.string().trim().email().max(254).safeParse(formData.get("email"));
  if (!parsed.success) return { error: "Enter the email address you signed up with.", values: { email: String(formData.get("email") ?? "") } };
  const email = parsed.data;
  const sent = { notice: `If there's an account for ${email}, we've sent it a link to choose a new password. Open it in this browser within the hour — check spam too.` };
  // Pre-launch: no mail to addresses that can't use the app anyway (lib/access.ts).
  if (!canUseApp(email)) return sent;
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: await confirmUrl() });
  if (error && /rate limit/i.test(error.message)) return { error: friendly(error.message), values: { email } };
  if (error) console.error("[auth] password reset email failed:", error.message);
  (await cookies()).set(RESET_COOKIE, "1", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 });
  return sent;
}

// The reset link's sign-in landed here (app/(marketing)/reset-password):
// set the new password on the signed-in account.
export async function updatePasswordAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const again = String(formData.get("passwordAgain") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters" };
  if (password.length > 72) return { error: "Password can be at most 72 characters" };
  if (password !== again) return { error: "The two passwords don't match." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const jar = await cookies();
  if (!user || !hasResetGrant(jar.get(RESET_GRANT_COOKIE)?.value, user.id)) {
    return { error: "This reset link has expired. Ask for a new one from the log-in page." };
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: friendly(error.message) };
  jar.delete(RESET_GRANT_COOKIE);
  // A reset is often because someone else got in: end every other session.
  await supabase.auth.signOut({ scope: "others" });
  redirect("/dashboard");
}

export async function logOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
