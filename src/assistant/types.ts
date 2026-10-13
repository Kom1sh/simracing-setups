/**
 * Контракт POST /api/v1/recommendations — от техлида (KIR-02, api-contract.md).
 * Запрос — одна жалоба свободным текстом; сопоставление на бэкенде — по ключевым словам в условии правила.
 * Как форма собирает этот текст — docs/api-contract.md.
 */

export const SYMPTOM_MIN = 3
export const SYMPTOM_MAX = 500

export interface RecommendationRequest {
  /** Жалоба пилота: участок трассы и фаза поворота — внутри текста, отдельных полей нет */
  symptom: string
}

export interface Recommendation {
  rule_id: string
  /** Каноническое имя параметра из единого словаря (VAR-02), например «давление задних шин» */
  parameter: string
  direction: 'increase' | 'decrease'
  /** Что сделать: «Снизить давление в задних шинах на 1–2 psi» */
  change_description: string
  expected_effect: string
  limitations: string
  /** Основание правила: «VAR-01 / проверено FED-05» */
  basis: string
}

export type RecommendationResponse =
  | { status: 'match'; recommendations: Recommendation[] }
  | { status: 'no_match'; message: string }

export interface ApiError {
  status: 'error'
  error: { code: string; message: string; fields?: Record<string, string> }
}

export type ApiResult =
  | { kind: 'match'; recommendations: Recommendation[]; demo: boolean }
  | { kind: 'no_match'; message: string | null }
  | { kind: 'validation'; message: string | null; fields: { field: string; message: string }[] }
  | { kind: 'server'; status: number; message: string | null }
  | { kind: 'network' }
  | { kind: 'bad_response' }

/** Подсказки в форме: из них собирается текст жалобы, а пилот дописывает своё */
export const SYMPTOMS = ['understeer', 'oversteer', 'braking_instability', 'front_lockup', 'wheelspin', 'kerbs', 'bottoming', 'tyre_overheating'] as const
export type Symptom = (typeof SYMPTOMS)[number]

export const CORNER_PHASES = ['entry', 'mid', 'exit'] as const
export type CornerPhase = (typeof CORNER_PHASES)[number]

export const CORNER_SPEEDS = ['any', 'slow', 'fast'] as const
export type CornerSpeed = (typeof CORNER_SPEEDS)[number]

/**
 * Фразы подсказок уходят на бэкенд по-русски на любом языке сайта: правила и словарь параметров
 * у команды русские, а бэкенд ищет совпадение по словам. Английский ввод пока может не найти правило.
 */
export const PHRASES_RU: { symptoms: Record<Symptom, string>; phases: Record<CornerPhase, string>; speeds: Record<CornerSpeed, string> } = {
  symptoms: {
    understeer: 'недостаточная поворачиваемость',
    oversteer: 'избыточная поворачиваемость',
    braking_instability: 'нестабильность на торможении',
    front_lockup: 'блокировка передних колёс на торможении',
    wheelspin: 'пробуксовка задних колёс на выходе из поворота',
    kerbs: 'машину подбрасывает на бордюрах',
    bottoming: 'машина цепляет днищем',
    tyre_overheating: 'перегрев шин',
  },
  phases: { entry: 'на входе в поворот', mid: 'в середине поворота', exit: 'на выходе из поворота' },
  speeds: { any: '', slow: 'в медленных поворотах', fast: 'в быстрых поворотах' },
}

/** Фаза поворота имеет смысл только для недо- и избыточной поворачиваемости */
export const PHASED_SYMPTOMS: readonly Symptom[] = ['understeer', 'oversteer']

/** Текст жалобы, который уйдёт в поле symptom */
export function composeSymptom(symptom: Symptom | null, phase: CornerPhase | null, speed: CornerSpeed, own: string): string {
  const parts: string[] = []
  if (symptom) {
    const phrase = [PHRASES_RU.symptoms[symptom], phase && PHASED_SYMPTOMS.includes(symptom) ? PHRASES_RU.phases[phase] : '', PHRASES_RU.speeds[speed]]
      .filter(Boolean)
      .join(' ')
    parts.push(phrase.charAt(0).toUpperCase() + phrase.slice(1))
  }
  const text = own.trim()
  if (text) parts.push(text)
  return parts.join('. ')
}
