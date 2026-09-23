# Время, выгорание и «стоит ли оно того»
Что внутри: боль вокруг времени на хобби, выгорания и ухода из симрейсинга.
Как собирали: заголовки «time», «quit», «burnout» в r/simracing и r/iRacing (до 100 тредов на слово), комментарии к трём сильным тредам. 23.09.2026.

## Тезисы
- Прямой вопрос о смысле хобби собирает серьёзный отклик: «Why do people even waste their time doing this?» — 409 апвоутов, 102 комм. [r/simracing](https://www.reddit.com/r/simracing/comments/1v3ezci/) [время]
- Выгорание — открытый жанр с рекордным комментингом: «Sim Racing burnout - should I wait any longer?» — 318 апвоутов, 213 комментариев. Из обсуждения: «the driving standards on iracing made me question why im doing all this». [время/выгорание]
- Сообщество расколото в ответ на выгорание — часть советует не продавать оборудование и переждать: «do not sell! i promise that itch comes back hard» и «gear like this I would never sell... just let it sit for a while» [комментарии, не проверено].
- Уход из хобби после конфликта — типовой триггер, не единичный: «(LMU) People like this make me want to quit sim racing altogether» — 361 апвоут/100 комм., с апдейтом после бана обидчика (137/56 отдельным тредом). [время/выгорание, пересекается с инцидентами]
- Деньги и время слиты в одной жалобе с абсолютным рекордом комментинга всей выборки: «I'm so tired of these weeks where you still have to buy stuff... the economic system makes me want to quit the game» — 191 апвоут, но 365 комментариев. [время + деньги]
- Осознанное сокращение хобби как исход, не резкий уход: «The time has come to deprioritize the hobby. Moved it under the stairs to save space.» — 145/23. [время]

## Вывод
- Выгорание и «стоит ли оно того» — не редкость: минимум 3 треда с 100+ комментариями (365, 213, 100) — самое высокое отношение комментариев к апвоутам во всей выборке.
- Деньги и время редко жалуются раздельно — чаще это один пакет усталости, а не отдельная претензия к сетапу или пилотажу.

## Как повторить
`curl -s -A 'research-bot/1.0' 'https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=simracing&title=burnout&limit=100&fields=title,score,num_comments,id,created_utc'` (аналогично quit, time; для iRacing тоже); комментарии — `.../api/comments/search?link_id=t3_<id>&limit=40&fields=body,score,author`.
