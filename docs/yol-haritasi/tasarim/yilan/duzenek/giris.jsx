import { createRoot } from 'react-dom/client'
import '@fontsource-variable/onest'
import '@fontsource-variable/unbounded'
import '@fontsource-variable/jetbrains-mono'
import '/src/styles.css'
import { applyTheme } from '/src/lib/theme.js'
import SnakeGame from '/src/screens/SnakeGame.jsx'
applyTheme()
createRoot(document.getElementById('root')).render(<SnakeGame trueDepth onExit={() => {}} onFinish={() => {}} />)
window.__ready = true
