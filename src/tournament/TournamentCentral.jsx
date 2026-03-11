import { useState } from 'react';
import BracketsView from './BracketsView';
import ScheduleView from './ScheduleView';
import TeamsView from './TeamsView';
import TeamPage from './TeamPage';
import ChildSwitcher from './components/ChildSwitcher';
import MatchupModal from './components/MatchupModal';
import InstallBanner from './components/InstallBanner';

const logoUrl = import.meta.env.BASE_URL + 'covenant-logo.png';

export default function TournamentCentral({
  selectedChild,
  allChildren,
  activeChildIndex,
  onChildSwitch,
  onClearChild,
  onAddChild,
  onBack,
}) {
  const [activeTab, setActiveTab] = useState('brackets');
  const [matchupGame, setMatchupGame] = useState(null);
  const [focusTeam, setFocusTeam] = useState(null);

  const tabs = [
    { id: 'brackets', label: 'Brackets' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'teams', label: 'Teams' },
  ];

  if (selectedChild) {
    tabs.push({ id: 'myteam', label: selectedChild.teamName });
  }

  function handleTeamClick(teamName) {
    setMatchupGame(null);
    setFocusTeam(teamName);
    setActiveTab('teams');
  }

  function handleGameClick(game) {
    setMatchupGame(game);
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Sticky header + tabs */}
      <div className="sticky top-0 z-20 bg-navy-900">
        {/* Header */}
        <div className="bg-navy-800 border-b border-navy-700 px-4 py-3">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
              >
                &larr; Home
              </button>
              <div className="flex items-center gap-2">
                <img src={logoUrl} alt="" className="h-7" />
                <h1 className="text-xl font-bold text-green-400">Tournament Central</h1>
              </div>
              <div className="w-16" />
            </div>
            {allChildren && allChildren.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <ChildSwitcher
                    children={allChildren}
                    activeIndex={activeChildIndex}
                    onSwitch={onChildSwitch}
                    onClear={onClearChild}
                  />
                </div>
                {allChildren.length < 2 && (
                  <button
                    onClick={onAddChild}
                    className="text-green-400 hover:text-green-300 text-xs border border-green-600 rounded-lg px-2 py-1 shrink-0"
                  >
                    + Add Child
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-navy-800 border-b border-navy-700">
          <div className="max-w-5xl mx-auto flex overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== 'teams') setFocusTeam(null);
                  }}
                  className={`flex-1 min-w-0 py-3 text-center font-semibold text-sm transition-colors relative whitespace-nowrap px-2 ${
                    isActive ? 'text-green-400' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className="truncate block">{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto p-4">
        {activeTab === 'brackets' && (
          <BracketsView
            selectedChild={selectedChild}
            onTeamClick={handleTeamClick}
            onGameClick={handleGameClick}
          />
        )}
        {activeTab === 'schedule' && (
          <ScheduleView
            selectedChild={selectedChild}
            onTeamClick={handleTeamClick}
            onGameClick={handleGameClick}
          />
        )}
        {activeTab === 'teams' && (
          <TeamsView
            selectedChild={selectedChild}
            focusTeam={focusTeam}
            onFocusHandled={() => setFocusTeam(null)}
            onGameClick={handleGameClick}
          />
        )}
        {activeTab === 'myteam' && selectedChild && (
          <TeamPage
            selectedChild={selectedChild}
            embedded
            onTeamClick={handleTeamClick}
            onGameClick={handleGameClick}
          />
        )}
      </div>

      {/* Matchup modal */}
      {matchupGame && (
        <MatchupModal
          game={matchupGame}
          onClose={() => setMatchupGame(null)}
          onTeamClick={handleTeamClick}
          selectedChild={selectedChild}
        />
      )}

      <InstallBanner />
    </div>
  );
}
