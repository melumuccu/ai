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
  node ~/.agents/credentials/github/scripts/github-agent-create-issue.mjs OWNER/REPO --title TITLE BODY_FILE

Options:
  --title  Issue title.
  --body-file  Markdown file for the issue body (alternative positional).`);
	process.exit(0);
}

try {
	const repoValue = getOption(args, "--repo") ?? args.shift();
	const title = getOption(args, "--title");
	const bodyFile = getOption(args, "--body-file") ?? args.shift();

	if (!repoValue || !title || !bodyFile || args.length > 0) {
		throw new Error(
			"Usage: github-agent-create-issue.mjs OWNER/REPO --title TITLE BODY_FILE"
		);
	}

	const { owner, repo } = parseRepository(repoValue);
	const body = await readMarkedBody(bodyFile);

	const issue = await githubWriteRequest(
		`/repos/${owner}/${repo}/issues`,
		{
			method: "POST",
			body: JSON.stringify({ title, body })
		},
		repoValue
	);

	console.log(issue.html_url);
} catch (error) {
	exitWithPreflightFailure(error);
}
