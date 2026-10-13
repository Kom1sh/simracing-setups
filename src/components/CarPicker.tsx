import { w } from '../i18n/dashboard'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { Car, CategoryId } from '../data/types'
import { categories } from '../data/localized'
import { normalizeSearch } from '../lib/format'
import { engineText } from '../lib/cars'
import { usePopover } from './usePopover'

interface Props {
  cars: Car[]
  category: CategoryId
  value: Car
  onChange: (id: string) => void
}

export function CarPicker({ cars, category, value, onChange }: Props) {
  const { open, setOpen, rootRef, triggerRef } = usePopover()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()

  const results = useMemo(() => {
    const q = normalizeSearch(query)
    if (!q) return cars.filter((c) => c.category === category)
    return cars.filter((c) => normalizeSearch(`${c.brand} ${c.model}`).includes(q) || normalizeSearch(c.model).includes(q))
  }, [cars, category, query])

  const toggle = () => {
    if (!open) {
      setQuery('')
      const inCategory = cars.filter((c) => c.category === category)
      setActive(Math.max(0, inCategory.findIndex((c) => c.id === value.id)))
    }
    setOpen(!open)
  }

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active, results])

  const choose = (c: Car) => {
    onChange(c.id)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const d = e.key === 'ArrowDown' ? 1 : -1
      setActive((a) => Math.min(results.length - 1, Math.max(0, a + d)))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[active]) choose(results[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  const categoryLabel = (id: CategoryId) => categories.find((c) => c.id === id)?.label ?? id

  return (
    <div className="picker picker--car" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="picker__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
      >
        <span className="picker__kind">{w.car}</span>
        <span className="picker__value">
          {value.brand} {value.model}
        </span>
        <span className="picker__meta">{categoryLabel(value.category)}</span>
        <svg className="picker__chevron" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="picker__panel picker__panel--cars" role="dialog" aria-label={w.chooseCar}>
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
              placeholder={w.carSearch}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
              onKeyDown={onKey}
            />
          </div>
          <p className="picker__scope">{query ? w.allCategories : w.inCategory(categoryLabel(category))}</p>
          <ul className="car-list" id={listId} role="listbox" aria-label={w.carsList} ref={listRef}>
            {results.map((c, i) => (
              <li
                key={c.id}
                id={`${listId}-${c.id}`}
                data-index={i}
                role="option"
                aria-selected={c.id === value.id}
                className={['car-row', i === active ? 'is-active' : '', c.id === value.id ? 'is-selected' : ''].join(' ')}
                onMouseMove={() => setActive(i)}
                onClick={() => choose(c)}
              >
                <span className="car-row__brand">{c.brand}</span>
                <span className="car-row__model">{c.model}</span>
                <span className="car-row__engine">{engineText(c)}</span>
                {query && <span className="car-row__cat">{categoryLabel(c.category)}</span>}
              </li>
            ))}
            {results.length === 0 && <li className="picker__empty">{w.noCar}</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
