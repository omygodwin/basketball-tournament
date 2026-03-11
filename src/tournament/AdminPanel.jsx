import { useState, useEffect } from 'react';
import { ADMIN_PIN, divisions, getBracket, getGameResults, saveGameResult, clearGameResult, clearAllResults, clearDivisionResults, brackets } from '../data/tournamentData';
import BracketDisplay from './BracketDisplay';
import ScoreEntryModal from './components/ScoreEntryModal';

function countGames(division) {
  const bracket = brackets[division];
  if (!bracket) return { scored: 0, total: 0 };
  const allIds = [
    ...bracket.quarterFinals.map((g) => g.gameId),
    ...bracket.semiFinals.map((g) => g.gameId),
    ...bracket.final.map((g) => g.gameId),
  ];
  const results = getGameResults();
  const scored = allIds.filter((id) => results[id] && results[id].winner != null).length;
  return { scored, total: allIds.length };
}

export default function AdminPanel({ onBack }) {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [gameResults, setGameResults] = useState(getGameResults());
  const [activeDivision, setActiveDivision] = useState(divisions[0]);
  const [scoreGame, setScoreGame] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(null);

  useEffect(() => {
    function handleFocus() { setGameResults(getGameResults()); }
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  function handlePinSubmit(e) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  }

  function handleScoreSave(gameId, s1, s2, winner) {
    saveGameResult(gameId, s1, s2, winner);
    setGameResults(getGameResults());
    setScoreGame(null);
  }

  function handleClearGame(gameId) {
    clearGameResult(gameId);
    setGameResults(getGameResults());
    setScoreGame(null);
  }

  function handleClear() {
    if (showClearConfirm === 'all') {
      clearAllResults();
    } else {
      clearDivisionResults(activeDivision);
    }
    setGameResults(getGameResults());
    setShowClearConfirm(null);
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-navy-900 text-white flex items-center justify-center p-4">
        <div className="bg-navy-800 rounded-lg p-6 border border-navy-700 w-full max-w-sm">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-1"
          >
            &larr; Back
          </button>
          <h2 className="text-xl font-bold text-green-400 mb-4">Admin Access</h2>
          <form onSubmit={handlePinSubmit}>
            <input
              type="password"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinError(false); }}
              placeholder="Enter PIN"
              className="w-full px-4 py-3 rounded-lg bg-navy-700 text-white border border-navy-600 focus:border-green-500 focus:outline-none text-lg text-center tracking-widest"
              maxLength={6}
              autoFocus
            />
            {pinError && <p className="text-red-400 text-sm mt-2">Incorrect PIN</p>}
            <button
              type="submit"
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white flex flex-col">
      <div className="sticky top-0 z-20 bg-navy-900" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="bg-navy-800 border-b border-navy-700 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
            >
              &larr; Back
            </button>
            <h1 className="text-xl font-bold text-green-400">Score Entry</h1>
            <div className="w-16" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 flex-1 w-full">
        {/* Division filter buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {divisions.map((div) => {
            const { scored, total } = countGames(div);
            return (
              <button
                key={div}
                onClick={() => setActiveDivision(div)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeDivision === div
                    ? 'bg-green-600 text-white'
                    : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
                }`}
              >
                {div}
                <span className="ml-1.5 text-xs opacity-75">({scored}/{total})</span>
              </button>
            );
          })}
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{activeDivision} Bracket</h3>
        <p className="text-gray-400 text-sm mb-3">Tap a game to enter or edit the score</p>

        <BracketDisplay
          bracket={getBracket(activeDivision)}
          gameResults={gameResults}
          onGameClick={(game) => setScoreGame(game)}
        />

        {/* Clear buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setShowClearConfirm('division')}
            className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Clear {activeDivision}
          </button>
          <button
            onClick={() => setShowClearConfirm('all')}
            className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Clear All Results
          </button>
        </div>
      </div>

      {/* Score entry modal */}
      {scoreGame && (
        <ScoreEntryModal
          game={scoreGame}
          gameResults={gameResults}
          onSave={handleScoreSave}
          onClear={handleClearGame}
          onClose={() => setScoreGame(null)}
        />
      )}

      {/* Clear confirmation dialog */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowClearConfirm(null)}
        >
          <div
            className="bg-navy-900 rounded-xl border border-red-800 w-full max-w-sm p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-red-400 mb-2">
              {showClearConfirm === 'all' ? 'Clear All Results?' : `Clear ${activeDivision} Results?`}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              This will permanently remove {showClearConfirm === 'all' ? 'all saved scores' : `all scores for ${activeDivision}`}. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(null)}
                className="flex-1 bg-navy-700 hover:bg-navy-600 text-gray-300 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
