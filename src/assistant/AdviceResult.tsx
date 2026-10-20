import { forwardRef, type ReactNode } from 'react'
import { a } from '../i18n/dashboard'
import { AdviceCard } from './AdviceCard'
import type { Advice } from './types'

export type AdviceError = 'network' | 'limit' | 'auth' | null

interface Props {
  loading: boolean
  advice: Advice | null
  error: AdviceError
  labels: Record<string, string>
  applied: Set<string>
  onApply: (effectId: string) => void
  onFeedback: (result: 'better' | 'same' | 'worse') => void
  onRetry: () => void
}

export const AdviceResult = forwardRef<HTMLHeadingElement, Props>(function AdviceResult({ loading, advice, error, labels, applied, onApply, onFeedback, onRetry }, titleRef) {
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
  } else if (error) {
    body = (
      <div className="answer answer--error" role="alert">
        {title(a.errorTitle)}
        <p className="answer__text">{error === 'limit' ? a.limitText : error === 'auth' ? a.authText : a.networkText}</p>
        {error === 'network' && (
          <button type="button" className="button button--primary" onClick={onRetry}>
            {a.retry}
          </button>
        )}
      </div>
    )
  } else if (!advice) {
    body = (
      <div className="answer answer--idle">
        {title(a.idleTitle)}
        <p className="answer__text">{a.idleText}</p>
      </div>
    )
  } else {
    const d = advice.diagnosis
    body = (
      <div className={`answer answer--${advice.status}`}>
        <p className="answer__mode">{advice.mode === 'ai' ? a.modeAi(advice.model ?? '') : a.modeRules}</p>
        {title(advice.status === 'advice' ? a.adviceTitle : advice.status === 'question' ? a.questionTitle : a.unknownTitle)}
        {d && <p className="answer__meta">{a.diagnosis(a.symptoms[d.symptom], a.phases[d.phase])}</p>}
        {(advice.status === 'question' ? advice.question : advice.summary) && <p className="answer__text">{advice.status === 'question' ? advice.question : advice.summary}</p>}
        {advice.changes.length > 0 && (
          <div className="answer__list">
            {advice.changes.map((c) => (
              <AdviceCard key={c.effect_id} change={c} label={labels[c.param] ?? c.label} applied={applied.has(c.effect_id)} onApply={() => onApply(c.effect_id)} />
            ))}
          </div>
        )}
        {advice.check && (
          <p className="answer__check">
            <strong>{a.check}:</strong> {advice.check}
          </p>
        )}
        {advice.status === 'advice' && (
          <div className="feedback" role="group" aria-label={a.feedbackQ}>
            {advice.feedback ? (
              <p className="feedback__thanks">{a.thanks}</p>
            ) : (
              <>
                <p className="feedback__q">{a.feedbackQ}</p>
                <div className="feedback__buttons">
                  {(['better', 'same', 'worse'] as const).map((r) => (
                    <button key={r} type="button" className="button button--ghost" onClick={() => onFeedback(r)}>
                      {a[r]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        {advice.remaining_today !== undefined && <p className="answer__meta">{a.remaining(advice.remaining_today)}</p>}
      </div>
    )
  }

  return (
    <section className="assistant__results" aria-live="polite" aria-busy={loading}>
      {body}
    </section>
  )
})
