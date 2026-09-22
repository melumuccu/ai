from __future__ import annotations

from pathlib import Path

from ja_rewrite import config


def _read(path: Path) -> str | None:
    try:
        if path.is_file():
            return path.read_text(encoding="utf-8")
    except OSError:
        return None
    return None


def load_writing_rules() -> str:
    kf = _read(config.SKILL_KF_G)
    parts = [kf] if kf else ["Apply kf-g-writing-japanese-tech style."]
    parts.append(
        "Preserve code blocks, inline code, URLs, identifiers, and non-Japanese text byte-for-byte."
    )
    return "\n\n---\n\n".join(parts)
