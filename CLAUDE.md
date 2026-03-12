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
- `src/tournament/components/` — Reusable UI components
- `src/tournament/utils/` — Utility modules (notifications)
- `public/` — Static assets (icons, manifest.json, sw.js)
- `print/` — Standalone HTML print files (brackets, rosters, schedule) — NOT part of Vite build

### UI Architecture
ESPN-style mobile-first layout with fixed bottom navigation:
- **TopBar** — Sticky header: back arrow, school logo, search icon, child selector icon, court key icon (schedule tab only)
- **SubTabs** — Horizontally scrollable division pills below TopBar, context changes per active tab
- **BottomNav** — Fixed bottom tab bar with SVG icons (Brackets, Schedule, Teams, + conditional Results/MyTeam)
- **SearchOverlay** — Full-screen player search from magnifying glass icon
- **ChildSheet** — Bottom sheet from person icon for managing up to 2 children with inline search
- **MatchupModal** — Game detail popup when tapping any game card
- **GameCard** — Reusable game display card used across Schedule, Brackets, TeamPage

Conditional tabs: "Results" appears when any division has a champion. "MyTeam" appears when a child is selected.

### Notifications (PWA)
- Service worker (`public/sw.js`): network-first caching, cache name `tournament-v1`
- Notification flow: Firebase `onValue` fires → `subscribeToResults` callback → diff detection → push via `postMessage` to SW
- `src/tournament/utils/notifications.js` — Permission checks, result diff detection, team-specific alerts
- Only prompts for notification permission in standalone (installed) mode

### Data Layer
Game results use **Firebase Realtime Database** with localStorage as offline cache/fallback (dual-write pattern).

#### Firebase
- **Project**: `roseruthclinic` (config in `src/data/firebase.js`)
- **Database path**: `tournament/results`
- **Pattern**: `onValue` listener syncs Firebase → in-memory cache → localStorage. Writes go to both Firebase and localStorage.
- **`initResultsSync()`** in `main.jsx` must be called before `createRoot()` — seeds cache from localStorage, attaches Firebase listener.

#### Reactive State
- **`useGameResults()`** — React hook for live game results (re-renders on any change). Use this in all view components.
- **`subscribeToResults(cb)`** — Low-level subscription for non-React code (e.g., notifications).
- Do NOT use `getGameResults()` in React components — it returns a snapshot that won't update.

#### localStorage Keys
- `tournament-results` — Game scores/winners (JSON object keyed by gameId)
- `tournament-selected-children` — Array of selected children `[{playerName, teamName, division}]`
- `tournament-active-child-index` — Index of active child (integer string)
- `tournament-notif-last-results` — Last notified results snapshot
- `tournament-notif-prompted` — Whether notification prompt was shown
- `tournament-install-dismissed` — Install banner dismissed by user
- `tournament-app-installed` — App was installed (prevents banner re-show)

### Bracket Structure
Each division has `quarterFinals[]`, `semiFinals[]`, `final[]`. Later rounds use `source: [gameId1, gameId2]` to reference feeder games. Use `resolveFullBracket(bracket, results)` to populate team names from results.

### Game IDs
Format: `{grade}{gender}-{round}` e.g. `3B-QF1` (3rd Boys Quarter-Final 1), `5G-SF2`, `4B-F`

## Styling Conventions
- **Custom CSS**: `.scrollbar-hide` utility in `src/index.css` for hidden horizontal scrollbars
- **Safe areas**: `env(safe-area-inset-bottom)` and `viewport-fit=cover` for iOS home indicator
- **Color scheme**: Navy backgrounds (`bg-navy-800`, `bg-navy-900`), green accents (`text-green-400`, `bg-green-600`)
- **Navy custom colors** defined in Tailwind (navy-600 through navy-900)
- All text is white/gray on dark backgrounds
- Mobile-first responsive design
- Inputs must use `text-base` (16px) to prevent iOS zoom

## Deployment
Push to `main` triggers Cloudflare Pages auto-deploy → builds → deploys to `tcs-march-madness.com`.
Base path is `/` (configured in `vite.config.js`).

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
- `4B-SF1` and `5G-SF1` are missing from the `schedule` array in tournamentData.js

### Print Files (`print/`)
- Standalone HTML with inline CSS — edit directly, no build step
- Bracket posters: 24×18in landscape (`@page { size: 24in 18in; }`) for Staples printing
- Rosters/schedule: standard letter size (`@page { size: letter; }`)
- Use `match-slot` wrappers with `flex: 1` for bracket alignment — round labels must be outside flex columns
- QR codes via `api.qrserver.com/v1/create-qr-code/`
- Preview tip: use CSS `zoom: 0.4–0.6` at 1440×1080 viewport — large viewports (2400+) crash the preview
