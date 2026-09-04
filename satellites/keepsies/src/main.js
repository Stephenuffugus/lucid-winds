/**
 * Boot and the screen router.
 *
 * Screens: title, rules, match, results, pause. Each is a DOM veil over one
 * canvas; the match is the only one that steps physics. From K2 the screens move
 * into `meta/` and `game/` as modules with `enter(params)` and `exit()`, and this
 * file becomes the router alone.
 *
 * DIRECTIONS BEFORE PLAY. The rules card is shown before the first match of the
 * mode, which is a studio standard and not a preference.
 */
import { detectQuality } from './render/quality.js?v=20260904a';
import { createStage, createOrbitRig, resize, draw, THREE } from './render/scene.js?v=20260904a';
import { buildRingerGround } from './render/arenaEnv.js?v=20260904a';
import { makeMarbleMesh, makeContactShadow, placeContactShadow } from './render/marbleMesh.js?v=20260904a';
import { attachCameraControls } from './input/cameraCtl.js?v=20260904a';
import { createKnuckle } from './input/knuckle.js?v=20260904a';
import { createPullback } from './input/pullback.js?v=20260904a';
import * as AUDIO from './audio/synth.js?v=20260904a';
import { initPhysics, positionOf, specOf } from './core/physics.js?v=20260904a';
import { createRinger } from './game/ringer.js?v=20260904a';
import { RINGER_TECHNIQUES } from './core/techniques.js?v=20260904a';
import { launchSpeed } from './core/snap.js?v=20260904a';
import { clamp, len2, DEG } from './core/dmath.js?v=20260904a';

const $ = (id) => document.getElementById(id);
const TEST = /[?&]keepsiestest=1/.test(location.search);

const G = {
  tuning: null, tier: null, stage: null, rig: null, ground: null, cam: null,
  knuckle: null, pullback: null, usePullback: false,
  R: null, meshes: new Map(), shadows: new Map(), prev: new Map(),
  acc: 0, last: 0, raf: 0, screen: 'title', frames: 0, booted: false,
  topDown: false, paused: false, freeCam: false,
  matchesPlayed: 0, seenRules: false, calib: { max: null },
  placeDrag: null, lastToast: 0, sunbeams: 0, said: '', lastFramedTurn: -1
};

/* ------------------------------------------------------------------- boot */

async function boot() {
  const res = await fetch('src/data/tuning.json?v=20260904a');
  if (!res.ok) throw new Error('tuning.json did not load: ' + res.status);
  G.tuning = await res.json();
  G.calib.max = G.tuning.snap.thumbSpeedMaxDefault;
  AUDIO.configure(G.tuning);

  G.tier = detectQuality(G.tuning);
  const canvas = $('stage');
  G.stage = createStage(canvas, G.tuning, G.tier);
  G.rig = createOrbitRig(G.stage, { target: { x: 0, y: 0.012, z: 0 }, distance: 2.2, elevationDeg: 33 });
  G.ground = buildRingerGround(G.stage, G.tuning, { discRadius: 30 });

  await initPhysics();

  G.knuckle = createKnuckle(canvas, G.tuning, {
    taw: () => (G.R && G.screen === 'match' && canAim() ? G.R.tawOnScreen(G.rig) : null),
    aimAzimuth: () => G.rig.state.azimuth + Math.PI,
    calib: () => G.calib,
    onBrace: onBrace,
    onAim: onAim,
    onCancel: () => { say('That was too soft to count, so it does not. Take it again.'); hideAim(); },
    haptic: (k) => { if (navigator.vibrate) { try { navigator.vibrate(k === 'settle' ? 8 : 14); } catch (e) { } } },
    enabled: () => !G.usePullback && G.screen === 'match' && !G.paused
  });
  G.knuckle.attach();

  G.pullback = createPullback(canvas, G.tuning, {
    taw: () => (G.R && G.screen === 'match' && canAim() ? G.R.tawOnScreen(G.rig) : null),
    aimAzimuth: () => G.rig.state.azimuth + Math.PI,
    onDrag: (r) => { showPower(r.power01); },
    onAim: onAim,
    onCancel: () => hideAim(),
    enabled: () => G.usePullback && G.screen === 'match' && !G.paused
  });
  G.pullback.attach();

  G.cam = attachCameraControls(canvas, G.rig, {
    isClaimed: (id) => G.knuckle.owns(id) || G.pullback.owns(id) || (G.placeDrag === id)
  });
  attachPlacement(canvas);

  addEventListener('resize', () => { if (resize(G.stage)) drawNow(); });
  if (window.visualViewport) visualViewport.addEventListener('resize', () => { if (resize(G.stage)) drawNow(); });

  wireButtons();
  $('boot').hidden = true;
  showScreen('title');
  G.booted = true;
  G.last = performance.now();
  G.raf = requestAnimationFrame(frame);
  if (TEST) installDevHook();
}

