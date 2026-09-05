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
import { detectQuality } from './render/quality.js?v=20260905a';
import { createStage, createOrbitRig, resize, draw, drawScene, drawInset, THREE } from './render/scene.js?v=20260905a';
import { spyglassFor, scopePxPerM } from './core/spyglass.js?v=20260905a';
import { buildRingerGround } from './render/arenaEnv.js?v=20260905a';
import { makeMarbleMesh, makeContactShadow, placeContactShadow } from './render/marbleMesh.js?v=20260905a';
import { attachCameraControls } from './input/cameraCtl.js?v=20260905a';
import { createKnuckle } from './input/knuckle.js?v=20260905a';
import { createPullback } from './input/pullback.js?v=20260905a';
import * as AUDIO from './audio/synth.js?v=20260905a';
import { initPhysics, positionOf, specOf, velocityOf, place, removeMarble } from './core/physics.js?v=20260905a';
import { createRinger } from './game/ringer.js?v=20260905a';
import { RINGER_TECHNIQUES } from './core/techniques.js?v=20260905a';
import { launchSpeed } from './core/snap.js?v=20260905a';
import { clamp, len2, DEG } from './core/dmath.js?v=20260905a';
import * as SAVE from './meta/save.js?v=20260905a';
import { createCalibration, calibrationFrom } from './meta/onboarding.js?v=20260905a';
import { playPotCeremony } from './render/ceremony.js?v=20260905a';
import { createTurntable, createThumbnailer, useMaterialFactory, groupForGrid, starterGrant, provenance, hardnessWord, weightWord, TIER_ORDER, TIER_LABEL }
  from './meta/collection.js?v=20260905a';
import * as MARBLEMESH from './render/marbleMesh.js?v=20260905a';
import { bodySpec } from './core/marbleBody.js?v=20260905a';
import { createEconomy } from './meta/economy.js?v=20260905a';
import { createDrops } from './meta/drops.js?v=20260905a';
import * as RANSOM from './meta/ransom.js?v=20260905a';
import * as PROG from './meta/progression.js?v=20260905a';
import { createOnboarding, dustyLine } from './meta/beats.js?v=20260905a';
import { tierMatchOk, matchTheirStake, escrow, settle, recoverOnBoot, potUp, currentPot }
  from './game/match.js?v=20260905a';
import { makeRng } from './core/rng.js?v=20260905a';
import { makeMarbleMaterial } from './render/marbleMesh.js?v=20260905a';

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
  assist: true, lastAssist: 0, lastShooter: 0,
  scopeHold: false, nudgeTimer: 0, snapShown: false, aimUiOn: false,
  houseRules: { keepsies: true, slips: true, bombing: false, poison: false, ringSizeFt: 10 },
  catalog: null, turntable: null, thumbs: null, filter: 'all', inspecting: null, econ: null,
  drops: null, dropRng: null, stake: [], theirStake: [], anteOk: false
};

/* The house rules of DESIGN 8.3, as the player meets them: what each one DOES,
   not what it is called. Quickplay defaults are the design's. */
const HOUSE_RULES = [
  { key: 'keepsies', label: 'Keeps', sub: 'winner keeps the marbles' },
  { key: 'slips', label: 'Slips', sub: 'one redo for a fumble' },
  { key: 'bombing', label: 'Bombing', sub: 'drop shots allowed' },
  { key: 'poison', label: 'Poison', sub: 'knock out the enemy shooter' },
  { key: 'ringSizeFt', label: 'Ring', sub: 'seven, ten or thirteen foot', cycle: [7, 10, 13] },
  /* the lay of the thirteen: see FORMATIONS in game/ringer.js for what each one is */
  { key: 'formation', label: 'Lay', sub: 'cross, x, ring or bunch', cycle: ['cross', 'x', 'ring', 'bunch'],
    show: (v) => 'the ' + v }
];

/* ------------------------------------------------------------------- boot */

async function boot() {
  const res = await fetch('src/data/tuning.json?v=20260905a');
  if (!res.ok) throw new Error('tuning.json did not load: ' + res.status);
  G.tuning = await res.json();
  G.save = SAVE.load();
  SAVE.watchOtherTabs();
  G.calib = calibrationFrom(G.save, G.tuning);
  G.seenRules = !!G.save.seen.rules;
  AUDIO.configure(G.tuning);
  AUDIO.setEnabled(G.save.settings.sound !== false);

  const cat = await fetch('src/data/marbles.json?v=20260905a');
  if (!cat.ok) throw new Error('marbles.json did not load: ' + cat.status);
  G.catalog = await cat.json();
  const dt = await fetch('src/data/droptables.json?v=20260905a');
  if (!dt.ok) throw new Error('droptables.json did not load: ' + dt.status);
  G.dropTables = await dt.json();

  G.tier = detectQuality(G.tuning);
  const canvas = $('stage');
  G.stage = createStage(canvas, G.tuning, G.tier);
  G.rig = createOrbitRig(G.stage, { target: { x: 0, y: 0.012, z: 0 }, distance: 2.2, elevationDeg: 33,
    fov: G.tuning.render.ringerCam.fov });
  G.ground = buildRingerGround(G.stage, G.tuning, { discRadius: 30 });

  await initPhysics();
  G.turntable = createTurntable(G.stage, G.tuning);
  // the zoom aim: one narrow lens, square, on the same scene (core/spyglass.js)
  G.spy = { cam: new THREE.PerspectiveCamera((G.tuning.render.spyglass || {}).fovDeg || 5, 1, 0.02, 80), on: false, rect: null, info: null };
  useMaterialFactory(MARBLEMESH);
  G.thumbs = createThumbnailer(G.tuning);
  G.econ = createEconomy(G.tuning);
  G.drops = createDrops(G.dropTables, G.catalog, G.tuning);
  G.dropRng = makeRng((Date.now() ^ 0x9e3779b9) | 0);
  G.econ.clayPool();          // roll the day over before anything reads it
  G.econ.touchStreak();
  G.econ.onChange(() => { G.save = SAVE.load(); paintWallet(); });
  /* ⛔ FIRST, before anything else can read the inventory: if a pot was up when
     the tab last closed, everything in it comes home and the match never was. */
  const rec = recoverOnBoot();
  if (rec.recovered) G.save = SAVE.load();
  /* and then the windows that ran out while the game was closed, which is where
     most of them will run out: a 24 hour offer opened at midnight is almost never
     lapsed by a tab that is still open */
  const swept = RANSOM.sweepOnBoot(Date.now());
  if (swept.lapsed) G.save = SAVE.load();
  G.onboard = createOnboarding(G.tuning);
  grantStartersOnce();

  G.knuckle = createKnuckle(canvas, G.tuning, {
    taw: () => (G.R && (G.screen === 'match' || G.screen === 'calib') && canAim() ? G.R.tawOnScreen(G.rig) : null),
    aimAzimuth: () => G.rig.state.azimuth + Math.PI,
    // where a screen point lands on the dirt, so a flick's angle is the angle
    // between the two places the thumb was OVER, not an angle on glass
    groundPoint: (x, y) => groundPoint(x, y),
    groundFactor: () => Math.sin(G.rig.state.elevationDeg * DEG),
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
    groundFactor: () => Math.sin(G.rig.state.elevationDeg * DEG),
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
  paintWallet();
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
    if (!G.calib.own) { startCalibration(); return; }
    nextScreenForOnboarding();
  });
  $('calibSkip').addEventListener('click', () => { finishCalibration(null); });
  $('rulesGo').addEventListener('click', () => {
    G.seenRules = true;
    SAVE.merge({ seen: { rules: true } });
    nextScreenForOnboarding();
  });
  $('setupGo').addEventListener('click', () => { beginMatch(); });
  $('tinTake').addEventListener('click', () => { takeTheTin(); });
  $('setupBack').addEventListener('click', () => { showScreen('title'); });
  $('rsPay').addEventListener('click', () => {
    if (!G.ransomOffer) return;
    const r = RANSOM.pay(G.ransomOffer.uid, Date.now());
    if (!r.ok) { $('rsSay').textContent = r.reason; return; }
    G.save = SAVE.load();
    paintWallet();
    // it comes home the way anything else does, with its name said out loud
    $('rsSay').textContent = r.marble.name + ' is yours again.';
    $('rsPay').disabled = true;
    $('rsLater').textContent = 'Good';
    G.ransomOffer = null;
  });
  $('rsLater').addEventListener('click', () => {
    const after = G.ransomAfter;
    G.ransomOffer = null; G.ransomAfter = null;
    if (after) after(); else showScreen('title');
  });
  $('collect').addEventListener('click', () => openCollection());
  $('collBack').addEventListener('click', () => {
    const b = G.onboard && G.onboard.beat();
    if (b && b.id === 'firstKeepsies') { nextScreenForOnboarding(); return; }
    showScreen('title');
  });
  $('inspectBack').addEventListener('click', () => openCollection());
  // one finger drag spins the marble on the table
  $('stage').addEventListener('pointermove', (e) => {
    if (G.screen !== 'inspect' || !e.buttons) return;
    G.turntable.nudge(e.movementX || 0);
  });
  $('again').addEventListener('click', () => {
    G.stake = [];
    // during the first four minutes this button is not a rematch, it is the
    // next beat: after the game with Dusty it opens his tin
    if (G.onboard && G.onboard.active()) { nextScreenForOnboarding(); return; }
    showScreen('setup'); buildHouseRules(); buildAnte();
  });
  $('toTitle').addEventListener('click', () => { endMatch(); showScreen('title'); });
  /* the fine aim, the Zoom and the snap card (Sep 05, Stephen's phone) */
  for (const [id, dir] of [['nudgeL', -1], ['nudgeR', 1]]) {
    const b = $(id);
    const stop = () => { if (G.nudgeTimer) { clearTimeout(G.nudgeTimer); clearInterval(G.nudgeTimer); G.nudgeTimer = 0; } };
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault(); stop();
      if (!nudgeAim(dir)) return;
      const C = G.tuning.render.spyglass || {};
      /* a tap is one step. The repeat waits the way a keyboard does, so a slow frame between
         a thumb's down and up (measured: most of a second on the test rig) is still one step */
      G.nudgeTimer = setTimeout(() => {
        G.nudgeTimer = setInterval(() => { if (!nudgeAim(dir)) stop(); }, C.nudgeRepeatMs == null ? 140 : C.nudgeRepeatMs);
      }, C.nudgeRepeatDelayMs == null ? 350 : C.nudgeRepeatDelayMs);
    });
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(ev, stop);
  }
  $('scopeBtn').addEventListener('click', () => { setScopeHold(!G.scopeHold); });
  $('snapHelp').addEventListener('click', () => { openSnapCard(); });
  $('snapGo').addEventListener('click', () => {
    $('snapCard').hidden = true;
    SAVE.merge({ seen: { snapHelp: true } });
    G.save = SAVE.load();
  });
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
  $('ransom').hidden = name !== 'ransom';
  $('tin').hidden = name !== 'tin';
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
  /* ⛔ SKIPPING STILL FINISHES THE BEAT. Firing it only on a real result put a
     player who tapped Skip straight back into calibration, forever, because
     `nextScreenForOnboarding` asks the beat where to go and the beat had not
     moved. The beat is "the game has asked for your snap", not "the game got
     one": the default power curve is the cost of skipping, not a locked door. */
  G.onboard.fire('calibrated');
  nextScreenForOnboarding();
}

