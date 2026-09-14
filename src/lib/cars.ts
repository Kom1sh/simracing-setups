import type { Car } from '../data/types'
import { ASPIRATION } from '../data/categories'
import { formatNumber } from './format'

const LAYOUT: Record<string, string> = {
  'flat-6': 'оппозитный 6',
  I4: 'рядный 4',
  I5: 'рядный 5',
  I6: 'рядный 6',
}

/** «3,0 V6 битурбо» */
export function engineText(car: Car): string {
  const { litres, layout, aspiration } = car.engine
  const parts: string[] = []
  if (litres !== null) parts.push(formatNumber(litres, 1))
  if (layout) parts.push(LAYOUT[layout] ?? layout)
  if (aspiration) parts.push(ASPIRATION[aspiration])
  return parts.join(' ')
}
