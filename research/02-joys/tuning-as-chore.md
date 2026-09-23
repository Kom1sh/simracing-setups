# Кому тюнинг — мука

Что внутри: большинство и его причины избегать самостоятельной настройки машины.
Как собирали: OverTake.gg (опрос + отзывы), Steam Community, r/simracing и r/LeMansUltimateWEC через arctic-shift, 23.09.2026.

- Опрос OverTake «Do you prefer fixed or open setups?», 18.06.2023, 1769 голосов: 919 (52%) — за фиксированные серии, где сетап у всех одинаковый, ещё 231 (13%) — «зависит». Причина — время, не сложность: Eckhart von Glan — «for someone who has atm a max of 2x45mins a week to play, fixed is the way to go»; Bram Hengeveld — «I simply don't want to waste my time on it if I do not have to». Сигнал: 1769 голосов. [OverTake](https://www.overtake.gg/news/fixed-or-open-setups-what-do-you-prefer.1154/)
- Отзыв на Setup Editor, codwheten, 13.04.2021: «It wasn't that it was hard but that it was tedious». [OverTake](https://www.overtake.gg/downloads/setup-editor.40016/reviews?order=rating)
- r/simracing, «'You should really make your own setups' Nah... that's effort»: 330 апвоутов, 28 комм. Топ-комментарий (51): «I hate doing setups so much, I just want to drive... I mostly do fixed setup races and steal world record setups for anything open». Сигнал: 330/28, топ-комм. 51. [r/simracing](https://www.reddit.com/r/simracing/comments/nogdlk/)
- r/LeMansUltimateWEC, «Default setup vs paid setup for non aliens» (20/43): подавляющее большинство ответивших сами не делают сетап, а покупают (GO setups, Coach Dave) — «paid setup it is, with three kids you deserve to be able to just hop in race». Сигнал: 45 собранных комментариев, ни один не описывает создание сетапа как хобби. [r/LeMansUltimateWEC](https://www.reddit.com/r/LeMansUltimateWEC/comments/1w2g5ya/)
- Steam, ACC: сетапы «locked behind pay walls»; платный сетап у Coach Dave — «expensive as hell» (~$30/машина). [Steam](https://steamcommunity.com/app/805550/discussions/0/4351113647138461669)

## Вывод
- Большинство (52% против 35%, 1769 голосов) выбирает серии, где сетап крутить не надо — мотив «не хочу тратить время», не «слишком сложно».
- Рынок платных сетапов (VRS, Coach Dave, GO setups по ~$30/машина) живёт именно потому, что готовы платить, лишь бы не настраивать самим.
- Даже жалоба «tedious» — не про непонятность механики, люди понимают процесс, просто не хотят его делать.

## Как повторить
OverTake: WebFetch `overtake.gg/news/fixed-or-open-setups-what-do-you-prefer.1154/` (+`?page=2`), `overtake.gg/downloads/setup-editor.40016/reviews?order=rating`. Reddit: arctic-shift `link_id=nogdlk` и `link_id=1w2g5ya`, `limit=100`. Steam: curl UA `Mozilla/5.0...`.
