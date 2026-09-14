import { useId, useRef, useState } from 'react'
import type { Check } from '../lib/checks'
import type { FuelPlan } from '../lib/fuel'
import type { Change } from '../lib/params'
import { slotName } from '../lib/params'
import { formatDuration, formatNumber, plural } from '../lib/format'

interface Props {
  name: string
  onNameChange: (v: string) => void
  changes: Change[]
  totalParams: number
  onResetAll: () => void
  onOpenChange: (groupId: string) => void
  lapTime: string
  perLap: string
  onLapTime: (v: string) => void
  onPerLap: (v: string) => void
  lapValid: boolean
  perLapValid: boolean
  plan: FuelPlan | null
  durationMin: number
  pitStops: number
  isRace: boolean
  fuelLoaded: number
  onFill: (litres: number) => void
  checks: Check[]
  onSave: () => void
  onExport: () => void
  onImport: (file: File) => void
}

function valueText(v: unknown, decimals: number) {
  return typeof v === 'number' ? formatNumber(v, decimals) : String(v)
}

export function Summary(props: Props) {
  const { changes, plan } = props
  const nameId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [showAll, setShowAll] = useState(false)
  const visibleChanges = showAll ? changes : changes.slice(0, 6)

  return (
    <aside className="summary" aria-label="Сводка сетапа">
      <div className="summary__block">
        <label className="summary__label" htmlFor={nameId}>
          Название сетапа
        </label>
        <textarea
          id={nameId}
          className="text-input text-input--name"
          rows={2}
          value={props.name}
          maxLength={80}
          onChange={(e) => props.onNameChange(e.target.value.replace(/\n/g, ' '))}
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
        />
      </div>

      <div className="summary__block">
        <h3 className="summary__title">
          {changes.length === 0 ? 'Сетап как в базе' : `Изменено ${changes.length} ${plural(changes.length, 'значение', 'значения', 'значений')} из ${props.totalParams}`}
        </h3>
        {changes.length === 0 ? (
          <p className="summary__muted">Меняйте регулировки во вкладке «Машина» — изменения появятся здесь.</p>
        ) : (
          <>
            <ul className="changes">
              {visibleChanges.map((c) => {
                const decimals = 'decimals' in c.param ? c.param.decimals : 0
                const choice = c.param.kind === 'choice' ? c.param.options : null
                const label = (v: unknown) => (choice ? (choice.find((o) => o.value === v)?.label ?? String(v)) : valueText(v, decimals))
                return (
                  <li key={`${c.param.id}-${c.index ?? 0}`}>
                    <button type="button" className="changes__item" onClick={() => props.onOpenChange(c.group.id)}>
                      <span className="changes__name">
                        {c.param.label}
                        {c.index !== undefined && <span className="changes__slot">{slotName(c.param, c.index)}</span>}
                      </span>
                      <span className="changes__values">
                        <s>{label(c.from)}</s> {label(c.to)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className="summary__row">
              {changes.length > 6 && (
                <button type="button" className="text-button" onClick={() => setShowAll(!showAll)}>
                  {showAll ? 'Свернуть' : `Показать все ${changes.length}`}
                </button>
              )}
              <button type="button" className="text-button" onClick={props.onResetAll}>
                Вернуть всё к базе
              </button>
            </div>
          </>
        )}
      </div>

      <div className="summary__block">
        <h3 className="summary__title">Топливо на гонку</h3>
        <div className="fuel-inputs">
          <label className="field">
            <span>Время круга</span>
            <input className={props.lapValid ? 'text-input' : 'text-input is-invalid'} inputMode="decimal" placeholder="1:58,400" value={props.lapTime} onChange={(e) => props.onLapTime(e.target.value)} />
          </label>
          <label className="field">
            <span>Расход за круг, л</span>
            <input className={props.perLapValid ? 'text-input' : 'text-input is-invalid'} inputMode="decimal" placeholder="3,2" value={props.perLap} onChange={(e) => props.onPerLap(e.target.value)} />
          </label>
        </div>
        {!plan && (
          <p className="summary__muted">
            {props.lapValid && props.perLapValid
              ? 'Впишите время круга и расход — посчитаем, сколько залить.'
              : 'Время круга пишется как 1:58,400, расход — числом, например 3,2.'}
          </p>
        )}
        {plan && (
          <div className="fuel-plan">
            <p>
              За {formatDuration(props.durationMin)} — <strong>{plan.laps}</strong> {plural(plan.laps, 'круг', 'круга', 'кругов')}, с кругом запаса нужно{' '}
              <strong>{formatNumber(plan.total)} л</strong>.
            </p>
            {props.pitStops > 0 && (
              <p className="summary__muted">
                {props.pitStops === 1
                  ? `Если заправиться на пит-стопе — по ${formatNumber(plan.perStint)} л на каждый из двух отрезков.`
                  : `Если заправляться на каждом пит-стопе — по ${formatNumber(plan.perStint)} л на каждый из ${plan.stints} отрезков.`}
              </p>
            )}
            {!plan.fitsTank && <p className="summary__muted">В бак столько не влезет: без дозаправки не доехать.</p>}
            {!props.isRace && <p className="summary__muted">Сейчас выбрана не гонка — расчёт для справки.</p>}
            {props.fuelLoaded !== plan.atStart ? (
              <button type="button" className="button button--ghost" onClick={() => props.onFill(plan.atStart)}>
                Залить {formatNumber(plan.atStart)} л на старт
              </button>
            ) : (
              <p className="summary__ok">В баке {formatNumber(plan.atStart)} л — как нужно.</p>
            )}
          </div>
        )}
      </div>

      <div className="summary__block">
        <h3 className="summary__title">Проверка сетапа</h3>
        {props.checks.length === 0 ? (
          <p className="summary__muted">Противоречий между условиями и сетапом не нашли.</p>
        ) : (
          <ul className="checks">
            {props.checks.map((c) => (
              <li key={c.id}>{c.text}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="summary__actions">
        <button type="button" className="button button--primary" onClick={props.onSave}>
          Сохранить сетап
        </button>
        <div className="summary__row">
          <button type="button" className="button button--ghost" onClick={props.onExport}>
            Скачать файл
          </button>
          <button type="button" className="button button--ghost" onClick={() => fileRef.current?.click()}>
            Загрузить файл
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) props.onImport(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>
    </aside>
  )
}
