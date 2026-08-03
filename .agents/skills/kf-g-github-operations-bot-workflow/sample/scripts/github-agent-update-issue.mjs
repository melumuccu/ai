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
  node .agents/credentials/github/scripts/github-agent-update-issue.mjs OWNER/REPO ISSUE_NUMBER BODY_FILE

Arguments:
  OWNER/REPO     Target repository.
  ISSUE_NUMBER   Issue number.
  BODY_FILE      Markdown file for the updated issue body.`);
	process.exit(0);
}

try {
	const repoValue = getOption(args, "--repo") ?? args.shift();
	const issueNumberValue = getOption(args, "--number") ?? args.shift();
	const bodyFile = getOption(args, "--body-file") ?? args.shift();

	if (!repoValue || !issueNumberValue || !bodyFile || args.length > 0) {
		throw new Error("Usage: github-agent-update-issue.mjs OWNER/REPO ISSUE_NUMBER BODY_FILE");
	}

	const { owner, repo } = parseRepository(repoValue);
	const issueNumber = Number.parseInt(issueNumberValue, 10);

	if (!Number.isInteger(issueNumber) || issueNumber <= 0) {
		throw new Error("ISSUE_NUMBER must be a positive integer.");
	}

	const body = await readMarkedBody(bodyFile);
	const issue = await githubWriteRequest(
		`/repos/${owner}/${repo}/issues/${issueNumber}`,
		{
			method: "PATCH",
			body: JSON.stringify({ body })
		},
		repoValue
	);

	console.log(issue.html_url);
} catch (error) {
	exitWithPreflightFailure(error);
}
