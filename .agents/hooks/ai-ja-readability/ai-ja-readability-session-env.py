#!/usr/bin/env python3

import json
import sys
from pathlib import Path

ALLOWED = {
    "GEMINI_API_KEY",
    "JA_REWRITE_CURSOR_CLI_MODEL",
    "JA_REWRITE_GEMINI_MODEL",
    "JA_REWRITE_USAGE_THRESHOLD",
    "JA_REWRITE_USAGE_CACHE_SECONDS",
}


def load_env(path: Path) -> dict[str, str]:
    if not path.is_file():
        return {}
    env: dict[str, str] = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key in ALLOWED and value:
            env[key] = value
    return env


def main() -> int:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent / "ai-ja-readability.env"
    json.dump({"env": load_env(path)}, sys.stdout, ensure_ascii=False)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
