#!/usr/bin/env node

import {
	exitWithPreflightFailure,
	getOption,
	loadBotConfig,
	parseRepository,
	preflightWriteGate
} from "./github-agent-lib.mjs";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
	console.log(`Usage:
  node ~/.agents/credentials/github/scripts/github-agent-preflight.mjs [--repo OWNER/REPO]

Options:
  --repo  Verify repository access with the installation token.`);
	process.exit(0);
}

try {
	const repoOption = getOption(args, "--repo");
	let owner;
	let repo;

	if (repoOption) {
		({ owner, repo } = parseRepository(repoOption));
	}

	const config = await loadBotConfig();
	console.log("Bot credential files: ok");
	console.log(`Private key path: ${config.privateKeyPath}`);

	const gate = await preflightWriteGate(owner, repo);

	console.log(`Installation token expires_at: ${gate.expiresAt}`);

	if (Object.keys(gate.permissions).length > 0) {
		const permissionNames = Object.entries(gate.permissions)
			.filter(([, value]) => value)
			.map(([name]) => name)
			.join(", ");
		console.log(`Token permissions: ${permissionNames || "none reported"}`);
	}

	if (gate.repository) {
		console.log(`Repository access: ok (${gate.repository.full_name})`);
	}

	console.log("Preflight: ok");
} catch (error) {
	exitWithPreflightFailure(error);
}
