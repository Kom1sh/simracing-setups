import { useEffect, useMemo, useRef, useState } from 'react'
import { a } from '../i18n/dashboard'
import { apiBase, requestRecommendations } from './api'
import { AssistantForm, type AskDraft } from './AssistantForm'
import { AssistantResults } from './AssistantResults'
import { composeSymptom, SYMPTOM_MAX, SYMPTOM_MIN, type ApiResult, type RecommendationRequest } from './types'

/** EGO-04: форма → POST /api/v1/recommendations → состояния ответа и карточки рекомендаций */
export function AssistantPanel() {
  const [draft, setDraft] = useState<AskDraft>({ symptom: null, phase: null, speed: 'any', comment: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResult | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const lastRequest = useRef<RecommendationRequest | null>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const apiUrl = useMemo(() => apiBase(), [])
  const composed = composeSymptom(draft.symptom, draft.phase, draft.speed, draft.comment)

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

  /** Проверка формы до отправки — те же границы 3–500 знаков, что у бэкенда */
  const submit = () => {
    const text = composed.trim()
    const problem = text.length < SYMPTOM_MIN ? a.textRequired : text.length > SYMPTOM_MAX ? a.tooLong(text.length - SYMPTOM_MAX) : null
    setError(problem)
    if (problem) {
      formRef.current?.querySelector<HTMLElement>('textarea')?.focus()
      return
    }
    void send({ symptom: text })
  }

  const edit = () => formRef.current?.querySelector<HTMLElement>('textarea')?.focus()

  return (
    <div className="assistant">
      <div className="assistant__form" ref={formRef}>
        <AssistantForm
          draft={draft}
          onChange={(patch) => {
            setDraft((d) => ({ ...d, ...patch }))
            setError(null)
          }}
          composed={composed}
          error={error}
          loading={loading}
          onSubmit={submit}
        />
      </div>
      <AssistantResults ref={titleRef} loading={loading} result={result} apiUrl={apiUrl} onRetry={() => lastRequest.current && void send(lastRequest.current)} onEdit={edit} />
    </div>
  )
}