/**
 * Where the player goes next, asked of the onboarding rather than of a flag.
 *
 * ⛔ ONE PLACE DECIDES. Before this there were three: the play button, the end of
 * calibration and the rules card each had their own `if (G.seenRules)`, which is
 * how an onboarding grows a hole. Every one of them asks here now.
 */
/**
 * Fire an onboarding event and, if it moved a beat, say the new one out loud.
 *
 * ⛔ IT IS SAFE TO CALL FROM ANYWHERE. The beat decides whether it cares; a hook
 * that fires on every shot must not need to know which beat it is.
 */
function fireBeat(event) {
  if (!G.onboard || !G.onboard.active()) return false;
  const moved = G.onboard.fire(event);
  if (!moved.advanced) return false;
  const b = G.onboard.beat();
  if (b && (b.id === 'sticking' || b.id === 'break')) say(b.lines[0]);
  return true;
}

/** Dusty talks, one line a turn, spare and funny (DESIGN 16.3). */
function onboardingChat() {
  if (!G.onboard || !G.onboard.active()) return;
  const b = G.onboard.beat();
  if (!b || b.id !== 'dusty') return;
  if (!G.R || G.R.match.turn !== 1) return;
  say(dustyLine(G.chatTurn = (G.chatTurn || 0) + 1));
}

function nextScreenForOnboarding() {
  const b = G.onboard && G.onboard.beat();
  if (!b) {
    if (G.seenRules) { showScreen('setup'); buildHouseRules(); buildAnte(); }
    else showScreen('rules');
    return;
  }
  if (b.id === 'calibrate') { startCalibration(); return; }
  if (b.id === 'tin') { openTin(); return; }
  // the break, the sticking beat and Dusty are all played on a real board, so
  // they go through the rules card once and then into a match
  if (!G.seenRules) { showScreen('rules'); return; }
  showScreen('setup'); buildHouseRules(); buildAnte();
}

/* ------------------------------------------------------------ the wallet */

/** What the player has, on the title and above the collection. */
function paintWallet() {
  const w = $('wallet');
  if (!w || !G.econ) return;
  const s = G.econ.snapshot();
  w.textContent = s.sunbeams + ' sunbeams, ' + s.clay.count + ' of ' + s.clay.max + ' clay';
}

/* -------------------------------------------------------- the collection */

/**
 * DESIGN 16.4: Dusty rattles the tin. The clay pool, all six cat's eyes and two
 * uncommons, once, on the first boot. The heirloom choice of three rares is a
 * screen of its own and lands with the pouches; the three candidates stay out of
 * the grant until then rather than being handed over silently.
 */
/**
 * ⛔ NOTHING IS GRANTED AT BOOT ANY MORE. The starters arrive in beat 4, out of
 * Dusty's tin, with the heirloom chosen rather than assigned. This is only the
 * safety net for a save that finished onboarding in an older build and would
 * otherwise open an empty collection.
 */
function grantStartersOnce() {
  if (G.save.inventory.length) return;
  if (!G.save.seen.onboarded) return;           // beat 4 has not happened yet
  const { give } = starterGrant(G.catalog, makeRng(20260904));
  SAVE.merge({ inventory: give });
  G.save = SAVE.load();
}

/**
 * Beat 4 of DESIGN 16: the tin, and the heirloom laid on a cloth.
 *
 * ⛔ THE STARTERS ARE GRANTED HERE, NOT AT BOOT. They used to arrive silently the
 * first time the page loaded, so a player met their whole collection before the
 * game had said a word about it, and the heirloom choice the design asks for did
 * not exist at all: `starterGrant` returned three candidates and nobody ever read
 * them. The two not picked go back into the pouch pool, which is what they are for.
 */
function openTin() {
  G.heirloomPick = null;
  const wrap = $('heirlooms');
  wrap.textContent = '';
  const three = G.onboard.heirlooms(G.catalog);
  G.thumbs.open(168);
  let i = 0;
  for (const e of three) {
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'heir-' + e.id;
    const c = document.createElement('canvas');
    c.width = c.height = 168;
    b.appendChild(c);
    const nm = document.createElement('span');
    nm.textContent = e.name;
    b.appendChild(nm);
    const kit = document.createElement('span');
    kit.className = 'kit';
    kit.textContent = (e.passive || {}).name || '';
    b.appendChild(kit);
    b.addEventListener('click', () => pickHeirloom(e));
    wrap.appendChild(b);
    G.thumbs.paint(c, e, i++);
  }
  G.thumbs.close();
  // before the first tap there is nothing to read but a name and a two word kit,
  // so the cloth says what it is asking
  $('heirSay').textContent = 'Pick one up. It is yours for good.';
  $('tinTake').disabled = true;
  $('tinTake').textContent = 'Pick one first';
  showScreen('tin');
}

function pickHeirloom(entry) {
  G.heirloomPick = entry;
  for (const b of $('heirlooms').querySelectorAll('button')) {
    b.className = b.id === 'heir-' + entry.id ? 'on' : '';
  }
  // the lore, because the choice should be made on the marble rather than on the stat
  $('heirSay').textContent = entry.lore || '';
  $('tinTake').disabled = false;
  $('tinTake').textContent = 'Take ' + entry.name;
}

