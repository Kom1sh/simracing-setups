/**
 * Контракт POST /api/v1/recommendations — версия ALE-03 (форма из шести полей),
 * по ней сделан бэкенд Родиона. Правило подбирается по symptom_type, corner_phase и stint_moment,
 * затем car и track должны точно совпасть со списком применимости правила; comment только сохраняется.
 */

export const COMMENT_MIN = 3
export const COMMENT_MAX = 500

export const SYMPTOM_TYPES = ['understeer', 'oversteer'] as const
export type SymptomType = (typeof SYMPTOM_TYPES)[number]

export const CORNER_PHASES = ['entry', 'mid', 'exit'] as const
export type CornerPhase = (typeof CORNER_PHASES)[number]

export const STINT_MOMENTS = ['from_start', 'after_laps'] as const
export type StintMoment = (typeof STINT_MOMENTS)[number]

/**
 * Машины и трассы MVP: одна машина на овалах iRacing. Строки должны буквально совпадать
 * с applicability в правилах базы — менять только вместе со справочником команды (VAR-02).
 */
/**
 * Как машина называется в правилах бэкенда (applicability.car). Правила пишутся на класс NASCAR Next Gen,
 * а не на каждую из трёх машин; для остальных — имя машины в iRacing. Трасса — имя трассы в iRacing.
 */
export const NEXT_GEN_RULES_NAME = 'NASCAR Cup Series Next Gen (Gen 7)'

export interface RecommendationRequest {
  car: string
  track: string
  symptom_type: SymptomType
  corner_phase: CornerPhase
  comment: string
  stint_moment: StintMoment | null
}

export interface Recommendation {
  rule_id: string
  /** Каноническое имя параметра из словаря (VAR-02), например front_brake_bias_pct */
  parameter: string
  direction: 'increase' | 'decrease'
  change_description: string
  expected_effect: string
  limitations: string
  basis: string
}

export interface ApiError {
  status: 'error'
  error: { code: string; message: string; fields?: Record<string, string> }
}

export type ApiResult =
  | { kind: 'match'; requestId: string | null; recommendations: Recommendation[] }
  | { kind: 'no_match'; requestId: string | null; message: string | null }
  | { kind: 'validation'; message: string | null; fields: { field: string; message: string }[] }
  | { kind: 'server'; status: number; message: string | null }
  | { kind: 'network' }
  | { kind: 'bad_response' }
