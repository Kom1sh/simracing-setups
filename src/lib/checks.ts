import type { Values } from '../data/types'
import { formatNumber } from './format'
import { FUEL_KG_PER_LITRE, type FuelPlan } from './fuel'

export interface Check {
  id: string
  text: string
}

/** Простые противоречия между условиями и сетапом. Не советы по скорости — только то, что точно не сходится. */
export function runChecks(conditions: Values, setup: Values, fuel: FuelPlan | null, hasFuelTarget: boolean): Check[] {
  const out: Check[] = []
  const rain = conditions.rain as number
  const wetness = conditions.wetness as string
  const compound = setup.compound as string

  if (compound === 'dry' && (rain >= 30 || wetness === 'wet' || wetness === 'flooded')) {
    out.push({ id: 'dry-in-rain', text: 'На трассе вода, а стоят слики. Для дождя нужны дождевые шины.' })
  }
  if (compound === 'wet' && rain === 0 && wetness === 'dry') {
    out.push({ id: 'wet-on-dry', text: 'Сухо, а стоят дождевые шины: на сухом асфальте они быстро перегреются.' })
  }

  if (fuel && hasFuelTarget && conditions.sessionType === 'race') {
    const loaded = setup.fuel as number
    if (loaded < fuel.atStart) {
      out.push({
        id: 'fuel-short',
        text: `Топлива не хватит: на старт нужно ${formatNumber(fuel.atStart)} л, залито ${formatNumber(loaded)} л.`,
      })
    } else if (loaded - fuel.atStart >= 10) {
      const extra = loaded - fuel.atStart
      out.push({
        id: 'fuel-heavy',
        text: `Залито на ${formatNumber(extra)} л больше нужного — это около ${formatNumber(extra * FUEL_KG_PER_LITRE)} кг лишнего веса.`,
      })
    }
  }

  const [front, rear] = setup.rideHeight as number[]
  if (rear < front) {
    out.push({ id: 'negative-rake', text: 'Задний клиренс ниже переднего: наклон кузова отрицательный, прижим сместится назад.' })
  }

  const wing = setup.rearWing as number
  if (conditions.downforce === 'low' && wing >= 10) {
    out.push({ id: 'wing-high', text: 'Трасса быстрая, а антикрыло поднято высоко: машина потеряет скорость на прямых.' })
  }
  if (conditions.downforce === 'high' && wing <= 4) {
    out.push({ id: 'wing-low', text: 'Трассе нужен прижим, а антикрыло опущено: в поворотах не хватит сцепления.' })
  }

  if (conditions.bumps === 'bumpy' && front <= 52) {
    out.push({ id: 'low-on-bumps', text: 'Трасса тряская, а передний клиренс почти минимальный: машина будет цеплять днищем.' })
  }

  return out
}
