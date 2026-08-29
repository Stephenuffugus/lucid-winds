// AURA OFF — test/integration.js
//
// Boots the REAL index.html in jsdom, loads the REAL ES module graph, and
// plays a whole battle to the result screen by driving the shipped controls.
//
//   node test/integration.js      exit 0 = clean, exit 1 = named failures
//
// WHAT THIS FILE IS FOR
// ---------------------
// `validate.js` reads the data and `balance-sim.js` calls the engine. Neither
// of them can see the three things that actually take a browser build down:
//
//   1. a `querySelector` that matches nothing,
//   2. an id that got renamed on one side of the seam and not the other,
//   3. a listener bound to a button that is not in the document any more.
//
// All three are invisible to a unit test and all three are total. So this file
// opens the real shell, asserts every id in CONTRACT.md §11 is present and
// unique, and then plays nine rounds the way a thumb does: tap a card in
// `#grid`, press `#holdpad`, watch the needle, release on the light. Every
// claim it makes is read back off the DOM the game actually painted.
//
// THE CLOCK IS OURS
// -----------------
// Nothing here waits on a real timer and nothing polls `requestAnimationFrame`
// hoping a frame shows up. `performance.now`, `requestAnimationFrame` and
// `setTimeout` are replaced with a virtual clock that only moves when this
// file moves it, so a turn lands on an exact millisecond, the needle is where
// arithmetic says it is, and the suite is deterministic and cannot hang.
// `Math.random` is seeded for the same reason — `createMatch()` takes its seed
// from it, so the battle replays identically every run.
//
// A PROBE THAT CANNOT FAIL IS NOT EVIDENCE
// ----------------------------------------
// The last section (NEGATIVE CONTROLS) deliberately breaks the build in memory
// — renames an id, cuts a button's listener, releases the hold without ever
// pressing it — and requires the matching assertion to FAIL. If a check cannot
// be made to fail, the suite reports the CHECK as broken, because an assertion
// nobody has watched fail is decoration.
//
// WHAT THIS FILE CANNOT SEE
// -------------------------
// jsdom has no layout engine. Rendered geometry — the 48px touch targets of
// CONTRACT §11 — is NOT measured here and must not be claimed here; that is a
// real-browser measurement at 375×667. What jsdom does resolve is the cascade,
// so `src/ui/style.css` is loaded for real and "can this be tapped right now"
// is answered from computed `display` / `visibility` / `pointer-events`,
// not from "the element exists".

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

import { MOVES_BY_ID } from '../src/data/moves.js';
import { CAMPAIGN } from '../src/data/campaign.js';
import { AMP_RANGE } from '../src/engine/battle.js';
import { SAVE_KEY } from '../src/ui/save.js';

/* ========================================================================== */
/* PATHS                                                                      */
/* ========================================================================== */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const MAIN_PATH = path.join(ROOT, 'src', 'main.js');
const INDEX_HTML = fs.readFileSync(INDEX_PATH, 'utf8');

/** Real timers, captured before the virtual clock takes the globals. */
const realSetTimeout = globalThis.setTimeout;
const realClearTimeout = globalThis.clearTimeout;

/* ========================================================================== */
/* CONTRACT §11 — THE DOM CONTRACT, TRANSCRIBED                               */
/* ========================================================================== */

/**
 * Every id named in CONTRACT.md §11, in the order the contract lists them.
 * The UI "must drive exactly these. Do not rename; do not invent siblings."
 */
const CONTRACT_IDS = Object.freeze([
  'top', 'crowd', 'meterFill', 'mcbar', 'roundLabel', 'foeLabel',
  'arena', 'you', 'them',
  'calloutYou', 'calloutThem', 'nameYou', 'nameThem', 'statusYou', 'statusThem',
  'deck', 'prompt', 'grid', 'hypeFill', 'blendBtn',
  'timing', 'timingTitle', 'track', 'zoneOuter', 'zoneCore', 'needle',
  'ampFill', 'ampIdeal', 'timingHint', 'holdpad',
  'fit', 'fitGrid', 'fitGo',
  'result', 'resultTitle', 'resultUnlock', 'resultLog', 'againBtn',
  'map', 'mapSub', 'actList',
  'title', 'startBtn', 'howBtn'
]);

/**
 * The class-named parts §11 requires inside a container: `#arena .floor`, and
 * the four parts every fighter carries. Written as [container, part, id] so
 * the audit can also prove `#you .callout` and `#calloutYou` are one node and
 * not two that drifted apart.
 */
const CONTRACT_PARTS = Object.freeze([
  ['#arena', '.floor', null],
  ['#you', '.aura', null],
  ['#you', '.callout', 'calloutYou'],
  ['#you', '.movename', 'nameYou'],
  ['#you', '.statusrow', 'statusYou'],
  ['#them', '.aura', null],
  ['#them', '.callout', 'calloutThem'],
  ['#them', '.movename', 'nameThem'],
  ['#them', '.statusrow', 'statusThem']
]);

/** §11: `.screen` toggles with class `on`. */
const SCREEN_IDS = Object.freeze(['fit', 'result', 'map', 'title']);

/** §11: turn state is `<body data-state>`. */
const STATES = Object.freeze(['ready', 'timing', 'resolving', 'over']);

/* ========================================================================== */
/* FAILURE COLLECTION                                                         */
/* ========================================================================== */

/** A named assertion failure. Distinct from a crash, which is also a failure
 *  but a different kind of news. */
class Broke extends Error {
  constructor(message) { super(message); this.name = 'Broke'; }
}

const failures = [];
let checks = 0;

/** Assert. The message must name what broke, not that something did. */
function must(cond, message) {
  checks++;
  if (!cond) throw new Broke(message);
}

