// Каталог для бэкенда из данных фронта — один источник правды: классы, машины, трассы, гаражи iRacing.
//   node scripts/export-catalog.mjs            записать backend/app/data/catalog.json
//   node scripts/export-catalog.mjs --check    упасть, если файл устарел (для тестов)
import { readFileSync, writeFileSync } from 'node:fs'
import { categories } from '../src/data/categories.ts'
import { carGarages, garageFor, setupTemplates } from '../src/data/carSetup.ts'
import { trackMeta } from '../src/data/trackMeta.ts'

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'))
const cars = read('../src/data/cars.json')

// Таблица отличий ссылается только на существующие машины и регулировки их класса
for (const [carId, g] of Object.entries(carGarages)) {
  const car = cars.find((c) => c.id === carId)
  if (!car) throw new Error(`carGarages: нет машины ${carId}`)
  const ids = new Set(setupTemplates[car.category].flatMap((group) => group.params.map((x) => x.id)))
  const groupIds = new Set(setupTemplates[car.category].map((group) => group.id))
  for (const id of [...(g.drop ?? []), ...Object.keys(g.patch ?? {}), ...Object.keys(g.replace ?? {})]) {
    if (!ids.has(id)) throw new Error(`carGarages.${carId}: в гараже класса ${car.category} нет ${id}`)
  }
  for (const id of [...Object.keys(g.add ?? {}), ...Object.keys(g.groups ?? {})]) {
    if (!groupIds.has(id)) throw new Error(`carGarages.${carId}: в гараже класса ${car.category} нет группы ${id}`)
  }
}
const tracks = read('../src/data/tracks.json')

const catalog = {
  note: 'Сгенерировано scripts/export-catalog.mjs из src/data — не править руками',
  classes: categories,
  cars: cars.map(({ id, category, brand, model, year, engine, enginePosition, abs, tc, rain, iracing }) => ({ id, category, brand, model, year, engine, enginePosition, abs, tc, rain, iracing })),
  tracks: tracks.map(({ id, name, nameOriginal, country, layout, lengthKm, turns, direction, kind, rain, iracing }) => ({
    id,
    name,
    nameOriginal,
    country,
    layout,
    lengthKm,
    turns,
    direction,
    kind,
    rain,
    iracing,
    meta: trackMeta[id] ?? null,
  })),
  templates: setupTemplates,
  garages: Object.fromEntries(cars.map((c) => [c.id, garageFor(c.id, c.category)])),
}

const out = new URL('../backend/app/data/catalog.json', import.meta.url)
const text = JSON.stringify(catalog, null, 1) + '\n'
if (process.argv.includes('--check')) {
  const current = readFileSync(out, 'utf8')
  if (current !== text) {
    console.error('backend/app/data/catalog.json устарел: node scripts/export-catalog.mjs')
    process.exit(1)
  }
  console.log('catalog.json актуален')
} else {
  writeFileSync(out, text)
  console.log(`catalog.json: ${catalog.classes.length} класса, ${catalog.cars.length} машин, ${catalog.tracks.length} трасс`)
}
