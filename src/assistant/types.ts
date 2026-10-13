/**
 * Черновик контракта POST /api/v1/recommendations (KIR-02 ещё не утверждён).
 * Поля в snake_case, как их по умолчанию отдаёт FastAPI/Pydantic. Описание — docs/api-contract.md.
 */

export const SYMPTOMS = [
  'understeer',
  'oversteer',
  'braking_instability',
  'front_lockup',
  'wheelspin',
  'kerbs',
  'bottoming',
  'tyre_overheating',
] as const
export type Symptom = (typeof SYMPTOMS)[number]

/** Где в повороте — спрашиваем только для недо- и избыточной поворачиваемости */
export const PHASED_SYMPTOMS: readonly Symptom[] = ['understeer', 'oversteer']

export const CORNER_PHASES = ['entry', 'mid', 'exit'] as const
export type CornerPhase = (typeof CORNER_PHASES)[number]

export const CORNER_SPEEDS = ['any', 'slow', 'fast'] as const
export type CornerSpeed = (typeof CORNER_SPEEDS)[number]

export const COMMENT_MAX = 500

export interface RecommendationRequest {
  car_id: string
  car_class: string
  track_id: string
  symptom: Symptom
  corner_phase: CornerPhase | null
  corner_speed: CornerSpeed
  conditions: {
    air_temp_c: number
    track_temp_c: number
    track_grip: string
    wetness: string
    rain_pct: number
  }
  /** Текущие значения регулировок кабинета; null — пользователь не стал отправлять сетап */
  setup: Record<string, number | number[] | string> | null
  comment: string | null
  locale: 'en' | 'ru'
}

export type ChangeDirection = 'increase' | 'decrease'

export interface Recommendation {
  rule_id: string
  /** id регулировки из шаблона кабинета: arb, brakeBias, diffPreload… */
  parameter: string
  /** Для регулировок по осям и колёсам — какая ось; both — обе; null — одно значение */
  position: 'front' | 'rear' | 'both' | null
  parameter_label: string
  change: {
    direction: ChangeDirection
    /** В единицах самой регулировки, как в гараже: 1 щелчок, 0,5 %, 2 мм */
    amount: number
    /** Подсказка для подписи: click, step, percent, psi, mm, nm, deg */
    unit: string
  }
  effect: string
  limitations: string[]
  explanation: string | null
  verification: 'verified' | 'unverified'
  source: string | null
}

export interface RecommendationResponse {
  status: 'found' | 'not_found'
  recommendations: Recommendation[]
  message: string | null
}

export type ApiResult =
  | { kind: 'found'; data: RecommendationResponse }
  | { kind: 'not_found'; data: RecommendationResponse }
  | { kind: 'validation'; fields: { field: string; message: string }[] }
  | { kind: 'server'; status: number }
  | { kind: 'network' }
  | { kind: 'bad_response' }
