import type { CornerPhase, CornerSpeed, Recommendation, Symptom } from './types'

/**
 * Демо-правила для заглушки API, пока бэкенд не подключён.
 * Это общие закономерности из подсказок кабинета, а не проверенная экспертная база (её собирают FED-04 и VAR-04).
 * Для перегрева шин правила нет нарочно: так видно состояние «правило не найдено».
 */

type L = { ru: string; en: string }

export interface DemoRule {
  id: string
  symptom: Symptom
  phase?: CornerPhase
  speed?: CornerSpeed
  parameter: string
  position: Recommendation['position']
  direction: 'increase' | 'decrease'
  amount: number
  unit: string
  label: L
  effect: L
  limits: L[]
  why?: L
}

const BIAS: L = { ru: 'Баланс тормозов', en: 'Brake bias' }
const PRELOAD: L = { ru: 'Преднатяг дифференциала', en: 'Diff preload' }
const TC: L = { ru: 'Антипробуксовка', en: 'Traction control' }

export const demoRules: DemoRule[] = [
  {
    id: 'DEMO-01', symptom: 'understeer', phase: 'entry', parameter: 'brakeBias', position: null, direction: 'decrease', amount: 0.5, unit: 'percent', label: BIAS,
    effect: { ru: 'Передние колёса меньше нагружены торможением на входе и лучше поворачивают.', en: 'The front tyres do less braking on entry and have more grip left for turning.' },
    limits: [{ ru: 'Задняя ось станет живее на торможении.', en: 'The rear gets livelier under braking.' }],
    why: { ru: 'Часть тормозного усилия уходит назад, передним шинам остаётся больше сцепления на поворот.', en: 'Some braking moves to the rear, leaving the front tyres more grip for steering.' },
  },
  {
    id: 'DEMO-02', symptom: 'understeer', phase: 'mid', parameter: 'arb', position: 'front', direction: 'decrease', amount: 1, unit: 'click',
    label: { ru: 'Передний стабилизатор', en: 'Front anti-roll bar' },
    effect: { ru: 'Передок держит траекторию в установившемся повороте.', en: 'The front holds the line better in steady cornering.' },
    limits: [{ ru: 'Отклик на перекладках станет медленнее, крен больше.', en: 'Slower response in quick direction changes and more roll.' }],
  },
  {
    id: 'DEMO-03', symptom: 'understeer', phase: 'mid', speed: 'fast', parameter: 'splitter', position: null, direction: 'increase', amount: 1, unit: 'step',
    label: { ru: 'Сплиттер', en: 'Splitter' },
    effect: { ru: 'Больше прижима на передней оси в быстрых поворотах.', en: 'More front downforce in fast corners.' },
    limits: [{ ru: 'Немного больше сопротивление на прямых.', en: 'A little more drag on the straights.' }],
  },
  {
    id: 'DEMO-04', symptom: 'understeer', phase: 'exit', parameter: 'diffPreload', position: null, direction: 'decrease', amount: 10, unit: 'nm', label: PRELOAD,
    effect: { ru: 'Машина охотнее доворачивает, когда вы открываете газ.', en: 'The car rotates more willingly as you get on the power.' },
    limits: [{ ru: 'Внутреннее заднее колесо легче срывается: следите за тягой из медленных поворотов.', en: 'The inside rear spins up more easily: watch traction out of slow corners.' }],
  },
  {
    id: 'DEMO-05', symptom: 'oversteer', phase: 'entry', parameter: 'brakeBias', position: null, direction: 'increase', amount: 0.5, unit: 'percent', label: BIAS,
    effect: { ru: 'Задняя ось спокойнее, когда вы тормозите и входите в поворот.', en: 'The rear stays calmer as you brake and turn in.' },
    limits: [{ ru: 'Передние колёса начнут блокироваться раньше.', en: 'The front wheels will lock a little earlier.' }],
  },
  {
    id: 'DEMO-06', symptom: 'oversteer', phase: 'entry', parameter: 'diffPreload', position: null, direction: 'increase', amount: 10, unit: 'nm', label: PRELOAD,
    effect: { ru: 'Машина стабильнее на сбросе газа и входе.', en: 'The car is more stable off the throttle and on entry.' },
    limits: [{ ru: 'Машина неохотнее поворачивает в середине.', en: 'The car turns less willingly mid-corner.' }],
  },
  {
    id: 'DEMO-07', symptom: 'oversteer', phase: 'mid', parameter: 'arb', position: 'rear', direction: 'decrease', amount: 1, unit: 'click',
    label: { ru: 'Задний стабилизатор', en: 'Rear anti-roll bar' },
    effect: { ru: 'У задней оси больше сцепления в установившемся повороте.', en: 'The rear has more grip in steady cornering.' },
    limits: [{ ru: 'В середине поворота может добавиться недостаточной поворачиваемости.', en: 'You may get a little more understeer mid-corner.' }],
  },
  {
    id: 'DEMO-08', symptom: 'oversteer', phase: 'exit', parameter: 'tc', position: null, direction: 'increase', amount: 1, unit: 'step', label: TC,
    effect: { ru: 'Меньше срывов, когда открываете газ.', en: 'Fewer slides when you open the throttle.' },
    limits: [{ ru: 'Разгон из медленных поворотов станет чуть медленнее.', en: 'Slightly slower acceleration out of slow corners.' }],
  },
  {
    id: 'DEMO-09', symptom: 'wheelspin', parameter: 'tc', position: null, direction: 'increase', amount: 1, unit: 'step', label: TC,
    effect: { ru: 'Колёса реже срываются на выходе.', en: 'The rear wheels break loose less often on exit.' },
    limits: [{ ru: 'Чуть медленнее разгон.', en: 'Slightly slower acceleration.' }],
  },
  {
    id: 'DEMO-10', symptom: 'braking_instability', parameter: 'brakeBias', position: null, direction: 'increase', amount: 1, unit: 'percent', label: BIAS,
    effect: { ru: 'Задняя ось стоит на месте при резком торможении по прямой.', en: 'The rear stays planted under hard braking in a straight line.' },
    limits: [{ ru: 'Передние колёса блокируются раньше: на пределе отпускайте педаль.', en: 'The fronts lock earlier: ease off the pedal at the limit.' }],
  },
  {
    id: 'DEMO-11', symptom: 'front_lockup', parameter: 'brakeBias', position: null, direction: 'decrease', amount: 0.5, unit: 'percent', label: BIAS,
    effect: { ru: 'Передние колёса реже встают на торможении.', en: 'The front wheels lock less often under braking.' },
    limits: [{ ru: 'Задняя ось станет живее на торможении.', en: 'The rear gets livelier under braking.' }],
  },
  {
    id: 'DEMO-12', symptom: 'kerbs', parameter: 'bumpFast', position: 'both', direction: 'decrease', amount: 2, unit: 'click',
    label: { ru: 'Сжатие, быстрое', en: 'Bump, fast' },
    effect: { ru: 'Подвеска мягче проглатывает бордюры.', en: 'The suspension soaks up kerbs more softly.' },
    limits: [{ ru: 'Кузов больше качается на неровностях.', en: 'More body movement over bumps.' }],
  },
  {
    id: 'DEMO-13', symptom: 'bottoming', parameter: 'rideHeight', position: 'both', direction: 'increase', amount: 2, unit: 'mm',
    label: { ru: 'Клиренс', en: 'Ride height' },
    effect: { ru: 'Днище перестаёт задевать асфальт в компрессиях.', en: 'The floor stops hitting the track in compressions.' },
    limits: [{ ru: 'Немного меньше прижима и выше центр тяжести.', en: 'A little less downforce and a higher centre of gravity.' }],
  },
]
