/** React entry point — mounts the app into #root. */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/roboto-mono/400.css'
import '@fontsource/roboto-mono/600.css'
import '@fontsource/roboto-mono/700.css'
import { App } from './App'
import { initNativeShell } from './utils/nativeShell'
import './index.css'

void initNativeShell().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
