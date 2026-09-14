/** Плотность бензина около 0,745 кг/л */
export const FUEL_KG_PER_LITRE = 0.745

export interface FuelPlan {
  laps: number
  total: number
  stints: number
  perStint: number
  /** Что залить на старт: весь объём, если влезает в бак, иначе на первый отрезок */
  atStart: number
  fitsTank: boolean
}

/**
 * Гонка на время: кругов = длительность / время круга с округлением вверх,
 * плюс один круг запаса. Отрезки между пит-стопами считаются равными.
 */
export function planFuel(durationMin: number, lapSeconds: number, perLap: number, pitStops: number, tankMax: number): FuelPlan {
  const laps = Math.ceil((durationMin * 60) / lapSeconds)
  const total = Math.ceil((laps + 1) * perLap)
  const stints = pitStops + 1
  const perStint = Math.ceil(total / stints)
  const fitsTank = total <= tankMax
  return { laps, total, stints, perStint, atStart: Math.min(fitsTank ? total : perStint, tankMax), fitsTank }
}
