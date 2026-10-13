import type { Values } from '../data/types'
import { formatNumber } from './format'
import { FUEL_KG_PER_LITRE, type FuelPlan } from './fuel'
import { locale } from '../i18n/locale'

const TEXT = {
  ru: {
    dryInRain: 'На трассе вода, а стоят слики. Для дождя нужны дождевые шины.',
    wetOnDry: 'Сухо, а стоят дождевые шины: на сухом асфальте они быстро перегреются.',
    fuelShort: (need: string, loaded: string) => `Топлива не хватит: на старт нужно ${need} л, залито ${loaded} л.`,
    fuelHeavy: (extra: string, kg: string) => `Залито на ${extra} л больше нужного — это около ${kg} кг лишнего веса.`,
    negativeRake: 'Задний клиренс ниже переднего: наклон кузова отрицательный, прижим сместится назад.',
    wingHigh: 'Трасса быстрая, а антикрыло поднято высоко: машина потеряет скорость на прямых.',
    wingLow: 'Трассе нужен прижим, а антикрыло опущено: в поворотах не хватит сцепления.',
    lowOnBumps: 'Трасса тряская, а передний клиренс почти минимальный: машина будет цеплять днищем.',
  },
  en: {
    dryInRain: 'There is water on the track, but the car is on slicks. Rain needs wet tyres.',
    wetOnDry: 'The track is dry, but the car is on wets: they will overheat quickly on dry tarmac.',
    fuelShort: (need: string, loaded: string) => `Not enough fuel: the start needs ${need} L, the tank has ${loaded} L.`,
    fuelHeavy: (extra: string, kg: string) => `${extra} L more than needed, about ${kg} kg of extra weight.`,
    negativeRake: 'Rear ride height is lower than the front: negative rake moves downforce to the rear.',
    wingHigh: 'The track is fast, but the rear wing is high: the car will lose speed on the straights.',
    wingLow: 'The track needs downforce, but the rear wing is low: there will not be enough grip in corners.',
    lowOnBumps: 'The track is bumpy, but the front ride height is near the minimum: the car will scrape the ground.',
  },
}[locale]

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
    out.push({ id: 'dry-in-rain', text: TEXT.dryInRain })
  }
  if (compound === 'wet' && rain === 0 && wetness === 'dry') {
    out.push({ id: 'wet-on-dry', text: TEXT.wetOnDry })
  }

  if (fuel && hasFuelTarget && conditions.sessionType === 'race') {
    const loaded = setup.fuel as number
    if (loaded < fuel.atStart) {
      out.push({
        id: 'fuel-short',
        text: TEXT.fuelShort(formatNumber(fuel.atStart), formatNumber(loaded)),
      })
    } else if (loaded - fuel.atStart >= 10) {
      const extra = loaded - fuel.atStart
      out.push({
        id: 'fuel-heavy',
        text: TEXT.fuelHeavy(formatNumber(extra), formatNumber(extra * FUEL_KG_PER_LITRE)),
      })
    }
  }

  const [front, rear] = setup.rideHeight as number[]
  if (rear < front) {
    out.push({ id: 'negative-rake', text: TEXT.negativeRake })
  }

  const wing = setup.rearWing as number
  if (conditions.downforce === 'low' && wing >= 10) {
    out.push({ id: 'wing-high', text: TEXT.wingHigh })
  }
  if (conditions.downforce === 'high' && wing <= 4) {
    out.push({ id: 'wing-low', text: TEXT.wingLow })
  }

  if (conditions.bumps === 'bumpy' && front <= 52) {
    out.push({ id: 'low-on-bumps', text: TEXT.lowOnBumps })
  }

  return out
}
