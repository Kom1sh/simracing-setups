import { plural } from '../lib/format'

/** Строки кабинета по-русски. Английская версия обязана повторять форму этого объекта. */
export const ru = {
  skip: 'К настройкам',
  wordmark: ['Сетапы', 'для симрейсинга'] as [string, string],
  mySetups: 'Мои сетапы',
  save: 'Сохранить',
  bandLabel: 'Трасса и машина',
  lapLength: 'Длина круга',
  km: 'км',
  turns: 'Поворотов',
  direction: 'Направление',
  layout: 'Конфигурация',
  altitude: 'Над уровнем моря',
  m: 'м',
  carCategory: 'Категория машины',
  engine: 'Двигатель',
  enginePos: 'Где двигатель',
  debut: 'Дебют в классе',
  electronics: 'Электроника',
  elec: {
    none: 'Без ABS и антипробуксовки',
    both: 'ABS и антипробуксовка',
    tcOnly: 'Антипробуксовка, без ABS',
    noAbs: 'Без ABS',
    absOnly: 'ABS, без антипробуксовки',
    noTc: 'Без антипробуксовки',
  },
  settingsTabs: 'Настройки',
  tabTrack: 'Трасса и погода',
  tabCar: 'Машина',
  tabAssistant: 'Ассистент',
  trackIntro: (name: string) => (
    <>
      Условия для <strong>{name}</strong>. Характер трассы подставляется при её выборе, погоду и сессию задаёте сами.
    </>
  ),
  carIntro: (name: string) => (
    <>
      Регулировки <strong>{name}</strong>. Диапазоны и база — общий шаблон класса GT3: у машины в конкретном симуляторе границы свои.
    </>
  ),
  toast: {
    saved: (n: string) => `Сетап «${n}» сохранён`,
    saveFailed: 'Браузер не дал сохранить сетап. Скачайте его файлом из сводки.',
    opened: (n: string) => `Открыт сетап «${n}»`,
    removed: (n: string) => `Сетап «${n}» удалён`,
    downloaded: 'Файл сетапа скачан',
    notJson: 'Файл не читается: внутри не JSON.',
    notOurs: 'Это не сетап этого кабинета: в файле нет отметки simracing-setups/v1.',
    partly: (track: boolean, car: boolean) =>
      `Сетап загружен, но ${[track ? 'трассы' : '', car ? 'машины' : ''].filter(Boolean).join(' и ')} из файла здесь нет — оставили текущие.`,
    loaded: (n: string) => `Загружен сетап «${n}»`,
  },
  trackGone: 'трасса удалена',
  carGone: 'машина удалена',
  footerData: (
    <>
      Схемы трасс: <a href="https://github.com/bacinger/f1-circuits">bacinger/f1-circuits</a> (MIT) и данные{' '}
      <a href="https://www.openstreetmap.org/copyright">© участники OpenStreetMap</a> (ODbL). Длина и число поворотов — по открытым источникам, характер трассы — оценка.
    </>
  ),
  footerProject: (
    <>
      Учебный проект. Код — <a href="https://github.com/Kom1sh/simracing-setups">github.com/Kom1sh/simracing-setups</a>.
    </>
  ),
  user: {
    menu: 'Аккаунт',
    signOut: 'Выйти',
    toSite: 'На главную',
    language: 'Язык',
  },
  nTracks: (n: number) => `${n} ${plural(n, 'трасса', 'трассы', 'трасс')}`,
  nChanged: (n: number) => `изменено ${n}`,
}
