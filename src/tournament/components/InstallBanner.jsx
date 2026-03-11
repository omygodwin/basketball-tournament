import { useState, useEffect } from 'react';

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}

const DISMISSED_KEY = 'tournament-install-dismissed';
const INSTALLED_KEY = 'tournament-app-installed';

export default function InstallBanner({ aboveBottomNav }) {
  const [show, setShow] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (!isMobileDevice() || isStandalone()) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;
    if (localStorage.getItem(INSTALLED_KEY)) return;
    setShow(true);

    function handleBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    function handleAppInstalled() {
      localStorage.setItem(INSTALLED_KEY, 'true');
      setShow(false);
      setShowInfo(false);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setShow(false);
  }

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem(INSTALLED_KEY, 'true');
      }
      setDeferredPrompt(null);
      setShow(false);
      setShowInfo(false);
    }
  }

  if (!show) return null;

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  return (
    <>
      <div
        className="fixed left-0 right-0 z-50 bg-navy-800 border-t border-navy-600 p-4"
        style={{ bottom: aboveBottomNav ? 'calc(3.5rem + env(safe-area-inset-bottom, 0px))' : 0, paddingBottom: aboveBottomNav ? undefined : 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Add to Home Screen</p>
            <p className="text-gray-400 text-xs">Get notifications for game results</p>
          </div>
          <button
            onClick={() => setShowInfo(true)}
            className="text-green-400 hover:text-green-300 text-xs underline shrink-0"
          >
            How?
          </button>
          {deferredPrompt ? (
            <button
              onClick={handleInstall}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg text-sm shrink-0"
            >
              Install
            </button>
          ) : (
            <button
              onClick={() => setShowInfo(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg text-sm shrink-0"
            >
              Add App
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-300 text-lg leading-none"
          >
            &times;
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-end sm:items-center justify-center p-4" onClick={() => setShowInfo(false)}>
          <div
            className="bg-navy-900 rounded-xl border border-navy-700 w-full max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-green-400">Add to Home Screen</h3>
              <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-white text-xl">&times;</button>
            </div>

            <div className="text-gray-300 text-sm space-y-3">
              {deferredPrompt && (
                <>
                  <button
                    onClick={handleInstall}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-lg"
                  >
                    Install Now
                  </button>
                  <p className="text-center text-gray-500 text-xs">or follow the manual steps below</p>
                  <hr className="border-navy-700" />
                </>
              )}

              <p className="font-semibold text-white">Why add this app?</p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Creates an icon on your home screen for quick access</li>
                <li>Opens in full screen like a real app</li>
              </ul>

              <hr className="border-navy-700" />

              <p className="font-semibold text-white">Notifications &amp; Updates</p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li><strong className="text-green-400">Enable notifications</strong> to get alerted when your child&apos;s game results are posted</li>
                <li>Get next game info and schedule updates for your child&apos;s team</li>
                <li>Select your child for personalized team info</li>
              </ul>

              <hr className="border-navy-700" />

              {isIOS ? (
                <>
                  <p className="font-semibold text-white">How to install:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-400">
                    <li>
                      Tap the <strong className="text-white">Share</strong> button{' '}
                      <svg className="inline-block w-4 h-4 text-white align-text-bottom" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v12m0-12l-4 4m4-4l4 4" />
                      </svg>
                    </li>
                    <li>Tap <strong className="text-white">Add to Home Screen</strong> (you may need to scroll or tap <strong className="text-white">More</strong> to find it)</li>
                    <li>Tap <strong className="text-white">Add</strong></li>
                  </ol>
                </>
              ) : isAndroid ? (
                <>
                  <p className="font-semibold text-white">How to install:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-400">
                    <li>Tap the <strong className="text-white">menu</strong> (three dots) in your browser</li>
                    <li>Tap <strong className="text-white">Add to Home screen</strong> or <strong className="text-white">Install app</strong></li>
                    <li>Tap <strong className="text-white">Install</strong></li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-semibold text-white">How to install:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-400">
                    <li>Tap the <strong className="text-white">menu</strong> in your browser</li>
                    <li>Look for <strong className="text-white">Add to Home screen</strong> or <strong className="text-white">Install app</strong></li>
                  </ol>
                </>
              )}
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="w-full mt-4 bg-navy-700 hover:bg-navy-600 text-gray-300 font-bold py-2 rounded-lg"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