function wireButtons() {
  $('play').addEventListener('click', () => {
    AUDIO.unlock();
    if (G.seenRules) { showScreen('match'); startMatch(); }
    else showScreen('rules');
  });
  $('rulesGo').addEventListener('click', () => { G.seenRules = true; showScreen('match'); startMatch(); });
  $('again').addEventListener('click', () => { showScreen('match'); startMatch(); });
  $('toTitle').addEventListener('click', () => { endMatch(); showScreen('title'); });
  $('topDown').addEventListener('click', () => {
    G.topDown = !G.topDown;
    $('topDown').textContent = G.topDown ? 'Side on' : 'Top down';
  });
  $('pause').addEventListener('click', () => { G.paused = true; $('pauseCard').hidden = false; });
  $('resume').addEventListener('click', () => { G.paused = false; $('pauseCard').hidden = true; });
  $('abandon').addEventListener('click', () => {
    G.paused = false; $('pauseCard').hidden = true; endMatch(); showScreen('title');
  });
}

/* ---------------------------------------------------------------- screens */

function showScreen(name) {
  G.screen = name;
  $('title').hidden = name !== 'title';
  $('rulesCard').hidden = name !== 'rules';
  $('hud').hidden = name !== 'match';
  $('results').hidden = name !== 'results';
  if (name !== 'match') { $('pauseCard').hidden = true; G.paused = false; hideAim(); }
}

/* -------------------------------------------------------------- the match */

function startMatch(opts) {
  endMatch();
  const o = opts || {};
  G.R = createRinger({
    tuning: G.tuning,
    seed: o.seed || (Date.now() & 0x7fffffff),
    skipLag: false,
    forceFirst: o.forceFirst,
    houseRules: Object.assign(
      { keepsies: true, slips: true, bombing: false, poison: false, ringSizeFt: 10 }, o.houseRules),
    players: [
      { name: 'You', ai: null, tawEntry: 'taw_clearie' },
      { name: 'Dusty', ai: o.opponent || 'rookie', tawEntry: 'taw_bumblebee' }
    ],
    hooks: {
      onPocket: () => AUDIO.impact({ material: 'glass', diameterMm: 16, relSpeed: 1.4, seed: 0.5 }),
      onTechnique: (id) => showToast(id),
      onOver: (s) => finishMatch(s)
    }
  });
  buildMeshes();
  G.R.doLag();
  say(G.R.match.turn === 0 ? 'You won the lag. Hold your shooter, then flick.'
    : 'Dusty won the lag and shoots first.');
  G.R.frameShot(G.rig, true);
  G.rig.update(1 / 60);
  G.lastFramedTurn = G.R.match.turn;
  G.freeCam = false;
  updateHud();
}

function endMatch() {
  if (!G.R) return;
  for (const [, mesh] of G.meshes) { G.stage.scene.remove(mesh); mesh.material.dispose(); }
  for (const [, sh] of G.shadows) { G.stage.scene.remove(sh); sh.material.dispose(); sh.geometry.dispose(); }
  G.meshes.clear(); G.shadows.clear(); G.prev.clear();
  G.R.dispose();
  G.R = null;
}

