import { useId, useState } from 'react'
import type { Param, ParamValue } from '../data/types'
import { baseValue, sameValue, slotRange } from '../lib/params'
import { formatDuration, formatNumber, formatSigned, formatTimeOfDay, rainLabel } from '../lib/format'
import { CarGlyph, NumberField, Segmented, Slider, Toggle } from './controls'
import { w } from '../i18n/dashboard'

interface Props {
  param: Param
  value: ParamValue
  onChange: (v: ParamValue) => void
  /** Для колёс: менять левую и правую сторону вместе */
  symmetric?: boolean
  onSymmetricChange?: (v: boolean) => void
  /** Показывать разницу с базой (для сетапа машины) */
  showDelta?: boolean
  extra?: React.ReactNode
}

function Delta({ value, base, decimals }: { value: number; base: number; decimals: number }) {
  const d = Number((value - base).toFixed(decimals))
  return (
    <span className={d === 0 ? 'delta' : 'delta is-changed'} aria-hidden={d === 0}>
      {d === 0 ? '' : formatSigned(d, decimals)}
    </span>
  )
}

function scalarText(p: Param & { kind: 'scalar' }, v: number) {
  if (p.format === 'time') return formatTimeOfDay(v)
  const num = `${formatNumber(v, p.decimals)}${p.unit ? ` ${p.unit}` : ''}`
  if (p.format === 'percent-rain') return `${num}, ${rainLabel(v)}`
  return num
}

export function ParamRow({ param: p, value, onChange, symmetric = true, onSymmetricChange, showDelta = true, extra }: Props) {
  const labelId = useId()
  const hintId = useId()
  const [focusedWheel, setFocusedWheel] = useState<number | null>(null)
  const base = baseValue(p)
  const changed = !sameValue(base, value)

  const header = (
    <div className="param__head">
      <div className="param__title">
        <span id={labelId} className="param__label">
          {showDelta && changed && <span className="changed-mark" title={w.differs} />}
          {p.label}
        </span>
        {showDelta && changed && (
          <button type="button" className="text-button" onClick={() => onChange(base)}>
            {w.resetOne}
          </button>
        )}
      </div>
      {p.hint && (
        <p id={hintId} className="param__hint">
          {p.hint}
        </p>
      )}
    </div>
  )

  let control: React.ReactNode = null

  if (p.kind === 'choice') {
    control = (
      <Segmented value={value as string} options={p.options} label={p.label} onChange={onChange} />
    )
  }

  if (p.kind === 'scalar') {
    const v = value as number
    control = (
      <div className="scalar">
        <div className="scalar__top">
          <NumberField
            value={v}
            min={p.range.min}
            max={p.range.max}
            step={p.step}
            decimals={p.decimals}
            unit={p.format === 'time' ? undefined : p.unit}
            format={p.format === 'time' ? 'time' : undefined}
            label={p.label}
            onChange={onChange}
          />
          {showDelta && <Delta value={v} base={p.range.base} decimals={p.decimals} />}
          {p.format === 'percent-rain' && <span className="scalar__note">{rainLabel(v)}</span>}
          {p.id === 'duration' && <span className="scalar__note">{formatDuration(v)}</span>}
        </div>
        <Slider value={v} min={p.range.min} max={p.range.max} step={p.step} label={p.label} valueText={scalarText(p, v)} onChange={onChange} />
        {p.presets && (
          <div className="presets" role="group" aria-label={w.quickPick(p.label)}>
            {p.presets.map((pr) => (
              <button
                key={pr.value}
                type="button"
                className={pr.value === v ? 'preset is-selected' : 'preset'}
                aria-pressed={pr.value === v}
                onClick={() => onChange(pr.value)}
              >
                {pr.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (p.kind === 'axle') {
    const arr = value as number[]
    const bases = base as number[]
    control = (
      <div className="axle">
        {w.axle.map((name, i) => {
          const r = slotRange(p, i)
          const set = (x: number) => onChange(arr.map((old, j) => (j === i ? x : old)))
          return (
            <div className="axle__row" key={name}>
              <span className="axle__name">{name}</span>
              <NumberField value={arr[i]} min={r.min} max={r.max} step={p.step} decimals={p.decimals} unit={p.unit} label={`${p.label}, ${name.toLowerCase()}`} onChange={set} />
              {showDelta && <Delta value={arr[i]} base={bases[i]} decimals={p.decimals} />}
              <Slider value={arr[i]} min={r.min} max={r.max} step={p.step} label={`${p.label}, ${name.toLowerCase()}`} onChange={set} />
            </div>
          )
        })}
        {p.id === 'rideHeight' && (
          <p className="axle__derived">
            {w.rake} <strong>{formatSigned(arr[1] - arr[0])} {w.mm}</strong>
          </p>
        )}
      </div>
    )
  }

  if (p.kind === 'corners') {
    const arr = value as number[]
    const bases = base as number[]
    const names = w.wheels
    const short = w.wheelsShort
    const set = (i: number, x: number) => {
      const next = [...arr]
      next[i] = x
      if (symmetric) next[i % 2 === 0 ? i + 1 : i - 1] = x
      onChange(next)
    }
    const cell = (i: number) => {
      const r = slotRange(p, i)
      return (
        <div
          className={`corner corner--${i}`}
          onFocus={() => setFocusedWheel(i)}
          onBlur={() => setFocusedWheel(null)}
        >
          <span className="corner__name" aria-hidden="true">
            {short[i]}
          </span>
          <NumberField compact value={arr[i]} min={r.min} max={r.max} step={p.step} decimals={p.decimals} label={`${p.label}, ${names[i].toLowerCase()}`} onChange={(x) => set(i, x)} />
          {showDelta && <Delta value={arr[i]} base={bases[i]} decimals={p.decimals} />}
        </div>
      )
    }
    control = (
      <div className="corners">
        <div className="corners__grid">
          {cell(0)}
          <CarGlyph active={focusedWheel} className="car-glyph car-glyph--corners" />
          {cell(1)}
          {cell(2)}
          {cell(3)}
        </div>
        <div className="corners__foot">
          {p.unit && <span className="corners__unit">{w.valuesIn(p.unit)}</span>}
          {onSymmetricChange && <Toggle checked={symmetric} label={w.symmetric} onChange={onSymmetricChange} />}
        </div>
      </div>
    )
  }

  return (
    <div className={`param param--${p.kind}`} role="group" aria-labelledby={labelId} aria-describedby={p.hint ? hintId : undefined}>
      {header}
      <div className="param__control">
        {control}
        {extra}
      </div>
    </div>
  )
}