function takeTheTin() {
  if (!G.heirloomPick) return;
  const { give } = starterGrant(G.catalog, makeRng(20260904));
  const pick = G.heirloomPick;
  give.push({
    id: pick.id, uid: pick.id + '-heirloom', acquired: Date.now(),
    source: 'starter', cosmeticSeed: 0.5
  });
  SAVE.merge({ inventory: give });
  G.save = SAVE.load();
  G.onboard.fire('tookTheTin');
  openCollection();
}

function openCollection() {
  showScreen('collection');
  buildFilters();
  buildGrid();
  buildOffers();
  buildPouches();
  $('pouchSay').textContent = '';
  /* ⛔ THE TIN HAS TO LEAD SOMEWHERE. Beat 4 ends on this screen with a shelf full
     of marbles and, before this, no way forward except BACK to a title screen: the
     one moment the game has just given the player everything, and it left them to
     guess. During the onboarding the way out IS the next beat. */
  const b = G.onboard && G.onboard.beat();
  $('collBack').textContent = (b && b.id === 'firstKeepsies')
    ? 'Play him for real ones' : 'Back';
}

/**
 * Any open buy back offer, for as long as it is open.
 *
 * ⛔ THE ONLY PLACE A LAPSED WINDOW IS ANNOUNCED. "Let it go for now" on the card
 * after a match is not a decline, so if this row did not exist the offer would
 * quietly time out and the player would never learn there had been one.
 */
function buildOffers() {
  const wrap = $('offers');
  wrap.textContent = '';
  const open = RANSOM.openOffers(Date.now());
  const entryOf = (id) => G.catalog.marbles.find(m => m.id === id);
  for (const o2 of open) {
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'offer-' + o2.uid;
    // every other place in the game that talks about a marble shows it, and this
    // is the one with a deadline on it
    const e = entryOf(o2.id);
    if (e) {
      try {
        const c = document.createElement('canvas');
        c.width = c.height = 88;
        G.thumbs.open(88);
        G.thumbs.paint(c, e, 0);
        G.thumbs.close();
        b.appendChild(c);
      } catch (err) { }
    }
    const words = document.createElement('span');
    words.className = 'words';
    const line = document.createElement('span');
    line.className = 'lead';
    line.textContent = 'Buy back ' + o2.name + ', ' + o2.price + ' sunbeams';
    const small = document.createElement('span');
    small.className = 'small';
    small.textContent = o2.from + ' has it. ' + RANSOM.timeLeftWords(o2.msLeft) + '.';
    words.appendChild(line);
    words.appendChild(small);
    b.appendChild(words);
    b.addEventListener('click', () => showRansomCard(o2, () => openCollection()));
    wrap.appendChild(b);
  }
}

/**
 * The pouches. Price and odds IN WORDS, per the plan's screen table, and the
 * pity counter shown as "next rare in N": a promise a player can watch is worth
 * more than one they have to take on faith.
 */
function buildPouches() {
  const row = $('pouches');
  row.textContent = '';
  const bal = G.econ.balance();
  const lv = PROG.snapshot(G.tuning);
  $('collWallet').textContent = bal + ' sunbeams, level ' + lv.level;
  /* ⛔ THE GATE IS A QUESTION, NOT A NUMBER. DESIGN 20 opens pouches at level 2,
     and the level lives in tuning.json only: the moment a screen writes
     `level >= 2` the unlock table has two homes and one of them will drift. */
  if (!PROG.unlocked('pouches', G.tuning)) {
    const p = document.createElement('p');
    p.className = 'why';
    p.textContent = 'Pouches open at level ' + PROG.unlockLevel('pouches', G.tuning)
      + '. Play a match, win or lose, and you are most of the way there.';
    row.appendChild(p);
    return;
  }
  for (const kind of Object.keys(G.dropTables).filter(k => k[0] !== '_')) {
    const t = G.dropTables[kind];
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'pouch-' + kind;
    b.disabled = bal < t.price;
    const name = document.createElement('span');
    name.textContent = t.name + ', ' + t.price;
    const sub = document.createElement('span');
    sub.className = 'sub';
    const guard = G.drops.nextGuarantee(kind);
    const promises = [];
    if (guard.rare != null) promises.push('a rare within ' + guard.rare);
    if (guard.epic != null) promises.push('an epic within ' + guard.epic);
    sub.textContent = promises.length ? promises.join(', ') : t.odds;
    b.appendChild(name); b.appendChild(sub);
    b.addEventListener('click', () => openPouch(kind));
    row.appendChild(b);
  }
}

function openPouch(kind) {
  const res = G.drops.open(kind, G.dropRng, G.econ);
  G.save = SAVE.load();
  if (!res.ok) { $('pouchSay').textContent = 'Not enough sunbeams for that one.'; return; }
  // an uncommon has no lore line in the design, and "Blue Onion. " is a
  // sentence that stops; say where it came from instead
  let line = res.entry.name + (res.entry.lore ? '. ' + res.entry.lore : ', out of the pouch.');
  if (res.dust) line = res.entry.name + ' again, so it went to dust for ' + res.dust + '.';
  else if (res.rerolled) line = res.entry.name + '. You already hold every grail, so it came up an epic.';
  else if (res.pitied) line = res.entry.name + ', which the pouch owed you.';
  $('pouchSay').textContent = line;
  paintWallet();
  buildGrid();
  buildPouches();
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
  // only a card that overflows its box may take the pointer; otherwise a drag on the text spins the marble
  const card = $('inspectCard');
  card.scrollTop = 0;
  card.style.pointerEvents = card.scrollHeight > card.clientHeight + 1 ? 'auto' : '';
}

/* ------------------------------------------------------------ match setup */

/**
 * The ante (DESIGN 12.1). Tap up to three of your own, the opponent matches you
 * tier for tier, and the tier matched rule refuses with a reason rather than
 * with a disabled button nobody can explain.
 */
function buildAnte() {
  const wrap = $('ante');
  /* beat 5 is "ante 1 clay each": the game puts it up so the player can see what
     a stake looks like before they are asked to choose one */
  const beat5 = G.onboard && G.onboard.beat() && G.onboard.beat().id === 'firstKeepsies';
  if (beat5 && !G.stake.length && G.houseRules.keepsies) {
    const clay = G.save.inventory.find(i => i.id === 'dirt_plain');
    if (clay) {
      const e = G.catalog.marbles.find(m => m.id === 'dirt_plain');
      G.stake.push({ uid: clay.uid, id: 'dirt_plain', tier: e.tier, name: e.name });
    }
  }
  wrap.hidden = !G.houseRules.keepsies;
  if (wrap.hidden) { G.stake = []; G.theirStake = []; G.anteOk = true; return; }
  const strip = $('stakeStrip');
  strip.textContent = '';
  const groups = groupForGrid(G.save.inventory, G.catalog, 'stakeable');
  G.thumbs.open(96);
  let i = 0;
  for (const g of groups) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'stake' + (G.stake.some(s2 => s2.id === g.entry.id) ? ' on' : '');
    b.id = 'stake-' + g.entry.id;
    b.title = g.entry.name;
    const rib = document.createElement('span'); rib.className = 'rib ' + g.entry.tier; b.appendChild(rib);
    const c = document.createElement('canvas'); c.width = c.height = 96; b.appendChild(c);
    if (g.count > 1) { const n2 = document.createElement('span'); n2.className = 'cnt'; n2.textContent = String(g.count); b.appendChild(n2); }
    b.addEventListener('click', () => toggleStake(g));
    strip.appendChild(b);
    G.thumbs.paint(c, g.entry, i++);
  }
  G.thumbs.close();
  refreshAnte();
  /* ⛔ THE STRIP SCROLLS, AND A STAKE YOU CANNOT SEE IS A STAKE YOU DID NOT MAKE.
     The setup screenshot showed six marbles, none of them marked, over a sentence
     saying two were up: the staked one was simply off the right hand edge. */
  const first = G.stake.length ? $('stake-' + G.stake[0].id) : null;
  if (first && first.scrollIntoView) {
    try { first.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) { }
  }
}

function toggleStake(group) {
  const at = G.stake.findIndex(s2 => s2.uid === group.items[0].uid || s2.id === group.entry.id);
  if (at >= 0) G.stake.splice(at, 1);
  else {
    if (G.stake.length >= 3) { $('anteSay').textContent = 'Three marbles each is the most anyone stakes.'; return; }
    const free = group.items.find(it => !G.stake.some(s2 => s2.uid === it.uid));
    if (!free) return;
    G.stake.push({ uid: free.uid, id: group.entry.id, tier: group.entry.tier, name: group.entry.name });
  }
  buildAnte();
}

