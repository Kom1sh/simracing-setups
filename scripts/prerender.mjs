// После vite build: раскладывает страницы по языкам, пишет корень, sitemap и 404.
// Рендер берёт из SSR-сборки src/site/render.tsx (.ssr/render.js).
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = resolve('dist')
// Тот же корень, что в vite.config.ts: /simracing-setups/ на Pages, / на своём сервере
const BASE = process.env.SITE_BASE ?? '/simracing-setups/'
const site = await import(pathToFileURL(resolve('.ssr/render.js')).href)
const read = (f) => readFileSync(resolve(dist, f), 'utf8')
const written = []
const write = (f, s) => {
  const file = resolve(dist, f)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, s)
  written.push(f)
}

// Скрипт и стили лендинга — из собранного входа site.html
const head = [...read('site.html').matchAll(/<script\b[^>]*><\/script>|<link\b[^>]*>/g)]
  .map((m) => m[0])
  .filter((tag) => tag.includes('/assets/'))
  .join('\n    ')
if (!head.includes('<script')) throw new Error('В dist/site.html нет скрипта лендинга')

// Шрифт заголовка нужен сразу: латиница на обоих языках, кириллица — на русском
const fonts = readdirSync(resolve(dist, 'assets')).filter((f) => /^roboto-flex-wide-(latin|cyrillic)-.*\.woff2$/.test(f))
const preload = (lang) =>
  fonts
    .filter((f) => f.includes('latin') || lang === 'ru')
    .map((f) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="${BASE}assets/${f}" />`)
    .join('\n    ')

// Фото для лендинга (ТЗ — docs/images-brief.md): всё из public/img по имени файла, WebP важнее JPG
const images = {}
for (const f of readdirSync(resolve('public/img')).sort((x, y) => (y.endsWith('.webp') ? 1 : 0) - (x.endsWith('.webp') ? 1 : 0))) {
  const m = f.match(/^([a-z0-9-]+)\.(webp|jpg)$/)
  if (m && !images[m[1]]) images[m[1]] = `${BASE}img/${f}`
}

for (const lang of ['en', 'ru']) {
  write(`${lang}/index.html`, site.renderLanding(lang, { head: `${preload(lang)}\n    ${head}`, images }))
  write(`${lang}/app/index.html`, site.localizeShell(read('app.html'), lang, 'app'))
  for (const page of ['login', 'signup']) write(`${lang}/${page}/index.html`, site.localizeShell(read('auth.html'), lang, page))
}
write('index.html', site.renderRoot())
write('404.html', site.render404())
write('sitemap.xml', site.renderSitemap(new Date().toISOString().slice(0, 10)))
// robots.txt работает только в корне домена — на Pages он не нужен. SITE_NOINDEX=1 закрывает сайт от обхода
if (BASE === '/' && process.env.SITE_NOINDEX) write('robots.txt', 'User-agent: *\nDisallow: /\n')
else if (BASE === '/' && process.env.VITE_SITE_ORIGIN) write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${process.env.VITE_SITE_ORIGIN}/sitemap.xml\n`)

for (const f of ['app.html', 'auth.html', 'site.html']) rmSync(resolve(dist, f))
rmSync(resolve('.ssr'), { recursive: true, force: true })
console.log(`prerender: ${written.length} files\n  ${written.join('\n  ')}`)
