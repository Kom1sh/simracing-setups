/** Языки сайта. Язык страницы задаёт адрес: /en/… или /ru/… */
export type Locale = 'en' | 'ru'

export const LOCALES: Locale[] = ['en', 'ru']

/** Корень сайта на GitHub Pages: /simracing-setups/ */
export const BASE = import.meta.env.BASE_URL

export const SITE_ORIGIN = 'https://kom1sh.github.io'

export function detectLocale(pathname: string): Locale {
  return /\/ru(\/|$)/.test(pathname) ? 'ru' : 'en'
}

/** Язык текущей страницы. На сервере (пререндер) язык передаётся явно, здесь — английский по умолчанию */
export const locale: Locale = typeof window === 'undefined' ? 'en' : detectLocale(window.location.pathname)

export type Page = 'home' | 'app' | 'login' | 'signup'

export function pagePath(page: Page, lang: Locale = locale): string {
  return page === 'home' ? `${BASE}${lang}/` : `${BASE}${lang}/${page}/`
}

export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path}`
}

/** Та же страница на другом языке, с сохранением хвоста адреса */
export function switchLocalePath(pathname: string, to: Locale): string {
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : ''
  const tail = rest.replace(/^(en|ru)(\/|$)/, '')
  return `${BASE}${to}/${tail}`
}
