import { useState } from 'react';
import { getDownstreamGameIds, getGameResults } from '../../data/tournamentData';

export default function ScoreEntryModal({ game, gameResults, onSave, onClear, onClose }) {
  const existing = gameResults[game.gameId];
  const [score1, setScore1] = useState(existing?.score1 != null ? String(existing.score1) : '');
  const [score2, setScore2] = useState(existing?.score2 != null ? String(existing.score2) : '');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const isBye = game.bye && !game.team2;
  const canSave = score1 !== '' && score2 !== '' && game.team1 && game.team2 && !isBye;

  // Find downstream games that have results and would be cleared
  const downstreamIds = existing ? getDownstreamGameIds(game.gameId) : [];
  const downstreamWithResults = downstreamIds.filter((id) => {
    const r = gameResults[id];
    return r && r.winner != null;
  });

  function handleSave(e) {
    e.preventDefault();
    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);
    if (isNaN(s1) || isNaN(s2)) return;
    const winner = s1 > s2 ? game.team1 : s2 > s1 ? game.team2 : null;
    onSave(game.gameId, s1, s2, winner);
  }

  function handleClear() {
    if (onClear) onClear(game.gameId);
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-navy-900 rounded-xl border border-navy-700 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-navy-700">
          <div>
            <h2 className="text-lg font-bold text-green-400">Enter Score</h2>
            <div className="text-sm text-gray-400">{game.gameId}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {showClearConfirm ? (
          <div className="p-4 space-y-3">
            <p className="text-white font-medium text-center">Clear this game's result?</p>
            {downstreamWithResults.length > 0 && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                <p className="text-red-400 text-sm font-medium mb-1">Warning: This will also clear results for:</p>
                <ul className="text-red-300 text-sm space-y-0.5">
                  {downstreamWithResults.map((id) => (
                    <li key={id}>&bull; {id}</li>
                  ))}
                </ul>
                <p className="text-red-400 text-xs mt-2">These games depend on this result and will need to be re-entered.</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-navy-700 hover:bg-navy-600 text-gray-300 py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors"
              >
                Clear{downstreamWithResults.length > 0 ? ` (${downstreamWithResults.length + 1} games)` : ''}
              </button>
            </div>
          </div>
        ) : isBye ? (
          <div className="p-6 text-center text-gray-400">
            <p className="text-lg font-medium text-white mb-1">{game.team1}</p>
            <p className="text-sm">First-round bye &mdash; no score needed</p>
          </div>
        ) : !game.team1 || !game.team2 ? (
          <div className="p-6 text-center text-gray-400">
            <p className="text-sm">Waiting for previous round results</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-4 space-y-4">
            <div className="bg-navy-800 rounded-lg p-3 border border-navy-700">
              <label className="block text-sm text-gray-400 mb-1">{game.team1}</label>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                className="w-full bg-navy-700 text-white border border-navy-600 rounded-lg px-3 py-3 text-center text-2xl font-bold focus:border-green-500 focus:outline-none"
                placeholder="0"
                autoFocus
              />
            </div>

            <div className="text-center text-gray-500 font-bold text-lg">VS</div>

            <div className="bg-navy-800 rounded-lg p-3 border border-navy-700">
              <label className="block text-sm text-gray-400 mb-1">{game.team2}</label>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                className="w-full bg-navy-700 text-white border border-navy-600 rounded-lg px-3 py-3 text-center text-2xl font-bold focus:border-green-500 focus:outline-none"
                placeholder="0"
              />
            </div>

            <button
              type="submit"
              disabled={!canSave}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-navy-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors text-lg"
            >
              Save Score
            </button>

            {existing && (
              <>
                <p className="text-center text-yellow-400 text-xs">
                  Existing score will be overwritten
                </p>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Clear Result
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
