import type { CategoryId, Param, ParamGroup, Range } from './types'

/**
 * Регулировки гаража iRacing по классам. Состав и смысл — по руководствам iRacing
 * (Ferrari 296 GT3, BMW M4 G82 GT4, Mercedes-AMG GT4, Porsche 718 Cayman GT4, Porsche 911 Cup 992.2,
 * Ferrari 296 Challenge, NASCAR Next Gen): https://www.iracing.com/resources/user-manuals/
 *
 * Пределы у каждой машины свои и публично не описаны, поэтому почти всё считается от базового сетапа
 * iRacing (baseline.sto): 0 — как в базе, «+1 клик», «−0,5 psi». Абсолютное только топливо — от него план на гонку.
 */

const around = (half: number): Range => ({ min: -half, max: half, base: 0 })

function rel(id: string, label: string, hint: string, unit: string, half: number, step: number, decimals = 0, requires?: Param['requires']): Param {
  return { id, kind: 'scalar', label, hint, unit, range: around(half), step, decimals, relative: true, requires }
}

function relAxle(id: string, label: string, hint: string, unit: string, half: number, step: number, decimals = 0): Param {
  return { id, kind: 'axle', label, hint, unit, front: around(half), rear: around(half), step, decimals, relative: true }
}

function relCorners(id: string, label: string, hint: string, unit: string, half: number, step: number, decimals = 0): Param {
  return { id, kind: 'corners', label, hint, unit, front: around(half), rear: around(half), step, decimals, relative: true }
}

function fuel(max: number, base: number): Param {
  return { id: 'fuel', kind: 'scalar', label: 'Топливо', hint: 'Сколько залить на старт. Литр бензина весит около 0,75 кг. План на гонку — в сводке справа.', unit: 'л', range: { min: 0, max, base }, step: 1, decimals: 0 }
}

const compound: Param = {
  id: 'compound',
  kind: 'choice',
  label: 'Шины',
  hint: 'Слики — для сухой трассы, дождевые — с протектором, для воды. Дождь в iRacing бывает только на дорожных трассах.',
  options: [
    { value: 'dry', label: 'Слики' },
    { value: 'wet', label: 'Дождевые' },
  ],
  base: 'dry',
  requires: 'rain',
}

const pressureRoad = relCorners(
  'pressure',
  'Холодное давление',
  'Давление, с которым машина выезжает из боксов. Выше — шина меньше греется, но держит хуже; ниже — больше сцепления и нагрева.',
  'psi',
  3,
  0.1,
  1,
)

const brakeBias = rel('brakeBias', 'Баланс тормозов', 'Доля тормозного усилия на передней оси. Больше — раньше блокируются передние колёса, но машина стабильнее на торможении; меньше — машина охотнее поворачивает на торможении.', '%', 4, 0.1, 1)
const abs = rel('abs', 'ABS', 'Больше — ABS сильнее помогает: меньше блокировок, но система чаще вмешивается. Выше на шкале — позиции для дождя.', 'поз.', 6, 1, 0, 'abs')
const tc = rel('tc', 'Антипробуксовка', 'Больше — меньше пробуксовки и износа задних шин, но медленнее выход из поворота, если система режет мощность слишком сильно.', 'поз.', 6, 1, 0, 'tc')
const brakePads: Param = {
  id: 'brakePads',
  kind: 'choice',
  label: 'Тормозные колодки',
  hint: 'Low — меньше трения и тормоза слабее, Medium и High — тормоза сильнее, но выше риск блокировки.',
  options: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ],
  base: 'medium',
}
const arbFront = rel('arbFront', 'Передний стабилизатор', 'Жёстче — меньше крен спереди и больше недостаточной поворачиваемости; мягче — машина охотнее поворачивает.', 'поз.', 4, 1)
const arbRear = rel('arbRear', 'Задний стабилизатор', 'Жёстче — машина охотнее поворачивает, вплоть до избыточной; мягче — спокойнее и с недостаточной.', 'поз.', 4, 1)
const toe = relAxle('toe', 'Схождение', 'Минус — расхождение: спереди острее вход в поворот, сзади машина вертлявее. Плюс — спокойнее на прямой и меньше греет шины.', 'мм', 3, 0.1, 1)
const rideHeight = relAxle('rideHeight', 'Клиренс', 'Меняется перч-оффсетом пружин. Ниже спереди — больше переднего прижима; разница перед/зад (наклон) двигает аэробаланс. Пределы проверяет техинспекция, например у Ferrari 296 GT3 сзади 50–92,5 мм.', 'мм', 10, 0.5, 1)
const springRate = relAxle('springRate', 'Жёсткость пружин', 'Жёстче — стабильнее клиренс и аэродинамика, мягче — больше механического сцепления на неровной трассе. После смены пружин верните клиренс перч-оффсетом.', 'Н/мм', 60, 10)
const camber = relCorners('camber', 'Развал', 'Больше отрицательного развала — больше сцепления в повороте, но хуже торможение и быстрее износ внутреннего края шины. Здесь минус значит «больше развала».', '°', 1, 0.1, 1)
const wing = rel('wing', 'Заднее крыло', 'Выше — больше прижима и сопротивления: быстрее в поворотах, медленнее на прямой, баланс смещается к недостаточной. У Ferrari 296 GT3 +1 к крылу компенсируют −1 мм клиренса спереди или +3 мм сзади.', 'поз.', 4, 0.5, 1)

