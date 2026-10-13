import { formatNumber } from '../lib/format'
import { a } from '../i18n/dashboard'
import { locale } from '../i18n/locale'
import type { Plan } from './apply'
import type { Recommendation } from './types'

const UNITS: Record<string, [string, string]> = {
  percent: ['%', '%'],
  psi: ['psi', 'psi'],
  mm: ['мм', 'mm'],
  nm: ['Нм', 'Nm'],
  deg: ['°', '°'],
}

/** «−1 щелчок», «+0,5 %», «+2 мм» */
export function changeText(rec: Recommendation): string {
  const { amount, unit, direction } = rec.change
  const sign = direction === 'increase' ? '+' : '−'
  const n = Math.abs(amount)
  if (unit === 'click') return `${sign}${a.clicks(n)}`
  if (unit === 'step') return `${sign}${a.steps(n)}`
  const u = UNITS[unit]?.[locale === 'ru' ? 0 : 1] ?? unit
  const num = formatNumber(n, Number.isInteger(n) ? 0 : 1)
  return u === '°' ? `${sign}${num}°` : `${sign}${num} ${u}`
}

interface Props {
  rec: Recommendation
  plan: Plan
  applied: boolean
  onApply: () => void
  onUndo: () => void
}

export function RecommendationCard({ rec, plan, applied, onApply, onUndo }: Props) {
  const titleId = `rec-${rec.rule_id}`
  return (
    <article className="rec" aria-labelledby={titleId}>
      <header className="rec__head">
        <h3 id={titleId} className="rec__param">
          {rec.parameter_label}
        </h3>
        <p className="rec__change">{changeText(rec)}</p>
        {plan.ok && (
          <p className="rec__values">
            <s>{plan.fromText}</s> {plan.toText}
          </p>
        )}
      </header>

      <dl className="rec__body">
        <div>
          <dt>{a.effect}</dt>
          <dd>{rec.effect}</dd>
        </div>
        {rec.limitations.length > 0 && (
          <div>
            <dt>{a.limits}</dt>
            <dd>
              <ul className="rec__limits">
                {rec.limitations.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {rec.explanation && (
          <div>
            <dt>{a.why}</dt>
            <dd>{rec.explanation}</dd>
          </div>
        )}
      </dl>

      <footer className="rec__foot">
        <p className="rec__meta">
          <span className={rec.verification === 'verified' ? 'rec__status is-verified' : 'rec__status'}>{rec.verification === 'verified' ? a.verified : a.unverified}</span>
          <span>{a.rule(rec.rule_id)}</span>
          {rec.source && (
            <span>
              {a.source}: {rec.source}
            </span>
          )}
        </p>
        <div className="rec__actions">
          {applied ? (
            <button type="button" className="button button--ghost button--sm" onClick={onUndo}>
              {a.undo}
            </button>
          ) : plan.ok ? (
            <button type="button" className="button button--primary button--sm" onClick={onApply}>
              {a.apply}
            </button>
          ) : (
            <p className="rec__na">{plan.reason === 'at_limit' ? a.atLimit : a.notInSetup}</p>
          )}
        </div>
      </footer>
    </article>
  )
}
