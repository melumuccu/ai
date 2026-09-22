from __future__ import annotations

import json
import os
import sys

from ja_rewrite import config
from ja_rewrite.agent_response import handle_after_agent_response
from ja_rewrite.file_edit import handle_after_file_edit
from ja_rewrite.log_util import log_event


def main() -> int:
    if os.environ.get(config.INNER_ENV) == "1":
        return 0

    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        log_event("hook_invalid_json")
        return 0

    if not isinstance(payload, dict):
        return 0

    event = payload.get("hook_event_name") or _infer_event(payload)

    try:
        if event == "afterAgentResponse":
            handle_after_agent_response(payload)
        elif event in {"afterFileEdit", "afterTabFileEdit"}:
            handle_after_file_edit(payload)
        else:
            log_event("hook_ignored", hook_event_name=event)
    except Exception as exc:
        log_event("hook_error", hook_event_name=event, error=type(exc).__name__)
    return 0


def _infer_event(payload: dict) -> str:
    if "text" in payload and "file_path" not in payload:
        return "afterAgentResponse"
    if "file_path" in payload:
        return "afterFileEdit"
    return "unknown"
