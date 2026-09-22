import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from ja_rewrite.agent_response import handle_after_agent_response, reveal_reply


class TestRevealReply(unittest.TestCase):
    def test_opens_path_in_current_window_without_waiting(self) -> None:
        path = Path("/tmp/ws/artifacts/ja-reply/20260922_120000_000_abcdef01.md")
        with (
            patch("ja_rewrite.agent_response.shutil.which", return_value="/usr/local/bin/cursor"),
            patch("ja_rewrite.agent_response.subprocess.run") as run,
        ):
            run.return_value.returncode = 0
            reveal_reply(path)

        argv = run.call_args.args[0]
        self.assertEqual(
            argv,
            [
                "/usr/local/bin/cursor",
                "--reuse-window",
                "--goto",
                "/tmp/ws/artifacts/ja-reply/20260922_120000_000_abcdef01.md",
            ],
        )
        self.assertNotIn("--wait", argv)
        self.assertNotIn("-w", argv)
        self.assertLess(run.call_args.kwargs["timeout"], 60)

    def test_missing_cursor_does_not_raise(self) -> None:
        with (
            patch("ja_rewrite.agent_response._cursor_executable", return_value=None),
            patch("ja_rewrite.agent_response.subprocess.run") as run,
        ):
            reveal_reply(Path("/tmp/a.md"))
        run.assert_not_called()

    def test_nonzero_exit_does_not_raise(self) -> None:
        with (
            patch("ja_rewrite.agent_response._cursor_executable", return_value="/usr/local/bin/cursor"),
            patch("ja_rewrite.agent_response.subprocess.run") as run,
        ):
            run.return_value.returncode = 1
            reveal_reply(Path("/tmp/a.md"))

    def test_open_failure_does_not_raise(self) -> None:
        with (
            patch("ja_rewrite.agent_response._cursor_executable", return_value="/usr/local/bin/cursor"),
            patch("ja_rewrite.agent_response.subprocess.run", side_effect=OSError("spawn failed")),
        ):
            reveal_reply(Path("/tmp/a.md"))


class TestAfterAgentResponseOpensFile(unittest.TestCase):
    def test_written_reply_is_opened(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            with (
                patch.dict(os.environ, {"CURSOR_PROJECT_DIR": tmp}),
                patch(
                    "ja_rewrite.agent_response.rewrite_fragments",
                    return_value=[{"id": "body", "text": "校正後の文です。"}],
                ),
                patch("ja_rewrite.agent_response.reveal_reply") as reveal,
            ):
                handle_after_agent_response(
                    {
                        "text": "校正前の文です。",
                        "conversation_id": "abcdef012345",
                        "generation_id": "gen-1",
                    }
                )

            reveal.assert_called_once()
            opened = reveal.call_args.args[0]
            self.assertTrue(opened.is_file())
            body = opened.read_text(encoding="utf-8")
            self.assertIn("校正後の文です。", body)
            self.assertNotIn("校正前の文です。", body)

    def test_unchanged_text_is_not_opened(self) -> None:
        original = "校正の必要がない文です。"
        with tempfile.TemporaryDirectory() as tmp:
            with (
                patch.dict(os.environ, {"CURSOR_PROJECT_DIR": tmp}),
                patch(
                    "ja_rewrite.agent_response.rewrite_fragments",
                    return_value=[{"id": "body", "text": original}],
                ),
                patch("ja_rewrite.agent_response.reveal_reply") as reveal,
            ):
                handle_after_agent_response(
                    {
                        "text": original,
                        "conversation_id": "abcdef012345",
                        "generation_id": "gen-1",
                    }
                )
            reveal.assert_not_called()


if __name__ == "__main__":
    unittest.main()
