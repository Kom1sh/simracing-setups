const cache = new Map<number, Intl.NumberFormat>()

function formatter(decimals: number) {
  let f = cache.get(decimals)
  if (!f) {
    f = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    cache.set(decimals, f)
  }
  return f
}

/** Число по-русски: запятая, узкий пробел в тысячах, настоящий минус */
export function formatNumber(value: number, decimals = 0): string {
  return formatter(decimals)
    .format(value)
    .replace(/[  ]/g, ' ')
    .replace('-', '−')
}

export function formatSigned(value: number, decimals = 0): string {
  const body = formatNumber(Math.abs(value), decimals)
  if (value > 0) return `+${body}`
  if (value < 0) return `−${body}`
  return body
}

export function formatTimeOfDay(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = Math.round(minutes % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} мин`
  if (m === 0) return `${h} ч`
  return `${h} ч ${m} мин`
}

export function rainLabel(percent: number): string {
  if (percent <= 0) return 'сухо'
  if (percent <= 25) return 'морось'
  if (percent <= 60) return 'дождь'
  return 'ливень'
}

/** «1:47,350» → секунды; понимает «1:47», «107,35» */
export function parseLapTime(input: string): number | null {
  const s = input.trim().replace(',', '.')
  if (!s) return null
  const m = s.match(/^(\d{1,2}):(\d{1,2}(?:\.\d{1,3})?)$/)
  if (m) {
    const sec = Number(m[2])
    if (sec >= 60) return null
    const total = Number(m[1]) * 60 + sec
    return total > 0 ? total : null
  }
  const n = Number(s)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function formatLapTime(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = seconds - min * 60
  return `${min}:${sec.toFixed(3).padStart(6, '0').replace('.', ',')}`
}

export function plural(n: number, one: string, few: string, many: string): string {
  const n10 = n % 10
  const n100 = n % 100
  if (n10 === 1 && n100 !== 11) return one
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few
  return many
}

/** Поиск без учёта регистра, ё, дефисов и диакритики */
export function normalizeSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/g, '')
}
