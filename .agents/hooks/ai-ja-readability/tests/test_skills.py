import unittest
from unittest.mock import patch

from ja_rewrite.skills import load_writing_rules


class TestWritingRules(unittest.TestCase):
    @patch("ja_rewrite.skills._read", return_value="style rules")
    def test_loads_writing_tech_only(self, _read: object) -> None:
        rules = load_writing_rules()
        self.assertIn("style rules", rules)
        self.assertNotIn("genshijin", rules)
        self.assertNotIn("原始人", rules)

    @patch("ja_rewrite.skills._read", return_value=None)
    def test_fallback_omits_genshijin(self, _read: object) -> None:
        rules = load_writing_rules()
        self.assertIn("kf-g-writing-japanese-tech", rules)
        self.assertNotIn("genshijin", rules)
        self.assertNotIn("丁寧", rules)


if __name__ == "__main__":
    unittest.main()
