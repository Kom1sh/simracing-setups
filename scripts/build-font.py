"""Шрифт сайта: Roboto Flex с осями opsz, wght 400–900 и wdth 25–100, без наклона.

Почему не готовый файл fontsource «wdth»: в нём ось opsz закреплена на 14, а на таком
оптическом размере ширина 25 % почти не сужает буквы (−13 % вместо −35 %). Узкое начертание
из DESIGN.md работает только вместе с opsz, поэтому берём «standard» и урезаем лишнее.

Запуск (нужны fonttools и brotli): python3 scripts/build-font.py
Источник — @fontsource-variable/roboto-flex (OFL), результат — src/fonts/*.woff2
"""

from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SRC = Path('node_modules/@fontsource-variable/roboto-flex/files')
OUT = Path('src/fonts')
OUT.mkdir(exist_ok=True)

# Кабинет — узкие ширины (wdth 25–100), лендинг — широкие (wdth 100–130), как Archivo Expanded у girlvoice.ai
VARIANTS = {'': (25, 100), '-wide': (100, 130)}

for suffix, wdth in VARIANTS.items():
    for part in ('latin', 'cyrillic'):
        font = TTFont(SRC / f'roboto-flex-{part}-standard-normal.woff2')
        font = instancer.instantiateVariableFont(font, {'slnt': 0, 'wght': (400, 900), 'wdth': wdth})
        font.flavor = 'woff2'
        target = OUT / f'roboto-flex{suffix}-{part}.woff2'
        font.save(target)
        print(f'{target}: {target.stat().st_size // 1024} KB')
