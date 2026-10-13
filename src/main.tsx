import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/font.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/band.css'
import './styles/controls.css'
import './styles/workspace.css'
import './styles/assistant.css'
import './styles/user-menu.css'
import App from './App'
import { getSession, signOut } from './lib/session'
import { pagePath } from './i18n/locale'

const session = getSession()

if (!session) {
  // Кабинет только для вошедших: возвращаем сюда же после входа
  const next = window.location.pathname + window.location.search
  window.location.replace(`${pagePath('login')}?next=${encodeURIComponent(next)}`)
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App
        session={session}
        onSignOut={() => {
          signOut()
          window.location.assign(pagePath('home'))
        }}
      />
    </StrictMode>,
  )
}
