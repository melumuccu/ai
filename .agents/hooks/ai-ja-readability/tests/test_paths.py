import os
import unittest
from pathlib import Path
from unittest.mock import patch

from ja_rewrite.paths import ja_reply_path, should_skip_path


class TestPaths(unittest.TestCase):
    def test_skip_node_modules(self) -> None:
        p = Path("/tmp/proj/node_modules/pkg/index.js")
        self.assertTrue(should_skip_path(p))

    @patch.dict(os.environ, {"CURSOR_PROJECT_DIR": "/tmp/ws"})
    def test_ja_reply_under_artifacts(self) -> None:
        out = ja_reply_path("abcdef012345")
        assert out is not None
        self.assertTrue(str(out).endswith(".md"))
        self.assertIn("artifacts/ja-reply", out.as_posix())
        self.assertIn("abcdef01", out.name)


if __name__ == "__main__":
    unittest.main()
