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
import { createStage, createOrbitRig, resize, draw, drawScene, THREE } from './render/scene.js?v=20260904a';
import { buildRingerGround } from './render/arenaEnv.js?v=20260904a';
import { makeMarbleMesh, makeContactShadow, placeContactShadow } from './render/marbleMesh.js?v=20260904a';
import { attachCameraControls } from './input/cameraCtl.js?v=20260904a';
import { createKnuckle } from './input/knuckle.js?v=20260904a';
import { createPullback } from './input/pullback.js?v=20260904a';
import * as AUDIO from './audio/synth.js?v=20260904a';
import { initPhysics, positionOf, specOf, velocityOf } from './core/physics.js?v=20260904a';
import { createRinger } from './game/ringer.js?v=20260904a';
import { RINGER_TECHNIQUES } from './core/techniques.js?v=20260904a';
import { launchSpeed } from './core/snap.js?v=20260904a';
import { clamp, len2, DEG } from './core/dmath.js?v=20260904a';
import * as SAVE from './meta/save.js?v=20260904a';
import { createCalibration, calibrationFrom } from './meta/onboarding.js?v=20260904a';
import { createTurntable, createThumbnailer, useMaterialFactory, groupForGrid, starterGrant, provenance, hardnessWord, weightWord, TIER_ORDER, TIER_LABEL }
  from './meta/collection.js?v=20260904a';
import * as MARBLEMESH from './render/marbleMesh.js?v=20260904a';
import { bodySpec } from './core/marbleBody.js?v=20260904a';
import { makeRng } from './core/rng.js?v=20260904a';
import { makeMarbleMaterial } from './render/marbleMesh.js?v=20260904a';

const $ = (id) => document.getElementById(id);
const TEST = /[?&]keepsiestest=1/.test(location.search);

const G = {
  tuning: null, tier: null, stage: null, rig: null, ground: null, cam: null,
  knuckle: null, pullback: null, usePullback: false,
  R: null, meshes: new Map(), shadows: new Map(), prev: new Map(),
  acc: 0, last: 0, raf: 0, screen: 'title', frames: 0, booted: false,
  topDown: false, paused: false, freeCam: false,
  matchesPlayed: 0, seenRules: false, calib: { max: null },
  placeDrag: null, lastToast: 0, sunbeams: 0, said: '', lastFramedTurn: -1,
  save: null, calibrator: null, lastRollAudio: 0, warming: false,
  assist: true, lastAssist: 0,
  houseRules: { keepsies: true, slips: true, bombing: false, poison: false, ringSizeFt: 10 },
  catalog: null, turntable: null, thumbs: null, filter: 'all', inspecting: null
};

/* The house rules of DESIGN 8.3, as the player meets them: what each one DOES,
   not what it is called. Quickplay defaults are the design's. */
const HOUSE_RULES = [
  { key: 'keepsies', label: 'Keeps', sub: 'winner keeps the marbles' },
  { key: 'slips', label: 'Slips', sub: 'one redo for a fumble' },
  { key: 'bombing', label: 'Bombing', sub: 'drop shots allowed' },
  { key: 'poison', label: 'Poison', sub: 'knock out the enemy shooter' },
  { key: 'ringSizeFt', label: 'Ring', sub: 'seven, ten or thirteen foot', cycle: [7, 10, 13] }
];

/* ------------------------------------------------------------------- boot */

