/**
 * AURA OFF — src/main.js
 *
 * Boot. Import, wire, start. Nothing else lives here, and it should stay
 * readable at a glance.
 *
 * The engine imports no data (CONTRACT.md §0 note): the move library and the
 * campaign are read HERE and handed down, which is why a bad row in a data
 * file can never stop the engine loading and why the simulator is free to
 * sweep content variants the shipped game never sees.
 */

import { MOVES } from './data/moves.js';
import { CAMPAIGN } from './data/campaign.js';
import { createGame } from './ui/game.js';

/**
 * The stage is `height: var(--app-h, 100dvh)`. Never measure `innerHeight` for
 * this — on iOS it reports the layout viewport, which includes the space under
 * the browser chrome, so the deck ends up below the fold exactly when the
 * player needs to tap it. `visualViewport` is what is actually on screen.
 */
function syncViewport() {
  const vv = window.visualViewport;
  const write = function () {
    const h = vv && vv.height ? vv.height : window.innerHeight;
    if (h > 0) document.documentElement.style.setProperty('--app-h', h + 'px');
  };
  write();
  if (vv && vv.addEventListener) {
    vv.addEventListener('resize', write);
    vv.addEventListener('scroll', write);
  } else {
    window.addEventListener('resize', write);
  }
  window.addEventListener('orientationchange', function () { setTimeout(write, 220); });
}

/**
 * The page must never scroll and never zoom on a double tap. The stylesheet
 * already sets `overflow:hidden` and per-control `touch-action`; this catches
 * the one gesture CSS cannot, which is a two-finger pinch inside the arena.
 */
function lockGestures() {
  const stop = function (e) { if (e.cancelable) e.preventDefault(); };
  document.addEventListener('gesturestart', stop, { passive: false });
  document.addEventListener('dblclick', stop, { passive: false });
}

function boot() {
  syncViewport();
  lockGestures();
  createGame({ moves: MOVES, campaign: CAMPAIGN, doc: document }).start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
