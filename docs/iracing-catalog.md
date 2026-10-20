# Каталог iRacing в кабинете

Кабинет и ассистент — только под iRacing. Всё, что в каталоге, есть в iRacing и проверено по официальным источникам 20.10.2026.

## Машины — `src/data/cars.json`

22 машины, четыре класса (`src/data/categories.ts`):

| Класс | Машины | Трассы |
|---|---|---|
| NASCAR | Next Gen Cup: Chevrolet Camaro ZL1, Ford Mustang, Toyota Camry | овалы и дорожные |
| GT3 | Acura NSX EVO 22, Aston Martin Vantage EVO, Audi R8 LMS EVO II, BMW M4 EVO, Corvette Z06 GT3.R, Ferrari 296, Ford Mustang, Lamborghini Huracán EVO, McLaren 720S EVO, Mercedes-AMG 2020, Porsche 911 GT3 R (992) | дорожные |
| GT4 | Aston Martin Vantage, BMW M4 G82 EVO, Ford Mustang, McLaren 570S, Mercedes-AMG, Porsche 718 Cayman Clubsport | дорожные |
| Cup | Porsche 911 Cup (992.2), Ferrari 296 Challenge | дорожные |

- Список и имена — со страницы https://www.iracing.com/cars/ (поле `iracing.name` — имя ровно как там).
- Двигатель, ABS и TC — из руководств iRacing: https://www.iracing.com/resources/user-manuals/. Ошибки в руководствах отмечены в `notes` (у Ferrari 296 Challenge там по ошибке атмосферный V8).
- `rain` — есть ли у машины дождевые шины: https://support.iracing.com/support/solutions/articles/31000172614. У NASCAR Next Gen нет.
- Porsche 911 Cup 992.1 в iRacing стал Legacy, поэтому не включён.

## Трассы — `src/data/tracks.json`

37 трасс: 21 дорожная и 16 овалов.

- Дорожные — прежние схемы (bacinger/f1-circuits и OpenStreetMap) без семи трасс, которых в iRacing нет: Поль Рикар, Сепанг, Яс-Марина, Бахрейн, Кьялами, Лусаил, Валенсия.
- Овалы — контуры из OpenStreetMap (ODbL, линии `highway=raceway`; у Дайтоны, Шарлотт, Лас-Вегаса и Хомстеда отобраны только линии самого овала, без road course и roval). Длины — по регламенту, источники в `factSources`.
- Дождь в iRacing бывает только на дорожных конфигурациях: у овалов `rain: false`.

## Гараж — `src/data/carSetup.ts`

У каждого класса свой шаблон по руководствам iRacing (Ferrari 296 GT3, BMW M4 G82 GT4, Mercedes-AMG GT4, Porsche 718 GT4, Porsche 911 Cup 992.2, Ferrari 296 Challenge, NASCAR Next Gen).

Пределы регулировок у каждой машины свои и публично не опубликованы, поэтому почти всё считается **от базового сетапа iRacing** (`relative: true`): 0 — как в baseline, «+1» — на клик или единицу больше. Абсолютное только топливо — от него план на гонку (бак — `tankL` класса). Это же совпадает с тем, как отвечает ассистент: «уменьшить баланс тормозов на клик».

## Погода — `src/data/conditions.ts`

Термины iRacing: погода статичная / по прогнозу / по таймлайну, облачность (ясно — пасмурно), шанс дождя, туман, резина на трассе. Шанс дождя, вода на трассе и выбор шин видны, только если дождь возможен у машины и трассы.

## Как добавить

- **Машину:** запись в `cars.json` с `iracing.name` со страницы iRacing и источниками; если у класса нет нужной регулировки — в шаблон класса.
- **Трассу:** запись в `tracks.json` с `kind`, `rain`, `iracing`, схемой (`viewBox` 1000 по большей стороне, отступ 40) и характером в `src/data/trackMeta.ts`; английское имя — в `src/i18n/dataEn.ts`.
- **Правило ассистента:** в `applicability` бэкенда — те же имена `iracing.name`; для NASCAR Next Gen — `NASCAR Cup Series Next Gen (Gen 7)`.
