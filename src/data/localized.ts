import tracksData from './tracks.json'
import { setupTemplates } from './carSetup'
import { conditionGroups as conditionsSource } from './conditions'
import { categories as categoriesSource, ENGINE_POSITION as positionSource, ASPIRATION as aspirationSource } from './categories'
import { trackAliases } from './trackMeta'
import type { Category } from './categories'
import type { CategoryId, EnginePosition, Param, ParamGroup, Track } from './types'
import { locale } from '../i18n/locale'
import * as en from '../i18n/dataEn'

/** Данные кабинета на языке страницы. Русский — исходник, английский накладывается по id. */

const isEn = locale === 'en'

/** Перевод по id; для регулировок класса сначала ищется «класс:id» — у NASCAR и GT3 одно и то же давление описано по-разному */
function localizeParam(p: Param, scope?: string): Param {
  const tr = (scope && en.paramsEn[`${scope}:${p.id}`]) || en.paramsEn[p.id]
  const unit = p.unit ? (en.unitsEn[p.unit] ?? p.unit) : undefined
  const common = { label: tr?.label ?? p.label, hint: tr ? tr.hint : p.hint, unit }
  if (p.kind === 'choice') return { ...p, ...common, options: p.options.map((o) => ({ ...o, label: tr?.options?.[o.value] ?? o.label })) }
  if (p.kind === 'scalar') return { ...p, ...common, presets: p.presets?.map((pr, i) => ({ ...pr, label: tr?.presets?.[i] ?? pr.label })) }
  return { ...p, ...common }
}

function localizeGroups(groups: ParamGroup[], scope?: string): ParamGroup[] {
  if (!isEn) return groups
  return groups.map((g) => {
    const tr = (scope && en.groupsEn[`${scope}:${g.id}`]) || en.groupsEn[g.id]
    return { ...g, title: tr?.title ?? g.title, description: tr ? tr.description : g.description, params: g.params.map((p) => localizeParam(p, scope)) }
  })
}

export const conditionGroups = localizeGroups(conditionsSource)

const setupByCategory = Object.fromEntries(Object.entries(setupTemplates).map(([id, groups]) => [id, localizeGroups(groups, id)])) as Record<CategoryId, ParamGroup[]>

/** Регулировки гаража iRacing для класса машины */
export function setupGroupsFor(category: CategoryId): ParamGroup[] {
  return setupByCategory[category]
}
const sourceTracks = tracksData as Track[]

export const tracks: Track[] = sourceTracks
  .map((t) =>
    isEn
      ? { ...t, name: en.trackNamesEn[t.id] ?? t.nameOriginal, country: en.countriesEn[t.country] ?? t.country, layout: en.layoutsEn[t.layout] ?? t.layout }
      : t,
  )
  .sort((a, b) => a.name.localeCompare(b.name, locale))

/** Поиск трассы на любом языке: русское и английское название, страна, народные сокращения */
export const trackSearchTerms: Record<string, string[]> = Object.fromEntries(
  sourceTracks.map((t) => [
    t.id,
    [t.name, t.nameOriginal, t.country, en.trackNamesEn[t.id] ?? '', en.countriesEn[t.country] ?? '', ...(trackAliases[t.id] ?? [])].filter(Boolean),
  ]),
)

export const categories: Category[] = categoriesSource.map((c) =>
  isEn ? { ...c, label: en.categoriesEn[c.id]?.label ?? c.label, note: en.categoriesEn[c.id]?.note } : c,
)

export const ENGINE_POSITION: Record<EnginePosition, string> = isEn ? (en.enginePositionEn as Record<EnginePosition, string>) : positionSource
export const ASPIRATION: Record<string, string> = isEn ? en.aspirationEn : aspirationSource
export const ENGINE_LAYOUT: Record<string, string> = isEn
  ? en.engineLayoutEn
  : { 'flat-6': 'оппозитный 6', I4: 'рядный 4', I5: 'рядный 5', I6: 'рядный 6' }