function fail(message) {
  failures.push(message);
}

/* ========================================================================== */
/* THE VIRTUAL CLOCK                                                          */
/* ========================================================================== */

/**
 * Everything time-shaped in the app, under this file's control:
 * `performance.now`, `requestAnimationFrame`, `setTimeout`.
 *
 * Frames only happen when `advanceTo` says so, timers only fire at the exact
 * millisecond they were due, and nothing here ever touches a real timer. That
 * is what makes "release the hold at t = 2875ms, when the needle is dead
 * centre" a statement of fact rather than a hope.
 */
function createClock() {
  let now = 0;
  let seq = 1;
  const timers = new Map();
  let frames = [];

  const setTimeoutFn = function (fn, ms) {
    const id = seq++;
    const args = Array.prototype.slice.call(arguments, 2);
    const delay = typeof ms === 'number' && isFinite(ms) && ms > 0 ? ms : 0;
    timers.set(id, { id: id, at: now + delay, fn: fn, args: args });
    return id;
  };

  const clearTimeoutFn = function (id) { timers.delete(id); };

  const rafFn = function (cb) {
    const id = seq++;
    frames.push({ id: id, cb: cb });
    return id;
  };

  const cafFn = function (id) {
    frames = frames.filter(function (f) { return f.id !== id; });
  };

  /** Next timer due at or before `t`, earliest first, ties by schedule order. */
  function nextDue(t) {
    let best = null;
    for (const timer of timers.values()) {
      if (timer.at > t) continue;
      if (!best || timer.at < best.at || (timer.at === best.at && timer.id < best.id)) best = timer;
    }
    return best;
  }

  /**
   * Move the clock to exactly `t`: fire every timer due on the way, in time
   * order, then run one animation frame at `t`.
   * @param {number} t
   * @param {Function} [sample] called after every callback, to record the HUD
   */
  function advanceTo(t, sample) {
    for (;;) {
      const due = nextDue(t);
      if (!due) break;
      now = Math.max(now, due.at);
      timers.delete(due.id);
      due.fn.apply(null, due.args);
      if (sample) sample();
    }
    now = t;
    const batch = frames;
    frames = [];
    for (let i = 0; i < batch.length; i++) batch[i].cb(now);
    if (sample) sample();
  }

  return {
    now: function () { return now; },
    setTimeout: setTimeoutFn,
    clearTimeout: clearTimeoutFn,
    requestAnimationFrame: rafFn,
    cancelAnimationFrame: cafFn,
    advanceTo: advanceTo,
    pending: function () { return { timers: timers.size, frames: frames.length }; }
  };
}

/** mulberry32 — the same generator the engine uses, so `Math.random` is a
 *  reproducible stream and `createMatch()` picks the same seed every run. */
function seededRandom(seed) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ========================================================================== */
/* BOOTING THE REAL PAGE                                                      */
/* ========================================================================== */

/**
 * jsdom does not execute `<script type="module">`, so the module graph is
 * imported here instead — the same files, the same entry point, evaluated
 * against the document parsed out of the real index.html. The audit below
 * proves index.html still points at that entry point, so a renamed `main.js`
 * cannot pass this suite by being quietly bypassed.
 */
let bootSeq = 0;

/** How far the clock moves per pump step. Small enough that a 1400ms clip gets
 *  ~70 frames; landings are exact regardless, because `pumpTo` clamps. */
const STEP = 20;

/** The needle's core zone is dead centre, so it is over the light at the
 *  midpoint of every traverse. `sweepMs` is 1150 in `ui/timing.js`; the driver
 *  does not assume that number — it picks a release moment, asserts the panel
 *  reported PERFECT, and fails by name if the sweep ever moves. */
const CORE_FIRST = 575;
const CORE_PERIOD = 1150;
const CORE_LAST = 5000;

/** The calibration hold, used once per run to learn the amplitude rise rate
 *  off `#ampFill` the way a player learns it off the bar. */
const CALIB_HOLD = 700;

async function boot(opts) {
  const o = opts || {};

  const dom = new JSDOM(INDEX_HTML, {
    runScripts: 'outside-only',
    pretendToBeVisual: false,
    url: 'https://aura-off.test/'
  });
  const win = dom.window;
  const doc = win.document;

  // Wait for the parse to finish, on a real timer, before the virtual clock
  // takes over. `main.js` boots on DOMContentLoaded or immediately if the
  // document is already complete, and we want the second path — deterministic.
  await new Promise(function (res, rej) {
    if (doc.readyState === 'complete') return res();
    const guard = realSetTimeout(function () { rej(new Error('index.html never finished loading in jsdom')); }, 10000);
    win.addEventListener('load', function () { realClearTimeout(guard); res(); }, { once: true });
  });

  // The stylesheet is a <link> and jsdom fetches nothing, so load it by hand
  // from the href the page actually declares. Without it every element
  // computes `display: block` and "is this control reachable?" is unanswerable.
  const link = doc.querySelector('link[rel="stylesheet"]');
  if (!link) throw new Broke('index.html has no <link rel="stylesheet"> — the UI ships unstyled');
  const cssHref = link.getAttribute('href');
  const cssPath = path.join(ROOT, cssHref);
  if (!fs.existsSync(cssPath)) {
    throw new Broke('index.html links "' + cssHref + '" but ' + cssPath + ' does not exist');
  }
  const styleNode = doc.createElement('style');
  styleNode.setAttribute('data-integration', 'style.css');
  styleNode.textContent = fs.readFileSync(cssPath, 'utf8');
  doc.head.appendChild(styleNode);

  // A negative control gets to vandalise the shell before anything is wired.
  if (typeof o.beforeBoot === 'function') o.beforeBoot(doc, win);

  const clock = createClock();
  const restore = installGlobals(win, clock, o.seed == null ? 0x51ee7ed : o.seed);

  const world = {
    dom: dom, window: win, doc: doc, clock: clock,
    trace: { states: [], mc: [], meter: [], crowd: [], hype: [] },
    last: {}
  };

  world.sample = function () { sampleHud(world); };

  try {
    await import(pathToFileURL(MAIN_PATH).href + '?integration=' + (++bootSeq));
  } catch (e) {
    restore();
    win.close();
    throw new Broke('importing src/main.js threw: ' + (e && e.message ? e.message : String(e)));
  }

  world.sample();

  world.teardown = function () {
    restore();
    try { win.close(); } catch (e) { /* already gone */ }
  };

  world.pumpTo = function (t) {
    const target = Math.max(t, clock.now());
    do {
      clock.advanceTo(Math.min(target, clock.now() + STEP), world.sample);
    } while (clock.now() < target);
  };

  world.pump = function (ms) { world.pumpTo(clock.now() + ms); };

  world.until = function (pred, budgetMs, what) {
    const stop = clock.now() + budgetMs;
    while (clock.now() < stop) {
      if (pred()) return;
      clock.advanceTo(Math.min(stop, clock.now() + STEP), world.sample);
    }
    must(pred(), what + ' — waited ' + budgetMs + 'ms of game time and it never happened');
  };

  return world;
}

