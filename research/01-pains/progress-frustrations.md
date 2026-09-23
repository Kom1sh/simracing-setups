# Что тормозит прогресс в iRacing: разбор одного треда
Что внутри: 152 ответа треда о прогрессе в iRacing по темам, с числом ответов и апвоутов.
Как собирали: r/iRacing, тред о фрустрации с прогрессом, июль 2025, 116 апвоутов, arctic-shift, 23.09.2026.

## Темы

| тема | ответов | сумма апвоутов |
|---|---|---|
| рейтинг и соперники | 70 | 129 |
| пилотаж | 27 | 38 |
| время | 15 | 28 |
| прочее / не ответ | 14 | 24 |
| психология | 14 | 23 |
| железо и настройки игры | 9 | 10 |
| деньги | 3 | 5 |
| сетап | 0 | 0 |

## Тезисы
- Рейтинг и соперники — главная жалоба. Сигнал: 70 ответов, 129 апвоутов. «Nobody takes damage, nobody spins out, nobody gets pushed off their line.» [источник](https://www.reddit.com/r/iRacing/comments/1mdewbt/comment/n613uek/)
- Пилотаж — плато, нестабильность, торможение, втрое реже рейтинга. Сигнал: 27 ответов, 38 апвоутов. «i have basically plateaued in terms of pace in GT cars.» [источник](https://www.reddit.com/r/iRacing/comments/1mdewbt/comment/n614tzg/)
- Время — сухо, без эмоций. Сигнал: 15 ответов, 28 апвоутов. «I practice and then just don't get out there like some invisible force stops me.» [источник](https://www.reddit.com/r/iRacing/comments/1mdewbt/comment/n613mb5/)
- Психология — нервы и тилт как главная причина, с физическими симптомами. Сигнал: 14 ответов, 23 апвоута. «My nerves act up so hard my braking foot starts shaking and ruins my race.» [источник](https://www.reddit.com/r/iRacing/comments/1mdewbt/comment/n614feq/)
- Железо — реже всего: неткод, отключения руля и педалей. Сигнал: 9 ответов, 10 апвоутов. «my hardware is beginning to hold me back.» [источник](https://www.reddit.com/r/iRacing/comments/1mdewbt/comment/n6137ar/)
- Сетап как причину не назвал ни один из 152 прямых ответов. Во всём треде (300 комм.) настройка машины всплывает один раз — совет в ветке крутить баланс тормозов. Сигнал: 0 из 152. [Reddit](https://www.reddit.com/r/iRacing/comments/1mdewbt/comment/n64lbvh/)

## Вывод
- Почти половина ответов — про соперников и рейтинг: 70 из 152.
- Пилотаж — вторая причина, в 2,6 раза реже рейтинга (27 против 70), но чаще денег и железа.
- На вопрос комиссии «может, дело в пилотаже» тред отвечает так: сетап не назван, пилотаж назван в 27 ответах, соперники и рейтинг — в 70.

## Как повторить
Данные: `research/_raw/pains/frustration-thread-top.txt`, `frustration-thread-coded.tsv`. Сбор: `curl -s 'https://arctic-shift.photon-reddit.com/api/comments/search?link_id=1mdewbt&limit=100&fields=id,parent_id,body,score,created_utc'`, страницы — `&before=<min created_utc>`; склейка — `.qa/thread_top.py`. Один тред, апвоуты на момент архивации.
