import { a } from '../i18n/dashboard'
import type { AdviceChange } from './types'

interface Props {
  change: AdviceChange
  /** Название регулировки на языке страницы (из гаража кабинета) */
  label: string
  applied: boolean
  onApply: () => void
}

/** Одна правка: что крутить и насколько, почему, за чем следить, цитата из руководства iRacing */
export function AdviceCard({ change: c, label, applied, onApply }: Props) {
  const titleId = `adv-${c.effect_id}`
  const slot = a.slots[c.slot] ?? ''
  return (
    <article className="rec" aria-labelledby={titleId}>
      <header className="rec__head">
        <h3 id={titleId} className="rec__param">
          {label}
          {slot && <span className="rec__slot">{slot}</span>}
        </h3>
        <p className={`rec__change rec__change--${c.direction}`}>{c.text}</p>
      </header>

      <dl className="rec__body">
        <div>
          <dt>{a.why}</dt>
          <dd>{c.why}</dd>
        </div>
        <div>
          <dt>{a.watch}</dt>
          <dd className="rec__limits">{c.watch}</dd>
        </div>
      </dl>

      <details className="rec__source">
        <summary>
          {a.source}: {c.source.title}
        </summary>
        <blockquote lang="en">{c.source.quote}</blockquote>
        <a href={c.source.url} target="_blank" rel="noreferrer">
          {a.openManual} · PDF
        </a>
      </details>

      <footer className="rec__foot">
        <button type="button" className={applied ? 'button button--ghost is-done' : 'button button--primary'} onClick={onApply} disabled={applied}>
          {applied ? a.applied : a.apply}
        </button>
      </footer>
    </article>
  )
}
