# Рейтинг, чистота гонок и инциденты
Что внутри: боль вокруг Safety Rating, iRating и поведения других пилотов на трассе.
Как собирали: заголовки «safety rating», «iRating», «wrecked» в r/simracing и r/iRacing (до 100 тредов на слово), комментарии к двум сильным тредам. r/simracingstewards не опрошен. 23.09.2026.

## Тезисы
- Safety Rating — любимая тема мемов: «Safety rating is over 9000...» (1680 апвоутов) и «I don't understand why my Safety Rating is so low. Also me:» (1143) — шутки, а не жалобы. Тема узнаваемая всеми. [r/simracing](https://www.reddit.com/r/simracing/comments/wqvr7d/)
- Настоящие вопросы про рейтинг — поток среднего накала: «I'm tired of ruining my safety rating and I need help». Сигнал: 117 вопросов про iRating и SR, 18–21 комм. в среднем, максимум 123. [r/simracing](https://www.reddit.com/r/simracing/comments/1q9hnis/)
- iRating давит на кошелёк психологически — рейтинг стал мерилом, оправдывающим или запрещающим траты: «Told myself no more upgrades until I gain iRating.» — 952 апвоута, 151 комм. [рейтинг + деньги]
- Инциденты от чужих — постоянная лента жалоб: «This person mistook me for whoever wrecked them earlier» (962/45), «This guy just wrecked me >:(» (641/79). Сигнал: 15+ тредов с 100+ апвоутами по слову «wrecked» в двух сабреддитах. [чужое поведение, не сетап и не пилотаж]
- Разбор инцидента раздражает не меньше самого инцидента: «Is it not insane that this guy blatantly intent wrecked me... right after iRacing sent me a response about the protest?» (175/137). [процесс наказания]
- В LMU то же острее из-за молодости системы: «[LMU] I'm tired of ruining my safety rating and I need help» — 155/123. Из комментов: «I really think the LMU system needs quite a bit of work» [не проверено]. [правила SR]
- r/simracingstewards (профильный сабреддит про судейство инцидентов) не опрошен в этом заходе — прямой пропуск. [не проверено]

## Вывод
- Safety Rating/iRating — сильнейшая по апвоутам боль во всей выборке, обгоняет и сетапы, и большинство остальных тем.
- Боль двойная: правила рейтинга воспринимаются как непонятные или несправедливые, а поведение других на трассе не контролируется пострадавшим — и то и другое не лечится сетапом или тренировкой пилотажа.

## Как повторить
`curl -s -A 'research-bot/1.0' 'https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=simracing&title=safety%20rating&limit=100&fields=title,score,num_comments,id,created_utc'` (аналогично iRating, wrecked, для iRacing); добить r/simracingstewards title=unfair/penalty/dirty.