function refreshAnte() {
  const say2 = $('anteSay');
  if (!G.stake.length) {
    G.theirStake = []; G.anteOk = false;
    $('theirsLabel').hidden = true;
    $('theirStrip').textContent = '';
    say2.textContent = 'Put something up. Clay is free and it still counts.';
    $('setupGo').disabled = true;
    return;
  }
  G.theirStake = matchTheirStake(G.stake, G.catalog, G.dropRng, ['common', 'uncommon', 'rare']);
  const verdict = tierMatchOk(G.stake, G.theirStake);
  G.anteOk = verdict.ok;
  // "Winner keeps all 2." read like a bug on the setup screenshot. Say what is
  // actually at risk, in words, and name the player's own marble.
  const mine2 = G.stake.map(m2 => m2.name || m2.id).join(' and ');
  // ⛔ name THEIRS too. The setup screenshot showed two near black clay marbles
  // side by side, indistinguishable at 56 px, over a sentence whose second half
  // was the word "theirs": the one screen meant to make a stake feel real told
  // you nothing about what you were playing for.
  const yours2 = G.theirStake.map(t2 => t2.name || t2.id).join(' and ');
  say2.textContent = verdict.ok
    ? (G.stake.length === 1
      ? 'Your ' + mine2 + ' against their ' + yours2 + '. Winner takes both.'
      : G.stake.length + ' of yours against ' + G.theirStake.length + ' of theirs. Winner takes all '
        + (G.stake.length + G.theirStake.length) + '.')
    : verdict.reason;
  $('setupGo').disabled = !verdict.ok;
  $('theirsLabel').hidden = !verdict.ok;
  const strip = $('theirStrip');
  strip.textContent = '';
  if (!verdict.ok) return;
  G.thumbs.open(96);
  let i = 0;
  for (const t of G.theirStake) {
    const e = G.catalog.marbles.find(m => m.id === t.id);
    const b = document.createElement('span');
    b.className = 'stake on';
    b.title = t.name;
    const rib = document.createElement('span'); rib.className = 'rib ' + t.tier; b.appendChild(rib);
    const c = document.createElement('canvas'); c.width = c.height = 96; b.appendChild(c);
    strip.appendChild(b);
    if (e) G.thumbs.paint(c, e, i++);
  }
  G.thumbs.close();
}

function buildHouseRules() {
  const row = $('hrRow');
  row.textContent = '';
  /* ⛔ THE FIRST TWO GAMES ARE SET UP BY THE GAME, NOT BY THE PLAYER. DESIGN 16
     is exact: beat 3 is a seven foot game, slips on, FOR FAIR, and beat 5 is the
     same table with one clay each on it. A player handed five chips before they
     have played once is being asked a question they cannot answer yet. */
  const beat = G.onboard && G.onboard.beat();
  if (beat && (beat.id === 'dusty' || beat.id === 'break' || beat.id === 'sticking')) {
    G.houseRules.keepsies = false;
    G.houseRules.slips = true;
    G.houseRules.ringSizeFt = 7;
    G.houseRules.formation = 'cross';     // the beat that teaches you to break the cross
  } else if (beat && beat.id === 'firstKeepsies') {
    G.houseRules.keepsies = true;
    G.houseRules.slips = true;
    G.houseRules.ringSizeFt = 7;
    G.houseRules.formation = 'cross';
  }
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
      if (r.cycle) { label.textContent = r.show ? r.show(v) : v + ' foot'; sub.textContent = 'tap to change'; b.className = 'chip on'; }
      else { label.textContent = r.label; sub.textContent = r.sub; b.className = 'chip' + (v ? ' on' : ''); }
    };
    b.addEventListener('click', () => {
      if (r.cycle) {
        const i = r.cycle.indexOf(G.houseRules[r.key]);
        G.houseRules[r.key] = r.cycle[(i + 1) % r.cycle.length];
      } else G.houseRules[r.key] = !G.houseRules[r.key];
      paint();
      if (r.key === 'keepsies') buildAnte();
    });
    paint();
    row.appendChild(b);
  }
}

/* -------------------------------------------------------------- the match */

/**
 * Leave the setup screen for the ring. The pot goes up HERE, before a single
 * shot, and the marbles leave the inventory in the same write.
 *
 * ⛔ The button and the dev API both come through this one door, so a shot taken
 * headless walks the same escrow a player walks. The screenshot run found this:
 * it staked a marble, called start() straight past this function, and the result
 * card said "nothing was up" over a pot that really was selected.
 * @returns {boolean} false when the stake was refused and nothing moved
 */
function beginMatch(opts) {
  /* ⛔ THE PLAYER BREAKS THE CROSS IN BEAT 2. DESIGN 16.2 is "brace, snap the
     cross", and when Dusty won the lag he broke it instead while the message
     still said hold your shooter and flick: the first thing the game teaches was
     being done to the player rather than by them. The lag is real from beat 5. */
  const b0 = G.onboard && G.onboard.beat();
  if (b0 && b0.id === 'break') opts = Object.assign({}, opts || {}, { forceFirst: 0 });
  if (G.houseRules.keepsies && G.stake.length) {
    G.lastStakeNames = G.stake.map(m => m.name || m.id).join(' and ');
    if (!escrow(G.stake, G.theirStake, 'Dusty Coyle')) {
      $('anteSay').textContent = 'That stake could not be put up. Nothing has moved.';
      return false;
    }
    G.save = SAVE.load();
  }
  showScreen('match');
  startMatch(opts);
  return true;
}

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
    /* ⛔ CALIBRATION HAS ONE PLAYER. With Dusty in the world the first counted
       snap resolved, the turn passed to him, and the AI never plays on the calib
       screen, so the second and third snaps were refused at pointerdown: the
       camera cut to his marble on the far side and nothing answered the thumb.
       The gates never saw it because their feed skips the "is it your turn" check
       a real thumb goes through. A world of one shoots every time. */
    players: o.calibrating ? [{ name: 'You', ai: null, tawEntry: 'taw_clearie' }] : [
      { name: 'You', ai: null, tawEntry: 'taw_clearie' },
      // ⛔ ONE NAME. The setup screen said Dusty Coyle and the result card said
      // Dusty, which is two people on two adjacent screens. DESIGN 10.7 and the
      // league table both write him as Dusty Coyle.
      { name: 'Dusty Coyle', ai: o.opponent || 'rookie', tawEntry: 'taw_bumblebee' }
    ],
    hooks: {
      onPocket: () => AUDIO.impact({ material: 'glass', diameterMm: 16, relSpeed: 1.4, seed: 0.5 }),
      onTechnique: (id) => {
        showToast(id);
        // beat 2.5 asks for one guided backspin shot, and this is the moment it
        // lands: the technique detector already knows a stick when it sees one.
        // ⛔ THE PLAYER'S stick, not Dusty's: the beats listen to one thumb.
        if (id === 'sticking' && G.lastShooter === 0) fireBeat('stuck');
      },
      // ⛔ "brokeTheCross" is the PLAYER breaking it. Fired on every resolve, it
      // fired on Dusty's opening shot and the sticking lesson was on screen
      // before the player had snapped once.
      onResolve: () => { if (G.lastShooter === 0) fireBeat('brokeTheCross'); onboardingChat(); },
      onOver: (s) => finishMatch(s)
    }
  });
  buildMeshes();
  G.R.doLag();
  say(G.R.match.turn === 0 ? 'You won the lag. Hold your shooter, then flick.'
    : (G.R.match.players[1].name + ' won the lag and shoots first.'));
  G.R.frameShot(G.rig, true);
  G.rig.update(1 / 60);
  G.lastFramedTurn = G.R.match.turn;
  if (G.rig.resetUser) G.rig.resetUser();
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

/** The point on the ground plane under a CSS pixel, or null above the horizon. */
function groundPoint(x, y) {
  const vp = G.rig.viewport;
  if (!vp || !vp.w || !vp.h) return null;
  const r = G.rig.getRay({ x: (x / vp.w) * 2 - 1, y: -((y / vp.h) * 2 - 1) });
  if (Math.abs(r.dir.y) < 1e-6) return null;
  const t = -r.origin.y / r.dir.y;
  if (t <= 0) return null;
  return { x: r.origin.x + r.dir.x * t, z: r.origin.z + r.dir.z * t };
}

