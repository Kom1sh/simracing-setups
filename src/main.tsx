import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/roboto-flex/wdth.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/band.css'
import './styles/controls.css'
import './styles/workspace.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
