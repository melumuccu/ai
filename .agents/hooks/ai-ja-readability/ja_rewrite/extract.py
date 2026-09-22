from __future__ import annotations

import re
from dataclasses import dataclass

from ja_rewrite.textutil import contains_japanese

Fragment = dict[str, str]


@dataclass
class MarkdownSlice:
    fragment_id: str
    start: int
    end: int
    text: str


_FENCE_RE = re.compile(r"^(`{3,}|~{3,}).*$")


def _markdown_prose_slices(content: str) -> list[MarkdownSlice]:
    lines = content.splitlines(keepends=True)
    slices: list[MarkdownSlice] = []
    in_fence = False
    fence_mark = ""
    offset = 0
    block_start: int | None = None
    block_lines: list[str] = []
    idx = 0

    def flush_block() -> None:
        nonlocal idx, block_start, block_lines
        if block_start is None:
            return
        text = "".join(block_lines)
        if contains_japanese(text.strip()):
            slices.append(MarkdownSlice(f"md-{idx}", block_start, block_start + len(text), text))
            idx += 1
        block_start = None
        block_lines = []

    for line in lines:
        stripped = line.lstrip()
        fence = _FENCE_RE.match(stripped)
        if fence:
            if not in_fence:
                flush_block()
                in_fence = True
                fence_mark = fence.group(1)
            elif stripped.startswith(fence_mark):
                in_fence = False
                fence_mark = ""
            offset += len(line)
            continue
        if in_fence:
            offset += len(line)
            continue
        if stripped.strip() == "":
            flush_block()
            offset += len(line)
            continue
        if block_start is None:
            block_start = offset
            block_lines = [line]
        else:
            block_lines.append(line)
        offset += len(line)
    flush_block()
    return slices


def markdown_fragments(content: str) -> tuple[list[Fragment], list[MarkdownSlice]]:
    slices = _markdown_prose_slices(content)
    frags = [{"id": s.fragment_id, "text": s.text} for s in slices]
    return frags, slices


_LINE_COMMENT_RE = re.compile(
    r"(//|#)(?P<body>[^\n]*[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf][^\n]*)"
)


def line_comment_fragments(content: str, prefix: str) -> tuple[list[Fragment], dict[str, tuple[int, int, str]]]:
    frags: list[Fragment] = []
    spans: dict[str, tuple[int, int, str]] = {}
    idx = 0
    for match in _LINE_COMMENT_RE.finditer(content):
        full = match.group(0)
        if not contains_japanese(full):
            continue
        fid = f"{prefix}-{idx}"
        idx += 1
        frags.append({"id": fid, "text": full})
        spans[fid] = (match.start(), match.end(), full)
    return frags, spans


def replace_from_end(content: str, spans: list[tuple[int, int, str, str]]) -> str | None:
    ordered = sorted(spans, key=lambda span: span[0], reverse=True)
    out = content
    for start, end, original, new_text in ordered:
        if out[start:end] != original:
            return None
        out = out[:start] + new_text + out[end:]
    return out


def apply_span_rewrites(content: str, spans: dict[str, tuple[int, int, str]], rewritten: dict[str, str]) -> str | None:
    pieces: list[tuple[int, int, str, str]] = []
    for fid, (start, end, original) in spans.items():
        new_text = rewritten.get(fid)
        if new_text is None:
            return None
        pieces.append((start, end, original, new_text))
    return replace_from_end(content, pieces)


def apply_markdown_rewrites(content: str, slices: list[MarkdownSlice], rewritten: dict[str, str]) -> str | None:
    pieces: list[tuple[int, int, str, str]] = []
    for sl in slices:
        new_text = rewritten.get(sl.fragment_id)
        if new_text is None:
            return None
        pieces.append((sl.start, sl.end, sl.text, new_text))
    return replace_from_end(content, pieces)
