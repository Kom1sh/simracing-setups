import './site-font.css'
import '../styles/tokens.css'
import './site-base.css'
import './site-hero.css'
import './site-sections.css'

/** Шапка для вошедших: вместо «Войти» и «Создать аккаунт» — «Открыть кабинет» */
function applySession() {
  const signedIn = document.cookie.split('; ').some((c) => c.startsWith('srs_session='))
  if (!signedIn) return
  document.querySelectorAll<HTMLElement>('[data-guest]').forEach((el) => (el.hidden = true))
  document.querySelectorAll<HTMLElement>('[data-user]').forEach((el) => (el.hidden = false))
}

/** Вкладки примеров в шапке: клик или стрелки переключают жалобу и ответ */
function setupExamples(root: HTMLElement) {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
  const select = (tab: HTMLButtonElement, focus: boolean) => {
    tabs.forEach((t) => {
      const on = t === tab
      t.setAttribute('aria-selected', String(on))
      t.tabIndex = on ? 0 : -1
      const panel = document.getElementById(t.getAttribute('aria-controls') ?? '')
      if (panel) panel.hidden = !on
    })
    if (focus) tab.focus()
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab, false))
    tab.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: tabs.length - 1 - i }[e.key]
      if (d === undefined) return
      e.preventDefault()
      select(tabs[(i + d + tabs.length) % tabs.length], true)
    })
  })
}

applySession()
document.querySelectorAll<HTMLElement>('[data-examples]').forEach(setupExamples)
