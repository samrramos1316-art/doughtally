import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import type { EmailOtpType } from "@supabase/supabase-js";
import { ONBOARDING_URL } from "@/lib/onboarding/paths";
import { createClient } from "@/lib/supabase/server";
import { RESET_COOKIE, type LoginErrorCode } from "@/lib/auth/loginErrors";
import { makeResetGrant, RESET_GRANT_COOKIE, RESET_GRANT_TTL_MS } from "@/lib/auth/resetGrant";

// Where the signup confirmation email lands. Supabase sends either a PKCE
// `code` (its default link, via /auth/v1/verify) or a `token_hash` + `type`
// (a custom email template); both end with a session cookie and the
// dashboard. Anything else — expired or reused link — goes to /login with
// a readable reason instead of Supabase's developer-facing error text.
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const supabase = await createClient();
  // A password reset (the forgot-password form set the cookie, or the link
  // says so) ends on /reset-password instead of onboarding.
  const jar = await cookies();
  const reset = type === "recovery" || jar.get(RESET_COOKIE)?.value === "1";

  let message: LoginErrorCode | null = null;
  if (url.searchParams.get("error_description")) {
    // Supabase itself rejected the link (typically expired or already used).
    message = "expired";
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    // A `code` only exists after Supabase has verified the email, so a failed
    // exchange — most often the link opened in a different browser or device
    // than the one that signed up — still means the account is confirmed.
    if (error) message = "confirmed";
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) message = "expired";
  } else {
    message = "incomplete";
  }

  if (message) {
    const login = new URL("/login", url);
    login.searchParams.set("error", reset ? "reset_expired" : message);
    return NextResponse.redirect(login);
  }
  if (reset) {
    jar.delete(RESET_COOKIE);
    // The signed grant /reset-password requires (lib/auth/resetGrant.ts).
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const grant = user ? makeResetGrant(user.id) : null;
    if (!grant) return NextResponse.redirect(new URL("/login?error=reset_expired", url));
    jar.set(RESET_GRANT_COOKIE, grant, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: RESET_GRANT_TTL_MS / 1000 });
    return NextResponse.redirect(new URL("/reset-password", url));
  }
  // Otherwise a signup confirmation: a new business starts at the
  // menu/recipe import (§9.3).
  return NextResponse.redirect(new URL(ONBOARDING_URL, url));
}