async function boot() {
  const res = await fetch('src/data/tuning.json?v=20260904a');
  if (!res.ok) throw new Error('tuning.json did not load: ' + res.status);
  G.tuning = await res.json();
  G.save = SAVE.load();
  SAVE.watchOtherTabs();
  G.calib = calibrationFrom(G.save, G.tuning);
  G.seenRules = !!G.save.seen.rules;
  AUDIO.configure(G.tuning);
  AUDIO.setEnabled(G.save.settings.sound !== false);

  const cat = await fetch('src/data/marbles.json?v=20260904a');
  if (!cat.ok) throw new Error('marbles.json did not load: ' + cat.status);
  G.catalog = await cat.json();

  G.tier = detectQuality(G.tuning);
  const canvas = $('stage');
  G.stage = createStage(canvas, G.tuning, G.tier);
  G.rig = createOrbitRig(G.stage, { target: { x: 0, y: 0.012, z: 0 }, distance: 2.2, elevationDeg: 33 });
  G.ground = buildRingerGround(G.stage, G.tuning, { discRadius: 30 });

  await initPhysics();
  G.turntable = createTurntable(G.stage, G.tuning);
  useMaterialFactory(MARBLEMESH);
  G.thumbs = createThumbnailer(G.tuning);
  grantStartersOnce();

  G.knuckle = createKnuckle(canvas, G.tuning, {
    taw: () => (G.R && (G.screen === 'match' || G.screen === 'calib') && canAim() ? G.R.tawOnScreen(G.rig) : null),
    aimAzimuth: () => G.rig.state.azimuth + Math.PI,
    calib: () => G.calib,
    bombingAllowed: () => !!G.R && G.screen === 'match' && G.R.canBomb(),
    onBrace: onBrace,
    onAim: onAim,
    onCancel: () => { say('That was too soft to count, so it does not. Take it again.'); hideAim(); },
    haptic: (k) => { if (navigator.vibrate) { try { navigator.vibrate(k === 'settle' ? 8 : 14); } catch (e) { } } },
    enabled: () => !G.usePullback && (G.screen === 'match' || G.screen === 'calib') && !G.paused
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
    // calibration first, ONCE, because a player shooting against a stranger's
    // thumb can neither reach full power nor find the top of their own range
    if (!G.calib.own) startCalibration();
    else if (G.seenRules) { showScreen('setup'); buildHouseRules(); }
    else showScreen('rules');
  });
  $('calibSkip').addEventListener('click', () => { finishCalibration(null); });
  $('rulesGo').addEventListener('click', () => {
    G.seenRules = true;
    SAVE.merge({ seen: { rules: true } });
    showScreen('setup'); buildHouseRules();
  });
  $('setupGo').addEventListener('click', () => { showScreen('match'); startMatch(); });
  $('setupBack').addEventListener('click', () => { showScreen('title'); });
  $('collect').addEventListener('click', () => openCollection());
  $('collBack').addEventListener('click', () => showScreen('title'));
  $('inspectBack').addEventListener('click', () => openCollection());
  // one finger drag spins the marble on the table
  $('stage').addEventListener('pointermove', (e) => {
    if (G.screen !== 'inspect' || !e.buttons) return;
    G.turntable.nudge(e.movementX || 0);
  });
  $('again').addEventListener('click', () => { showScreen('setup'); buildHouseRules(); });
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
  $('calib').hidden = name !== 'calib';
  $('setup').hidden = name !== 'setup';
  $('rulesCard').hidden = name !== 'rules';
  $('hud').hidden = name !== 'match';
  $('collection').hidden = name !== 'collection';
  $('inspect').hidden = name !== 'inspect';
  $('results').hidden = name !== 'results';
  if (name !== 'inspect' && G.turntable) { G.turntable.clear(); G.inspecting = null; }
  if (name !== 'match') { $('pauseCard').hidden = true; G.paused = false; hideAim(); }
}

/* --------------------------------------------------------- calibration */

function startCalibration() {
  G.calibrator = createCalibration({
    tuning: G.tuning,
    save: G.save,
    onSay: (t) => { $('calibSay').textContent = t; },
    onProgress: (n) => calibDots(n),
    onDone: (r) => finishCalibration(r)
  });
  calibDots(0);
  $('calibSay').textContent = 'Thumb on the marble, and flick through it.';
  // no ring during calibration: the chalk ran straight through the middle of the
  // marble and read as a shelf edge it was balanced on
  if (G.ground) G.ground.chalk.visible = false;
  showScreen('calib');
  // a marble on dirt to snap, and nothing else on the screen
  startMatch({ seed: 20260904, forceFirst: 0, calibrating: true });
  showScreen('calib');
}

function calibDots(n) {
  const el = $('calibDots');
  if (el.childElementCount !== 3) {
    el.textContent = '';
    for (let i = 0; i < 3; i++) { const d = document.createElement('span'); d.className = 'sock'; el.appendChild(d); }
  }
  for (let i = 0; i < 3; i++) el.children[i].className = 'sock' + (i < n ? ' full' : '');
}