const dampers = (id: string, label: string, hint: string) => relAxle(id, label, hint, 'клик', 5, 1)

/** Отклик газа есть не у всех GT3, и позиций у машин от 3 до 10 — подсказка и диапазон у каждой свои */
const throttleShape = rel('throttleShape', 'Отклик газа', 'Форма отклика педали газа: какая позиция линейная, а какая резче — у каждой машины своё.', 'поз.', 5, 1)

const GT3: ParamGroup[] = [
  { id: 'tyres', title: 'Шины', description: 'Как в разделе Tires & Aero гаража iRacing. Давление — холодное, на выезде из боксов.', params: [compound, pressureRoad] },
  {
    id: 'dials',
    title: 'Кнопки в кокпите',
    description: 'In-Car Dials: их же можно крутить на ходу.',
    params: [brakeBias, abs, tc, throttleShape],
  },
  { id: 'chassis', title: 'Шасси', description: 'Перед и зад: стабилизаторы, схождение, колодки.', params: [arbFront, arbRear, toe, brakePads] },
  { id: 'corners', title: 'Подвеска', description: 'Углы машины: клиренс, пружины, развал.', params: [rideHeight, springRate, camber] },
  { id: 'dampers', title: 'Амортизаторы', description: 'Медленные скорости — реакция на руль, газ и тормоз; быстрые — бордюры и неровности.', params: [
    dampers('lsComp', 'Сжатие, медленное', 'Больше — быстрее перенос веса при торможении и перекладке; спереди добавляет недостаточной на торможении.'),
    dampers('hsComp', 'Сжатие, быстрое', 'Больше — жёстче на бордюрах и кочках, лучше аэроплатформа на гладкой трассе; меньше — лучше гасит удары.'),
    dampers('lsRebound', 'Отбой, медленный', 'Больше — дольше держит кузов: спереди при разгоне, сзади при торможении. Слишком много — колесо теряет контакт.'),
    dampers('hsRebound', 'Отбой, быстрый', 'Как быстро амортизатор разжимается после кочки или бордюра.'),
  ] },
  { id: 'rear', title: 'Аэродинамика и дифференциал', params: [
    wing,
    rel('diffPreload', 'Преднатяг дифференциала', 'Больше — меньше заноса при сбросе газа и стабильнее вход, но больше недостаточной без газа и резче избыточная на газу.', 'Н·м', 60, 10),
    rel('frictionFaces', 'Фрикционные диски', 'Больше дисков — сильнее блокировка: больше недостаточной без газа и избыточной на газу, меньше проворота внутреннего колеса на бордюрах.', 'шт.', 6, 2),
    fuel(120, 60),
  ] },
]

