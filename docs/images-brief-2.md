# ТЗ на картинки, вторая партия

Общие правила — те же, что в [первом ТЗ](images-brief.md): фотореализм, без текста, цифр, логотипов и значков, условный GT-болид без узнаваемой модели, лиц не видно, один тёплый жёлтый акцент (#FFED00) в кадре.

Места под первые 13 картинок уже есть в вёрстке: файл с нужным именем в `public/img/` — и картинка сама встанет на `/ru/` и `/en/`. Последние 4 — запас: на выбор или на замену.

| Файл | Размер | Где на странице |
|---|---|---|
| `symptom-understeer-entry.jpg` … `symptom-bottoming.jpg` (8 шт.) | 1536 × 1024 | шапка карточки симптома, обрезается до 16:9 — главное держать в середине кадра |
| `step-1.jpg`, `step-2.jpg`, `step-3.jpg` | 1536 × 1024 | шапка карточки шага «Как это работает», 16:9 |
| `rules.jpg` | 1536 × 1024 | широкий кадр над блоком «Правила, а не догадки», обрезается до 21:9 — главное в средней полосе |
| `hero-wide.jpg` | 1536 × 1024 | первый экран на телефоне вместо вертикального фото |
| запас: `final-alt.jpg`, `garage.jpg`, `night-track.jpg` | 1536 × 1024 | на замену финалу или для нового блока |
| запас: `auth.jpg` | 1024 × 1536 | страница входа вместо схемы трассы |

Во всех промптах в конце одна и та же приписка — её не убирать:

```
Photorealistic, natural light, deep blacks, neutral cool tones, one warm yellow accent (#FFED00), subtle film grain, shallow depth of field. Generic modern GT race car with a plain dark graphite livery and one thin yellow stripe, no recognizable car design. No text, no letters, no numbers, no logos, no brand marks, no sponsor decals, no license plates, no watermarks. Horizontal 3:2.
```

## Симптомы

**symptom-understeer-entry** — недостаточная на входе
```
Elevated trackside view of a race car turning into a right-hand corner while still braking: the front wheels are turned sharply, but the car pushes wide towards the outside edge of the track, a faint wisp of smoke from the scrubbing front tyres, the red and white kerb at the apex left untouched. Late afternoon sun.
```

**symptom-understeer-mid** — недостаточная в середине
```
Elevated trackside view of a race car in the middle of a long left-hand sweeper at steady speed: front wheels turned, the car drifting wide towards the outer kerb, far from the apex on the inside. Overcast daylight.
```

**symptom-understeer-exit** — недостаточная на выходе
```
Trackside view of a race car accelerating out of a slow corner and running wide over the exit kerb, two wheels on the painted run-off, the nose pointing towards the outside of the track. Evening light.
```

**symptom-oversteer-entry** — избыточная на входе
```
Trackside view of a race car braking into a corner with the rear stepping out: the car is rotated at an angle to its direction of travel, faint smoke from the rear tyres, the driver catching it. Dusk.
```

**symptom-oversteer-exit** — срыв задней оси на выходе
```
Trackside view of a race car on corner exit under power with the rear sliding out, front wheels pointing out of the corner (opposite lock), white smoke from the rear tyres. Low sun from behind.
```

**symptom-braking** — нестабильность на торможении
```
Front three-quarter view of a race car under very heavy straight-line braking at the end of a long straight: the nose dips, front brake discs glow orange through the wheel spokes, the rear looks light and slightly out of line. Dusk, motion blur in the background.
```

**symptom-lockups** — блокировка передних колёс
```
Low close-up of a race car's front wheel locked under heavy braking: a puff of white smoke from the flat-spotting tyre, the brake disc glowing orange, the tread scrubbing on the asphalt. Evening light.
```

**symptom-bottoming** — удары днищем и бордюры
```
Low-angle trackside view of a race car at night bottoming out in a compression at speed: a shower of bright sparks from the underside of the splitter and floor, floodlights in the background, the car riding a high kerb.
```

## Как это работает

**step-1** — опишите проблему
```
Close-up of a sim racer's gloved hand typing a short message on a smartphone held in front of a sim racing wheel; the phone screen shows a softly blurred chat interface in white with one yellow element, nothing readable. Dark room, monitor glow in the background.
```

**step-2** — получите правку
```
Over-the-shoulder view of a sim racer reading a tablet mounted on the side of a simulator rig; the tablet shows a softly blurred white card interface with one yellow highlight, nothing readable; curved monitors with a race track glowing in the background.
```

**step-3** — поменяйте одно и проедьте
```
First-person view from a sim racing cockpit: gloved hands on the wheel, large curved monitors showing the view from a race car through a fast corner at dusk, motion blur on the screens, thin yellow LED strip under the desk.
```

## Правила

**rules** — эксперт проверяет правила
```
A race engineer in a pit garage wearing a headset, studying telemetry traces on a laptop; the screen shows softly blurred colourful line graphs with nothing readable; a race car on jacks in the background, cool garage light and one yellow tyre trolley. Keep the people and laptop in the middle horizontal band of the frame.
```

## Телефон

**hero-wide** — первый экран на телефоне
```
Over-the-shoulder shot from behind a sim racer at a home simulator rig in a dark room at night: direct-drive wheel, bucket seat, three curved monitors showing a race car cornering at dusk with no on-screen interface, thin yellow LED strip under the desk. The driver is in the right half of the frame; keep the bottom third dark and calm. 35mm lens.
```

## Запас

**final-alt** — финал без «узнаваемой» морды
```
Rear three-quarter view of a race car accelerating out of a corner at sunset, low angle, rear wing and diffuser silhouetted against the warm sky, red and white kerbs, background softly motion-blurred.
```

**garage** — регулировки руками
```
Close-up in a pit garage: a gloved hand holding a tyre pressure gauge on the valve of a racing slick, a torque wrench and a yellow-handled tool on the floor nearby, warm work light, dark background.
```

**night-track** — ночная трасса
```
Wide view of a race track at night: light trails of passing race cars through a chicane, floodlights, kerbs glowing red and white, long exposure, deep blue sky.
```

**auth** — страница входа, вертикальный 2:3 (1024 × 1536); в общей приписке заменить «Horizontal 3:2» на «Vertical 2:3»
```
A racing helmet with a dark visor resting on the black bucket seat of a sim racing rig in a dark room, the wheel and a monitor glow behind it, thin yellow LED strip under the desk. Vertical 2:3.
```

## Как передать

Кидать файлы как есть — сожму в WebP, подключу и проверю на компьютере и телефоне. Если генератор нарисовал буквы, логотип или узнаваемую машину, лучше перегенерировать.
