# ТЗ на картинки для лендинга

Три фото. Сайт работает и без них: пока файла нет, блок выглядит аккуратно без картинки. Как только файл лежит в `public/img/` под нужным именем (`.jpg` или `.webp`), сборка сама вставит его на `/ru/` и `/en/`.

## Общие правила для всех трёх

- Фотореализм, как снято на камеру: естественный или практический свет, глубокий чёрный, нейтральные холодные тона и **один тёплый жёлтый акцент** (#FFED00) в кадре — он связывает фото с сайтом.
- **Никакого текста**: ни букв, ни цифр, ни логотипов, ни наклеек спонсоров, ни водяных знаков. На экранах только размытая картинка гонки, без интерфейса — генератор всё равно сделает буквы кривыми.
- Машина — **условный современный GT-болид**: без марки, значков и узнаваемой модели.
- Людей не показывать в лицо: пилот со спины или только руки.
- Не 3D-рендер и не «пластик»: зерно, лёгкая глубина резкости, живой свет.

## 1. Hero — пилот за симулятором

- **Файл:** `public/img/hero.jpg`
- **Размер:** 1024 × 1536 (вертикальный 2:3)
- **Где:** справа в первом экране. В **нижней левой трети** будет лежать карточка «жалоба → ответ», поэтому там должен быть спокойный тёмный фон без важного; главное — в верхней и правой части кадра.

```
Photorealistic over-the-shoulder shot from behind and to the left of a sim racer at a home racing simulator rig in a dark room at night. Direct-drive steering wheel, black bucket seat, pedals, three large curved monitors showing a generic modern GT race car cornering on a race track at dusk, motion-blurred, with no on-screen interface. The room is lit only by the cool glow of the monitors and a thin warm yellow LED strip (#FFED00) under the desk. The driver's face is not visible. Deep blacks, neutral cool tones, subtle film grain, shallow depth of field, 35mm lens. Keep the lower-left third of the frame dark and calm. No text, no letters, no numbers, no logos, no brand marks, no watermarks. Vertical 2:3.
```

## 2. «Что такое сетап» — руки на руле

- **Файл:** `public/img/about.jpg`
- **Размер:** 1536 × 1024 (горизонтальный 3:2)
- **Где:** под тремя абзацами о том, что такое сетап, на всю ширину правой колонки.

```
Photorealistic close-up of gloved hands on the rim of a sim racing steering wheel, the right thumb turning a small rotary knob on the wheel face. A thin warm yellow ring (#FFED00) glows around the knob. The wheel's small center display shows only abstract glowing bars, no digits or letters. Dark background, soft light from a monitor off-frame on the left, shallow depth of field with the knob in sharp focus. Deep blacks, neutral cool tones, subtle film grain, 50mm lens. No text, no numbers, no logos, no brand marks, no watermarks. Horizontal 3:2.
```

## 3. Финал — машина в повороте

- **Файл:** `public/img/final.jpg`
- **Размер:** 1536 × 1024 (горизонтальный 3:2)
- **Где:** в последнем блоке «Покажите самый неудобный поворот», справа от текста.

```
Photorealistic low-angle three-quarter front view of a generic modern GT race car cornering hard on a race track at sunset, front wheel turned, slight body roll. Plain dark graphite livery with one thin warm yellow stripe (#FFED00), no sponsor decals and no badges. Red and white kerbs at the apex, background softly motion-blurred, warm low sun behind the car with a cool shadow side. The car fills the right two thirds of the frame. Subtle film grain, 70mm lens. No text, no letters, no numbers, no logos, no brand marks, no license plates, no watermarks. Horizontal 3:2.
```

## Как передать

Кидай файлы как есть (PNG тоже подойдёт) — сожму в WebP, подключу и проверю на компьютере и телефоне. Если генератор всё же нарисовал буквы или логотип — лучше перегенерировать, чем замазывать.
