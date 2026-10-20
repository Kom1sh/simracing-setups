import type { Car } from '../data/types'
import { ASPIRATION, ENGINE_LAYOUT } from '../data/localized'
import { formatNumber } from './format'

/** «3,0 V6 битурбо» */
export function engineText(car: Car): string {
  const { litres, layout, aspiration } = car.engine
  const parts: string[] = []
  if (litres !== null) parts.push(formatNumber(litres, Number.isInteger(litres * 10) ? 1 : 2))
  if (layout) parts.push(ENGINE_LAYOUT[layout] ?? layout)
  if (aspiration) parts.push(ASPIRATION[aspiration])
  return parts.join(' ')
}
