import { useState, useEffect, useRef } from 'react';
import { divisions, getTeamsByDivision, isTeamEliminated, getTeamNextGame, getGameResults, courts, teams } from '../data/tournamentData';

// Build flat list of all players
const allPlayers = [];
teams.forEach((team) => {
  team.roster.forEach((player) => {
    allPlayers.push({ name: player, teamName: team.name, division: team.division });
  });
});

export default function TeamsView({ selectedChild, focusTeam, onFocusHandled, onGameClick }) {
  const [expandedTeams, setExpandedTeams] = useState(() => {
    const initial = new Set();
    if (selectedChild) initial.add(selectedChild.teamName);
    return initial;
  });
  const [gameResults, setGameResults] = useState(getGameResults());
  const focusRef = useRef(null);
  const prevFocusTeam = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDrop, setShowSearchDrop] = useState(false);
  const searchInputRef = useRef(null);
  const searchDropRef = useRef(null);

  useEffect(() => {
    function handleFocus() { setGameResults(getGameResults()); }
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    if (focusTeam && focusTeam !== prevFocusTeam.current) {
      prevFocusTeam.current = focusTeam;
      setExpandedTeams((prev) => new Set([...prev, focusTeam]));
      setTimeout(() => {
        if (focusRef.current) {
          focusRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (onFocusHandled) onFocusHandled();
      }, 100);
    }
  }, [focusTeam, onFocusHandled]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchDropRef.current && !searchDropRef.current.contains(e.target) &&
          searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        setShowSearchDrop(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDrop(false);
      return;
    }
    const lower = val.toLowerCase();
    const matches = allPlayers.filter((p) => p.name.toLowerCase().includes(lower));
    setSearchResults(matches);
    setShowSearchDrop(matches.length > 0);
  }

  function handleSearchSelect(player) {
    setSearchQuery('');
    setShowSearchDrop(false);
    if (searchInputRef.current) searchInputRef.current.blur();
    setExpandedTeams((prev) => new Set([...prev, player.teamName]));
    setTimeout(() => {
      const el = document.getElementById(`team-card-${player.teamName}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  function toggleTeam(name) {
    setExpandedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  function expandAll() {
    const all = new Set();
    divisions.forEach((div) => {
      getTeamsByDivision(div).forEach((t) => all.add(t.name));
    });
    setExpandedTeams(all);
  }

  function collapseAll() {
    setExpandedTeams(new Set());
  }

  const allExpanded = (() => {
    let total = 0;
    divisions.forEach((div) => { total += getTeamsByDivision(div).length; });
    return expandedTeams.size >= total;
  })();

  return (
    <div>
      {/* Player search */}
      <div className="relative mb-4">
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => { if (searchResults.length > 0) setShowSearchDrop(true); }}
          placeholder="Search for a player to find their team..."
          className="w-full px-3 py-2 rounded-lg bg-navy-700 text-white placeholder-gray-400 border border-navy-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none text-base"
        />
        {showSearchDrop && (
          <div
            ref={searchDropRef}
            className="absolute z-50 w-full mt-1 bg-navy-800 border border-navy-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            {searchResults.map((player, i) => (
              <button
                key={`${player.name}-${player.teamName}`}
                onClick={() => handleSearchSelect(player)}
                className={`w-full text-left px-3 py-2 hover:bg-navy-700 transition-colors text-sm ${
                  i < searchResults.length - 1 ? 'border-b border-navy-700' : ''
                }`}
              >
                <span className="text-white font-medium">{player.name}</span>
                <span className="text-gray-400 text-xs ml-2">
                  — {player.teamName} ({player.division})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">All Teams</h3>
        <button
          onClick={allExpanded ? collapseAll : expandAll}
          className="text-green-400 hover:text-green-300 text-sm font-medium"
        >
          {allExpanded ? 'Collapse All Rosters' : 'Expand All Rosters'}
        </button>
      </div>

      {divisions.map((div) => {
        const divTeams = getTeamsByDivision(div);
        if (divTeams.length === 0) return null;

        return (
          <div key={div} className="mb-6">
            <h3 className="text-lg font-bold text-green-400 mb-3">{div}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {divTeams.sort((a, b) => a.seed - b.seed).map((team) => {
                const isChildTeam = selectedChild && selectedChild.teamName === team.name && selectedChild.division === team.division;
                const isExpanded = expandedTeams.has(team.name);
                const isFocused = focusTeam === team.name;
                const eliminated = isTeamEliminated(team.name, team.division);
                const nextGame = !eliminated ? getTeamNextGame(team.name, team.division) : null;

                return (
                  <div
                    id={`team-card-${team.name}`}
                    key={`${team.name}-${team.division}`}
                    ref={isFocused ? focusRef : null}
                    className={`bg-navy-800 border rounded-lg overflow-hidden transition-all ${
                      isChildTeam ? 'border-green-500 ring-2 ring-green-500/30' :
                      isFocused ? 'border-green-400 ring-1 ring-green-400/30' :
                      'border-navy-700'
                    } ${eliminated ? 'opacity-60' : ''}`}
                  >
                    <button
                      onClick={() => toggleTeam(team.name)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-navy-750"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-gray-500 text-xs font-mono shrink-0">#{team.seed}</span>
                        <span className={`font-medium truncate ${eliminated ? 'text-gray-500 line-through' : 'text-white'}`}>
                          {team.name}
                        </span>
                        {isChildTeam && (
                          <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded shrink-0">
                            Your Team
                          </span>
                        )}
                        {eliminated && (
                          <span className="bg-red-900/50 text-red-400 text-xs px-1.5 py-0.5 rounded shrink-0">
                            Eliminated
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500 text-sm shrink-0 ml-2">{isExpanded ? '−' : '+'}</span>
                    </button>

                    {nextGame && (
                      <div
                        className="px-3 pb-2 -mt-1 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onGameClick && nextGame.game) onGameClick(nextGame.game);
                        }}
                      >
                        <span className="text-xs text-gray-400 hover:text-green-400 transition-colors">
                          Next: {nextGame.round} vs {nextGame.opponent || 'TBD'}
                          {nextGame.court && (() => {
                            const court = courts.find((c) => c.id === nextGame.court);
                            return court ? ` (${court.name})` : '';
                          })()}
                        </span>
                      </div>
                    )}

                    {isExpanded && (
                      <div className="border-t border-navy-700 px-3 py-2">
                        {team.roster.length > 0 ? (
                          <ul className="space-y-1">
                            {team.roster.map((player) => (
                              <li
                                key={player}
                                className={`text-sm ${
                                  selectedChild && selectedChild.playerName === player
                                    ? 'text-green-400 font-bold'
                                    : 'text-gray-300'
                                }`}
                              >
                                {player}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm italic">Roster not available</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
