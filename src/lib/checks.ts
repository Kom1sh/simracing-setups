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
    rakeDown: 'Зад опущен заметно сильнее переда: наклон кузова уменьшился, прижим сместится назад.',
    wingHigh: 'Трасса быстрая, а заднее крыло поднято от базы: машина потеряет скорость на прямых.',
    wingLow: 'Трассе нужен прижим, а заднее крыло опущено от базы: в поворотах не хватит сцепления.',
    lowOnBumps: 'Трасса тряская, а передний клиренс опущен от базы: машина может цеплять днищем.',
  },
  en: {
    dryInRain: 'There is water on the track, but the car is on slicks. Rain needs wet tyres.',
    wetOnDry: 'The track is dry, but the car is on wets: they will overheat quickly on dry tarmac.',
    fuelShort: (need: string, loaded: string) => `Not enough fuel: the start needs ${need} L, the tank has ${loaded} L.`,
    fuelHeavy: (extra: string, kg: string) => `${extra} L more than needed, about ${kg} kg of extra weight.`,
    rakeDown: 'The rear is lowered much more than the front: less rake moves downforce to the rear.',
    wingHigh: 'The track is fast, but the rear wing is up from the baseline: the car will lose speed on the straights.',
    wingLow: 'The track needs downforce, but the rear wing is down from the baseline: there will not be enough grip in corners.',
    lowOnBumps: 'The track is bumpy, but the front ride height is down from the baseline: the car may scrape the ground.',
  },
}[locale]

export interface Check {
  id: string
  text: string
}

/**
 * Простые противоречия между условиями и сетапом. Не советы по скорости — только то, что точно не сходится.
 * Регулировки считаются от базового сетапа iRacing, поэтому проверки смотрят на сдвиг от базы, а не на абсолютные числа.
 */
export function runChecks(conditions: Values, setup: Values, fuel: FuelPlan | null, hasFuelTarget: boolean, rainPossible: boolean): Check[] {
  const out: Check[] = []
  const compound = setup.compound as string | undefined

  if (rainPossible && compound) {
    const rain = conditions.rain as number
    const wetness = conditions.wetness as string
    if (compound === 'dry' && (rain >= 30 || wetness === 'wet')) out.push({ id: 'dry-in-rain', text: TEXT.dryInRain })
    if (compound === 'wet' && rain === 0 && wetness === 'dry') out.push({ id: 'wet-on-dry', text: TEXT.wetOnDry })
  }

  if (fuel && hasFuelTarget && conditions.sessionType === 'race') {
    const loaded = setup.fuel as number
    if (loaded < fuel.atStart) {
      out.push({ id: 'fuel-short', text: TEXT.fuelShort(formatNumber(fuel.atStart), formatNumber(loaded)) })
    } else if (loaded - fuel.atStart >= 10) {
      const extra = loaded - fuel.atStart
      out.push({ id: 'fuel-heavy', text: TEXT.fuelHeavy(formatNumber(extra), formatNumber(extra * FUEL_KG_PER_LITRE)) })
    }
  }

  const ride = setup.rideHeight as number[] | undefined
  if (ride) {
    const [front, rear] = ride
    if (rear - front <= -5) out.push({ id: 'rake-down', text: TEXT.rakeDown })
    if (conditions.bumps === 'bumpy' && front <= -3) out.push({ id: 'low-on-bumps', text: TEXT.lowOnBumps })
  }

  const wing = setup.wing as number | undefined
  if (wing !== undefined) {
    if (conditions.downforce === 'low' && wing >= 2) out.push({ id: 'wing-high', text: TEXT.wingHigh })
    if (conditions.downforce === 'high' && wing <= -2) out.push({ id: 'wing-low', text: TEXT.wingLow })
  }

  return out
}