function finishCalibration(result) {
  G.calibrator = null;
  if (G.ground) G.ground.chalk.visible = true;
  if (result) {
    G.calib = { max: result.max, own: true, handedness: result.handedness };
    SAVE.merge({ profile: { calib: { max: result.max, samples: result.samples }, handedness: result.handedness } });
    G.save = SAVE.load();
  }
  endMatch();
  if (G.seenRules) { showScreen('setup'); buildHouseRules(); }
  else showScreen('rules');
}

/* -------------------------------------------------------- the collection */

/**
 * DESIGN 16.4: Dusty rattles the tin. The clay pool, all six cat's eyes and two
 * uncommons, once, on the first boot. The heirloom choice of three rares is a
 * screen of its own and lands with the pouches; the three candidates stay out of
 * the grant until then rather than being handed over silently.
 */
function grantStartersOnce() {
  if (G.save.inventory.length) return;
  const { give } = starterGrant(G.catalog, makeRng(20260904));
  SAVE.merge({ inventory: give });
  G.save = SAVE.load();
}

function openCollection() {
  showScreen('collection');
  buildFilters();
  buildGrid();
}

const FILTERS = [['all', 'All'], ['stakeable', 'Stakeable']].concat(
  TIER_ORDER.map(t => [t, TIER_LABEL[t]]));

function buildFilters() {
  const row = $('filters');
  row.textContent = '';
  for (const [key, label] of FILTERS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'flt-' + key;
    b.textContent = label;
    b.className = G.filter === key ? 'on' : '';
    b.addEventListener('click', () => { G.filter = key; buildFilters(); buildGrid(); });
    row.appendChild(b);
  }
}

/**
 * One tile per catalog entry with a count, because ten identical clay marbles
 * are ten marbles and one tile. Each tile is a tiny still of the real material,
 * drawn once into its own 2D canvas rather than kept as a live 3D view: a grid
 * of ninety six live marbles is ninety six draw calls for a menu.
 */
function buildGrid() {
  const grid = $('grid');
  grid.textContent = '';
  const groups = groupForGrid(G.save.inventory, G.catalog, G.filter);
  G.thumbs.open(128);
  let idx = 0;
  for (const g of groups) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tile';
    b.id = 'tile-' + g.entry.id;
    const rib = document.createElement('span');
    rib.className = 'rib ' + g.entry.tier;
    b.appendChild(rib);
    const c = document.createElement('canvas');
    c.width = c.height = 96;
    b.appendChild(c);
    if (g.count > 1) {
      const n = document.createElement('span');
      n.className = 'cnt';
      n.textContent = String(g.count);
      b.appendChild(n);
    }
    const nm = document.createElement('span');
    nm.className = 'nm';
    nm.textContent = g.entry.name;
    b.appendChild(nm);
    b.addEventListener('click', () => openInspect(g.entry, g.items[0]));
    grid.appendChild(b);
    G.thumbs.paint(c, g.entry, idx++);
  }
  G.thumbs.close();
  if (!groups.length) {
    const p = document.createElement('p');
    p.style.color = 'var(--muted)';
    p.textContent = 'Nothing here yet.';
    grid.appendChild(p);
  }
}

function openInspect(entry, item) {
  G.inspecting = { entry, item };
  showScreen('inspect');
  const spec = G.turntable.show(entry);
  $('iTier').textContent = TIER_LABEL[entry.tier] || entry.tier;
  $('iName').textContent = entry.name;
  $('iLore').textContent = entry.lore || '';
  const dl = $('iTraits');
  dl.textContent = '';
  const rows = [
    ['Class', entry.class],
    ['Size', entry.diameterMm + ' mm'],
    ['Weight', weightWord(spec)],
    ['Under fire', hardnessWord(spec.hardness)]
  ];
  if (entry.passive) rows.push([entry.passive.name, entry.passive.text]);
  if (entry.active) rows.push([entry.active.name, entry.active.text]);
  for (const [k, v] of rows) {
    const dt = document.createElement('dt'); dt.textContent = k;
    const dd = document.createElement('dd'); dd.textContent = v;
    dl.appendChild(dt); dl.appendChild(dd);
  }
  $('iProv').textContent = provenance(item);
}

