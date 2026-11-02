// PNG из erd.svg в двойном разрешении: node docs/erd/render.mjs
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright-core'

const svg = new URL('./erd.svg', import.meta.url)
const png = new URL('./erd.png', import.meta.url)
const text = readFileSync(svg, 'utf8')
const [, w, h] = text.match(/width="(\d+)" height="(\d+)"/)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: 2 })
await page.setContent(`<html><body style="margin:0">${text}</body></html>`)
await page.locator('svg').screenshot({ path: png.pathname })
await browser.close()
console.log(png.pathname)
