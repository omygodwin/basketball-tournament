import { divisions, getBracket, resolveFullBracket, getTeamByName } from '../data/tournamentData';

export default function ResultsView({ gameResults }) {
  const results = gameResults || {};

  const divisionResults = divisions.map((division) => {
    const bracket = getBracket(division);
    if (!bracket) return { division, champion: null };

    const resolved = resolveFullBracket(bracket, results);
    const finalGame = resolved.final[0];
    const finalResult = results[finalGame?.gameId];

    return {
      division,
      champion: finalResult?.winner || null,
      runnerUp: finalResult?.winner
        ? (finalResult.winner === finalGame.team1 ? finalGame.team2 : finalGame.team1)
        : null,
      finalScore: finalResult
        ? `${finalResult.score1} - ${finalResult.score2}`
        : null,
    };
  });

  const champions = divisionResults.filter((d) => d.champion);
  const pending = divisionResults.filter((d) => !d.champion);

  return (
    <div>
      <h3 className="text-2xl font-bold text-center text-white mb-2">Tournament Results</h3>
      <p className="text-center text-gray-400 text-sm mb-6">
        {champions.length === divisions.length
          ? 'All divisions complete!'
          : `${champions.length} of ${divisions.length} divisions decided`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {champions.map(({ division, champion, runnerUp, finalScore }) => {
          const championTeam = getTeamByName(champion);
          return (
            <div
              key={division}
              className="bg-navy-800 rounded-xl border border-green-600/50 p-5 text-center relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="text-4xl mb-2">&#127942;</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{division}</div>
                <div className="text-xl font-bold text-green-400 mb-1">{champion}</div>
                <div className="text-sm text-gray-300">
                  Final: <span className="text-white font-bold">{finalScore}</span>
                </div>
                {runnerUp && (
                  <div className="text-xs text-gray-500 mt-1">vs {runnerUp}</div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent pointer-events-none" />
            </div>
          );
        })}
      </div>

      {pending.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-bold text-gray-400 mb-3">Awaiting Results</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pending.map(({ division }) => (
              <div
                key={division}
                className="bg-navy-800 rounded-lg border border-navy-700 p-4 text-center"
              >
                <div className="text-gray-500 text-sm">{division}</div>
                <div className="text-gray-600 text-xs mt-1">Final not yet played</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {champions.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-white mb-3">Champion Rosters</h4>
          <div className="space-y-3">
            {champions.map(({ division, champion }) => {
              const team = getTeamByName(champion);
              if (!team) return null;
              return (
                <div
                  key={division}
                  className="bg-navy-800 rounded-lg border border-navy-700 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">&#127942;</span>
                    <span className="text-green-400 font-bold">{champion}</span>
                    <span className="text-gray-500 text-sm">({division})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {team.roster.map((player) => (
                      <span
                        key={player}
                        className="bg-green-900/30 text-green-300 text-sm px-2 py-1 rounded"
                      >
                        {player}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
