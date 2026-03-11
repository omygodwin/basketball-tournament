import { getGameResults } from '../data/tournamentData';

function MatchupBox({ game, result, highlightTeam, onTeamClick, onGameClick }) {
  const hasResult = result && result.score1 != null;
  const isBye = game.bye && !game.team2;
  const team1 = game.team1 || 'TBD';
  const team2 = isBye ? 'BYE' : (game.team2 || 'TBD');
  const team1Won = hasResult && result.winner === game.team1;
  const team2Won = hasResult && result.winner === game.team2;

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
      className="bg-navy-800 border border-navy-600 rounded w-48 overflow-hidden shadow-md cursor-pointer hover:border-navy-600 transition-colors shrink-0"
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

/* Connector draws lines from two source boxes to one target box */
function Connector() {
  return (
    <div className="flex flex-col w-6 shrink-0 self-stretch">
      <div className="flex-1 border-b-2 border-r-2 border-navy-600 rounded-br" />
      <div className="flex-1 border-t-2 border-r-2 border-navy-600 rounded-tr" />
    </div>
  );
}

/* Horizontal line from connector to next round box */
function HLine() {
  return (
    <div className="w-4 shrink-0 flex items-center">
      <div className="w-full border-t-2 border-navy-600" />
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
      <div className="inline-flex items-center py-4 px-2">
        {/* Labels row */}
        <div className="flex items-center">
          {/* QF + Connector + SF pairs */}
          <div className="flex flex-col gap-8">
            <div className="text-xs text-gray-500 uppercase tracking-wide text-center">Quarter-Finals</div>
            {/* Top half: QF1+QF2 → SF1 */}
            <div className="flex items-center">
              <div className="flex flex-col gap-3">
                <MatchupBox game={qf[0]} result={results[qf[0]?.gameId]} {...boxProps} />
                <MatchupBox game={qf[1]} result={results[qf[1]?.gameId]} {...boxProps} />
              </div>
              <Connector />
              <HLine />
              <MatchupBox game={sf[0]} result={results[sf[0]?.gameId]} {...boxProps} />
            </div>
            {/* Bottom half: QF3+QF4 → SF2 */}
            <div className="flex items-center">
              <div className="flex flex-col gap-3">
                <MatchupBox game={qf[2]} result={results[qf[2]?.gameId]} {...boxProps} />
                <MatchupBox game={qf[3]} result={results[qf[3]?.gameId]} {...boxProps} />
              </div>
              <Connector />
              <HLine />
              <MatchupBox game={sf[1]} result={results[sf[1]?.gameId]} {...boxProps} />
            </div>
          </div>

          {/* SF → Final connector */}
          <Connector />
          <HLine />

          {/* Final */}
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide text-center mb-2">Final</div>
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
