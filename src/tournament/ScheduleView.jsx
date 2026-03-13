import { useState, useMemo } from 'react';
import { schedule, courts, teams, brackets, divisions, resolveFullBracket, useGameResults } from '../data/tournamentData';
import GameCard from './components/GameCard';

function resolveSchedule(gameResults) {
  // Build a lookup of gameId -> resolved team names from brackets
  const resolved = {};
  for (const division of divisions) {
    const bracket = brackets[division];
    if (!bracket) continue;
    const rb = resolveFullBracket(bracket, gameResults);
    const allGames = [...rb.quarterFinals, ...rb.semiFinals, ...rb.final];
    for (const g of allGames) {
      resolved[g.gameId] = { team1: g.team1, team2: g.team2 };
    }
  }
  // Overlay resolved names onto schedule entries
  return schedule.map((entry) => {
    const r = resolved[entry.gameId];
    if (r) {
      return { ...entry, team1: r.team1 || entry.team1, team2: r.team2 || entry.team2 };
    }
    return entry;
  });
}

export default function ScheduleView({ filterDivision, selectedChild, onTeamClick, onGameClick }) {
  const [filterTeam, setFilterTeam] = useState('');
  const gameResults = useGameResults();

  const teamNames = [...new Set(teams.map((t) => t.name))].sort();

  const resolvedSchedule = useMemo(() => resolveSchedule(gameResults), [gameResults]);

  const childGames = selectedChild
    ? resolvedSchedule.filter(
        (g) => g.team1 === selectedChild.teamName || g.team2 === selectedChild.teamName
      )
    : [];

  let filteredSchedule = resolvedSchedule;
  if (filterTeam) {
    filteredSchedule = filteredSchedule.filter((g) => g.team1 === filterTeam || g.team2 === filterTeam);
  }
  if (filterDivision) {
    filteredSchedule = filteredSchedule.filter((g) => g.division === filterDivision);
  }

  const byCourt = {};
  filteredSchedule.forEach((game) => {
    if (!byCourt[game.court]) byCourt[game.court] = [];
    byCourt[game.court].push(game);
  });
  Object.values(byCourt).forEach((games) => games.sort((a, b) => a.slot - b.slot));

  return (
    <div>
      {selectedChild && childGames.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-green-400 mb-3">
            {selectedChild.playerName}'s Schedule ({selectedChild.teamName})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {childGames.map((game) => (
              <GameCard
                key={game.gameId + '-child'}
                game={game}
                result={gameResults[game.gameId]}
                highlightTeam={selectedChild.teamName}
                onTeamClick={onTeamClick}
                onClick={() => onGameClick && onGameClick(game)}
              />
            ))}
          </div>
          <hr className="border-navy-700 my-6" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h3 className="text-lg font-bold text-white">
          {filterDivision ? `${filterDivision} Schedule` : 'Full Tournament Schedule'}
        </h3>
        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="bg-navy-700 text-white border border-navy-600 rounded-lg px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none"
        >
          <option value="">All Teams</option>
          {teamNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {(() => {
        let firstCardTagged = false;
        return Object.keys(byCourt).sort((a, b) => Number(a) - Number(b)).map((courtId) => {
          const court = courts.find((c) => c.id === Number(courtId));
          return (
            <div key={courtId} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-green-600 text-white font-bold px-2 py-0.5 rounded text-sm">
                  Court {courtId}
                </span>
                <span className="text-gray-400 text-sm">{court?.location}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {byCourt[courtId].map((game) => {
                  const isFirst = !firstCardTagged;
                  if (isFirst) firstCardTagged = true;
                  return (
                    <div key={game.gameId} data-tutorial={isFirst ? 'game-card' : undefined}>
                      <GameCard
                        game={game}
                        result={gameResults[game.gameId]}
                        highlightTeam={selectedChild?.teamName}
                        onTeamClick={onTeamClick}
                        onClick={() => onGameClick && onGameClick(game)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        });
      })()}

    </div>
  );
}
