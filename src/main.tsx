import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import SoundToggle from './SoundToggle.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <SoundToggle />
  </StrictMode>,
)
