from __future__ import annotations

import json
import sqlite3
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

from ja_rewrite import config

_CACHE: dict[str, Any] = {"at": 0.0, "api_percent": None}


def _state_db_paths() -> list[Path]:
    home = Path.home()
    return [
        home / ".config" / "Cursor" / "User" / "globalStorage" / "state.vscdb",
        home / "Library" / "Application Support" / "Cursor" / "User" / "globalStorage" / "state.vscdb",
    ]


def _read_access_token() -> str | None:
    for db_path in _state_db_paths():
        if not db_path.is_file():
            continue
        try:
            conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
            try:
                cur = conn.execute("SELECT value FROM ItemTable WHERE key = ?", ("cursorAuth/accessToken",))
                row = cur.fetchone()
                if row and row[0]:
                    return str(row[0])
            finally:
                conn.close()
        except sqlite3.Error:
            continue
    return None


def _api_percent_or_unknown(token: str) -> float | None:
    req = urllib.request.Request(
        "https://cursor.com/api/usage-summary",
        headers={"Accept": "application/json", "Cookie": f"WorkosCursorSessionToken={token}"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, json.JSONDecodeError, TimeoutError):
        return None
    try:
        plan = payload["individualUsage"]["plan"]
        pct = plan.get("apiPercentUsed")
        if pct is None:
            return None
        return float(pct)
    except (KeyError, TypeError, ValueError):
        return None


def api_percent_used() -> float | None:
    now = time.time()
    if now - float(_CACHE["at"]) < config.USAGE_CACHE_SECONDS:
        return _CACHE["api_percent"]

    token = _read_access_token()
    pct = _api_percent_or_unknown(token) if token else None
    _CACHE["at"] = now
    _CACHE["api_percent"] = pct
    return pct


def should_prefer_cursor_cli() -> bool:
    pct = api_percent_used()
    if pct is None:
        return False
    return pct < config.USAGE_THRESHOLD_PERCENT
