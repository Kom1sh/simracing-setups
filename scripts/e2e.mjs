// Сквозная проверка через интерфейс (EGO-05): вход, кабинет, ассистент во всех состояниях, лендинг.
// npm run build && npx vite preview --port 4173 && node scripts/e2e.mjs
// Пока бэкенда нет, ассистент отвечает заглушкой; с живым API: node scripts/e2e.mjs <base> http://localhost:8000
import { chromium } from 'playwright-core'

const BASE = process.argv[2] ?? 'http://localhost:4173/simracing-setups/'
const API = process.argv[3]
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
const app = (q = '') => `${BASE}en/app/${q}${API ? `${q ? '&' : '?'}api=${encodeURIComponent(API)}` : ''}`
const ask = async (symptom, phase) => {
  await page.getByRole('tab', { name: 'Assistant' }).click()
  await page.getByText(symptom, { exact: true }).click()
  if (phase) await page.getByRole('radio', { name: phase }).click()
  await page.getByRole('button', { name: 'Find a change' }).click()
}

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

await check('ассистент: пустую жалобу не отправляет', async () => {
  await page.goto(app())
  await page.getByRole('tab', { name: 'Assistant' }).click()
  await page.getByRole('button', { name: 'Find a change' }).click()
  await page.getByText('Choose a quick pick or describe the problem in a few words.').waitFor()
})

await check('ассистент: подсказки собирают жалобу, найдено', async () => {
  await page.goto(app())
  await page.getByRole('tab', { name: 'Assistant' }).click()
  await page.getByText('Understeer', { exact: true }).click()
  await page.getByRole('radio', { name: 'Mid-corner' }).click()
  await page.getByText('«Недостаточная поворачиваемость в середине поворота»').waitFor()
  await page.getByRole('button', { name: 'Find a change' }).click()
  await page.getByRole('heading', { name: /^Found/ }).waitFor()
  await page.locator('.rec').first().getByText('Decrease').waitFor()
})

await check('ассистент: жалоба своими словами', async () => {
  await page.goto(app())
  await page.getByRole('tab', { name: 'Assistant' }).click()
  await page.getByLabel('In your own words').fill('машину подбрасывает на бордюрах в шикане')
  await page.getByRole('button', { name: 'Find a change' }).click()
  await page.getByRole('heading', { name: /^Found/ }).waitFor()
})

await check('ассистент: правила нет', async () => {
  await page.goto(app())
  await ask('Tyres overheat')
  await page.getByRole('heading', { name: 'No matching rule' }).waitFor()
})

if (!API) {
  await check('ассистент: ошибка сервера и повтор', async () => {
    await page.goto(app('?mock=error'))
    await ask('Wheelspin on exit')
    await page.getByRole('heading', { name: 'Server error (500)' }).waitFor()
    await page.getByRole('button', { name: 'Try again' }).waitFor()
  })
  await check('ассистент: нет сети', async () => {
    await page.goto(app('?mock=offline'))
    await ask('Wheelspin on exit')
    await page.getByRole('heading', { name: 'The server is not responding' }).waitFor()
  })
}

if (API) {
  await check('ассистент: 500 от бэкенда с его сообщением (фейковый бэкенд: «#500» в жалобе)', async () => {
    await page.goto(app())
    await page.getByRole('tab', { name: 'Assistant' }).click()
    await page.getByLabel('In your own words').fill('#500 проверка ошибки')
    await page.getByRole('button', { name: 'Find a change' }).click()
    await page.getByRole('heading', { name: 'Server error (500)' }).waitFor()
    await page.getByText('Внутренняя ошибка сервера, попробуйте повторить запрос позже').waitFor()
  })
}

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
