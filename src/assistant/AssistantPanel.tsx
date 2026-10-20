import { useEffect, useMemo, useRef, useState } from 'react'
import { a } from '../i18n/dashboard'
import { apiBase, requestRecommendations } from './api'
import { AssistantForm, type AskDraft, type AskErrors } from './AssistantForm'
import { AssistantResults } from './AssistantResults'
import { CARS, COMMENT_MAX, COMMENT_MIN, TRACKS, type ApiResult, type RecommendationRequest } from './types'

/** EGO-04: форма → POST /api/v1/recommendations (ALE-03) → состояния ответа и карточки рекомендаций */
export function AssistantPanel() {
  const [draft, setDraft] = useState<AskDraft>({ car: CARS[0], track: TRACKS[0], symptom: null, phase: null, stint: 'any', comment: '' })
  const [errors, setErrors] = useState<AskErrors>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResult | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const lastRequest = useRef<RecommendationRequest | null>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const apiUrl = useMemo(() => apiBase(), [])

  useEffect(() => () => abortRef.current?.abort(), [])

  const send = async (req: RecommendationRequest) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    lastRequest.current = req
    setLoading(true)
    requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }))
    try {
      setResult(await requestRecommendations(req, controller.signal))
    } catch {
      return // запрос отменён новым
    } finally {
      if (abortRef.current === controller) setLoading(false)
    }
    requestAnimationFrame(() => {
      titleRef.current?.focus({ preventScroll: true })
      if (window.matchMedia('(max-width: 1180px)').matches) titleRef.current?.scrollIntoView({ block: 'start' })
    })
  }

  /** Проверка до отправки — те же правила, что у бэкенда: симптом и фаза обязательны, комментарий 3–500 знаков */
  const submit = () => {
    const comment = draft.comment.trim()
    const next: AskErrors = {}
    if (!draft.symptom) next.symptom = a.symptomRequired
    if (!draft.phase) next.phase = a.phaseRequired
    if (comment.length < COMMENT_MIN || comment.length > COMMENT_MAX) next.comment = a.commentRequired
    setErrors(next)
    if (!draft.symptom || !draft.phase || next.comment) {
      const form = formRef.current
      const target = next.symptom ? form?.querySelector<HTMLElement>('input[name="symptom"]') : next.phase ? form?.querySelector<HTMLElement>('[data-field="phase"] [role="radio"]') : form?.querySelector<HTMLElement>('textarea')
      target?.focus()
      return
    }
    void send({
      car: draft.car,
      track: draft.track,
      symptom_type: draft.symptom,
      corner_phase: draft.phase,
      comment,
      stint_moment: draft.stint === 'any' ? null : draft.stint,
    })
  }

  const edit = () => formRef.current?.querySelector<HTMLElement>('input[name="symptom"]:checked, input[name="symptom"]')?.focus()

  return (
    <div className="assistant">
      <div className="assistant__form" ref={formRef}>
        <AssistantForm
          draft={draft}
          onChange={(patch) => {
            setDraft((d) => ({ ...d, ...patch }))
            setErrors((e) => ({
              symptom: patch.symptom ? undefined : e.symptom,
              phase: patch.phase ? undefined : e.phase,
              comment: patch.comment !== undefined ? undefined : e.comment,
            }))
          }}
          errors={errors}
          loading={loading}
          onSubmit={submit}
        />
      </div>
      <AssistantResults ref={titleRef} loading={loading} result={result} apiUrl={apiUrl} onRetry={() => lastRequest.current && void send(lastRequest.current)} onEdit={edit} />
    </div>
  )
}
