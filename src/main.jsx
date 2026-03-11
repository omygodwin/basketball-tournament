import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TournamentApp from './tournament/TournamentApp'
import { initResultsSync } from './data/tournamentData'

// Initialize Firebase sync before rendering
initResultsSync();

// Register service worker for PWA + notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TournamentApp />
  </StrictMode>,
)
