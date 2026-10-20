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

/** Вкладка «Мой сетап» с раскрытым полным гаражом */
async function openGarage() {
  await page.getByRole('tab', { name: /Мой сетап/ }).click()
  const toggle = page.getByRole('button', { name: /^Весь гараж/ })
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click()
}

await page.goto(BASE)
await page.evaluate(() => localStorage.clear())
await page.reload()

await step('по умолчанию NASCAR Next Gen в Дайтоне', async () => {
  expect((await page.getByRole('radio', { name: 'NASCAR' }).getAttribute('aria-checked')) === 'true', 'NASCAR не выбран')
  const car = await page.getByRole('button', { name: /^Машина/ }).first().textContent()
  expect(car.includes('Camaro ZL1 (Next Gen)'), `машина ${car}`)
  const track = await page.getByRole('button', { name: /^Трасса/ }).first().textContent()
  expect(track.includes('Дайтона'), `трасса ${track}`)
})

await step('кабинет открывается на ассистенте, вкладки: Ассистент, Условия, Мой сетап', async () => {
  const names = (await page.getByRole('tab').allTextContents()).map((x) => x.replace(/\d+$/, '').trim())
  expect(names.join(' / ') === 'Ассистент / Условия / Мой сетап', `вкладки ${names.join(' / ')}`)
  expect((await page.getByRole('tab', { name: 'Ассистент' }).getAttribute('aria-selected')) === 'true', 'открыта не вкладка ассистента')
})

await step('гараж NASCAR: свёрнут по умолчанию; cross weight есть, ABS, крыла и дождевых шин нет', async () => {
  await page.getByRole('tab', { name: /Мой сетап/ }).click()
  expect((await page.getByRole('group', { name: 'Cross weight' }).count()) === 0, 'гараж раскрыт сразу')
  await openGarage()
  expect((await page.getByRole('group', { name: 'Cross weight' }).count()) === 1, 'нет cross weight')
  expect((await page.getByRole('group', { name: 'ABS' }).count()) === 0, 'строка ABS видна')
  expect((await page.getByRole('group', { name: 'Заднее крыло' }).count()) === 0, 'крыло видно')
  expect((await page.getByRole('group', { name: 'Шины' }).count()) === 0, 'выбор шин виден')
})

await step('у NASCAR в выборе трассы есть овалы', async () => {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByRole('button', { name: /^Трасса/ }).first().click()
  await page.keyboard.type('талладега')
  expect((await page.getByRole('option').count()) >= 1, 'Талладеги нет')
  await page.keyboard.press('Escape')
})

await step('GT3 уходит на дорожную трассу со своим гаражом', async () => {
  await page.getByRole('radio', { name: 'GT3' }).click()
  const track = await page.getByRole('button', { name: /^Трасса/ }).first().textContent()
  expect(track.includes('Спа'), `трасса ${track}`)
  expect(await page.getByText('свой гараж').first().isVisible(), 'нет сообщения о смене гаража')
  await openGarage()
  expect((await page.getByRole('group', { name: 'ABS' }).count()) === 1, 'нет ABS')
  expect((await page.getByRole('group', { name: 'Заднее крыло' }).count()) === 1, 'нет крыла')
  expect((await page.getByRole('group', { name: 'Cross weight' }).count()) === 0, 'cross weight у GT3')
})

await step('у GT3 овалов в выборе нет', async () => {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByRole('button', { name: /^Трасса/ }).first().click()
  await page.keyboard.type('дайтона')
  expect(await page.getByText('Трассы «дайтона» в списке нет').isVisible(), 'Дайтона нашлась у GT3')
  await page.keyboard.press('Escape')
})

