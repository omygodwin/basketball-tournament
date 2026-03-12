import { getGameResults, schedule } from '../data/tournamentData';

// Lookup map: gameId -> schedule entry (for court/slot info)
const scheduleByGameId = {};
schedule.forEach((s) => { scheduleByGameId[s.gameId] = s; });

function MatchupBox({ game, result, highlightTeam, onTeamClick, onGameClick }) {
  const sched = scheduleByGameId[game.gameId];
  const hasResult = result && result.score1 != null;
  const isBye = game.bye && !game.team2;
  const team1 = game.team1 || 'TBD';
  const team2 = isBye ? 'BYE' : (game.team2 || 'TBD');
  const team1Won = hasResult && result.winner === game.team1;
  const team2Won = hasResult && result.winner === game.team2;

  function teamRow(name, won, lost, isHighlighted, score, isReal) {
    return (
      <div
        className={`flex items-center justify-between px-2 py-1.5 ${
          won ? 'bg-green-900/40' : lost ? 'opacity-50' : ''
        } ${isHighlighted ? 'bg-green-900/30 border-l-2 border-green-400' : ''}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
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
      className="bg-navy-800 border border-navy-600 rounded w-full overflow-hidden shadow-md cursor-pointer hover:border-navy-500 transition-colors"
      onClick={() => onGameClick && onGameClick(game)}
      title="Click for matchup details"
    >
      {sched && (
        <div className="flex items-center justify-between px-2 py-0.5 bg-navy-900/60 border-b border-navy-600">
          <span className="text-[10px] text-gray-500 font-medium">Ct {sched.court}, Gm {sched.slot}</span>
        </div>
      )}
      {teamRow(
        team1, team1Won, hasResult && !team1Won,
        highlightTeam && game.team1 === highlightTeam,
        hasResult ? result.score1 : null,
        game.team1 && game.team1 !== 'TBD'
      )}
      <div className="border-t border-navy-600" />
      {teamRow(
        team2, team2Won, hasResult && !team2Won,
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
    if (qfGame.bye) return { winner: qfGame.team1 };
    if (result && result.winner) {
      return { winner: result.winner };
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
      if (w1) { sf.team1 = w1.winner; }
      if (w2) { sf.team2 = w2.winner; }
    }
  });

  resolved.final.forEach((f) => {
    if (f.source) {
      const [src1Id, src2Id] = f.source;
      const r1 = results[src1Id];
      const r2 = results[src2Id];
      if (r1 && r1.winner) {
        f.team1 = r1.winner;
      }
      if (r2 && r2.winner) {
        f.team2 = r2.winner;
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

  /* Bracket connector: merges two feeder games into one output line.
     Uses the same technique as the print brackets — vertical bar with
     curved elbows and a horizontal output line from the midpoint. */
  function Connector({ pairs }) {
    return (
      <div className="w-10 shrink-0 flex flex-col">
        {Array.from({ length: pairs }, (_, i) => (
          <div key={i} className="flex-1 flex flex-col relative">
            <div className="flex-1" />
            <div
              className="flex-1 border-t-2 border-r-2 border-gray-600 rounded-tr-lg"
              style={{ marginRight: '50%' }}
            />
            <div
              className="flex-1 border-b-2 border-r-2 border-gray-600 rounded-br-lg"
              style={{ marginRight: '50%' }}
            />
            <div className="flex-1" />
            {/* Horizontal output line from vertical bar midpoint to next column */}
            <div
              className="absolute border-t-2 border-gray-600"
              style={{ top: 'calc(50% - 1px)', left: 'calc(50% - 2px)', right: 0 }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth: '700px' }} className="px-2 py-4">
        {/* Round labels */}
        <div className="flex mb-2">
          <div className="w-44 shrink-0 text-xs text-gray-500 uppercase tracking-wide text-center">Quarter-Finals</div>
          <div className="w-10 shrink-0" />
          <div className="w-44 shrink-0 text-xs text-gray-500 uppercase tracking-wide text-center">Semi-Finals</div>
          <div className="w-10 shrink-0" />
          <div className="w-44 shrink-0 text-xs text-gray-500 uppercase tracking-wide text-center">Final</div>
        </div>

        {/* Bracket body */}
        <div className="flex" style={{ height: '340px' }}>
          {/* QF Column */}
          <div className="w-44 shrink-0 flex flex-col justify-around">
            {qf.map((game) => (
              <MatchupBox key={game.gameId} game={game} result={results[game.gameId]} {...boxProps} />
            ))}
          </div>

          {/* QF→SF connectors: 2 pairs (each merges 2 QF games → 1 SF game) */}
          <Connector pairs={2} />

          {/* SF Column */}
          <div className="w-44 shrink-0 flex flex-col justify-around">
            {sf.map((game) => (
              <MatchupBox key={game.gameId} game={game} result={results[game.gameId]} {...boxProps} />
            ))}
          </div>

          {/* SF→Final connector: 1 pair (merges 2 SF games → 1 Final game) */}
          <Connector pairs={1} />

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
