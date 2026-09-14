import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { clamp, snap } from '../lib/params'
import { formatNumber, formatTimeOfDay } from '../lib/format'

interface NumberFieldProps {
  value: number
  min: number
  max: number
  step: number
  decimals: number
  unit?: string
  format?: 'time'
  label: string
  compact?: boolean
  onChange: (v: number) => void
}

function display(value: number, decimals: number, format?: 'time') {
  return format === 'time' ? formatTimeOfDay(value) : formatNumber(value, decimals).replace(/ /g, ' ')
}

function parse(text: string, format?: 'time'): number | null {
  const t = text.trim()
  if (format === 'time') {
    const m = t.match(/^(\d{1,2})(?::(\d{2}))?$/)
    if (!m) return null
    const h = Number(m[1])
    const min = Number(m[2] ?? 0)
    if (h > 23 || min > 59) return null
    return h * 60 + min
  }
  const n = Number(t.replace(/\s/g, '').replace(',', '.').replace('−', '-'))
  return Number.isFinite(n) ? n : null
}

/** Поле значения со степпером. Стрелки ↑↓ меняют на шаг, с Shift — на десять шагов. */
export function NumberField({ value, min, max, step, decimals, unit, format, label, compact, onChange }: NumberFieldProps) {
  const [text, setText] = useState(() => display(value, decimals, format))
  const editing = useRef(false)
  // Ширина поля по самому длинному значению диапазона, чтобы «150 000» и «−0,40» не обрезались
  const chars = Math.max(display(min, decimals, format).length, display(max, decimals, format).length, 2)

  useEffect(() => {
    if (!editing.current) setText(display(value, decimals, format))
  }, [value, decimals, format])

  const commit = (next: number) => {
    const v = snap(clamp(next, min, max), step, min, decimals)
    onChange(v)
    setText(display(v, decimals, format))
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const k = (e.shiftKey ? 10 : 1) * (e.key === 'ArrowUp' ? 1 : -1)
      editing.current = false
      commit(value + k * step)
    } else if (e.key === 'Enter') {
      ;(e.target as HTMLInputElement).blur()
    } else if (e.key === 'Escape') {
      editing.current = false
      setText(display(value, decimals, format))
    }
  }

  return (
    <div className={compact ? 'numfield numfield--compact' : 'numfield'}>
      <button
        type="button"
        className="numfield__step"
        aria-label={`${label}: меньше`}
        disabled={value <= min}
        onClick={() => commit(value - step)}
      >
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8" /></svg>
      </button>
      <label className="numfield__box">
        <span className="visually-hidden">{label}</span>
        <input
          className="numfield__input"
          style={{ width: `${chars * 0.52 + 0.3}em` }}
          inputMode={format === 'time' ? 'numeric' : 'decimal'}
          value={text}
          onFocus={(e) => {
            editing.current = true
            e.target.select()
          }}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            editing.current = false
            const n = parse(text, format)
            if (n === null) setText(display(value, decimals, format))
            else commit(n)
          }}
          onKeyDown={onKey}
        />
        {unit && <span className="numfield__unit">{unit}</span>}
      </label>
      <button
        type="button"
        className="numfield__step"
        aria-label={`${label}: больше`}
        disabled={value >= max}
        onClick={() => commit(value + step)}
      >
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8M6 2v8" /></svg>
      </button>
    </div>
  )
}

interface SliderProps {
  value: number
  min: number
  max: number
  step: number
  label: string
  valueText?: string
  onChange: (v: number) => void
}

export function Slider({ value, min, max, step, label, valueText, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <input
      type="range"
      className="slider"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={label}
      aria-valuetext={valueText}
      style={{ ['--fill' as string]: `${pct}%` }}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )
}

interface SegmentedProps {
  value: string
  options: { value: string; label: string }[]
  label: string
  onChange: (v: string) => void
  tone?: 'light' | 'band'
  size?: 'md' | 'lg'
}

/** Группа радиокнопок: выбранный вариант — жёлтый. Стрелки переключают. */
export function Segmented({ value, options, label, onChange, tone = 'light', size = 'md' }: SegmentedProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const move = (e: KeyboardEvent, i: number) => {
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % options.length
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + options.length) % options.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = options.length - 1
    if (next < 0) return
    e.preventDefault()
    onChange(options[next].value)
    refs.current[next]?.focus()
  }
  return (
    <div className={`segmented segmented--${tone} segmented--${size}`} role="radiogroup" aria-label={label}>
      {options.map((o, i) => {
        const selected = o.value === value
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className="segmented__option"
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => move(e, i)}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (v: boolean) => void }) {
  const id = useId()
  return (
    <div className="toggle">
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}

/** Машина сверху: подсвеченное колесо и, если нужно, место двигателя */
export function CarGlyph({
  active,
  engine,
  className,
}: {
  active?: number | null
  engine?: 'front' | 'front-mid' | 'mid' | 'rear' | null
  className?: string
}) {
  // Колёса: ПЛ, ПП, ЗЛ, ЗП. Перед машины сверху.
  const wheels = [
    { x: 3, y: 30, h: 26 },
    { x: 67, y: 30, h: 26 },
    { x: 2, y: 118, h: 30 },
    { x: 68, y: 118, h: 30 },
  ]
  const engineBox = { front: [14, 22], 'front-mid': [38, 20], mid: [114, 24], rear: [146, 18] } as const
  return (
    <svg className={className ?? 'car-glyph'} viewBox="0 0 80 176" aria-hidden="true">
      {wheels.map((w, i) => (
        <rect key={i} className={active === i ? 'car-glyph__wheel is-active' : 'car-glyph__wheel'} x={w.x} y={w.y} width="10" height={w.h} />
      ))}
      <path
        className="car-glyph__body"
        d="M28 4H52C60 4 66 10 68 20L72 44C73 50 73 56 71 62L69 84C68 92 68 100 70 108L74 136C75 146 74 158 70 166C68 170 64 172 58 172H22C16 172 12 170 10 166C6 158 5 146 6 136L10 108C12 100 12 92 11 84L9 62C7 56 7 50 8 44L12 20C14 10 20 4 28 4Z"
      />
      <path className="car-glyph__cabin" d="M23 62H57L62 84L60 110H20L18 84ZM18 84H62" />
      <path className="car-glyph__cabin" d="M9 162H71" />
      {engine && <rect className="car-glyph__engine" x="26" y={engineBox[engine][0]} width="28" height={engineBox[engine][1]} />}
    </svg>
  )
}
