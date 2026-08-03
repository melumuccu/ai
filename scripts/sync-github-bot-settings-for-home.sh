#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SOURCE_DIR="${REPO_ROOT}/.agents/skills/kf-g-github-operations-bot-workflow/sample"
DEST_DIR="${HOME}/.agents/credentials/github"

show_help() {
  cat <<EOF
Usage:
  ./scripts/github-agent-sync-home.sh

Sync sample files to ~/.agents/credentials/github.
Copies all files except .env.example. Existing .env and private keys are preserved
when not present in sample.

Options:
  --help  Show this help message.
EOF
}

resolve_path() {
  local target="$1"

  if [[ -e "${target}" ]]; then
    if [[ -d "${target}" ]]; then
      (cd "${target}" && pwd -P)
      return
    fi

    echo "$(cd "$(dirname "${target}")" && pwd -P)/$(basename "${target}")"
    return
  fi

  if [[ "${target}" != /* ]]; then
    target="$(pwd)/${target}"
  fi

  local dir base
  dir="$(dirname "${target}")"
  base="$(basename "${target}")"

  if [[ -d "${dir}" ]]; then
    echo "$(cd "${dir}" && pwd -P)/${base}"
  else
    echo "${target}"
  fi
}

assert_distinct_paths() {
  local resolved_source resolved_dest
  resolved_source="$(resolve_path "${SOURCE_DIR}")"
  resolved_dest="$(resolve_path "${DEST_DIR}")"

  if [[ "${resolved_source}" == "${resolved_dest}" ]]; then
    echo "Error: source and destination are the same directory." >&2
    exit 1
  fi
}

sync_sample() {
  local copy_count=0

  while IFS= read -r -d '' file; do
    local rel dest
    rel="${file#${SOURCE_DIR}/}"
    dest="${DEST_DIR}/${rel}"
    mkdir -p "$(dirname "${dest}")"
    cp "${file}" "${dest}"
    copy_count=$((copy_count + 1))
  done < <(find "${SOURCE_DIR}" -type f ! -name '.env.example' -print0)

  echo "Synced ${copy_count} file(s) to ${DEST_DIR}"
}

if [[ $# -eq 1 && ( "${1}" == "--help" || "${1}" == "-h" ) ]]; then
  show_help
  exit 0
fi

if [[ $# -gt 0 ]]; then
  echo "Error: unexpected argument(s): $*" >&2
  exit 1
fi

if [[ ! -d "${SOURCE_DIR}" ]]; then
  echo "Error: source directory not found: ${SOURCE_DIR}" >&2
  exit 1
fi

assert_distinct_paths
mkdir -p "${DEST_DIR}"
sync_sample
