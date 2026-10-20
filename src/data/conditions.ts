import type { ParamGroup } from './types'

/** Условия заезда: характер трассы, сессия, погода, покрытие */
export const conditionGroups: ParamGroup[] = [
  {
    id: 'session',
    title: 'Сессия',
    description: 'От длины гонки и пит-стопов считается топливо в сводке справа.',
    params: [
      {
        id: 'sessionType',
        kind: 'choice',
        label: 'Заезд',
        options: [
          { value: 'practice', label: 'Практика' },
          { value: 'qualifying', label: 'Квалификация' },
          { value: 'race', label: 'Гонка' },
        ],
        base: 'race',
      },
      {
        id: 'duration',
        kind: 'scalar',
        label: 'Длительность',
        unit: 'мин',
        range: { min: 10, max: 1440, base: 60 },
        step: 5,
        decimals: 0,
        presets: [
          { label: '20 минут', value: 20 },
          { label: 'Час', value: 60 },
          { label: '3 часа', value: 180 },
          { label: '6 часов', value: 360 },
          { label: '24 часа', value: 1440 },
        ],
      },
      {
        id: 'pitStops',
        kind: 'scalar',
        label: 'Обязательные пит-стопы',
        hint: 'Сколько раз по регламенту нужно заехать в боксы.',
        range: { min: 0, max: 10, base: 1 },
        step: 1,
        decimals: 0,
      },
    ],
  },
  {
    id: 'weather',
    title: 'Погода',
    description: 'Ассистент учитывает температуру, облака и дождь. Дождь в iRacing бывает только на дорожных трассах и у машин с дождевыми шинами.',
    params: [
      {
        id: 'airTemp',
        kind: 'scalar',
        label: 'Воздух',
        unit: '°C',
        range: { min: 0, max: 45, base: 22 },
        step: 1,
        decimals: 0,
      },
      {
        id: 'trackTemp',
        kind: 'scalar',
        label: 'Асфальт',
        hint: 'В iRacing асфальт нагревает солнце: в ясный день он заметно теплее воздуха, в пасмурный разница меньше. Здесь — ваша оценка для давления в шинах.',
        unit: '°C',
        range: { min: 0, max: 65, base: 30 },
        step: 1,
        decimals: 0,
      },
      {
        id: 'sky',
        kind: 'choice',
        label: 'Облачность',
        options: [
          { value: 'clear', label: 'Ясно' },
          { value: 'partly', label: 'Переменная' },
          { value: 'mostly', label: 'Облачно' },
          { value: 'overcast', label: 'Пасмурно' },
        ],
        base: 'partly',
      },
      {
        id: 'rain',
        kind: 'scalar',
        label: 'Шанс дождя',
        unit: '%',
        range: { min: 0, max: 100, base: 0 },
        step: 5,
        decimals: 0,
        format: 'percent-rain',
        requires: 'rain',
      },
    ],
  },
  {
    id: 'surface',
    title: 'Покрытие',
    params: [
      {
        id: 'rubber',
        kind: 'choice',
        label: 'Резина на трассе',
        hint: 'iRacing накатывает резину по ходу сессии: чем её больше, тем больше сцепления на траектории. Вне траектории копятся «шарики».',
        options: [
          { value: 'low', label: 'Чистая' },
          { value: 'moderate', label: 'Накатана' },
          { value: 'high', label: 'Хорошо накатана' },
        ],
        base: 'moderate',
      },
      {
        id: 'wetness',
        kind: 'choice',
        label: 'Вода на трассе',
        hint: 'Сколько воды на трассе в начале сессии. Ассистент учитывает её вместе с шансом дождя.',
        options: [
          { value: 'dry', label: 'Сухо' },
          { value: 'damp', label: 'Влажно' },
          { value: 'wet', label: 'Мокро' },
        ],
        base: 'dry',
        requires: 'rain',
      },
    ],
  },
]

