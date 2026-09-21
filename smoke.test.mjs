import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("engines.node is >=24", () => {
  const pkg = JSON.parse(
    readFileSync(new URL("./package.json", import.meta.url), "utf8"),
  );
  assert.equal(pkg.engines?.node, ">=24");
});

test("runs on Node 24+", () => {
  const major = Number(process.versions.node.split(".")[0]);
  assert.ok(major >= 24, `expected Node >=24, got ${process.version}`);
});
