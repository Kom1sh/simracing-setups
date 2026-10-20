/** Ответ ИИ-ассистента: POST /api/v2/advice (backend/app/routers/advice.py) */

export type Symptom = 'understeer' | 'oversteer' | 'lockup' | 'wheelspin'
export type Phase = 'entry' | 'mid' | 'exit'
export type When = 'any' | 'from_start' | 'after_laps'

export const SYMPTOMS: Symptom[] = ['understeer', 'oversteer', 'lockup', 'wheelspin']
export const PHASES: Phase[] = ['entry', 'mid', 'exit']
export const WHENS: When[] = ['any', 'from_start', 'after_laps']
export const TEXT_MAX = 1000

export interface AdviceChange {
  effect_id: string
  param: string
  label: string
  slot: string
  direction: 'increase' | 'decrease'
  steps: number
  /** Числовая правка от текущего значения; у выбора из списка — from → to */
  delta?: number
  indexes?: number[]
  from?: string
  to?: string
  unit: string
  text: string
  why: string
  watch: string
  effect: string
  tradeoff: string
  source: { manual: string; title: string; url: string; quote: string }
}

export interface Advice {
  id: string
  status: 'advice' | 'question' | 'unknown'
  mode: 'ai' | 'rules'
  model: string | null
  summary: string
  question: string
  check: string
  changes: AdviceChange[]
  diagnosis: { symptom: Symptom; phase: Phase; when: string; speed: string } | null
  feedback: 'better' | 'same' | 'worse' | null
  remaining_today?: number
}
