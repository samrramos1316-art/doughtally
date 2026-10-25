import { CLOSED_MESSAGE } from "@/lib/access";

// Why someone was sent to /login. Redirects carry the code (?error=expired),
// never the sentence, so a crafted link can't put its own words on our login
// page; an unknown code shows nothing.
export const LOGIN_ERRORS = {
  closed: CLOSED_MESSAGE,
  expired: "That confirmation link has expired or was already used. Log in, or send yourself a new one.",
  confirmed: "Your email address is confirmed. Log in to continue.",
  incomplete: "That confirmation link is incomplete. Log in, or send yourself a new one.",
} as const;

export type LoginErrorCode = keyof typeof LOGIN_ERRORS;

export function loginErrorMessage(code: string | undefined) {
  return code && Object.hasOwn(LOGIN_ERRORS, code) ? LOGIN_ERRORS[code as LoginErrorCode] : undefined;
}
