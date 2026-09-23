# От чего радость в симрейсинге

Что внутри: главные источники удовольствия — не про настройки, про сам заезд.
Как собирали: r/simracing через архив arctic-shift (reddit.com напрямую заблокирован для этой среды), Steam Community и OverTake.gg, 23.09.2026.

- Чистая, уважительная борьба на трассе — главный кайф по сигналу. Топ-пост «It's the best feeling when 2 drivers race hard with respect»: 1206 апвоутов, 128 комм. Опрос OverTake (740 голосов): «бои в среднем пакете» и «чистая гонка» — лидеры, «лидировать все круги» — 57 голосов, худший результат. [r/simracing](https://www.reddit.com/r/simracing/comments/13ty5if/), [OverTake](https://www.overtake.gg/news/what-makes-sim-racing-fun-for-the-overtake-community.3111/)
- Первая победа — кластер из 6 постов в топе выдачи: 958, 779, 756, 641, 573, 455 апвоутов. Сигнал: 6 тредов. [r/simracing](https://www.reddit.com/r/simracing/comments/s9unxn/)
- Постройка и показ рига — отдельный жанр. Топ «Sim Rig>>>>>>>>>>>>>iPhone Duo»: 1710/202; «How Many Buy The Rig But Don't Stick With It?» 293/289 комм. Сигнал: 100 тредов по слову «rig». [r/simracing](https://www.reddit.com/r/simracing/comments/1wl3p2l/)
- Вопрос «зачем ты гоняешь» — вечная тема: три треда собрали 151, 205 и 195 комментариев. Ответы: эскапизм, недоступность реальных гонок по деньгам/травме, «ближе всего к настоящей гонке». Сигнал: 3 треда, 551 комм. [r/simracing](https://www.reddit.com/r/simracing/comments/1izo27t/)
- VR/погружение — «Holy f**k, I'm inside this car» как типовая первая реакция. Сигнал: единичное упоминание, не подсчитано. [OverTake](https://www.overtake.gg/threads/sim-racing-moments.167646/)
- Личный рекорд — «knocked half a second off my PB… super proud»: 31/11. [r/ACCompetizione](https://www.reddit.com/r/ACCompetizione/comments/1pcexej/)

## Вывод
- Самый громкий кайф — не инженерный: честная борьба и первая победа бьют любой сетап-пост на порядок.
- Риг и рефлексия «зачем я это делаю» — второй пласт: показывать вещи и объяснять мотив людям важно не меньше, чем гонять.
- VR и личный прогресс подтверждены, но сигнал слабее — единичные посты, не кластеры.

## Как повторить
arctic-shift: `https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=simracing&title=best+feeling&limit=100&fields=title,score,num_comments,id,created_utc`, так же title=first+win, rig, why+do+you. Комментарии: `.../api/comments/search?link_id=<id>&limit=100`. Пауза 8–10с (общий лимит с другими агентами). OverTake — WebFetch напрямую.
