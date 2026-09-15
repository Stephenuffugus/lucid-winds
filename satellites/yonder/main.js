/* YONDER, the page (plans/yonder/HANDOFF-YONDER.md P1 and P2): the road, Mode 2 FLAG, the traveler's walk, the routing
 * between roads, Mode 5 MILEPOSTS, and the door to Mode 1 THE RACE (race.js).
 *
 * The rules are engine.js's; this file only draws them and takes a child's hands. A round: the number at the top, shown
 * and (with sound on and a voice on this device) named; the road from 0 to the signpost, its width and offset new every
 * round (Y3); the flag, CORE's number line stone, dragged by a thumb (with CORE's loupe) or moved by arrow keys, and put
 * down by letting go or by Enter. Nothing on the road but its ends (Y4), and in MILEPOSTS the child's own posts.
 *
 * The reveal (Y6, the reveal contract): the flag stays where the child put it; the traveler appears at the flag and walks
 * at a steady pace to the true place, the tone following the walk (Y9, linear in the number under the traveler's feet);
 * on arrival a post goes up there with its numeral. The same walk on every round, near or far, in one colour; on a probe
 * item (handoff section 3) the walk is slower. Next is unavailable until the walk is done.
 *
 * The session (engine.js planStage and recordStage): each stage's road and kind are planned from the record the store
 * keeps, and each finished stage is recorded. Nothing about the reading reaches the page (Y5): the road changes, the
 * rounds go on, and no word, colour or sound says why.
 *
 * MILEPOSTS: the halfway post, then the quarters, each placed by the child like a flag and carried by the traveler to its
 * true place, where it stands with its numeral for the rest of the stage, redrawn at its own number on each new road;
 * then estimates on the marked road. The stage's posts are gone when the stage ends.
 *
 * The first screen offers two pictures, the road (FLAG) and a row of squares (THE RACE); a link that names a mode opens
 * that one and the start opens it.
 */
import { settings, store, tokens, audio, SETTINGS_DEFAULTS, parseConfig, rng, numberline, lineGeometry, fromNormalized } from '../math/core/core.js?v=20260915c';
import { generateStage, scoreEstimate, pitchFor, PROBE_TABLE, freshSession, planStage, recordStage, milepostRounds } from './engine.js?v=20260915c';
import { COPY, PALETTE } from './content.js?v=20260915c';
import { YONDER_SCHEMA } from './config.js?v=20260915c';
import { mountRace } from './race.js?v=20260915c';
import { mountMap } from './map.js?v=20260915c';
import { spriteCanvas, drawInto, WALK_FRAMES } from './draw.js?v=20260915c';

const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: {}, settings: Object.assign({}, SETTINGS_DEFAULTS) }) };
const CONFIG = parseConfig(location.search, YONDER_SCHEMA);
/* a link that names a road is a teacher's starting place, and starts a session there on every load */
const NAMED_ROAD = /(^|[?&])road=/.test(location.search);
/* a link that names a mode opens only that mode */
const NAMED_MODE = /(^|[?&])mode=(flag|race)(&|$)/.test(location.search);
/* a FLAG run is this many rounds; a race to square 10 is a run too */
const RUN = Number(CONFIG.count);
/* the walk, in ms: a steady pace from flag to truth, slower on a probe; with less motion it is shorter and still walks */
const WALK = 1200, PROBE_WALK = 2400, WALK_REDUCED = 500, PROBE_WALK_REDUCED = 900, HOLD = 300, STEP = 150;

tokens.inject({ paper: PALETTE.paper, ink: PALETTE.ink, accent: PALETTE.truth });
const panel = settings.mount({ gameId: 'yonder', schema: SCHEMA, onChange: s => audio.setMuted(s.muted) });
audio.setMuted(panel.get().muted);

/* the tone the traveler carries: its pitch is linear in the number under its feet (Y9), from the flag's to the truth's */
const tone = { from: pitchFor(0, 10), to: pitchFor(0, 10), seconds: WALK / 1000 };
const tones = [];
/* a short voiced knock: the flag set down, a card turned, a step onto a square */
const knock = (f0, f1, peak, type) => ({
  build(ac, out, t) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.13);
  }
});
audio.define({
  walk: {
    build(ac, out, t) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(tone.from, t);
      o.frequency.linearRampToValueAtTime(tone.to, t + tone.seconds);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.16, t + 0.04);
      g.gain.setValueAtTime(0.16, t + tone.seconds);
      g.gain.linearRampToValueAtTime(0.0001, t + tone.seconds + 0.12);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + tone.seconds + 0.14);
    }
  },
  plant: knock(180, 90, 0.12, 'square'),
  flip: knock(520, 300, 0.1, 'triangle'),
  step: knock(240, 160, 0.14, 'triangle')
});

