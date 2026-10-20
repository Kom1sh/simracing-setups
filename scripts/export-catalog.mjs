// Каталог для бэкенда из данных фронта — один источник правды: классы, машины, трассы, гаражи iRacing.
//   node scripts/export-catalog.mjs            записать backend/app/data/catalog.json
//   node scripts/export-catalog.mjs --check    упасть, если файл устарел (для тестов)
import { readFileSync, writeFileSync } from 'node:fs'
import { categories } from '../src/data/categories.ts'
import { setupTemplates } from '../src/data/carSetup.ts'
import { trackMeta } from '../src/data/trackMeta.ts'

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'))
const cars = read('../src/data/cars.json')
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
