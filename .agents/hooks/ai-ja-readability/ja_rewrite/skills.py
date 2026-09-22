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


def _repo_genshijin_fallback() -> Path | None:
    root = config.SKILL_GENSHIJIN
    if root.is_file():
        return root
    here = Path(__file__).resolve()
    for parent in here.parents:
        candidate = parent / ".agents" / "skills" / "genshijin" / "SKILL.md"
        if candidate.is_file():
            return candidate
    return None


def load_writing_rules() -> str:
    parts: list[str] = []
    kf = _read(config.SKILL_KF_G)
    if kf:
        parts.append(kf)
    genshijin_path = _repo_genshijin_fallback()
    if genshijin_path:
        g = _read(genshijin_path)
        if g:
            parts.append(g)
    if not parts:
        parts.append(
            "Apply kf-g-writing-japanese-tech style. Use genshijin 丁寧: remove filler and hedging, keep polite です/ます, complete sentences."
        )
    parts.append(
        "Tone strength: genshijin 丁寧 only. Do not use 通常 or 極限. Preserve code blocks, inline code, URLs, identifiers, and non-Japanese text byte-for-byte."
    )
    return "\n\n---\n\n".join(parts)