/* ------------------------------------------------------------ match setup */

function buildHouseRules() {
  const row = $('hrRow');
  row.textContent = '';
  for (const r of HOUSE_RULES) {
    const b = document.createElement('button');
    b.className = 'chip';
    b.id = 'hr-' + r.key;
    b.type = 'button';
    const label = document.createElement('span');
    const sub = document.createElement('span');
    sub.className = 'sub';
    b.appendChild(label); b.appendChild(sub);
    const paint = () => {
      const v = G.houseRules[r.key];
      if (r.cycle) { label.textContent = v + ' foot'; sub.textContent = 'tap to change'; b.className = 'chip on'; }
      else { label.textContent = r.label; sub.textContent = r.sub; b.className = 'chip' + (v ? ' on' : ''); }
    };
    b.addEventListener('click', () => {
      if (r.cycle) {
        const i = r.cycle.indexOf(G.houseRules[r.key]);
        G.houseRules[r.key] = r.cycle[(i + 1) % r.cycle.length];
      } else G.houseRules[r.key] = !G.houseRules[r.key];
      paint();
    });
    paint();
    row.appendChild(b);
  }
}

/* -------------------------------------------------------------- the match */

function startMatch(opts) {
  endMatch();
  const o = opts || {};
  G.R = createRinger({
    tuning: G.tuning,
    seed: o.seed || (Date.now() & 0x7fffffff),
    skipLag: !!o.calibrating,
    bare: !!o.calibrating,
    forceFirst: o.calibrating ? 0 : o.forceFirst,
    houseRules: Object.assign({}, G.houseRules, o.houseRules),
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
  AUDIO.stopAll();
  G.warming = false;
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
  if (!G.R || (G.screen !== 'match' && G.screen !== 'calib')) return;
  if (st.bracing && G.R.state.phase === 'place') G.R.commitPlace();
  const t = G.R.tawOnScreen(G.rig);
  const ret = $('reticle'), line = $('aimline');
  if (!st.bracing || !t) {
    ret.hidden = true; line.hidden = true; $('power').hidden = true; $('assist').hidden = true;
    if (G.warming) { G.warming = false; AUDIO.stopWarming(); }
    return;
  }
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
  // the warming shimmer, while the taw is being rubbed
  if (st.warmed && !G.warming) { G.warming = true; AUDIO.startWarming(); }
  else if (!st.warmed && G.warming) { G.warming = false; AUDIO.stopWarming(); }
  // DIRECTION ONLY, never a predicted path. That is DESIGN 7.1 and it is not
  // negotiable in ranked play, so it is not built at all. It starts OUTSIDE the
  // reticle so the two do not read as one shape.
  line.hidden = false;
  line.style.left = t.x + 'px';
  line.style.top = (t.y - px - 6) + 'px';
  line.style.width = '54px';
  line.style.transform = 'rotate(-90deg)';
  // the drop shot only exists when the rule is on AND your taw is inside the
  // ring, so the game says so at the moment it becomes possible
  if (G.R.canBomb() && G.said.indexOf('drop shot') < 0 && G.R.state.phase === 'aim') {
    say('Your shooter is inside the ring, so a snap toward yourself is a drop shot.');
  }
  drawAssist(st, t);
}

/**
 * Rookie Assist: the first four tenths of a second of where a medium shot would
 * go, as a short line of dots, redrawn a few times a second because the preview
 * runs the real physics on a snapshot and is not free.
 */
function drawAssist(st, t) {
  const el = $('assist');
  if (!G.assist || !st.bracing || G.R.state.phase !== 'aim') { el.hidden = true; return; }
  const now = performance.now();
  if (now - G.lastAssist < 180 && !el.hidden) return;
  G.lastAssist = now;
  const az = G.rig.state.azimuth + Math.PI;
  const aim = makeAssistAim(az, st);
  const path = G.R.preview(aim, G.tuning.snap.assistSeconds);
  el.textContent = '';
  for (let i = 0; i < path.length; i++) {
    const p = G.rig.project(path[i].x, path[i].y, path[i].z);
    if (!p.visible) continue;
    const d = document.createElement('span');
    d.className = 'dot';
    d.style.left = p.x + 'px';
    d.style.top = p.y + 'px';
    d.style.opacity = String(0.7 - 0.55 * (i / Math.max(1, path.length - 1)));
    el.appendChild(d);
  }
  el.hidden = el.childElementCount === 0;
}

function makeAssistAim(azimuth, st) {
  return {
    origin: { x: 0, y: 0, z: 0 },
    dir: { x: Math.sin(azimuth), y: 0, z: Math.cos(azimuth) },
    power01: 0.55,
    contactOffset: { x: 0, y: 0 },
    pathCurvature: 0, wildness01: 0,
    braced01: clamp(st.settle01, 0, 1), warmed: false,
    coneDegOverride: 0.2
  };
}

function onAim(aim) {
  // during calibration a snap is a measurement, not a shot
  if (G.calibrator && G.screen === 'calib') {
    G.calibrator.take(aim);
    if (G.R && !G.R.state.simulating && G.R.state.phase === 'place') G.R.commitPlace();
    if (G.R && G.R.state.phase === 'aim') { G.R.shoot(aim); }
    hideAim();
    return;
  }
  if (!G.R || G.screen !== 'match' || G.R.state.simulating) return;
  hideAim();
  if (G.R.state.phase === 'place') G.R.commitPlace();
  $('assist').hidden = true;
  const imp = G.R.shoot(aim);
  if (!imp) { showSlip(); return; }
  say(describe(aim, imp));
}

/** One line about what the game just saw, in the voice (DESIGN 16.2). */
function describe(aim, imp) {
  if (aim.bomb) return 'Straight down on top of them.';
  if (aim.wildness01 >= 0.5) return 'That was a wild one.';
  if (aim.contactOffset.y <= -0.35) return 'Low across the ball.';
  if (aim.contactOffset.y >= 0.35) return 'Over the top of it.';
  if (Math.abs(aim.contactOffset.x) >= 0.4) return 'A bit of english on that one.';
  if (imp.speed > 5) return 'Clean through the middle, and hard.';
  return 'Clean through the middle.';
}

function hideAim() {
  $('reticle').hidden = true; $('aimline').hidden = true;
  $('power').hidden = true; $('assist').hidden = true;
}

/** A slip is the game handing your turn back, so it says so plainly and once. */
function showSlip() {
  say('Take it again.');
  $('slipCard').hidden = false;
  setTimeout(() => { $('slipCard').hidden = true; }, 1800);
}
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
  SAVE.merge({
    wallet: { sunbeams: granted },
    stats: { matches: 1, wins: won ? 1 : 0, shots: s.shots, pocketed: s.pocketed[0] },
    profile: { techniques: G.R.state.techniques.slice() }
  });
  G.save = SAVE.load();
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

/**
 * The sound of marbles travelling. Read straight off the world's own contact
 * bookkeeping: a marble is rolling when it is touching something and going
 * somewhere, and the surface it is touching decides what that sounds like.
 * Updated a few times a second, not every step, because a filter frequency does
 * not need to be set at 120 Hz to be heard.
 */
function updateRollingAudio() {
  if (!G.R || !AUDIO.isRunning()) return;
  const W = G.R.world;
  const moving = [];
  for (const [id, m] of W.marbles) {
    if (m.surfaces.size === 0) continue;
    const v = velocityOf(W, id);
    const sp = len2(v.x, v.z);
    if (sp < 0.05) continue;
    let kind = 'dirt';
    for (const h of m.surfaces) { const st = W.statics.get(h); if (st) { kind = st.kind; break; } }
    moving.push({ id, speed: sp, surface: kind, diameterMm: m.spec.diameterMm });
  }
  AUDIO.updateRolling(moving);
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

  if (G.R && (G.screen === 'match' || G.screen === 'calib') && !G.paused) {
    const h = G.tuning.physics.fixedStep;
    const maxSteps = G.tuning.physics.maxSubstepsPerFrame;
    G.acc += dt;
    let n = 0;
    while (G.acc >= h && n < maxSteps && G.R.state.simulating) { G.acc -= h; physStep(); n++; }
    // ⛔ a tab that was in the background returns with a full accumulator and
    // would otherwise simulate the missing minute in one frame. Drop the debt.
    if (G.acc > h * maxSteps) G.acc = 0;
    syncMeshes(G.R.state.simulating ? G.acc / h : 1);

    // calibration: the marble flies off into the dark, then comes back to the
    // same spot for the next snap, the way three shots off a practice tee do.
    // Without this the camera is still chasing the last one when the player
    // reaches for the next and there is no marble under their thumb.
    if (G.screen === 'calib' && !G.R.state.simulating) {
      G.R.resetPlacement();
      G.R.frameShot(G.rig, true);
      G.rig.update(1 / 60);
    }
    if (G.screen === 'match' && !G.R.state.simulating && G.R.state.phase !== 'over'
      && G.R.isAiTurn() && !G.R.state.aiThinking) {
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
    if (G.screen === 'match') updateHud();
    if (now - G.lastRollAudio > 60) { G.lastRollAudio = now; updateRollingAudio(); }
    if (!$('toast').hidden && now - G.lastToast > 2400) $('toast').hidden = true;
  }

  if (G.screen === 'inspect' && G.turntable) {
    G.turntable.update(dt);
    G.turntable.aspect(G.stage.width, G.stage.height);
    drawScene(G.stage, G.turntable.scene, G.turntable.camera);
    G.frames++;
    return;
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
        calib: { max: G.calib.max, own: G.calib.own },
        calibrating: G.calibrator ? G.calibrator.state() : null,
        save: { backend: SAVE.backendName(), matches: G.save.stats.matches, sunbeams: G.save.wallet.sunbeams },
        match: R ? {
          phase: R.state.phase, simulating: R.state.simulating, turn: R.match.turn,
          pocketed: R.match.players.map(p => p.pocketed.length),
          mibsLeft: R.liveMibs().length, shots: R.match.shotNumber,
          winner: R.match.winner, techniques: R.state.techniques.slice(),
          slipsLeft: R.match.players.map(p => p.slipsLeft),
          taw: R.tawOnScreen(G.rig)
        } : null,
        assist: G.assist,
        knuckle: G.knuckle.state(),
        lastAim: G.knuckle.lastAim(),
        audio: AUDIO.isRunning()
      };
    },
    start: (opts) => { G.seenRules = true; showScreen('match'); startMatch(opts); },
    rules: () => showScreen('rules'),
    setup: () => { showScreen('setup'); buildHouseRules(); return G.houseRules; },
    collection: () => { openCollection(); return { tiles: $('grid').querySelectorAll('.tile').length }; },
    inspect: (id) => {
      const e = G.catalog.marbles.find(m => m.id === id);
      if (!e) return null;
      openInspect(e, G.save.inventory.find(i => i.id === id) || null);
      return { name: $('iName').textContent, tier: $('iTier').textContent, traits: $('iTraits').childElementCount / 2 };
    },
    inventory: () => G.save.inventory.length,
    catalogCount: () => G.catalog.marbles.length,
    houseRules: () => Object.assign({}, G.houseRules),
    calibrate: () => startCalibration(),
    wipeSave: () => { G.save = SAVE.wipe(); G.calib = calibrationFrom(G.save, G.tuning); G.seenRules = false; return true; },
    /** Drive the whole Knuckle from a synthesised path. Returns the AimSource. */
    flick(samples) { return G.knuckle._feed(samples, G.R ? G.R.tawOnScreen(G.rig) : null); },
    /** Drive the pull back fallback the same way. */
    drag(from, to, offset) { return G.pullback._feed(from, to, G.R ? G.R.tawOnScreen(G.rig) : null, offset); },
    setPullback(on) { G.usePullback = !!on; },
    setAssist(on) { G.assist = !!on; if (!G.assist) $('assist').hidden = true; return G.assist; },
    assistDots() { const el = $('assist'); return el.hidden ? 0 : el.childElementCount; },
    slipShowing() { return !$('slipCard').hidden; },
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
