import { useState, useEffect } from 'react';
import {
  isStandalone,
  canNotify,
  isNotificationGranted,
  hasBeenPrompted,
  markPrompted,
  requestNotificationPermission,
  saveNotifiedResults,
} from '../utils/notifications';

export default function NotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show in standalone (installed PWA) mode
    if (!isStandalone()) return;
    // Only show if browser supports notifications
    if (!canNotify()) return;
    // Don't show if already granted or already prompted
    if (isNotificationGranted() || hasBeenPrompted()) return;

    // Small delay so app loads first
    const timer = setTimeout(() => setShow(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  async function handleAllow() {
    const granted = await requestNotificationPermission();
    if (granted) {
      // Save current results so we don't notify about old games
      saveNotifiedResults();
    }
    setShow(false);
  }

  function handleDismiss() {
    markPrompted();
    saveNotifiedResults();
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4">
      <div className="bg-navy-900 rounded-xl border border-navy-700 w-full max-w-sm p-5 text-center">
        <div className="text-4xl mb-3">&#127936;</div>
        <h3 className="text-lg font-bold text-white mb-2">Enable Notifications?</h3>
        <p className="text-gray-300 text-sm mb-4">
          Get alerted when your child&apos;s game results are posted, plus next game info and schedule updates.
        </p>
        <div className="space-y-2">
          <button
            onClick={handleAllow}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition-colors"
          >
            Enable Notifications
          </button>
          <button
            onClick={handleDismiss}
            className="w-full text-gray-400 hover:text-gray-300 text-sm py-2 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
