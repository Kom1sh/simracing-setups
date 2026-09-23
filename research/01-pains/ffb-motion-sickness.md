# Укачивание и обратная связь руля
Что внутри: боль вокруг VR-укачивания и непонятной настройки FFB (force feedback).
Как собирали: заголовки «motion sickness» в r/simracing и r/iRacing, «FFB» в r/ACCompetizione, r/assettocorsa, r/LeMansUltimateWEC (до 100 тредов на слово). 23.09.2026.

## Тезисы
- Крайняя форма боли — продажа оборудования из-за укачивания, а не просто жалоба: «Worth 2100? Guy said everything is brand new he just gets motion sickness real bad» — 150 апвоутов, 129 комм. [r/simracing](https://www.reddit.com/r/simracing/comments/1t57e2w/) [физиология]
- Укачивание — регулярная тема с прямыми просьбами о помощи, комментинг часто выше апвоутов: «VR motion sickness is a real thing…most of you probably knew that already…not me.» (64/78) и «I get motion sickness easily; should I even bother with VR» (21/48). [физиология]
- «Motion sickness through the roof 📈» (125/30) — тема закрепилась даже в мемах, не только в вопросах новичков. [физиология]
- FFB — боль не про «нравится/не нравится», а про непонимание настройки: «My FFB feels nonexistent(G920). The steering feels incredibly loose» (16/22), «What's up with this... After testing I feel it makes the car sloppy» (40/26). Сигнал разбросан по мелким тредам, максимум по слову — 123 апвоута. [техника, не сетап и не пилотаж напрямую]
- Комьюнити-решения по FFB многочисленны, но каждое нишевое и требует стороннего софта: «Disable Steam Input for much better FFB» (123/41, LMU), «Adam's FFB Toolbox v1.0» (64/13, AC). [техника]

## Вывод
- Укачивание в VR — реальная, регулярная боль с высоким комментингом относительно апвоутов: вопросов и просьб о помощи больше, чем готовых решений.
- FFB — боль существует, но по силе сигнала заметно слабее денег, пилотажа и рейтинга; это техническая надстройка, а не главный источник фрустрации.

## Как повторить
`curl -s -A 'research-bot/1.0' 'https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=simracing&title=motion%20sickness&limit=100&fields=title,score,num_comments,id,created_utc'` (аналогично iRacing); title=FFB для ACCompetizione, assettocorsa, LeMansUltimateWEC.
