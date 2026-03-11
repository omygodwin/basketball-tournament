import { getGameResults } from '../data/tournamentData';

function MatchupBox({ game, result, highlightTeam, onTeamClick, onGameClick }) {
  const hasResult = result && result.score1 != null;
  const isBye = game.bye && !game.team2;
  const team1 = game.team1 || 'TBD';
  const team2 = isBye ? 'BYE' : (game.team2 || 'TBD');
  const team1Won = hasResult && result.winner === game.team1;
  const team2Won = hasResult && result.winner === game.team2;
  const isBoxHighlighted = highlightTeam && (game.team1 === highlightTeam || game.team2 === highlightTeam);

  function teamRow(name, seed, won, lost, isHighlighted, score, isReal) {
    return (
      <div
        className={`flex items-center justify-between px-2 py-1.5 ${
          won ? 'bg-green-900/40' : lost ? 'opacity-50' : ''
        } ${isHighlighted ? 'ring-1 ring-green-400 rounded' : ''}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {seed && <span className="text-gray-500 text-xs font-mono w-4 shrink-0">{seed}</span>}
          {isReal && onTeamClick ? (
            <button
              onClick={(e) => { e.stopPropagation(); onTeamClick(name); }}
              className={`truncate text-sm font-medium text-left hover:underline ${
                won ? 'text-green-400 font-bold' : lost ? 'text-gray-500 line-through' : 'text-white'
              }`}
              title={name}
            >
              {name}
            </button>
          ) : (
            <span
              className={`truncate text-sm font-medium ${
                won ? 'text-green-400 font-bold' : lost ? 'text-gray-500 line-through' : name === 'TBD' || name === 'BYE' ? 'text-gray-500' : 'text-white'
              }`}
              title={name}
            >
              {name}
            </span>
          )}
        </div>
        {score != null && (
          <span className={`text-sm font-bold ml-2 shrink-0 ${won ? 'text-green-400' : 'text-gray-500'}`}>
            {score}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-navy-800 border rounded w-full overflow-hidden shadow-md cursor-pointer transition-colors ${
        isBoxHighlighted ? 'border-green-500 ring-1 ring-green-500/30' : 'border-navy-600 hover:border-navy-500'
      }`}
      onClick={() => onGameClick && onGameClick(game)}
      title="Click for matchup details"
    >
      {teamRow(
        team1, game.seed1, team1Won, hasResult && !team1Won,
        highlightTeam && game.team1 === highlightTeam,
        hasResult ? result.score1 : null,
        game.team1 && game.team1 !== 'TBD'
      )}
      <div className="border-t border-navy-600" />
      {teamRow(
        team2, game.seed2, team2Won, hasResult && !team2Won,
        highlightTeam && game.team2 === highlightTeam,
        hasResult ? result.score2 : null,
        game.team2 && game.team2 !== 'TBD' && game.team2 !== 'BYE'
      )}
    </div>
  );
}

function resolveBracket(bracket, results) {
  const resolved = JSON.parse(JSON.stringify(bracket));

  function getQfWinner(qfGame, result) {
    if (qfGame.bye) return { winner: qfGame.team1, seed: qfGame.seed1 };
    if (result && result.winner) {
      const seed = result.winner === qfGame.team1 ? qfGame.seed1 : qfGame.seed2;
      return { winner: result.winner, seed };
    }
    return null;
  }

  resolved.semiFinals.forEach((sf) => {
    if (sf.source) {
      const [src1Id, src2Id] = sf.source;
      const src1 = resolved.quarterFinals.find((g) => g.gameId === src1Id);
      const src2 = resolved.quarterFinals.find((g) => g.gameId === src2Id);
      const w1 = getQfWinner(src1, results[src1Id]);
      const w2 = getQfWinner(src2, results[src2Id]);
      if (w1) { sf.team1 = w1.winner; sf.seed1 = w1.seed; }
      if (w2) { sf.team2 = w2.winner; sf.seed2 = w2.seed; }
    }
  });

  resolved.final.forEach((f) => {
    if (f.source) {
      const [src1Id, src2Id] = f.source;
      const r1 = results[src1Id];
      const r2 = results[src2Id];
      const src1 = resolved.semiFinals.find((g) => g.gameId === src1Id);
      const src2 = resolved.semiFinals.find((g) => g.gameId === src2Id);
      if (r1 && r1.winner) {
        f.team1 = r1.winner;
        f.seed1 = src1 && r1.winner === src1.team1 ? src1.seed1 : src1 ? src1.seed2 : null;
      }
      if (r2 && r2.winner) {
        f.team2 = r2.winner;
        f.seed2 = src2 && r2.winner === src2.team1 ? src2.seed1 : src2 ? src2.seed2 : null;
      }
    }
  });

  return resolved;
}

export default function BracketDisplay({ bracket, highlightTeam, gameResults, onTeamClick, onGameClick }) {
  const results = gameResults || getGameResults();
  const resolved = resolveBracket(bracket, results);

  const qf = resolved.quarterFinals;
  const sf = resolved.semiFinals;
  const final = resolved.final;

  const finalResult = results[final[0]?.gameId];
  const champion = finalResult?.winner || null;

  const boxProps = { highlightTeam, onTeamClick, onGameClick };

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth: '700px' }} className="px-2 py-4">
        {/* Round labels - separate row so they don't affect alignment */}
        <div className="flex mb-2">
          <div className="w-44 shrink-0 text-xs text-gray-500 uppercase tracking-wide text-center">Quarter-Finals</div>
          <div className="w-8 shrink-0" />
          <div className="w-44 shrink-0 text-xs text-gray-500 uppercase tracking-wide text-center">Semi-Finals</div>
          <div className="w-8 shrink-0" />
          <div className="w-44 shrink-0 text-xs text-gray-500 uppercase tracking-wide text-center">Final</div>
        </div>

        {/* Bracket body - fixed height, justify-around aligns boxes perfectly */}
        <div className="flex" style={{ height: '340px' }}>
          {/* QF Column: 4 matchups distributed evenly */}
          <div className="w-44 shrink-0 flex flex-col justify-around">
            {qf.map((game) => (
              <MatchupBox key={game.gameId} game={game} result={results[game.gameId]} {...boxProps} />
            ))}
          </div>

          {/* QF→SF connectors: two bracket shapes, one per QF pair */}
          <div className="w-8 shrink-0 flex flex-col">
            {[0, 1].map((i) => (
              <div key={i} className="flex-1 flex flex-col">
                <div className="flex-1" />
                <div className="flex-1 border-b-2 border-r-2 border-navy-600 rounded-br" />
                <div className="flex-1 border-t-2 border-r-2 border-navy-600 rounded-tr" />
                <div className="flex-1" />
              </div>
            ))}
          </div>

          {/* SF Column: 2 matchups distributed evenly */}
          <div className="w-44 shrink-0 flex flex-col justify-around">
            {sf.map((game) => (
              <MatchupBox key={game.gameId} game={game} result={results[game.gameId]} {...boxProps} />
            ))}
          </div>

          {/* SF→Final connector: single bracket shape */}
          <div className="w-8 shrink-0 flex flex-col">
            <div className="flex-1" />
            <div className="flex-1 border-b-2 border-r-2 border-navy-600 rounded-br" />
            <div className="flex-1 border-t-2 border-r-2 border-navy-600 rounded-tr" />
            <div className="flex-1" />
          </div>

          {/* Final Column */}
          <div className="w-44 shrink-0 flex flex-col justify-center">
            <MatchupBox game={final[0]} result={results[final[0]?.gameId]} {...boxProps} />
            {champion && (
              <div className="mt-3 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Champion</div>
                <div className="text-green-400 font-bold text-lg mt-1">{champion}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
