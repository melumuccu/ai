#!/usr/bin/env node

import { copyFile, lstat, mkdir, readdir, realpath } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
	console.log(`Usage:
  node .agents/skills/kf-g-github-operations-bot-workflow/sample/scripts/github-agent-sync-home.mjs

Sync sample files to ~/.agents/credentials/github.
Copies all files except .env.example. Existing .env and private keys are preserved
when not present in sample.

Options:
  --help  Show this help message.`);
	process.exit(0);
}

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const sampleRoot = dirname(scriptsDir);
const destinationRoot = join(homedir(), ".agents", "credentials", "github");

async function resolvePath(path) {
	try {
		return await realpath(path);
	} catch (error) {
		if (error.code === "ENOENT") {
			return resolve(path);
		}
		throw error;
	}
}

async function assertDistinctPaths(sourceRoot, destRoot) {
	const resolvedSource = await resolvePath(sourceRoot);
	const resolvedDestination = await resolvePath(destRoot);

	if (resolvedSource === resolvedDestination) {
		console.error("Error: source and destination are the same directory.");
		process.exit(1);
	}
}

async function syncDirectory(sourceDir, destDir) {
	let copyCount = 0;
	const entries = await readdir(sourceDir, { withFileTypes: true });

	for (const entry of entries) {
		const sourcePath = join(sourceDir, entry.name);
		const destPath = join(destDir, entry.name);

		if (entry.isSymbolicLink()) {
			continue;
		}

		const stats = await lstat(sourcePath);

		if (stats.isSymbolicLink()) {
			continue;
		}

		if (stats.isDirectory()) {
			await mkdir(destPath, { recursive: true });
			copyCount += await syncDirectory(sourcePath, destPath);
			continue;
		}

		if (!stats.isFile()) {
			continue;
		}

		if (basename(sourcePath) === ".env.example") {
			continue;
		}

		await mkdir(dirname(destPath), { recursive: true });
		await copyFile(sourcePath, destPath);
		copyCount += 1;
	}

	return copyCount;
}

try {
	await assertDistinctPaths(sampleRoot, destinationRoot);
	await mkdir(destinationRoot, { recursive: true });

	const copyCount = await syncDirectory(sampleRoot, destinationRoot);

	console.log(`Synced ${copyCount} file(s) to ${destinationRoot}`);
} catch (error) {
	console.error(`Error: ${error.message}`);
	process.exit(1);
}
