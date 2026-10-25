import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCsv, toCsv } from "./csv.ts";

test("a name that looks like a formula is written as text and read back as typed", () => {
  const names = ['=HYPERLINK("http://x","click")', "+1 flour", "-cocoa", "@sugar", "Plain flour"];
  const csv = toCsv(["name", "cost"], names.map((n, i) => [n, i === 2 ? -1 : 1.5]));
  for (const line of csv.trim().split("\r\n").slice(1)) assert.ok(!/^[=+\-@]/.test(line.replace(/^"/, "")), line);
  assert.ok(csv.includes(",-1\r\n"), "numbers stay numbers");
  assert.deepEqual(parseCsv(csv).slice(1).map((r) => r[0]), names);
});

test("an apostrophe that isn't a formula guard is kept", () => {
  assert.deepEqual(parseCsv("name\r\n'Nduja\r\n"), [["name"], ["'Nduja"]]);
});
