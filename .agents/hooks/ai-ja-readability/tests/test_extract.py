import unittest

from ja_rewrite.extract import line_comment_fragments, markdown_fragments, replace_from_end


class TestExtract(unittest.TestCase):
    def test_markdown_skips_fenced_code(self) -> None:
        content = "# Title\n\n日本語の地の文です。\n\n```python\n# ここは送らない\n```\n"
        frags, slices = markdown_fragments(content)
        self.assertEqual(len(frags), 1)
        self.assertIn("日本語", frags[0]["text"])
        self.assertNotIn("送らない", frags[0]["text"])
        self.assertEqual(len(slices), 1)

    def test_line_comments(self) -> None:
        content = "x = 1\n# 日本語コメント\n"
        frags, spans = line_comment_fragments(content, "py")
        self.assertEqual(len(frags), 1)
        self.assertIn("py-0", spans)

    def test_replace_from_end_keeps_later_span(self) -> None:
        content = "AAAA BBBB"
        spans = [(0, 4, "AAAA", "AA"), (5, 9, "BBBB", "BB")]
        self.assertEqual(replace_from_end(content, spans), "AA BB")


if __name__ == "__main__":
    unittest.main()
