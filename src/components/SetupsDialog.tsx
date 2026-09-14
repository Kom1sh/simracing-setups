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

const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

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
            Мои сетапы
          </h2>
          <button type="button" className="icon-button" aria-label="Закрыть" onClick={onClose}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </header>
        <p className="drawer__note">Сетапы хранятся в этом браузере. Чтобы перенести на другой компьютер, скачайте файл из сводки.</p>
        {items.length === 0 ? (
          <p className="drawer__empty">Сохранённых сетапов пока нет. Выберите трассу и машину, настройте и нажмите «Сохранить сетап».</p>
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
                    {s.changes > 0 ? `, изменений: ${s.changes}` : ', как в базе'}
                  </span>
                </div>
                <div className="saved__actions">
                  <button type="button" className="button button--primary button--sm" onClick={() => onLoad(s.id)}>
                    Открыть
                  </button>
                  <button type="button" className="text-button" onClick={() => onDelete(s.id)}>
                    Удалить
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
