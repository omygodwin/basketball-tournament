import { useState, useEffect } from 'react';
import { getSelectedChild, getSelectedChildren, getActiveChildIndex, saveSelectedChild, setActiveChildIndex, subscribeToResults } from '../data/tournamentData';
import PlayerSearch from './components/PlayerSearch';
import ChildSwitcher from './components/ChildSwitcher';
import TournamentCentral from './TournamentCentral';
import AdminPanel from './AdminPanel';
import InstallBanner from './components/InstallBanner';
import NotificationPrompt from './components/NotificationPrompt';
import { checkAndNotifyNewResults, saveNotifiedResults } from './utils/notifications';

const logoUrl = import.meta.env.BASE_URL + 'covenant-logo.png';

// Read #tab hash from URL (used when notification opens a new window)
function getNavParam() {
  try {
    return window.location.hash.replace('#', '') || '';
  } catch {
    return '';
  }
}

export default function TournamentApp() {
  const navParam = getNavParam();
  const [view, setView] = useState(() => navParam ? 'central' : getSelectedChild() ? 'central' : 'home');
  const [selectedChild, setSelectedChild] = useState(getSelectedChild());
  const [allChildren, setAllChildren] = useState(getSelectedChildren());
  const [activeChildIdx, setActiveChildIdx] = useState(getActiveChildIndex());
  const [navTab, setNavTab] = useState(navParam);

  // Clean URL param after reading it
  useEffect(() => {
    if (navParam) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  // Listen for NAVIGATE messages from service worker (when app is already open)
  useEffect(() => {
    function handleSWMessage(event) {
      if (event.data && event.data.type === 'NAVIGATE' && event.data.tab) {
        setView('central');
        setNavTab(event.data.tab);
      }
    }
    navigator.serviceWorker?.addEventListener('message', handleSWMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
  }, []);

  function refreshChildState() {
    setAllChildren(getSelectedChildren());
    setSelectedChild(getSelectedChild());
    setActiveChildIdx(getActiveChildIndex());
  }

  function handlePlayerSelect(player) {
    saveSelectedChild(player.name, player.teamName, player.division);
    refreshChildState();
    setView('central');
  }

  function handleClearChild() {
    setSelectedChild(null);
    setAllChildren([]);
    setActiveChildIdx(0);
  }

  function handleChildSwitch(idx) {
    setActiveChildIndex(idx);
    refreshChildState();
  }

  // Check for new game results and notify in real-time via Firebase subscription
  useEffect(() => {
    // Save initial results snapshot so we don't notify about pre-existing games
    saveNotifiedResults();

    // Subscribe to real-time results changes — notifications fire instantly
    const unsub = subscribeToResults(() => {
      checkAndNotifyNewResults();
    });
    return unsub;
  }, []);

  if (view === 'central') {
    return (
      <TournamentCentral
        selectedChild={selectedChild}
        allChildren={allChildren}
        activeChildIndex={activeChildIdx}
        onChildSwitch={handleChildSwitch}
        onClearChild={handleClearChild}
        onAddChild={handlePlayerSelect}
        onBack={() => setView('home')}
        initialTab={navTab}
        onInitialTabConsumed={() => setNavTab('')}
      />
    );
  }

  if (view === 'admin') {
    return <AdminPanel onBack={() => setView('home')} />;
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white flex flex-col items-center p-4">
      <div className="w-full max-w-lg space-y-6 text-center pt-6 pb-8">
        {/* School branding */}
        <div className="space-y-3">
          <img
            src={logoUrl}
            alt="The Covenant School"
            className="h-20 mx-auto"
          />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">March Madness</h1>
            <p className="text-green-400 font-semibold text-lg">3rd Annual 3v3 Basketball Tournament</p>
          </div>
          <div className="text-gray-300 text-sm space-y-0.5">
            <p className="font-semibold text-white text-base">Friday, March 13th</p>
            <p>Grades 3-5 &middot; Starting at 1:00 PM</p>
            <p>Single-Elimination &middot; Boys &amp; Girls Brackets</p>
          </div>
        </div>

        {/* Child banner if already selected */}
        {allChildren.length > 0 && (
          <ChildSwitcher
            children={allChildren}
            activeIndex={activeChildIdx}
            onSwitch={handleChildSwitch}
            onClear={handleClearChild}
          />
        )}

        {/* Search */}
        <div>
          <p className="text-gray-300 text-sm mb-2">
            {allChildren.length > 0 ? 'Add another child or search for a different player:' : 'Find your child\'s team, schedule & bracket:'}
          </p>
          <PlayerSearch onSelect={handlePlayerSelect} />
        </div>

        {/* Tournament Central button - always green */}
        <button
          onClick={() => setView('central')}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Tournament Central
        </button>

        {/* Scripture */}
        <div className="bg-navy-800 border border-navy-700 rounded-lg px-4 py-3 text-sm">
          <p className="text-gray-300 italic leading-relaxed">
            &ldquo;Two are better than one, because they have a good reward for their toil.
            For if they fall, one will lift up his fellow.&rdquo;
          </p>
          <p className="text-green-400 text-xs mt-1.5 font-medium">Ecclesiastes 4:9-10</p>
        </div>

        {/* Tournament info from email */}
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-4 text-left space-y-3">
          <h3 className="text-green-400 font-bold text-sm uppercase tracking-wide">Tournament Info</h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0 mt-0.5">&#9679;</span>
              <span>Friends &amp; families are welcome to attend and cheer!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0 mt-0.5">&#9679;</span>
              <span>Games played both indoors and outdoors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 shrink-0 mt-0.5">&#9679;</span>
              <span>Visit the <strong className="text-white">Tournament Central</strong> tent for rosters, game info &amp; live bracket updates</span>
            </li>
          </ul>
          <hr className="border-navy-700" />
          <div>
            <h4 className="text-gray-400 font-semibold text-xs uppercase tracking-wide mb-1">Dress Code Reminder</h4>
            <p className="text-gray-400 text-xs">
              School dress code in effect until 12:45 PM. Coordinating team uniforms are permitted during the tournament only.
            </p>
          </div>
        </div>

        {/* Admin link */}
        <button
          onClick={() => setView('admin')}
          className="text-gray-500 hover:text-gray-300 text-sm underline transition-colors"
        >
          Admin / Score Entry
        </button>
      </div>

      <InstallBanner />
      <NotificationPrompt />
    </div>
  );
}
