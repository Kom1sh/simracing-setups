// Сквозная проверка: API, аккаунты на сервере, кабинет, ИИ-ассистент (совет, «Применить», отзыв), сетапы на сервере, лендинг.
//   node scripts/e2e.mjs [сайт]      по умолчанию http://localhost:4173/ (сборка SITE_BASE=/ + бэкенд на :8000)
// Без ИИ (SIMRACING_LLM=0) совет собирается по таблице правок, с ИИ — моделью; проверки принимают оба режима.
import { chromium } from 'playwright-core'

const BASE = (process.argv[2] ?? 'http://localhost:4173/').replace(/\/?$/, '/')
const EMAIL = `e2e-${Date.now()}@example.com`
const PASS = 'e2e-pass-123'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
const page = await ctx.newPage()
page.setDefaultTimeout(15000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
const results = []
// На сервере nginx пускает 30 запросов к API в минуту с одного адреса (запас 20) — весь набор подряд в него не влезает.
// Пауза между проверками даёт лимиту восстановиться; локально без паузы
const PACE_MS = /\/\/(localhost|127\.0\.0\.1)[:/]/.test(BASE) ? 0 : 4000
const check = async (name, fn) => {
  if (PACE_MS && results.length) await new Promise((r) => setTimeout(r, PACE_MS))
  try {
    await fn()
    results.push(['ok  ', name])
  } catch (e) {
    results.push(['FAIL', `${name}: ${e.message.split('\n')[0]}`])
  }
}
const expect = (cond, msg) => {
  if (!cond) throw new Error(msg)
}
const api = (path, data) => (data ? ctx.request.post(`${BASE}${path}`, { data }) : ctx.request.get(`${BASE}${path}`))
const openAssistant = async () => {
  await page.goto(`${BASE}en/app/`)
  await page.getByRole('tab', { name: 'Assistant' }).click()
}

await check('API: /health и статус', async () => {
  expect((await (await api('health')).json()).status === 'ok', 'health')
  const s = await (await api('api/v2/status')).json()
  expect(s.status === 'ok' && typeof s.ai === 'boolean' && s.knowledge_chunks > 0, JSON.stringify(s))
})

await check('API: ALE-03 «Не важно» отвечает 200', async () => {
  const r = await api('api/v1/recommendations', { car: 'x', track: 'y', symptom_type: 'understeer', corner_phase: 'entry', comment: 'e2e', stint_moment: null })
  expect(r.status() === 200, `ответ ${r.status()}`)
})

await check('API: совет без входа — 401', async () => {
  const r = await api('api/v2/advice', { car_id: 'ferrari-296-gt3', track_id: 'spa', symptom: 'oversteer' })
  expect(r.status() === 401, `ответ ${r.status()}`)
})

await check('кабинет без входа уводит на вход', async () => {
  await page.goto(`${BASE}en/app/`)
  await page.waitForURL(/\/en\/login\/\?next=/)
})

await check('регистрация: пустая форма показывает ошибки', async () => {
  await page.goto(`${BASE}en/signup/`)
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.getByText('Enter a name or nickname.').waitFor()
})

await check('регистрация на сервере ведёт в кабинет', async () => {
  await page.getByLabel('Name or nickname').fill('Egor')
  await page.getByLabel('Email').fill(EMAIL)
  await page.getByLabel('Password', { exact: true }).fill(PASS)
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.waitForURL(/\/en\/app\/$/)
  await page.getByRole('button', { name: /Account: Egor/ }).waitFor()
})

await check('выход, неверный пароль, вход', async () => {
  await page.getByRole('button', { name: /Account: Egor/ }).click()
  await page.getByRole('button', { name: 'Log out' }).click()
  await page.waitForURL(/\/en\/$/)
  await page.goto(`${BASE}en/login/`)
  await page.getByLabel('Email').fill(EMAIL)
  await page.getByLabel('Password', { exact: true }).fill('wrong-password')
  await page.getByRole('button', { name: 'Log in' }).click()
  await page.getByText('Wrong password. Try again.').waitFor()
  await page.getByLabel('Password', { exact: true }).fill(PASS)
  await page.getByRole('button', { name: 'Log in' }).click()
  await page.waitForURL(/\/en\/app\/$/)
})

await check('кабинет открывается на вкладке ассистента', async () => {
  await page.goto(`${BASE}en/app/`)
  const first = page.getByRole('tab').first()
  expect((await first.textContent()) === 'Assistant' && (await first.getAttribute('aria-selected')) === 'true', 'первая вкладка не Assistant')
})

await check('ассистент: пустую форму не отправляет', async () => {
  await openAssistant()
  await page.getByRole('button', { name: 'Get advice' }).click()
  await page.getByText('Describe the problem in a few words or pick what the car does.').waitFor()
})

await check('ассистент: совет с источником из руководства iRacing', async () => {
  await page.getByRole('radio', { name: 'Oversteer' }).click()
  await page.getByRole('radio', { name: 'Exit' }).click()
  await page.getByLabel('What is happening').fill('The rear steps out as soon as I open the throttle')
  await page.getByRole('button', { name: 'Get advice' }).click()
  await page.getByRole('heading', { name: 'Advice', exact: true }).waitFor({ timeout: 60000 })
  await page.locator('.rec__source').first().getByText(/Source: NASCAR Next Gen/).waitFor()
})

await check('ассистент: «Применить в гараж» меняет сетап', async () => {
  await page.locator('.rec').first().getByRole('button', { name: 'Apply to garage' }).click()
  await page.getByText(/^Applied: /).waitFor()
  await page.locator('.rec').first().getByRole('button', { name: 'Applied in the garage' }).waitFor()
  const badge = await page.getByRole('tab', { name: /My setup/ }).locator('.tab__count').textContent()
  expect(Number(badge) >= 1, `в гараже ${badge} правок`)
})

await check('ассистент: отзыв «Лучше» сохраняется на сервере', async () => {
  await page.getByRole('button', { name: 'Better' }).click()
  await page.getByText('Thanks, we will take it into account next time.').waitFor()
  await page.waitForTimeout(300)
  const list = await (await api('api/v2/advice')).json()
  expect(list.advice[0].feedback === 'better', JSON.stringify(list.advice[0].feedback))
})

await check('мой сетап: правка от совета и совет в истории, отзыв можно поменять', async () => {
  await page.getByRole('tab', { name: /My setup/ }).click()
  const item = page.locator('.history__item').first()
  await item.waitFor()
  expect((await page.locator('.edits__row').count()) >= 1, 'нет правки от совета')
  expect((await item.getByRole('button', { name: 'Better' }).getAttribute('aria-pressed')) === 'true', 'отзыв «Лучше» не отмечен')
  await item.getByRole('button', { name: 'Worse' }).click()
  await page.waitForTimeout(300)
  const list = await (await api('api/v2/advice')).json()
  expect(list.advice[0].feedback === 'worse', JSON.stringify(list.advice[0].feedback))
})

await check('ассистент: только текст — совет или уточняющий вопрос', async () => {
  await openAssistant()
  await page.getByLabel('What is happening').fill('Something feels off with the car')
  await page.getByRole('button', { name: 'Get advice' }).click()
  await page.getByRole('heading', { name: /^(Advice|One question)$/ }).waitFor({ timeout: 60000 })
})

await check('сетап сохраняется на сервере и виден после перезагрузки', async () => {
  await page.goto(`${BASE}en/app/`)
  // Кабинет открывается на ассистенте, где сводки нет: сохраняем кнопкой в шапке
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.waitForTimeout(500)
  const list = await (await api('api/v2/setups')).json()
  expect(list.setups.length === 1, `на сервере ${list.setups.length}`)
  await page.reload()
  await page.getByRole('button', { name: /My setups/ }).click()
  await page.locator('.saved__item').first().waitFor()
})

await check('язык: из меню аккаунта на русский', async () => {
  await page.goto(`${BASE}en/app/`)
  await page.getByRole('button', { name: /Account: Egor/ }).click()
  await page.getByRole('link', { name: 'Русский' }).click()
  await page.waitForURL(/\/ru\/app\/$/)
  await page.getByRole('tab', { name: 'Ассистент' }).waitFor()
})

await check('лендинг: один h1, hreflang, JSON-LD, «Open dashboard» для вошедшего', async () => {
  for (const lang of ['en', 'ru']) {
    await page.goto(`${BASE}${lang}/`)
    expect((await page.locator('h1').count()) === 1, `${lang}: h1 не один`)
    expect((await page.locator('link[rel=alternate][hreflang]').count()) === 3, `${lang}: нет трёх hreflang`)
    const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())
    expect(ld['@graph'].some((n) => n['@type'] === 'FAQPage'), `${lang}: нет FAQPage`)
  }
  await page.goto(`${BASE}en/`)
  expect(await page.locator('.site-top').getByRole('link', { name: 'Open dashboard' }).isVisible(), 'нет ссылки в кабинет')
})

await check('нет ошибок JS', async () => expect(errors.length === 0, errors.join(' | ')))

await browser.close()
for (const [s, n] of results) console.log(`${s} ${n}`)
const failed = results.filter(([s]) => s === 'FAIL').length
console.log(failed ? `\n${failed} не прошли` : `\nвсе ${results.length} прошли`)
process.exit(failed ? 1 : 0)