/* --------------------------------------------------------------- the shot */

/** The zoom aim (core/spyglass.js). While braced, if the mib the shot is pointed at is under
    openBelowPx across on the main screen, a square scope opens at the top: the same dirt through
    a narrow lens from the main camera's own position, down the aim line, with the cone's width
    at that range as a bracket. The main camera and the cone are not touched. */
function updateSpyglass(st, t, force) {
  const C = G.tuning.render.spyglass;
  if (!C || !G.spy || G.screen !== 'match' || G.usePullback) return hideSpyglass();
  const taw = G.R.shooterTaw();
  const tp = positionOf(G.R.world, taw.id);
  const live = G.R.liveMibs().map(m => { const p = positionOf(G.R.world, m.id); return { x: p.x, z: p.z, id: m.id }; });
  const s = spyglassFor({ tawX: tp.x, tawZ: tp.z, azimuth: G.rig.state.azimuth + Math.PI, live, coneDeg: st.coneDeg }, C);
  if (!s) return hideSpyglass();
  // how big that mib is on the MAIN screen decides whether the scope is worth opening
  const r = specOf(G.R.world, s.mib.id).radius;
  const c = G.rig.project(s.mib.x, r, s.mib.z), e = G.rig.project(s.mib.x, r * 2, s.mib.z);
  const mainPx = Math.abs(e.y - c.y) * 2;
  // held open by the Zoom button it stays open whatever size the marble is on the main screen
  if (!(force || G.scopeHold) && !(mainPx < (C.openBelowPx == null ? 14 : C.openBelowPx))) return hideSpyglass();
  const size = C.sizePx || 180, top = C.top == null ? 96 : C.top;
  const el = $('spyglass');
  el.hidden = false;
  el.style.top = top + 'px'; el.style.width = el.style.height = size + 'px';
  G.spy.rect = { left: Math.round((G.stage.width - size) / 2), top, size };
  const cam = G.spy.cam;
  cam.position.copy(G.rig.camera.position);
  cam.lookAt(s.tx, r, s.tz);
  const camDist = Math.hypot(cam.position.x - s.tx, cam.position.y - r, cam.position.z - s.tz);
  const ppm = scopePxPerM(camDist, C);
  const bracket = Math.max(6, Math.min(size - 10, 2 * s.coneHalfM * ppm));
  const cone = $('spyCone');
  cone.style.width = bracket + 'px';
  cone.style.borderColor = st.settle01 > 0.98 ? 'rgba(200,168,75,.95)' : 'rgba(232,220,200,.6)';
  G.spy.on = true;
  G.spy.info = { range: +s.range.toFixed(3), lateral: +s.lateral.toFixed(3), coneDeg: +st.coneDeg.toFixed(2),
    coneHalfM: +s.coneHalfM.toFixed(3), camDist: +camDist.toFixed(2), mainPx: +mainPx.toFixed(1),
    mibPx: +(r * 2 * ppm).toFixed(1), bracketPx: +bracket.toFixed(1) };
}
function hideSpyglass() {
  if (G.spy) { G.spy.on = false; G.spy.info = null; }
  const el = $('spyglass');
  if (el) el.hidden = true;
}

function onBrace(st) {
  if (!G.R || (G.screen !== 'match' && G.screen !== 'calib')) return;
  if (st.bracing && G.R.state.phase === 'place') G.R.commitPlace();
  const t = G.R.tawOnScreen(G.rig);
  const ret = $('reticle'), line = $('aimline');
  if (!st.bracing || !t) {
    ret.hidden = true; line.hidden = true; $('power').hidden = true; $('assist').hidden = true;
    $('say').hidden = false;
    hideSpyglass();
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
  // a brace is the player saying they have read it: the guidance line and any toast go the
  // moment a thumb goes down, and come back when it lifts
  $('toast').hidden = true; $('say').hidden = true;
  ret.style.left = (t.x - px) + 'px';
  ret.style.top = (t.y - px) + 'px';
  ret.style.width = ret.style.height = (px * 2) + 'px';
  ret.style.borderColor = st.settle01 > 0.98 ? 'rgba(200,168,75,.95)' : 'rgba(232,220,200,.55)';
  ret.style.borderWidth = st.settle01 > 0.98 ? '2px' : '1px';
  // the warming shimmer, while the taw is being rubbed
  if (st.warmed && !G.warming) { G.warming = true; AUDIO.startWarming(); }
  else if (!st.warmed && G.warming) { G.warming = false; AUDIO.stopWarming(); }
  updateSpyglass(st, t);
  // DIRECTION ONLY, never a predicted path. That is DESIGN 7.1 and it is not
  // negotiable in ranked play, so it is not built at all. It starts OUTSIDE the
  // reticle so the two do not read as one shape.
  drawAimLine(t, px);
  // the drop shot only exists when the rule is on AND your taw is inside the
  // ring, so the game says so at the moment it becomes possible
  if (G.R.canBomb() && G.said.indexOf('drop shot') < 0 && G.R.state.phase === 'aim') {
    say('Your shooter is inside the ring, so a snap toward yourself is a drop shot.');
  }
  drawAssist(st, t);
}

/**
 * The aim line, on the dirt: from just outside the reticle along the aim azimuth
 * (camera forward through the shooter, DESIGN 7.7) to the range of the marble the
 * scope is looking at, or 1.2 m when nothing is ahead. Projected, so it
 * foreshortens with the camera the way the shot will. Direction only.
 * (Sep 05, Stephen: "deviating makes the ball go off line": this is the line.)
 */
function drawAimLine(t, px) {
  const line = $('aimline');
  if (!G.R || !t) { line.hidden = true; return; }
  const taw = G.R.shooterTaw();
  if (!G.R.world.marbles.has(taw.id)) { line.hidden = true; return; }
  const tp = positionOf(G.R.world, taw.id), r = specOf(G.R.world, taw.id).radius;
  const az = G.rig.state.azimuth + Math.PI;
  let d = 1.2;
  if (G.spy && G.spy.on && G.spy.info && G.spy.info.range > 0.3) d = G.spy.info.range;
  const e = G.rig.project(tp.x + Math.sin(az) * d, r, tp.z + Math.cos(az) * d);
  const dx = e.x - t.x, dy = e.y - t.y, L = Math.hypot(dx, dy);
  if (!e.visible || L < px + 14) { line.hidden = true; return; }
  const ang = Math.atan2(dy, dx), start = px + 6;
  line.hidden = false;
  line.style.left = (t.x + Math.cos(ang) * start) + 'px';
  line.style.top = (t.y + Math.sin(ang) * start) + 'px';
  line.style.width = Math.max(0, Math.min(L - start, 420)) + 'px';
  line.style.transform = 'rotate(' + (ang * 180 / Math.PI).toFixed(2) + 'deg)';
  G.aimLineInfo = { x: t.x, y: t.y, angleDeg: ang * 180 / Math.PI, length: L - start, endX: e.x, endY: e.y };
}

/**
 * The fine aim. Turns the player's orbit offset, which is the aim (DESIGN 7.7), by a
 * step: coarse with the scope closed, fine with it open. The frame loop rebuilds the
 * camera from userAz, so writing it is what survives; wantAzimuth is nudged too so the
 * damping starts from the new value at once.
 * Sign: aim RIGHT on screen is a smaller azimuth (proved by test/aimnudge.mjs, which
 * watches the aim line's end move right).
 */
function nudgeAim(dir) {
  if (!G.R || !canAim() || G.usePullback || G.screen !== 'match' || G.paused) return false;
  const C = G.tuning.render.spyglass || {};
  const fine = !!(G.scopeHold || (G.spy && G.spy.on));
  const deg = fine ? (C.nudgeFineDeg == null ? 0.5 : C.nudgeFineDeg) : (C.nudgeCoarseDeg == null ? 2 : C.nudgeCoarseDeg);
  const step = deg * Math.PI / 180 * NUDGE_SIGN * dir;
  G.rig.state.userAz = (G.rig.state.userAz || 0) + step;
  G.rig.state.wantAzimuth += step;
  return true;
}
const NUDGE_SIGN = -1;

function setScopeHold(on) {
  G.scopeHold = !!on;
  $('scopeBtn').classList.toggle('on', G.scopeHold);
  $('scopeBtn').textContent = G.scopeHold ? 'Zoom on' : 'Zoom';
  if (!G.scopeHold && !(G.knuckle && G.knuckle.state().bracing)) { hideSpyglass(); $('aimline').hidden = true; }
}

/** The scope and the line while the thumb is NOT down: the wide cone, the reticle away. */
function holdScope() {
  const t = G.R.tawOnScreen(G.rig);
  if (!t) { hideSpyglass(); $('aimline').hidden = true; return; }
  const T = G.tuning.snap;
  updateSpyglass({ coneDeg: T.coneWideDeg, settle01: 0 }, t, true);
  drawAimLine(t, (t.grabR || t.r * 1.6) * 0.7);
}

function openSnapCard() { $('snapCard').hidden = false; }

/** The aim buttons and the Zoom belong to the human's aim phase and nothing else. */
function updateAimUi() {
  const on = G.screen === 'match' && !!G.R && canAim() && !G.usePullback && !G.paused && G.R.match.players.length > 1;
  if (on !== G.aimUiOn) {
    G.aimUiOn = on;
    $('aimNudge').hidden = !on;
    $('scopeBtn').hidden = !on;
    if (!on && G.nudgeTimer) { clearInterval(G.nudgeTimer); G.nudgeTimer = 0; }
  }
  // the first time a real aim is asked for, the card explains the snap once
  if (on && !G.snapShown && !TEST && !(G.save && G.save.seen && G.save.seen.snapHelp)) {
    G.snapShown = true;
    openSnapCard();
  }
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
  G.lastShooter = 0;
  const imp = G.R.shoot(aim);
  if (!imp) { showSlip(); return; }
  say(describe(aim, imp));
}

/** One line about what the game just saw, in the voice (DESIGN 16.2). */
function describe(aim, imp) {
  if (aim.bomb) return 'Straight down on top of them.';
  if (aim.wildness01 >= 0.5) return 'That was a wild one.';
  // the snap pointed off the aim line and took the shot with it (DESIGN 7.7's fine angle)
  if (Math.abs(aim.fineDeg || 0) >= 5) return 'Your snap turned the shot ' + Math.round(Math.abs(aim.fineDeg))
    + ' degrees ' + (aim.fineDeg * NUDGE_SIGN > 0 ? 'right' : 'left') + ' of the line.';
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
  if (M.players.length < 2) return;        // calibration is a world of one, and it has no HUD
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
    hr.bombing ? 'bombing' : null, hr.poison ? 'poison' : null, hr.ringSizeFt + ' foot',
    hr.formation && hr.formation !== 'cross' ? 'the ' + hr.formation : null
  ].filter(Boolean).join(', ');
}