const GT4: ParamGroup[] = [
  { id: 'tyres', title: 'Шины', description: 'Давление — холодное, на выезде из боксов.', params: [compound, { ...pressureRoad, hint: 'Давление, с которым машина выезжает из боксов. Выше — шина меньше греется, но держит хуже; ниже — больше сцепления и нагрева.' } as Param] },
  { id: 'dials', title: 'Кнопки в кокпите', description: 'In-Car Dials: их же можно крутить на ходу.', params: [brakeBias, abs, tc, brakePads] },
  { id: 'chassis', title: 'Шасси', params: [arbFront, arbRear, toe] },
  { id: 'corners', title: 'Подвеска', description: 'Клиренс, пружины, развал и амортизаторы. Больше кликов — жёстче.', params: [
    rideHeight,
    springRate,
    camber,
    dampers('bump', 'Сжатие', 'Больше — машина резче отвечает на руль и тормоз, но хуже глотает кочки.'),
    dampers('rebound', 'Отбой', 'Больше — кузов дольше держится после нагрузки; слишком много — колесо отрывается от асфальта.'),
  ] },
  { id: 'rear', title: 'Аэродинамика и топливо', params: [wing, fuel(120, 60)] },
]

const CUP: ParamGroup[] = [
  { id: 'tyres', title: 'Шины', description: 'Давление — холодное, на выезде из боксов.', params: [compound, { ...pressureRoad, hint: 'Давление, с которым машина выезжает из боксов. Выше — шина меньше греется, но держит хуже; ниже — больше сцепления и нагрева.' } as Param] },
  { id: 'dials', title: 'Кнопки в кокпите', description: 'In-Car Dials: их же можно крутить на ходу.', params: [brakeBias, abs, tc] },
  { id: 'chassis', title: 'Шасси', description: 'Пружин, амортизаторов и дифференциала в гараже кубковых машин нет.', params: [arbFront, arbRear, toe, rideHeight, camber] },
  { id: 'rear', title: 'Аэродинамика и топливо', params: [wing, fuel(100, 50)] },
]

const ovalShock = (id: string, label: string, hint: string) => relAxle(id, label, hint, 'клик', 5, 1)

