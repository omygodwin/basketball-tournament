// Notification utilities for tournament PWA
import { getGameResults, getSelectedChildren, getTeamNextGame, schedule, courts, brackets, resolveFullBracket } from '../../data/tournamentData';

const LAST_RESULTS_KEY = 'tournament-notif-last-results';
const PROMPTED_KEY = 'tournament-notif-prompted';

export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}

export function canNotify() {
  return 'Notification' in window;
}

export function isNotificationGranted() {
  return canNotify() && Notification.permission === 'granted';
}

export function hasBeenPrompted() {
  return localStorage.getItem(PROMPTED_KEY) === 'true';
}

export function markPrompted() {
  localStorage.setItem(PROMPTED_KEY, 'true');
}

export async function requestNotificationPermission() {
  if (!canNotify()) return false;
  markPrompted();
  const result = await Notification.requestPermission();
  return result === 'granted';
}

// Get the last results snapshot we notified about
function getLastNotifiedResults() {
  try {
    const stored = localStorage.getItem(LAST_RESULTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save current results as the "last notified" snapshot
export function saveNotifiedResults() {
  const results = getGameResults();
  localStorage.setItem(LAST_RESULTS_KEY, JSON.stringify(results));
}

// Build a map of gameId -> { team1, team2, division, round } using resolved brackets
function buildResolvedGameMap(results) {
  const gameMap = {};
  for (const [division, bracket] of Object.entries(brackets)) {
    const resolved = resolveFullBracket(bracket, results);
    const allGames = [
      ...resolved.quarterFinals.map((g) => ({ ...g, round: 'Quarter-Final' })),
      ...resolved.semiFinals.map((g) => ({ ...g, round: 'Semi-Final' })),
      ...resolved.final.map((g) => ({ ...g, round: 'Final' })),
    ];
    for (const game of allGames) {
      gameMap[game.gameId] = { team1: game.team1, team2: game.team2, division, round: game.round };
    }
  }
  return gameMap;
}

// Check for new results involving selected children's teams and notify
export function checkAndNotifyNewResults() {
  if (!isNotificationGranted()) return;

  const children = getSelectedChildren();
  if (children.length === 0) return;

  const currentResults = getGameResults();
  const lastResults = getLastNotifiedResults();

  // Resolve brackets to get actual team names for all games
  const gameMap = buildResolvedGameMap(currentResults);

  // Find team names for all selected children
  const childTeams = children.map((c) => ({ teamName: c.teamName, division: c.division, playerName: c.playerName }));

  // Check each game result for new results involving children's teams
  for (const [gameId, result] of Object.entries(currentResults)) {
    // Skip if we already notified about this game
    if (lastResults[gameId] && lastResults[gameId].winner) continue;
    if (!result || !result.winner) continue;

    // Get resolved game info (with actual team names filled in)
    const gameInfo = gameMap[gameId];
    if (!gameInfo) continue;

    // Check if any child's team is in this game
    for (const child of childTeams) {
      const isInGame = gameInfo.team1 === child.teamName || gameInfo.team2 === child.teamName;
      if (!isInGame) continue;

      const won = result.winner === child.teamName;
      const opponent = gameInfo.team1 === child.teamName ? gameInfo.team2 : gameInfo.team1;
      const scoreText = `${result.score1} - ${result.score2}`;

      const title = won ? `${child.teamName} Wins!` : `${child.teamName} - Game Result`;
      let body = won
        ? `${child.teamName} beat ${opponent || 'opponent'} ${scoreText}`
        : `${child.teamName} lost to ${opponent || 'opponent'} ${scoreText}`;

      // Add next game info if they won
      if (won) {
        const nextGame = getTeamNextGame(child.teamName, child.division);
        if (nextGame) {
          const court = nextGame.court ? courts.find((c) => c.id === nextGame.court) : null;
          body += `\nNext: ${nextGame.round} vs ${nextGame.opponent || 'TBD'}`;
          if (court) body += ` (${court.name})`;
        }
      }

      showNotification(title, body);
    }
  }

  // Save current results as last notified
  saveNotifiedResults();
}

function showNotification(title, body) {
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
      });
    } else {
      new Notification(title, {
        body,
        icon: import.meta.env.BASE_URL + 'basketball-icon-192.png',
        badge: import.meta.env.BASE_URL + 'basketball-icon-192.png',
      });
    }
  } catch {
    // Fallback: direct notification
    try {
      new Notification(title, { body });
    } catch {
      // Notifications not supported in this context
    }
  }
}
