# Дорогое железо
Что внутри: боль вокруг цены оборудования — колёс, педалей, ригов, доставки.
Как собирали: заголовки «expensive» в r/simracing (100 тредов, iRacing не выкачался — 422 от архива), комментарии к одному сильному треду. 23.09.2026.

## Тезисы
- Цена — самая горячая тема выборки по обсуждению: 54 вопроса из 100 постов, 39 комм. в среднем, максимум 323 («Guys with expensive setups — are you really good at racing?»). Самый залайканный пост — мем «This hobby is expensive 🫠» (1764 апвоута, 166 комм.). [r/simracing](https://www.reddit.com/r/simracing/comments/1inugxt/) [деньги]
- Мысль повторяется отдельными тредами минимум 4 раза с 350+ апвоутами каждый: «This hobby got expensive 😭» (420/95), «This shit is too expensive» (418/32), «Another expensive hobby :(» (356/50). [деньги]
- Конкретная претензия к рынку — цена не соответствует пользе: «Genuine question. What makes wheels like this, with such limited functionality so expensive?» (269 апвоутов, 150 комм. — сильнейший комментинг относительно счёта). Из обсуждения: «Is it "worth it"? To vast majority of us, no, it's not.» [деньги]
- DIY как способ обойти цену — отдельная категория контента, не жалоба, а обход: «DIY Rig on a Budget - Reminder it doesn't have to be expensive» (597/150), «Safety Nets are too expensive so I made my own for $15» (321), «Most expensive sim racing gear I've ever bought — Hospital grippy socks» (254/88, протест-юмор). [деньги]
- Логистика раздражает отдельно от цены товара: «Why is SIMAGIC's shipping is so expensive???» — 370 апвоутов, 257 комментариев — один из самых обсуждаемых тредов всей выборки. [деньги]
- Сиденья — отдельная больная точка, комментинг выше апвоутов: «Why are sim rig seat so expensive? A regular car seat costs 1/3» — 149/164. [деньги]

## Вывод
- «Дорого» — системный жанр: минимум 6 разных тредов с 250+ апвоутами повторяют одну мысль разными словами.
- Комментинг часто превышает апвоуты (150–257 комментов при 250–370 апвоутах) — тема вызывает споры «стоит ли того», а не просто согласие.
- iRacing по этому слову не проверен — нужен повтор в одиночном запуске.

## Как повторить
`curl -s -A 'research-bot/1.0' 'https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=simracing&title=expensive&limit=100&fields=title,score,num_comments,id,created_utc'`; iRacing title=expensive — повторить отдельно, вне волны других агентов.
