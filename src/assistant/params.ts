import { locale } from '../i18n/locale'

/**
 * Бэкенд отдаёт каноническое имя параметра из словаря (VAR-02): front_brake_bias_pct.
 * Для известных имён — подпись на языке страницы, для новых — имя без подчёркиваний и единицы.
 * Пополнять вместе со словарём команды.
 */
const LABELS: Record<string, [string, string]> = {
  front_brake_bias_pct: ['Баланс тормозов', 'Brake bias'],
  brake_bias_pct: ['Баланс тормозов', 'Brake bias'],
  front_arb: ['Передний стабилизатор', 'Front anti-roll bar'],
  rear_arb: ['Задний стабилизатор', 'Rear anti-roll bar'],
  diff_preload_nm: ['Преднатяг дифференциала', 'Diff preload'],
  front_tire_pressure_psi: ['Давление в передних шинах', 'Front tyre pressure'],
  rear_tire_pressure_psi: ['Давление в задних шинах', 'Rear tyre pressure'],
  lf_tire_pressure_psi: ['Давление, левое переднее', 'Left front pressure'],
  rf_tire_pressure_psi: ['Давление, правое переднее', 'Right front pressure'],
  lr_tire_pressure_psi: ['Давление, левое заднее', 'Left rear pressure'],
  rr_tire_pressure_psi: ['Давление, правое заднее', 'Right rear pressure'],
  cross_weight_pct: ['Кросс-вес', 'Cross weight'],
  track_bar_height: ['Высота тяги Панара', 'Track bar height'],
  front_spring_rate: ['Жёсткость передних пружин', 'Front spring rate'],
  rear_spring_rate: ['Жёсткость задних пружин', 'Rear spring rate'],
  front_ride_height_mm: ['Передний клиренс', 'Front ride height'],
  rear_ride_height_mm: ['Задний клиренс', 'Rear ride height'],
  front_camber_deg: ['Развал спереди', 'Front camber'],
  rear_camber_deg: ['Развал сзади', 'Rear camber'],
  front_toe_deg: ['Схождение спереди', 'Front toe'],
  rear_toe_deg: ['Схождение сзади', 'Rear toe'],
}

const UNIT_SUFFIX = /_(pct|psi|nm|mm|deg|clicks?|kg|n)$/

export function paramLabel(name: string): string {
  const known = LABELS[name]
  if (known) return known[locale === 'ru' ? 0 : 1]
  const words = name.replace(UNIT_SUFFIX, '').replace(/_/g, ' ').trim()
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : name
}
