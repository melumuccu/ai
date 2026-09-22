from __future__ import annotations

from pathlib import Path

from ja_rewrite.llm import rewrite_fragments
from ja_rewrite.log_util import log_event
from ja_rewrite.paths import ja_reply_path
from ja_rewrite.textutil import contains_japanese


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


def _write_reply_file(path: Path, conversation_id: str, generation_id: str, body: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    header = f"conversation_id: {conversation_id}\ngeneration_id: {generation_id}\n\n"
    path.write_text(header + body, encoding="utf-8")
