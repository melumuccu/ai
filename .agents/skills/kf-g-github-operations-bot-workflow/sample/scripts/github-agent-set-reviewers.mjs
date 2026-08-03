#!/usr/bin/env node

import {
	exitWithPreflightFailure,
	getOption,
	githubWriteRequest,
	parseRepository
} from "./github-agent-lib.mjs";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
	console.log(`Usage:
  node .agents/credentials/github/scripts/github-agent-set-reviewers.mjs OWNER/REPO PR_NUMBER REVIEWER [REVIEWER...]

Arguments:
  OWNER/REPO   Target repository.
  PR_NUMBER    Pull request number.
  REVIEWER     One or more GitHub usernames.`);
	process.exit(0);
}

try {
	const repoValue = getOption(args, "--repo") ?? args.shift();
	const pullNumberValue = getOption(args, "--number") ?? args.shift();
	const reviewers = args;

	if (!repoValue || !pullNumberValue || reviewers.length === 0) {
		throw new Error(
			"Usage: github-agent-set-reviewers.mjs OWNER/REPO PR_NUMBER REVIEWER [REVIEWER...]"
		);
	}

	const { owner, repo } = parseRepository(repoValue);
	const pullNumber = Number.parseInt(pullNumberValue, 10);

	if (!Number.isInteger(pullNumber) || pullNumber <= 0) {
		throw new Error("PR_NUMBER must be a positive integer.");
	}

	const result = await githubWriteRequest(
		`/repos/${owner}/${repo}/pulls/${pullNumber}/requested_reviewers`,
		{
			method: "POST",
			body: JSON.stringify({ reviewers })
		},
		repoValue
	);

	const names = result.requested_reviewers?.map((reviewer) => reviewer.login).join(", ") ?? "";
	console.log(`Reviewers set on PR #${pullNumber}: ${names}`);
} catch (error) {
	exitWithPreflightFailure(error);
}
