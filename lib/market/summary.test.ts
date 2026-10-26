import { test } from "node:test";
import assert from "node:assert/strict";
import { summarize } from "./summary.ts";

test("market summary follows the market when nothing says otherwise", () => {
  assert.equal(summarize("Wheat prices", 13.2, 90, ["All-Purpose Flour", "Bread Flour"]), "Wheat prices are up 13.2% over 90 days — your All-Purpose Flour, Bread Flour costs may follow.");
  assert.equal(summarize("Butter prices", -15.2, 90, ["Unsalted Butter"]), "Butter prices are down 15.2% over 90 days — your Unsalted Butter costs may ease.");
  assert.equal(summarize("Butter prices", 0.4, 90, ["Unsalted Butter"]), "Butter prices are roughly flat over 90 days.");
});

test("when your own price moved against the market, it says so", () => {
  assert.equal(
    summarize("Butter prices", -15.2, 90, ["Unsalted Butter"], { ingredient: "Unsalted Butter", pct: 16.5 }),
    "Butter prices are down 15.2% over 90 days, but your Unsalted Butter went up 16.5% on your latest invoice — worth asking your supplier why.",
  );
  // Same direction as the market: the usual line.
  assert.match(summarize("Eggs prices", 62.3, 90, ["Large Eggs"], { ingredient: "Large Eggs", pct: 12.5 }), /may follow\.$/);
});
