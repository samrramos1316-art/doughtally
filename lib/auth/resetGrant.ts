import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Proof that this browser opened a password-reset link for this user in
// the last few minutes. /reset-password and updatePasswordAction need it:
// being signed in isn't enough, or anyone at an unlocked, signed-in
// computer could set a new password without knowing the old one. Signed
// with a server-only secret, so it can't be made or edited in the browser.
export const RESET_GRANT_COOKIE = "dt_pw_reset_ok";
export const RESET_GRANT_TTL_MS = 15 * 60_000;

function sign(payload: string) {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) return null; // fail closed: no secret, no grant
  return createHmac("sha256", `reset-grant:${secret}`).update(payload).digest("base64url");
}

export function makeResetGrant(userId: string, now = Date.now()) {
  const payload = `${userId}.${now + RESET_GRANT_TTL_MS}`;
  const sig = sign(payload);
  return sig ? `${payload}.${sig}` : null;
}

export function hasResetGrant(value: string | undefined, userId: string, now = Date.now()) {
  if (!value) return false;
  const [uid, exp, sig] = value.split(".");
  if (uid !== userId || !exp || !sig || !(Number(exp) > now)) return false;
  const expected = sign(`${uid}.${exp}`);
  if (!expected) return false;
  const a = Buffer.from(sig), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