/**
 * Point the module graph's globals at this jsdom window and this clock.
 * `src/` runs in Node's realm (it was imported here), so these are the globals
 * it will actually resolve at call time.
 */
function installGlobals(win, clock, seed) {
  const saved = [];
  const set = function (name, value) {
    saved.push([name, Object.getOwnPropertyDescriptor(globalThis, name)]);
    Object.defineProperty(globalThis, name, {
      value: value, writable: true, configurable: true, enumerable: false
    });
  };

  set('window', win);
  set('document', win.document);
  set('Element', win.Element);
  set('performance', { now: function () { return clock.now(); } });
  set('requestAnimationFrame', clock.requestAnimationFrame);
  set('cancelAnimationFrame', clock.cancelAnimationFrame);
  set('setTimeout', clock.setTimeout);
  set('clearTimeout', clock.clearTimeout);

  const realRandom = Math.random;
  Math.random = seededRandom(seed);

  return function restore() {
    for (let i = saved.length - 1; i >= 0; i--) {
      const name = saved[i][0];
      const desc = saved[i][1];
      if (desc) Object.defineProperty(globalThis, name, desc);
      else delete globalThis[name];
    }
    Math.random = realRandom;
  };
}

/* ========================================================================== */
/* READING THE PAGE BACK                                                      */
/* ========================================================================== */

function byId(world, id) { return world.doc.getElementById(id); }
function text(world, id) {
  const node = byId(world, id);
  return node ? node.textContent.trim() : null;
}
function hasOn(world, id) {
  const node = byId(world, id);
  return !!node && node.classList.contains('on');
}
function state(world) { return world.doc.body.getAttribute('data-state'); }

/** A short, human name for an element, for failure messages. */
function describe(el) {
  if (!el) return '(null)';
  let s = el.tagName ? el.tagName.toLowerCase() : '(node)';
  if (el.id) s += '#' + el.id;
  const dataId = el.getAttribute && el.getAttribute('data-id');
  if (dataId) s += '[data-id="' + dataId + '"]';
  else if (el.className && typeof el.className === 'string' && el.className) {
    s += '.' + el.className.trim().split(/\s+/).join('.');
  }
  return s;
}

/**
 * Can a thumb land on this right now? Not "does the element exist" — the whole
 * point of this suite is that existing is not the same as being reachable.
 * Walks to the root through the real cascade.
 *
 * @returns {string|null} null when tappable, otherwise the reason it is not
 */
function blockedBecause(world, node) {
  if (!node) return 'the element is not in the document at all';
  if (!node.isConnected) return describe(node) + ' is detached from the document';
  if (node.disabled) return describe(node) + ' is disabled';
  const w = world.window;
  let el = node;
  while (el && el.nodeType === 1) {
    const cs = w.getComputedStyle(el);
    if (cs.display === 'none') {
      return describe(node) + ' is hidden — ' + describe(el) + ' computes display:none';
    }
    if (cs.visibility === 'hidden') {
      return describe(node) + ' is hidden — ' + describe(el) + ' computes visibility:hidden';
    }
    if (cs.pointerEvents === 'none') {
      return describe(node) + ' cannot be tapped — ' + describe(el) + ' computes pointer-events:none';
    }
    el = el.parentElement;
  }
  return null;
}

/** Record anything on the HUD that changed. Called after every callback. */
function sampleHud(world) {
  const t = world.trace;
  const last = world.last;
  const doc = world.doc;

  const st = doc.body.getAttribute('data-state');
  if (st !== last.state) { t.states.push(st); last.state = st; }

  const mcbar = doc.getElementById('mcbar');
  const mc = mcbar ? mcbar.textContent : null;
  if (mc !== last.mc) { t.mc.push(mc); last.mc = mc; }

  const meterFill = doc.getElementById('meterFill');
  const meter = meterFill ? meterFill.style.width : null;
  if (meter !== last.meter) { t.meter.push(meter); last.meter = meter; }

  const crowdEl = doc.getElementById('crowd');
  const crowd = crowdEl ? crowdEl.children.length : -1;
  if (crowd !== last.crowd) { t.crowd.push(crowd); last.crowd = crowd; }

  const hypeEl = doc.getElementById('hypeFill');
  const hype = hypeEl ? hypeEl.style.width : null;
  if (hype !== last.hype) { t.hype.push(hype); last.hype = hype; }
}