await step('возврат в NASCAR возвращает Дайтону и прежнюю машину, снова GT3 — Спа', async () => {
  await page.getByRole('radio', { name: 'NASCAR' }).click()
  let track = await page.getByRole('button', { name: /^Трасса/ }).first().textContent()
  const car = await page.getByRole('button', { name: /^Машина/ }).first().textContent()
  expect(track.includes('Дайтона') && car.includes('Camaro'), `${track} / ${car}`)
  await page.getByRole('radio', { name: 'GT3' }).click()
  track = await page.getByRole('button', { name: /^Трасса/ }).first().textContent()
  expect(track.includes('Спа'), `трасса ${track}`)
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

await step('Монца: в «Условиях» погода и сессия, без прижима и ветра', async () => {
  await page.getByRole('button', { name: /^Трасса/ }).first().click()
  await page.keyboard.type('monza')
  await page.keyboard.press('Enter')
  await page.getByRole('tab', { name: 'Условия' }).click()
  expect((await page.getByRole('radiogroup', { name: 'Нужный прижим' }).count()) === 0, 'прижим остался')
  expect((await page.getByText('Ветер', { exact: true }).count()) === 0, 'ветер остался')
  expect(await page.getByRole('slider', { name: 'Шанс дождя' }).isVisible(), 'нет шанса дождя')
})

await step('слики под дождём дают замечание', async () => {
  const rain = page.getByRole('slider', { name: 'Шанс дождя' })
  await rain.focus()
  for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight')
  expect(await page.getByText('На трассе вода, а стоят слики').isVisible(), 'нет замечания')
})

await step('симметрия: без неё правое колесо не меняется, значения — от базы', async () => {
  await openGarage()
  const group = page.getByRole('group', { name: 'Холодное давление' })
  await group.getByRole('switch', { name: 'Слева и справа одинаково' }).uncheck()
  await group.getByRole('button', { name: 'Холодное давление, передняя левая: больше' }).click()
  const left = await group.getByRole('textbox', { name: 'Холодное давление, передняя левая' }).inputValue()
  const right = await group.getByRole('textbox', { name: 'Холодное давление, передняя правая' }).inputValue()
  expect(left === '+0,1' && right === '0,0', `ПЛ ${left}, ПП ${right}`)
})

await step('Мой сетап: правка в списке, «Вернуть» сбрасывает её, в сводке дубля нет', async () => {
  expect((await page.locator('.edits__row', { hasText: 'Холодное давление' }).count()) === 1, 'правки нет в списке')
  expect((await page.locator('.summary .changes__item').count()) === 0, 'список правок остался в сводке')
  await page.getByRole('button', { name: 'Вернуть «Холодное давление ПЛ» к базе' }).click()
  await page.locator('.edits__row').first().waitFor({ state: 'detached' })
  // Текст поля обновляется эффектом после отрисовки — ждём его, а не читаем в тот же кадр
  const field = page.getByRole('textbox', { name: 'Холодное давление, передняя левая' })
  for (let i = 0; i < 20 && (await field.inputValue()) !== '0,0'; i++) await page.waitForTimeout(50)
  const left = await field.inputValue()
  expect(left === '0,0' && (await page.locator('.edits__row').count()) === 0, `ПЛ ${left}`)
})

await step('ввод числа руками с запятой и зажимом в диапазон', async () => {
  const field = page.getByRole('textbox', { name: 'Баланс тормозов' })
  await field.fill('99')
  await field.press('Enter')
  expect((await field.inputValue()) === '+4,0', `значение ${await field.inputValue()}`)
  await field.fill('-1,5')
  await field.press('Tab')
  expect((await field.inputValue()) === '−1,5', `значение ${await field.inputValue()}`)
})

await step('характер трассы из каталога: поднятое крыло на Монце даёт замечание', async () => {
  const wing = page.getByRole('textbox', { name: 'Заднее крыло' })
  await wing.fill('2')
  await wing.press('Enter')
  expect(await page.getByText('Трасса быстрая, а заднее крыло поднято').isVisible(), 'нет замечания про крыло')
  await wing.fill('0')
  await wing.press('Enter')
})

await step('ассистент берёт машину и трассу из шапки', async () => {
  await page.getByRole('tab', { name: 'Ассистент' }).click()
  expect(await page.locator('.ask__context').getByText('Монца').isVisible(), 'нет трассы из шапки')
  await openGarage()
})

await step('сохранение переживает перезагрузку', async () => {
  await page.getByRole('button', { name: 'Сохранить сетап' }).click()
  await page.reload()
  const trigger = await page.getByRole('button', { name: /^Трасса/ }).first().textContent()
  expect(trigger.includes('Монца'), `после перезагрузки ${trigger}`)
  await page.getByRole('button', { name: /Мои сетапы/ }).click()
  await page.locator('.saved__item').first().waitFor()
  expect((await page.locator('.saved__item').count()) === 1, 'в списке не один сетап')
  await page.getByRole('button', { name: 'Закрыть' }).click()
  await openGarage()
  expect((await page.getByRole('textbox', { name: 'Баланс тормозов' }).inputValue()) === '−1,5', 'баланс тормозов не сохранился')
})

await step('файл: скачать и загрузить обратно', async () => {
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Скачать файл' }).click()])
  const path = await download.path()
  const data = JSON.parse(readFileSync(path, 'utf8'))
  expect(data.format === 'simracing-setups/v1' && data.track.id === 'monza' && data.setup.brakeBias === -1.5, 'содержимое файла не то')
  await page.getByRole('button', { name: 'Вернуть всё к базе' }).click()
  await page.locator('input[type=file]').setInputFiles(path)
  await page.waitForTimeout(200)
  const field = page.getByRole('textbox', { name: 'Баланс тормозов' })
  expect((await field.inputValue()) === '−1,5', `после загрузки ${await field.inputValue()}`)
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
