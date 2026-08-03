#!/usr/bin/env node

import { generateKeyPairSync, randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const temporaryDirectory = await mkdtemp(join(tmpdir(), "github-agent-session-verify-"));
const privateKeyPath = join(temporaryDirectory, "test.private-key.pem");
const keyPair = generateKeyPairSync("rsa", { modulusLength: 2048 });
const privateKey = keyPair.privateKey.export({ format: "pem", type: "pkcs1" });
const sessionId = `verify-${randomUUID()}`;
const originalFetch = globalThis.fetch;
const originalEnvironment = {
	AI_AGENT_GITHUB_API_URL: process.env.AI_AGENT_GITHUB_API_URL,
	AI_AGENT_GITHUB_CLIENT_ID: process.env.AI_AGENT_GITHUB_CLIENT_ID,
	AI_AGENT_GITHUB_INSTALLATION_ID: process.env.AI_AGENT_GITHUB_INSTALLATION_ID,
	AI_AGENT_GITHUB_PRIVATE_KEY_PATH: process.env.AI_AGENT_GITHUB_PRIVATE_KEY_PATH,
	AI_AGENT_GITHUB_SESSION_ID: process.env.AI_AGENT_GITHUB_SESSION_ID
};
let tokenRequests = 0;
let repositoryRequests = 0;
const markerPaths = [];

function restoreEnvironment() {
	for (const [name, value] of Object.entries(originalEnvironment)) {
		if (value === undefined) {
			delete process.env[name];
		} else {
			process.env[name] = value;
		}
	}
}

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

try {
	await writeFile(privateKeyPath, privateKey, { mode: 0o600 });
	process.env.AI_AGENT_GITHUB_API_URL = "https://github.example.test/api";
	process.env.AI_AGENT_GITHUB_CLIENT_ID = "test-client-id";
	process.env.AI_AGENT_GITHUB_INSTALLATION_ID = "12345";
	process.env.AI_AGENT_GITHUB_PRIVATE_KEY_PATH = privateKeyPath;
	process.env.AI_AGENT_GITHUB_SESSION_ID = sessionId;

	globalThis.fetch = async (url) => {
		const requestUrl = String(url);

		if (requestUrl.endsWith("/access_tokens")) {
			tokenRequests += 1;
			return Response.json({
				token: `test-installation-token-${tokenRequests}`,
				expires_at: "2099-01-01T00:00:00Z",
				permissions: { issues: "write" }
			});
		}

		if (requestUrl.endsWith("/repos/melumuccu/ai")) {
			repositoryRequests += 1;
			return Response.json({ full_name: "melumuccu/ai" });
		}

		throw new Error(`Unexpected request: ${requestUrl}`);
	};

	const { getSessionPreflightMarkerPath, loadBotConfig, preflightWriteGate } = await import(
		"./github-agent-lib.mjs"
	);
	const config = await loadBotConfig();
	const firstMarkerPath = getSessionPreflightMarkerPath(config, "melumuccu", "ai");
	markerPaths.push(firstMarkerPath);

	await preflightWriteGate("melumuccu", "ai");
	await preflightWriteGate("melumuccu", "ai");
	assert(repositoryRequests === 1, "same session must check repository access once");
	assert(tokenRequests === 2, "same session must issue an installation token for each write");

	const markerContents = await readFile(firstMarkerPath, "utf8");
	assert(!markerContents.includes("test-installation-token"), "marker must not contain a token");
	assert(!markerContents.includes(privateKey), "marker must not contain a private key");

	process.env.AI_AGENT_GITHUB_SESSION_ID = `verify-${randomUUID()}`;
	markerPaths.push(getSessionPreflightMarkerPath(config, "melumuccu", "ai"));
	await preflightWriteGate("melumuccu", "ai");
	assert(repositoryRequests === 2, "different session must check repository access again");
	assert(tokenRequests === 3, "different session must issue an installation token");

	console.log("PASS: session preflight reuses only repository access checks");
} catch (error) {
	console.error(`FAIL: ${error.message}`);
	process.exitCode = 1;
} finally {
	globalThis.fetch = originalFetch;
	restoreEnvironment();
	await Promise.all(markerPaths.map((markerPath) => rm(markerPath, { force: true })));
	await rm(temporaryDirectory, { recursive: true, force: true });
}
