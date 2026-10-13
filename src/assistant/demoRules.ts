import type { Recommendation } from './types'

/**
 * Демо-правила для заглушки API, пока бэкенд не подключён. Ищутся так же, как на бэкенде:
 * правило подходит, если в тексте жалобы есть все его ключевые слова (по подстроке, без регистра).
 * Это общие закономерности из подсказок кабинета, а не проверенная экспертная база (FED-04, VAR-04).
 * Для перегрева шин правила нет нарочно — так видно ответ no_match.
 */

type L = { ru: string; en: string }

export interface DemoRule {
  id: string
  keywords: string[]
  direction: Recommendation['direction']
  parameter: L
  change: L
  effect: L
  limits: L
}

const BIAS: L = { ru: 'баланс тормозов', en: 'brake bias' }
const PRELOAD: L = { ru: 'преднатяг дифференциала', en: 'diff preload' }
const TC: L = { ru: 'антипробуксовка', en: 'traction control' }

export const demoRules: DemoRule[] = [
  {
    id: 'DEMO-01', keywords: ['недостаточн', 'вход'], direction: 'decrease', parameter: BIAS,
    change: { ru: 'Сместить баланс тормозов назад на 0,5 %', en: 'Move brake bias 0.5% to the rear' },
    effect: { ru: 'Передние колёса меньше нагружены торможением на входе и лучше поворачивают', en: 'The front tyres do less braking on entry and have more grip left for turning' },
    limits: { ru: 'Задняя ось станет живее на торможении', en: 'The rear gets livelier under braking' },
  },
  {
    id: 'DEMO-02', keywords: ['недостаточн', 'середин'], direction: 'decrease', parameter: { ru: 'передний стабилизатор', en: 'front anti-roll bar' },
    change: { ru: 'Смягчить передний стабилизатор на 1 щелчок', en: 'Soften the front anti-roll bar by 1 click' },
    effect: { ru: 'Передок держит траекторию в установившемся повороте', en: 'The front holds the line better in steady cornering' },
    limits: { ru: 'Отклик на перекладках станет медленнее, крен больше', en: 'Slower response in quick direction changes and more roll' },
  },
  {
    id: 'DEMO-03', keywords: ['недостаточн', 'быстрых'], direction: 'increase', parameter: { ru: 'сплиттер', en: 'splitter' },
    change: { ru: 'Поднять сплиттер на 1 шаг', en: 'Raise the splitter by 1 step' },
    effect: { ru: 'Больше прижима на передней оси в быстрых поворотах', en: 'More front downforce in fast corners' },
    limits: { ru: 'Немного больше сопротивление на прямых', en: 'A little more drag on the straights' },
  },
  {
    id: 'DEMO-04', keywords: ['недостаточн', 'выход'], direction: 'decrease', parameter: PRELOAD,
    change: { ru: 'Снизить преднатяг дифференциала на 10 Нм', en: 'Lower diff preload by 10 Nm' },
    effect: { ru: 'Машина охотнее доворачивает, когда вы открываете газ', en: 'The car rotates more willingly as you get on the power' },
    limits: { ru: 'Внутреннее заднее колесо легче срывается из медленных поворотов', en: 'The inside rear spins up more easily out of slow corners' },
  },
  {
    id: 'DEMO-05', keywords: ['избыточн', 'вход'], direction: 'increase', parameter: BIAS,
    change: { ru: 'Сместить баланс тормозов вперёд на 0,5 %', en: 'Move brake bias 0.5% to the front' },
    effect: { ru: 'Задняя ось спокойнее, когда вы тормозите и входите в поворот', en: 'The rear stays calmer as you brake and turn in' },
    limits: { ru: 'Передние колёса начнут блокироваться раньше', en: 'The front wheels will lock a little earlier' },
  },
  {
    id: 'DEMO-07', keywords: ['избыточн', 'середин'], direction: 'decrease', parameter: { ru: 'задний стабилизатор', en: 'rear anti-roll bar' },
    change: { ru: 'Смягчить задний стабилизатор на 1 щелчок', en: 'Soften the rear anti-roll bar by 1 click' },
    effect: { ru: 'У задней оси больше сцепления в установившемся повороте', en: 'The rear has more grip in steady cornering' },
    limits: { ru: 'В середине поворота может добавиться недостаточной поворачиваемости', en: 'You may get a little more understeer mid-corner' },
  },
  {
    id: 'DEMO-08', keywords: ['избыточн', 'выход'], direction: 'increase', parameter: TC,
    change: { ru: 'Поднять антипробуксовку на 1 шаг', en: 'Raise traction control by 1 step' },
    effect: { ru: 'Меньше срывов, когда открываете газ', en: 'Fewer slides when you open the throttle' },
    limits: { ru: 'Разгон из медленных поворотов станет чуть медленнее', en: 'Slightly slower acceleration out of slow corners' },
  },
  {
    id: 'DEMO-09', keywords: ['пробуксовк'], direction: 'increase', parameter: TC,
    change: { ru: 'Поднять антипробуксовку на 1 шаг', en: 'Raise traction control by 1 step' },
    effect: { ru: 'Колёса реже срываются на выходе', en: 'The rear wheels break loose less often on exit' },
    limits: { ru: 'Чуть медленнее разгон', en: 'Slightly slower acceleration' },
  },
  {
    id: 'DEMO-10', keywords: ['нестабильн', 'тормож'], direction: 'increase', parameter: BIAS,
    change: { ru: 'Сместить баланс тормозов вперёд на 1 %', en: 'Move brake bias 1% to the front' },
    effect: { ru: 'Задняя ось стоит на месте при резком торможении по прямой', en: 'The rear stays planted under hard braking in a straight line' },
    limits: { ru: 'Передние колёса блокируются раньше: на пределе отпускайте педаль', en: 'The fronts lock earlier: ease off the pedal at the limit' },
  },
  {
    id: 'DEMO-11', keywords: ['блокировк', 'передн'], direction: 'decrease', parameter: BIAS,
    change: { ru: 'Сместить баланс тормозов назад на 0,5 %', en: 'Move brake bias 0.5% to the rear' },
    effect: { ru: 'Передние колёса реже встают на торможении', en: 'The front wheels lock less often under braking' },
    limits: { ru: 'Задняя ось станет живее на торможении', en: 'The rear gets livelier under braking' },
  },
  {
    id: 'DEMO-12', keywords: ['бордюр'], direction: 'decrease', parameter: { ru: 'быстрое сжатие амортизаторов', en: 'fast bump damping' },
    change: { ru: 'Смягчить быстрое сжатие на 2 щелчка на обеих осях', en: 'Soften fast bump by 2 clicks on both axles' },
    effect: { ru: 'Подвеска мягче проглатывает бордюры', en: 'The suspension soaks up kerbs more softly' },
    limits: { ru: 'Кузов больше качается на неровностях', en: 'More body movement over bumps' },
  },
  {
    id: 'DEMO-13', keywords: ['днищ'], direction: 'increase', parameter: { ru: 'клиренс', en: 'ride height' },
    change: { ru: 'Поднять клиренс на 2 мм спереди и сзади', en: 'Raise ride height by 2 mm front and rear' },
    effect: { ru: 'Днище перестаёт задевать асфальт в компрессиях', en: 'The floor stops hitting the track in compressions' },
    limits: { ru: 'Немного меньше прижима и выше центр тяжести', en: 'A little less downforce and a higher centre of gravity' },
  },
]