/**
 * The offer card, then the result card. DESIGN 18 puts the buy back offer
 * immediately after the loss ceremony, and DESIGN 12 says one offer and no
 * negotiation UI, so it is a card with two buttons and a countdown.
 *
 * ⛔ IT NEVER STANDS BETWEEN THE PLAYER AND THE RESULT. "Let it go for now" is
 * not a decline: the offer stays open for its 24 hours and the collection can
 * reach it again. The only thing this card decides is whether you pay NOW.
 */
/** The unlock keys in the words a player would use. DESIGN 20's table, said out loud. */
const UNLOCK_WORDS = {
  ringer: 'Ringer', aiKeepsies: 'keepsies against the ladder', pouches: 'the pouches',
  arena: 'the Arena', bagEditing: 'bag editing', houseRules: 'the house rules editor',
  practiceRing: 'the Practice Ring', humanKeepsies: 'keepsies against people',
  passAndPlay: 'pass and play', foundry: 'the Foundry', glacier: 'the Glacier',
  leagueII: 'League II', leagueIII: 'League III', leagueIV: 'League IV', leagueV: 'League V'
};

function showRansomOrResults() {
  const open = RANSOM.openOffers(Date.now());
  const mine = open.filter(r => (G.offers || []).some(o2 => o2.uid === r.uid));
  if (!mine.length) { showScreen('results'); return; }
  showRansomCard(mine[0], () => showScreen('results'));
}

/** Paint one offer. `after` runs when the card is finished with, either way. */
function showRansomCard(offer, after) {
  G.ransomOffer = offer;
  G.ransomAfter = after;
  const entry = G.catalog.marbles.find(m => m.id === offer.id);
  const art = $('ransomArt');
  art.textContent = '';
  if (entry) {
    try {
      const c = document.createElement('canvas');
      c.width = c.height = 240;
      G.thumbs.open(240);
      G.thumbs.paint(c, entry, 0);
      G.thumbs.close();
      art.appendChild(c);
    } catch (e) { }
  }
  $('rsHead').textContent = offer.from + ' kept it';
  $('rsTier').textContent = offer.tier;
  $('rsName').textContent = offer.name;
  // say the price AND what you have, because a card that asks for a number you
  // cannot see is asking you to remember one
  // ⛔ his name was on this card three times and the number twice. The header
  // says who has it, the sentence says the price, the clock line says what you
  // have, and the button does one thing.
  const bal = G.econ.balance();
  $('rsSay').textContent = 'Yours again for ' + offer.price + ' sunbeams.';
  paintRansomClock();
  const can = bal >= offer.price;
  $('rsPay').disabled = !can;
  $('rsPay').textContent = can ? 'Buy it back' : 'Not enough yet';
  showScreen('ransom');
}

function paintRansomClock() {
  if (!G.ransomOffer) return;
  const left = Math.max(0, G.ransomOffer.expires - Date.now());
  $('rsClock').textContent = RANSOM.timeLeftWords(left) + '. You have ' + G.econ.balance() + '.';
}

