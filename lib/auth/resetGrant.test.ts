import { test } from "node:test";
import assert from "node:assert/strict";

process.env.SUPABASE_SECRET_KEY = "test-secret";
const { makeResetGrant, hasResetGrant, RESET_GRANT_TTL_MS } = await import("./resetGrant.ts");

test("a reset grant works only for its user, until it expires, and can't be edited", () => {
  const now = 1_800_000_000_000;
  const g = makeResetGrant("user-a", now)!;
  assert.equal(hasResetGrant(g, "user-a", now + 1000), true);
  assert.equal(hasResetGrant(g, "user-b", now + 1000), false);
  assert.equal(hasResetGrant(g, "user-a", now + RESET_GRANT_TTL_MS + 1), false);
  const [uid, exp, sig] = g.split(".");
  assert.equal(hasResetGrant(`${uid}.${Number(exp) + 3_600_000}.${sig}`, "user-a", now), false); // longer expiry, same signature
  assert.equal(hasResetGrant(undefined, "user-a", now), false);
  assert.equal(hasResetGrant("garbage", "user-a", now), false);
});

test("no secret, no grant", () => {
  const saved = process.env.SUPABASE_SECRET_KEY;
  delete process.env.SUPABASE_SECRET_KEY;
  assert.equal(makeResetGrant("user-a"), null);
  process.env.SUPABASE_SECRET_KEY = saved;
});
