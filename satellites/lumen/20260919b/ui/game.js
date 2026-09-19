// The game controller. Holds the run state (sim/run.js), sends every player action through step(), and
// keeps the scene and HUD in sync. Casts are played back from the sim's event list only; the Lux the HUD
// shows is built from those events and checked against the sim's own total after every cast.
import * as THREE from 'three';
import { DATA } from '../sim/data.js';
import { step, castBoard, castContext, placementLimit, occupied, modifiers, RuleError, vigilEffects, redrawsPerCast, newRun, replay as replayRun } from '../sim/run.js';
import { bestSingle } from '../sim/greedy.js';
import { tutorialState, TUTORIAL } from '../sim/tutorial.js';
import { cast } from '../sim/cast.js';
import { segments } from '../sim/trace.js';
import { grid } from '../sim/hex.js';
import { inclusionFlags } from '../sim/settings.js';
import { createBoardView } from '../render/board.js';
import { makeGem } from '../render/gems.js';
import { createBeamView } from '../render/beams.js';
import { createPlayer } from '../render/player.js';
import { createFx } from '../render/fx.js';
import { cellAt, cellPos, colorHex } from '../render/layout.js';
import { createHUD } from './hud.js';
import { fmt } from './format.js';
import * as screens from './screens.js';

const LONG_PRESS_MS = 480;
const DRAG_PX = 9;