function buildMeshes() {
  for (const m of G.R.mibs.concat(G.R.taws)) {
    const spec = specOf(G.R.world, m.id);
    const mesh = makeMarbleMesh(m.entry, spec, G.tuning, G.tier, m.uid);
    G.stage.scene.add(mesh);
    G.meshes.set(m.id, mesh);
    const sh = makeContactShadow(spec.radius);
    G.stage.scene.add(sh);
    G.shadows.set(m.id, sh);
    const p = positionOf(G.R.world, m.id);
    G.prev.set(m.id, { p: new THREE.Vector3(p.x, p.y, p.z), q: new THREE.Quaternion() });
  }
}

const canAim = () => !!G.R && !G.R.state.simulating && !G.R.isAiTurn()
  && (G.R.state.phase === 'aim' || G.R.state.phase === 'place');

/* --------------------------------------------------------------- placing */

/**
 * Placing the taw is a drag along the ring's edge arc, and touching the shooter
 * commits it and begins the brace. There is no PLACE button: pre commitment over
 * buttons, and one gesture flows straight into the next.
 */
function attachPlacement(canvas) {
  canvas.addEventListener('pointerdown', (e) => {
    if (!canAim() || G.R.state.phase !== 'place') return;
    const t = G.R.tawOnScreen(G.rig);
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (t && len2(x - t.x, y - t.y) <= t.r * 1.6) return;   // that is a brace, not a placement
    G.placeDrag = e.pointerId;
  }, { passive: false });
  canvas.addEventListener('pointermove', (e) => {
    if (G.placeDrag !== e.pointerId || !G.R || G.R.state.phase !== 'place') return;
    const r = canvas.getBoundingClientRect();
    const frac = clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1);
    G.R.setPlaceAngle(G.rig.state.azimuth + Math.PI + (frac - 0.5) * Math.PI * 1.4);
  });
  const drop = (e) => { if (G.placeDrag === e.pointerId) G.placeDrag = null; };
  canvas.addEventListener('pointerup', drop);
  canvas.addEventListener('pointercancel', drop);
}

/* --------------------------------------------------------------- the shot */

function onBrace(st) {
  if (!G.R || G.screen !== 'match') return;
  if (st.bracing && G.R.state.phase === 'place') G.R.commitPlace();
  const t = G.R.tawOnScreen(G.rig);
  const ret = $('reticle'), line = $('aimline');
  if (!st.bracing || !t) { ret.hidden = true; line.hidden = true; $('power').hidden = true; return; }
  /* The reticle breathes with the cone: wide while you are still moving, tight
     when the hold has settled. The first version scaled from the DRAWN radius by
     up to four times, which drew a big gold hoop around a sixteen pixel marble
     and swallowed the thing you are actually looking at. It is scaled from the
     grab radius now, so at a full brace the ring sits just outside your thumb. */
  const px = (t.grabR || t.r * 1.6) * (0.70 + st.coneDeg * 0.16);
  ret.hidden = false;
  ret.style.left = (t.x - px) + 'px';
  ret.style.top = (t.y - px) + 'px';
  ret.style.width = ret.style.height = (px * 2) + 'px';
  ret.style.borderColor = st.settle01 > 0.98 ? 'rgba(200,168,75,.95)' : 'rgba(232,220,200,.55)';
  ret.style.borderWidth = st.settle01 > 0.98 ? '2px' : '1px';
  // DIRECTION ONLY, never a predicted path. That is DESIGN 7.1 and it is not
  // negotiable in ranked play, so it is not built at all. It starts OUTSIDE the
  // reticle so the two do not read as one shape.
  line.hidden = false;
  line.style.left = t.x + 'px';
  line.style.top = (t.y - px - 6) + 'px';
  line.style.width = '54px';
  line.style.transform = 'rotate(-90deg)';
}

function onAim(aim) {
  if (!G.R || G.screen !== 'match' || G.R.state.simulating) return;
  hideAim();
  if (G.R.state.phase === 'place') G.R.commitPlace();
  const imp = G.R.shoot(aim);
  if (!imp) { say('That one slipped, so it does not count. Take it again.'); return; }
  say(describe(aim, imp));
}