const NASCAR: ParamGroup[] = [
  {
    id: 'tyres',
    title: 'Шины',
    description: 'Холодное давление. Минимум Goodyear свой на каждой трассе — начните с базового сетапа iRacing для неё.',
    params: [
      relCorners(
        'pressure',
        'Холодное давление',
        'На левых поворотах больше всех нагружено правое переднее колесо: после серии кругов у сбалансированной машины давление растёт сильнее всего именно там. Левые колёса обычно накачивают меньше правых.',
        'psi',
        5,
        0.25,
        2,
      ),
    ],
  },
  {
    id: 'balance',
    title: 'Развесовка и тормоза',
    params: [
      rel('crossWeight', 'Cross weight', 'Доля веса на левом заднем и правом переднем колёсах — на овале одна из главных настроек. Больше — стабильнее вход и лучше выход, меньше — машина свободнее в повороте. Слишком много — блокируется левое переднее.', '%', 2, 0.1, 1),
      rel('noseWeight', 'Nose weight', 'Доля веса на передней оси. Больше — устойчивее на скорости, меньше — легче поворачивает, полезно на коротких трассах.', '%', 1.5, 0.1, 1),
      { ...brakeBias, hint: 'Доля тормозного усилия на передней оси. Больше — стабильнее, но раньше блокируются передние колёса.' } as Param,
    ],
  },
  {
    id: 'arb',
    title: 'Стабилизаторы',
    description: 'Диаметр — Stiff (2,00″) или Soft (1,375″), плечо — от P1 (мягко) до P5 (жёстко).',
    params: [
      {
        id: 'arbFrontDiameter',
        kind: 'choice',
        label: 'Передний стабилизатор',
        hint: 'Жёсткий меньше кренит машину и острее отвечает на руль, но добавляет недостаточной.',
        options: [
          { value: 'stiff', label: 'Stiff 2,00″' },
          { value: 'soft', label: 'Soft 1,375″' },
        ],
        base: 'stiff',
      },
      {
        id: 'arbFrontArm',
        kind: 'choice',
        label: 'Плечо переднего стабилизатора',
        options: ['P1', 'P2', 'P3', 'P4', 'P5'].map((v) => ({ value: v, label: v })),
        base: 'P3',
      },
      rel('arbFrontPreload', 'Преднатяг переднего стабилизатора', 'Статическая нагрузка в стабилизаторе: добавляет или убирает его работу в поворотах и на прямых.', 'Н·м', 50, 5),
      {
        id: 'arbRearDiameter',
        kind: 'choice',
        label: 'Задний стабилизатор',
        hint: 'Жёсткий меньше кренит машину, но добавляет избыточной.',
        options: [
          { value: 'stiff', label: 'Stiff 2,00″' },
          { value: 'soft', label: 'Soft 1,375″' },
        ],
        base: 'soft',
      },
      {
        id: 'arbRearArm',
        kind: 'choice',
        label: 'Плечо заднего стабилизатора',
        options: ['P1', 'P2', 'P3', 'P4', 'P5'].map((v) => ({ value: v, label: v })),
        base: 'P3',
      },
      rel('arbRearPreload', 'Преднатяг заднего стабилизатора', 'Статическая нагрузка в заднем стабилизаторе.', 'Н·м', 50, 5),
    ],
  },
  {
    id: 'corners',
    title: 'Углы',
    description: 'Клиренс и вес по углам меняются Shock Collar Offset — парами, чтобы не уехал cross weight.',
    params: [
      relCorners('springRate', 'Жёсткость пружин', 'Жёстче — машина держит положение кузова и аэродинамику, мягче — больше сцепления на неровностях. На овале левую заднюю ставят мягче правой задней, иначе к концу серии кругов растёт недостаточная.', 'Н/мм', 30, 5),
      relCorners('camber', 'Развал', 'На овале левые колёса ставят с положительным развалом, правые — с отрицательным; на дорожной трассе все четыре отрицательные.', '°', 1, 0.1, 1),
      rel('casterLf', 'Кастер, левое переднее', 'Меньше кастера слева, чем справа, — машину тянет влево, на овале это полезно. Больше кастера — тяжелее руль и устойчивее на прямой.', '°', 1, 0.25, 2),
      rel('casterRf', 'Кастер, правое переднее', 'Больше кастера — тяжелее руль, меньше динамический cross weight в повороте.', '°', 1, 0.25, 2),
      relAxle('toe', 'Схождение', 'Спереди: больше расхождения — острее вход, но передние шины могут перегреться и машина внезапно уйдёт в недостаточную. Сзади: расхождение помогает повороту, схождение — устойчивости.', 'мм', 3, 0.1, 1),
    ],
  },
  {
    id: 'dampers',
    title: 'Амортизаторы',
    description: 'Сначала подберите наклон (slope) под трассу, потом медленное и быстрое сжатие и отбой.',
    params: [
      ovalShock('lsComp', 'Сжатие, медленное', 'Больше — быстрее нагружает колесо при торможении и выходе с виража, но хуже гасит мелкие неровности.'),
      ovalShock('hsComp', 'Сжатие, быстрое', 'Меньше — лучше на кочках и бордюрах, больше — на гладкой трассе.'),
      ovalShock('hsCompSlope', 'Наклон быстрого сжатия', 'Выше — характеристика линейнее, для тряских трасс; ниже — дегрессивнее, для гладких.'),
      ovalShock('lsRebound', 'Отбой, медленный', 'Больше — лучше держит кузов, но колесо может разгрузиться.'),
      ovalShock('hsRebound', 'Отбой, быстрый', 'Больше — кузов спокойнее после кочки, слишком много — теряется сцепление.'),
      ovalShock('hsReboundSlope', 'Наклон быстрого отбоя', 'Выше — линейнее, для тряских трасс; ниже — для гладких.'),
    ],
  },
  {
    id: 'rear',
    title: 'Дифференциал и топливо',
    params: [
      rel('diffPreload', 'Преднатяг дифференциала', 'Больше — сильнее блокировка в любом режиме: больше недостаточной на газу и при торможении, в том числе в середине поворота.', 'Н·м', 30, 5),
      fuel(76, 76),
    ],
  },
]

