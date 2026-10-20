// Проверка вёрстки: снимки ключевых состояний и геометрия (прокрутка вбок, обрезанный текст, вылет за блок, наложения).
// Запуск: npm run build && npx vite preview --port 4173, затем node scripts/qa.mjs [url]
import { chromium } from 'playwright-core'
import { withSession } from './session.mjs'
import { mkdirSync, writeFileSync } from 'node:fs'

const BASE = process.argv[2] ?? 'http://localhost:4173/simracing-setups/ru/app/'
const OUT = '.qa'
mkdirSync(OUT, { recursive: true })

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1180, height: 820 },
  { name: 'tablet', width: 860, height: 1100 },
  { name: 'mobile', width: 390, height: 844 },
]

function geometry() {
  const problems = []
  const describe = (el) => {
    const cls = typeof el.className === 'string' ? el.className.split(' ').filter(Boolean).slice(0, 2).join('.') : el.tagName
    const text = (el.textContent || '').trim().slice(0, 40)
    return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''} «${text}»`
  }
  const visible = (el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'
  }

  if (document.documentElement.scrollWidth > window.innerWidth + 1) {
    problems.push(`прокрутка вбок: ${document.documentElement.scrollWidth} > ${window.innerWidth}`)
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect()
      if (visible(el) && r.right > window.innerWidth + 1 && !el.closest('.subnav ul, .track-grid, .picker__panel')) {
        problems.push(`  за правым краем: ${describe(el)} right=${Math.round(r.right)}`)
        if (problems.length > 12) break
      }
    }
  }

  const ellipsisOk = new Set(['picker__value', 'track-map__name'])
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue
    const cs = getComputedStyle(el)
    const clips = ['hidden', 'clip'].includes(cs.overflowX) || ['hidden', 'clip'].includes(cs.overflowY)
    if (!clips || el.tagName === 'svg' || el.closest('svg') || el.classList.contains('visually-hidden')) continue
    const overX = el.scrollWidth - el.clientWidth
    const overY = el.scrollHeight - el.clientHeight
    if (overX > 1 || overY > 1) {
      const ok = [...el.classList].some((c) => ellipsisOk.has(c)) && cs.textOverflow === 'ellipsis'
      problems.push(`${ok ? 'многоточие' : 'обрезано'}: ${describe(el)} (+${overX}px вбок, +${overY}px вниз)`)
    }
  }

  const containers = '.param, .corner, .numfield, .summary__block, .facts > div, .car-card, .picker__trigger, .scalar__top, .axle__row, .corners__foot, .saved__item, .changes__item, .edits__row, .history__item, .chip, .track-tile, .tab, .segmented'
  for (const parent of document.querySelectorAll(containers)) {
    if (!visible(parent)) continue
    const pr = parent.getBoundingClientRect()
    for (const child of parent.querySelectorAll('*')) {
      if (!visible(child) || child.closest('svg') !== null && child.tagName !== 'svg') continue
      if (child.closest('.picker__panel') && !parent.closest('.picker__panel')) continue
      const r = child.getBoundingClientRect()
      if (r.left < pr.left - 1 || r.right > pr.right + 1) {
        problems.push(`вылет за блок: ${describe(child)} из ${describe(parent)} (${Math.round(r.left - pr.left)}…${Math.round(r.right - pr.right)})`)
        break
      }
    }
  }

  const overlapGroups = ['.corners__grid > *', '.facts > div', '.topbar__actions > *, .wordmark', '.scalar__top > *', '.summary__row > *', '.edits__row > *', '.history__rate > *']
  for (const sel of overlapGroups) {
    const groups = new Map()
    for (const el of document.querySelectorAll(sel)) {
      if (!visible(el)) continue
      const key = el.parentElement
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(el)
    }
    for (const els of groups.values()) {
      for (let i = 0; i < els.length; i++)
        for (let j = i + 1; j < els.length; j++) {
          const a = els[i].getBoundingClientRect()
          const b = els[j].getBoundingClientRect()
          const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left)
          const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
          if (ix > 2 && iy > 2) problems.push(`наложение: ${describe(els[i])} и ${describe(els[j])}`)
        }
    }
  }
  return problems
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const report = {}
let failures = 0

for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'reduce', locale: 'ru-RU' })
  await withSession(context, BASE)
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(BASE)
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)

  const states = []
  const check = async (state) => {
    const problems = await page.evaluate(geometry)
    await page.screenshot({ path: `${OUT}/${vp.name}-${state}.png`, fullPage: !state.includes('open') })
    states.push({ state, problems })
    failures += problems.filter((p) => !p.startsWith('многоточие')).length
  }

  await check('assistant-tab')
  await page.getByRole('tab', { name: 'Условия' }).click()
  await page.waitForTimeout(150)
  await check('conditions-tab')
  await page.getByRole('tab', { name: /Мой сетап/ }).click()
  await page.waitForTimeout(300)
  await check('setup-tab')
  await page.getByRole('button', { name: /^Весь гараж/ }).click()
  await page.waitForTimeout(150)
  await check('car-tab')

  // Меняем значения, чтобы проверить отметки изменений и сводку
  const pressure = page.getByRole('button', { name: 'Холодное давление, передняя левая: больше' })
  for (let i = 0; i < 5; i++) await pressure.click()
  await page.getByRole('button', { name: 'Cross weight: больше' }).click()
  await page.getByPlaceholder('1:58,400').fill('2:18,500')
  await page.getByPlaceholder('3,2').fill('3,4')
  await page.waitForTimeout(150)
  await check('car-changed')

  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByRole('button', { name: /^Трасса/ }).first().click()
  await page.waitForTimeout(250)
  await check('track-picker-open')
  await page.keyboard.type('мон')
  await page.waitForTimeout(150)
  await check('track-picker-search-open')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(200)

  await page.getByRole('button', { name: /^Машина/ }).first().click()
  await page.waitForTimeout(250)
  await check('car-picker-open')
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Сохранить', exact: true }).click()
  await page.getByRole('button', { name: /Мои сетапы/ }).click()
  await page.waitForTimeout(250)
  await check('setups-open')

  report[vp.name] = { states, errors }
  failures += errors.length
  await context.close()
}

await browser.close()
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2))
for (const [name, r] of Object.entries(report)) {
  console.log(`\n== ${name}`)
  if (r.errors.length) console.log('  ошибки страницы:', r.errors)
  for (const s of r.states) {
    console.log(`  ${s.state}: ${s.problems.length ? '' : 'чисто'}`)
    for (const p of s.problems) console.log(`    - ${p}`)
  }
}
console.log(`\nДефектов: ${failures}. Снимки в ${OUT}/`)
process.exit(failures ? 1 : 0)
