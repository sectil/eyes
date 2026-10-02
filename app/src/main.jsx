import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/onest'
import '@fontsource-variable/unbounded'
import '@fontsource-variable/jetbrains-mono'
import App from './App.jsx'
import { applyTheme, watchSystemTheme } from './lib/theme.js'
import './styles.css'

applyTheme()
watchSystemTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