export const setupTemplates: Record<CategoryId, ParamGroup[]> = { nascar: NASCAR, gt3: GT3, gt4: GT4, cup: CUP }

/**
 * Отличия гаража машины от шаблона класса — по её руководству iRacing (раздел Advanced Setup Options).
 * У машин разная нумерация: у одних больше кликов — жёстче амортизатор, у других мягче («клики от закрытого»);
 * у Mercedes-AMG шкалы ABS и TC идут от большей помощи к меньшей. Такие регулировки помечены inverted —
 * ассистент поворачивает правку в нужную сторону.
 */
export interface CarGarage {
  /** Регулировок нет в гараже этой машины */
  drop?: string[]
  /** Правки регулировки: подсказка, диапазон, обратная шкала */
  patch?: Record<string, Partial<Param>>
  /** Регулировка заменяется другой на том же месте */
  replace?: Record<string, Param>
  /** Новые регулировки в конец группы */
  add?: Record<string, Param[]>
  /** Описания групп */
  groups?: Record<string, string>
}

const half = (n: number) => ({ range: around(n) })
const softerUp = (scale: string): Partial<Param> => ({ inverted: true, hint: `Клики от закрытого: ${scale}. Здесь «+1» — мягче, «−1» — жёстче.` })
const dampersInverted = (scale: string) => ({ lsComp: softerUp(scale), hsComp: softerUp(scale), lsRebound: softerUp(scale), hsRebound: softerUp(scale) })
const dampersNote = (scale: string) => `Медленные скорости — реакция на руль, газ и тормоз; быстрые — бордюры и неровности. ${scale}`

/** Выбор без известного значения в базе: «как в базе» и варианты по возрастанию эффекта */
function choiceFromBase(id: string, label: string, hint: string, options: [string, string][], requires?: Param['requires']): Param {
  return { id, kind: 'choice', label, hint, options: [{ value: 'base', label: 'Как в базе' }, ...options.map(([value, l]) => ({ value, label: l }))], base: 'base', requires }
}

