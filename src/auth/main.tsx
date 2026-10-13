import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/font.css'
import '../styles/tokens.css'
import '../styles/base.css'
import './auth.css'
import { AuthPage } from './AuthPage'

const mode = /\/signup\/?$/.test(window.location.pathname) ? 'signup' : 'login'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthPage mode={mode} />
  </StrictMode>,
)