/* ========================================================================== */
/* DRIVING THE REAL CONTROLS                                                  */
/* ========================================================================== */

/**
 * Dispatch a genuine, bubbling event at a node — never `el.click()`. The proof
 * that a control works is never the dispatch; it is the assertion that follows
 * it about what the page did next.
 */
function fire(world, node, type, ctor) {
  const w = world.window;
  const Ctor = w[ctor];
  const ev = new Ctor(type, { bubbles: true, cancelable: true, view: w });
  node.dispatchEvent(ev);
  world.sample();
  return ev;
}

/** Tap something, after proving a thumb could actually have landed on it. */
function tap(world, node, what) {
  const why = blockedBecause(world, node);
  must(!why, 'cannot tap ' + what + ': ' + why);
  fire(world, node, 'click', 'MouseEvent');
}

/** `#ampFill` / `#ampIdeal` are painted as a percentage of AMP_RANGE. */
function ampFromPct(pctString) {
  const pct = parseFloat(pctString);
  if (!isFinite(pct)) return NaN;
  return AMP_RANGE.min + (AMP_RANGE.max - AMP_RANGE.min) * (pct / 100);
}

/** The first moment the needle is dead centre that is late enough to have held
 *  the pad for `holdMs` first. */
function coreWindowAfter(holdMs) {
  let w = CORE_FIRST;
  while (w < holdMs + 40) w += CORE_PERIOD;
  return w;
}

/**
 * Play one round through the shipped controls.
 *
 * Picks the least-worn card (read off `data-uses`, which the deck writes), taps
 * it, presses `#holdpad`, lets the needle sweep to dead centre, and releases.
 * Every step asserts what the page did, not what the driver intended.
 *
 * @param {Object} world
 * @param {{rate: number|null}} calib  amplitude rise rate, learned on round 1
 */
function playRound(world, calib) {
  const doc = world.doc;
  const clock = world.clock;

  must(state(world) === 'ready',
    'a round opened in body[data-state="' + state(world) + '"] instead of "ready"');

  const cards = Array.prototype.slice.call(doc.querySelectorAll('#grid button[data-id]'));
  must(cards.length > 0, '#grid holds no move cards — the deck never rendered into it');
  const live = cards.filter(function (c) { return !c.disabled; });
  must(live.length > 0, 'every one of the ' + cards.length + ' cards in #grid is disabled — nothing is playable');

  live.sort(function (a, b) {
    return (parseInt(a.getAttribute('data-uses'), 10) || 0) - (parseInt(b.getAttribute('data-uses'), 10) || 0);
  });
  const card = live[0];
  const id = card.getAttribute('data-id');
  const move = MOVES_BY_ID[id];
  must(move, '#grid painted a card with data-id="' + id + '", which is not a move in src/data/moves.js');
  must(card.textContent.indexOf(move.name) !== -1,
    '#grid card ' + id + ' shows "' + card.textContent + '" — it never printed the move name "' + move.name + '"');

  /* ---- tap the card ------------------------------------------------- */

  tap(world, card, 'the ' + move.name + ' card in #grid');
  const t0 = clock.now();

  must(state(world) === 'timing',
    'tapping the ' + move.name + ' card left body[data-state="' + state(world) +
    '"] — the card is in #grid but nothing is listening to it');
  must(text(world, 'timingTitle') === move.name,
    '#timingTitle says "' + text(world, 'timingTitle') + '" after tapping ' + move.name);

  // The white mark has to be at THIS move's ideal, or the bar is lying about
  // the curve that is going to score it.
  const painted = ampFromPct(byId(world, 'ampIdeal').style.left);
  must(Math.abs(painted - move.idealAmp) < 0.01,
    '#ampIdeal is painted at amplitude ' + painted.toFixed(3) + ' but ' + id +
    ' has idealAmp ' + move.idealAmp);

  // §11's state machine is also a guard: while the panel is up the deck must
  // not be tappable. If it is, a double-tap starts two turns.
  must(blockedBecause(world, card) !== null,
    'the deck is still tappable during body[data-state="timing"] — ' + describe(card) +
    ' would take a second tap');

  /* ---- press, sweep, release ---------------------------------------- */

  const hold = calib.rate ? (move.idealAmp - AMP_RANGE.min) / calib.rate : CALIB_HOLD;
  const release = coreWindowAfter(hold);
  must(release <= CORE_LAST, 'holding ' + Math.round(hold) + 'ms overruns the sweep for ' + id);

  world.pumpTo(t0 + release - hold);

  const pad = byId(world, 'holdpad');
  const padWhy = blockedBecause(world, pad);
  must(!padWhy, 'cannot press #holdpad: ' + padWhy);

  fire(world, pad, 'pointerdown', 'PointerEvent');
  must(pad.classList.contains('held'),
    'pointerdown on #holdpad did not reach a listener — the pad never took the press');

  world.pumpTo(t0 + release);

  const amp = ampFromPct(byId(world, 'ampFill').style.width);
  must(isFinite(amp) && amp > AMP_RANGE.min,
    '#ampFill never grew while #holdpad was held — width is "' + byId(world, 'ampFill').style.width + '"');

  if (!calib.rate) {
    // Learn the rise rate from the bar itself rather than hardcoding a private
    // constant out of ui/timing.js. From here on the hold lands on the mark.
    calib.rate = (amp - AMP_RANGE.min) / hold;
    must(calib.rate > 0, '#ampFill reports a zero rise rate — the amplitude control is dead');
  } else {
    must(Math.abs(amp - move.idealAmp) < 0.03,
      'held for the mark on ' + id + ' but #ampFill reads amplitude ' + amp.toFixed(3) +
      ' against an ideal of ' + move.idealAmp);
  }

  fire(world, pad, 'pointerup', 'PointerEvent');

  must(text(world, 'timingHint') === 'PERFECT',
    'released with the needle dead centre but #timingHint called it "' + text(world, 'timingHint') +
    '" — the needle and the scoring zones disagree');
  must(!pad.classList.contains('held'), '#holdpad is still marked held after the release');

  /* ---- the exchange -------------------------------------------------- */

  world.until(function () { return state(world) === 'resolving'; }, 1500,
    'the released hold on ' + id + ' never reached body[data-state="resolving"]');

  must(text(world, 'nameYou') === move.name || text(world, 'nameYou').indexOf(move.name) !== -1,
    '#nameYou says "' + text(world, 'nameYou') + '" while ' + move.name + ' is being played');

  world.until(function () { return state(world) !== 'resolving'; }, 12000,
    'the ' + move.name + ' exchange started but never finished resolving');

  return { id: id, move: move };
}

