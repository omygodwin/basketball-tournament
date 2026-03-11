import { getSelectedChildren, getActiveChildIndex, setActiveChildIndex, removeChild, clearSelectedChild } from '../../data/tournamentData';

export default function ChildSwitcher({ children, activeIndex, onSwitch, onClear, compact }) {
  if (!children || children.length === 0) return null;

  function handleSwitch(idx) {
    setActiveChildIndex(idx);
    onSwitch(idx);
  }

  function handleRemove(idx) {
    removeChild(idx);
    const updated = getSelectedChildren();
    if (updated.length === 0) {
      onClear();
    } else {
      onSwitch(getActiveChildIndex());
    }
  }

  if (children.length === 1) {
    const child = children[0];

    if (compact) {
      return (
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <span>
            <strong className="text-white">{child.playerName}</strong>
            {' \u2014 '}
            <span className="text-green-400">{child.teamName}</span>
            {' '}
            <span className="text-gray-400">({child.division})</span>
          </span>
          <button
            onClick={() => { clearSelectedChild(); onClear(); }}
            className="text-gray-400 hover:text-green-300 underline"
          >
            Change
          </button>
        </div>
      );
    }

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

  // Multiple children - compact
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-300 flex-wrap">
        {children.map((child, idx) => (
          <button
            key={`${child.playerName}-${idx}`}
            onClick={() => handleSwitch(idx)}
            className={`rounded px-2 py-0.5 transition-colors ${
              idx === activeIndex
                ? 'bg-green-800/50 text-white font-bold'
                : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
            }`}
          >
            {child.playerName}
          </button>
        ))}
        <button
          onClick={() => { clearSelectedChild(); onClear(); }}
          className="text-gray-400 hover:text-green-300 underline"
        >
          Change
        </button>
      </div>
    );
  }

  // Multiple children - full
  return (
    <div className="bg-green-900/40 border border-green-700 rounded-lg px-3 py-2 space-y-1.5">
      <div className="text-green-400 text-xs font-semibold uppercase tracking-wide">Your Children</div>
      {children.map((child, idx) => (
        <div
          key={`${child.playerName}-${idx}`}
          className={`flex items-center justify-between rounded px-2 py-1.5 text-sm cursor-pointer transition-colors ${
            idx === activeIndex
              ? 'bg-green-800/50 ring-1 ring-green-500'
              : 'hover:bg-green-900/30'
          }`}
          onClick={() => handleSwitch(idx)}
        >
          <span className={idx === activeIndex ? 'text-green-100 font-bold' : 'text-green-200'}>
            {child.playerName}
            <span className="text-green-300 ml-1">— {child.teamName}</span>
            <span className="text-green-400 ml-1">({child.division})</span>
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); handleRemove(idx); }}
            className="text-green-500 hover:text-green-300 text-xs ml-2"
            title="Remove"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
