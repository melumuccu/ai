import { createSign } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const credentialsDir = dirname(scriptsDir);
const envPath = join(credentialsDir, ".env");

export const agentMarker = "<!-- ai-agent-melumuccu:v1 -->";

export const SETUP_INSTRUCTIONS = `GitHub App bot 資格情報が未設定または無効です。

1. sample を local credential ディレクトリへコピーする:
   mkdir -p .agents/credentials/github
   cp -R .agents/skills/kf-g-github-operations-bot-workflow/sample/. .agents/credentials/github/
   mv .agents/credentials/github/.env.example .agents/credentials/github/.env

2. .env に bot 投稿用の値を記入する:
   AI_AGENT_GITHUB_CLIENT_ID
   AI_AGENT_GITHUB_INSTALLATION_ID
   AI_AGENT_GITHUB_PRIVATE_KEY_PATH

3. GitHub App private key (.pem) を .agents/credentials/github 直下へ配置する。

4. 権限を設定する:
   chmod 600 .agents/credentials/github/.env
   chmod 600 .agents/credentials/github/*.private-key.pem

5. preflight で確認する:
   node .agents/credentials/github/scripts/github-agent-preflight.mjs --repo OWNER/REPO

詳細: .agents/skills/kf-g-github-operations-bot-workflow/references/github-app-credentials.md

注意: 人間ユーザの gh 認証や GH_TOKEN では AI の GitHub 書き込みを行いません。`;

export class PreflightError extends Error {
	constructor(code, message, details = {}) {
		super(message);
		this.name = "PreflightError";
		this.code = code;
		this.details = details;
	}
}

export function exitWithPreflightFailure(error) {
	if (error instanceof PreflightError) {
		console.error(`GitHub bot preflight failed (${error.code}): ${error.message}`);

		if (error.details.missing?.length) {
			console.error(`Missing: ${error.details.missing.join(", ")}`);
		}
	} else {
		console.error(`GitHub bot preflight failed: ${error.message}`);
	}

	console.error(`\n${SETUP_INSTRUCTIONS}`);
	process.exit(1);
}

export async function loadBotConfig() {
	const env = await loadDotEnv();
	const readEnv = (name) => process.env[name] ?? env[name];
	const clientId =
		readEnv("AI_AGENT_GITHUB_CLIENT_ID") ??
		readEnv("AI_AGENT_GITHUB_APP_ID") ??
		readEnv("GITDOC_AGENT_CLIENT_ID") ??
		readEnv("GITDOC_AGENT_APP_ID");
	const installationId =
		readEnv("AI_AGENT_GITHUB_INSTALLATION_ID") ??
		readEnv("GITDOC_AGENT_INSTALLATION_ID");
	const privateKeyPath =
		readEnv("AI_AGENT_GITHUB_PRIVATE_KEY_PATH") ??
		readEnv("GITDOC_AGENT_PRIVATE_KEY_PATH");
	const apiUrl = (readEnv("AI_AGENT_GITHUB_API_URL") ?? "https://api.github.com").replace(
		/\/$/,
		""
	);

	const missing = [
		["AI_AGENT_GITHUB_CLIENT_ID or AI_AGENT_GITHUB_APP_ID", clientId],
		["AI_AGENT_GITHUB_INSTALLATION_ID", installationId],
		["AI_AGENT_GITHUB_PRIVATE_KEY_PATH", privateKeyPath]
	]
		.filter(([, value]) => !value)
		.map(([name]) => name);

	if (missing.length > 0) {
		throw new PreflightError("missing_credentials", "Required bot credentials are missing.", {
			missing
		});
	}

	const resolvedPrivateKeyPath = resolveCredentialPath(privateKeyPath);

	if (!existsSync(resolvedPrivateKeyPath)) {
		throw new PreflightError("missing_private_key", "Private key file not found.", {
			privateKeyPath: resolvedPrivateKeyPath
		});
	}

	return {
		apiUrl,
		clientId,
		installationId,
		privateKeyPath: resolvedPrivateKeyPath
	};
}

export async function createInstallationToken(config) {
	const resolvedConfig = config ?? (await loadBotConfig());
	const jwt = await createAppJwt(resolvedConfig);
	const response = await fetch(
		`${resolvedConfig.apiUrl}/app/installations/${resolvedConfig.installationId}/access_tokens`,
		{
			method: "POST",
			headers: {
				accept: "application/vnd.github+json",
				authorization: `Bearer ${jwt}`,
				"content-type": "application/json",
				"x-github-api-version": "2022-11-28"
			}
		}
	);

	if (!response.ok) {
		throw new PreflightError(
			"token_issue_failed",
			`Installation token request failed (${response.status}).`
		);
	}

	return response.json();
}

