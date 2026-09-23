# Есть ли уже ассистент, который правит сетап по жалобе гонщика

Проверка 21.09.2026. В таблице `ai-tools.tsv` — 41 продукт, каждая строка привязана к странице, которую я открыл.

## Короткий ответ

Утверждение «такого решения нет» не подтверждается. Такие продукты есть, их несколько, они продаются прямо сейчас, и самый старый предок идеи торгуется с 2018 года.

Точнее так:

- Сценарий «опиши словами, что не так с машиной, — получи конкретную правку» **продаётся как товар**. Минимум пять продуктов.
- Сценарий «сам прочитал телеметрию, сам написал готовый файл сетапа» **тоже продаётся**. Минимум два продукта, один из них поддерживает iRacing.
- Бесплатный открытый аналог с той же логикой существует и активно развивается — последний коммит в день проверки.
- Полностью пустой ниши, на которую можно указать пальцем, я не нашёл.

## Три ближайших аналога

### 1. onRails (Monkey Face Software) — самое точное совпадение с замыслом

<https://vrce.itch.io/onrails> · <https://www.virtualracecarengineer.com/>

Это буквально то, что описывает команда, только без большой языковой модели.

- Setup Developer: «Create a complete baseline setup from scratch» — собирает сетап с нуля, задавая наводящие вопросы о поведении машины.
- Setup Engineer: «Log your lap. Describe what the car is doing. Get specific, ranked recommendations» — описываешь, что делает машина, получаешь конкретные рекомендации с приоритетом.
- Девять симуляторов, включая iRacing. Есть In-Race Engineer прямо в кокпите на четырёх клавишах нумпада.
- Объясняет логику каждого значения, а не просто выдаёт число.
- 29,74 USD разово. Обновлён примерно 29.08.2026.

Чем отличается от замысла: файл сетапа не пишет — выдаёт значения, которые вносишь руками. И это экспертная система на правилах, а не ИИ.

