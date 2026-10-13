import { locale } from '../i18n/locale'
import { t, w } from '../i18n/dashboard'
import { useEffect, useRef } from 'react'

export interface SavedListItem {
  id: string
  name: string
  trackName: string
  carName: string
  savedAt: string
  changes: number
}

interface Props {
  open: boolean
  items: SavedListItem[]
  onClose: () => void
  onLoad: (id: string) => void
  onDelete: (id: string) => void
}

const dateFormat = new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

export function SetupsDialog({ open, items, onClose, onLoad, onDelete }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-labelledby="setups-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      <div className="drawer__inner">
        <header className="drawer__head">
          <h2 id="setups-title" className="drawer__title">
            {t.mySetups}
          </h2>
          <button type="button" className="icon-button" aria-label={w.close} onClick={onClose}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </header>
        <p className="drawer__note">{w.storedHere}</p>
        {items.length === 0 ? (
          <p className="drawer__empty">{w.noSaved}</p>
        ) : (
          <ul className="saved">
            {items.map((s) => (
              <li key={s.id} className="saved__item">
                <div className="saved__text">
                  <span className="saved__name">{s.name}</span>
                  <span className="saved__meta">
                    {s.trackName}, {s.carName}
                  </span>
                  <span className="saved__meta">
                    {dateFormat.format(new Date(s.savedAt))}
                    {w.savedChanges(s.changes)}
                  </span>
                </div>
                <div className="saved__actions">
                  <button type="button" className="button button--primary button--sm" onClick={() => onLoad(s.id)}>
                    {w.open}
                  </button>
                  <button type="button" className="text-button" onClick={() => onDelete(s.id)}>
                    {w.remove}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  )
}
