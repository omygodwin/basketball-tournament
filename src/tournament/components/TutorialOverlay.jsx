import { useState, useEffect, useCallback, useRef } from 'react';

const TUTORIAL_KEY = 'tournament-tutorial-seen';

const STEPS = [
  {
    target: '[data-tutorial="bottom-nav"]',
    title: 'Navigate the Tournament',
    body: 'Use these tabs to switch between Brackets, Schedule, and Teams. Once you select a child, their team details will appear as the 4th tab on the right.',
    position: 'above',
    tab: null,
  },
  {
    target: '[data-tutorial="sub-tabs"]',
    title: 'Filter by Division',
    body: 'Select a division to filter by grade and gender (e.g., 3rd Boys, 4th Girls).',
    position: 'below',
    tab: null,
  },
  {
    target: '[data-tutorial="child-button"]',
    title: 'Add Your Child',
    body: 'Tap here to find and select your child to personalize the app with their schedule and team info.',
    position: 'below',
    tab: null,
  },
  {
    target: '[data-tutorial="search-button"]',
    title: 'Search Players',
    body: 'Search for any player to quickly find their team and schedule.',
    position: 'below',
    tab: null,
  },
  {
    target: '[data-tutorial="court-button"]',
    title: 'Court Locations',
    body: 'Tap to see where each court is located around the school campus.',
    position: 'below',
    tab: 'schedule',
    preview: 'court-key',
  },
  {
    target: '[data-tutorial="game-card"]',
    title: 'Game Details',
    body: 'Tap any game card to see the full matchup details, including team rosters and scores.',
    position: 'above',
    tab: 'schedule',
    preview: 'matchup',
  },
  {
    target: '[data-tutorial="team-card"]',
    title: 'Team Rosters',
    body: 'Tap any team to expand their roster and view player details.',
    position: 'below',
    tab: 'teams',
    preview: 'expand-team',
  },
];

function findTarget(selector, retries = 10) {
  return new Promise((resolve) => {
    function attempt(remaining) {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      if (remaining > 0) return setTimeout(() => attempt(remaining - 1), 80);
      resolve(null);
    }
    attempt(retries);
  });
}

function measureElement(el, pad = 6) {
  const r = el.getBoundingClientRect();
  const top = Math.max(0, r.top - pad);
  const left = Math.max(0, r.left - pad);
  const bottom = Math.min(window.innerHeight, r.bottom + pad);
  const right = Math.min(window.innerWidth, r.right + pad);
  return { top, left, width: right - left, height: bottom - top };
}

