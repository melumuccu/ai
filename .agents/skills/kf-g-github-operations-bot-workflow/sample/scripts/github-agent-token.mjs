#!/usr/bin/env node

import {
	createInstallationToken,
	exitWithPreflightFailure,
	loadBotConfig
} from "./github-agent-lib.mjs";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
	console.log(`Usage:
  node .agents/credentials/github/scripts/github-agent-token.mjs [--json]

Options:
  --json  Print non-secret installation token metadata only.`);
	process.exit(0);
}

try {
	await loadBotConfig();
	const token = await createInstallationToken();

	if (args.includes("--json")) {
		console.log(
			JSON.stringify(
				{
					expires_at: token.expires_at,
					permissions: token.permissions ?? {},
					repository_selection: token.repository_selection
				},
				null,
				2
			)
		);
	} else {
		console.log(`Installation token expires_at: ${token.expires_at}`);
	}
} catch (error) {
	exitWithPreflightFailure(error);
}
