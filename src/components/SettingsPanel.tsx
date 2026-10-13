import { t, w } from '../i18n/dashboard'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Param, ParamGroup, ParamValue, Values } from '../data/types'
import { listChanges } from '../lib/params'
import { ParamRow } from './ParamRow'

interface Props {
  idPrefix: string
  groups: ParamGroup[]
  values: Values
  onChange: (id: string, v: ParamValue) => void
  visible?: (p: Param) => boolean
  showDelta?: boolean
  symmetric?: Record<string, boolean>
  onSymmetricChange?: (id: string, v: boolean) => void
  intro?: ReactNode
  groupExtra?: Record<string, ReactNode>
  paramExtra?: Record<string, ReactNode>
}

/** Группы регулировок с навигацией слева; активная группа подсвечивается при прокрутке */
export function SettingsPanel({ idPrefix, groups, values, onChange, visible = () => true, showDelta = false, symmetric = {}, onSymmetricChange, intro, groupExtra = {}, paramExtra = {} }: Props) {
  const shown = groups.map((g) => ({ ...g, params: g.params.filter(visible) })).filter((g) => g.params.length > 0 || groupExtra[g.id])
  const [current, setCurrent] = useState<string | undefined>(shown[0]?.id)
  const refs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visibleEntries[0]) setCurrent(visibleEntries[0].target.getAttribute('data-group') ?? undefined)
      },
      { rootMargin: '-140px 0px -55% 0px' },
    )
    Object.values(refs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [shown.length, idPrefix])

  const jump = (id: string) => {
    const el = refs.current[id]
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    el.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
    setCurrent(id)
  }

  return (
    <div className="settings">
      <nav className="subnav" aria-label={w.groupsNav}>
        <ul>
          {shown.map((g) => {
            const n = showDelta ? listChanges([g], values, visible).length : 0
            return (
              <li key={g.id}>
                <button type="button" className={g.id === current ? 'subnav__link is-current' : 'subnav__link'} aria-current={g.id === current ? 'true' : undefined} onClick={() => jump(g.id)}>
                  <span>{g.title}</span>
                  {n > 0 && (
                    <span className="subnav__count" aria-label={t.nChanged(n)}>
                      {n}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="settings__body">
        {intro}
        {shown.map((g) => (
          <section
            key={g.id}
            className="group"
            data-group={g.id}
            id={`${idPrefix}-${g.id}`}
            aria-labelledby={`${idPrefix}-${g.id}-title`}
            ref={(el) => {
              refs.current[g.id] = el
            }}
          >
            <header className="group__head">
              <h2 id={`${idPrefix}-${g.id}-title`} className="group__title" tabIndex={-1}>
                {g.title}
              </h2>
              {g.description && <p className="group__desc">{g.description}</p>}
            </header>
            {groupExtra[g.id]}
            {g.params.map((p) => (
              <ParamRow
                key={p.id}
                param={p}
                value={values[p.id]}
                onChange={(v) => onChange(p.id, v)}
                showDelta={showDelta}
                symmetric={symmetric[p.id] ?? true}
                onSymmetricChange={p.kind === 'corners' && onSymmetricChange ? (v) => onSymmetricChange(p.id, v) : undefined}
                extra={paramExtra[p.id]}
              />
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
