import { useEffect, useMemo, useRef, useState } from 'react'
import { a } from '../i18n/dashboard'
import { checkHealth, customApi, requestRecommendations } from './api'
import { AssistantForm, type AskDraft, type AskErrors } from './AssistantForm'
import { AssistantResults, type Health } from './AssistantResults'
import type { Car, Track } from '../data/types'
import { COMMENT_MAX, COMMENT_MIN, NEXT_GEN_RULES_NAME, type ApiResult, type RecommendationRequest } from './types'

/** EGO-04: машина и трасса из шапки + форма → POST /api/v1/recommendations (ALE-03) → состояния ответа и карточки */
export function AssistantPanel({ car, track }: { car: Car; track: Track }) {
  const [draft, setDraft] = useState<AskDraft>({ symptom: null, phase: null, stint: 'any', comment: '' })
  // Имена, по которым бэкенд ищет правило: класс Next Gen целиком, остальные машины и трассы — как в iRacing
  const carForRules = car.category === 'nascar' ? NEXT_GEN_RULES_NAME : car.iracing.name
  const trackForRules = track.iracing.name
  const covered = car.category === 'nascar' && track.kind === 'oval'
  const [errors, setErrors] = useState<AskErrors>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResult | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const lastRequest = useRef<RecommendationRequest | null>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const custom = useMemo(() => customApi(), [])
  const [health, setHealth] = useState<Health>('checking')

  useEffect(() => () => abortRef.current?.abort(), [])

  // Связь с сервером видна сразу, до первого запроса
  useEffect(() => {
    const controller = new AbortController()
    checkHealth(controller.signal).then((ok) => setHealth(ok ? 'online' : 'offline'), () => {})
    return () => controller.abort()
  }, [])

  const send = async (req: RecommendationRequest) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    lastRequest.current = req
    setLoading(true)
    requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }))
    try {
      const next = await requestRecommendations(req, controller.signal)
      setResult(next)
      setHealth(next.kind === 'network' ? 'offline' : 'online')
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
      car: carForRules,
      track: trackForRules,
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
          carName={`${car.brand} ${car.model}`}
          trackName={track.name}
          covered={covered}
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
      <AssistantResults ref={titleRef} loading={loading} result={result} health={health} customApi={custom} onRetry={() => lastRequest.current && void send(lastRequest.current)} onEdit={edit} />
    </div>
  )
}
