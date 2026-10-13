// Картинки для лендинга из живого сайта: снимок кабинета (public/img/dashboard-*.jpg)
// и карточка для соцсетей 1200×630 (public/og-*.png). Нужен запущенный preview:
//   npm run build && npx vite preview --port 4173 && node scripts/media.mjs
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const BASE = process.argv[2] ?? 'http://localhost:4173/simracing-setups/'
mkdirSync('public/img', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })

for (const lang of ['en', 'ru']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const p = await ctx.newPage()
  await p.goto(`${BASE}${lang}/signup/`)
  await p.locator('input').nth(0).fill(lang === 'ru' ? 'Егор' : 'Egor')
  await p.locator('input[type=email]').fill(`media-${lang}@example.com`)
  await p.locator('input[type=password]').fill('media-pass-1')
  await p.locator('button[type=submit]').click()
  await p.waitForURL(/\/app\/$/)
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(300)
  await p.screenshot({ path: `public/img/dashboard-${lang}.jpg`, type: 'jpeg', quality: 82 })

  // Карточка: тот же шрифт и схема, что на лендинге
  await ctx.close()
  const og = await browser.newContext({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce' })
  const q = await og.newPage()
  await q.goto(`${BASE}${lang}/`)
  await q.evaluate(() => {
    const title = document.querySelector('.hero__title').textContent
    const sub = document.querySelector('.hero__sub').textContent
    const mark = document.querySelector('.site-mark').outerHTML
    const photo = document.querySelector('.hero__photo')
    const page = document.createElement('div')
    page.style.cssText = 'position:fixed;inset:0;overflow:hidden;background:#000;color:#fff;font-family:var(--font)'
    page.innerHTML = `
      ${photo ? `<img src="${photo.src}" style="position:absolute;top:0;right:0;width:58%;height:100%;object-fit:cover;object-position:50% 18%;-webkit-mask-image:linear-gradient(to right,transparent,#000 45%);mask-image:linear-gradient(to right,transparent,#000 45%)">` : ''}
      <div style="position:relative;display:grid;align-content:space-between;height:100%;padding:56px 64px">
        <div>${mark.replace(`class="site-mark"`, `class="site-mark" style="color:#fff"`)}</div>
        <div>
          <h1 style="margin:0;max-width:11ch;font-size:92px;font-weight:800;font-stretch:125%;line-height:.95;letter-spacing:-.02em">${title}</h1>
          <p style="margin:24px 0 0;max-width:30ch;color:#b9bdc6;font-size:26px;font-weight:700;font-stretch:108%;line-height:1.3">${sub}</p>
        </div>
      </div>`
    document.body.replaceChildren(page)
  })
  await q.evaluate(() => document.fonts.ready)
  await q.screenshot({ path: `public/og-${lang}.png` })
  await og.close()
}
await browser.close()
console.log('media: public/img/dashboard-{en,ru}.jpg, public/og-{en,ru}.png')