/* Y7: a numeral named aloud only by a voice on this device (a server voice would send the number away, G2), only with
   sound on; the numeral is on the screen either way.
   ⛔ speech is called from inside the walk's frame; the first page let a throw from it (a voice the utterance refused)
   end the frame loop, so the walk never arrived and next never came: a child locked out by a voice. Nothing speech does
   may stop a round. */
const spoken = [];
function speak(n) {
  try {
    if (audio.isMuted() || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    const voice = speechSynthesis.getVoices().find(v => v.localService && /^en/i.test(v.lang));
    if (!voice) return;
    const u = new SpeechSynthesisUtterance(String(n));
    u.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    spoken.push({ text: String(n), local: voice.localService });
  } catch (e) { /* the numeral is on the screen either way (Y7) */ }
}

const el = id => document.getElementById(id);
const targetEl = el('target'), road = el('road'), signpost = el('signpost'), traveler = el('traveler');
const truthEl = el('truth'), truthMark = el('truth-mark'), nextBtn = el('next');
road.setAttribute('aria-label', COPY.road);
nextBtn.setAttribute('aria-label', COPY.next);
el('start').setAttribute('aria-label', COPY.start);
el('start-race').setAttribute('aria-label', COPY.startRace);
if (NAMED_MODE) document.body.dataset.fixed = CONFIG.mode;
/* the sprites drawn once; the walk redraws the traveler's frames */
const walker = spriteCanvas('travelerWalk1', 3);
traveler.append(walker);
signpost.append(spriteCanvas('signpost', 3));
document.querySelector('.loop q').append(spriteCanvas('flag', 2));
document.querySelector('.loop kbd').append(spriteCanvas('travelerWalk1', 2));
document.querySelector('.pick-road').append(spriteCanvas('flag', 3));

const reduced = () => document.documentElement.classList.contains('lw-reduced-motion')
  || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

/* the session: kept in the store across visits, unless a link names the road to start on */
let session = (() => {
  const saved = store.load('yonder', SCHEMA).adapt;
  return !NAMED_ROAD && saved && saved.session && saved.session.home ? saved.session : freshSession(Number(CONFIG.road));
})();
/* each stage's plan and its deal come from the seed and how many stages the session has played */
const planRng = () => rng((CONFIG.seed * 31 + 17 + session.stages) >>> 0);
const dealRng = () => rng((CONFIG.seed + session.stages) >>> 0);
/* the road's geometry from its own stream, a new draw every round */
const roads = rng((CONFIG.seed + 7919) >>> 0);
const results = [];
let plan = null, rounds = [], index = 0, round = -1, geom = null, line = null, walk = null, byKey = false, stageEstimates = [];
/* the numbers of the posts standing on the road this stage (MILEPOSTS only) */
let posts = [];
/* rounds finished in this run; kept in memory only, so a reload in the middle of a run earns nothing */
let runRounds = 0;

function startStage() {
  plan = planStage(session, planRng());
  const deal = dealRng();
  rounds = plan.kind === 'mileposts' ? milepostRounds(deal, plan.max)
    : generateStage(deal, plan.max, { isNew: plan.isNew }).map(t => ({ kind: 'flag', target: t }));
  index = 0;
  stageEstimates = [];
  posts = [];
}

/* a finished stage goes into the record, the record into the store, and the next stage is planned */
function endStage() {
  session = recordStage(session, { max: plan.max, kind: plan.kind, estimates: stageEstimates }, planRng()).session;
  store.update('yonder', SCHEMA, rec => { rec.adapt = { session }; });
  startStage();
}

/* every standing post drawn at its own number on this round's road */
function drawPosts() {
  road.querySelectorAll('.milepost').forEach(p => p.remove());
  const W = road.getBoundingClientRect().width;
  for (const v of posts) {
    const p = document.createElement('div'), label = document.createElement('span');
    p.className = 'milepost';
    p.append(spriteCanvas('milepost', 3));
    p.dataset.value = String(v);
    p.style.left = fromNormalized(v / plan.max, geom, W) + 'px';
    label.className = 'milepost-label';
    label.textContent = String(v);
    p.append(label);
    road.append(p);
  }
}

/* a new round: the number, a new road, the flag at the road's start, nothing else on the road but the stage's posts */
function startRound() {
  round++;
  walk = null;
  if (line) line.destroy();
  geom = lineGeometry(roads);
  const max = plan.max;
  road.dataset.offset = String(geom.offsetPct);
  road.dataset.width = String(geom.widthPct);
  road.dataset.max = String(max);
  line = numberline.create({ container: road, geom, onCommit: plant, ends: ['0', String(max)] });
  line.stone.setAttribute('aria-label', COPY.flag);
  line.stone.append(spriteCanvas('flag', 4));
  signpost.style.left = ((geom.offsetPct + geom.widthPct) * 100) + '%';
  traveler.hidden = true;
  drawInto(walker, WALK_FRAMES[0], 3);
  truthEl.hidden = true; truthMark.hidden = true; truthEl.textContent = '';
  nextBtn.hidden = true;
  drawPosts();
  const target = rounds[index].target;
  targetEl.textContent = String(target);
  speak(target);
}

/* the flag goes down: the child's placement, scored in the road's own numbers; then the walk */
function plant(value) {
  const max = plan.max, { kind, target } = rounds[index], placement = value * max;
  const isProbe = kind === 'flag' && plan.isNew && index === 0 && PROBE_TABLE[max] === target;
  const walkMs = reduced() ? (isProbe ? PROBE_WALK_REDUCED : WALK_REDUCED) : (isProbe ? PROBE_WALK : WALK);
  const result = { round, stage: session.stages, item: index, kind, max, dropBack: plan.dropBack, target, placement, value,
    pae: scoreEstimate(placement, target, { min: 0, max }), isProbe, walkMs, byKey,
    geom: { offsetPct: geom.offsetPct, widthPct: geom.widthPct }, revealAt: performance.now() };
  results.push(result);
  if (kind === 'flag') stageEstimates.push({ target, placement });
  audio.play('plant');
  const W = road.getBoundingClientRect().width;
  const fx = fromNormalized(value, geom, W), tx = fromNormalized(target / max, geom, W);
  tone.from = pitchFor(placement, max); tone.to = pitchFor(target, max); tone.seconds = walkMs / 1000;
  tones.push({ from: tone.from, to: tone.to, seconds: tone.seconds });
  traveler.style.left = fx + 'px';
  traveler.hidden = false;
  truthMark.style.left = tx + 'px';
  truthEl.textContent = String(target);
  const state = { done: false, arrivedAt: null, from: fx, to: tx, walkMs };
  walk = state;
  /* one tone for the one walk (A1) */
  audio.play('walk');
  const step = now => {
    const dt = now - result.revealAt, p = Math.min(1, Math.max(0, dt / walkMs));
    traveler.style.left = (fx + (tx - fx) * p) + 'px';
    /* ⛔ a walk's first animation frame can carry a time a hair before the flag went down, so dt was negative, the frame
       index negative, the sprite undefined, and the throw ended the walk: next never came (seven gates red at once) */
    const frame = p < 1 ? WALK_FRAMES[Math.floor(Math.max(0, dt) / STEP) % WALK_FRAMES.length] : WALK_FRAMES[0];
    if (walker.dataset.sprite !== frame) drawInto(walker, frame, 3);
    if (p >= 1 && state.arrivedAt === null) {
      state.arrivedAt = now;
      truthMark.hidden = false;
      truthEl.hidden = false;
      const cw = truthEl.getBoundingClientRect().width;
      truthEl.style.left = Math.min(W - cw / 2 - 4, Math.max(cw / 2 + 4, tx)) + 'px';
      /* a milepost stands where the traveler carried it */
      if (kind === 'post') { posts.push(target); drawPosts(); }
      speak(target);
    }
    if (dt >= walkMs + HOLD) {
      state.done = true;
      nextBtn.hidden = false;
      /* focus follows a keyboard; a thumb gets no ring it did not ask for */
      if (result.byKey) nextBtn.focus();
      return;
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function next() {
  if (!walk || !walk.done) return;
  runRounds++;
  const ended = runRounds >= RUN;
  if (ended) runRounds = 0;
  index++;
  if (index >= rounds.length) endStage();
  startRound();
  if (ended) map.earn(byKey);
  else if (byKey) line.stone.focus();
}

/* THE RACE, mounted now so it is ready behind its door */
const race = mountRace({ host: el('race'), seed: CONFIG.seed, copy: { track: COPY.track, card: COPY.card, again: COPY.again },
  speak, sound: name => audio.play(name), onEnd: () => { map.earn(byKey); return true; } });

/* the map, over whichever screen ended its run; go returns to it */
const map = mountMap({ host: document.body, copy: { again: COPY.again }, store, gameId: 'yonder', schema: SCHEMA,
  onGo: () => { if (!byKey) return; if (!el('race').hidden) el('race-again').focus(); else line.stone.focus(); } });

function openRace() {
  el('first').hidden = true;
  el('play').hidden = true;
  el('race').hidden = false;
  race.refresh();
  if (byKey) el('card').focus();
}

/* how the flag was put down: the last hand to touch the page */
window.addEventListener('keydown', () => { byKey = true; }, true);
window.addEventListener('pointerdown', () => { byKey = false; }, true);
nextBtn.addEventListener('click', next);
el('start').addEventListener('click', () => {
  if (NAMED_MODE && CONFIG.mode === 'race') { openRace(); return; }
  el('first').hidden = true;
  if (byKey) line.stone.focus();
});
el('start-race').addEventListener('click', openRace);

startStage();
startRound();
/* the road a session started on at this load, for the link gate */
const startRoad = String(session.home);

/* the offline shell: one worker for the game, its address carrying the stamp */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js?v=20260915c').catch(() => {});

/* the loudest a child can make: a flag put down every half second and a slow walk begun each time, and on the squares a
   card and two steps a second */
const loudest = seconds => {
  const pattern = [];
  for (let t = 0; t < seconds; t += 0.5) pattern.push([t, 'plant'], [t + 0.01, 'walk'], [t + 0.2, 'flip'], [t + 0.3, 'step']);
  return pattern;
};
/* the walk voice from 0 to the far end over two seconds, rendered offline, its frequency measured at five evenly spaced
   moments from its zero crossings (the ear gate's Y9) */
function renderWalk() {
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!OAC) return Promise.reject(new Error('no OfflineAudioContext'));
  const sr = 22050, ctx = new OAC(1, Math.ceil(sr * 2.3), sr), keep = Object.assign({}, tone);
  Object.assign(tone, { from: pitchFor(0, 100), to: pitchFor(100, 100), seconds: 2 });
  audio.voices.walk.build(ctx, ctx.destination, 0);
  Object.assign(tone, keep);
  return ctx.startRendering().then(buf => {
    const d = buf.getChannelData(0);
    return [0.2, 0.6, 1.0, 1.4, 1.8].map(c => {
      const a = Math.floor((c - 0.1) * sr), b = Math.floor((c + 0.1) * sr), ts = [];
      for (let i = a + 1; i < b; i++) if (d[i - 1] < 0 && d[i] >= 0) ts.push((i - 1 + d[i - 1] / (d[i - 1] - d[i])) / sr);
      return ts.length > 1 ? (ts.length - 1) / (ts[ts.length - 1] - ts[0]) : 0;
    });
  });
}

window.YONDER = {
  ready: true,
  results,
  max: () => plan.max,
  plan: () => Object.assign({}, plan),
  rounds: () => rounds.map(r => Object.assign({}, r)),
  session: () => JSON.parse(JSON.stringify(session)),
  round: () => round,
  walkDone: () => !!(walk && walk.done),
  walk: () => walk && Object.assign({}, walk),
  spoken: () => spoken.slice(),
  race: { state: () => race.state(), refresh: () => race.refresh() },
  /* what this page is playing, for the link gate: the mode a link named, the road it started on, the run's length */
  config: () => ({ mode: document.body.dataset.fixed || 'flag', road: startRoad, count: String(RUN) }),
  runLength: () => RUN,
  mapCells: () => map.cells(),
  audio: {
    sounded: () => audio.log.slice(),
    clear: () => { audio.log.length = 0; },
    tones: () => tones.slice(),
    renderWalk,
    renderLoud: (seconds, master) => audio.renderLoud(loudest(seconds), seconds, master)
  }
};
