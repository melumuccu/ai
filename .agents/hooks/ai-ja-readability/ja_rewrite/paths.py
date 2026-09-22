from __future__ import annotations

import os
from datetime import datetime
from pathlib import Path

from ja_rewrite import config


def hook_install_root() -> Path:
    return Path(__file__).resolve().parent.parent


def should_skip_path(file_path: Path) -> bool:
    p = file_path.resolve()
    install = hook_install_root().resolve()
    try:
        p.relative_to(install)
        return True
    except ValueError:
        pass

    if p.name in config.SKIP_BASENAMES:
        return True
    for suffix in config.SKIP_FILE_SUFFIXES:
        if p.name.endswith(suffix):
            return True
    for part in p.parts:
        if part in config.SKIP_DIR_NAMES:
            return True
    return False


def project_root() -> Path | None:
    raw = os.environ.get("CURSOR_PROJECT_DIR", "").strip()
    if not raw:
        return None
    return Path(raw)


def ja_reply_path(conversation_id: str) -> Path | None:
    root = project_root()
    if root is None:
        return None
    now = datetime.now()
    ms = now.microsecond // 1000
    stamp = now.strftime(f"%Y%m%d_%H%M%S_{ms:03d}")
    conv_prefix = (conversation_id or "unknown")[:8]
    name = f"{stamp}_{conv_prefix}.md"
    return root / config.JA_REPLY_DIR / name
