from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

from ja_rewrite.llm import rewrite_fragments
from ja_rewrite.log_util import log_event
from ja_rewrite.paths import ja_reply_path
from ja_rewrite.textutil import contains_japanese

_CURSOR_CANDIDATES = (
    Path("/usr/local/bin/cursor"),
    Path("/opt/homebrew/bin/cursor"),
    Path("/Applications/Cursor.app/Contents/Resources/app/bin/cursor"),
)
_REVEAL_TIMEOUT_SECONDS = 10


def handle_after_agent_response(payload: dict) -> None:
    text = payload.get("text")
    if not isinstance(text, str) or not text.strip():
        return
    if not contains_japanese(text):
        return

    conversation_id = str(payload.get("conversation_id") or "")
    generation_id = str(payload.get("generation_id") or "")

    fragments = [{"id": "body", "text": text}]
    result = rewrite_fragments(fragments)
    if result is None:
        log_event("agent_response_rejected", reason="llm", conversation_id=conversation_id[:8])
        return
    corrected = result[0]["text"]
    if corrected == text:
        log_event("agent_response_unchanged", conversation_id=conversation_id[:8])
        return

    out_path = ja_reply_path(conversation_id)
    if out_path is None:
        log_event("agent_response_skip_no_project", conversation_id=conversation_id[:8])
        return

    _write_reply_file(out_path, conversation_id, generation_id, corrected)
    log_event(
        "agent_response_saved",
        path=str(out_path),
        conversation_id=conversation_id[:8],
    )
    reveal_reply(out_path)


def _write_reply_file(path: Path, conversation_id: str, generation_id: str, body: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    header = f"conversation_id: {conversation_id}\ngeneration_id: {generation_id}\n\n"
    path.write_text(header + body, encoding="utf-8")


def reveal_reply(path: Path) -> None:
    cursor = _cursor_executable()
    if cursor is None:
        log_event("agent_response_reveal_skipped", reason="cursor_missing")
        return
    # --wait はファイルを閉じるまで戻らない。hooks.json の timeout は 60 秒なので、待つと hook が時間切れになる。
    argv = [cursor, "--reuse-window", "--goto", str(path)]
    try:
        completed = subprocess.run(
            argv,
            check=False,
            timeout=_REVEAL_TIMEOUT_SECONDS,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        log_event("agent_response_reveal_failed", error=type(exc).__name__)
        return
    if completed.returncode != 0:
        log_event("agent_response_reveal_failed", returncode=completed.returncode)
        return
    log_event("agent_response_revealed", path=str(path))


def _cursor_executable() -> str | None:
    found = shutil.which("cursor")
    if found:
        return found
    # hook プロセスの PATH に cursor が無いことがある。which だけで終えると、インストール済みでも開かない。
    for candidate in _CURSOR_CANDIDATES:
        if candidate.is_file() and os.access(candidate, os.X_OK):
            return str(candidate)
    return None
