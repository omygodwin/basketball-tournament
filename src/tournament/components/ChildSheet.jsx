import { useState, useRef, useEffect } from 'react';
import { teams, removeChild, getSelectedChildren, getActiveChildIndex } from '../../data/tournamentData';

const allPlayers = [];
teams.forEach((team) => {
  team.roster.forEach((player) => {
    allPlayers.push({ name: player, teamName: team.name, division: team.division });
  });
});

export default function ChildSheet({
  isOpen,
  onClose,
  allChildren,
  activeIndex,
  onSwitch,
  onClear,
  onSelectChild,
}) {
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setShowSearch(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (showSearch) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showSearch]);

  if (!isOpen) return null;

  const hasChildren = allChildren && allChildren.length > 0;

  const lower = query.toLowerCase();
  const results = query.trim().length >= 2
    ? allPlayers.filter((p) => p.name.toLowerCase().includes(lower))
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-navy-800 rounded-t-2xl border-t border-navy-700 max-h-[70vh] overflow-y-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-700">
          <h3 className="text-lg font-bold text-white">
            {showSearch ? 'Find Your Child' : hasChildren ? 'Your Children' : 'Find Your Child'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">
            &times;
          </button>
        </div>

        <div className="p-4 space-y-2">
          {/* Search mode */}
          {(showSearch || !hasChildren) && (
            <div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by player name..."
                className="w-full px-3 py-2.5 rounded-lg bg-navy-700 text-white placeholder-gray-400 border border-navy-600 focus:border-green-500 focus:outline-none text-base"
                autoFocus
              />
              <div className="mt-2 max-h-48 overflow-y-auto">
                {query.trim().length >= 2 && results.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-3">No players found</p>
                )}
                {results.map((player, i) => (
                  <button
                    key={`${player.name}-${player.teamName}-${i}`}
                    onClick={() => {
                      onSelectChild(player);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-navy-700 rounded-lg transition-colors"
                  >
                    <span className="text-white font-medium">{player.name}</span>
                    <span className="text-gray-400 text-sm ml-2">
                      &mdash; {player.teamName} ({player.division})
                    </span>
                  </button>
                ))}
              </div>
              {hasChildren && showSearch && (
                <button
                  onClick={() => setShowSearch(false)}
                  className="text-gray-400 hover:text-gray-300 text-sm mt-2"
                >
                  &larr; Back to your children
                </button>
              )}
            </div>
          )}

          {/* Children list (when not searching) */}
          {hasChildren && !showSearch && (
            <>
              {allChildren.map((child, idx) => (
                <div
                  key={`${child.playerName}-${idx}`}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    idx === activeIndex
                      ? 'bg-green-900/30 border-green-600 text-green-400'
                      : 'bg-navy-700 border-navy-600 text-white hover:bg-navy-600'
                  }`}
                >
                  <button
                    className="flex-1 text-left"
                    onClick={() => {
                      onSwitch(idx);
                      onClose();
                    }}
                  >
                    <div className="font-medium">{child.playerName}</div>
                    <div className="text-sm text-gray-400">
                      {child.teamName} &middot; {child.division}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      removeChild(idx);
                      const updated = getSelectedChildren();
                      if (updated.length === 0) {
                        onClear();
                        onClose();
                      } else {
                        onSwitch(getActiveChildIndex());
                      }
                    }}
                    className="text-gray-500 hover:text-red-400 text-lg leading-none px-1 shrink-0"
                    title="Remove"
                  >
                    &times;
                  </button>
                </div>
              ))}

              <button
                onClick={() => setShowSearch(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm mt-2"
              >
                + Add Another Child
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
