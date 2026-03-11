export default function SubTabs({ items, activeId, onChange, highlightId }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="sticky top-12 z-10 bg-navy-900 border-b border-navy-700">
      <div className="max-w-5xl mx-auto overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 py-2 min-w-max">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeId === item.id
                  ? 'bg-green-600 text-white'
                  : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
              } ${highlightId && highlightId === item.id ? 'ring-2 ring-green-400' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
