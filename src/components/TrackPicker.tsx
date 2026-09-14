import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { Track } from '../data/types'
import { normalizeSearch, plural } from '../lib/format'
import { TrackMap } from './TrackMap'
import { usePopover } from './usePopover'

interface Props {
  tracks: Track[]
  aliases: Record<string, string[]>
  value: Track
  onChange: (id: string) => void
}

export function TrackPicker({ tracks, aliases, value, onChange }: Props) {
  const { open, setOpen, rootRef, triggerRef } = usePopover()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const index = useMemo(
    () =>
      tracks.map((t) => ({
        track: t,
        haystack: [t.name, t.nameOriginal, t.country, ...(aliases[t.id] ?? [])].map(normalizeSearch),
      })),
    [tracks, aliases],
  )

  const results = useMemo(() => {
    const q = normalizeSearch(query)
    if (!q) return tracks
    return index.filter((e) => e.haystack.some((h) => h.includes(q))).map((e) => e.track)
  }, [query, index, tracks])

  const toggle = () => {
    if (!open) {
      setQuery('')
      setActive(Math.max(0, tracks.findIndex((t) => t.id === value.id)))
    }
    setOpen(!open)
  }

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active, results])

  const choose = (t: Track) => {
    onChange(t.id)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const columns = () => {
    const items = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')
    if (!items || items.length < 2) return 1
    const top = items[0].offsetTop
    let n = 0
    for (const el of items) {
      if (el.offsetTop !== top) break
      n++
    }
    return Math.max(1, n)
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const last = results.length - 1
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns(), ArrowUp: -columns() }[e.key]
    if (step !== undefined) {
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && query && e.currentTarget.selectionStart !== e.currentTarget.value.length) return
      e.preventDefault()
      setActive((a) => Math.min(last, Math.max(0, a + step)))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[active]) choose(results[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <div className="picker" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="picker__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
      >
        <span className="picker__kind">Трасса</span>
        <span className="picker__value">{value.name}</span>
        <span className="picker__meta">{value.country}</span>
        <svg className="picker__chevron" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="picker__panel picker__panel--tracks" role="dialog" aria-label="Выбор трассы">
          <div className="picker__search">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M13 13l4.5 4.5" />
            </svg>
            <input
              ref={inputRef}
              autoFocus
              type="search"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
              aria-autocomplete="list"
              placeholder="Название трассы или страна"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
              onKeyDown={onKey}
            />
            <span className="picker__count" aria-live="polite">
              {results.length} {plural(results.length, 'трасса', 'трассы', 'трасс')}
            </span>
          </div>
          <div className="track-grid" id={listId} role="listbox" aria-label="Трассы" ref={listRef}>
            {results.map((t, i) => (
              <div
                key={t.id}
                id={`${listId}-${t.id}`}
                data-index={i}
                role="option"
                aria-selected={t.id === value.id}
                className={['track-tile', i === active ? 'is-active' : '', t.id === value.id ? 'is-selected' : ''].join(' ')}
                onMouseMove={() => setActive(i)}
                onClick={() => choose(t)}
              >
                <TrackMap track={t} variant="tile" />
              </div>
            ))}
            {results.length === 0 && (
              <p className="picker__empty">
                Трассы «{query}» в списке нет. Ищем по русскому и оригинальному названию и по стране — попробуйте «Спа», «Monza» или «Италия».
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
