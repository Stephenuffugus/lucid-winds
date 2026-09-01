// TANGENT headless harness — reconstructed 2026-09-01 by Fable.
// The phone zip referenced a 50-check suite and a sweep harness that were NOT
// in the zip; this rebuilds the runner from BUILD-HANDOFF.md Appendix C.
// Extracts the <script> from ../index.html, runs it in a vm context with a
// stubbed DOM/canvas, and returns the context so tests can drive
// loadLevel / startSpin / step / doRelease and read phase / lastOutcome.
const fs = require("fs");
const vm = require("vm");
const path = require("path");

// `seed` primes localStorage BEFORE the game's init() runs, which is the only
// way to exercise the one-boot-per-profile half of the tutorial: init reads the
// saved beats back with `coachSeen=readSave().tutor`, and a test that sets
// coachSeen by hand is testing itself, not that line.
function load(seed){
  // TANGENT_HTML points the suite at a mutated scratch copy, so a check can be
  // proven able to fail without ever writing to the real game file.
  const src = process.env.TANGENT_HTML || path.join(__dirname, "..", "index.html");
  const html = fs.readFileSync(src, "utf8");
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  if(!m) throw new Error("no script block in index.html");
  const js = m[1].replace(/^"use strict";/, "");
  const noop = () => {};
  // Gradient stub matters: paintFerro calls addColorStop on the result.
  const ctxStub = new Proxy({}, {
    get: (t, k) => /Gradient$/.test(k)
      ? () => ({ addColorStop: noop })
      : (k === "measureText" ? () => ({ width: 10 }) : noop),
    set: () => true,
  });
  const fakeEl = () => new Proxy({
    style: {}, dataset: {},
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    addEventListener: noop, setPointerCapture: noop, releasePointerCapture: noop,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 390, height: 780 }),
    textContent: "", innerHTML: "", disabled: false,
    clientWidth: 390, clientHeight: 780, width: 390, height: 780,
    getContext: () => ctxStub,
  }, {
    get(t, k){ return k in t ? t[k] : noop; },
    set(t, k, v){ t[k] = v; return true; },
  });
  const ctx = {
    console, Math, JSON, Date, isFinite, isNaN, String, Number, Array, Object,
    Set, Map, Infinity, NaN, parseInt, parseFloat,
    performance: { now: () => Date.now() },
    document: {
      getElementById: fakeEl, querySelectorAll: () => [],
      querySelector: fakeEl, createElement: fakeEl,
      addEventListener: noop, hidden: false,
      body: fakeEl(), documentElement: fakeEl(),
    },
    window: { devicePixelRatio: 2, addEventListener: noop, innerWidth: 390, innerHeight: 780 },
    navigator: { vibrate: noop },
    requestAnimationFrame: noop, cancelAnimationFrame: noop,
    setTimeout: noop, clearTimeout: noop, setInterval: noop, clearInterval: noop,
    // A real (in memory) store, so saving, unlocking and the tutorial can be
    // tested. A null store would make every save path silently no-op and the
    // tests would pass without exercising anything.
    localStorage: (() => {
      const m = new Map();
      for(const k in (seed || {})) m.set(String(k), String(seed[k]));
      return {
        getItem: k => (m.has(String(k)) ? m.get(String(k)) : null),
        setItem: (k, v) => { m.set(String(k), String(v)); },
        removeItem: k => { m.delete(String(k)); },
        clear: () => m.clear(),
        get length(){ return m.size; },
      };
    })(),
    AudioContext: undefined, webkitAudioContext: undefined,
    addEventListener: noop,
  };
  ctx.window.visualViewport = { width: 390, height: 780, addEventListener: noop };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  // `probe` hands the test direct access to the game's top-level bindings,
  // which live in the script scope, not on the context object.
  const expose = `
    ;globalThis.__T = {
      get phase(){ return phase; }, set phase(v){ phase = v; },
      get lastOutcome(){ return lastOutcome; },
      get inversions(){ return inversions; },
      get ball(){ return ball; },
      get deck(){ return deck; },
      get sys(){ return sys; },
      get lv(){ return lv; },
      get LEVELS(){ return LEVELS; },
      set holding(v){ holding = v; },
      get holding(){ return holding; },
      // The throttle is part of the spin state. test/search.js snapshots a spin
      // once and replays a release from every sampled step rather than
      // re-running the spin per release time, and without this the replayed
      // state is missing the one value advanceDeck relaxes toward its target.
      set throttle(v){ throttle = v; },
      get throttle(){ return throttle; },
      set W(v){ W = v; }, set H(v){ H = v; },
      get W(){ return W; }, get H(){ return H; },
      loadLevel, startSpin, step, doRelease,
      backToBuild: (typeof backToBuild === "function" ? backToBuild : null),
      get invAmt(){ return invAmt; },
      get deckPos(){ return deckPos; },
      get gatesHit(){ return gatesHit; },
      get lvIndex(){ return lvIndex; },
      get parts(){ return parts; },
      get ghost(){ return typeof ghost!=="undefined"?ghost:null; },
      set ghost(v){ ghost=v; },
      get ghostIdle(){ return typeof ghostIdle!=="undefined"?ghostIdle:null; },
      set ghostIdle(v){ ghostIdle=v; },
      buildGhost: (typeof buildGhost === "function" ? buildGhost : null),
      cachedPredict: (typeof cachedPredict === "function" ? cachedPredict : null),
      verdict:       (typeof verdict       === "function" ? verdict       : null),
      // save + coaching surface (T2)
      readSave:        (typeof readSave        === "function" ? readSave        : null),
      writeSave:       (typeof writeSave       === "function" ? writeSave       : null),
      lvState:         (typeof lvState         === "function" ? lvState         : null),
      unlockedThrough: (typeof unlockedThrough === "function" ? unlockedThrough : null),
      recordResult:    (typeof recordResult    === "function" ? recordResult    : null),
      coachBeat:       (typeof coachBeat       === "function" ? coachBeat       : null),
      coachTick:       (typeof coachTick       === "function" ? coachTick       : null),
      get coachSeen(){ return typeof coachSeen!=="undefined"?coachSeen:null; },
      set coachSeen(v){ coachSeen=v; },
      set everHeld(v){ everHeld=v; },
      get everHeld(){ return typeof everHeld!=="undefined"?everHeld:null; },
      get store(){ return localStorage; },
      // Camera surface. Exposed defensively with typeof so this harness still
      // loads against a build where the camera has not been written yet — a
      // missing camera must fail ONE check, not blow up the whole suite.
      camScale: (typeof camScale === "function" ? camScale : null),
      camOrigin: (typeof camOrigin === "function" ? camOrigin : null),
      camUpdate: (typeof camUpdate === "function" ? camUpdate : null),
      camSnap:   (typeof camSnap   === "function" ? camSnap   : null),
      systemExtent: (typeof systemExtent === "function" ? systemExtent : null),
    };`;
  vm.runInContext(js + expose, ctx, { filename: "index.html" });
  if(!ctx.__T) throw new Error("test surface failed to attach");
  return ctx.__T;
}

// Run one release-time trial on level i: spin with throttle held, release at
// tRelease seconds, then fly to completion. Returns { outcome, t }.
function trial(T, i, tRelease){
  T.loadLevel(i);
  T.startSpin();
  T.holding = true;
  const steps = Math.round(tRelease * 120);
  for(let k = 0; k < steps && T.phase === "spin"; k++) T.step();
  if(T.phase === "spin") T.doRelease("test");
  let guard = 0;
  while((T.phase === "flight" || T.phase === "invert") && guard++ < 20000) T.step();
  return { outcome: T.lastOutcome, phase: T.phase };
}

module.exports = { load, trial };