export function createGame(stage, uiRoot, hooks = {}, data = DATA) {
  const hud = createHUD(uiRoot, data);
  const boardView = createBoardView(stage);
  const beams = createBeamView(stage, { patterns: !!(hooks.prefs && hooks.prefs.patterns) });
  const fx = createFx(stage, data);
  const post = hooks.post || null;
  const gemViews = new Map();
  let lastCast = null;
  let replaying = false;
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  let state = null;
  let mode = 'tutorial';
  let builtBoard = null;
  let player = null;
  let playing = false;
  let drag = null;
  let marked = null;
  let ghost = null;
  let previewTimer = 0;
  let previewExtra = null;
  const pointers = new Map();
  const log = { luxChecks: 0, luxMismatches: 0 };
  const settingsPrefs = hooks.prefs || { reducedMotion: false };

  // ---------------------------------------------------------------- sync
  function syncBoard() {
    const n = state.n;
    if (builtBoard !== n.board) {
      boardView.build(n.board, n.apertures); builtBoard = n.board;
      for (const v of gemViews.values()) { stage.scene.remove(v.group); v.dispose(); }
      gemViews.clear();
      if (post) post.warm(false);
      lastCast = null;
    }
    else boardView.setApertures(n.apertures);
  }

  function syncGems() {
    const b = castBoard(state, false, data);
    const g = grid(b.radius);
    const want = new Map();
    for (const gm of b.gems) want.set(gm.cell, gm);
    for (const [cell, v] of gemViews) {
      const gm = want.get(cell);
      if (!gm || v.key !== keyOf(gm)) { stage.scene.remove(v.group); v.dispose(); gemViews.delete(cell); }
    }
    for (const [cell, gm] of want) {
      let v = gemViews.get(cell);
      if (!v) {
        v = makeGem(data, gm);
        v.key = keyOf(gm);
        const p = cellPos(g, cell);
        v.group.position.set(p.x, 0, p.z);
        v.setFacing(gm.facing, true);
        stage.scene.add(v.group);
        gemViews.set(cell, v);
      } else v.setFacing(gm.facing, false);
    }
  }
  const keyOf = (gm) => `${gm.uid ?? 'fixed'}:${gm.cut}:${gm.stone}:${gm.tier}:${gm.inclusion}`;

  function castsLeft() { return state.n.casts - state.n.castIndex; }

  let pulseDone = false;
  function syncHUD() {
    const n = state.n;
    pulseDone = mode === 'tutorial' && tutorialReady();
    hud.setNight(mode === 'tutorial' ? 'Night 0' : `Night ${n.night}`);
    if (!playing) hud.setLux(n.lux, n.target);
    hud.setGlints(state.glints);
    hud.setSettings(state.settings);
    const e = n.eclipse ? data.eclipse[n.eclipse] : null;
    hud.setBanner(e ? `${e.name}: ${e.rule}` : '');
    hud.setVerb(mode === 'tutorial' && !playing ? state.tutorial.verb : '');
    const hint = mode === 'tutorial' && state.tutorial.ghost && n.hand.length ? n.hand[0] : null;
    hud.setHand(state, { marked, hint });
    const lim = mode === 'tutorial' ? 0 : placementLimit(state, data);
    hud.setPips(Math.max(0, lim - n.placedThisCast), lim);
    hud.setCasts(mode === 'tutorial' ? 1 : castsLeft(), mode === 'tutorial' ? 1 : n.casts, state.phase === 'night' && !playing);
    hud.redraw.style.visibility = mode === 'tutorial' || n.redrawn || redrawsPerCast(state, data) < 1 ? 'hidden' : 'visible';
    hud.redraw.classList.toggle('armed', !!marked);
    hud.cast.classList.toggle('pulse', mode === 'tutorial' && !n.hand.length && !playing && pulseDone);
  }

  // Night 0 teaches without words: the gem to turn pulses until the preview reaches the goal, and only
  // then does the Cast button pulse.
  function tutorialReady() {
    if (mode !== 'tutorial' || !state || state.phase !== 'night') return false;
    return cast(castBoard(state, true, data), castContext(state, data), data).lux >= state.n.target;
  }

  function previewAllowed() {
    if (mode === 'tutorial') return true;
    const m = modifiers(state, data);
    if (m.noPreview) return false;
    if (state.n.eclipse && vigilEffects(state.vigil).noPreviewOnEclipse) return false;
    return true;
  }

  function refreshPreview(extra = null) {
    if (!state || state.phase !== 'night' || playing) { beams.hidePreview(); return; }
    if (!previewAllowed()) { beams.hidePreview(); return; }
    const b = castBoard(state, true, data);
    if (extra) b.gems.push(extra);
    const r = cast(b, { ...castContext(state, data), events: true }, data);
    beams.showPreview(segments(r.events, b.radius), b.radius, b.fog);
  }

  function sync() {
    if (!state) return;
    syncBoard();
    syncGems();
    syncHUD();
    refreshPreview();
    if (mode === 'tutorial') showGhostHint();
    if (mode === 'run' && hooks.intro && state.phase === 'night') {
      if (state.n.eclipse) hooks.intro('eclipse');
      else if (state.settings.length) hooks.intro('settings');
    }
  }

  // ---------------------------------------------------------------- tutorial hints
  let hintGem = null;
  function showGhostHint() {
    if (hintGem) { stage.scene.remove(hintGem.group); hintGem.dispose(); hintGem = null; }
    const t = state.tutorial;
    if (!t || !t.ghost || !state.n.hand.length || state.phase !== 'night') return;
    const gm = state.gems[state.n.hand[0]];
    hintGem = makeGem(data, { ...gm, facing: t.ghost.facing });
    hintGem.group.traverse((o) => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.28; o.material.depthWrite = false; } });
    const p = cellPos(grid(3), t.ghost.cell);
    hintGem.group.position.set(p.x, 0, p.z);
    hintGem.setFacing(t.ghost.facing, true);
    stage.scene.add(hintGem.group);
  }

  // ---------------------------------------------------------------- actions
  function act(a) {
    try {
      const res = step(state, a, data);
      if (hooks.onAction) hooks.onAction(state, a, mode);
      return res;
    } catch (err) {
      if (err instanceof RuleError) { hud.toast(err.message); return null; }
      throw err;
    }
  }

  function defaultFacing(uid, cell) {
    const gm = state.gems[uid];
    if (mode === 'tutorial' && state.tutorial.ghost && state.tutorial.ghost.cell === cell) return state.tutorial.ghost.facing;
    // Face the light already entering this cell: a Mirror turns it, anything else points along it.
    const b = castBoard(state, true, data);
    const r = cast(b, { ...castContext(state, data), events: true }, data);
    for (const s of segments(r.events, b.radius)) {
      if (s.cells.includes(cell)) return data.cut[gm.cut].fn === 'reflect' ? (s.dir + 2) % 6 : s.dir;
    }
    return 0;
  }

  function place(uid, cell) {
    const facing = defaultFacing(uid, cell);
    if (act({ type: 'place', uid, cell, facing })) {
      sync();
      const v = gemViews.get(cell);
      if (v) v.drop();
      fx.ring(cell);
      if (navigator.vibrate && !settingsPrefs.reducedMotion) { try { navigator.vibrate(8); } catch { /* not allowed */ } }
      if (hooks.sound) hooks.sound('drop', state.gems[uid]);
    }
  }

  function rotate(cell, by) {
    if (act({ type: 'rotate', cell, by })) { syncGems(); refreshPreview(); if (mode === 'tutorial') syncHUD(); if (hooks.sound) hooks.sound('rotate'); }
  }

  const sound = (kind, p) => { if (hooks.sound && mode !== 'attract') hooks.sound(kind, p); };
  function startCast() {
    if (playing || state.phase !== 'night') return;
    marked = null;
    const before = state.n.lux;
    const res = act({ type: 'cast' });
    if (!res) return;
    const r = res.cast;
    playing = true;
    beams.hidePreview();
    if (hintGem) { stage.scene.remove(hintGem.group); hintGem = null; }
    hud.setVerb('');
    syncGems();
    const radius = builtBoard.radius;
    lastCast = { events: r.events, radius, lux: r.lux, logIndex: state.log.length, board: builtBoard };
    hud.showReplay(false);
    beams.beginCast(segments(r.events, radius), radius);
    let shown = mode === 'tutorial' ? 0 : before;
    const target = state.n.target; // the Night's state stays in place until the Lapidary is left
    hud.setLux(shown, target);
    let castSum = 0;
    const g = grid(radius);
    sound('castStart', { luxBefore: mode === 'tutorial' ? 0 : before, target: state.n.target });
    player = createPlayer(r.events, {
      reducedMotion: settingsPrefs.reducedMotion,
      onEvent(e) {
        sound('event', e);
        if (e.type === 'strike' || e.type === 'split' || e.type === 'charge' || (e.type === 'absorb' && e.gemId !== null)) {
          const v = gemViews.get(e.cell);
          if (v) v.flash(e.color, colorHex(e.color));
          if (e.type !== 'charge') fx.sparkle(e.cell, e.color);
        }
        if (e.type === 'fire') { const v = gemViews.get(e.cell); if (v) v.flash(e.color, 0xffffff); }
        if (e.type === 'aperture' || (e.type === 'absorb' && e.lux)) {
          castSum += e.lux;
          shown += e.lux;
          hud.setLux(shown, target);
          const p = cellPos(g, e.cell);
          const v = new THREE.Vector3(p.x, 0.6, p.z).project(stage.camera);
          const rect = stage.renderer.domElement.getBoundingClientRect();
          if (e.lux) hud.pop((v.x * 0.5 + 0.5) * rect.width, (-v.y * 0.5 + 0.5) * rect.height, `+${fmt(e.lux)}`);
        }
        if (e.type === 'dawn') { if (post) post.dawn(); if (hooks.onDawn) hooks.onDawn(e); }
        if (e.type === 'end' && e.beamId === -1) {
          // Cast-level rules (Full House, Glass Tax): the closing event carries the cast's final Lux.
          const final = mode === 'tutorial' ? e.lux : Math.max(0, before + e.lux - (e.unpaidTax || 0));
          shown = final;
          hud.setLux(shown, target);
          hud.showCastTotal(`${fmt(e.lux)} Lux`);
          checkLux(final, e.lux, r.lux);
        }
      },
      onTick(T) { beams.reveal(T); },
      onDone() { finishCast(); },
    });
  }

  function checkLux(displayedTotal, eventCastLux, simCastLux) {
    log.luxChecks++;
    const simTotal = state.n.lux;
    if (displayedTotal !== simTotal || eventCastLux !== simCastLux) {
      log.luxMismatches++;
      console.error(`RENDERED LUX MISMATCH: shown ${displayedTotal} vs sim ${simTotal}; cast ${eventCastLux} vs ${simCastLux}`);
    }
  }

  function finishCast() {
    playing = false;
    player = null;
    if (hooks.onCastEnd) hooks.onCastEnd(state, mode);
    if (mode === 'attract') { beams.fadeAll(0.6); setTimeout(() => { if (mode === 'attract') attractNext(); }, 2600); return; }
    if (mode === 'view') { beams.fadeAll(0.45); setTimeout(() => { beams.endCast(); const f = viewDone; viewDone = null; if (f) f(); }, 1200); return; }
    // Overkill: the Aperture iris opens wider and the screen warms.
    const over = mode !== 'tutorial' && state.n.lux >= state.n.target * 1.5;
    boardView.openIris(over);
    if (post) post.warm(over);
    hud.showReplay(!!lastCast);
    setTimeout(() => hud.hideCastTotal(), 900);
    beams.fadeAll(0.45);
    setTimeout(() => { if (!playing) beams.endCast(); refreshPreview(); }, 700);
    if (state.phase === 'night') { sync(); return; }
    syncHUD();
    if (hooks.onNightEnd) hooks.onNightEnd(state);
    setTimeout(() => showPhase(), 650);
  }

  function showPhase() {
    if (state.phase === 'tutorialDone') {
      screens.tutorialDone(hud, state, {
        next: () => { hud.closeSheet(); if (state.tutorial.index + 1 < TUTORIAL.boards.length) startTutorial(state.tutorial.index + 1); else hooks.onTutorialComplete && hooks.onTutorialComplete(); },
      });
      return;
    }
    screens.nightResult(hud, state, data, {
      next: () => { hud.closeSheet(); showAfterResult(); },
    });
  }

  function showAfterResult() {
    if (state.phase === 'shop') openShop();
    else if (state.phase === 'reward') screens.reward(hud, state, data, {
      pick: (i) => { const o = state.reward.offers[i]; if (act({ type: 'pickReward', index: i })) revealGem(o); hud.closeSheet(); showAfterResult(); },
      skip: () => { act({ type: 'skipReward' }); hud.closeSheet(); showAfterResult(); },
    });
    else if (state.phase === 'won') showSummary(null, true);
    else if (state.phase === 'lost') showSummary(hooks.finishRun ? hooks.finishRun(state) : null, false);
    else sync();
  }

  // The run summary. A won run first offers Endless; the save is updated once, when the run is finished.
  function showSummary(outcome, pendingWin) {
    const final = state;
    screens.summary(hud, state, data, {
      outcome, pendingWin,
      achievement: (id) => hooks.achievement && hooks.achievement(id),
      endless: () => { act({ type: 'endless' }); hud.closeSheet(); showAfterResult(); },
      finish: () => showSummary(hooks.finishRun ? hooks.finishRun(state) : null, false),
      watch: () => watchBest(final, () => { load(final, 'over'); showSummary(outcome, pendingWin); }),
      share: () => { const b = final.stats.bestCast; screens.replayShare(hud, { link: seedLink(b.log + 1, final), clip: null }); },
      title: () => hooks.onTitle && hooks.onTitle(),
      newRun: () => hooks.onNewRun && hooks.onNewRun(),
    });
  }

  // Watch a finished run's best cast: rebuild the run up to it from the seed and log, then play it.
  let viewDone = null;
  function watchBest(final, done) {
    const b = final.stats.bestCast;
    if (b) playView(replayRun(final.opts, final.log.slice(0, b.log), data), done);
  }
  // Play the next cast of a rebuilt state as a viewer (nothing is saved), then call done.
  function playView(s, done) {
    hud.closeSheet();
    load(s, 'view');
    viewDone = done;
    setTimeout(() => startCast(), 500);
  }

  // Resume a saved run exactly. A cast interrupted mid-playback is played again from the log (the sim
  // is deterministic, so the state after it is the state that was saved).
  function resume(opts, log, castPending) {
    const last = log[log.length - 1];
    if (castPending && last && last.type === 'cast') {
      load(replayRun(opts, log.slice(0, -1), data), 'run');
      setTimeout(() => startCast(), 450);
      return;
    }
    load(replayRun(opts, log, data), 'run');
    if (state.phase !== 'night') showAfterResult();
  }

  // Attract mode behind the Title: demo runs place the best single gems, cast, and start over.
  let attractK = 0;
  let attractTimer = null;
  function attractNext() {
    if (mode !== 'attract' && state) return;
    const s = newRun({ seed: `attract:${attractK++ % 16}` }, data);
    load(s, 'attract');
    let placed = 0;
    const placeOne = () => {
      if (mode !== 'attract' || state !== s) return;
      const hand = s.n.hand.map((u) => s.gems[u]);
      const best = placed < placementLimit(s, data) ? bestSingle(castBoard(s, true, data), hand, castContext(s, data), (c) => occupied(s, c), data) : null;
      if (best) {
        act({ type: 'place', uid: s.n.hand[best.index], cell: best.cell, facing: best.facing });
        placed++;
        syncGems(); refreshPreview();
        const v = gemViews.get(best.cell); if (v) v.drop();
        attractTimer = setTimeout(placeOne, 700);
      } else attractTimer = setTimeout(() => { if (mode === 'attract' && state === s) startCast(); }, 900);
    };
    attractTimer = setTimeout(placeOne, 900);
  }
  function attract(onOff) {
    clearTimeout(attractTimer);
    if (onOff) { mode = 'attract'; state = null; attractNext(); }
  }

  // What the screen is visibly pointing at right now: the glowing card, the ghost outline's cell, the
  // pulsing gem, the pulsing Cast button, the sheet's single button. The no-reading test follows only these.
  function cues() {
    const rectOf = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    const covered = hud.sheetOpen; // a sheet over the board hides every board cue; only its button is live
    const out = { card: covered ? null : rectOf(hud.hand.querySelector('.card.hint')), ghost: null, pulse: null, cast: !covered && hud.cast.classList.contains('pulse') && !hud.cast.disabled ? rectOf(hud.cast) : null, button: null };
    if (!covered && hintGem && hintGem.group.visible !== false) out.ghost = screenOf(hintGem.group.position);
    if (!covered && mode === 'tutorial' && state && state.tutorial.pulse !== null && state.phase === 'night' && !playing && !pulseDone) { const v = gemViews.get(state.tutorial.pulse); if (v) out.pulse = screenOf(v.group.position); }
    const btns = hud.sheetOpen ? [...hud.sheet.querySelectorAll('button')] : [];
    if (btns.length === 1) out.button = rectOf(btns[0]);
    return out;
  }
  function screenOf(pos) {
    const v = new THREE.Vector3(pos.x, 0, pos.z).project(stage.camera);
    const r = stage.renderer.domElement.getBoundingClientRect();
    return { x: r.left + (v.x * 0.5 + 0.5) * r.width, y: r.top + (-v.y * 0.5 + 0.5) * r.height };
  }

  // New Inclusion gem: slow rotate reveal with its generated name and number.
  function revealGem(spec) {
    fx.reveal(spec);
    hud.toast(`${spec.name}: ${data.inclusion[spec.inclusion].name}`);
    if (hooks.sound) hooks.sound('reveal', spec);
  }

  // Cast replay: slow motion with a free camera orbit (drag), a seed link, and a clip where supported.
  function replay() {
    if (!lastCast || playing || replaying) return;
    replaying = true; playing = true;
    beams.hidePreview();
    beams.beginCast(segments(lastCast.events, lastCast.radius), lastCast.radius);
    const rec = hooks.startClip ? hooks.startClip() : null;
    player = createPlayer(lastCast.events, {
      speed: 0.35,
      onEvent(e) {
        if (e.type === 'strike' || e.type === 'split') { const v = gemViews.get(e.cell); if (v) v.flash(e.color, colorHex(e.color)); fx.sparkle(e.cell, e.color); }
        if (e.type === 'dawn' && post) post.dawn();
        if (hooks.sound) hooks.sound('event', e);
      },
      onTick(T) { beams.reveal(T); },
      onDone() {
        playing = false; replaying = false; player = null;
        stage.setAzimuth(0);
        if (rec) rec.stop();
        setTimeout(() => { beams.endCast(); refreshPreview(); }, 900);
        screens.replayShare(hud, { link: seedLink(lastCast.logIndex), clip: rec });
      },
    });
  }

  function seedLink(logIndex, s = state) {
    const json = JSON.stringify({ seed: s.seed, lantern: s.lantern, vigil: s.vigil, loans: s.opts.loans, log: s.log.slice(0, logIndex) });
    const b64 = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${location.origin}${location.pathname}?replay=${b64}`;
  }

  // The Lapidary introduces itself inline (one sentence under its title) for the whole first visit.
  let shopIntro = null;
  function openShop() {
    if (hooks.intro && !shopIntro) shopIntro = hooks.intro('lapidary', true) || '';
    screens.shop(hud, state, data, {
      intro: shopIntro,
      loanable: hooks.loanable ? () => hooks.loanable(state) : null,
      act: (a) => {
        const offer = a.type === 'buyGem' ? state.shop.gems[a.index] : null;
        const r = act(a);
        if (r) { if (offer && offer.inclusion) revealGem(offer); if (hooks.onAction) hooks.onAction(state, null, mode); openShop(); syncHUD(); }
        return r;
      },
      leave: () => { act({ type: 'leave' }); shopIntro = ''; hud.closeSheet(); builtBoard = null; sync(); },
    });
  }

  // ---------------------------------------------------------------- input
  function pick(clientX, clientY) {
    const rect = stage.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, stage.camera);
    const hit = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(plane, hit)) return -1;
    return builtBoard ? cellAt(grid(builtBoard.radius), hit.x, hit.z) : -1;
  }

  function validCells() {
    const g = grid(builtBoard.radius);
    const s = new Set();
    for (let c = 0; c < g.n; c++) if (!occupied(state, c)) s.add(c);
    return s;
  }

  function placedAt(cell) { return state.n.placed.find((p) => p.cell === cell); }

  function beginDrag(src, e) {
    drag = { ...src, x0: e.clientX, y0: e.clientY, t0: performance.now(), ts0: e.timeStamp, moved: false, id: e.pointerId, cell: -1 };
    // A long press opens the rule card on release, decided from the two events' own timestamps: on a slow
    // phone the handlers can run half a second apart for a quick tap, and a tap must still rotate.
    // The timer only lights the card as the press is held.
    drag.timer = setTimeout(() => { if (drag && !drag.moved && drag.card) drag.card.classList.add('marked'); }, LONG_PRESS_MS);
  }

  function longPress(d) {
    if (d.uid !== undefined) screens.ruleCardGem(hud, data, state.gems[d.uid]);
    else if (d.cell >= 0) screens.ruleCardCell(hud, state, data, d.cell);
  }

  let orbit = null;
  function onPointerDown(e) {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, t: performance.now() });
    if (replaying) { orbit = { x0: e.clientX, a0: stage.azimuth }; return; }
    if (playing && player) { player.fastForward(); return; }
    if (!state || state.phase !== 'night' || hud.sheetOpen) return;
    if (pointers.size === 2 && drag && drag.fromBoard) { // two-finger tap: counter-clockwise
      clearTimeout(drag.timer);
      const cell = drag.cell0;
      drag = null;
      if (placedAt(cell)) rotate(cell, -1);
      return;
    }
    const card = e.target.closest && e.target.closest('.card');
    if (card && card.parentElement === hud.hand) {
      const uid = Number(card.dataset.uid);
      if (marked) { marked.has(uid) ? marked.delete(uid) : marked.add(uid); syncHUD(); return; }
      beginDrag({ uid, card, fromBoard: false }, e);
      return;
    }
    if (e.target === stage.renderer.domElement) {
      const cell = pick(e.clientX, e.clientY);
      if (cell < 0) return;
      const p = placedAt(cell);
      beginDrag({ uid: p ? p.uid : undefined, fromBoard: true, cell0: cell, placed: p, cell }, e);
    }
  }

  function onPointerMove(e) {
    const pt = pointers.get(e.pointerId);
    if (pt) { pt.x = e.clientX; pt.y = e.clientY; }
    if (orbit) { stage.setAzimuth(orbit.a0 + (e.clientX - orbit.x0) * 0.008); return; }
    if (!drag || drag.id !== e.pointerId) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > DRAG_PX) {
      const movable = drag.uid !== undefined && (!drag.fromBoard || (drag.placed && !drag.placed.locked && (drag.placed.cast === state.n.castIndex || mode === 'tutorial')));
      if (!movable) { clearTimeout(drag.timer); drag = null; return; }
      drag.moved = true;
      clearTimeout(drag.timer);
      if (drag.card) drag.card.classList.add('lifted');
      if (drag.fromBoard) { const v = gemViews.get(drag.cell0); if (v) v.group.visible = false; }
      ghost = makeGem(data, { ...state.gems[drag.uid], facing: 0 });
      ghost.group.visible = false;
      stage.scene.add(ghost.group);
    }
    if (drag.moved) {
      const cell = pick(e.clientX, e.clientY);
      const valid = validCells();
      if (drag.fromBoard) valid.add(drag.cell0);
      const ok = cell >= 0 && valid.has(cell);
      drag.cell = ok ? cell : -1;
      boardView.highlight(valid, drag.cell);
      if (ok) {
        const p = cellPos(grid(builtBoard.radius), cell);
        ghost.group.visible = true;
        ghost.group.position.set(p.x, 0.15, p.z);
        const gm = state.gems[drag.uid];
        const f = drag.fromBoard ? drag.placed.facing : defaultFacing(drag.uid, cell);
        ghost.setFacing(f, true);
        previewExtra = drag.fromBoard ? null : { cell, cut: gm.cut, stone: gm.stone, tier: gm.tier, inclusion: gm.inclusion, facing: f, gemId: gm.gemId, nightsSurvived: gm.nightsSurvived };
      } else { ghost.group.visible = false; previewExtra = null; }
    }
  }

  function endDrag(e, cancelled) {
    pointers.delete(e.pointerId);
    orbit = null;
    if (!drag || drag.id !== e.pointerId) return;
    const d = drag;
    drag = null;
    clearTimeout(d.timer);
    if (ghost) { stage.scene.remove(ghost.group); ghost = null; }
    previewExtra = null;
    boardView.highlight(null, -1);
    if (d.card) d.card.classList.remove('lifted', 'marked');
    if (!d.moved) {
      if (cancelled) return;
      if (e.timeStamp - d.ts0 >= LONG_PRESS_MS) { longPress(d); return; }
      if (d.fromBoard && d.placed) rotate(d.cell0, 1);
      return;
    }
    if (d.fromBoard) {
      const v = gemViews.get(d.cell0);
      if (v) v.group.visible = true;
      const overHand = e.clientY > hud.handzone.getBoundingClientRect().top;
      if (overHand) { if (act({ type: 'unplace', uid: d.uid })) sync(); return; }
      if (d.cell >= 0 && d.cell !== d.cell0) { if (act({ type: 'move', uid: d.uid, cell: d.cell })) sync(); return; }
      refreshPreview();
      return;
    }
    if (d.cell >= 0 && !cancelled) place(d.uid, d.cell);
    else refreshPreview();
  }

  const canvas = stage.renderer.domElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  hud.hand.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', (e) => endDrag(e, false));
  window.addEventListener('pointercancel', (e) => endDrag(e, true));
  uiRoot.addEventListener('pointerdown', (e) => { if (playing && player && e.target.closest('#handzone, #status, #rail, #actionbar, #castTotal')) player.fastForward(); });
  hud.rail.addEventListener('click', (e) => { const b = e.target.closest('.setting'); if (b) screens.ruleCardSetting(hud, data, b.dataset.setting); });
  hud.pause.addEventListener('click', () => { if (hooks.onPause) hooks.onPause(); });
  hud.replayBtn.addEventListener('click', (e) => { e.stopPropagation(); replay(); });
  hud.redraw.addEventListener('click', () => {
    if (!state || state.phase !== 'night' || playing) return;
    if (!marked) { marked = new Set(); hud.toast('Tap cards to redraw, then tap here'); syncHUD(); return; }
    const uids = [...marked];
    marked = null;
    if (uids.length && act({ type: 'redraw', uids })) { /* redrawn */ }
    sync();
  });
  // Cast needs a 150 ms hold to prevent accidents.
  let holdTimer = null;
  hud.cast.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (hud.cast.disabled || playing) return;
    hud.cast.classList.add('holding');
    holdTimer = setTimeout(() => { hud.cast.classList.remove('holding'); holdTimer = null; startCast(); }, 150);
  });
  const cancelHold = () => { if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } hud.cast.classList.remove('holding'); };
  hud.cast.addEventListener('pointerup', cancelHold);
  hud.cast.addEventListener('pointerleave', cancelHold);

  // ---------------------------------------------------------------- lifecycle
  function load(s, m) {
    if (m !== 'attract') clearTimeout(attractTimer);
    if (player) { player = null; playing = false; replaying = false; beams.endCast(); }
    if (hintGem) { stage.scene.remove(hintGem.group); hintGem.dispose(); hintGem = null; }
    state = s; mode = m; builtBoard = null; marked = null; lastCast = null; shopIntro = null;
    hud.showReplay(false);
    hud.hideCastTotal();
    beams.clearDecals();
    hud.closeSheet();
    sync();
  }
  function startTutorial(i) { load(tutorialState(i, data), 'tutorial'); }

  let tPrev = 0;
  function update(dt) {
    boardView.update(dt);
    beams.update(dt);
    fx.update(dt);
    for (const v of gemViews.values()) v.update(dt);
    if (ghost) ghost.update(dt);
    if (hintGem) { hintGem.update(dt); const k = 0.2 + 0.12 * Math.sin(performance.now() / 300); hintGem.group.traverse((o) => { if (o.material) o.material.opacity = k; }); }
    if (player) player.update(dt);
    if (previewExtra !== null || (drag && drag.moved)) {
      previewTimer -= dt;
      if (previewTimer <= 0) { previewTimer = 1 / 30; refreshPreview(previewExtra); } // throttled to 30 Hz
    }
    if (mode === 'tutorial' && state && state.tutorial.pulse !== null && state.phase === 'night' && !playing && !pulseDone) {
      const v = gemViews.get(state.tutorial.pulse);
      if (v && !v.state.flash && Math.floor(performance.now() / 900) % 2 === 0) v.flash(7, 0xffe7a0);
    }
    void tPrev;
  }

  return {
    hud, update, load, startTutorial, sync, replay, resume, attract, cues, watchBest, playView, setPatterns: (on) => beams.setPatterns(on), setReducedMotion: (on) => { settingsPrefs.reducedMotion = on; if (post) post.setReducedMotion(on); },
    get state() { return state; }, get mode() { return mode; }, get playing() { return playing; }, get log() { return log; },
    debug: { pick, place, rotate, startCast, act, advance(sec) { const n = Math.round(sec * 60); for (let k = 0; k < n; k++) update(1 / 60); }, cellScreen(cell) { const p = cellPos(grid(builtBoard.radius), cell); const v = new THREE.Vector3(p.x, 0, p.z).project(stage.camera); const r = stage.renderer.domElement.getBoundingClientRect(); return { x: r.left + (v.x * 0.5 + 0.5) * r.width, y: r.top + (-v.y * 0.5 + 0.5) * r.height }; } },
  };
}
