const logoUrl = import.meta.env.BASE_URL + 'covenant-logo.png';

export default function TopBar({ onBack, onSearchOpen, onChildOpen, onCourtKeyOpen, selectedChild }) {
  return (
    <header
      className="sticky top-0 z-20 bg-navy-800 border-b border-navy-700"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-12">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-gray-400 hover:text-white p-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img src={logoUrl} alt="" className="h-7" />
          <span className="text-green-400 font-bold text-sm hidden sm:inline">Tournament Central</span>
        </div>

        <div className="flex items-center gap-1">
          {onCourtKeyOpen && (
            <button data-tutorial="court-button" onClick={onCourtKeyOpen} className="text-gray-400 hover:text-white p-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <circle cx="12" cy="11" r="3" />
              </svg>
            </button>
          )}
          <button data-tutorial="search-button" onClick={onSearchOpen} className="text-gray-400 hover:text-white p-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <button data-tutorial="child-button" onClick={onChildOpen} className="text-gray-400 hover:text-white p-2 relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {selectedChild && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