function finishMatch(s) {
  const won = s.winner === 0;
  // the opponent's name comes from the match, so league two does not still say Dusty
  const oppName = (G.R.match.players[1] || {}).name || 'Dusty Coyle';
  $('resultTitle').textContent = won ? 'You win' : oppName + ' wins';
  $('rPocket').textContent = s.pocketed[0] + ' of ' + G.R.match.toWin;
  $('rShots').textContent = String(s.shots);
  const names = G.R.state.techniques.map(id => (RINGER_TECHNIQUES[id] || {}).name).filter(Boolean);
  /* the pot settles here, and it is the only place a staked marble changes hands */
  const pot = potUp() ? settle(won ? 0 : 1) : { won: [], lost: [], returned: [] };
  G.save = SAVE.load();
  G.stake = [];
  // an inventory item carries an id, not a name: the name lives in the catalog,
  // and "Dusty keeps ." is a worse sentence than any of the ones it replaced
  const nameOf = (m) => m.name || ((G.catalog.marbles.find(c => c.id === m.id) || {}).name) || m.id;
  // the escrow record carries an id and a uid; the tier printed over the
  // ceremony comes from the catalog, or the loss side ran with a blank tier line
  const tierOf = (m) => m.tier || ((G.catalog.marbles.find(c => c.id === m.id) || {}).tier) || '';
  /* ⛔ "keep" is the word for your OWN marble. On a win the sentence has to name
     the one that crossed the ring, because that is the only thing on this card a
     player will remember tomorrow. The screenshot said "You keep Peewee." over a
     marble that had just been taken off Dusty. */
  const list = (a) => a.map(nameOf).join(' and ');
  const opp = oppName;
  let potLine = '';
  if (pot.won.length) {
    potLine = 'You won ' + list(pot.won) + ' off ' + opp + '.';
    if (pot.returned.length || G.lastStakeNames) potLine += ' ' + (G.lastStakeNames || '') + ' came home.';
  } else if (pot.lost.length) {
    potLine = opp + ' keeps your ' + list(pot.lost) + '.';
  } else if (pot.returned.length) {
    potLine = 'Nobody lost anything. ' + list(pot.returned) + ' came home.';
  }
  $('rPot').textContent = potLine || 'nothing was up';
  G.lastStakeNames = '';   // one match, one sentence: it does not carry over
  $('rTech').textContent = names.length ? names.join(', ') : 'none yet';
  /* the GAME's wallet, which is the one the player spends (DESIGN 17) */
  const earned = G.econ.payForMatch({
    won, pocketed: s.pocketed[0], toWin: G.R.match.toWin,
    newTechniques: names.filter(n => (G.save.profile.techniques || []).indexOf(n) < 0)
  });
  $('rSun').textContent = String(earned.total);
  // the reasons are a receipt, not a headline: they belong under the card in the
  // small type, where they do not outshout the marble that changed hands
  $('rWhy').textContent = earned.paid.length ? earned.paid.map(p => p.reason).join(', ') : '';
  /* ⛔ XP FROM ANY MATCH, WON OR LOST, For Fair included: DESIGN 12 says
     progression never requires keepsies, so a player who stakes nothing still
     climbs. The level up bonus is paid through the economy, so it lands in the
     wallet's own change feed like every other earn. */
  /* beat 3 is a whole game For Fair, beat 5 is a whole game for keeps, and the
     difference between them is whether anything was in the pot */
  /* ⛔ THE STICKING BEAT CANNOT DEADLOCK. DESIGN 16.2 teaches sticking with one
     guided backspin shot, and a player who never manages one would otherwise sit
     on beat 2.5 forever. The beat still waits for exactly one event; the GAME
     decides that the guided window has closed and fires it, with a gentler line. */
  const b4 = G.onboard && G.onboard.beat();
  if (b4 && b4.id === 'sticking') fireBeat('stuck');
  if (pot.won.length || pot.lost.length || pot.returned.length) fireBeat('playedForKeeps');
  else fireBeat('playedDusty');
  const lvl = PROG.awardMatch(won, G.tuning, G.econ);
  G.save = SAVE.load();
  const p2 = PROG.snapshot(G.tuning);
  // ⛔ on a card that announces level 5, "560 to level 6" in the row above names a
  // second level and buries the news. When a level was gained the row is the XP
  // and nothing else, and the level up line carries the rest.
  $('rXp').textContent = '+' + lvl.gained + ' XP'
    + ((lvl.levels.length || p2.atCap) ? '' : ', ' + p2.toNext + ' to level ' + (p2.level + 1));
  if (lvl.levels.length) {
    const opened = [];
    for (const lv of lvl.levels) for (const k of PROG.unlocksAt(lv, G.tuning)) opened.push(UNLOCK_WORDS[k] || k);
    $('rLevel').hidden = false;
    $('rLevel').textContent = 'Level ' + lvl.level + '. ' + lvl.paid + ' sunbeams'
      + (opened.length ? ', and ' + opened.join(' and ') + ' now open.' : '.');
  } else {
    $('rLevel').hidden = true;
  }
  /* and the FLEET's, which is a different number on a different scale and never
     converts either way (HANDOFF-KEEPSIES 4.6) */
  const pay = won ? G.tuning.economy.fleetSunbeamsPerMatchMax : G.tuning.economy.fleetSunbeamsPerMatchMin;
  try { if (window._sbCapEarn) G.sunbeams += window._sbCapEarn(pay, 'keepsies:match'); } catch (e) { }
  paintWallet();
  G.matchesPlayed++;
  // the wallet is NOT written here any more: economy.payForMatch already earned
  // into it above, and adding the same amount again through the merge would pay
  // the player twice for one match
  SAVE.merge({
    stats: { matches: 1, wins: won ? 1 : 0, shots: s.shots, pocketed: s.pocketed[0] },
    profile: { techniques: G.R.state.techniques.slice() }
  });
  G.save = SAVE.load();
  try { if (window.SWSMusic && SWSMusic.milestone) SWSMusic.milestone(G.matchesPlayed); } catch (e) { }
  /* ⛔ THE CEREMONY RUNS BEFORE THE CARD, NEVER INSTEAD OF IT. DESIGN 18 calls
     the pot resolution the emotional core of the game, and it is, because it is
     the only moment where the thing that changed hands is a THING rather than a
     sentence. `playPotCeremony` calls back exactly once on every path, including
     the skip tap and a marble that will not render, so the card always arrives. */
  /* ⛔ THE OFFER IS WRITTEN AT THE SETTLE, NOT WHEN THE CARD IS SHOWN. A player
     who closes the tab on the loss ceremony still has their 24 hours when they
     come back, because the deadline is a timestamp in the save rather than a
     timer on a screen nobody is looking at. */
  G.offers = pot.lost.length
    ? RANSOM.offerFor(
      pot.lost.map(m => ({ uid: m.uid, id: m.id, tier: tierOf(m), name: nameOf(m) })),
      oppName, G.tuning, Date.now())
    : [];
  // the board's last line and its technique toast belong to the match that just
  // ended, and reading them through the ceremony makes them look like its own
  say('');
  $('toast').hidden = true;
  G.ceremony = playPotCeremony({
    host: document.body,
    thumbs: G.thumbs,
    catalog: G.catalog,
    won: pot.won.map(m => ({ id: m.id, name: nameOf(m), tier: tierOf(m) })),
    lost: pot.lost.map(m => ({ id: m.id, name: nameOf(m), tier: tierOf(m) })),
    opponent: oppName,
    onBeat: (kind, m) => {
      // the clink is the impact synth, fed a plausible hit rather than a new sound
      const e = G.catalog.marbles.find(c => c.id === m.id);
      try {
        AUDIO.impact({
          relSpeed: kind === 'won' ? 1.5 : 1.1,
          material: (e && e.class) || 'glass',
          diameterMm: (e && e.diameterMm) || 16,
          seed: 0.5, surface: false
        });
      } catch (err) { }
      try { if (navigator.vibrate) navigator.vibrate(kind === 'won' ? 14 : 8); } catch (err) { }
    },
    done: () => { G.ceremony = null; showRansomOrResults(); }
  });
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
      G.lastShooter = 1;
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
      // the cut also forgets the last shooter's orbit and pinch, BEFORE the frame
      // is computed, or the hard cut would land on the previous player's offsets
      if (snapIt && G.rig.resetUser) G.rig.resetUser();
      G.R.frameShot(G.rig, snapIt);
      if (snapIt) { G.lastFramedTurn = t; G.rig.update(1 / 60); }
    }
    /* ⛔ TOP DOWN LOOKS AT THE WHOLE PROBLEM. At 1.9 radii over the sports
       framing's biased target the cross sat in the top eighth of the screen,
       under the message bubble: the one view that exists to show where the
       marbles are hid them. Centred between the shooter and the cross, from a
       little higher, both are in the clear middle of the frame. */
    if (G.topDown) {
      const t = G.R.shooterTaw();
      const tp = positionOf(G.R.world, t.id);
      const live = G.R.liveMibs();
      let cx = 0, cz = 0;
      for (const m of live) { const p = positionOf(G.R.world, m.id); cx += p.x; cz += p.z; }
      if (live.length) { cx /= live.length; cz /= live.length; }
      G.rig.setTarget((tp.x + cx) * 0.5, 0.012, (tp.z + cz) * 0.5);
      G.rig.state.elevationDeg = 84;
      G.rig.state.wantDistance = G.R.ringRadius * 2.5;
    }
    else if (G.rig.state.elevationDeg > 60) G.rig.state.elevationDeg = 33;
    if (G.screen === 'match') updateHud();
    // a thumb held perfectly still sends no pointermove, and the settle is a
    // clock: read it every frame so the reticle tightens whether or not the
    // browser has anything to say
    updateAimUi();
    if (!G.usePullback && G.knuckle) {
      const ks = G.knuckle.state();
      if (ks.bracing) onBrace(ks);
      else if (G.scopeHold && canAim()) holdScope();
      else { if (G.spy && G.spy.on) hideSpyglass(); if (G.scopeHold) $('aimline').hidden = true; }
    }
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
  if (G.spy && G.spy.on && G.spy.rect) drawInset(G.stage, G.spy.cam, G.spy.rect);
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
          taw: R.tawOnScreen(G.rig),
          // the referee's last word on the last shot, so a driver can ask why a
          // stick did not stick without reading the log
          lastResolve: (() => { const l = R.match.log; for (let i = l.length - 1; i >= 0; i--) if (l[i].type === 'resolve') return l[i]; return null; })()
        } : null,
        assist: G.assist,
        knuckle: G.knuckle.state(),
        lastAim: G.knuckle.lastAim(),
        audio: AUDIO.isRunning()
      };
    },
    start: (opts) => { G.seenRules = true; showScreen('match'); startMatch(opts); },
    go: (opts) => { G.seenRules = true; return beginMatch(opts); },
    rules: () => showScreen('rules'),
    setup: () => { showScreen('setup'); buildHouseRules(); buildAnte(); return G.houseRules; },
    stake: (id) => {
      const g = groupForGrid(G.save.inventory, G.catalog, 'stakeable').find(x => x.entry.id === id);
      if (!g) return null;
      toggleStake(g);
      return { staked: G.stake.map(s2 => s2.id), theirs: G.theirStake.map(t => t.id), ok: G.anteOk, say: $('anteSay').textContent };
    },
    pot: () => currentPot(),
    // the ceremony is 1.1 s a marble and a gate should not sit through it
    ceremonySkip: () => { if (G.ceremony) { G.ceremony.skip(); return true; } return false; },
    // end a match on the spot, so a gate can reach the ceremony without playing
    // fifteen shots to get there
    forceEnd: (winner) => {
      if (!G.R) return false;
      finishMatch({ winner: winner, pocketed: [G.R.match.toWin, 0], shots: 1 });
      return true;
    },
    potUp: () => potUp(),
    collection: () => { openCollection(); return { tiles: $('grid').querySelectorAll('.tile').length }; },
    inspect: (id) => {
      const e = G.catalog.marbles.find(m => m.id === id);
      if (!e) return null;
      openInspect(e, G.save.inventory.find(i => i.id === id) || null);
      return { name: $('iName').textContent, tier: $('iTier').textContent, traits: $('iTraits').childElementCount / 2 };
    },
    inventory: () => G.save.inventory.length,
    wallet: () => G.econ.snapshot(),
    pouch: (kind) => openPouch(kind),
    grantSunbeams: (n) => { G.econ.earn(n, 'a gate said so'); buildPouches(); return G.econ.balance(); },
    // put one named marble in the inventory, so a gate can lose something worth
    // ransoming without playing until the pouches hand it one
    grantMarble: (id) => {
      const e = G.catalog.marbles.find(m => m.id === id);
      if (!e) return null;
      const uid = id + '-gate-' + (G.save.inventory.length + 1);
      SAVE.merge({ inventory: [{ id: id, uid: uid, tier: e.tier, acquired: Date.now(), source: 'gate', cosmeticSeed: 0.5 }] });
      G.save = SAVE.load();
      return { uid: uid, tier: e.tier, name: e.name };
    },
    offers: () => RANSOM.openOffers(Date.now()),
    grantXp: (n) => { const r = PROG.award(n, 'a gate said so', G.tuning, G.econ); buildPouches(); return r; },
    beat: () => { const b = G.onboard && G.onboard.beat(); return b ? b.id : null; },
    beatSkip: () => (G.onboard ? G.onboard.skip() : null),
    tin: () => { openTin(); return G.catalog ? true : false; },
    // the state of a player who has already been through the first four minutes:
    // onboarding done, starters on the shelf, no heirloom chosen for them
    skipOnboarding: () => {
      G.onboard.finish();
      G.save = SAVE.load();
      grantStartersOnce();
      return { inventory: G.save.inventory.length, beat: G.onboard.beat() };
    },
    title: () => { showScreen('title'); return true; },
    hasMarble: (id) => G.save.inventory.some(i => i.id === id),
    stakeNow: () => G.stake.map(m => m.id),
    progress: () => {
      const p = PROG.snapshot(G.tuning);
      const unlocked = {};
      for (const k of Object.keys(G.tuning.progression.unlocks)) unlocked[k] = PROG.unlocked(k, G.tuning);
      return Object.assign({}, p, { unlocked: unlocked });
    },
    pouchSay: () => $('pouchSay').textContent,
    econ: () => G.econ,
    catalogCount: () => G.catalog.marbles.length,
    houseRules: () => Object.assign({}, G.houseRules),
    calibrate: () => startCalibration(),
    wipeSave: () => { G.save = SAVE.wipe(); G.calib = calibrationFrom(G.save, G.tuning); G.seenRules = false; return true; },
    /** Drive the whole Knuckle from a synthesised path. Returns the AimSource. */
    flick(samples) { return G.knuckle._feed(samples, G.R ? G.R.tawOnScreen(G.rig) : null); },
    /* the fine aim and the snap card, for test/aimnudge.mjs */
    nudge(dir) { return nudgeAim(dir); },
    scopeHold(on) { setScopeHold(on); return G.scopeHold; },
    aimUi() { return { nudge: !$('aimNudge').hidden, scope: !$('scopeBtn').hidden, scopeOn: G.scopeHold, spy: !!(G.spy && G.spy.on), line: !$('aimline').hidden, lineInfo: G.aimLineInfo || null }; },
    snapCard() { return { open: !$('snapCard').hidden, seen: !!(G.save && G.save.seen && G.save.seen.snapHelp) }; },
    said() { return G.said; },
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
    aiTurn() { G.lastShooter = 1; return G.R ? G.R.aiTurn() : null; },
    /**
     * Play the opponent's turns to completion without waiting for real time.
     * A gate that waits for the frame loop to grind an AI shot out at software
     * rasteriser frame rates spends forty seconds on one turn and times out on a
     * game that is working perfectly.
     */
    playAiTurns(maxTurns) {
      let n = 0;
      while (G.R && G.R.state.phase !== 'over' && G.R.isAiTurn() && n++ < (maxTurns || 40)) {
        if (!G.R.state.simulating) { G.lastShooter = 1; G.R.aiTurn(); }
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
    /** The live mibs, in the world and on the screen, so a driver can AIM the way a thumb does. */
    mibs() {
      if (!G.R) return [];
      return G.R.liveMibs().map(m => {
        const p = positionOf(G.R.world, m.id);
        const c = G.rig.project(p.x, p.y, p.z);
        return { uid: m.uid, x: +p.x.toFixed(3), z: +p.z.toFixed(3), sx: +c.x.toFixed(1), sy: +c.y.toFixed(1), visible: c.visible, ring: +len2(p.x, p.z).toFixed(3) };
      });
    },
    /** Retune the match camera live, for a contact sheet of framings. */
    setCam(patch) {
      Object.assign(G.tuning.render.ringerCam, patch || {});
      if (patch && patch.fov) { G.rig.camera.fov = patch.fov; G.rig.camera.updateProjectionMatrix(); }
      return Object.assign({}, G.tuning.render.ringerCam);
    },
    /** Let the camera finish moving without waiting for frames. A fixture. */
    /**
     * Reach an end game for a camera shot WITHOUT a fake state: every live mib past
     * the first `keep` is placed outside the ring and the next physics step pockets
     * it through the real rule (ringer.js: a mib whose centre crosses the ring is
     * pocketed at that moment). Nothing about the game is bypassed; the marbles
     * simply took a very short route out. Dev only, used by the k2 endgame shots.
     */
    pocketAllBut(keep) {
      if (!G.R) return 0;
      const R = G.R, M = R.match, W = R.world;
      const gone = R.liveMibs().slice(Math.max(0, keep | 0));
      /* ⛔ Three versions of this hook. The first placed the mibs outside the ring and left
         them THERE, live, in a tidy line in the dirt, and the camera framed that line as the
         end game (k2-endgame-one.png, first pass). The second raised `simulating` and stepped
         the physics so tick() would run the ring rule, and the ring rule is followed by
         resolveShot(), which threw 'resolve out of phase (turn)' because no shot was in
         flight (the layout re-shoot died there at both widths). Faking the shot phase is no
         better: resolveShot hands every mib to the shooter and the seventh ends the match.
         So this does what tick() does to a mib that crosses the ring, removeMarble and the
         pocket sound, and settles the referee's books BY HAND, dealt alternately so a close
         game is left standing and nobody reaches toWin. */
      gone.forEach((m, i) => {
        removeMarble(W, m.id);
        const k = M.mibs.indexOf(m.uid);
        if (k >= 0) M.mibs.splice(k, 1);
        M.players[i % M.players.length].pocketed.push(m.uid);
        AUDIO.impact({ material: 'glass', diameterMm: 16, relSpeed: 1.4, seed: 0.5 });
      });
      syncMeshes(1);
      return R.liveMibs().length;
    },
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
        // the frame the player is actually getting, and their own orbit and pinch on top of it
        azimuth: +G.rig.state.azimuth.toFixed(4), wantAzimuth: +G.rig.state.wantAzimuth.toFixed(4),
        userAz: +(G.rig.state.userAz || 0).toFixed(4), userZoom: +(G.rig.state.userZoom || 1).toFixed(4),
        frameInfo: G.rig.state.frameInfo || null, mibsLeft: G.R.liveMibs().length,
        spy: G.spy && G.spy.on ? G.spy.info : null,
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
