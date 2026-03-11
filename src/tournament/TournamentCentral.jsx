import { useState, useEffect, useMemo } from 'react';
import BracketsView from './BracketsView';
import ScheduleView from './ScheduleView';
import TeamsView from './TeamsView';
import TeamPage from './TeamPage';
import ResultsView from './ResultsView';
import TopBar from './components/TopBar';
import SubTabs from './components/SubTabs';
import BottomNav from './components/BottomNav';
import SearchOverlay from './components/SearchOverlay';
import ChildSheet from './components/ChildSheet';
import MatchupModal from './components/MatchupModal';
import InstallBanner from './components/InstallBanner';
import { divisions, getBracket, getGameResults } from '../data/tournamentData';

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
  const [gameResults, setGameResults] = useState(getGameResults());
  const [showSearch, setShowSearch] = useState(false);
  const [showChildSheet, setShowChildSheet] = useState(false);
  const [subFilter, setSubFilter] = useState({
    brackets: selectedChild ? selectedChild.division : divisions[0],
    schedule: 'all',
    teams: 'all',
  });

  useEffect(() => {
    function handleFocus() { setGameResults(getGameResults()); }
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    if (selectedChild) {
      setSubFilter((prev) => ({ ...prev, brackets: selectedChild.division }));
    }
  }, [selectedChild]);

  const hasAnyChampion = divisions.some((div) => {
    const bracket = getBracket(div);
    if (!bracket || !bracket.final[0]) return false;
    const result = gameResults[bracket.final[0].gameId];
    return result && result.winner;
  });

  const bottomTabs = useMemo(() => {
    const tabs = [
      { id: 'brackets', label: 'Brackets' },
      { id: 'schedule', label: 'Schedule' },
      { id: 'teams', label: 'Teams' },
    ];
    if (hasAnyChampion) {
      tabs.push({ id: 'results', label: 'Results' });
    }
    if (selectedChild) {
      tabs.push({ id: 'myteam', label: selectedChild.teamName });
    }
    return tabs;
  }, [hasAnyChampion, selectedChild]);

  const subTabItems = useMemo(() => {
    switch (activeTab) {
      case 'brackets':
        return divisions.map((d) => ({ id: d, label: d }));
      case 'schedule':
        return [{ id: 'all', label: 'All' }, ...divisions.map((d) => ({ id: d, label: d }))];
      case 'teams':
        return [{ id: 'all', label: 'All' }, ...divisions.map((d) => ({ id: d, label: d }))];
      default:
        return [];
    }
  }, [activeTab]);

  function handleTeamClick(teamName) {
    setMatchupGame(null);
    setFocusTeam(teamName);
    setActiveTab('teams');
    setSubFilter((prev) => ({ ...prev, teams: 'all' }));
  }

  function handleGameClick(game) {
    setMatchupGame(game);
  }

  function handleTabChange(id) {
    setActiveTab(id);
    if (id !== 'teams') setFocusTeam(null);
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white flex flex-col">
      <TopBar
        onBack={onBack}
        onSearchOpen={() => setShowSearch(true)}
        onChildOpen={() => setShowChildSheet(true)}
        selectedChild={selectedChild}
      />

      <SubTabs
        items={subTabItems}
        activeId={subFilter[activeTab]}
        onChange={(id) => setSubFilter((prev) => ({ ...prev, [activeTab]: id }))}
        highlightId={selectedChild?.division}
      />

      <div className="max-w-5xl mx-auto p-4 flex-1 w-full pb-24">
        {activeTab === 'brackets' && (
          <BracketsView
            activeDivision={subFilter.brackets}
            selectedChild={selectedChild}
            onTeamClick={handleTeamClick}
            onGameClick={handleGameClick}
          />
        )}
        {activeTab === 'schedule' && (
          <ScheduleView
            filterDivision={subFilter.schedule === 'all' ? '' : subFilter.schedule}
            selectedChild={selectedChild}
            onTeamClick={handleTeamClick}
            onGameClick={handleGameClick}
          />
        )}
        {activeTab === 'teams' && (
          <TeamsView
            filterDivision={subFilter.teams}
            selectedChild={selectedChild}
            focusTeam={focusTeam}
            onFocusHandled={() => setFocusTeam(null)}
            onGameClick={handleGameClick}
          />
        )}
        {activeTab === 'results' && (
          <ResultsView gameResults={gameResults} />
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

      <BottomNav
        tabs={bottomTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <SearchOverlay
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectPlayer={(player) => {
          setFocusTeam(player.teamName);
          setActiveTab('teams');
          setSubFilter((prev) => ({ ...prev, teams: 'all' }));
        }}
      />

      <ChildSheet
        isOpen={showChildSheet}
        onClose={() => setShowChildSheet(false)}
        allChildren={allChildren}
        activeIndex={activeChildIndex}
        onSwitch={onChildSwitch}
        onClear={onClearChild}
        onSelectChild={onAddChild}
      />

      {matchupGame && (
        <MatchupModal
          game={matchupGame}
          onClose={() => setMatchupGame(null)}
          onTeamClick={handleTeamClick}
          selectedChild={selectedChild}
        />
      )}

      <InstallBanner aboveBottomNav />
    </div>
  );
}