/**
 * Play a whole battle from the deck screen to the result screen.
 * @returns {{states: string[], rounds: Object[]}}
 */
function playBattle(world) {
  const rounds = CAMPAIGN.rounds;
  const calib = { rate: null };
  const played = [];

  for (let r = 1; r <= rounds; r++) {
    must(text(world, 'roundLabel') === 'Round ' + r,
      '#roundLabel says "' + text(world, 'roundLabel') + '" at the top of round ' + r);
    played.push(playRound(world, calib));
  }

  must(state(world) === 'over',
    'nine rounds finished but body[data-state] is "' + state(world) + '" instead of "over"');

  world.until(function () { return hasOn(world, 'result'); }, 6000,
    'the battle ended but #result never took the "on" class');

  return played;
}

/* ========================================================================== */
/* PHASES                                                                     */
/* ========================================================================== */

/**
 * PHASE 1 — the shell. Every id in CONTRACT §11, present exactly once, plus the
 * class-named parts and the entry points the page declares.
 */
function auditShell(world) {
  const doc = world.doc;

  const missing = [];
  const duplicated = [];
  for (let i = 0; i < CONTRACT_IDS.length; i++) {
    const id = CONTRACT_IDS[i];
    const all = doc.querySelectorAll('#' + id);
    if (all.length === 0) missing.push('#' + id);
    else if (all.length > 1) duplicated.push('#' + id + ' ×' + all.length);
  }
  must(missing.length === 0,
    'CONTRACT §11 ids missing from the document: ' + missing.join(', '));
  must(duplicated.length === 0,
    'CONTRACT §11 ids appear more than once: ' + duplicated.join(', '));

  for (let i = 0; i < CONTRACT_PARTS.length; i++) {
    const container = CONTRACT_PARTS[i][0];
    const part = CONTRACT_PARTS[i][1];
    const id = CONTRACT_PARTS[i][2];
    const node = doc.querySelector(container + ' ' + part);
    must(node, 'CONTRACT §11 requires "' + part + '" inside ' + container + ' and it is not there');
    if (id) {
      must(node === doc.getElementById(id),
        container + ' ' + part + ' and #' + id + ' are two different elements — they must be one node');
    }
  }

  for (let i = 0; i < SCREEN_IDS.length; i++) {
    const node = doc.getElementById(SCREEN_IDS[i]);
    must(node.classList.contains('screen'),
      '#' + SCREEN_IDS[i] + ' is a full-screen panel in §11 but does not carry class "screen"');
  }

  must(hasOn(world, 'title'), '#title does not open with class "on" — the game boots on no screen at all');
  must(!hasOn(world, 'fit') && !hasOn(world, 'result') && !hasOn(world, 'map'),
    'more than one .screen carries "on" at boot');

  // The page must still be loading the module graph this suite imported.
  const script = doc.querySelector('script[type="module"]');
  must(script, 'index.html no longer loads a <script type="module"> — nothing boots in a browser');
  const src = script.getAttribute('src');
  must(path.resolve(ROOT, src) === MAIN_PATH,
    'index.html boots "' + src + '" but this suite exercises src/main.js — the page and the tests have drifted apart');

  must(STATES.indexOf(state(world)) !== -1,
    'body[data-state] is "' + state(world) + '", which is not one of ' + STATES.join(' / '));
}

/** PHASE 2 — the title screen is wired and the HUD is already dressed. */
function auditBoot(world) {
  must(state(world) === 'ready', 'the game boots in body[data-state="' + state(world) + '"]');

  const crowd = byId(world, 'crowd').children.length;
  must(crowd > 0, '#crowd is empty at boot — nobody turned out, so hud.setCrowd() never reached it');

  must(text(world, 'meterFill') !== null, '#meterFill is missing');
  must(byId(world, 'meterFill').style.width !== '',
    '#meterFill has no width at boot — the meter was never painted');

  must(text(world, 'roundLabel') === 'Round 1',
    '#roundLabel says "' + text(world, 'roundLabel') + '" at boot');

  const foeName = text(world, 'foeLabel');
  const foe = CAMPAIGN.opponents.filter(function (o) { return o.name === foeName; })[0];
  must(foe, '#foeLabel says "' + foeName + '" which is nobody in src/data/campaign.js');

  const blend = byId(world, 'blendBtn');
  must(blend.textContent.indexOf('hype') !== -1,
    '#blendBtn reads "' + blend.textContent + '" — hud.setHype() never wrote to it');

  return { crowd: crowd, foe: foe };
}

