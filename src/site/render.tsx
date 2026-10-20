import { renderToStaticMarkup } from 'react-dom/server'
import { absoluteUrl, APP_ORIGIN, BASE, LOCALES, type Locale } from '../i18n/locale'
import { content } from './content'
import { Landing } from './Landing'
import type { SiteImages } from './Hero'

/** Пререндер: лендинги /en/ и /ru/, корень с выбором языка, оболочки кабинета и входа, sitemap, 404 */

export interface Assets {
  /** Теги скриптов и стилей клиентской сборки */
  head: string
  /** Фото из public/img, которые есть на момент сборки (ищут prerender.mjs и dev-сервер) */
  images?: SiteImages
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')
const home = (l: Locale) => absoluteUrl(`${BASE}${l}/`)
const FAVICON = `<link rel="icon" type="image/svg+xml" href="${BASE}favicon.svg" />`

function alternates(): string {
  return [...LOCALES.map((l) => `<link rel="alternate" hreflang="${l}" href="${home(l)}" />`), `<link rel="alternate" hreflang="x-default" href="${home('en')}" />`].join('\n    ')
}

function structuredData(lang: Locale): string {
  const c = content[lang]
  return jsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${home(lang)}#site`, name: c.meta.siteName, url: home(lang), inLanguage: lang },
      {
        '@type': 'WebApplication',
        name: c.meta.siteName,
        url: home(lang),
        description: c.meta.description,
        applicationCategory: 'SportsApplication',
        operatingSystem: 'Web',
        inLanguage: lang,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: c.faq.items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  })
}

export function renderLanding(lang: Locale, assets: Assets): string {
  const c = content[lang]
  const og = absoluteUrl(`${BASE}og-${lang}.png`)
  const body = renderToStaticMarkup(<Landing c={c} lang={lang} img={assets.images ?? {}} />)
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(c.meta.title)}</title>
    <meta name="description" content="${esc(c.meta.description)}" />
    <link rel="canonical" href="${home(lang)}" />
    ${alternates()}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(c.meta.siteName)}" />
    <meta property="og:title" content="${esc(c.meta.title)}" />
    <meta property="og:description" content="${esc(c.meta.description)}" />
    <meta property="og:url" content="${home(lang)}" />
    <meta property="og:locale" content="${lang === 'ru' ? 'ru_RU' : 'en_US'}" />
    <meta property="og:locale:alternate" content="${lang === 'ru' ? 'en_US' : 'ru_RU'}" />
    <meta property="og:image" content="${og}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(c.meta.ogAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#000000" />
    ${FAVICON}
    <script>document.documentElement.classList.add('js')</script>
    <script type="application/ld+json">${structuredData(lang)}</script>
    ${assets.head}
  </head>
  <body>
    ${body}
  </body>
</html>
`
}

/** Корень: отправляет на язык браузера, без JS — ссылки и переход на английский */
export function renderRoot(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Setups for sim racing</title>
    <meta name="robots" content="noindex" />
    ${alternates()}
    ${FAVICON}
    <script>
      var l = (navigator.languages || [navigator.language || 'en']).join(',').toLowerCase();
      location.replace('${BASE}' + (/(^|,)(ru|be|uk|kk)/.test(l) ? 'ru' : 'en') + '/' + location.hash);
    </script>
    <noscript><meta http-equiv="refresh" content="0; url=${BASE}en/" /></noscript>
  </head>
  <body style="font-family: system-ui, sans-serif; padding: 40px">
    <p><a href="${BASE}en/">English</a> · <a href="${BASE}ru/">Русский</a></p>
  </body>
</html>
`
}

const SHELL_TITLES: Record<string, Record<Locale, string>> = {
  app: { en: 'Dashboard — Setups for sim racing', ru: 'Кабинет — Сетапы для симрейсинга' },
  login: { en: 'Log in — Setups for sim racing', ru: 'Вход — Сетапы для симрейсинга' },
  signup: { en: 'Sign up — Setups for sim racing', ru: 'Регистрация — Сетапы для симрейсинга' },
}

/** Оболочка кабинета или входа на нужном языке. Кабинет без сессии сразу уходит на вход, не мигая */
export function localizeShell(template: string, lang: Locale, page: 'app' | 'login' | 'signup'): string {
  // На Pages кабинета нет: страница сразу уводит на свой домен
  if (APP_ORIGIN) {
    const to = `${APP_ORIGIN}/${lang}/${page}/`
    return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${SHELL_TITLES[page][lang]}</title><meta http-equiv="refresh" content="0; url=${to}"><script>location.replace('${to}'+location.search)</script></head><body><a href="${to}">${to}</a></body></html>`
  }
  let html = template.replace(/<html lang="[a-z]+">/, `<html lang="${lang}">`).replace(/<title>[^<]*<\/title>/, `<title>${SHELL_TITLES[page][lang]}</title>`)
  if (page === 'app') {
    const guard = `<script>if(!document.cookie.split('; ').some(function(c){return c.indexOf('srs_in=')===0}))location.replace('${BASE}${lang}/login/?next='+encodeURIComponent(location.pathname+location.search))</script>`
    html = html.replace('</title>', `</title>\n    ${guard}`)
  }
  return html
}

export function renderSitemap(date: string): string {
  const links = LOCALES.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${home(l)}"/>`).join('')
  const urls = LOCALES.map((l) => `<url><loc>${home(l)}</loc><lastmod>${date}</lastmod>${links}<xhtml:link rel="alternate" hreflang="x-default" href="${home('en')}"/></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`
}

export function render404(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Page not found — Setups for sim racing</title>
    <meta name="robots" content="noindex" />
    ${FAVICON}
  </head>
  <body style="font-family: system-ui, sans-serif; padding: 40px; line-height: 1.5">
    <h1>Page not found</h1>
    <p><a href="${BASE}en/">Go to the home page</a></p>
    <p lang="ru">Такой страницы нет. <a href="${BASE}ru/">На главную</a></p>
  </body>
</html>
`
}
