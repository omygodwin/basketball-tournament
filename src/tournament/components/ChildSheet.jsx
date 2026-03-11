export default function ChildSheet({
  isOpen,
  onClose,
  allChildren,
  activeIndex,
  onSwitch,
  onClear,
  onAddChild,
}) {
  if (!isOpen) return null;

  const hasChildren = allChildren && allChildren.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-navy-800 rounded-t-2xl border-t border-navy-700 max-h-[60vh] overflow-y-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-700">
          <h3 className="text-lg font-bold text-white">
            {hasChildren ? 'Your Children' : 'Find Your Child'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">
            &times;
          </button>
        </div>

        <div className="p-4 space-y-2">
          {hasChildren ? (
            <>
              {allChildren.map((child, idx) => (
                <button
                  key={`${child.playerName}-${idx}`}
                  onClick={() => {
                    onSwitch(idx);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    idx === activeIndex
                      ? 'bg-green-900/30 border-green-600 text-green-400'
                      : 'bg-navy-700 border-navy-600 text-white hover:bg-navy-600'
                  }`}
                >
                  <div className="font-medium">{child.playerName}</div>
                  <div className="text-sm text-gray-400">
                    {child.teamName} &middot; {child.division}
                  </div>
                </button>
              ))}

              <div className="flex gap-2 pt-2">
                {allChildren.length < 2 && (
                  <button
                    onClick={() => {
                      onClose();
                      onAddChild();
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                  >
                    + Add Another Child
                  </button>
                )}
                <button
                  onClick={() => {
                    onClear();
                    onClose();
                  }}
                  className="flex-1 bg-navy-700 hover:bg-navy-600 text-gray-300 font-medium py-2.5 rounded-lg transition-colors text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm mb-4">
                Search for your child to get quick access to their team info and game schedule.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onAddChild();
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
              >
                Search for Your Child
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
