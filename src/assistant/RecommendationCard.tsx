import { a } from '../i18n/dashboard'
import { paramLabel } from './params'
import type { Recommendation } from './types'

/** EGO-03: одна рекомендация из ответа — всё, что прислал бэкенд, без своей логики */
export function RecommendationCard({ rec, demo }: { rec: Recommendation; demo: boolean }) {
  const titleId = `rec-${rec.rule_id}`
  return (
    <article className="rec" aria-labelledby={titleId}>
      <header className="rec__head">
        <h3 id={titleId} className="rec__param">
          {paramLabel(rec.parameter)}
        </h3>
        <p className={`rec__change rec__change--${rec.direction}`}>{a.direction[rec.direction]}</p>
        <p className="rec__what">{rec.change_description}</p>
      </header>

      <dl className="rec__body">
        <div>
          <dt>{a.effect}</dt>
          <dd>{rec.expected_effect}</dd>
        </div>
        {rec.limitations && (
          <div>
            <dt>{a.limits}</dt>
            <dd className="rec__limits">{rec.limitations}</dd>
          </div>
        )}
      </dl>

      <footer className="rec__foot">
        <p className="rec__meta">
          <span className={demo ? 'rec__status' : 'rec__status is-verified'}>{demo ? a.demoRule : a.checked}</span>
          <span>{a.rule(rec.rule_id)}</span>
          {rec.basis && (
            <span>
              {a.basis}: {rec.basis}
            </span>
          )}
        </p>
      </footer>
    </article>
  )
}
