# Пилотаж, плато и «не могу стать быстрее»
Что внутри: боль вокруг техники вождения — плато, торможение, стабильность, самооценка среднего пилота.
Как собирали: заголовки «plateau», «can't get faster», «consistency», «trail braking», «frustrating» в r/simracing и r/iRacing (сотни тредов на слово, часть — меньший охват из-за рейт-лимита архива), плюс комментарии к трём сильным тредам. 23.09.2026.

## Тезисы
- Стабильность («consistency») — самое частое слово в вопросах про пилотаж. Сигнал: 76 вопросов из 200 постов, 13 комм. в среднем. Самые залайканные посты по слову — шутка «could be my camera settings? /s» (1243) и клип «all I was looking for was consistency» (1533); по ним видно, что тема узнаваема, но силу боли не измерить. [r/simracing](https://www.reddit.com/r/simracing/comments/13lqcsi/)
- «Plateau» — устойчивый жанр треда, а не единичный случай: минимум 33 треда суммарно по двум сабреддитам («What to do when you plateau?» 27/42, «The plateau of 3k Irating» 10/31, «I am about a 5+year simracer... stuck on a plateau» 6/15). [пилотаж]
- Trail braking — конкретная техника с систематическими вопросами и гайдами: «Trail braking technique.» 883 апвоута/93 комм.; всего 95+69 тредов по слову в двух сабреддитах, включая «Am I trail braking correctly?» и серию разборов физики. [пилотаж]
- «Средний пилот» — отдельная больная точка: «The Frustrating Reality of Being a Mid-Pack Top Split Driver» — 192 апвоута, 128 комм. Из обсуждения: «As your age your potential skill ceiling is lowered» [не проверено]. [пилотаж]
- Прогресс режут чужие ошибки: тред-опрос «Hey racers, what's been frustrating you most about your iRacing progress?» — 277 комментариев при 116 апвоутах. Цитата: «it's insanely hard to progress when 1.X safety rated guys dive bomb and ram me». [пилотаж, пересекается с инцидентами]
- Самокритика встроена в культуру: «If you are getting wrecked every race... the problem might be you.» — 212 апвоутов. [пилотаж]

## Вывод
- Пилотаж (стабильность, плато, торможение) — систематически повторяющийся жанр треда, сильнее по сигналу, чем сетапы, и сопоставим с деньгами и рейтингом.
- Боль конкретна и адресуема: «почему я не еду стабильно» и «как выйти из плато» — не абстрактная жалоба, а повторяющийся вопрос с запросом на метод.

## Как повторить
`curl -s -A 'research-bot/1.0' 'https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=simracing&title=plateau&limit=100&fields=title,score,num_comments,id,created_utc'` (аналогично consistency, "trail braking", "can't get faster", frustrating; повторить для iRacing); комментарии — `.../api/comments/search?link_id=t3_<id>&limit=40&fields=body,score,author`.
