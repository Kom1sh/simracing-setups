import { t } from '../i18n/dashboard'
import { LOCALES, locale, pagePath, switchLocalePath } from '../i18n/locale'
import type { Session } from '../lib/session'
import { usePopover } from './usePopover'

/** Аккаунт в шапке: имя, язык, переход на главную и выход */
export function UserMenu({ session, onSignOut }: { session: Session; onSignOut: () => void }) {
  const { open, setOpen, rootRef, triggerRef } = usePopover()
  const initial = session.name.trim().charAt(0).toUpperCase() || '?'

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="user-menu__trigger"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${t.user.menu}: ${session.name}`}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
        }}
      >
        <span className="user-menu__badge" aria-hidden="true">
          {initial}
        </span>
        <span className="user-menu__name">{session.name}</span>
      </button>
      {open && (
        <div
          className="user-menu__panel"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false)
              triggerRef.current?.focus()
            }
          }}
        >
          <p className="user-menu__who">
            <strong>{session.name}</strong>
            <span>{session.email}</span>
          </p>
          <nav className="user-menu__langs" aria-label={t.user.language}>
            {LOCALES.map((l) => (
              <a key={l} href={switchLocalePath(window.location.pathname, l)} aria-current={l === locale ? 'true' : undefined} lang={l} className={l === locale ? 'is-selected' : undefined}>
                {l === 'en' ? 'English' : 'Русский'}
              </a>
            ))}
          </nav>
          <a className="user-menu__link" href={pagePath('home')}>
            {t.user.toSite}
          </a>
          <button type="button" className="user-menu__link" onClick={onSignOut}>
            {t.user.signOut}
          </button>
        </div>
      )}
    </div>
  )
}
