# Боль вокруг сетапов
Что внутри: как часто и как горячо на Reddit обсуждают сетап машины.
Как собирали: заголовки «setup» в r/ACCompetizione, r/assettocorsa, r/LeMansUltimateWEC, r/iRacing (по 100 тредов), r/simracing не выкачался (архив арктик-шифт стабильно отдавал 422 на этот конкретный запрос — вероятно, конкуренция трёх параллельных агентов за самый частый термин проекта). 23.09.2026.

## Тезисы
- На Reddit «setup» чаще значит железо. Первое место по апвоутам — фото рига «New sim setup». Сигнал: 892 апвоута. [r/assettocorsa](https://www.reddit.com/r/assettocorsa/comments/1psorah/)
- По апвоутам силу боли не сравнить: выше всех в нише мемы и клипы. По вопросам: про «setup» 168 вопросов из 400 постов — больше, чем по любому другому слову, но в среднем 8 комм. на тред. Из них про настройку машины — 43, про железо — 27, остальное по заголовку не определить. Скрипт — `_raw/pains/setup_split.py`.
- Дольше всего обсуждают выбор платного магазина и открытые серии: «Ultimate Paid Setup Thread — which provider is the best?» — 45 комм. [r/LeMansUltimateWEC](https://www.reddit.com/r/LeMansUltimateWEC/comments/1v7vf7z/), «Open Setup Race Without Setup?» — 37 комм. [r/iRacing](https://www.reddit.com/r/iRacing/comments/1vdilua/)
- На iRacing прямых жалоб на сетап тоже нет в топе — есть организационная просьба: «iRacer's seeking independence from commercial setup shops: a call to wrench». Сигнал: 57 апвоутов, 56 комм. [сетап, лёгкая боль — зависимость от магазинов, не сам процесс]
- Фиксированные серии существуют именно затем, чтобы убрать сетап как переменную: «PSA: Production Car Challenge is open setup». Сигнал: 138 апвоутов, 48 комм. — обсуждение живое, но не эмоциональное. [сетап, справедливость, не страдание]
- Культура вокруг сетапов — раздача бесплатного и автоматизация рутины, не мольба о помощи: «Here are some free setups from our ACL23, comment what you need and I'll reply» (43/41, ACC), «Free setup sharing site + tray app that puts setups in the right folder automatically» (52/8, iRacing) — боль здесь про хранение файлов, не про содержание сетапа. [сетап, оргрутина]

## Вывод
- Про сетап спрашивают часто и спокойно: вопрос справочный, спора в нём нет.
- Дольше обсуждают открытые серии, выбор магазина и путаницу с файлами.
- r/simracing по этому слову не проверен — нужен повтор в одиночном запуске без параллельной нагрузки.

## Как повторить
`curl -s -A 'research-bot/1.0' 'https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=ACCompetizione&title=setup&limit=100&fields=title,score,num_comments,id,created_utc'` (аналогично assettocorsa, LeMansUltimateWEC, iRacing); r/simracing title=setup — повторить отдельно, вне волны других агентов.
