from __future__ import annotations

import re

_JA_RE = re.compile(r"[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]")


def contains_japanese(text: str) -> bool:
    return _JA_RE.search(text) is not None
