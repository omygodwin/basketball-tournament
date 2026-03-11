import { useState, useRef, useEffect } from 'react';
import { teams } from '../../data/tournamentData';

const allPlayers = [];
teams.forEach((team) => {
  team.roster.forEach((player) => {
    allPlayers.push({ name: player, teamName: team.name, division: team.division });
  });
});

export default function SearchOverlay({ isOpen, onClose, onSelectPlayer }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const lower = query.toLowerCase();
  const results = query.trim().length >= 2
    ? allPlayers.filter((p) => p.name.toLowerCase().includes(lower))
    : [];

  return (
    <div className="fixed inset-0 z-40 bg-navy-900" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-navy-700">
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1 shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a player..."
          className="flex-1 bg-transparent text-white text-base placeholder-gray-500 focus:outline-none"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-gray-500 hover:text-gray-300 p-1 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 60px)' }}>
        {query.trim().length >= 2 && results.length === 0 && (
          <div className="text-center text-gray-500 py-8">No players found</div>
        )}
        {query.trim().length < 2 && query.trim().length > 0 && (
          <div className="text-center text-gray-500 py-8">Type at least 2 characters</div>
        )}
        {query.trim().length === 0 && (
          <div className="text-center text-gray-500 py-8">Search by player name to find their team</div>
        )}
        {results.map((player, i) => (
          <button
            key={`${player.name}-${player.teamName}-${i}`}
            onClick={() => {
              onSelectPlayer(player);
              onClose();
            }}
            className="w-full text-left px-4 py-3 border-b border-navy-800 hover:bg-navy-800 transition-colors"
          >
            <span className="text-white font-medium">{player.name}</span>
            <span className="text-gray-400 text-sm ml-2">
              &mdash; {player.teamName} ({player.division})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
