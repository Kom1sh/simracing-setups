# Боли ниши симрейсинга на Reddit
Что внутри: о каких проблемах чаще всего спрашивают в пяти сабреддитах и где среди них сетап.
Как собирали: 2410 постов из архива arctic-shift (r/simracing, r/iRacing, r/ACCompetizione, r/assettocorsa, r/LeMansUltimateWEC) по 15 словам, 23.09.2026. Сырьё — `_raw/pains/`.

## Как читать
- Апвоуты в r/simracing собирают мемы и клипы. Первое место по «safety rating» — шутка «Safety rating is over 9000». Сигнал: 1680 апвоутов. [Reddit](https://www.reddit.com/r/simracing/comments/wqvr7d/)
- Поэтому ранжируем по постам-вопросам (в заголовке «?», how, help, struggle) и среднему числу комментариев. Отбор по заголовку грубый.

## Где спорят больше всего
| Слово в заголовке | Вопросов | Комм. в среднем |
|---|---|---|
| expensive (цена) | 54 | 39 |
| frustrating (что бесит) | 54 | 26 |
| time (время) | 63 | 25 |
| burnout, quit (выгорание, бросить) | 83 | 24 |
| wrecked (протаранили) | 33 | 22 |
| iRating, safety rating | 117 | 18–21 |
| trail braking, consistency (пилотаж) | 151 | 13–18 |
| motion sickness (укачивание в VR) | 45 | 17 |
| FFB (отдача руля) | 107 | 7 |
| setup | 168 | 8 |

- Самый обсуждаемый вопрос выборки — «Guys with expensive setups — are you really good at racing?». Сигнал: 323 комм. [Reddit](https://www.reddit.com/r/simracing/comments/1rs1mcl/)
- Отдельный тред «what's been frustrating you most about your iRacing progress?» разобран в [progress-frustrations.md](progress-frustrations.md). Сигнал: 277 комм. [Reddit](https://www.reddit.com/r/iRacing/comments/1mdewbt/)

## Где тут сетап
- Вопросов про «setup» больше всех, но отвечают на них коротко. Спросил — получил ответ, спора нет. Сигнал: 168 вопросов, 8 комм. в среднем.
- По заголовку: 43 вопроса про настройку машины, 27 про железо, 96 не определить. Скрипт — `_raw/pains/setup_split.py`.
- Дольше всего обсуждают платные сетапы и открытые серии: «Ultimate Paid Setup Thread» — 45 комм. [Reddit](https://www.reddit.com/r/LeMansUltimateWEC/comments/1v7vf7z/), «Open Setup Race Without Setup?» — 37 [Reddit](https://www.reddit.com/r/iRacing/comments/1vdilua/).
- r/simracing по слову «setup» не выкачан: архив отдавал ошибку 422.

## Вывод
- Сильнее всего спорят о деньгах, времени и прогрессе. Сетап — частый и спокойный вопрос.
- Сетап обсуждают дольше, когда речь об открытых сериях и выборе магазина.
- Вопросов про пилотаж 151 — стабильный поток, но спорят о нём меньше, чем о деньгах.

## Как повторить
`https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=<sub>&title=<слово>&limit=100`, пауза 8–10 с. Скрипты — `_raw/pains/fetch2.py`, `setup_split.py`.
