import { clearSelectedChild } from '../../data/tournamentData';

export default function ChildBanner({ child, onClear }) {
  if (!child) return null;

  return (
    <div className="bg-green-900/40 border border-green-700 rounded-lg px-4 py-2 flex items-center justify-between text-sm">
      <span className="text-green-200">
        Viewing as <strong className="text-green-100">{child.playerName}</strong>
        {' — '}
        <span className="text-green-300">{child.teamName}</span>
        {' '}
        <span className="text-green-400">({child.division})</span>
      </span>
      <button
        onClick={() => { clearSelectedChild(); onClear(); }}
        className="ml-3 text-green-400 hover:text-green-200 underline text-xs"
      >
        Change
      </button>
    </div>
  );
}
