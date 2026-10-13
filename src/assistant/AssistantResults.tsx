import { forwardRef, type ReactNode } from 'react'
import { a } from '../i18n/dashboard'
import { RecommendationCard } from './RecommendationCard'
import type { ApiResult } from './types'

interface Props {
  loading: boolean
  result: ApiResult | null
  apiUrl: string | null
  onRetry: () => void
  onEdit: () => void
}

/** EGO-02: правая колонка — ожидание, поиск, найдено, правила нет, ошибка */
export const AssistantResults = forwardRef<HTMLHeadingElement, Props>(function AssistantResults({ loading, result, apiUrl, onRetry, onEdit }, titleRef) {
  const title = (text: string) => (
    <h2 ref={titleRef} tabIndex={-1} className="answer__title">
      {text}
    </h2>
  )

  let body: ReactNode
  if (loading) {
    body = (
      <div className="answer answer--loading">
        {title(a.loading)}
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
        {title(a.idleTitle)}
        <p className="answer__text">{a.idleText}</p>
      </div>
    )
  } else if (result.kind === 'match') {
    body = (
      <div className="answer answer--found">
        {title(a.foundTitle(result.recommendations.length))}
        <p className="answer__text">{a.foundHint}</p>
        <div className="answer__list">
          {result.recommendations.map((rec) => (
            <RecommendationCard key={rec.rule_id} rec={rec} demo={result.demo} />
          ))}
        </div>
      </div>
    )
  } else if (result.kind === 'no_match') {
    body = (
      <div className="answer answer--empty">
        {title(a.notFoundTitle)}
        <p className="answer__text">{result.message || a.notFoundText}</p>
        <button type="button" className="button button--ghost" onClick={onEdit}>
          {a.editRequest}
        </button>
      </div>
    )
  } else {
    const [heading, text] =
      result.kind === 'network'
        ? [a.networkTitle, a.networkText]
        : result.kind === 'server'
          ? [a.serverTitle(result.status), result.message || a.serverText]
          : result.kind === 'validation'
            ? [a.validationTitle, result.message || a.validationText]
            : [a.badResponseTitle, a.badResponseText]
    body = (
      <div className="answer answer--error" role="alert">
        {title(heading)}
        <p className="answer__text">{text}</p>
        {result.kind === 'validation' && result.fields.length > 0 && (
          <ul className="answer__fields">
            {result.fields.map((f, i) => (
              <li key={i}>
                {f.field && <code>{f.field}</code>} {f.message}
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="button button--primary" onClick={result.kind === 'validation' ? onEdit : onRetry}>
          {result.kind === 'validation' ? a.editRequest : a.retry}
        </button>
      </div>
    )
  }

  return (
    <section className="assistant__results" aria-live="polite" aria-busy={loading}>
      {apiUrl ? <p className="assistant__mode assistant__mode--live">{a.apiLabel(apiUrl)}</p> : <p className="assistant__mode">{a.demo}</p>}
      {body}
    </section>
  )
})