/** PHASE 3 — #startBtn and the fit check. */
function walkToFit(world) {
  tap(world, byId(world, 'startBtn'), '#startBtn on the title screen');

  must(hasOn(world, 'fit'),
    'tapping #startBtn did not open #fit — the button is in the document but nothing is listening to it');
  must(!hasOn(world, 'title'), '#title kept the "on" class after #startBtn was tapped');

  const fits = Array.prototype.slice.call(world.doc.querySelectorAll('#fitGrid button'));
  must(fits.length === CAMPAIGN.fits.length,
    '#fitGrid rendered ' + fits.length + ' fits, campaign.js defines ' + CAMPAIGN.fits.length);

  return fits;
}

/** Choose a fit by tapping it, and prove the choice landed. */
function chooseFit(world, fitId) {
  const doc = world.doc;
  const btn = doc.querySelector('#fitGrid button[data-fit="' + fitId + '"]');
  must(btn, '#fitGrid has no button for the "' + fitId + '" fit');
  tap(world, btn, 'the ' + fitId + ' fit');

  must(btn.getAttribute('aria-pressed') === 'true',
    'tapping the ' + fitId + ' fit did not mark it aria-pressed="true"');
  const others = Array.prototype.slice.call(doc.querySelectorAll('#fitGrid button'))
    .filter(function (b) { return b !== btn && b.getAttribute('aria-pressed') === 'true'; });
  must(others.length === 0,
    others.length + ' other fits are still aria-pressed after choosing ' + fitId);
}

/** Step up. The arena must actually take over. */
function stepUp(world) {
  tap(world, byId(world, 'fitGo'), '#fitGo');

  must(!hasOn(world, 'fit'),
    'tapping #fitGo did not leave the fit screen — the button is there but its listener is not');
  must(!hasOn(world, 'title') && !hasOn(world, 'result') && !hasOn(world, 'map'),
    'a .screen is still "on" after #fitGo — the arena is covered');
  must(state(world) === 'ready',
    'the battle opened in body[data-state="' + state(world) + '"] instead of "ready"');

  const cards = world.doc.querySelectorAll('#grid button[data-id]');
  must(cards.length > 0, '#grid is empty at the top of a battle — buildDeck() never found it');

  must(text(world, 'mcbar') !== '',
    '#mcbar is empty at the top of a battle — the MC never said the act line');
}

/** Read the save the game actually wrote. */
function savedState(world) {
  const raw = world.window.localStorage.getItem(SAVE_KEY);
  must(raw, 'nothing was written to localStorage under "' + SAVE_KEY + '"');
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch (e) {
    throw new Broke('the save under "' + SAVE_KEY + '" is not valid JSON: ' + raw.slice(0, 80));
  }
  return parsed;
}

/* ========================================================================== */
/* THE RUN                                                                    */
/* ========================================================================== */

