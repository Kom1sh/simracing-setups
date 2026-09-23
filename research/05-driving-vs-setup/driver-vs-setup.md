# Пилотаж или сетап: сколько времени круга даёт каждый
Что внутри: оценки тренеров, сервисов и самого комьюнити — сколько секунд/% лаптайма даёт сетап против техники.
Как собирали: r/iRacing и r/simracing через архив arctic-shift (посты и комментарии по «setup vs skill», «paid setup vs default»), сайты VRS/Almeida/Coach Dave/MinizMods, 23.09.2026.

## Тезисы
- Топ-комментарий на r/iRacing: «Setups make *the car* faster» — сетап не заменяет пилота, а лишь делает машину быстрее саму по себе. Сигнал: 121 апвоут в треде «paid setup vs default» (40 апвоутов, 83 комм.). [Reddit](https://www.reddit.com/comments/1pkwm2b/)
- Там же: «Tweak your driving, 2s is usually difference between average and top level drivers. Setup could help, but it's usually not as important or magical as most people think.» Сигнал: 40 апвоутов на комментарий. [Reddit](https://www.reddit.com/comments/1pkwm2b/)
- Там же: «If you are on pace, setups will give you a few *tenths* of a second. If you are a few seconds off the pace, it's not the car or the setup, it's just practice.» Сигнал: 23 апвоута. [Reddit](https://www.reddit.com/comments/1pkwm2b/)
- VRS (школа): при отставании 3 с примерно 0,3 с (10%) — это сетап, остальное — пилотаж; порядок величины совпадает с оценкой комьюнити. Сигнал: единичное упоминание. [VRS](https://virtualracingschool.com/academy/iracing-career-guide/setups/to-setup-or-not-to-setup/)
- Suellio Almeida (тренер, заявлено 36 000+ учеников): «The car setup is the last 2%. Your driving is the first 98%.» Сигнал: заявленная база — 36 000 учеников. [Almeida Racing Academy](https://almeidaracingacademy.com/blog/ultimate-sim-racing-car-setup-guide-beginners-stop)
- Разрыв шоп-сетап vs эсопорт-команда: «around 5 tenths from VRS set to a good team setup». Сигнал: 5 апвоутов, тред 7 апвоутов/30 комм. [Reddit](https://www.reddit.com/comments/11wqc53/)

## Вывод
- Комьюнити и школы дают близкие цифры: десятые доли секунды от сетапа, когда пилот уже близко к темпу; разрыв в секунды — почти всегда пилотаж, не сетап.
- Топ-комментарий с 121 апвоутом прямо разводит понятия: сетап ускоряет машину, а не компенсирует пилота.
- Официальной цифры от iRacing не нашли — оценки идут от школ (мотивированный источник) и комьюнити (апвоуты, не наука) — [не проверено] как независимое исследование.

## Как повторить
- arctic-shift: `/api/posts/search?subreddit=iRacing&title=setup%20vs`, `/api/posts/search?subreddit=iRacing&title=paid%20setup%20vs%20default`, затем `/api/comments/search?link_id=t3_<id>`.
- WebSearch: «Suellio Almeida setup vs driving lap time», «VRS setup driver lap time percentage seconds».
- Дата сбора: 23.09.2026.
