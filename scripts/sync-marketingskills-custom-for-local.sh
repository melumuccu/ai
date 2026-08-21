#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SOURCE_DIR="${REPO_ROOT}/.agents/custom/coreyhaines31/marketingskills"
MARKETING_PLANS_HOME="${HOME}/marketing-plans"

show_help() {
  cat <<EOF
Usage:
  ./scripts/sync-marketingskills-custom-for-local.sh --project /path/to/product-repo

coreyhaines31/marketingskills 向けの日本市場カスタマイズファイルをコピーします:
  - プロジェクトファイル → <project>/.agents/
  - marketing-plan 資料 → ~/marketing-plans/

skills はマシン全体のグローバル skills としてインストール済みであることを前提とします。
このスクリプトは skills 本体をインストールしません。

--project には skills を利用するプロダクトリポジトリのルートを指定してください。
この skills リポジトリ自身を指定するのは、意図的な場合に限ってください。

Options:
  --project <dir>  コピー先プロジェクトルート（必須）
  --help           このヘルプを表示
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
  resolved_dest="$(resolve_path "${PROJECT_AGENTS_DIR}")"

  if [[ "${resolved_source}" == "${resolved_dest}" ]]; then
    echo "Error: source and destination are the same directory." >&2
    exit 1
  fi
}

PROJECT_ROOT=""
PROJECT_AGENTS_DIR=""
project_agents_count=0
marketing_plans_count=0

sync_file() {
  local file="$1"
  local rel dest

  rel="${file#${SOURCE_DIR}/}"

  if [[ "${rel}" == marketing-plans/* ]]; then
    dest="${MARKETING_PLANS_HOME}/${rel#marketing-plans/}"
    marketing_plans_count=$((marketing_plans_count + 1))
  else
    dest="${PROJECT_AGENTS_DIR}/${rel}"
    project_agents_count=$((project_agents_count + 1))
  fi

  mkdir -p "$(dirname "${dest}")"
  cp "${file}" "${dest}"
  echo "synced ${dest}"
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --help | -h)
        show_help
        exit 0
        ;;
      --project)
        if [[ $# -lt 2 ]]; then
          echo "Error: --project requires a directory argument." >&2
          exit 1
        fi
        PROJECT_ROOT="$2"
        shift 2
        ;;
      --project=*)
        PROJECT_ROOT="${1#--project=}"
        if [[ -z "${PROJECT_ROOT}" ]]; then
          echo "Error: --project requires a directory argument." >&2
          exit 1
        fi
        shift
        ;;
      *)
        echo "Error: unexpected argument(s): $*" >&2
        exit 1
        ;;
    esac
  done

  if [[ -z "${PROJECT_ROOT}" ]]; then
    echo "Error: --project is required." >&2
    exit 1
  fi

  PROJECT_ROOT="$(resolve_path "${PROJECT_ROOT}")"
  PROJECT_AGENTS_DIR="${PROJECT_ROOT}/.agents"
}

if [[ $# -eq 1 && ( "${1}" == "--help" || "${1}" == "-h" ) ]]; then
  show_help
  exit 0
fi

parse_args "$@"

if [[ ! -d "${SOURCE_DIR}" ]]; then
  echo "Error: source directory not found: ${SOURCE_DIR}" >&2
  exit 1
fi

assert_distinct_paths

while IFS= read -r -d '' file; do
  sync_file "${file}"
done < <(find "${SOURCE_DIR}" -type f -print0)

echo "Synced ${project_agents_count} file(s) to ${PROJECT_AGENTS_DIR}"
echo "Synced ${marketing_plans_count} file(s) to ${MARKETING_PLANS_HOME}"
