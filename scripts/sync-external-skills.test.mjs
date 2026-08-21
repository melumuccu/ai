import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applySync,
  collectCheckFailures,
  EXTERNAL_PLUGIN_SOURCE,
  marketplaceSkillPathsFromLockNames,
  parseArgs,
  readLockSkillNames,
} from "./sync-external-skills.mjs";

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function makeFixture() {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "sync-external-skills-"));
  await writeJson(path.join(cwd, "skills-lock.json"), {
    version: 1,
    skills: {
      foo: { source: "example/foo" },
      bar: { source: "example/bar" },
    },
  });
  await mkdir(path.join(cwd, ".agents/skills/foo"), { recursive: true });
  await mkdir(path.join(cwd, ".agents/skills/bar"), { recursive: true });
  await mkdir(path.join(cwd, ".agents/skills/#kf-global/kf-x"), { recursive: true });
  await writeFile(path.join(cwd, ".agents/skills/foo/SKILL.md"), "foo\n");
  await writeFile(path.join(cwd, ".agents/skills/bar/SKILL.md"), "bar\n");
  await writeFile(path.join(cwd, ".agents/skills/#kf-global/kf-x/SKILL.md"), "kf\n");
  await writeJson(path.join(cwd, ".claude-plugin/marketplace.json"), {
    name: "test-marketplace",
    plugins: [
      {
        name: "kf-global",
        source: "./.agents/skills/#kf-global",
        skills: ["./kf-x"],
        strict: false,
      },
      {
        name: "external",
        source: "./.agents/skills",
        skills: ["./stale"],
        strict: false,
      },
    ],
  });
  return cwd;
}

test("parseArgs は apply と check を排他にする", () => {
  assert.deepEqual(parseArgs(["--apply", "--stage"]), {
    apply: true,
    check: false,
    stage: true,
  });
});

test("lock キーから marketplace パスをソートして作る", () => {
  assert.deepEqual(marketplaceSkillPathsFromLockNames(["zeta", "alpha"]), [
    "./alpha",
    "./zeta",
  ]);
});

test("apply は lock キーだけを A へコピーし marketplace を直す", async () => {
  const cwd = await makeFixture();
  try {
    const lockNames = await readLockSkillNames(cwd);
    await applySync(cwd, lockNames);
    const marketplace = JSON.parse(
      await readFile(path.join(cwd, ".claude-plugin/marketplace.json"), "utf8"),
    );
    const external = marketplace.plugins.find((plugin) => plugin.name === "external");
    assert.equal(external.source, EXTERNAL_PLUGIN_SOURCE);
    assert.deepEqual(external.skills, ["./bar", "./foo"]);
    assert.deepEqual(marketplace.plugins[0].skills, ["./kf-x"]);
    const foo = await readFile(
      path.join(cwd, ".agents-external-skills/foo/SKILL.md"),
      "utf8",
    );
    assert.equal(foo, "foo\n");
    await assert.rejects(
      readFile(path.join(cwd, ".agents-external-skills/#kf-global/kf-x/SKILL.md")),
    );
    const failures = await collectCheckFailures(cwd, lockNames);
    assert.deepEqual(failures, []);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("check は lock に無い A ディレクトリを失敗にする", async () => {
  const cwd = await makeFixture();
  try {
    const lockNames = await readLockSkillNames(cwd);
    await applySync(cwd, lockNames);
    await mkdir(path.join(cwd, ".agents-external-skills/extra"), { recursive: true });
    await writeFile(path.join(cwd, ".agents-external-skills/extra/SKILL.md"), "x\n");
    const failures = await collectCheckFailures(cwd, lockNames);
    assert.ok(failures.some((line) => line.includes(".agents-external-skills")));
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("apply は lock から外れた A ディレクトリを削除する", async () => {
  const cwd = await makeFixture();
  try {
    const lockNames = await readLockSkillNames(cwd);
    await applySync(cwd, lockNames);
    await mkdir(path.join(cwd, ".agents-external-skills/extra"), { recursive: true });
    await writeFile(path.join(cwd, ".agents-external-skills/extra/SKILL.md"), "x\n");
    await applySync(cwd, lockNames);
    await assert.rejects(
      readFile(path.join(cwd, ".agents-external-skills/extra/SKILL.md")),
    );
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
