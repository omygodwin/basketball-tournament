import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TournamentApp from './tournament/TournamentApp'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TournamentApp />
  </StrictMode>,
)
