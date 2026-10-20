import { useEffect, useRef, useState } from 'react'
import { a } from '../i18n/dashboard'
import { locale } from '../i18n/locale'
import { api, ApiError } from '../lib/api'
import type { Car, Track, Values } from '../data/types'
import { AdviceForm, type AdviceDraft } from './AdviceForm'
import { AdviceResult, type AdviceError } from './AdviceResult'
import type { Advice, AdviceChange } from './types'

interface Props {
  car: Car
  track: Track
  conditions: Values
  setup: Values
  setupId: string | null
  /** Названия регулировок гаража на языке страницы */
  labels: Record<string, string>
  onApply: (change: AdviceChange) => void
}

/** ИИ-ассистент: описание проблемы + контекст кабинета → POST /api/v2/advice → правки с источниками, «Применить», отзыв */
export function AssistantPanel({ car, track, conditions, setup, setupId, labels, onApply }: Props) {
  const [draft, setDraft] = useState<AdviceDraft>({ text: '', symptom: null, phase: null, when: 'any' })
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState<Advice | null>(null)
  const [error, setError] = useState<AdviceError>(null)
  const [applied, setApplied] = useState<Set<string>>(new Set())
  const abortRef = useRef<AbortController | null>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  const send = async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError(null)
    requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }))
    try {
      const body = { car_id: car.id, track_id: track.id, text: draft.text.trim(), symptom: draft.symptom, phase: draft.phase, when: draft.when, conditions, setup, setup_id: setupId, lang: locale }
      const r = await api<Advice>('/api/v2/advice', { method: 'POST', body, signal: controller.signal, timeoutMs: 90_000 })
      setAdvice(r)
      setApplied(new Set())
    } catch (e) {
      if (controller.signal.aborted && !(e instanceof ApiError)) return
      setAdvice(null)
      setError(e instanceof ApiError ? (e.status === 429 ? 'limit' : e.status === 401 ? 'auth' : 'network') : 'network')
    } finally {
      if (abortRef.current === controller) setLoading(false)
    }
    requestAnimationFrame(() => {
      titleRef.current?.focus({ preventScroll: true })
      if (window.matchMedia('(max-width: 1180px)').matches) titleRef.current?.scrollIntoView({ block: 'start' })
    })
  }

  const submit = () => {
    if (!draft.symptom && draft.text.trim().length < 5) {
      setFormError(a.textRequired)
      return
    }
    setFormError(null)
    void send()
  }

  const apply = (effectId: string) => {
    const change = advice?.changes.find((c) => c.effect_id === effectId)
    if (!change) return
    onApply(change)
    setApplied((s) => new Set(s).add(effectId))
  }

  const feedback = async (result: 'better' | 'same' | 'worse') => {
    if (!advice) return
    setAdvice({ ...advice, feedback: result })
    try {
      await api(`/api/v2/advice/${advice.id}/feedback`, { method: 'POST', body: { result, applied: applied.size > 0 } })
    } catch {
      // отзыв не критичен: при ошибке просто не учтётся
    }
  }

  return (
    <div className="assistant">
      <div className="assistant__form">
        <AdviceForm
          carName={`${car.brand} ${car.model}`}
          trackName={track.name}
          draft={draft}
          error={formError}
          loading={loading}
          onChange={(patch) => {
            setDraft((d) => ({ ...d, ...patch }))
            if (formError) setFormError(null)
          }}
          onSubmit={submit}
        />
      </div>
      <AdviceResult ref={titleRef} loading={loading} advice={advice} error={error} labels={labels} applied={applied} onApply={apply} onFeedback={feedback} onRetry={() => void send()} />
    </div>
  )
}
