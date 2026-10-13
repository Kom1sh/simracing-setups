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
    const mark = document.querySelector('.site-mark').innerHTML
    const card = document.querySelector('.example').cloneNode(true)
    card.querySelector('.example__tabs').remove()
    card.querySelector('.example__meta').remove()
    card.querySelector('.example__facts > div:last-child').remove()
    card.querySelector('.example__facts').style.gridTemplateColumns = '1fr'
    card.style.cssText = 'width:470px;align-self:center'
    const page = document.createElement('div')
    page.style.cssText = 'position:fixed;inset:0;background:#fff;display:grid;grid-template-columns:1fr 470px;gap:48px;padding:56px 64px;font-family:var(--font);color:#000'
    page.innerHTML = `
      <div style="display:grid;align-content:space-between">
        <p style="font-size:28px;font-weight:820;font-stretch:48%;line-height:1">${mark.replace('<span>', '<span style="color:#5e5e5e;font-size:16px;font-weight:460;font-stretch:100%;margin-left:10px">')}</p>
        <h1 style="font-size:58px;font-weight:700;line-height:1.04;letter-spacing:-0.015em;margin:0;text-wrap:balance">${title}</h1>
        <p style="width:72px;height:8px;background:#ffed00"></p>
      </div>`
    page.append(card)
    document.body.replaceChildren(page)
  })
  await q.evaluate(() => document.fonts.ready)
  await q.screenshot({ path: `public/og-${lang}.png` })
  await og.close()
}
await browser.close()
console.log('media: public/img/dashboard-{en,ru}.jpg, public/og-{en,ru}.png')
