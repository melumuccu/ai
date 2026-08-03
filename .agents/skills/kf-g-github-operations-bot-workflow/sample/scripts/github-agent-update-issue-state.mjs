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
  node ~/.agents/credentials/github/scripts/github-agent-update-issue-state.mjs OWNER/REPO ISSUE_NUMBER --state open|closed

Options:
  --state  Issue state to set.`);
	process.exit(0);
}

try {
	const repoValue = getOption(args, "--repo") ?? args.shift();
	const issueNumberValue = getOption(args, "--number") ?? args.shift();
	const state = getOption(args, "--state");

	if (!repoValue || !issueNumberValue || !state || args.length > 0) {
		throw new Error(
			"Usage: github-agent-update-issue-state.mjs OWNER/REPO ISSUE_NUMBER --state open|closed"
		);
	}

	if (!["open", "closed"].includes(state)) {
		throw new Error("--state must be open or closed.");
	}

	const { owner, repo } = parseRepository(repoValue);
	const issueNumber = Number.parseInt(issueNumberValue, 10);

	if (!Number.isInteger(issueNumber) || issueNumber <= 0) {
		throw new Error("ISSUE_NUMBER must be a positive integer.");
	}

	const issue = await githubWriteRequest(
		`/repos/${owner}/${repo}/issues/${issueNumber}`,
		{
			method: "PATCH",
			body: JSON.stringify({ state })
		},
		repoValue
	);

	console.log(`${issue.html_url} (${issue.state})`);
} catch (error) {
	exitWithPreflightFailure(error);
}
