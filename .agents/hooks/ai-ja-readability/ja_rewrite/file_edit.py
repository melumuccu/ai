from __future__ import annotations

from pathlib import Path

from ja_rewrite.extract import (
    apply_markdown_rewrites,
    apply_span_rewrites,
    line_comment_fragments,
    markdown_fragments,
)
from ja_rewrite.llm import rewrite_fragments
from ja_rewrite.log_util import log_event
from ja_rewrite.paths import should_skip_path
from ja_rewrite.textutil import contains_japanese


def handle_after_file_edit(payload: dict) -> None:
    file_path_raw = payload.get("file_path")
    if not isinstance(file_path_raw, str):
        return
    path = Path(file_path_raw)
    if should_skip_path(path):
        log_event("file_edit_skip_path", path=str(path))
        return
    try:
        original = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        log_event("file_edit_skip_read", path=str(path))
        return

    suffix = path.suffix.lower()
    if suffix in {".md", ".markdown"}:
        new_content = _rewrite_markdown(original)
    elif suffix in {".py", ".js", ".ts", ".tsx", ".jsx", ".go", ".rs", ".java", ".kt", ".swift", ".rb", ".sh", ".bash", ".zsh"}:
        prefix = "cmt"
        if suffix == ".py":
            prefix = "py-cmt"
        frags, spans = line_comment_fragments(original, prefix)
        new_content = _rewrite_with_spans(original, frags, spans)
    elif suffix in {".html", ".htm"}:
        log_event("file_edit_skip_html", path=str(path))
        return
    else:
        log_event("file_edit_skip_ext", path=str(path), suffix=suffix)
        return

    if new_content is None or new_content == original:
        return

    try:
        path.write_text(new_content, encoding="utf-8")
        log_event("file_edit_applied", path=str(path))
    except OSError:
        log_event("file_edit_write_failed", path=str(path))


def _rewrite_markdown(content: str) -> str | None:
    frags, slices = markdown_fragments(content)
    if not frags:
        return None
    result = rewrite_fragments(frags)
    if result is None:
        return None
    mapping = {item["id"]: item["text"] for item in result}
    return apply_markdown_rewrites(content, slices, mapping)


def _rewrite_with_spans(content: str, frags: list, spans: dict) -> str | None:
    if not frags:
        return None
    if not any(contains_japanese(f["text"]) for f in frags):
        return None
    result = rewrite_fragments(frags)
    if result is None:
        return None
    mapping = {item["id"]: item["text"] for item in result}
    return apply_span_rewrites(content, spans, mapping)
