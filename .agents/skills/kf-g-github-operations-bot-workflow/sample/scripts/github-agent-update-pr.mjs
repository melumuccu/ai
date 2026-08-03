#!/usr/bin/env node

import {
	exitWithPreflightFailure,
	getOption,
	githubWriteRequest,
	parseRepository,
	readMarkedBody
} from "./github-agent-lib.mjs";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
	console.log(`Usage:
  node .agents/credentials/github/scripts/github-agent-update-pr.mjs OWNER/REPO PR_NUMBER BODY_FILE

Arguments:
  OWNER/REPO   Target repository.
  PR_NUMBER    Pull request number.
  BODY_FILE    Markdown file for the updated PR body.`);
	process.exit(0);
}

try {
	const repoValue = getOption(args, "--repo") ?? args.shift();
	const pullNumberValue = getOption(args, "--number") ?? args.shift();
	const bodyFile = getOption(args, "--body-file") ?? args.shift();

	if (!repoValue || !pullNumberValue || !bodyFile || args.length > 0) {
		throw new Error("Usage: github-agent-update-pr.mjs OWNER/REPO PR_NUMBER BODY_FILE");
	}

	const { owner, repo } = parseRepository(repoValue);
	const pullNumber = Number.parseInt(pullNumberValue, 10);

	if (!Number.isInteger(pullNumber) || pullNumber <= 0) {
		throw new Error("PR_NUMBER must be a positive integer.");
	}

	const body = await readMarkedBody(bodyFile);
	const pullRequest = await githubWriteRequest(
		`/repos/${owner}/${repo}/pulls/${pullNumber}`,
		{
			method: "PATCH",
			body: JSON.stringify({ body })
		},
		repoValue
	);

	console.log(pullRequest.html_url);
} catch (error) {
	exitWithPreflightFailure(error);
}