/** One line about what the game just saw, in the voice (DESIGN 16.2). */
function describe(aim, imp) {
  if (aim.wildness01 >= 0.5) return 'That was a wild one.';
  if (aim.contactOffset.y <= -0.35) return 'Low across the ball.';
  if (aim.contactOffset.y >= 0.35) return 'Over the top of it.';
  if (Math.abs(aim.contactOffset.x) >= 0.4) return 'A bit of english on that one.';
  if (imp.speed > 5) return 'Clean through the middle, and hard.';
  return 'Clean through the middle.';
}

function hideAim() { $('reticle').hidden = true; $('aimline').hidden = true; $('power').hidden = true; }
function showPower(p) { $('power').hidden = false; $('powerFill').style.width = (p * 100).toFixed(0) + '%'; }
function say(s) { G.said = s; $('say').textContent = s; }

function showToast(id) {
  const t = RINGER_TECHNIQUES[id];
  if (!t) return;
  $('toastName').textContent = t.name;
  $('toastBlurb').textContent = t.blurb;
  $('toast').hidden = false;
  G.lastToast = performance.now();
}

function updateHud() {
  if (!G.R) return;
  const M = G.R.match;
  for (const [el, i] of [[$('sockMe'), 0], [$('sockThem'), 1]]) {
    const have = M.players[i].pocketed.length;
    if (el.childElementCount !== M.toWin) {
      el.textContent = '';
      for (let k = 0; k < M.toWin; k++) { const d = document.createElement('span'); d.className = 'sock'; el.appendChild(d); }
    }
    for (let k = 0; k < M.toWin; k++) el.children[k].className = 'sock' + (k < have ? ' full' : '');
  }
  $('whoMe').className = 'who' + (M.turn === 0 ? ' on' : '');
  $('whoThem').className = 'who' + (M.turn === 1 ? ' on' : '');
  $('whoThem').textContent = M.players[1].name;
  const hr = M.houseRules;
  $('houseRules').textContent = [
    hr.keepsies ? 'keeps' : 'for fair', hr.slips ? 'slips' : null,
    hr.bombing ? 'bombing' : null, hr.poison ? 'poison' : null, hr.ringSizeFt + ' foot'
  ].filter(Boolean).join(', ');
}

function finishMatch(s) {
  const won = s.winner === 0;
  $('resultTitle').textContent = won ? 'You win' : 'Dusty wins';
  $('rPocket').textContent = s.pocketed[0] + ' of ' + G.R.match.toWin;
  $('rShots').textContent = String(s.shots);
  const names = G.R.state.techniques.map(id => (RINGER_TECHNIQUES[id] || {}).name).filter(Boolean);
  $('rTech').textContent = names.length ? names.join(', ') : 'none yet';
  const pay = won ? G.tuning.economy.fleetSunbeamsPerMatchMax : G.tuning.economy.fleetSunbeamsPerMatchMin;
  let granted = 0;
  try { if (window._sbCapEarn) granted = window._sbCapEarn(pay, 'keepsies:match'); } catch (e) { }
  G.sunbeams += granted;
  $('rSun').textContent = String(granted);
  G.matchesPlayed++;
  try { if (window.SWSMusic && SWSMusic.milestone) SWSMusic.milestone(G.matchesPlayed); } catch (e) { }
  showScreen('results');
}

/* --------------------------------------------------------------- the loop */

function physStep() {
  if (!G.R) return;
  const W = G.R.world;
  for (const [id, pr] of G.prev) {
    if (!W.marbles.has(id)) continue;
    const p = positionOf(W, id);
    const b = W.marbles.get(id).body.rotation();
    pr.p.set(p.x, p.y, p.z);
    pr.q.set(b.x, b.y, b.z, b.w);
  }
  const events = G.R.tick();
  if (events && events.length) {
    AUDIO.playContacts(events, (id) => {
      const m = W.marbles.get(id);
      return m ? m.spec : null;
    });
  }
}

