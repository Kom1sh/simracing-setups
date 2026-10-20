import type { CornerPhase, Recommendation, StintMoment, SymptomType } from '../src/assistant/types.ts'

/**
 * Правила фейкового бэкенда (scripts/fake-backend.mjs) для e2e и разработки без Python. Подбираются как на бэкенде (ALE-03):
 * по symptom_type, corner_phase и stint_moment (правило без stint подходит к любому).
 * Это общие закономерности, а не проверенная экспертная база (FED-04, VAR-04).
 * Для избыточной в середине правила нет нарочно — так видно ответ no_match.
 */

type L = { ru: string; en: string }

export interface DemoRule {
  id: string
  symptom: SymptomType
  phase: CornerPhase
  stint?: StintMoment
  direction: Recommendation['direction']
  parameter: string
  change: L
  effect: L
  limits: L
}

export const demoRules: DemoRule[] = [
  {
    id: 'DEMO-01', symptom: 'understeer', phase: 'entry', direction: 'decrease', parameter: 'front_brake_bias_pct',
    change: { ru: 'Сместить баланс тормозов назад на 0,5 %', en: 'Move brake bias 0.5% to the rear' },
    effect: { ru: 'Передние колёса меньше нагружены торможением на входе и лучше поворачивают', en: 'The front tyres do less braking on entry and have more grip left for turning' },
    limits: { ru: 'Задняя ось станет живее на торможении', en: 'The rear gets livelier under braking' },
  },
  {
    id: 'DEMO-02', symptom: 'understeer', phase: 'mid', direction: 'decrease', parameter: 'front_arb',
    change: { ru: 'Смягчить передний стабилизатор на 1 щелчок', en: 'Soften the front anti-roll bar by 1 click' },
    effect: { ru: 'Передок держит траекторию в установившемся повороте', en: 'The front holds the line better in steady cornering' },
    limits: { ru: 'Отклик на перекладках станет медленнее, крен больше', en: 'Slower response in quick direction changes and more roll' },
  },
  {
    id: 'DEMO-03', symptom: 'understeer', phase: 'exit', direction: 'decrease', parameter: 'diff_preload_nm',
    change: { ru: 'Снизить преднатяг дифференциала на 10 Нм', en: 'Lower diff preload by 10 Nm' },
    effect: { ru: 'Машина охотнее доворачивает, когда вы открываете газ', en: 'The car rotates more willingly as you get on the power' },
    limits: { ru: 'Внутреннее заднее колесо легче срывается из медленных поворотов', en: 'The inside rear spins up more easily out of slow corners' },
  },
  {
    id: 'DEMO-04', symptom: 'understeer', phase: 'mid', stint: 'after_laps', direction: 'increase', parameter: 'front_tire_pressure_psi',
    change: { ru: 'Поднять давление в передних шинах на 0,5 psi', en: 'Raise front tyre pressure by 0.5 psi' },
    effect: { ru: 'Шины меньше перегреваются к середине стинта', en: 'The front tyres overheat less by the middle of the stint' },
    limits: { ru: 'На первых кругах сцепления спереди будет чуть меньше', en: 'A little less front grip on the first laps' },
  },
  {
    id: 'DEMO-05', symptom: 'oversteer', phase: 'entry', direction: 'increase', parameter: 'front_brake_bias_pct',
    change: { ru: 'Сместить баланс тормозов вперёд на 0,5 %', en: 'Move brake bias 0.5% to the front' },
    effect: { ru: 'Задняя ось спокойнее, когда вы тормозите и входите в поворот', en: 'The rear stays calmer as you brake and turn in' },
    limits: { ru: 'Передние колёса начнут блокироваться раньше', en: 'The front wheels will lock a little earlier' },
  },
  {
    id: 'DEMO-06', symptom: 'oversteer', phase: 'exit', direction: 'decrease', parameter: 'rear_arb',
    change: { ru: 'Смягчить задний стабилизатор на 1 щелчок', en: 'Soften the rear anti-roll bar by 1 click' },
    effect: { ru: 'Задняя ось лучше держит, когда вы открываете газ', en: 'The rear holds on better as you get on the power' },
    limits: { ru: 'В середине поворота может добавиться недостаточной поворачиваемости', en: 'You may get a little more understeer mid-corner' },
  },
]
