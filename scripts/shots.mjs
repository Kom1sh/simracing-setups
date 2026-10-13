// Крупные снимки отдельных блоков для просмотра глазами: node scripts/shots.mjs [url]
import { chromium } from 'playwright-core'
import { withSession } from './session.mjs'
import { mkdirSync } from 'node:fs'

const BASE = process.argv[2] ?? 'http://localhost:4173/simracing-setups/ru/app/'
mkdirSync('.qa/shots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })

async function run(width, height, name, steps) {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', deviceScaleFactor: 1 })
  await withSession(ctx, BASE)
  const page = await ctx.newPage()
  await page.goto(BASE)
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.evaluate(() => document.fonts.ready)
  await steps(page, name)
  await ctx.close()
}

await run(1440, 900, 'desktop', async (page, name) => {
  await page.screenshot({ path: `.qa/shots/${name}-first-screen.png` })
  await page.getByRole('tab', { name: /Машина/ }).click()
  const pressure = page.getByRole('button', { name: 'Давление в шинах, передняя левая: больше' })
  for (let i = 0; i < 5; i++) await pressure.click()
  await page.getByRole('button', { name: 'Антикрыло: больше' }).click()
  await page.locator('#car-tyres').screenshot({ path: `.qa/shots/${name}-tyres.png` })
  await page.locator('#car-mechanics').screenshot({ path: `.qa/shots/${name}-mechanics.png` })
  await page.getByPlaceholder('1:58,400').fill('2:18,500')
  await page.getByPlaceholder('3,2').fill('3,4')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator('.summary').screenshot({ path: `.qa/shots/${name}-summary.png` })
  await page.getByRole('button', { name: /^Трасса/ }).first().click()
  await page.waitForTimeout(200)
  await page.screenshot({ path: `.qa/shots/${name}-track-picker.png` })
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: /^Машина/ }).first().click()
  await page.waitForTimeout(200)
  await page.screenshot({ path: `.qa/shots/${name}-car-picker.png` })
})

await run(390, 844, 'mobile', async (page, name) => {
  await page.screenshot({ path: `.qa/shots/${name}-first-screen.png` })
  await page.getByRole('tab', { name: /Машина/ }).click()
  await page.locator('#car-tyres').screenshot({ path: `.qa/shots/${name}-tyres.png` })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByRole('button', { name: /^Трасса/ }).first().click()
  await page.waitForTimeout(200)
  await page.screenshot({ path: `.qa/shots/${name}-track-picker.png` })
})

await browser.close()
console.log('готово')
