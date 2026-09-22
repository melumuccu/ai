from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any

from ja_rewrite import config


def log_event(event: str, **fields: Any) -> None:
    record = {"ts": time.time(), "event": event, **fields}
    line = json.dumps(record, ensure_ascii=False) + "\n"
    try:
        config.LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with config.LOG_PATH.open("a", encoding="utf-8") as fh:
            fh.write(line)
    except OSError:
        pass
