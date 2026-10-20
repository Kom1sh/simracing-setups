// Сквозная проверка (EGO-05): контракт API, вход, кабинет, ассистент с настоящим бэкендом во всех состояниях, лендинг.
//   npm run build && npx vite preview --port 4173 && node scripts/e2e.mjs [сайт] [api]
// api — бэкенд для ассистента, по умолчанию боевой. Ошибку сервера проверяем подменой одного ответа в браузере
// (с публичного сайта Chrome не пускает к localhost), обрыв связи — на закрытом порту.
import { chromium } from 'playwright-core'

const BASE = process.argv[2] ?? 'http://localhost:4173/simracing-setups/'
const API = (process.argv[3] ?? 'https://simracing.egorprotasov.ru').replace(/\/+$/, '')
const DEAD = 'http://127.0.0.1:9'
const PAGES_ORIGIN = 'https://kom1sh.github.io'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
const results = []
const check = async (name, fn) => {
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
const app = (api = API) => `${BASE}en/app/?api=${encodeURIComponent(api)}`
const request = (body) =>
  fetch(`${API}/api/v1/recommendations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
const valid = { car: 'NASCAR Cup Series Next Gen (Gen 7)', track: 'Daytona International Speedway', symptom_type: 'understeer', corner_phase: 'entry', comment: 'e2e: проверка контракта' }
const ask = async ({ symptom, phase, stint, comment = 'Машина плохо поворачивает в этом месте' }) => {
  await page.getByRole('tab', { name: 'Assistant' }).click()
  if (symptom) await page.getByText(symptom, { exact: true }).click()
  if (phase) await page.getByRole('radio', { name: phase }).click()
  if (stint) await page.getByRole('radio', { name: stint }).click()
  if (comment) await page.getByLabel('Describe it in your own words').fill(comment)
  await page.getByRole('button', { name: 'Find a change' }).click()
}

await check('API: /health', async () => {
  const res = await fetch(`${API}/health`)
  expect(res.ok && (await res.json()).status === 'ok', `ответ ${res.status}`)
})

await check('API: «Не важно» — stint_moment null отвечает 200', async () => {
  const res = await request({ ...valid, stint_moment: null })
  const body = await res.json()
  expect(res.status === 200 && ['match', 'no_match'].includes(body.status) && body.request_id, `ответ ${res.status} ${JSON.stringify(body).slice(0, 80)}`)
})

await check('API: 400 с полями при неверных данных', async () => {
  const res = await request({ ...valid, symptom_type: 'unknown', comment: 'ab' })
  const body = await res.json()
  expect(res.status === 400 && body.error?.code === 'validation_error', `ответ ${res.status}`)
  expect('comment' in body.error.fields && 'symptom_type' in body.error.fields, `поля: ${Object.keys(body.error.fields)}`)
})

await check('API: CORS пускает GitHub Pages', async () => {
  const res = await fetch(`${API}/api/v1/recommendations`, {
    method: 'OPTIONS',
    headers: { Origin: PAGES_ORIGIN, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' },
  })
  expect(res.ok && res.headers.get('access-control-allow-origin') === PAGES_ORIGIN, `ответ ${res.status}, allow-origin ${res.headers.get('access-control-allow-origin')}`)
})

await check('кабинет без сессии уводит на вход', async () => {
  await page.goto(`${BASE}en/app/`)
  await page.waitForURL(/\/en\/login\/\?next=/)
})

await check('регистрация: пустая форма показывает ошибки', async () => {
  await page.goto(`${BASE}en/signup/`)
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.getByText('Enter a name or nickname.').waitFor()
  await page.getByText('Enter an email like name@example.com.').waitFor()
})

await check('регистрация ведёт в кабинет', async () => {
  await page.getByLabel('Name or nickname').fill('Egor')
  await page.getByLabel('Email').fill('e2e@example.com')
  await page.getByLabel('Password', { exact: true }).fill('e2e-pass-123')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.waitForURL(/\/en\/app\/$/)
  await page.getByRole('button', { name: /Account: Egor/ }).waitFor()
})

await check('лендинг для вошедшего показывает «Open dashboard»', async () => {
  await page.goto(`${BASE}en/`)
  expect(await page.locator('.site-top').getByRole('link', { name: 'Open dashboard' }).isVisible(), 'нет ссылки в кабинет')
  expect(!(await page.locator('.site-top').getByRole('link', { name: 'Log in' }).isVisible()), '«Log in» не спрятан')
})

await check('выход, неверный пароль, вход', async () => {
  await page.goto(app())
  await page.getByRole('button', { name: /Account: Egor/ }).click()
  await page.getByRole('button', { name: 'Log out' }).click()
  await page.waitForURL(/\/en\/$/)
  await page.goto(`${BASE}en/login/`)
  await page.getByLabel('Email').fill('e2e@example.com')
  await page.getByLabel('Password', { exact: true }).fill('wrong-password')
  await page.getByRole('button', { name: 'Log in' }).click()
  await page.getByText('Wrong password. Try again.').waitFor()
  await page.getByLabel('Password', { exact: true }).fill('e2e-pass-123')
  await page.getByRole('button', { name: 'Log in' }).click()
  await page.waitForURL(/\/en\/app\/$/)
})

await check('ассистент: сервер на связи', async () => {
  await page.goto(app())
  await page.getByRole('tab', { name: 'Assistant' }).click()
  await page.getByText('Rules server is online').waitFor()
})

await check('ассистент: без ?api ходит в боевой бэкенд', async () => {
  const fresh = await ctx.newPage()
  try {
    await fresh.goto(`${BASE}en/app/`)
    await fresh.getByRole('tab', { name: 'Assistant' }).click()
    await fresh.getByText('Rules server is online').waitFor()
    expect(!(await fresh.getByText(/custom address/).count()), 'адрес задан вручную, хотя ?api не было')
  } finally {
    await fresh.close()
  }
})

await check('ассистент: пустую форму не отправляет', async () => {
  await page.goto(app())
  await ask({ comment: '' })
  await page.getByText('Choose what the car is doing.').waitFor()
  await page.getByText('Choose where in the corner it happens.').waitFor()
  await page.getByText('Describe the problem in a few words.').waitFor()
})

await check('ассистент: найдено (недостаточная на входе, с начала заезда)', async () => {
  await page.goto(app())
  await ask({ symptom: 'Understeer', phase: 'Entry', stint: 'From the start' })
  await page.getByRole('heading', { name: /^Found/ }).waitFor()
  await page.locator('.rec').first().getByText('Decrease').waitFor()
  await page.locator('.rec').first().getByText('Brake bias', { exact: true }).waitFor()
  await page.getByText(/^Request [0-9a-f]{8}$/).waitFor()
  await page.locator('.rec').first().getByText('Checked rule').waitFor()
})

await check('ассистент: правила нет (избыточная в середине)', async () => {
  await page.goto(app())
  await ask({ symptom: 'Oversteer', phase: 'Mid-corner', stint: 'After a few laps' })
  await page.getByRole('heading', { name: 'No matching rule' }).waitFor()
})

await check('ассистент: «Any time» (stint_moment null) находит правило', async () => {
  await page.goto(app())
  await ask({ symptom: 'Understeer', phase: 'Entry', stint: 'Any time' })
  await page.getByRole('heading', { name: /^Found/ }).waitFor({ timeout: 8000 })
})

await check('ассистент: ошибка сервера, повтор уходит в бэкенд', async () => {
  await page.goto(app())
  const url = `${API}/api/v1/recommendations`
  const internal = { status: 'error', error: { code: 'internal_error', message: 'Внутренняя ошибка сервера' } }
  await page.route(url, (route) => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify(internal) }), { times: 1 })
  await ask({ symptom: 'Oversteer', phase: 'Exit' })
  await page.getByRole('heading', { name: 'Server error (500)' }).waitFor()
  await page.getByText('Внутренняя ошибка сервера').waitFor()
  await page.getByRole('button', { name: 'Try again' }).click()
  await page.getByRole('heading', { name: /^Found|No matching rule/ }).waitFor()
})

await check('ассистент: сервер недоступен', async () => {
  await page.goto(app(DEAD))
  await page.getByRole('tab', { name: 'Assistant' }).click()
  await page.getByText('The rules server is not responding right now', { exact: false }).waitFor()
  await page.getByText(`custom address: ${DEAD}`).waitFor()
  await ask({ symptom: 'Oversteer', phase: 'Exit' })
  await page.getByRole('heading', { name: 'The server is not responding' }).waitFor()
})

await check('язык: из меню аккаунта на русский', async () => {
  await page.goto(app())
  await page.getByRole('button', { name: /Account: Egor/ }).click()
  await page.getByRole('link', { name: 'Русский' }).click()
  await page.waitForURL(/\/ru\/app\/$/)
  await page.getByRole('tab', { name: 'Ассистент' }).waitFor()
  await page.getByRole('tab', { name: 'Трасса и погода' }).waitFor()
})

await check('лендинг: один h1, hreflang, валидный JSON-LD', async () => {
  for (const lang of ['en', 'ru']) {
    await page.goto(`${BASE}${lang}/`)
    expect((await page.locator('h1').count()) === 1, `${lang}: h1 не один`)
    expect((await page.locator('link[rel=alternate][hreflang]').count()) === 3, `${lang}: нет трёх hreflang`)
    const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())
    expect(ld['@graph'].some((n) => n['@type'] === 'FAQPage'), `${lang}: нет FAQPage`)
    expect((await page.locator('link[rel=canonical]').getAttribute('href')).endsWith(`/${lang}/`), `${lang}: canonical`)
  }
})

await check('лендинг: пример в hero переключается', async () => {
  await page.goto(`${BASE}en/`)
  await page.getByRole('tab', { name: 'Loose on exit' }).click()
  await page.locator('.example').getByText('Traction control', { exact: true }).waitFor()
})

await check('нет ошибок JS', async () => expect(errors.length === 0, errors.join(' | ')))

await browser.close()
for (const [s, n] of results) console.log(`${s} ${n}`)
const failed = results.filter(([s]) => s === 'FAIL').length
console.log(failed ? `\n${failed} не прошли` : `\nвсе ${results.length} прошли`)
process.exit(failed ? 1 : 0)
