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
  carCategory: 'Класс машины в iRacing',
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
  tabTrack: 'Условия',
  tabCar: 'Мой сетап',
  tabAssistant: 'Ассистент',
  trackIntro: (name: string) => (
    <>
      Погода и сессия на <strong>{name}</strong>. Ассистент учитывает температуру, облака и дождь, а сводка справа считает топливо.
    </>
  ),
  carIntro: (name: string) => (
    <>
      Все регулировки гаража <strong>{name}</strong>. 0 — как в базовом сетапе, «+1» — на клик или единицу больше. Топливо — в литрах.
    </>
  ),
  setupIntro: (name: string) => (
    <>
      Сетап <strong>{name}</strong> — это правки от базового сетапа iRacing (iRacing Setups → baseline). Применяйте советы ассистента, а после 3–5 кругов отмечайте, помогло ли.
    </>
  ),
  changesTitle: 'Правки от базы',
  changesEmpty: 'Пока всё как в базовом сетапе. Примените совет ассистента или поменяйте значение в гараже ниже.',
  resetShort: 'Вернуть',
  resetOne: (name: string) => `Вернуть «${name}» к базе`,
  historyTitle: 'Советы ассистента',
  historyIntro: (car: string, track: string) => `${car} на трассе ${track}: что предлагал ассистент и помогло ли.`,
  historyLoading: 'Загружаю советы…',
  historyFailed: 'Не удалось загрузить советы. Обновите страницу.',
  historyEmpty: 'Для этой машины и трассы советов ещё не было.',
  askAssistant: 'Спросить ассистента',
  rated: 'Ваш отзыв:',
  garageTitle: 'Весь гараж',
  garageHint: (n: number) => `${n} ${plural(n, 'регулировка', 'регулировки', 'регулировок')} — открыть`,
  garageHide: 'Свернуть',
  toast: {
    saved: (n: string) => `Сетап «${n}» сохранён`,
    saveFailed: 'Сервер не сохранил сетап. Проверьте интернет или скачайте сетап файлом из сводки.',
    listFailed: 'Не удалось загрузить ваши сетапы с сервера. Обновите страницу.',
    opened: (n: string) => `Открыт сетап «${n}»`,
    removed: (n: string) => `Сетап «${n}» удалён`,
    downloaded: 'Файл сетапа скачан',
    notJson: 'Файл не читается: внутри не JSON.',
    notOurs: 'Это не сетап этого кабинета: в файле нет отметки simracing-setups/v1.',
    partly: (track: boolean, car: boolean) =>
      `Сетап загружен, но ${[track ? 'трассы' : '', car ? 'машины' : ''].filter(Boolean).join(' и ')} из файла здесь нет — оставили текущие.`,
    loaded: (n: string) => `Загружен сетап «${n}»`,
    category: (label: string, track: string | null) => `Класс ${label}: у него свой гараж, правки начаты с базы${track ? `. Трасса — ${track}` : ''}.`,
  },
  trackGone: 'трасса удалена',
  carGone: 'машина удалена',
  user: {
    menu: 'Аккаунт',
    signOut: 'Выйти',
    toSite: 'На главную',
    language: 'Язык',
  },
  nTracks: (n: number) => `${n} ${plural(n, 'трасса', 'трассы', 'трасс')}`,
  nChanged: (n: number) => `изменено ${n}`,
}
