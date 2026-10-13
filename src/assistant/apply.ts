import type { Param, ParamGroup, ParamValue, Values } from '../data/types'
import { clamp, slotRange } from '../lib/params'
import { formatNumber } from '../lib/format'
import type { Recommendation } from './types'

export type Plan = { ok: true; param: Param; next: ParamValue; fromText: string; toText: string } | { ok: false; reason: 'not_in_setup' | 'at_limit' }

export function findParam(groups: ParamGroup[], id: string): Param | undefined {
  for (const g of groups) for (const p of g.params) if (p.id === id) return p
  return undefined
}

/** Какие ячейки значения трогает правка: у оси [перед, зад], у колёс [ПЛ, ПП, ЗЛ, ЗП] */
function slots(p: Param, position: Recommendation['position']): number[] {
  if (p.kind === 'axle') return position === 'front' ? [0] : position === 'rear' ? [1] : [0, 1]
  if (p.kind === 'corners') return position === 'front' ? [0, 1] : position === 'rear' ? [2, 3] : [0, 1, 2, 3]
  return [0]
}

/** Новое значение регулировки после правки — с упором в границы диапазона */
export function planChange(groups: ParamGroup[], values: Values, rec: Recommendation): Plan {
  const p = findParam(groups, rec.parameter)
  if (!p || p.kind === 'choice' || values[p.id] === undefined) return { ok: false, reason: 'not_in_setup' }
  const delta = rec.change.direction === 'increase' ? rec.change.amount : -rec.change.amount
  const current = values[p.id]
  const arr = Array.isArray(current) ? [...current] : [current as number]
  const touched = slots(p, rec.position)
  let moved = false
  for (const i of touched) {
    const r = slotRange(p, i)
    const v = Number(clamp(arr[i] + delta, r.min, r.max).toFixed(p.decimals))
    if (v !== arr[i]) moved = true
    arr[i] = v
  }
  if (!moved) return { ok: false, reason: 'at_limit' }
  const unit = p.unit ? ` ${p.unit}` : ''
  const before = Array.isArray(current) ? current[touched[0]] : (current as number)
  return {
    ok: true,
    param: p,
    next: Array.isArray(current) ? arr : arr[0],
    fromText: `${formatNumber(before, p.decimals)}${unit}`,
    toText: `${formatNumber(arr[touched[0]], p.decimals)}${unit}`,
  }
}
