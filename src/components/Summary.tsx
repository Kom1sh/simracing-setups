import { useId, useRef, useState } from 'react'
import type { Check } from '../lib/checks'
import type { FuelPlan } from '../lib/fuel'
import type { Change } from '../lib/params'
import { slotName } from '../lib/params'
import { formatDuration, formatNumber } from '../lib/format'
import { w } from '../i18n/dashboard'

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

/** «За 1 ч — 30 кругов…»: числа жирным, порядок слов задаёт словарь */
function FuelPlanText({ parts }: { parts: string[] }) {
  return (
    <p>
      {parts[0]}
      <strong>{parts[1]}</strong>
      {parts[2]}
      <strong>{parts[3]}</strong>
      {parts[4]}
    </p>
  )
}

export function Summary(props: Props) {
  const { changes, plan } = props
  const nameId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [showAll, setShowAll] = useState(false)
  const visibleChanges = showAll ? changes : changes.slice(0, 6)

  return (
    <aside className="summary" aria-label={w.summary}>
      <div className="summary__block">
        <label className="summary__label" htmlFor={nameId}>
          {w.setupName}
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
          {changes.length === 0 ? w.asBase : w.changedOf(changes.length, props.totalParams)}
        </h3>
        {changes.length === 0 ? (
          <p className="summary__muted">{w.noChanges}</p>
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
                  {showAll ? w.collapse : w.showAll(changes.length)}
                </button>
              )}
              <button type="button" className="text-button" onClick={props.onResetAll}>
                {w.resetAll}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="summary__block">
        <h3 className="summary__title">{w.fuelTitle}</h3>
        <div className="fuel-inputs">
          <label className="field">
            <span>{w.lapTime}</span>
            <input className={props.lapValid ? 'text-input' : 'text-input is-invalid'} inputMode="decimal" placeholder={w.lapPlaceholder} value={props.lapTime} onChange={(e) => props.onLapTime(e.target.value)} />
          </label>
          <label className="field">
            <span>{w.perLap}</span>
            <input className={props.perLapValid ? 'text-input' : 'text-input is-invalid'} inputMode="decimal" placeholder={w.perLapPlaceholder} value={props.perLap} onChange={(e) => props.onPerLap(e.target.value)} />
          </label>
        </div>
        {!plan && (
          <p className="summary__muted">
            {props.lapValid && props.perLapValid
              ? w.fuelHint
              : w.fuelFormat}
          </p>
        )}
        {plan && (
          <div className="fuel-plan">
            <FuelPlanText parts={w.fuelPlan(formatDuration(props.durationMin), plan.laps, formatNumber(plan.total))} />
            {props.pitStops > 0 && (
              <p className="summary__muted">
                {props.pitStops === 1
                  ? w.oneStop(formatNumber(plan.perStint))
                  : w.manyStops(formatNumber(plan.perStint), plan.stints)}
              </p>
            )}
            {!plan.fitsTank && <p className="summary__muted">{w.noTank}</p>}
            {!props.isRace && <p className="summary__muted">{w.notRace}</p>}
            {props.fuelLoaded !== plan.atStart ? (
              <button type="button" className="button button--ghost" onClick={() => props.onFill(plan.atStart)}>
                {w.fill(formatNumber(plan.atStart))}
              </button>
            ) : (
              <p className="summary__ok">{w.filled(formatNumber(plan.atStart))}</p>
            )}
          </div>
        )}
      </div>

      <div className="summary__block">
        <h3 className="summary__title">{w.checksTitle}</h3>
        {props.checks.length === 0 ? (
          <p className="summary__muted">{w.noIssues}</p>
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
          {w.saveSetup}
        </button>
        <div className="summary__row">
          <button type="button" className="button button--ghost" onClick={props.onExport}>
            {w.download}
          </button>
          <button type="button" className="button button--ghost" onClick={() => fileRef.current?.click()}>
            {w.upload}
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
