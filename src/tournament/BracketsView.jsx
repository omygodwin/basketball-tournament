import { getBracket, useGameResults } from '../data/tournamentData';
import BracketDisplay from './BracketDisplay';

export default function BracketsView({ activeDivision, selectedChild, onTeamClick, onGameClick }) {
  const gameResults = useGameResults();

  const bracket = getBracket(activeDivision);

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-2">{activeDivision} Bracket</h3>

      {bracket ? (
        <BracketDisplay
          bracket={bracket}
          highlightTeam={selectedChild?.teamName}
          gameResults={gameResults}
          onTeamClick={onTeamClick}
          onGameClick={onGameClick}
        />
      ) : (
        <p className="text-gray-400">No bracket data available for {activeDivision}.</p>
      )}
    </div>
  );
}