Важно для защиты: у тех же авторов лежат Setup Developer Tool и Virtual Race Car Engineer версий 2018, 2020 и 2021 (<https://vrce.itch.io/>). Идея «опроси пилота и выдай правку» продаётся как минимум семь лет.

### 2. Coach Dave Delta — Setup IQ

<https://coachdaveacademy.com/announcements/setup-iq-tailor-made-setups/> (анонс 09.07.2026)

Крупнейший платный игрок уже делает автоматическую правку сетапа:

- «Setup IQ analyses your laps and the setup you are using, spots exactly what's holding you back in the setup, and adapts it to your driving style automatically».
- Пишет результат новым файлом: «The first time you Auto Tune, Setup IQ creates and saves a brand-new setup to your PC».
- Работает с любым сетапом, не только со своими: «Setup IQ isn't locked to Coach Dave setups».
- 11,99 GBP в месяц.

Чем отличается: пилот ничего не описывает словами — система читает телеметрию. На старте только Le Mans Ultimate и ACC, iRacing в Setup IQ не заявлен.

### 3. Full Grip Vision

<https://www.fullgripmotorsport.com/about/fullgripvision>

Ближе всех к «полной» версии задумки:

- «Vision reads your telemetry and builds a setup around the way you actually drive, then writes a real, ready to load file for your game».
- «It detects 61 types of setup issue and adjusts tire pressures, dampers, springs, anti roll bars, differential, ride height, camber, toe, brake bias, TC and ABS».
- Девять симуляторов, у iRacing помечена полная поддержка.
- Бесплатный тариф есть, платные от 3,99 до 9,99 EUR в месяц.

Чем отличается: ранний доступ, независимых проверок качества нет. И упор сделан на «он сам крутит» — сказано прямо: «It does not just suggest numbers».

### Ещё три, которые стоит знать

- **RacingSetup AI** (<https://www.racingsetup.com/en/>) — загружаешь файл сетапа или его фото, пишешь «недостаточная поворачиваемость в 10-м повороте в Монце», получаешь правки. iRacing, ACC, AC, LMU. От 5,99 до 10,99 USD в месяц. Тарификация в токенах — под капотом языковая модель.
- **Simulator Controller / Setup Workbench** (<https://github.com/SeriousOldMan/Simulator-Controller/wiki/Setup-Workbench>) — бесплатный и открытый. Выбираешь проблему, задаёшь ползунками важность и серьёзность, получаешь рекомендации, кнопкой применяешь их к загруженному файлу сетапа. 441 звезда, последний коммит 21.09.2026 — в день проверки. Правит файлы для AC, ACC, AC EVO, LMU, rFactor 2.
- **SimRace.app** (<https://simrace.app/problems>) — выбираешь симптом из списка (снос на входе, срыв, нестабильность под тормозом, перегрев шин), сервис читает твою телеметрию и выдаёт изменения, ранжированные по выигрышу и риску. От бесплатного тарифа до 13,99 EUR в месяц.

## Как устроен рынок

Из 41 проверенного продукта:

- **8 генерируют или правят сетап**: onRails, Setup IQ в Coach Dave Delta, Full Grip Vision, APEX.Ai, RacingSetup AI, AiMotor, Simulator Controller, плюс старые Setup Developer Tool и Virtual Race Car Engineer.
- **11 частично** — советуют конкретные правки, но файл сетапа не пишут: SimRace.app, Track Engineer PRO, TrackLab Engineer, AiDE, Racing View, RaceCrewAI, Pro Engineer, iracing-setup-advisor, четыре мелких открытых проекта 2026 года, а также обычный ChatGPT и готовые GPT из его стора.
- **20 сетап не создают вообще.** Это либо магазины готовых сетапов, сделанных людьми (VRS, Track Titan, trophi.ai, GO Setups, Open Source Setups), либо телеметрия и оверлеи (Garage 61, SimHub, MoTeC i2, RaceLab, Simracing Insights, Telemetry Copilot, RaceData AI, RACEngineer.ai, Braking Lab).
- **2 строки — мёртвые проекты**, оставлены как след: FDFS Setup Tools и заброшенные открытые генераторы на GitHub.

Главный разрыв, который видно по этим цифрам: у крупных игроков ИИ отвечает за коучинг по пилотажу, а сетапы делают живые люди и продают отдельно. Track Titan так и пишет в заголовке: «The Only Place For AI Coaching & HYMO iRacing Setups». Сетапы у них — «created and tested by professional esports drivers».

## Про обычный ChatGPT

Симрейсеры используют его уже три года, и есть готовые GPT под задачу — Race Engineer Pro («Your sim racing setup specialist»), iRacing Setup Pro, Iracing Setup Chief, Engineer Sim Racing Pro. Все четыре — просто карточки с промптом, без доступа к файлам сетапа и телеметрии.

Что говорит сообщество (это самая ценная часть для защиты, потому что тут названы конкретные поломки, а не «ИИ плохой»):

- Возражение в треде r/iRacing от 11.10.2025: сетапы от ChatGPT «are always bad. They are usually entirely illegal» — то есть **не проходят техинспекцию**, значения вылезают за допустимые min/max. <https://www.reddit.com/r/iRacing/comments/1o3vf7h/chatgpt_for_setups/>
- Претензия по существу от 11.08.2026: пилот жаловался на снос после бампа в шикане Уоткинс-Глен, «The AI suggestet to make the dampers less stiff. When I was talking to an engineer he said, that you cant fix such problems with the dampers» — **модель путает причину и следствие** в геометрии.
- Но есть и обратные свидетельства: другой пилот заявляет два рекорда на сетапах от ИИ и «they do pass tech», а сетап через API обходится ему «literally $0.50».
- Экономика против команды: «I dont want to pay $20 for chatgpt plus… when I can spend $9.99 on Coach Dave Delta that gives me setups AND telemetry AND leaderboards AND AI Coaching».

Рабочий пайплайн сообщество нащупало само и описало в том же треде: диапазоны min/max параметров машины + текущий сетап (выгрузка из iRacing в HTML) + CSV-телеметрия из MoTeC + описание проблемы словами. Это, по сути, готовая спецификация входных данных.

## Что из этого следует для проекта

Тезис «такого решения нет» на защите развалится за одну минуту поиска. Заменить его можно на что-то защитимое:

1. **Никто не стал лидером.** Рынок раздроблен: 3–4 платных сервиса по 6–30 долларов, один зрелый открытый проект, куча одиночек. Продукта, который все называют стандартом, нет.
2. **Две поломки конкурентов названы вслух и обе чинятся инженерно**: валидация по диапазонам из файла машины (чтобы сетап проходил техинспекцию) и правила вместо угадывания модели там, где речь о геометрии.
3. **Идею пробуют делать прямо сейчас.** За 2026 год минимум четыре независимых открытых проекта с той же логикой (pit-wall, Delta от Inf015, shakedown-engineer, iRacing-Companion) — и ни один не дорос до продукта. Это аргумент и за актуальность темы, и за то, что сложность не в старте.
4. **Есть кладбище.** rlichiere/acc-setup — один коммит в 2023 году и всё. ddervisis/asg заброшен в феврале 2024. vapor-manager — январь 2025. AiDE, ближайший конкурент по сценарию, анонсировал запуск, собрал список ожидания и молчит с 30.06.2025, хотя на главной до сих пор висит «Launching on iRacing this Year».

## Риск, который нельзя пропустить

**iRacing добилась закрытия стороннего инструмента, работавшего с файлами .sto.**

Домен setupdelta.com отдаёт HTTP 410 и текст: «SetupDelta has been taken offline following a request from iRacing». Это был всего лишь браузерный просмотрщик, сравнивавший два файла .sto — он ничего не генерировал.

Проверено: <https://www.setupdelta.com> (21.09.2026).

Для сравнения, Setup Viewer (<https://www.setupviewer.com/>) — тоже просмотрщик .sto для iRacing — работает с 2018 года и живёт спокойно. Почему закрыли именно SetupDelta, из открытых источников не видно: независимых публикаций о закрытии найти не удалось, единственный источник — сам сайт.

Если проект строится вокруг чтения и записи .sto, этот прецедент нужно разобрать до защиты.

## Чего проверить не удалось

- **Цены AiDE и AiMotor.** У AiDE их на сайте нет вообще. У AiMotor страница цен не отрисовалась — сайт полностью на JavaScript, пункт меню «Pricing» ведёт не на отдельный адрес.
- **Авторы, рейтинги и даты обновления GPT в сторе ChatGPT.** Неавторизованному пользователю отдаются только мета-теги. Прежний каталожный листинг Race Engineer Pro на yeschat.ai удалён (HTTP 410), в веб-архиве снимков нет.
- **Вердикты авторов видеотестов ChatGPT.** Ролики нашлись и даты подтверждены (Tommy Brandon, 10.06.2025, 12 089 просмотров; PowerQ — три ролика 2023–2024), но субтитры пустые, а в описаниях вывода нет. Сказать, чем закончились их тесты, по открытым данным нельзя.
- **Цены Braking Lab, RACEngineer.ai, RaceCrewAI, GO Setups** — тарифы на сайтах не опубликованы.
- **Дискорд-анонсы.** Поиск по анонсам ИИ-инструментов для сетапов в дискорд-сообществах ничего не дал: содержимое серверов поисковикам недоступно. Эту часть задания закрыть не удалось.
- **Reddit напрямую** поисковику недоступен, треды снимались через RSS-эндпоинты самих обсуждений.
- **MoTeC** не публикует цены на i2 Pro: «If you are interested in purchasing this product contact an Authorised MoTeC Dealer».
- **FDFS Setup Tools** — веб-генератор сетапов ACC, на который до сих пор ссылаются форумы Steam и Assetto Corsa: домен не резолвится, проверить нечего.
