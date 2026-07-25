#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SOURCE_DIR="${REPO_ROOT}/.agents/.rules"
TARGET_DIR="${HOME}/.cursor/rules"

if [[ ! -d "${SOURCE_DIR}" ]]; then
  echo "source directory not found: ${SOURCE_DIR}" >&2
  exit 1
fi

mkdir -p "${TARGET_DIR}"

shopt -s nullglob
files=("${SOURCE_DIR}"/*.mdc)

if ((${#files[@]} == 0)); then
  echo "no .mdc files to sync in ${SOURCE_DIR}" >&2
  exit 0
fi

for src in "${files[@]}"; do
  [[ -f "${src}" ]] || continue

  name="$(basename "${src}")"
  dest="${TARGET_DIR}/${name}"

  cp "${src}" "${dest}"
  echo "synced ${dest}"
done
