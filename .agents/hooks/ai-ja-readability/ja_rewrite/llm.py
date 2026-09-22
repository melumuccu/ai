from __future__ import annotations

import json
import os
import re
import subprocess
import tempfile
import urllib.error
import urllib.request
from typing import Any

from ja_rewrite import config
from ja_rewrite.skills import load_writing_rules
from ja_rewrite.usage_cursor import should_prefer_cursor_cli

Fragment = dict[str, str]


def _response_schema(num_items: int) -> dict[str, Any]:
    return {
        "type": "object",
        "properties": {
            "items": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "text": {"type": "string"},
                    },
                    "required": ["id", "text"],
                },
                "minItems": num_items,
                "maxItems": num_items,
            }
        },
        "required": ["items"],
    }


def _build_prompt(fragments: list[Fragment]) -> str:
    rules = load_writing_rules()
    payload = json.dumps({"fragments": fragments}, ensure_ascii=False)
    return (
        "You rewrite Japanese for readability only. Return JSON matching the schema.\n"
        "Each output item must keep the same id and rewrite only the text field.\n"
        "Do not add explanations. Do not change non-Japanese segments inside text.\n\n"
        f"Rules:\n{rules}\n\nInput:\n{payload}"
    )


def _parse_items(raw: str, expected_ids: set[str]) -> list[Fragment] | None:
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return None
    items = data.get("items")
    if not isinstance(items, list):
        return None
    out: list[Fragment] = []
    seen: set[str] = set()
    for item in items:
        if not isinstance(item, dict):
            return None
        fid = item.get("id")
        text = item.get("text")
        if not isinstance(fid, str) or not isinstance(text, str):
            return None
        if fid not in expected_ids or fid in seen:
            return None
        seen.add(fid)
        out.append({"id": fid, "text": text})
    if seen != expected_ids:
        return None
    return out


def _gemini_api(fragments: list[Fragment]) -> list[Fragment] | None:
    api_key = os.environ.get(config.GEMINI_API_KEY_ENV, "").strip()
    if not api_key:
        return None
    expected_ids = {f["id"] for f in fragments}
    body = {
        "contents": [{"role": "user", "parts": [{"text": _build_prompt(fragments)}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
            "responseSchema": _response_schema(len(fragments)),
        },
    }
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{config.GEMINI_MODEL}:generateContent"
    )
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=55) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, json.JSONDecodeError, TimeoutError):
        return None
    try:
        text = payload["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        return None
    return _parse_items(text, expected_ids)


def _extract_cli_json(stdout: str) -> str | None:
    for match in re.finditer(r"\{[\s\S]*\}", stdout):
        chunk = match.group(0)
        try:
            json.loads(chunk)
            return chunk
        except json.JSONDecodeError:
            continue
    return None


def _cursor_cli(fragments: list[Fragment]) -> list[Fragment] | None:
    model = os.environ.get(config.CURSOR_CLI_MODEL_ENV, "").strip()
    if not model:
        return None
    expected_ids = {f["id"] for f in fragments}
    prompt = _build_prompt(fragments)
    env = os.environ.copy()
    env[config.INNER_ENV] = "1"
    with tempfile.TemporaryDirectory(prefix="ja-rewrite-cli-") as tmp:
        cmd = [
            "agent",
            "-p",
            "--mode=ask",
            "--sandbox",
            "enabled",
            "--output-format",
            "json",
            "--model",
            model,
            prompt,
        ]
        try:
            proc = subprocess.run(
                cmd,
                cwd=tmp,
                env=env,
                capture_output=True,
                text=True,
                timeout=55,
                check=False,
            )
        except (OSError, subprocess.TimeoutExpired):
            return None
        if proc.returncode != 0:
            return None
        raw = _extract_cli_json(proc.stdout)
        if not raw:
            return None
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            return None
        if "items" in data:
            return _parse_items(json.dumps(data), expected_ids)
        if isinstance(data.get("result"), str):
            return _parse_items(data["result"], expected_ids)
        if isinstance(data.get("text"), str):
            return _parse_items(data["text"], expected_ids)
        return _parse_items(raw, expected_ids)


def rewrite_fragments(fragments: list[Fragment]) -> list[Fragment] | None:
    if not fragments:
        return []
    if should_prefer_cursor_cli():
        return _cursor_cli(fragments)
    return _gemini_api(fragments)
