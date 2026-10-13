// Проверка поведения кабинета в браузере: node scripts/smoke.mjs [url]
import { chromium } from 'playwright-core'
import { withSession } from './session.mjs'
import { readFileSync } from 'node:fs'

const BASE = process.argv[2] ?? 'http://localhost:4173/simracing-setups/ru/app/'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, reducedMotion: 'reduce' })
await withSession(ctx, BASE)
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

const results = []
async function step(name, fn) {
  try {
    await fn()
    results.push(['ok', name])
  } catch (e) {
    results.push(['FAIL', `${name}: ${e.message.split('\n')[0]}`])
  }
}
const expect = (cond, msg) => {
  if (!cond) throw new Error(msg)
}

await page.goto(BASE)
await page.evaluate(() => localStorage.clear())
await page.reload()

await step('по умолчанию GT3 и первая машина', async () => {
  expect((await page.getByRole('radio', { name: 'GT3' }).getAttribute('aria-checked')) === 'true', 'GT3 не выбрана')
  expect(await page.getByRole('button', { name: /^Машина/ }).first().textContent().then((t) => t.includes('Ferrari 296 GT3')), 'не Ferrari 296 GT3')
})

await step('кубковый Porsche без ABS и антипробуксовки', async () => {
  await page.getByRole('radio', { name: 'Кубковые' }).click()
  const trigger = await page.getByRole('button', { name: /^Машина/ }).first().textContent()
  expect(trigger.includes('911 GT3 Cup'), `выбрана ${trigger}`)
  await page.getByRole('tab', { name: /Машина/ }).click()
  expect((await page.getByRole('group', { name: 'ABS' }).count()) === 0, 'строка ABS видна')
  expect((await page.getByRole('group', { name: 'Антипробуксовка' }).count()) === 0, 'строка антипробуксовки видна')
  expect((await page.getByRole('group', { name: 'Карта двигателя' }).count()) === 1, 'нет карты двигателя')
  expect(await page.getByText('шаблон регулировок GT3').first().isVisible(), 'нет пометки о шаблоне GT3')
})

await step('возврат в GT3 возвращает прежнюю машину', async () => {
  await page.getByRole('radio', { name: 'GT3' }).click()
  const trigger = await page.getByRole('button', { name: /^Машина/ }).first().textContent()
  expect(trigger.includes('Ferrari 296 GT3'), `выбрана ${trigger}`)
})

await step('поиск трассы по стране и выбор с клавиатуры', async () => {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByRole('button', { name: /^Трасса/ }).first().click()
  await page.keyboard.type('италия')
  const options = page.getByRole('option')
  expect((await options.count()) >= 1, 'нет результатов')
  const first = await options.first().textContent()
  await page.keyboard.press('Enter')
  const trigger = await page.getByRole('button', { name: /^Трасса/ }).first().textContent()
  expect(first && trigger.includes(first.replace('Италия', '').trim()), `выбрана ${trigger}, ожидали ${first}`)
})

await step('поиск по-латински и пустой результат', async () => {
  await page.getByRole('button', { name: /^Трасса/ }).first().click()
  await page.keyboard.type('zzzz')
  expect(await page.getByText('Трассы «zzzz» в списке нет').isVisible(), 'нет пустого состояния')
  await page.keyboard.press('Escape')
  expect((await page.getByRole('dialog', { name: 'Выбор трассы' }).count()) === 0, 'панель не закрылась')
})

await step('Монца подставляет низкий прижим', async () => {
  await page.getByRole('button', { name: /^Трасса/ }).first().click()
  await page.keyboard.type('monza')
  await page.keyboard.press('Enter')
  await page.getByRole('tab', { name: /Трасса и погода/ }).click()
  const low = page.getByRole('radiogroup', { name: 'Нужный прижим' }).getByRole('radio', { name: 'Низкий' })
  expect((await low.getAttribute('aria-checked')) === 'true', 'прижим не низкий')
})

await step('слики под дождём дают замечание', async () => {
  const rain = page.getByRole('slider', { name: 'Дождь' })
  await rain.focus()
  for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight')
  expect(await page.getByText('На трассе вода, а стоят слики').isVisible(), 'нет замечания')
})

await step('симметрия: без неё правое колесо не меняется', async () => {
  await page.getByRole('tab', { name: /Машина/ }).click()
  const group = page.getByRole('group', { name: 'Давление в шинах' })
  await group.getByRole('switch', { name: 'Слева и справа одинаково' }).uncheck()
  await group.getByRole('button', { name: 'Давление в шинах, передняя левая: больше' }).click()
  const left = await group.getByRole('textbox', { name: 'Давление в шинах, передняя левая' }).inputValue()
  const right = await group.getByRole('textbox', { name: 'Давление в шинах, передняя правая' }).inputValue()
  expect(left === '26,1' && right === '26,0', `ПЛ ${left}, ПП ${right}`)
})

await step('ввод числа руками с запятой и зажимом в диапазон', async () => {
  const field = page.getByRole('textbox', { name: 'Баланс тормозов' })
  await field.fill('99')
  await field.press('Enter')
  expect((await field.inputValue()) === '70,0', `значение ${await field.inputValue()}`)
  await field.fill('56,3')
  await field.press('Tab')
  expect((await field.inputValue()) === '56,3', `значение ${await field.inputValue()}`)
})

await step('сохранение переживает перезагрузку', async () => {
  await page.getByRole('button', { name: 'Сохранить сетап' }).click()
  await page.reload()
  const trigger = await page.getByRole('button', { name: /^Трасса/ }).first().textContent()
  expect(trigger.includes('Монца'), `после перезагрузки ${trigger}`)
  await page.getByRole('button', { name: /Мои сетапы/ }).click()
  expect((await page.locator('.saved__item').count()) === 1, 'в списке не один сетап')
  await page.getByRole('button', { name: 'Закрыть' }).click()
  await page.getByRole('tab', { name: /Машина/ }).click()
  expect((await page.getByRole('textbox', { name: 'Баланс тормозов' }).inputValue()) === '56,3', 'баланс тормозов не сохранился')
})

await step('файл: скачать и загрузить обратно', async () => {
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Скачать файл' }).click()])
  const path = await download.path()
  const data = JSON.parse(readFileSync(path, 'utf8'))
  expect(data.format === 'simracing-setups/v1' && data.track.id && data.setup.brakeBias === 56.3, 'содержимое файла не то')
  await page.getByRole('button', { name: 'Вернуть всё к базе' }).click()
  await page.locator('input[type=file]').setInputFiles(path)
  await page.waitForTimeout(200)
  const field = page.getByRole('textbox', { name: 'Баланс тормозов' })
  expect((await field.inputValue()) === '56,3', `после загрузки ${await field.inputValue()}`)
})

await step('битый файл даёт понятную ошибку', async () => {
  await page.locator('input[type=file]').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}') })
  expect(await page.getByText('Это не сетап этого кабинета').isVisible(), 'нет сообщения')
})

await step('без ошибок в консоли', async () => {
  expect(errors.length === 0, errors.join(' | '))
})

await browser.close()
for (const [s, n] of results) console.log(`${s === 'ok' ? '✓' : '✗'} ${n}`)
const failed = results.filter(([s]) => s !== 'ok').length
console.log(failed ? `\nПровалено: ${failed}` : '\nВсё прошло')
process.exit(failed ? 1 : 0)