export default function TutorialOverlay({ activeTab, onTabChange, onPreview }) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const [previewActive, setPreviewActive] = useState(false);
  const [previewRect, setPreviewRect] = useState(null);
  const previewTimerRef = useRef(null);

  // Check localStorage on mount
  useEffect(() => {
    if (localStorage.getItem(TUTORIAL_KEY)) return;
    const timer = setTimeout(() => setActive(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const measureTarget = useCallback(async (stepIndex) => {
    const s = STEPS[stepIndex];
    const el = await findTarget(s.target);
    if (!el) {
      // Skip step if target not found
      if (stepIndex < STEPS.length - 1) {
        setStep(stepIndex + 1);
      } else {
        localStorage.setItem(TUTORIAL_KEY, 'true');
        setActive(false);
      }
      return;
    }
    setRect(measureElement(el));
  }, []);

  // Measure whenever step or activeTab changes (skip during preview)
  useEffect(() => {
    if (!active || previewActive) return;
    measureTarget(step);
  }, [active, step, activeTab, measureTarget, previewActive]);

  // Resize handler
  useEffect(() => {
    if (!active || previewActive) return;
    const onResize = () => measureTarget(step);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [active, step, measureTarget, previewActive]);

  // Lock scroll when active
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [active]);

  // Measure preview popup element when preview becomes active
  useEffect(() => {
    if (!previewActive) {
      setPreviewRect(null);
      return;
    }
    const stepDef = STEPS[step];
    // expand-team doesn't have a popup to spotlight
    if (!stepDef.preview || stepDef.preview === 'expand-team') return;

    let cancelled = false;
    async function measure() {
      const el = await findTarget(`[data-tutorial-preview="${stepDef.preview}"]`, 15);
      if (el && !cancelled) {
        setPreviewRect(measureElement(el, 8));
      }
    }
    measure();
    return () => { cancelled = true; };
  }, [previewActive, step]);

  // Cleanup preview timer on unmount
  useEffect(() => {
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  function clearPreview() {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    onPreview?.(null);
    setPreviewActive(false);
    setPreviewRect(null);
  }

  function close() {
    clearPreview();
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setActive(false);
  }

  function next() {
    const currentStep = STEPS[step];

    // If this step has a preview and we haven't started it yet,
    // trigger the preview for 2s then advance/close
    if (currentStep.preview && !previewActive) {
      onPreview?.(currentStep.preview);
      setPreviewActive(true);
      previewTimerRef.current = setTimeout(() => {
        onPreview?.(null);
        setPreviewActive(false);
        setPreviewRect(null);
        previewTimerRef.current = null;
        if (step >= STEPS.length - 1) {
          localStorage.setItem(TUTORIAL_KEY, 'true');
          setActive(false);
        } else {
          const nextIdx = step + 1;
          const nextDef = STEPS[nextIdx];
          if (nextDef.tab && nextDef.tab !== activeTab) {
            onTabChange(nextDef.tab);
          }
          setStep(nextIdx);
        }
      }, 2000);
      return;
    }

    // Regular advance (no preview)
    if (step >= STEPS.length - 1) {
      close();
      return;
    }
    const nextIdx = step + 1;
    const nextDef = STEPS[nextIdx];
    if (nextDef.tab && nextDef.tab !== activeTab) {
      onTabChange(nextDef.tab);
    }
    setStep(nextIdx);
  }

  if (!active) return null;

  // For expand-team preview, render transparent blocker only (no popup to spotlight)
  if (previewActive && STEPS[step].preview === 'expand-team') {
    return <div className="fixed inset-0 z-[60]" />;
  }

  // During preview for court-key/matchup, spotlight transitions to the popup
  // Use previewRect if available, otherwise keep showing the step's rect
  const displayRect = (previewActive && previewRect) ? previewRect : rect;

  if (!displayRect) return null;

  const s = STEPS[step];
  const showTooltip = !previewActive;

  // Tooltip positioning (only calculated when tooltip is visible)
  let tooltipStyle = {};
  let arrowStyle = {};
  let actualPosition = s.position;

  if (showTooltip) {
    const tooltipMaxW = Math.min(320, window.innerWidth - 32);
    tooltipStyle = {
      maxWidth: tooltipMaxW,
      width: tooltipMaxW,
    };

    tooltipStyle.left = Math.max(16, Math.min(
      rect.left + rect.width / 2 - tooltipMaxW / 2,
      window.innerWidth - tooltipMaxW - 16
    ));

    if (s.position === 'above') {
      tooltipStyle.bottom = window.innerHeight - rect.top + 12;
      // Flip if too close to top
      if (rect.top < 140) {
        actualPosition = 'below';
        delete tooltipStyle.bottom;
        tooltipStyle.top = rect.top + rect.height + 12;
      }
    } else {
      tooltipStyle.top = rect.top + rect.height + 12;
      // Flip if too close to bottom
      if (rect.top + rect.height + 140 > window.innerHeight) {
        actualPosition = 'above';
        delete tooltipStyle.top;
        tooltipStyle.bottom = window.innerHeight - rect.top + 12;
      }
    }

    // Callout arrow pointing from tooltip toward spotlight
    const spotlightCenterX = rect.left + rect.width / 2;
    const arrowX = Math.max(20, Math.min(
      spotlightCenterX - tooltipStyle.left,
      tooltipMaxW - 20
    ));

    arrowStyle = {
      position: 'absolute',
      left: arrowX - 8,
      width: 0,
      height: 0,
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
    };

    if (actualPosition === 'below') {
      arrowStyle.top = -8;
      arrowStyle.borderBottom = '8px solid #16a34a';
    } else {
      arrowStyle.bottom = -8;
      arrowStyle.borderTop = '8px solid #16a34a';
    }
  }

  return (
    <div className="fixed inset-0 z-[60]" onClick={previewActive ? undefined : close}>
      {/* Spotlight cutout — smoothly transitions between step target and preview popup */}
      <div
        className="absolute rounded-xl transition-all duration-300 ease-in-out"
        style={{
          top: displayRect.top,
          left: displayRect.left,
          width: displayRect.width,
          height: displayRect.height,
          boxShadow: '0 0 0 4px rgba(74, 222, 128, 1), 0 0 20px 5px rgba(74, 222, 128, 0.6), 0 0 0 9999px rgba(0, 0, 0, 0.75)',
          pointerEvents: 'none',
        }}
      />

      {/* Tooltip — hidden during preview phase */}
      {showTooltip && (
        <div
          className="absolute bg-navy-800 border border-green-600 rounded-xl p-4 shadow-2xl"
          style={tooltipStyle}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Callout arrow */}
          <div style={arrowStyle} />

          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl leading-none"
          >
            &times;
          </button>

          <h3 className="text-green-400 font-bold text-sm mb-1 pr-6">{s.title}</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{s.body}</p>

          <div className="flex items-center justify-between mt-3">
            <span className="text-gray-500 text-xs">{step + 1} of {STEPS.length}</span>
            <button
              onClick={next}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-1.5 rounded-lg text-sm transition-colors"
            >
              {step === STEPS.length - 1 ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
