import type { Param, ParamGroup, ParamValue, Range, Values } from '../data/types'

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

export function snap(v: number, step: number, min: number, decimals: number) {
  const snapped = Math.round((v - min) / step) * step + min
  return Number(snapped.toFixed(decimals))
}

export function baseValue(p: Param): ParamValue {
  switch (p.kind) {
    case 'scalar':
      return p.range.base
    case 'axle':
      return [p.front.base, p.rear.base]
    case 'corners':
      return [p.front.base, p.front.base, p.rear.base, p.rear.base]
    case 'choice':
      return p.base
  }
}

export function baseValues(groups: ParamGroup[]): Values {
  const out: Values = {}
  for (const g of groups) for (const p of g.params) out[p.id] = baseValue(p)
  return out
}

export function sameValue(a: ParamValue | undefined, b: ParamValue | undefined): boolean {
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => x === b[i])
  return a === b
}

/** Диапазон ячейки: у оси [перед, зад], у колёс [ПЛ, ПП, ЗЛ, ЗП] */
export function slotRange(p: Param, index: number): Range {
  if (p.kind === 'scalar') return p.range
  if (p.kind === 'axle') return index === 0 ? p.front : p.rear
  if (p.kind === 'corners') return index < 2 ? p.front : p.rear
  throw new Error('У выбора из списка нет диапазона')
}

/** Подставляет базу вместо отсутствующих или битых значений — после импорта и загрузки */
export function sanitize(groups: ParamGroup[], values: Partial<Values> | undefined | null): Values {
  const out = baseValues(groups)
  if (!values || typeof values !== 'object') return out
  for (const g of groups) {
    for (const p of g.params) {
      const v = values[p.id]
      if (v === undefined) continue
      if (p.kind === 'choice') {
        if (typeof v === 'string' && p.options.some((o) => o.value === v)) out[p.id] = v
      } else if (p.kind === 'scalar') {
        if (typeof v === 'number' && Number.isFinite(v)) out[p.id] = clamp(v, p.range.min, p.range.max)
      } else {
        const len = p.kind === 'axle' ? 2 : 4
        if (Array.isArray(v) && v.length === len && v.every((x) => typeof x === 'number' && Number.isFinite(x))) {
          out[p.id] = v.map((x, i) => {
            const r = slotRange(p, i)
            return clamp(x, r.min, r.max)
          })
        }
      }
    }
  }
  return out
}

export interface Change {
  param: Param
  group: ParamGroup
  index?: number
  from: ParamValue
  to: ParamValue
}

const CORNER = ['ПЛ', 'ПП', 'ЗЛ', 'ЗП']
const AXLE = ['перед', 'зад']

export function slotName(p: Param, index: number) {
  return p.kind === 'corners' ? CORNER[index] : AXLE[index]
}

export function listChanges(groups: ParamGroup[], values: Values, visible: (p: Param) => boolean = () => true): Change[] {
  const changes: Change[] = []
  for (const g of groups) {
    for (const p of g.params) {
      if (!visible(p)) continue
      const base = baseValue(p)
      const cur = values[p.id]
      if (sameValue(base, cur)) continue
      if (Array.isArray(base) && Array.isArray(cur)) {
        cur.forEach((v, i) => {
          if (v !== base[i]) changes.push({ param: p, group: g, index: i, from: base[i], to: v })
        })
      } else {
        changes.push({ param: p, group: g, from: base, to: cur })
      }
    }
  }
  return changes
}

export function countParams(groups: ParamGroup[], visible: (p: Param) => boolean = () => true) {
  let n = 0
  for (const g of groups)
    for (const p of g.params) if (visible(p)) n += p.kind === 'corners' ? 4 : p.kind === 'axle' ? 2 : 1
  return n
}
