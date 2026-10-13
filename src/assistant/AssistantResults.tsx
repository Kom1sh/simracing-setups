import { forwardRef } from 'react'
import { a } from '../i18n/dashboard'
import type { ParamGroup, Values } from '../data/types'
import { planChange } from './apply'
import { RecommendationCard } from './RecommendationCard'
import type { ApiResult, Recommendation } from './types'

interface Props {
  loading: boolean
  result: ApiResult | null
  demo: boolean
  apiUrl: string | null
  groups: ParamGroup[]
  setup: Values
  applied: Record<string, unknown>
  onApply: (rec: Recommendation) => void
  onUndo: (rec: Recommendation) => void
  onRetry: () => void
  onEdit: () => void
}

/** Правая колонка ассистента: одно из состояний — ожидание, поиск, найдено, не найдено, ошибка */
export const AssistantResults = forwardRef<HTMLHeadingElement, Props>(function AssistantResults(props, titleRef) {
  const { loading, result } = props

  let body: React.ReactNode
  if (loading) {
    body = (
      <div className="answer answer--loading">
        <h2 ref={titleRef} tabIndex={-1} className="answer__title">
          {a.loading}
        </h2>
        <div className="answer__skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    )
  } else if (!result) {
    body = (
      <div className="answer answer--idle">
        <h2 ref={titleRef} tabIndex={-1} className="answer__title">
          {a.idleTitle}
        </h2>
        <p className="answer__text">{a.idleText}</p>
      </div>
    )
  } else if (result.kind === 'found') {
    const recs = result.data.recommendations
    body = (
      <div className="answer answer--found">
        <h2 ref={titleRef} tabIndex={-1} className="answer__title">
          {a.foundTitle(recs.length)}
        </h2>
        <p className="answer__text">{a.foundHint}</p>
        <div className="answer__list">
          {recs.map((rec) => (
            <RecommendationCard
              key={rec.rule_id}
              rec={rec}
              plan={planChange(props.groups, props.setup, rec)}
              applied={rec.rule_id in props.applied}
              onApply={() => props.onApply(rec)}
              onUndo={() => props.onUndo(rec)}
            />
          ))}
        </div>
      </div>
    )
  } else if (result.kind === 'not_found') {
    body = (
      <div className="answer answer--empty">
        <h2 ref={titleRef} tabIndex={-1} className="answer__title">
          {a.notFoundTitle}
        </h2>
        <p className="answer__text">{result.data.message || a.notFoundText}</p>
        <button type="button" className="button button--ghost" onClick={props.onEdit}>
          {a.editRequest}
        </button>
      </div>
    )
  } else {
    const [title, text] =
      result.kind === 'network'
        ? [a.networkTitle, a.networkText]
        : result.kind === 'server'
          ? [a.serverTitle(result.status), a.serverText]
          : result.kind === 'validation'
            ? [a.validationTitle, a.validationText]
            : [a.badResponseTitle, a.badResponseText]
    body = (
      <div className="answer answer--error" role="alert">
        <h2 ref={titleRef} tabIndex={-1} className="answer__title">
          {title}
        </h2>
        <p className="answer__text">{text}</p>
        {result.kind === 'validation' && (
          <ul className="answer__fields">
            {result.fields.map((f, i) => (
              <li key={i}>
                {f.field && <code>{f.field}</code>} {f.message}
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="button button--primary" onClick={result.kind === 'validation' ? props.onEdit : props.onRetry}>
          {result.kind === 'validation' ? a.editRequest : a.retry}
        </button>
      </div>
    )
  }

  return (
    <section className="assistant__results" aria-live="polite" aria-busy={loading}>
      {props.demo ? <p className="assistant__mode">{a.demo}</p> : props.apiUrl && <p className="assistant__mode assistant__mode--live">{a.apiLabel(props.apiUrl)}</p>}
      {body}
    </section>
  )
})
