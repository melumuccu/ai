#!/usr/bin/env bash
# 編集後 lint/fmt 共通スクリプト（骨格）
#
# 前提:
# - cwd は project root
# - PJ で定義した mise task（例: format, lint）を呼ぶ
# - 初回のリポジトリ全体一括 format/lint fix はしない
# - fail-open（編集フローを止めない）
#
# 入力:
# - 引数: file_path
# - または stdin JSON の file_path / path / filePath
#
# 使い方:
# 1. 下の TARGET_EXTENSIONS と mise task 名を PJ に合わせて埋める
# 2. project hooks の after agent edit（必須）からこのスクリプトを呼ぶ
# 3. after tab edit があれば同じスクリプトを共用してよい

set -u

LOG_DIR="${TMPDIR:-/tmp}/pj-lint-fmt-hooks"
mkdir -p "$LOG_DIR"
LOG_FILE="${LOG_DIR}/lint-fmt-edited-file.log"

log() {
  printf '%s %s\n' "$(date -Iseconds 2>/dev/null || date)" "$*" >>"$LOG_FILE"
}

# fail-open: どの経路でも編集フローを止めない
finish() {
  exit 0
}
trap finish EXIT

# PJ ごとに調整する。特定ツール名は skill 標準では固定しない
TARGET_EXTENSIONS='ts|tsx|js|jsx|mjs|cjs|svelte|css|json|md'
FORMAT_TASK='format'
LINT_TASK='lint'

extract_file_path() {
  local raw="$1"
  if command -v python3 >/dev/null 2>&1; then
    FILE_PATH="$(
      printf '%s' "$raw" | python3 -c '
import json, sys
raw = sys.stdin.read().strip()
if not raw:
    raise SystemExit(0)
data = json.loads(raw)
for key in ("file_path", "path", "filePath"):
    value = data.get(key)
    if isinstance(value, str) and value:
        print(value)
        raise SystemExit(0)
file = data.get("file")
if isinstance(file, dict):
    for key in ("path", "file_path", "filePath"):
        value = file.get(key)
        if isinstance(value, str) and value:
            print(value)
            raise SystemExit(0)
' 2>/dev/null || true
    )"
  fi
}

FILE_PATH="${1:-}"

if [[ -z "${FILE_PATH}" ]]; then
  INPUT="$(cat || true)"
  extract_file_path "${INPUT}"
fi

if [[ -z "${FILE_PATH:-}" ]]; then
  log "skip: file_path missing"
  finish
fi

if [[ ! -f "${FILE_PATH}" ]]; then
  log "skip: not a file path=${FILE_PATH}"
  finish
fi

case "${FILE_PATH}" in
  *.)
    log "skip: unsupported path=${FILE_PATH}"
    finish
    ;;
esac

if [[ ! "${FILE_PATH}" =~ \.(${TARGET_EXTENSIONS})$ ]]; then
  log "skip: unsupported extension path=${FILE_PATH}"
  finish
fi

if ! command -v mise >/dev/null 2>&1; then
  log "skip: mise not found path=${FILE_PATH}"
  finish
fi

log "start path=${FILE_PATH}"

# ファイル単位で実行する。全体一括はしない
# task 側の引数受け取り方は PJ の mise.toml / package.json に合わせる
if ! mise run "${FORMAT_TASK}" -- "${FILE_PATH}" >>"$LOG_FILE" 2>&1; then
  log "format failed path=${FILE_PATH}"
fi

if ! mise run "${LINT_TASK}" -- "${FILE_PATH}" >>"$LOG_FILE" 2>&1; then
  log "lint failed path=${FILE_PATH}"
fi

log "done path=${FILE_PATH}"
finish
