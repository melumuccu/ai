#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_ROOT="${HOME}/.cursor/hooks/ai-ja-readability"
DEST_HOOKS_JSON="${HOME}/.cursor/hooks.json"

mkdir -p "${HOME}/.cursor/hooks"

ENV_EXAMPLE="${SCRIPT_DIR}/ai-ja-readability.env.example"
ENV_DEST="${DEST_ROOT}/ai-ja-readability.env"
LEGACY_ENV="${HOME}/.cursor/ai-ja-readability.env"
LEGACY_SCRIPT="${HOME}/.cursor/ai-ja-readability-session-env.py"
ENV_BACKUP=""
if [[ -e "${ENV_DEST}" ]]; then
  ENV_BACKUP="$(mktemp)"
  cp "${ENV_DEST}" "${ENV_BACKUP}"
elif [[ -e "${LEGACY_ENV}" ]]; then
  ENV_BACKUP="$(mktemp)"
  cp "${LEGACY_ENV}" "${ENV_BACKUP}"
fi

rm -rf "${DEST_ROOT}"
cp -a "${SCRIPT_DIR}" "${DEST_ROOT}"
chmod +x "${DEST_ROOT}/ja-rewrite.py" "${DEST_ROOT}/ai-ja-readability-session-env.py"

if [[ -n "${ENV_BACKUP}" ]]; then
  cp "${ENV_BACKUP}" "${ENV_DEST}"
  rm -f "${ENV_BACKUP}"
else
  cp "${ENV_EXAMPLE}" "${ENV_DEST}"
fi
chmod 600 "${ENV_DEST}"
rm -f "${LEGACY_ENV}" "${LEGACY_SCRIPT}"

echo "Installed hook implementation to ${DEST_ROOT}"
echo ""
echo "Register in ${DEST_HOOKS_JSON} (paths are relative to ~/.cursor/):"
echo ""
sed 's/^/  /' "${SCRIPT_DIR}/hooks.json.example"
echo ""
echo "変数は ${ENV_DEST} に入れてください。"
echo "GEMINI_API_KEY は必須です。CLI 経路を使うときは JA_REWRITE_CURSOR_CLI_MODEL も入れてください。"
echo "Policy: https://ai-html.hacksaw.work/2026-09-22_%E6%97%A5%E6%9C%AC%E8%AA%9E%E6%A0%A1%E6%AD%A3hook%E6%96%B9%E9%87%9D_v4.html"