export async function preflightWriteGate(owner, repo) {
	const config = await loadBotConfig();
	const tokenResponse = await createInstallationToken(config);
	const headers = {
		accept: "application/vnd.github+json",
		authorization: `Bearer ${tokenResponse.token}`,
		"content-type": "application/json",
		"x-github-api-version": "2022-11-28"
	};

	let repository = null;

	if (owner && repo) {
		const response = await fetch(`${config.apiUrl}/repos/${owner}/${repo}`, { headers });

		if (response.status === 404) {
			throw new PreflightError(
				"repository_not_found",
				`Repository ${owner}/${repo} is not accessible with the bot installation token.`
			);
		}

		if (!response.ok) {
			throw new PreflightError(
				"repository_access_failed",
				`Repository access check failed (${response.status}).`
			);
		}

		repository = await response.json();
	}

	return {
		apiUrl: config.apiUrl,
		expiresAt: tokenResponse.expires_at,
		headers,
		permissions: tokenResponse.permissions ?? {},
		repository,
		token: tokenResponse.token
	};
}

export async function githubWriteRequest(path, init = {}, repository = null) {
	let owner;
	let repo;

	if (repository) {
		({ owner, repo } = parseRepository(repository));
	}

	const gate = await preflightWriteGate(owner, repo);
	const response = await fetch(`${gate.apiUrl}${path}`, {
		...init,
		headers: {
			...gate.headers,
			...init.headers
		}
	});

	if (!response.ok) {
		throw new Error(await formatGitHubError(response));
	}

	if (response.status === 204) {
		return null;
	}

	const text = await response.text();
	return text ? JSON.parse(text) : null;
}

export async function githubGraphqlRequest(query, variables = {}, repository = null) {
	let owner;
	let repo;

	if (repository) {
		({ owner, repo } = parseRepository(repository));
	}

	const gate = await preflightWriteGate(owner, repo);
	const response = await fetch(`${gate.apiUrl}/graphql`, {
		method: "POST",
		headers: gate.headers,
		body: JSON.stringify({ query, variables })
	});

	if (!response.ok) {
		throw new Error(await formatGitHubError(response));
	}

	const payload = await response.json();

	if (payload.errors?.length) {
		throw new Error(
			`GitHub GraphQL request failed:\n${payload.errors.map((error) => error.message).join("\n")}`
		);
	}

	return payload.data;
}

export async function githubRequest(path, init = {}, repository = null) {
	return githubWriteRequest(path, init, repository);
}

export function parseRepository(value) {
	const [owner, repo, extra] = value.split("/");

	if (!owner || !repo || extra) {
		throw new Error("Repository must be OWNER/REPO.");
	}

	return { owner, repo };
}

export async function readMarkedBody(filePath) {
	const body = (await readFile(filePath, "utf8")).trimEnd();

	if (body.includes(agentMarker)) {
		return body;
	}

	return `${agentMarker}\n\n${body}`;
}

export function getOption(args, name) {
	const index = args.indexOf(name);

	if (index === -1) {
		return undefined;
	}

	const value = args[index + 1];

	if (!value || value.startsWith("--")) {
		throw new Error(`${name} requires a value.`);
	}

	args.splice(index, 2);
	return value;
}

export function getRequiredRepositoryOption(args) {
	const repository = getOption(args, "--repo") ?? args.shift();

	if (!repository) {
		throw new Error("--repo OWNER/REPO is required.");
	}

	return repository;
}

async function loadConfig() {
	return loadBotConfig();
}

async function loadDotEnv() {
	if (!existsSync(envPath)) {
		return {};
	}

	const contents = await readFile(envPath, "utf8");
	const env = {};

	for (const line of contents.split(/\r?\n/)) {
		const trimmed = line.trim();

		if (!trimmed || trimmed.startsWith("#")) {
			continue;
		}

		const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed);

		if (!match) {
			continue;
		}

		env[match[1]] = unquoteEnvValue(match[2].trim());
	}

	return env;
}

function unquoteEnvValue(value) {
	if (
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'"))
	) {
		return value.slice(1, -1);
	}

	return value;
}

function resolveCredentialPath(value) {
	if (isAbsolute(value)) {
		return value;
	}

	const candidates = [
		resolve(process.cwd(), value),
		resolve(credentialsDir, value),
		resolve(credentialsDir, basename(value))
	];

	for (const candidate of candidates) {
		if (existsSync(candidate)) {
			return candidate;
		}
	}

	return candidates[0];
}

async function createAppJwt(config) {
	const privateKey = await readFile(config.privateKeyPath, "utf8");
	const now = Math.floor(Date.now() / 1000);
	const header = base64UrlJson({ alg: "RS256", typ: "JWT" });
	const payload = base64UrlJson({
		iat: now - 60,
		exp: now + 540,
		iss: config.clientId
	});
	const signingInput = `${header}.${payload}`;
	const signer = createSign("RSA-SHA256");
	signer.update(signingInput);
	signer.end();

	return `${signingInput}.${signer.sign(privateKey, "base64url")}`;
}

function base64UrlJson(value) {
	return Buffer.from(JSON.stringify(value)).toString("base64url");
}

async function formatGitHubError(response) {
	const text = await response.text();
	return `GitHub API request failed: ${response.status} ${response.statusText}\n${text}`;
}
