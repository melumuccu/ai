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
  node ~/.agents/credentials/github/scripts/github-agent-reply.mjs OWNER/REPO PR_NUMBER COMMENT_ID BODY_FILE

Arguments:
  OWNER/REPO   Target repository.
  PR_NUMBER    Pull request number.
  COMMENT_ID   Review comment ID to reply to.
  BODY_FILE    Markdown file for the reply body.`);
	process.exit(0);
}

try {
	const repoValue = getOption(args, "--repo") ?? args.shift();
	const pullNumberValue = getOption(args, "--number") ?? args.shift();
	const commentIdValue = getOption(args, "--comment-id") ?? args.shift();
	const bodyFile = getOption(args, "--body-file") ?? args.shift();

	if (!repoValue || !pullNumberValue || !commentIdValue || !bodyFile || args.length > 0) {
		throw new Error(
			"Usage: github-agent-reply.mjs OWNER/REPO PR_NUMBER COMMENT_ID BODY_FILE"
		);
	}

	const { owner, repo } = parseRepository(repoValue);
	const pullNumber = Number.parseInt(pullNumberValue, 10);
	const commentId = Number.parseInt(commentIdValue, 10);

	if (!Number.isInteger(pullNumber) || pullNumber <= 0) {
		throw new Error("PR_NUMBER must be a positive integer.");
	}

	if (!Number.isInteger(commentId) || commentId <= 0) {
		throw new Error("COMMENT_ID must be a positive integer.");
	}

	const body = await readMarkedBody(bodyFile);
	const reply = await githubWriteRequest(
		`/repos/${owner}/${repo}/pulls/${pullNumber}/comments`,
		{
			method: "POST",
			body: JSON.stringify({ body, in_reply_to: commentId })
		},
		repoValue
	);

	console.log(reply.html_url);
} catch (error) {
	exitWithPreflightFailure(error);
}
