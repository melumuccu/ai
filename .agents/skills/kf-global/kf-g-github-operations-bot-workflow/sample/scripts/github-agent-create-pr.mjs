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
  node ~/.agents/credentials/github/scripts/github-agent-create-pr.mjs OWNER/REPO --head BRANCH --base BASE [--title TITLE] BODY_FILE

Options:
  --head   Head branch name.
  --base   Base branch name.
  --title  PR title. Default: first line of BODY_FILE.`);
	process.exit(0);
}

try {
	const repoValue = getOption(args, "--repo") ?? args.shift();
	const head = getOption(args, "--head");
	const base = getOption(args, "--base");
	const titleOption = getOption(args, "--title");
	const bodyFile = getOption(args, "--body-file") ?? args.shift();

	if (!repoValue || !head || !base || !bodyFile || args.length > 0) {
		throw new Error(
			"Usage: github-agent-create-pr.mjs OWNER/REPO --head BRANCH --base BASE [--title TITLE] BODY_FILE"
		);
	}

	const { owner, repo } = parseRepository(repoValue);
	const body = await readMarkedBody(bodyFile);
	const title =
		titleOption ??
		body
			.split(/\r?\n/)
			.find((line) => line.trim())
			?.replace(/^#\s*/, "")
			.trim();

	if (!title) {
		throw new Error("PR title is required. Pass --title or include a heading in BODY_FILE.");
	}

	const pullRequest = await githubWriteRequest(
		`/repos/${owner}/${repo}/pulls`,
		{
			method: "POST",
			body: JSON.stringify({ title, head, base, body })
		},
		repoValue
	);

	console.log(pullRequest.html_url);
} catch (error) {
	exitWithPreflightFailure(error);
}
