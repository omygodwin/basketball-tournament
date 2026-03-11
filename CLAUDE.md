# Basketball Tournament PWA

## Project Overview
React 19 PWA for The Covenant School's 3rd Annual 3v3 March Madness basketball tournament. Static site deployed to GitHub Pages.

## Tech Stack
- **Framework**: React 19 + Vite 7
- **Styling**: Tailwind CSS 3 (utility classes only)
- **Deployment**: GitHub Pages via GitHub Actions (auto-deploys on push to `main`)
- **PWA**: Service worker (`public/sw.js`), manifest, notifications

## Commands
- `npm run dev` — Start dev server (port 5174 via launch.json)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build

## Architecture

### Key Directories
- `src/data/tournamentData.js` — All tournament data (teams, brackets, schedules) + localStorage helpers
- `src/tournament/` — Main view components (TournamentApp, TournamentCentral, AdminPanel, etc.)
- `src/tournament/components/` — Reusable UI components (PlayerSearch, InstallBanner, etc.)
- `src/tournament/utils/` — Utility modules (notifications)
- `public/` — Static assets (icons, manifest.json, sw.js)

### Data Layer
All game results are stored in **localStorage** (no backend):
- `tournament-results` — Game scores/winners (JSON object keyed by gameId)
- `tournament-selected-children` — Array of selected children `[{playerName, teamName, division}]`
- `tournament-active-child-index` — Index of active child (integer string)
- `tournament-notif-last-results` — Last notified results snapshot
- `tournament-notif-prompted` — Whether notification prompt was shown

### Bracket Structure
Each division has `quarterFinals[]`, `semiFinals[]`, `final[]`. Later rounds use `source: [gameId1, gameId2]` to reference feeder games. Use `resolveFullBracket(bracket, results)` to populate team names from results.

### Game IDs
Format: `{grade}{gender}-{round}` e.g. `3B-QF1` (3rd Boys Quarter-Final 1), `5G-SF2`, `4B-F`

## Styling Conventions
- **Color scheme**: Navy backgrounds (`bg-navy-800`, `bg-navy-900`), green accents (`text-green-400`, `bg-green-600`)
- **Navy custom colors** defined in Tailwind (navy-600 through navy-900)
- All text is white/gray on dark backgrounds
- Mobile-first responsive design
- Inputs must use `text-base` (16px) to prevent iOS zoom

## Deployment
Push to `main` triggers GitHub Actions → builds → deploys to GitHub Pages at `/basketball-tournament/`.
Base path is `/basketball-tournament/` (configured in `vite.config.js`).

## Git Workflow
- Work on feature branches or worktree branches
- Push to `main` for deployment: `git push origin <branch>:main`
- Dev server runs on port **5174** (port 5173 is reserved for other local projects)

## Important Notes
- No testing framework configured
- No linting/formatting tools — keep code consistent manually
- Admin PIN is `1234` (in tournamentData.js)
- 5th Boys division has 7 teams (Gnarly Dudes gets a first-round bye)
- The `schedule` array has null team names for later rounds — always use bracket resolution for team lookups