async function mainRun() {
  const world = await boot({ seed: 0x51ee7ed });
  try {
    auditShell(world);
    const opening = auditBoot(world);

    /* ---- battle one ------------------------------------------------- */

    walkToFit(world);
    chooseFit(world, 'clogs');
    stepUp(world);

    const crowdInBattle = byId(world, 'crowd').children.length;
    must(crowdInBattle > 0, '#crowd emptied out when the battle started');

    const foeName = text(world, 'foeLabel');
    const foe = CAMPAIGN.opponents.filter(function (o) { return o.name === foeName; })[0];
    must(foe, '#foeLabel says "' + foeName + '" which is nobody in src/data/campaign.js');
    must(foe.drop, foe.name + ' has no drop, so there is no unlock chain to test');

    const meterAtOpen = byId(world, 'meterFill').style.width;
    const hypeAtOpen = byId(world, 'hypeFill').style.width;
    const mcAtOpen = text(world, 'mcbar');

    playBattle(world);

    // The state machine, exactly: ready, then nine (timing, resolving) pairs,
    // returning to ready between rounds and landing on over at the end.
    const wantStates = ['ready'];
    for (let r = 1; r <= CAMPAIGN.rounds; r++) {
      wantStates.push('timing', 'resolving', r < CAMPAIGN.rounds ? 'ready' : 'over');
    }
    must(world.trace.states.join(' > ') === wantStates.join(' > '),
      'body[data-state] walked\n      ' + world.trace.states.join(' > ') +
      '\n    but CONTRACT §11 wants\n      ' + wantStates.join(' > '));

    /* ---- the HUD moved ---------------------------------------------- */

    must(world.trace.meter.length > 1,
      '#meterFill never changed width across nine rounds — it is still "' + meterAtOpen + '"');
    must(byId(world, 'meterFill').style.width !== meterAtOpen,
      '#meterFill finished the battle at its opening width (' + meterAtOpen + ')');

    must(world.trace.hype.length > 1,
      '#hypeFill never changed width across nine rounds — it is still "' + hypeAtOpen + '"');

    const spoken = world.trace.mc.filter(function (s) { return s; });
    must(spoken.length >= 2,
      '#mcbar said ' + spoken.length + ' thing(s) in nine rounds; it opened with "' + mcAtOpen + '" and never moved on');

    must(text(world, 'calloutYou') !== '' || text(world, 'calloutThem') !== '',
      'neither #calloutYou nor #calloutThem carries a score callout at the end of the battle');

    /* ---- the win, and the unlock chain ------------------------------ */

    let saved = savedState(world);
    let attempts = 1;
    const maxAttempts = 3;

    while (saved.beaten.indexOf(foe.id) === -1 && attempts < maxAttempts) {
      // A loss sends you back to the fit check, not to the map. Go again.
      must(hasOn(world, 'result'), 'a finished battle left no result screen to continue from');
      tap(world, byId(world, 'againBtn'), '#againBtn after a loss');
      must(hasOn(world, 'fit'),
        '#againBtn after a loss did not reopen the fit check (map on: ' + hasOn(world, 'map') + ')');
      stepUp(world);
      playBattle(world);
      saved = savedState(world);
      attempts++;
    }

    must(saved.beaten.indexOf(foe.id) === -1 === false,
      'played ' + attempts + ' full battle(s) against ' + foe.name + ' (skill ' + foe.skill +
      ') with a perfect release and the mark hit every round, and never won one');

    const dropMove = MOVES_BY_ID[foe.drop];
    must(dropMove, foe.name + ' drops "' + foe.drop + '", which is not a move in src/data/moves.js');

    must(text(world, 'resultUnlock').indexOf(dropMove.name) !== -1,
      '#resultUnlock says "' + text(world, 'resultUnlock') + '" after beating ' + foe.name +
      ' — it never named ' + dropMove.name);
    must(text(world, 'resultLog') !== '', '#resultLog is empty on the result screen');
    must(text(world, 'resultTitle') !== '', '#resultTitle is empty on the result screen');

    must(saved.deck.indexOf(foe.drop) !== -1,
      'beat ' + foe.name + ' but "' + foe.drop + '" is not in the saved deck [' + saved.deck.join(', ') + ']');

    /* ---- carry the unlock into the next fight ----------------------- */

    tap(world, byId(world, 'againBtn'), '#againBtn after a win');
    must(hasOn(world, 'map'),
      '#againBtn after a win did not open #map (fit on: ' + hasOn(world, 'fit') + ')');

    const acts = Array.prototype.slice.call(world.doc.querySelectorAll('#actList button'));
    must(acts.length === CAMPAIGN.acts.length,
      '#actList rendered ' + acts.length + ' acts, campaign.js defines ' + CAMPAIGN.acts.length);
    const current = acts.filter(function (b) { return b.getAttribute('aria-current') === 'step'; })[0];
    must(current, 'no button in #actList is marked aria-current="step" — the circuit has no next stop');
    must(text(world, 'mapSub') !== '', '#mapSub is empty on the circuit screen');

    tap(world, current, 'the current act in #actList');
    must(hasOn(world, 'fit'), 'tapping the current act did not reopen the fit check');

    chooseFit(world, 'black');
    stepUp(world);

    assertDeckHas(world, foe.drop,
      'THE UNLOCK CHAIN: beat ' + foe.name + ', learned ' + dropMove.name);

    const cardsNow = world.doc.querySelectorAll('#grid button[data-id]').length;
    must(cardsNow === CAMPAIGN.startingKit.length + 1,
      '#grid holds ' + cardsNow + ' cards in the second battle; the starting kit is ' +
      CAMPAIGN.startingKit.length + ' and one drop was learned');

    const crowdNow = byId(world, 'crowd').children.length;
    must(crowdNow > opening.crowd,
      '#crowd is still ' + crowdNow + ' people after taking a scalp — it was ' + opening.crowd +
      ' before anybody had heard of you');

    must(text(world, 'roundLabel') === 'Round 1',
      'the second battle opens on "' + text(world, 'roundLabel') + '"');

    return { world: world, foe: foe, drop: foe.drop, attempts: attempts, crowd: [opening.crowd, crowdNow] };
  } catch (e) {
    world.teardown();
    throw e;
  }
}

/** The unlock assertion, factored out so a negative control can aim it at a
 *  move that was never learned and watch it fail. */
function assertDeckHas(world, moveId, label) {
  const card = world.doc.querySelector('#grid button[data-id="' + moveId + '"]');
  const have = Array.prototype.slice.call(world.doc.querySelectorAll('#grid button[data-id]'))
    .map(function (b) { return b.getAttribute('data-id'); });
  must(card, label + ' — but #grid holds [' + have.join(', ') + '] and no "' + moveId + '" card');
  must(!card.disabled, label + ' — the "' + moveId + '" card is in #grid but disabled');
  const move = MOVES_BY_ID[moveId];
  must(card.textContent.indexOf(move.name) !== -1,
    label + ' — the "' + moveId + '" card does not print "' + move.name + '"');
}

/* ========================================================================== */
/* NEGATIVE CONTROLS — break it on purpose, require the check to notice        */
/* ========================================================================== */

/**
 * Run an assertion against a world that has been deliberately broken. The
 * control PASSES when the assertion throws a named failure, and FAILS when it
 * does not — an assertion that cannot fail is decoration, not evidence.
 */
async function control(label, fn) {
  let thrown = null;
  try {
    await fn();
  } catch (e) {
    thrown = e;
  }
  if (!thrown) {
    fail('NEGATIVE CONTROL "' + label + '": the assertion did NOT fail against a deliberately broken build. ' +
      'It cannot detect this, so it is decoration.');
    return null;
  }
  if (!(thrown instanceof Broke)) {
    fail('NEGATIVE CONTROL "' + label + '": broke with an unexpected ' + thrown.name +
      ' instead of a named assertion — ' + thrown.message);
    return null;
  }
  return thrown.message;
}

