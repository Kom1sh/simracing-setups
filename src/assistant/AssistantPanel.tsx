import { useEffect, useMemo, useRef, useState } from 'react'
import type { Car, ParamGroup, ParamValue, Track, Values } from '../data/types'
import { a } from '../i18n/dashboard'
import { locale } from '../i18n/locale'
import { formatNumber } from '../lib/format'
import { apiBase, requestRecommendations } from './api'
import { findParam, planChange } from './apply'
import { AssistantForm, type AskDraft } from './AssistantForm'
import { AssistantResults } from './AssistantResults'
import { PHASED_SYMPTOMS, type ApiResult, type Recommendation, type RecommendationRequest } from './types'

interface Props {
  car: Car
  track: Track
  conditions: Values
  conditionGroups: ParamGroup[]
  setup: Values
  setupGroups: ParamGroup[]
  onSetValue: (id: string, v: ParamValue) => void
  onEditConditions: () => void
  say: (text: string) => void
}

function optionLabel(groups: ParamGroup[], id: string, value: unknown): string {
  const p = findParam(groups, id)
  return p?.kind === 'choice' ? (p.options.find((o) => o.value === value)?.label ?? String(value)) : String(value)
}

export function AssistantPanel(props: Props) {
  const { car, track, conditions, setup } = props
  const [draft, setDraft] = useState<AskDraft>({ symptom: null, phase: null, speed: 'any', comment: '', sendSetup: true })
  const [errors, setErrors] = useState<{ symptom?: string; phase?: string }>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResult | null>(null)
  const [applied, setApplied] = useState<Record<string, ParamValue>>({})
  const abortRef = useRef<AbortController | null>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const apiUrl = useMemo(() => apiBase(), [])

  useEffect(() => () => abortRef.current?.abort(), [])

  const context = [
    `${car.brand} ${car.model}`,
    track.name,
    `${a.air} ${formatNumber(conditions.airTemp as number)} °C`,
    `${a.track} ${formatNumber(conditions.trackTemp as number)} °C`,
    optionLabel(props.conditionGroups, 'grip', conditions.grip).toLowerCase(),
    optionLabel(props.conditionGroups, 'wetness', conditions.wetness).toLowerCase(),
  ].join(', ')

  /** EGO-01: поля формы и кабинета → тело POST /api/v1/recommendations */
  const buildRequest = (): RecommendationRequest | null => {
    const next: typeof errors = {}
    if (!draft.symptom) next.symptom = a.symptomRequired
    else if (PHASED_SYMPTOMS.includes(draft.symptom) && !draft.phase) next.phase = a.phaseRequired
    setErrors(next)
    if (!draft.symptom || next.phase) return null
    return {
      car_id: car.id,
      car_class: car.category,
      track_id: track.id,
      symptom: draft.symptom,
      corner_phase: PHASED_SYMPTOMS.includes(draft.symptom) ? draft.phase : null,
      corner_speed: draft.speed,
      conditions: {
        air_temp_c: conditions.airTemp as number,
        track_temp_c: conditions.trackTemp as number,
        track_grip: conditions.grip as string,
        wetness: conditions.wetness as string,
        rain_pct: conditions.rain as number,
      },
      setup: draft.sendSetup ? setup : null,
      comment: draft.comment.trim() || null,
      locale,
    }
  }

  const lastRequest = useRef<RecommendationRequest | null>(null)

  const send = async (req: RecommendationRequest) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    lastRequest.current = req
    setLoading(true)
    setApplied({})
    requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }))
    try {
      const res = await requestRecommendations(req, controller.signal)
      setResult(res)
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

  const submit = () => {
    const req = buildRequest()
    if (req) void send(req)
    else formRef.current?.querySelector<HTMLElement>('input[name="symptom"]:checked, input[data-first], .segmented [role="radio"]')?.focus()
  }

  const apply = (rec: Recommendation) => {
    const plan = planChange(props.setupGroups, setup, rec)
    if (!plan.ok) return
    setApplied((s) => ({ ...s, [rec.rule_id]: setup[plan.param.id] }))
    props.onSetValue(plan.param.id, plan.next)
    props.say(a.applied(rec.parameter_label, plan.fromText, plan.toText))
  }

  const undo = (rec: Recommendation) => {
    const prev = applied[rec.rule_id]
    if (prev === undefined) return
    props.onSetValue(rec.parameter, prev)
    setApplied((s) => {
      const next = { ...s }
      delete next[rec.rule_id]
      return next
    })
    props.say(a.undone(rec.parameter_label))
  }

  const edit = () => formRef.current?.querySelector<HTMLElement>('input[name="symptom"]:checked, input[data-first]')?.focus()

  return (
    <div className="assistant">
      <div className="assistant__form" ref={formRef}>
        <AssistantForm
          draft={draft}
          onChange={(patch) => {
            setDraft((d) => ({ ...d, ...patch }))
            setErrors((e) => ({ symptom: patch.symptom ? undefined : e.symptom, phase: patch.phase || patch.symptom ? undefined : e.phase }))
          }}
          errors={errors}
          context={context}
          onEditConditions={props.onEditConditions}
          loading={loading}
          onSubmit={submit}
        />
      </div>
      <AssistantResults
        ref={titleRef}
        loading={loading}
        result={result}
        demo={apiUrl === null}
        apiUrl={apiUrl}
        groups={props.setupGroups}
        setup={setup}
        applied={applied}
        onApply={apply}
        onUndo={undo}
        onRetry={() => lastRequest.current && void send(lastRequest.current)}
        onEdit={edit}
      />
    </div>
  )
}