function syncMeshes(alpha) {
  if (!G.R) return;
  const W = G.R.world;
  for (const [id, mesh] of G.meshes) {
    const m = W.marbles.get(id);
    if (!m) {
      mesh.visible = false;
      const s = G.shadows.get(id);
      if (s) s.visible = false;
      continue;
    }
    const p = m.body.translation(), r = m.body.rotation();
    const pr = G.prev.get(id);
    mesh.position.set(
      pr.p.x + (p.x - pr.p.x) * alpha,
      pr.p.y + (p.y - pr.p.y) * alpha,
      pr.p.z + (p.z - pr.p.z) * alpha
    );
    mesh.quaternion.set(r.x, r.y, r.z, r.w);
    const sh = G.shadows.get(id);
    if (sh) placeContactShadow(sh, mesh.position.x, mesh.position.y, mesh.position.z, m.spec.radius);
  }
}

function drawNow() { G.rig.update(1 / 60); draw(G.stage, G.rig); }

function frame(now) {
  G.raf = requestAnimationFrame(frame);
  const dt = Math.min(0.25, (now - G.last) / 1000);
  G.last = now;

  if (G.R && G.screen === 'match' && !G.paused) {
    const h = G.tuning.physics.fixedStep;
    const maxSteps = G.tuning.physics.maxSubstepsPerFrame;
    G.acc += dt;
    let n = 0;
    while (G.acc >= h && n < maxSteps && G.R.state.simulating) { G.acc -= h; physStep(); n++; }
    // ⛔ a tab that was in the background returns with a full accumulator and
    // would otherwise simulate the missing minute in one frame. Drop the debt.
    if (G.acc > h * maxSteps) G.acc = 0;
    syncMeshes(G.R.state.simulating ? G.acc / h : 1);

    if (!G.R.state.simulating && G.R.state.phase !== 'over' && G.R.isAiTurn() && !G.R.state.aiThinking) {
      say(G.R.match.players[G.R.match.turn].name + ' is lining one up.');
      G.R.aiTurn();
    }
    // ⛔ CUT, do not swoop. When the turn passes, the camera has to travel about
    // a hundred and forty degrees to get behind the other shooter, and damping
    // across that is both a long dizzy swoop for the player and, for a good
    // twenty frames, a board with no shooter visible on it at all. A turn change
    // is a cut; the drift within a turn stays smooth.
    if (!G.freeCam) {
      const t = G.R.match.turn;
      const snapIt = t !== G.lastFramedTurn;
      G.R.frameShot(G.rig, snapIt);
      if (snapIt) { G.lastFramedTurn = t; G.rig.update(1 / 60); }
    }
    if (G.topDown) { G.rig.state.elevationDeg = 84; G.rig.state.wantDistance = G.R.ringRadius * 1.9; }
    else if (G.rig.state.elevationDeg > 60) G.rig.state.elevationDeg = 33;
    updateHud();
    if (!$('toast').hidden && now - G.lastToast > 2400) $('toast').hidden = true;
  }

  G.rig.update(dt);
  draw(G.stage, G.rig);
  G.frames++;
}

/* -------------------------------------------------------------- dev hook */

