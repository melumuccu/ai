from __future__ import annotations

import os
from pathlib import Path

GEMINI_MODEL = os.environ.get("JA_REWRITE_GEMINI_MODEL", "gemini-3.8-flash")
GEMINI_API_KEY_ENV = "GEMINI_API_KEY"
CURSOR_CLI_MODEL_ENV = "JA_REWRITE_CURSOR_CLI_MODEL"

USAGE_THRESHOLD_PERCENT = float(os.environ.get("JA_REWRITE_USAGE_THRESHOLD", "95"))
USAGE_CACHE_SECONDS = int(os.environ.get("JA_REWRITE_USAGE_CACHE_SECONDS", "600"))

INNER_ENV = "JA_REWRITE_INNER"

LOG_PATH = Path.home() / ".cursor" / "logs" / "ai-ja-readability.log"

SKIP_DIR_NAMES = frozenset(
    {
        ".git",
        "node_modules",
        "vendor",
        "dist",
        "build",
        ".venv",
        "venv",
        "__pycache__",
        ".turbo",
        ".next",
    }
)

SKIP_FILE_SUFFIXES = frozenset({".min.js", ".min.css", ".lock", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".woff", ".woff2"})

SKIP_BASENAMES = frozenset({".env", ".env.local", ".env.production"})

JA_REPLY_DIR = Path("artifacts") / "ja-reply"

SKILL_KF_G = Path.home() / ".agents" / "skills" / "kf-g-writing-japanese-tech" / "SKILL.md"
