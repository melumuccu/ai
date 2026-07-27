import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = join(ROOT, "bin/kf-lint.js");

test("cli verify detects bad fixture directory", () => {
  const result = spawnSync(process.execPath, [CLI, "verify", "fixtures/css/phase1-bad.css"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /css\/no-vw-vh/);
});

test("cli verify passes good fixture directory", () => {
  const result = spawnSync(process.execPath, [CLI, "verify", "fixtures/css/phase1-good.css"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(result.status, 0);
});

test("cli init creates config file in temp cwd", () => {
  const tmp = mkdtempSync(join(tmpdir(), "kf-lint-init-"));
  try {
    const result = spawnSync(process.execPath, [CLI, "init"], {
      cwd: tmp,
      encoding: "utf8",
    });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Created/);
    assert.equal(
      JSON.parse(readFileSync(join(tmp, ".kf-lintrc.json"), "utf8")).extendsRecommended,
      true,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
