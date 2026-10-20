import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { Change } from '../lib/params'
import { slotName } from '../lib/params'
import { formatNumber, formatSigned } from '../lib/format'
import { api } from '../lib/api'
import { locale } from '../i18n/locale'
import { a, t, w } from '../i18n/dashboard'
import type { Advice } from '../assistant/types'

type Rating = NonNullable<Advice['feedback']>
type HistoryItem = Advice & { created_at: string }

const RATINGS: Rating[] = ['better', 'same', 'worse']
const dateFormat = new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

interface Props {
  carId: string
  trackId: string
  carName: string
  trackName: string
  changes: Change[]
  totalParams: number
  /** Названия регулировок гаража на языке страницы — для правок в истории советов */
  labels: Record<string, string>
  onReset: (change: Change) => void
  onResetAll: () => void
  onOpenGroup: (groupId: string) => void
  onAsk: () => void
  garageOpen: boolean
  onGarageToggle: () => void
  garage: ReactNode
}

function valueText(c: Change, v: unknown) {
  if (c.param.kind === 'choice') return c.param.options.find((o) => o.value === v)?.label ?? String(v)
  const decimals = 'decimals' in c.param ? c.param.decimals : 0
  return typeof v === 'number' ? formatNumber(v, decimals) : String(v)
}

function ChangeValue({ c }: { c: Change }) {
  if (c.param.relative) {
    const decimals = 'decimals' in c.param ? c.param.decimals : 0
    return <>{`${formatSigned(c.to as number, decimals)}${c.param.unit ? ` ${c.param.unit}` : ''}`}</>
  }
  return (
    <>
      <s>{valueText(c, c.from)}</s> {valueText(c, c.to)}
    </>
  )
}

/** «Мой сетап»: правки от базового сетапа, советы ассистента для этой пары с отзывами, полный гараж — по кнопке */
export function SetupTab(props: Props) {
  const { changes } = props
  const garageId = useId()
  const titleRef = useRef<HTMLHeadingElement>(null)

  // Строка со сброшенной правкой исчезает — фокус переводим на заголовок списка, а не теряем
  const reset = (c: Change) => {
    props.onReset(c)
    titleRef.current?.focus()
  }

  return (
    <div className="my-setup">
      <p className="settings__intro">{t.setupIntro(props.carName)}</p>

      <section className="my-setup__block" aria-labelledby="my-setup-changes">
        <h2 id="my-setup-changes" ref={titleRef} tabIndex={-1} className="my-setup__title">
          {t.changesTitle}
        </h2>
        <p className="my-setup__sub">{changes.length === 0 ? t.changesEmpty : w.changedOf(changes.length, props.totalParams)}</p>
        {changes.length > 0 && (
          <>
            <ul className="edits">
              {changes.map((c) => {
                const name = c.index !== undefined ? `${c.param.label} ${slotName(c.param, c.index)}` : c.param.label
                return (
                  <li key={`${c.param.id}-${c.index ?? 0}`} className="edits__row">
                    <button type="button" className="edits__name" onClick={() => props.onOpenGroup(c.group.id)}>
                      {c.param.label}
                      {c.index !== undefined && <span className="changes__slot">{slotName(c.param, c.index)}</span>}
                    </button>
                    <span className="changes__values">
                      <ChangeValue c={c} />
                    </span>
                    <button type="button" className="text-button edits__reset" aria-label={t.resetOne(name)} onClick={() => reset(c)}>
                      {t.resetShort}
                    </button>
                  </li>
                )
              })}
            </ul>
            <button type="button" className="text-button my-setup__more" onClick={props.onResetAll}>
              {w.resetAll}
            </button>
          </>
        )}
      </section>

      <AdviceHistory key={`${props.carId}:${props.trackId}`} {...props} />

      <section className="my-setup__block my-setup__block--garage">
        <button type="button" className="garage-toggle" aria-expanded={props.garageOpen} aria-controls={garageId} onClick={props.onGarageToggle}>
          <span className="my-setup__title">{t.garageTitle}</span>
          <span className="garage-toggle__hint">{props.garageOpen ? t.garageHide : t.garageHint(props.totalParams)}</span>
        </button>
        <div id={garageId} hidden={!props.garageOpen}>
          {props.garageOpen && props.garage}
        </div>
      </section>
    </div>
  )
}

/** Советы ассистента для текущей машины и трассы: что предложил и помогло ли. Отзыв можно поменять */
function AdviceHistory({ carId, trackId, carName, trackName, labels, onAsk }: Props) {
  const [items, setItems] = useState<HistoryItem[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    api<{ advice: HistoryItem[] }>(`/api/v2/advice?car_id=${encodeURIComponent(carId)}&track_id=${encodeURIComponent(trackId)}`, { signal: controller.signal })
      .then((r) => setItems(r.advice))
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [carId, trackId])

  const rate = async (id: string, result: Rating) => {
    setItems((list) => list && list.map((h) => (h.id === id ? { ...h, feedback: result } : h)))
    try {
      await api(`/api/v2/advice/${id}/feedback`, { method: 'POST', body: { result } })
    } catch {
      // отзыв не критичен: при ошибке просто не учтётся
    }
  }

  return (
    <section className="my-setup__block" aria-labelledby="my-setup-history" aria-busy={items === null && !failed}>
      <h2 id="my-setup-history" className="my-setup__title">
        {t.historyTitle}
      </h2>
      <p className="my-setup__sub">{t.historyIntro(carName, trackName)}</p>
      {failed ? (
        <p className="my-setup__sub">{t.historyFailed}</p>
      ) : items === null ? (
        <p className="my-setup__sub">{t.historyLoading}</p>
      ) : items.length === 0 ? (
        <div className="my-setup__empty">
          <p>{t.historyEmpty}</p>
          <button type="button" className="button button--ghost" onClick={onAsk}>
            {t.askAssistant}
          </button>
        </div>
      ) : (
        <ol className="history">
          {items.map((h) => (
            <li key={h.id} className="history__item">
              <p className="history__meta">
                {dateFormat.format(new Date(h.created_at))}
                {h.diagnosis && ` · ${a.diagnosis(a.symptoms[h.diagnosis.symptom], a.phases[h.diagnosis.phase])}`}
              </p>
              {h.changes.length > 0 ? (
                <ul className="history__changes">
                  {h.changes.map((c) => (
                    <li key={c.effect_id}>
                      <strong>{labels[c.param] ?? c.label}</strong> {c.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="history__text">{h.status === 'question' ? h.question : h.summary}</p>
              )}
              {h.status === 'advice' && (
                <div className="history__rate" role="group" aria-label={a.feedbackQ}>
                  <span className="history__q">{h.feedback ? t.rated : a.feedbackQ}</span>
                  {RATINGS.map((r) => (
                    <button key={r} type="button" className={h.feedback === r ? 'chip is-on' : 'chip'} aria-pressed={h.feedback === r} onClick={() => void rate(h.id, r)}>
                      {a[r]}
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
