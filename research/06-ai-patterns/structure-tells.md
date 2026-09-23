# Шаблонная структура ИИ-презентаций
Что внутри: порядок слайдов, приёмы-пояснялки и финальные слайды, по которым дека узнаётся как шаблонная.
Как собирали: pitch-deck гайды (YC, waveup, basetemplates), plusai.com, разбор структуры build.js нашей деки, 23.09.2026.

- Жёсткий порядок «проблема → решение → рынок → команда → раунд» — доминирующий шаблон. «The strongest decks cover the same core in order: problem, solution, why now, market size, business model, traction, team, raise» — при этом сами гайды предупреждают: общие фразы вроде «рынок неэффективен» ничего не доказывают без цифр. [waveup.com](https://waveup.com/blog/problem-solution-slide/), [basetemplates.com](https://www.basetemplates.com/pitch-deck-slides/problem-slide)
- Подзаголовок-пояснялка под заголовком, которая объясняет, зачем слайд существует, а не добавляет мысль («Чтобы дальше говорить на одном языке»). Это ровно та «топик-структура», которую метод assertion-evidence называет слабой: заголовок-тема вместо заголовка-утверждения. [writing.engr.psu.edu](http://writing.engr.psu.edu/2005_alley_neeley.pdf)
- Финальный слайд «Спасибо. Вопросы?» без содержательной мысли — шаблонный закрыватель по умолчанию; вместо него советуют оставлять последнюю содержательную мысль или конкретный CTA. [plusai.com](https://plusai.com/blog/how-to-make-ai-slides-that-dont-look-like-ai-slop/)
- Жирная итоговая строка-вывод под карточками на каждом смысловом слайде — вариант «Section Summary»: слайд пересказывает сам себя вместо того, чтобы сказать новое. [en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
- Одинаковый ритм слайд-в-слайд: заголовок (+пояснялка) → 2–4 карточки одной формы → акцентная плашка-вывод. В нашей деке ритм зашит прямо в функции `head()`/`card()` в build.js и повторяется на 8 из 14 слайдов (2, 3, 5, 6, 10, 11, 13, 14) — дека читается «по методичке», даже когда факты на каждом слайде разные. Источник — сам файл: /Users/egor/Downloads/simracing-deck/build.js.

## Вывод
- Шаблонный порядок слайдов узнаваем даже с честным контентом — лечит не смена порядка, а то, что каждый слайд ведёт к следующему по логике конкретной истории, а не по чек-листу.
- Пояснялка и итоговая жирная строка — два места, где текст чаще всего скатывается в пересказ самого себя.
- Финальный слайд без мысли — самый дешёвый дефект в починке: замена одной строки.

## Как повторить
- запрос «"problem" "solution" "market" "team" pitch deck template generic criticized formulaic slides order», 23.09.2026
- запрос «dark title slide dark closing slide sandwich deck design template AI deck looks the same», 23.09.2026
- разбор /Users/egor/Downloads/simracing-deck/build.js — функции head(), card(), порядок 14 слайдов
