// После vite build: раскладывает страницы по языкам, пишет корень, sitemap и 404.
// Рендер берёт из SSR-сборки src/site/render.tsx (.ssr/render.js).
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = resolve('dist')
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
const fonts = readdirSync(resolve(dist, 'assets')).filter((f) => /^roboto-flex-(latin|cyrillic)-.*\.woff2$/.test(f))
const preload = (lang) =>
  fonts
    .filter((f) => f.includes('latin') || lang === 'ru')
    .map((f) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="/simracing-setups/assets/${f}" />`)
    .join('\n    ')

// Фото для лендинга (ТЗ — в README): что лежит в public/img, то и попадёт на страницу
const images = {}
for (const name of ['hero', 'about', 'final']) {
  const file = ['webp', 'jpg'].map((ext) => `${name}.${ext}`).find((f) => existsSync(resolve('public/img', f)))
  if (file) images[name] = `/simracing-setups/img/${file}`
}

for (const lang of ['en', 'ru']) {
  write(`${lang}/index.html`, site.renderLanding(lang, { head: `${preload(lang)}\n    ${head}`, images }))
  write(`${lang}/app/index.html`, site.localizeShell(read('app.html'), lang, 'app'))
  for (const page of ['login', 'signup']) write(`${lang}/${page}/index.html`, site.localizeShell(read('auth.html'), lang, page))
}
write('index.html', site.renderRoot())
write('404.html', site.render404())
write('sitemap.xml', site.renderSitemap(new Date().toISOString().slice(0, 10)))

for (const f of ['app.html', 'auth.html', 'site.html']) rmSync(resolve(dist, f))
rmSync(resolve('.ssr'), { recursive: true, force: true })
console.log(`prerender: ${written.length} files\n  ${written.join('\n  ')}`)
