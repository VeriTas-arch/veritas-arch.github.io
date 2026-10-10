"""Validate character coverage, metrics, variable axes, and license metadata."""

import re
import runpy
import unittest
from pathlib import Path

from fontTools.ttLib import TTFont

CONFIG = runpy.run_path(str(Path(__file__).resolve().parents[1] / "scripts/subset-fonts.py"))


class FontSubsetsTest(unittest.TestCase):
    def test_css_only_advertises_characters_each_font_supports(self):
        css = (CONFIG["ROOT"] / "src/styles/fonts.css").read_text(encoding="utf-8")
        for block in re.findall(r"@font-face\s*\{([^}]+)\}", css):
            path = re.search(r"url\('([^']+)'\)", block)[1]
            ranges = re.search(r"unicode-range:\s*([^;]+);", block)[1]
            with TTFont(CONFIG["ROOT"] / "public" / path.lstrip("/")) as font:
                self.assertEqual(
                    set(CONFIG["subset"].parse_unicodes(ranges)), set(font.getBestCmap())
                )

    def test_subsets_preserve_common_characters_and_metrics(self):
        for directory, original, output, *_ in CONFIG["SPECS"]:
            with self.subTest(font=original):
                folder = CONFIG["FONTS"] / directory
                with (
                    TTFont(folder / f"{original}.woff2") as full,
                    TTFont(folder / f"{output}-latin.woff2") as small,
                ):
                    source, subset = full.getBestCmap(), small.getBestCmap()
                    expected = set(source) & set(CONFIG["CODEPOINTS"])
                    self.assertEqual(set(subset), expected)
                    for codepoint in expected:
                        self.assertEqual(
                            full["hmtx"][source[codepoint]], small["hmtx"][subset[codepoint]]
                        )
                    if "fvar" in full:

                        def axes(font):
                            return [
                                (a.axisTag, a.minValue, a.defaultValue, a.maxValue)
                                for a in font["fvar"].axes
                            ]

                        self.assertEqual(axes(full), axes(small))
                    for name_id in (0, 7, 13, 14):

                        def names(font, name_id=name_id):
                            return {
                                n.toUnicode() for n in font["name"].names if n.nameID == name_id
                            }

                        self.assertEqual(names(full), names(small))
                    for name in small["name"].names:
                        if name.nameID in (1, 3, 4, 6, 16, 25):
                            self.assertNotRegex(name.toUnicode(), r"Source|Monaspace|Neon")


if __name__ == "__main__":
    unittest.main()
