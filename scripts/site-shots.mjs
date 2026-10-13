// Снимки сайта для проверки глазами: node scripts/site-shots.mjs [base]
// Лендинг на двух языках и ширинах, вход, кабинет и ответ ассистента. Файлы — в .qa/site
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const BASE = process.argv[2] ?? 'http://localhost:4173/simracing-setups/'
const OUT = '.qa/site'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })

async function page(width, height, motion = 'reduce') {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: motion, deviceScaleFactor: 1 })
  return { ctx, page: await ctx.newPage() }
}

for (const [lang, w, h, name] of [
  ['en', 1440, 900, 'desktop'],
  ['ru', 1440, 900, 'desktop'],
  ['ru', 390, 844, 'mobile'],
  ['en', 390, 844, 'mobile'],
]) {
  const { ctx, page: p } = await page(w, h)
  await p.goto(`${BASE}${lang}/`)
  await p.evaluate(() => document.fonts.ready)
  await p.screenshot({ path: `${OUT}/landing-${lang}-${name}-first.png` })
  await p.screenshot({ path: `${OUT}/landing-${lang}-${name}-full.png`, fullPage: true })
  await ctx.close()
}

// Регистрация → кабинет → ассистент
const { ctx, page: p } = await page(1440, 900)
await p.goto(`${BASE}en/signup/`)
await p.evaluate(() => document.fonts.ready)
await p.screenshot({ path: `${OUT}/signup-en.png` })
await p.getByLabel('Name or nickname').fill('Egor')
await p.getByLabel('Email').fill('egor@example.com')
await p.getByLabel('Password', { exact: true }).fill('secret-pass-1')
await p.getByRole('button', { name: 'Create account' }).click()
await p.waitForURL(/\/en\/app\/$/)
await p.evaluate(() => document.fonts.ready)
await p.screenshot({ path: `${OUT}/app-en.png` })
await p.getByRole('tab', { name: 'Assistant' }).click()
await p.screenshot({ path: `${OUT}/assistant-en-idle.png`, fullPage: true })
await p.getByText('Understeer', { exact: true }).click()
await p.getByRole('radio', { name: 'Mid-corner' }).click()
await p.getByRole('button', { name: 'Find changes' }).click()
await p.getByRole('heading', { name: /Found/ }).waitFor()
await p.screenshot({ path: `${OUT}/assistant-en-found.png`, fullPage: true })
await ctx.close()

await browser.close()
console.log(`shots in ${OUT}`)
