import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Сайт живёт на GitHub Pages по адресу kom1sh.github.io/simracing-setups/
const BASE = '/simracing-setups/'

/** Фото лендинга из public/img — то же правило, что в scripts/prerender.mjs */
function siteImages() {
  const images: Record<string, string> = {}
  for (const name of ['hero', 'about', 'final']) {
    const file = ['webp', 'jpg'].map((ext) => `${name}.${ext}`).find((f) => existsSync(resolve('public/img', f)))
    if (file) images[name] = `${BASE}img/${file}`
  }
  return images
}

/**
 * Адреса сайта в режиме разработки — те же, что после сборки:
 *   /                 → выбор языка
 *   /en/, /ru/        → лендинг (рендер на лету из src/site/render.tsx)
 *   /en/app/          → кабинет (app.html)
 *   /en/login/, /en/signup/ → вход и регистрация (auth.html)
 * В сборке те же страницы пишет scripts/prerender.mjs.
 */
function sitePages(): Plugin {
  return {
    name: 'site-pages',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? ''
        const path = url.split('?')[0]
        if (!path.startsWith(BASE)) return next()
        const rest = path.slice(BASE.length)
        const bare = rest.match(/^(en|ru)(\/(app|login|signup))?$/)
        if (bare) {
          res.statusCode = 301
          res.setHeader('Location', `${path}/${url.slice(path.length)}`)
          return res.end()
        }
        const m = rest.match(/^(en|ru)\/(?:(app|login|signup)\/)?$/)
        if (rest !== '' && !m) return next()
        try {
          const site = await server.ssrLoadModule('/src/site/render.tsx')
          let html: string
          if (rest === '') html = site.renderRoot()
          else if (!m![2]) html = site.renderLanding(m![1], { head: `<script type="module" src="${BASE}src/site/client.ts"></script>`, images: siteImages() })
          else html = site.localizeShell(readFileSync(resolve(m![2] === 'app' ? 'app.html' : 'auth.html'), 'utf8'), m![1], m![2])
          html = await server.transformIndexHtml(url, html)
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(html)
        } catch (e) {
          next(e)
        }
      })
    },
  }
}

export default defineConfig({
  base: BASE,
  plugins: [react(), sitePages()],
  build: {
    rollupOptions: {
      input: {
        app: resolve('app.html'),
        auth: resolve('auth.html'),
        site: resolve('site.html'),
      },
    },
  },
})
