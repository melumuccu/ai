#!/usr/bin/env node

import {
	exitWithPreflightFailure,
	getOption,
	githubGraphqlRequest,
	parseRepository
} from "./github-agent-lib.mjs";

const FIND_THREAD_QUERY = `
query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          comments(first: 50) {
            nodes {
              databaseId
            }
          }
        }
      }
    }
  }
}`;

const RESOLVE_THREAD_MUTATION = `
mutation($threadId: ID!) {
  resolveReviewThread(input: {threadId: $threadId}) {
    thread {
      id
      isResolved
    }
  }
}`;

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
	console.log(`Usage:
  node ~/.agents/credentials/github/scripts/github-agent-resolve-thread.mjs OWNER/REPO PR_NUMBER --comment-id COMMENT_ID
  node ~/.agents/credentials/github/scripts/github-agent-resolve-thread.mjs OWNER/REPO PR_NUMBER --thread-id THREAD_ID

Options:
  --comment-id  Resolve the thread containing this review comment ID.
  --thread-id   Resolve this GraphQL review thread ID directly.`);
	process.exit(0);
}

try {
	const repoValue = getOption(args, "--repo") ?? args.shift();
	const pullNumberValue = getOption(args, "--number") ?? args.shift();
	const commentIdValue = getOption(args, "--comment-id");
	const threadIdValue = getOption(args, "--thread-id");

	if (!repoValue || !pullNumberValue || args.length > 0) {
		throw new Error(
			"Usage: github-agent-resolve-thread.mjs OWNER/REPO PR_NUMBER (--comment-id ID | --thread-id ID)"
		);
	}

	if (!commentIdValue && !threadIdValue) {
		throw new Error("Either --comment-id or --thread-id is required.");
	}

	const { owner, repo } = parseRepository(repoValue);
	const pullNumber = Number.parseInt(pullNumberValue, 10);

	if (!Number.isInteger(pullNumber) || pullNumber <= 0) {
		throw new Error("PR_NUMBER must be a positive integer.");
	}

	let threadId = threadIdValue;

	if (!threadId) {
		const commentId = Number.parseInt(commentIdValue, 10);

		if (!Number.isInteger(commentId) || commentId <= 0) {
			throw new Error("COMMENT_ID must be a positive integer.");
		}

		const data = await githubGraphqlRequest(
			FIND_THREAD_QUERY,
			{ owner, name: repo, number: pullNumber },
			repoValue
		);
		const threads = data.repository.pullRequest.reviewThreads.nodes;

		const matchedThread = threads.find((thread) =>
			thread.comments.nodes.some((comment) => comment.databaseId === commentId)
		);

		if (!matchedThread) {
			throw new Error(`Review thread not found for comment ID ${commentId}.`);
		}

		if (matchedThread.isResolved) {
			console.log(`Thread already resolved: ${matchedThread.id}`);
			process.exit(0);
		}

		threadId = matchedThread.id;
	}

	const result = await githubGraphqlRequest(
		RESOLVE_THREAD_MUTATION,
		{ threadId },
		repoValue
	);
	const thread = result.resolveReviewThread.thread;

	console.log(`Resolved thread ${thread.id}: isResolved=${thread.isResolved}`);
} catch (error) {
	exitWithPreflightFailure(error);
}