async function negativeControls(liveWorld) {
  const results = [];

  /* 1. a renamed id — the trap this suite exists for */
  results.push(['a renamed id is caught by the §11 audit', await control(
    'renamed id', async function () {
      const w = await boot({ beforeBoot: function (doc) { doc.getElementById('holdpad').id = 'holdpad2'; } });
      try { auditShell(w); } finally { w.teardown(); }
    })]);

  /* 2. a querySelector that matches nothing — #grid renamed, deck never lands */
  results.push(['a deck with nowhere to render is caught', await control(
    'renamed #grid', async function () {
      const w = await boot({ beforeBoot: function (doc) { doc.getElementById('grid').id = 'grid2'; } });
      try {
        tap(w, byId(w, 'startBtn'), '#startBtn');
        chooseFit(w, 'clogs');
        stepUp(w);
      } finally { w.teardown(); }
    })]);

  /* 3. a crowd with nowhere to stand */
  results.push(['a crowd that never renders is caught', await control(
    'renamed #crowd', async function () {
      const w = await boot({ beforeBoot: function (doc) { doc.getElementById('crowd').id = 'crowd2'; } });
      try {
        // Skip the id audit (it would fire first) and go straight at the HUD.
        must(byId(w, 'crowd') === null, 'the control did not actually rename #crowd');
        checks--;
        const el = w.doc.getElementById('crowd2');
        must(el.children.length > 0,
          '#crowd is empty at boot — nobody turned out, so hud.setCrowd() never reached it');
      } finally { w.teardown(); }
    })]);

  /* 4. a button that is present but whose listener is not — the exact trap in
        the brief: proving an element exists proves nothing about wiring */
  results.push(['a button with a dead listener is caught', await control(
    'listener-less #fitGo', async function () {
      const w = await boot();
      try {
        tap(w, byId(w, 'startBtn'), '#startBtn');
        chooseFit(w, 'clogs');
        // cloneNode copies the element and drops every listener on it. #fitGo
        // is still in the document, still reachable, still tappable — and dead.
        const go = byId(w, 'fitGo');
        go.parentNode.replaceChild(go.cloneNode(true), go);
        stepUp(w);
      } finally { w.teardown(); }
    })]);

  /* 5. a release that never had a press behind it must not commit a turn */
  results.push(['a hold released without a press is caught', await control(
    'pointerup with no pointerdown', async function () {
      const w = await boot();
      try {
        tap(w, byId(w, 'startBtn'), '#startBtn');
        chooseFit(w, 'clogs');
        stepUp(w);
        const card = w.doc.querySelector('#grid button[data-id]');
        tap(w, card, 'the first card in #grid');
        must(state(w) === 'timing', 'the control never opened the timing panel');
        checks--;
        w.pump(600);
        fire(w, byId(w, 'holdpad'), 'pointerup', 'PointerEvent');
        w.until(function () { return state(w) === 'resolving'; }, 1500,
          'the released hold never reached body[data-state="resolving"]');
      } finally { w.teardown(); }
    })]);

  /* 6. the unlock check has to discriminate, not just find any card */
  if (liveWorld) {
    const never = CAMPAIGN.opponents[CAMPAIGN.opponents.length - 2].drop;
    results.push(['the unlock check rejects a move that was never learned', await control(
      'unlock discrimination', async function () {
        assertDeckHas(liveWorld, never, 'THE UNLOCK CHAIN: pretending "' + never + '" was learned');
      })]);
  }

  return results;
}

/* ========================================================================== */
/* MAIN                                                                       */
/* ========================================================================== */

async function main() {
  console.log('AURA OFF — integration');
  console.log('  booting ' + path.relative(ROOT, INDEX_PATH) + ' in jsdom, on a virtual clock');

  let live = null;

  try {
    live = await mainRun();
    console.log('  ' + CONTRACT_IDS.length + ' §11 ids present and unique');
    console.log('  played ' + live.attempts + ' battle(s) against ' + live.foe.name +
      ' through #grid and #holdpad, nine rounds each');
    console.log('  ready > timing > resolving × 9 > over, exactly as §11 specifies');
    console.log('  unlocked "' + live.drop + '" and found it in #grid the next fight');
    console.log('  crowd ' + live.crowd[0] + ' → ' + live.crowd[1] + ' people');
  } catch (e) {
    if (e instanceof Broke) fail(e.message);
    else fail('crashed while driving the page: ' + (e && e.stack ? e.stack : String(e)));
  }

  let controls = [];
  try {
    controls = await negativeControls(live && live.world);
  } catch (e) {
    fail('the negative controls themselves crashed: ' + (e && e.stack ? e.stack : String(e)));
  }

  if (live && live.world) live.world.teardown();

  if (controls.length) {
    console.log('  negative controls — each one breaks the build on purpose:');
    for (let i = 0; i < controls.length; i++) {
      const label = controls[i][0];
      const message = controls[i][1];
      if (message) {
        console.log('    ✓ ' + label);
        console.log('        caught: ' + firstLine(message));
      } else {
        console.log('    ✗ ' + label);
      }
    }
  }

  if (failures.length) {
    console.error('');
    console.error('AURA OFF — integration: ' + failures.length + ' FAILURE' +
      (failures.length === 1 ? '' : 'S') + ' after ' + checks + ' checks');
    for (let i = 0; i < failures.length; i++) {
      console.error('  ' + (i + 1) + '. ' + failures[i]);
    }
    console.error('');
    return 1;
  }

  console.log('  ' + checks + ' checks — DOM contract, wiring, a won battle, the unlock chain: PASS');
  return 0;
}

function firstLine(s) {
  const i = String(s).indexOf('\n');
  return i === -1 ? String(s) : String(s).slice(0, i) + ' …';
}

/* A hard stop, so a future change can never turn this suite into a hang. */
const watchdog = realSetTimeout(function () {
  console.error('AURA OFF — integration: TIMED OUT after 120s of wall clock. ' +
    'Something is waiting on a real timer; this suite must only ever wait on its own.');
  process.exit(1);
}, 120000);

main().then(function (code) {
  realClearTimeout(watchdog);
  process.exit(code);
}).catch(function (e) {
  realClearTimeout(watchdog);
  console.error('AURA OFF — integration: the harness itself threw');
  console.error(e && e.stack ? e.stack : e);
  process.exit(1);
});