function installDevHook() {
  window.KEEPSIES_DEV = {
    state() {
      const R = G.R;
      return {
        screen: G.screen, frames: G.frames, quality: G.tier.name, paused: G.paused,
        matchesPlayed: G.matchesPlayed, said: G.said, sunbeams: G.sunbeams,
        usePullback: G.usePullback, seenRules: G.seenRules,
        match: R ? {
          phase: R.state.phase, simulating: R.state.simulating, turn: R.match.turn,
          pocketed: R.match.players.map(p => p.pocketed.length),
          mibsLeft: R.liveMibs().length, shots: R.match.shotNumber,
          winner: R.match.winner, techniques: R.state.techniques.slice(),
          slipsLeft: R.match.players.map(p => p.slipsLeft),
          taw: R.tawOnScreen(G.rig)
        } : null,
        knuckle: G.knuckle.state(),
        lastAim: G.knuckle.lastAim(),
        audio: AUDIO.isRunning()
      };
    },
    start: (opts) => { G.seenRules = true; showScreen('match'); startMatch(opts); },
    rules: () => showScreen('rules'),
    /** Drive the whole Knuckle from a synthesised path. Returns the AimSource. */
    flick(samples) { return G.knuckle._feed(samples, G.R ? G.R.tawOnScreen(G.rig) : null); },
    /** Drive the pull back fallback the same way. */
    drag(from, to, offset) { return G.pullback._feed(from, to, G.R ? G.R.tawOnScreen(G.rig) : null, offset); },
    setPullback(on) { G.usePullback = !!on; },
    /** Step the match forward without waiting for real time. */
    tick(n) { for (let i = 0; i < (n || 60); i++) physStep(); syncMeshes(1); return G.R ? G.R.world.steps : 0; },
    /** Resolve the shot in flight. */
    settle(maxSteps) {
      let k = 0;
      while (G.R && G.R.state.simulating && k++ < (maxSteps || 1400)) physStep();
      syncMeshes(1);
      return k;
    },
    aiTurn() { return G.R ? G.R.aiTurn() : null; },
    /**
     * Play the opponent's turns to completion without waiting for real time.
     * A gate that waits for the frame loop to grind an AI shot out at software
     * rasteriser frame rates spends forty seconds on one turn and times out on a
     * game that is working perfectly.
     */
    playAiTurns(maxTurns) {
      let n = 0;
      while (G.R && G.R.state.phase !== 'over' && G.R.isAiTurn() && n++ < (maxTurns || 40)) {
        if (!G.R.state.simulating) G.R.aiTurn();
        let k = 0;
        while (G.R.state.simulating && k++ < 1500) physStep();
      }
      syncMeshes(1);
      return n;
    },
    camera(azimuthDeg, elevationDeg, distance, opts) {
      G.freeCam = true;
      const st = G.rig.state;
      st.allowUnder = !!(opts && opts.allowUnder);
      st.azimuth = st.wantAzimuth = azimuthDeg * DEG;
      st.elevationDeg = elevationDeg;
      st.distance = st.wantDistance = distance;
      G.rig.update(1 / 60);
      return { azimuthDeg, elevationDeg: st.elevationDeg, distance, clamped: !st.allowUnder };
    },
    followShot() { G.freeCam = false; },
    /** Let the camera finish moving without waiting for frames. A fixture. */
    settleCamera(n) {
      for (let i = 0; i < (n || 40); i++) {
        if (G.R && !G.freeCam) G.R.frameShot(G.rig, false);
        G.rig.update(1 / 60);
      }
      return G.R ? G.R.tawOnScreen(G.rig) : null;
    },
    debugCam() {
      if (!G.R) return null;
      const t = G.R.shooterTaw();
      const p = positionOf(G.R.world, t.id);
      const c = G.rig.project(p.x, p.y, p.z);
      return {
        freeCam: G.freeCam, phase: G.R.state.phase,
        tawWorld: { x: +p.x.toFixed(3), z: +p.z.toFixed(3) },
        proj: { x: +c.x.toFixed(1), y: +c.y.toFixed(1), visible: c.visible },
        viewport: G.rig.viewport,
        cam: {
          az: +G.rig.state.azimuth.toFixed(3), wantAz: +G.rig.state.wantAzimuth.toFixed(3),
          dist: +G.rig.state.distance.toFixed(2), wantDist: +G.rig.state.wantDistance.toFixed(2),
          el: G.rig.state.elevationDeg
        }
      };
    },
    launchSpeed: (p) => launchSpeed(p, G.tuning),
    tuning: () => G.tuning
  };
}

/* --------------------------------------------------------------------- go */

window.addEventListener('error', (e) => {
  const b = $('boot');
  if (b && !G.booted) { b.hidden = false; b.textContent = 'Keepsies could not start: ' + (e.message || 'unknown'); }
});

boot().catch((e) => {
  const b = $('boot');
  if (b) { b.hidden = false; b.textContent = 'Keepsies could not start: ' + e.message; }
  console.error(e);
});