export const carGarages: Record<string, CarGarage> = {
  // GT3
  'acura-nsx-gt3-evo22': {
    drop: ['throttleShape'],
    groups: { dampers: dampersNote('От 1 до 16 кликов, больше — жёстче.') },
  },
  'aston-martin-vantage-gt3-evo': {
    drop: ['throttleShape'],
    patch: {
      // «8 being the softest option and the blades becoming stiffer as the value is decreased to 1»
      arbFront: { inverted: true, hint: 'Обратная шкала: 8 — мягче всего, 1 — жёстче всего. Здесь «−1» — жёстче и больше недостаточной.' },
      // «0 clicks from closed is maximum damping … and 18 clicks is minimum damping»
      ...dampersInverted('0 — жёстче всего, 18 — мягче всего'),
    },
  },
  'audi-r8-lms-evo-ii-gt3': {
    patch: {
      throttleShape: { ...half(2), hint: '3 позиции: 1 — «бабочка», резкий рост момента в конце хода педали; 2 — промежуточная; 3 — линейная.' },
      // «2 clicks from closed is maximum damping … and 38 clicks is minimum damping»; быстрые — «0 … maximum damping and 40 is the minimum»
      ...dampersInverted('медленные 2–38, быстрые 0–40; меньше — жёстче'),
    },
  },
  'bmw-m4-gt3-evo': {
    drop: ['throttleShape', 'frictionFaces'],
    patch: {
      // «10 positions are available. Settings 1-9 range from least … to highest … Position 10 disables»
      tc: { hint: '10 позиций: 1–9 — от меньшей помощи к большей, 10 — выключено.' },
    },
    groups: { dampers: dampersNote('От 0 до 11 кликов, больше — жёстче.') },
  },
  'chevrolet-corvette-z06-gt3r': {
    drop: ['throttleShape'],
    patch: {
      // «6 being the softest option and the blades becoming stiffer as the value is decreased to the minimum setting of 0»
      arbFront: { inverted: true, hint: 'Обратная шкала: 6 — мягче всего, 0 — жёстче всего. Здесь «−1» — жёстче и больше недостаточной.' },
      arbRear: { inverted: true, hint: 'Обратная шкала: 6 — мягче всего, 0 — жёстче всего. Здесь «−1» — жёстче и больше избыточной.' },
      ...dampersInverted('медленные 0–30, быстрые 0–22; меньше — жёстче'),
    },
  },
  'ferrari-296-gt3': {
    patch: {
      throttleShape: { hint: '10 позиций: 1 — линейная, дальше всё более S-образная, 10 — снова линейная, но резче.' },
      abs: { hint: '12 позиций: 1 — выключено, 2–7 для сухой трассы, 8–12 для дождя. Больше — сильнее помогает.' },
      tc: { hint: '12 позиций: 1 — выключено, 2–12 — от меньшей помощи к большей.' },
    },
    groups: { dampers: dampersNote('От 0 до 11 кликов, больше — жёстче.') },
  },
  'ford-mustang-gt3': {
    patch: {
      throttleShape: { hint: '10 позиций: 6 — линейная, 1–5 — мягче в начале хода педали, 7–10 — резче.' },
      abs: { hint: '12 позиций: 1 — выключено, 2–7 для сухой трассы, 8–12 для дождя. Больше — сильнее помогает.' },
      tc: { hint: '12 позиций: 1 — выключено, 2–12 — от меньшей помощи к большей.' },
    },
    groups: { dampers: dampersNote('От 0 до 11 кликов, больше — жёстче.') },
  },
  'lamborghini-huracan-gt3-evo': {
    // Двухрежимные амортизаторы: «a single setting controlling both the high- and low-speed damping values»
    drop: ['lsComp', 'hsComp', 'lsRebound', 'hsRebound'],
    add: {
      dampers: [
        dampers('bump', 'Сжатие', 'Одна настройка на медленные и быстрые скорости. Ближе к нулю — жёстче: спереди больше недостаточной на торможении, сзади — на газу.'),
        dampers('rebound', 'Отбой', 'Одна настройка на медленные и быстрые скорости. Ближе к нулю — дольше держит кузов после нагрузки.'),
      ],
    },
    patch: {
      throttleShape: { ...half(2), hint: '3 позиции: 1 — линейная, 3 — S-образная, как у тросового привода.' },
      tc: { hint: '12 позиций, но карт 10: 1–10 — от меньшей помощи к большей, 11 — как 10, 12 — выключено.' },
    },
    groups: { dampers: 'Амортизаторы двухрежимные: одна настройка сжатия и одна отбоя на ось. Шкала до нуля, ближе к нулю — жёстче.' },
  },
  'mclaren-720s-gt3-evo': {
    patch: {
      throttleShape: { ...half(2), hint: '3 позиции: 1 — линейная, 2 — резче на малом газу, 3 — плавная, для дождя.' },
      abs: { hint: '12 позиций: 1 — выключено, 2–12 — от меньшей помощи к большей.' },
      tc: { hint: '12 позиций: 1 — выключено, 2–12 — от меньшей помощи к большей.' },
      // «setting 40 is minimum damping … while setting 0 is maximum damping»
      ...dampersInverted('0 — жёстче всего, 40 — мягче всего'),
    },
  },
  'mercedes-amg-gt3-2020': {
    drop: ['throttleShape'],
    patch: {
      // «Settings 1-5 are for wet-weather conditions with setting 1 suitable for heavy rain … Settings 7-11 are for dry»
      abs: { inverted: true, hint: 'Обратная шкала: 1–5 — для дождя (1 — для сильного), 7–11 — для сухой трассы. Здесь «−1» — больше помощи.' },
      // «Settings 1-11 range from least intervention/sensitivity (position 11) through to highest … (position 1). Position 12 disables»
      tc: { inverted: true, hint: 'Обратная шкала: 1 — больше всего помощи, 11 — меньше всего, 12 — выключено. Здесь «−1» — сильнее антипробуксовка.' },
    },
    groups: { dampers: dampersNote('От 0 до 11 кликов, больше — жёстче.') },
  },
  'porsche-911-gt3-r-992': {
    patch: {
      throttleShape: { ...half(2), label: 'Карта газа', hint: '3 позиции: 1 — «бабочка», меньше момента на малом ходу педали, помогает против пробуксовки; 2 — промежуточная; 3 — линейная.' },
      tc: { hint: '0 — выключено, больше — сильнее режет момент против пробуксовки.' },
      // «Lower compression values will cause the suspension to be stiffer»
      ...dampersInverted('меньше — жёстче, больше — мягче'),
    },
  },

  // GT4
  'aston-martin-vantage-gt4': {
    patch: {
      abs: { hint: '12 позиций: 0 — выключено, 1–11 — от меньшей помощи к большей.' },
      tc: { hint: '12 позиций: 0 — выключено, 1–11 — от меньшей помощи к большей.' },
    },
    groups: { corners: 'Клиренс, пружины, развал и амортизаторы. Сжатие — от 0 до 25 кликов, больше — жёстче.' },
  },
  'bmw-m4-g82-gt4-evo': {
    // «The system can be run in one of four modes: Off, On, MDM, and TC»
    replace: {
      abs: choiceFromBase(
        'dsc',
        'DSC',
        'Режим системы стабилизации. Off — ABS и антипробуксовка выключены, On — включены, MDM — вмешиваются мягче, TC — ABS как в MDM, а антипробуксовку настраиваете сами.',
        [
          ['off', 'Off'],
          ['mdm', 'MDM'],
          ['tc', 'TC'],
          ['on', 'On'],
        ],
        'abs',
      ),
    },
    // Амортизатор один: «The Rebound Stiffness setting is a paired adjustment to both low and high speed rebound damping»
    drop: ['bump'],
    patch: {
      tc: { ...half(4), hint: 'Работает, только когда DSC в режиме TC. 10 позиций: 1 — выключено, 2–10 — от меньшей помощи к большей.' },
      rebound: { hint: 'Одна настройка на медленный и быстрый отбой: от −18 (мягче всего) до 0 (жёстче всего).' },
    },
    add: {
      dials: [
        choiceFromBase('throttleMap', 'Карта газа', 'Dry — больше мощности в начале хода педали, Wet — плавнее в начале, Linear — равномерно по всему ходу.', [
          ['wet', 'Wet'],
          ['linear', 'Linear'],
          ['dry', 'Dry'],
        ]),
      ],
    },
    groups: { corners: 'Клиренс, пружины, развал и отбой. Сжатия в гараже этой машины нет.' },
  },
  'mclaren-570s-gt4': {
    // «This option provides a combined control for the traction control (TC) and ABS … ‘Normal’ … ‘Sport’ … ‘Track’»
    replace: {
      abs: choiceFromBase(
        'absTc',
        'ABS/TC/ESC',
        'Одна настройка на ABS и антипробуксовку. Track — меньше всего помощи (рекомендуется), Sport — средне, Normal — больше всего.',
        [
          ['track', 'Track'],
          ['sport', 'Sport'],
          ['normal', 'Normal'],
        ],
        'abs',
      ),
    },
    drop: ['tc'],
    groups: { corners: 'Клиренс, пружины, развал и амортизаторы. Сжатие — от 0 до 18 кликов, больше — жёстче.' },
  },
  'mercedes-amg-gt4': {
    patch: {
      // «Position 11 has the least intervention/support while position 1 has the most support. Position 12 disables»
      abs: { inverted: true, hint: 'Обратная шкала: 1 — больше всего помощи, 11 — меньше всего, 12 — выключено. Здесь «−1» — сильнее помогает.' },
      tc: { inverted: true, hint: 'Обратная шкала: 1 — больше всего помощи, 11 — меньше всего, 12 — выключено. Здесь «−1» — сильнее антипробуксовка.' },
    },
    groups: { corners: 'Клиренс, пружины, развал и амортизаторы. Сжатие — от 0 до 15 кликов, больше — жёстче.' },
  },
  'porsche-718-cayman-gt4-clubsport': {
    // «combined control for the traction control (TC) and ABS … Positions 1 to 11 … Position 0 disables both»
    replace: {
      abs: rel('absTc', 'ABS/TC/ESC', 'Одна шкала на ABS и антипробуксовку: 0 — обе выключены, 1–11 — от меньшей помощи к большей.', 'поз.', 5, 1, 0, 'abs'),
    },
    drop: ['tc', 'springRate'],
    groups: { corners: 'Клиренс, развал и амортизаторы — пружины в гараже этой машины не меняются. Сжатие — от 0 до 18 кликов, больше — жёстче.' },
  },

  // Кубковые
  'porsche-911-cup-992-2': {
    patch: {
      abs: { hint: '0 — выключено, 1–11 — от меньшей помощи к большей.' },
      tc: { hint: '0 — выключено, 1–11 — от меньшей помощи к большей. Режим Dry/Wet ставится сам по шинам.' },
      // «Front ARB (softest to stiffest) 1-2-3-4-7-5-6», «Rear ARB (softest to stiffest) 1-2-3-4-5-7-6»
      arbFront: { hint: 'Семь положений, по жёсткости идут 1-2-3-4-7-5-6: седьмое мягче шестого. Жёстче — больше недостаточной.' },
      arbRear: { hint: 'Семь положений, по жёсткости идут 1-2-3-4-5-7-6: седьмое между пятым и шестым. Жёстче — больше избыточной.' },
    },
    add: {
      dials: [rel('throttleShape', 'Отклик газа', 'Две позиции: 1 — мягче, 2 — резче.', 'поз.', 1, 1)],
    },
  },
  'ferrari-296-challenge': {
    // Баланса тормозов нет: его задаёт карта ABS («This setting impacts the target brake bias»)
    drop: ['brakeBias'],
    patch: {
      abs: { ...half(3), hint: '4 позиции, выключить нельзя: 1–2 для сухой трассы, 3–4 для дождя. Нечётные агрессивнее: баланс тормозов дальше назад, машина охотнее поворачивает на торможении.' },
      tc: { ...half(4), label: 'TC1', hint: 'Сколько антипробуксовка режет при пробуксовке: 0 — выключает и TC1, и TC2; 1–4 — от меньшей помощи к большей.' },
    },
    add: {
      dials: [rel('tc2', 'TC2', 'Чувствительность антипробуксовки к рысканию: 1–4, ниже — больше допускается заноса и меньше блокируется дифференциал. Выключается только вместе с TC1.', 'поз.', 3, 1, 0, 'tc')],
    },
    replace: {
      // «the position of the ARB linkages can be changed to one of two positions. The Soft setting … the Stiff setting»
      arbFront: choiceFromBase('arbFront', 'Передний стабилизатор', 'Два положения тяги. Soft — меньше недостаточной на входе, Stiff — больше.', [
        ['soft', 'Soft'],
        ['stiff', 'Stiff'],
      ]),
      arbRear: choiceFromBase('arbRear', 'Задний стабилизатор', 'Два положения тяги. Soft — меньше избыточной на входе, Stiff — больше.', [
        ['soft', 'Soft'],
        ['stiff', 'Stiff'],
      ]),
    },
  },
}

/** Гараж конкретной машины: шаблон класса с отличиями из её руководства */
export function garageFor(carId: string, category: CategoryId): ParamGroup[] {
  const g = carGarages[carId]
  const groups = setupTemplates[category]
  if (!g) return groups
  return groups
    .map((group) => ({
      ...group,
      description: g.groups?.[group.id] ?? group.description,
      params: [
        ...group.params
          .filter((p) => !g.drop?.includes(p.id))
          .map((p) => g.replace?.[p.id] ?? (g.patch?.[p.id] ? ({ ...p, ...g.patch[p.id] } as Param) : p)),
        ...(g.add?.[group.id] ?? []),
      ],
    }))
    .filter((group) => group.params.length > 0)
}
