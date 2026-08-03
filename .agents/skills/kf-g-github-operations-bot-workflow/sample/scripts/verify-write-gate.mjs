#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const preflightScript = join(scriptsDir, "github-agent-preflight.mjs");
const commentScript = join(scriptsDir, "github-agent-comment.mjs");

function runNode(script, args = [], env = process.env) {
	return spawnSync(process.execPath, [script, ...args], {
		cwd: process.cwd(),
		env,
		encoding: "utf8"
	});
}

function assertExit(result, expectedCode, label) {
	if (result.status !== expectedCode) {
		console.error(`FAIL: ${label}`);
		console.error(result.stdout);
		console.error(result.stderr);
		process.exit(1);
	}

	console.log(`PASS: ${label}`);
}

const cleanEnv = { ...process.env };
delete cleanEnv.AI_AGENT_GITHUB_CLIENT_ID;
delete cleanEnv.AI_AGENT_GITHUB_APP_ID;
delete cleanEnv.AI_AGENT_GITHUB_INSTALLATION_ID;
delete cleanEnv.AI_AGENT_GITHUB_PRIVATE_KEY_PATH;
delete cleanEnv.GITDOC_AGENT_CLIENT_ID;
delete cleanEnv.GITDOC_AGENT_APP_ID;
delete cleanEnv.GITDOC_AGENT_INSTALLATION_ID;
delete cleanEnv.GITDOC_AGENT_PRIVATE_KEY_PATH;

const noBotResult = runNode(preflightScript, ["--repo", "melumuccu/ai"], cleanEnv);
assertExit(noBotResult, 1, "preflight fails without bot credentials");
if (!noBotResult.stderr.includes("GitHub App bot 資格情報")) {
	console.error("FAIL: preflight should show setup instructions");
	process.exit(1);
}
console.log("PASS: preflight shows setup instructions");

const humanOnlyEnv = {
	...cleanEnv,
	GH_TOKEN: "github_pat_human_only_for_read"
};
const humanOnlyResult = runNode(preflightScript, ["--repo", "melumuccu/ai"], humanOnlyEnv);
assertExit(humanOnlyResult, 1, "preflight rejects human GH_TOKEN without bot credentials");

const tempDir = mkdtempSync(join(tmpdir(), "github-agent-verify-"));
const bodyFile = join(tempDir, "body.md");
writeFileSync(bodyFile, "verification comment");

const commentNoBot = runNode(
	commentScript,
	["melumuccu/ai", "1", bodyFile],
	humanOnlyEnv
);
assertExit(commentNoBot, 1, "comment script rejects write without bot credentials");

const botConfigured =
	process.env.AI_AGENT_GITHUB_CLIENT_ID &&
	process.env.AI_AGENT_GITHUB_INSTALLATION_ID &&
	process.env.AI_AGENT_GITHUB_PRIVATE_KEY_PATH;

if (botConfigured) {
	const botPreflight = runNode(preflightScript, ["--repo", "melumuccu/ai"], process.env);
	assertExit(botPreflight, 0, "preflight succeeds with valid bot credentials");
	console.log("PASS: live bot credential check");
} else {
	console.log("SKIP: live bot credential check (bot env not configured in this shell)");
}

console.log("All write-gate verification checks passed.");
