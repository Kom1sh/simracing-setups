"""Текст руководств iRacing в порядке чтения.

Руководства свёрстаны в две колонки. `pdftotext -layout` сохраняет колонки рядом в одной строке,
обычный режим — перемешивает их построчно. Берём `-layout` и режем каждую страницу по границе колонок:
ищем позицию, с которой во многих строках начинается текст после широкого пробела.
"""

from __future__ import annotations

import re
import subprocess
from collections import Counter
from pathlib import Path

GAP = re.compile(r"\S( {3,})(?=\S)")


def pdf_to_layout_text(pdf: Path) -> str:
    """Текст PDF с сохранённой раскладкой (нужен poppler-utils)."""
    return subprocess.run(["pdftotext", "-layout", str(pdf), "-"], check=True, capture_output=True, text=True).stdout


def _split_point(lines: list[str]) -> int | None:
    """Позиция правой колонки на странице или None, если колонка одна."""
    width = max((len(l) for l in lines), default=0)
    if width < 60:
        return None
    starts: Counter[int] = Counter()
    for line in lines:
        for m in GAP.finditer(line):
            pos = m.end(1)
            if width * 0.3 < pos < width * 0.75:
                starts[pos] += 1
    if not starts:
        return None
    # Колонка начинается не строго с одного символа — собираем соседние позиции
    best, best_n = None, 0
    for pos in starts:
        n = sum(starts[p] for p in range(pos - 2, pos + 3))
        if n > best_n:
            best, best_n = pos, n
    text_lines = sum(1 for l in lines if l.strip())
    return best if best is not None and best_n >= max(4, text_lines * 0.15) else None


def _cut(line: str, pos: int) -> tuple[str, str]:
    """Режет строку по колонке; если на границе стоит слово, сдвигается к ближайшему пробелу слева."""
    if len(line) <= pos:
        return line.rstrip(), ""
    cut = pos
    while cut > 0 and line[cut - 1] != " ":
        cut -= 1
    if cut == 0:
        return line.rstrip(), ""
    return line[:cut].rstrip(), line[cut:].strip()


def reading_order(layout_text: str) -> str:
    """Страницы по очереди, на каждой — сначала левая колонка, потом правая."""
    out: list[str] = []
    for page in layout_text.split("\f"):
        lines = page.splitlines()
        pos = _split_point(lines)
        if pos is None:
            out.extend(l.strip() for l in lines)
        else:
            left, right = [], []
            for line in lines:
                a, b = _cut(line, pos)
                left.append(a.strip())
                right.append(b)
            out.extend(left)
            out.append("")
            out.extend(right)
        out.append("\f")
    text = "\n".join(out)
    return re.sub(r"\n{3,}", "\n\n", text)
