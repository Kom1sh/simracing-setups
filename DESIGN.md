---
version: alpha
name: simracing-setups
description: "Кабинет сетапа как лист гоночного инженера: белый каталог регулировок, одна чёрная полоса со схемой трассы, жёлтый только у выбранного. Донор токенов — Renault (белый режим конфигуратора, Sunlight Yellow), решения свои."

colors:
  canvas: "#ffffff"
  surface: "#f5f5f5"
  surface-strong: "#ebebeb"
  ink: "#000000"
  body: "#222222"
  mute: "#5e5e5e"
  ash: "#8a8a8a"
  line: "#e2e2e2"
  control-border: "#8a8a8a"
  accent: "#ffed00"
  on-accent: "#000000"
  band: "#000000"
  band-surface: "#1c1c1c"
  band-line: "#3d3d3d"
  on-band: "#ffffff"
  on-band-mute: "#a8a8a8"
  alert: "#b3261e"

typography:
  display-map:
    fontFamily: "Roboto Flex Variable"
    fontSize: 104px
    fontWeight: 820
    fontStretch: 42%
    lineHeight: 0.86
  display:
    fontFamily: "Roboto Flex Variable"
    fontSize: 48px
    fontWeight: 780
    fontStretch: 55%
    lineHeight: 0.95
  heading:
    fontFamily: "Roboto Flex Variable"
    fontSize: 32px
    fontWeight: 720
    fontStretch: 62%
    lineHeight: 1
  tab:
    fontFamily: "Roboto Flex Variable"
    fontSize: 24px
    fontWeight: 680
    fontStretch: 70%
    lineHeight: 1
  value:
    fontFamily: "Roboto Flex Variable"
    fontSize: 20px
    fontWeight: 640
    fontStretch: 75%
    lineHeight: 1
    fontVariantNumeric: tabular-nums
  body:
    fontFamily: "Roboto Flex Variable"
    fontSize: 15px
    fontWeight: 420
    fontStretch: 100%
    lineHeight: 1.45
  small:
    fontFamily: "Roboto Flex Variable"
    fontSize: 13px
    fontWeight: 420
    fontStretch: 100%
    lineHeight: 1.4

rounded:
  none: 0px
  control: 2px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px

components:
  band:
    backgroundColor: "{colors.band}"
    textColor: "{colors.on-band}"
  segment-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.control}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.control}"
    height: 44px
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: 40px
---

## Overview

Кабинет устроен как лист инженера в боксах. Сверху чёрная полоса: схема выбранной трассы крупно, её название набрано прямо по картинке, рядом категория и машина. Ниже белый каталог регулировок, как в конфигураторе автомобиля: группы, строки, числа.

Смелость потрачена в одном месте — схема трассы с названием. Всё остальное тихое: белый холст, чёрный текст, тонкие линии между строками.

## Colors

- **Жёлтый `accent`** значит одно: «выбрано сейчас». Выбранная категория, трасса в списке, активная вкладка, бегунок ползунка. На жёлтом только чёрный текст.
- **Действия чёрные.** Кнопка «Сохранить» — чёрная заливка, белый текст. Жёлтым действия не красим.
- **Чёрная полоса `band`** одна на страницу, под схемой трассы и выбором машины.
- **`alert`** — только текст замечаний проверки сетапа, контраст 6.3:1 на белом.
- **Контраст:** `mute` на белом 6.4:1, `on-band-mute` на чёрном 8.6:1, `control-border` на белом 3.4:1 (граница элемента, не текст). `ash` — только плейсхолдеры и неактивное.

## Typography

Одно семейство — Roboto Flex, разница ролей делается шириной, а не вторым шрифтом.

- Узкое и жирное (`font-stretch` 42–75%) — названия трасс и машин, заголовки групп, значения регулировок. Так выглядит графика хронометража.
- Обычная ширина — подписи, подсказки, кнопки.
- Числа всегда `tabular-nums`, десятичная запятая, пробел в тысячах (`150 000 Н/м`).
- Никаких заглавных надзаголовков, никаких строк через средние точки.

## Layout

- Шапка 56px. Под ней полоса: схема трассы (7 колонок из 12) и машина (5 колонок).
- Вкладки «Трасса и погода» и «Машина» на всю ширину.
- Рабочая зона: навигация по группам 200px, строки регулировок до 760px, сводка 320px с `position: sticky`.
- До 1180px сводка уходит под строки, навигация по группам становится горизонтальной. До 720px всё в одну колонку, подпись строки над контролом.
- Выравнивание по левому краю везде, числа в контролах по правому.

## Elevation & Depth

Теней нет. Глубина — контраст чёрной полосы и белого каталога. Всплывающие списки отделяются чёрной рамкой 1px.

## Shapes

- Панели, полоса, группы — 0px.
- Контролы (кнопки, поля, сегменты) — 2px, как у донора.
- Круглого ничего нет.

## Components

- **Выбор трассы** — кнопка открывает панель с поиском и плитками: на плитке схема трассы, название набрано поверх картинки. Стрелки ходят по сетке плиток, Enter выбирает, Esc закрывает.
- **Строка регулировки** — подпись, подсказка одной строкой, значение со степпером и ползунок. Изменённое против базы значение помечено квадратом 6px и разницей «+0,5».
- **Регулировка по колёсам** — четыре значения вокруг схемы машины (ПЛ, ПП, ЗЛ, ЗП), переключатель «Слева и справа одинаково».
- **Сводка** — имя сетапа, список изменений, расчёт топлива на гонку, проверка противоречий, сохранение и файл.

## Do's and Don'ts

### Do
- Жёлтый только у выбранного, и всегда с чёрным текстом.
- Числа узким начертанием с табличными цифрами.
- Подписи на языке гонщика: «Давление в шинах», а не «tyrePressure».
- Честные подписи: где значения — шаблон класса, так и написано.

### Don't
- Не красить действия жёлтым и не делать второй акцент.
- Не резать контент на одинаковые скруглённые карточки с тенью.
- Не ставить заглавные надзаголовки, моноширинные подписи и стрелки «→» в кнопках.
- Не анимировать появление каждого блока. Движение одно — прорисовка схемы при смене трассы; при `prefers-reduced-motion` его нет.
