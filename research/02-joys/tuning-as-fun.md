# Кому в кайф крутить сетап самому

Что внутри: голоса меньшинства, для которого настройка машины — сам источник удовольствия.
Как собирали: OverTake.gg (опрос + форум), Steam Community (ACC/AC), r/simracing через arctic-shift, 23.09.2026.

- Опрос OverTake «Do you prefer fixed or open setups?», 18.06.2023, 1769 голосов: 619 (35%) — за открытые серии, где сетап настраиваешь сам. Jempy: «creating a setup corresponding better to your driving style is a part of the work»; Dzul: «tinkering with setups is part of learning more about all the bits and bolts». Сигнал: 1769 голосов. [OverTake](https://www.overtake.gg/news/fixed-or-open-setups-what-do-you-prefer.1154/)
- manu68 там же: «very rewarding to be successful in taming a car we like with an open setup».
- r/simracing, «How many of you spend the time to develop your own setups?»: из 12 комментариев 2 — явное «люблю» («I really enjoy building setups. I tune the car way more than I race»), 3 — смешанные («love/hate... but the end result... is worth it»), 3 — избегают/покупают. Сигнал: 12 комм., подсчитано вручную. [r/simracing](https://www.reddit.com/r/simracing/comments/jk78vl/)
- r/simracing, «why do you sim race» (151 комм.): «i think I tinker and adjust the rig more than I drive. Probably 60/40» — тюнинг как часть того же хобби, не отдельно. [r/simracing](https://www.reddit.com/r/simracing/comments/1izo27t/)
- Steam, ACC «ONLY about setups» (15 ответов): nono782 — «Learning how to make a setup is part of simracing»; goblueteam получил 0.2–0.5 с/круг и нашёл сетапы «enjoyable and consistent». [Steam](https://steamcommunity.com/app/805550/discussions/0/3821921031523243643)
- Steam, AC-гайд (9 ответов, 2014): delirivmcordia — «75% of a setup is just about making it comfortable/predictable for the driver».

## Вывод
- Реальное меньшинство (треть по опросу OverTake) находит сам процесс настройки увлекательным — не миф.
- Причина не «охота за секундами», а контроль над машиной и обучение технике.
- В личных историях тюнинг иногда занимает больше времени, чем сама езда (60/40) — и подаётся как часть удовольствия.

## Как повторить
OverTake: WebFetch `overtake.gg/news/fixed-or-open-setups-what-do-you-prefer.1154/` (+`?page=2`). Reddit: arctic-shift `.../api/comments/search?link_id=jk78vl` и `link_id=1izo27t`, `limit=100`. Steam: curl с `-A 'Mozilla/5.0...'` на URL тредов — реплаи считаются по `commentthread_comment` в HTML.
