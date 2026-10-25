# Security

## Reporting a vulnerability

Email **support@doughtally.app** with "Security" in the subject. Please
include what you found, how to reproduce it, and what it exposes. Don't
access other people's data beyond what's needed to show the problem, and
give us a reasonable time to fix it before making it public. We'll reply
within 3 business days.

## How data is protected

- Every business's rows are isolated by Postgres row-level security
  (`supabase/migrations/008_rls_policies.sql`), with cross-business
  references refused by trigger (`033_hardening.sql`). Users can't change
  which business their profile belongs to (`032_lock_profile_org.sql`).
- Uploaded files live in a private bucket scoped by the same rule; only
  photos and PDFs up to 25 MB are accepted.
- The service-role key is server-only (`lib/supabase/admin.ts`) and used
  for four things listed there.
- Security headers on every response (`next.config.ts`); dependencies
  checked with `npm audit`.
- Menu and recipe uploads are deleted after import (`lib/onboarding/purge.ts`).

## If personal information is exposed

California law (Civil Code §1798.82) requires notifying affected California
residents "in the most expedient time possible and without unreasonable
delay" when their unencrypted personal information, such as an email
address with its password, was or is reasonably believed to have been
acquired by someone unauthorized. If that's more than 500 California
residents, a sample of the notice also goes to the California Attorney
General. Other states have similar rules.

1. Contain it: fix the hole or revoke the leaked key (Supabase → Project
   Settings → API keys; Vercel → Environment Variables), and redeploy.
2. Work out what was accessed, whose, and when, from the Supabase and
   Vercel logs. Keep notes; keep the logs.
3. If personal information was acquired, notify the affected users: what
   happened, what information, what we've done, what they can do (such as
   changing their password), and how to reach us. Get legal advice on the
   wording and the deadlines.
4. Record what changed so it can't happen again.
