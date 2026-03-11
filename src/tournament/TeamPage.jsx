import { useEffect, useState } from 'react';
import { getTeamByName, getBracket, schedule, getGameResults, courts } from '../data/tournamentData';
import BracketDisplay from './BracketDisplay';

export default function TeamPage({ selectedChild, embedded, onTeamClick, onGameClick, onViewCentral, onBack }) {
  const [gameResults, setGameResults] = useState(getGameResults());

  useEffect(() => {
    function handleFocus() { setGameResults(getGameResults()); }
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (!selectedChild) return null;

  const team = getTeamByName(selectedChild.teamName);
  if (!team) return <p className="text-gray-400 p-4">Team not found.</p>;

  const teamGames = schedule.filter(
    (g) => g.team1 === team.name || g.team2 === team.name
  );
  const bracket = getBracket(team.division);

  const content = (
    <div className="space-y-6">
      {/* Team header */}
      <div>
        <h2 className="text-2xl font-bold text-green-400">{team.name}</h2>
        <p className="text-gray-400">
          {team.division} &middot; Seed #{team.seed}
        </p>
      </div>

      {/* Roster */}
      <section className="bg-navy-800 rounded-lg p-4 border border-navy-700">
        <h2 className="text-lg font-bold text-green-400 mb-3">Roster</h2>
        {team.roster.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {team.roster.map((player) => (
              <div
                key={player}
                className={`px-3 py-2 rounded text-sm ${
                  selectedChild.playerName === player
                    ? 'bg-green-600/30 text-green-300 font-bold border border-green-500'
                    : 'bg-navy-700 text-gray-300'
                }`}
              >
                {player}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">Roster not available</p>
        )}
      </section>

      {/* Schedule */}
      <section className="bg-navy-800 rounded-lg p-4 border border-navy-700">
        <h2 className="text-lg font-bold text-green-400 mb-3">Schedule</h2>
        {teamGames.length > 0 ? (
          <div className="space-y-3">
            {teamGames.map((game) => {
              const result = gameResults[game.gameId];
              const hasResult = result && result.score1 != null;
              const court = courts.find((c) => c.id === game.court);
              const opponent = game.team1 === team.name ? game.team2 : game.team1;
              const isTeam1 = game.team1 === team.name;
              const teamScore = hasResult ? (isTeam1 ? result.score1 : result.score2) : null;
              const oppScore = hasResult ? (isTeam1 ? result.score2 : result.score1) : null;
              const won = hasResult && result.winner === team.name;

              return (
                <div
                  key={game.gameId}
                  className="flex items-center justify-between bg-navy-750 rounded-lg p-3 border border-navy-600 cursor-pointer hover:border-navy-600/80"
                  onClick={() => onGameClick && onGameClick(game)}
                >
                  <div>
                    <div className="text-white font-medium">
                      vs.{' '}
                      {opponent ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); onTeamClick && onTeamClick(opponent); }}
                          className="hover:underline"
                        >
                          {opponent}
                        </button>
                      ) : 'TBD'}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {game.round} &middot; {court?.name} &middot; Game {game.slot}
                    </div>
                  </div>
                  <div className="text-right">
                    {hasResult ? (
                      <div className={`font-bold ${won ? 'text-green-400' : 'text-red-400'}`}>
                        {won ? 'W' : 'L'} {teamScore}-{oppScore}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Upcoming</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 italic">No games scheduled</p>
        )}
      </section>

      {/* Bracket */}
      {bracket && (
        <section className="bg-navy-800 rounded-lg p-4 border border-navy-700">
          <h2 className="text-lg font-bold text-green-400 mb-3">{team.division} Bracket</h2>
          <BracketDisplay
            bracket={bracket}
            highlightTeam={team.name}
            gameResults={gameResults}
            onTeamClick={onTeamClick}
            onGameClick={onGameClick}
          />
        </section>
      )}
    </div>
  );

  // Embedded mode: just return content for use inside TournamentCentral tabs
  if (embedded) return content;

  // Standalone mode: full page with header
  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <div className="bg-navy-800 border-b border-navy-700 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white text-sm mb-2 flex items-center gap-1"
          >
            &larr; Back
          </button>
          <h1 className="text-2xl font-bold text-green-400">{team.name}</h1>
          <p className="text-gray-400">
            {team.division} &middot; Seed #{team.seed}
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {content}
        <button
          onClick={onViewCentral}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
        >
          View Full Tournament Central
        </button>
      </div>
    </div>
  );
}
