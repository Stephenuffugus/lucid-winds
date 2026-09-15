/* YONDER, the page (plans/yonder/HANDOFF-YONDER.md P1): the road, Mode 2 FLAG and the traveler's walk.
 *
 * The rules are engine.js's; this file only draws them and takes a child's hands. A round: the number at the top, shown
 * and (with sound on and a voice on this device) named; the road from 0 to the signpost, its width and offset new every
 * round (Y3); the flag, CORE's number line stone, dragged by a thumb (with CORE's loupe) or moved by arrow keys, and put
 * down by letting go or by Enter. Nothing on the road but its ends (Y4).
 *
 * The reveal (Y6, the reveal contract): the flag stays where the child put it; the traveler appears at the flag and walks
 * at a steady pace to the true place, the tone following the walk (Y9, linear in the number under the traveler's feet);
 * on arrival a post goes up there with its numeral. The same walk on every round, near or far, in one colour; on a probe
 * item (handoff section 3) the walk is slower. Next is unavailable until the walk is done.
 */
import { settings, store, tokens, audio, SETTINGS_DEFAULTS, parseConfig, rng, numberline, lineGeometry, fromNormalized } from '../math/core/core.js?v=20260915a';
import { generateStage, scoreEstimate, pitchFor, PROBE_TABLE } from './engine.js?v=20260915a';
import { COPY, PALETTE } from './content.js?v=20260915a';
import { YONDER_SCHEMA } from './config.js?v=20260915a';

const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: {}, settings: Object.assign({}, SETTINGS_DEFAULTS) }) };
const CONFIG = parseConfig(location.search, YONDER_SCHEMA);
/* P1 plays one road; P2 routes between roads */
const MAX = 100;
/* the walk, in ms: a steady pace from flag to truth, slower on a probe; with less motion it is shorter and still walks */
const WALK = 1200, PROBE_WALK = 2400, WALK_REDUCED = 500, PROBE_WALK_REDUCED = 900, HOLD = 300, STEP = 150;

tokens.inject({ paper: PALETTE.paper, ink: PALETTE.ink, accent: PALETTE.truth });
const panel = settings.mount({ gameId: 'yonder', schema: SCHEMA, onChange: s => audio.setMuted(s.muted) });
audio.setMuted(panel.get().muted);

/* the tone the traveler carries: its pitch is linear in the number under its feet (Y9), from the flag's to the truth's */
const tone = { from: pitchFor(0, MAX), to: pitchFor(0, MAX), seconds: WALK / 1000 };
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
  plant: {
    build(ac, out, t) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(180, t);
      o.frequency.exponentialRampToValueAtTime(90, t + 0.08);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + 0.13);
    }
  }
});

/* Y7: a numeral named aloud only by a voice on this device (a server voice would send the number away, G2), only with
   sound on; the numeral is on the screen either way */
const spoken = [];
function speak(n) {
  if (audio.isMuted() || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
  const voice = speechSynthesis.getVoices().find(v => v.localService && /^en/i.test(v.lang));
  if (!voice) return;
  const u = new SpeechSynthesisUtterance(String(n));
  u.voice = voice;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
  spoken.push({ text: String(n), local: voice.localService });
}

const el = id => document.getElementById(id);
const targetEl = el('target'), road = el('road'), signpost = el('signpost'), traveler = el('traveler');
const truthEl = el('truth'), truthMark = el('truth-mark'), nextBtn = el('next');
road.setAttribute('aria-label', COPY.road);
nextBtn.setAttribute('aria-label', COPY.next);
el('start').setAttribute('aria-label', COPY.start);

const reduced = () => document.documentElement.classList.contains('lw-reduced-motion')
  || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

/* the targets from the child's seed, stage by stage; the road's geometry from its own stream, a new draw every round */
const roads = rng((CONFIG.seed + 7919) >>> 0);
const results = [];
let stageNo = 0, stage = [], index = 0, round = -1, geom = null, line = null, walk = null, byKey = false;

function startStage(n) {
  stageNo = n;
  stage = generateStage(rng((CONFIG.seed + n) >>> 0), MAX, { isNew: n === 0 });
  index = 0;
}

/* a new round: the number, a new road, the flag at the road's start, nothing else on the road */
function startRound() {
  round++;
  walk = null;
  if (line) line.destroy();
  geom = lineGeometry(roads);
  road.dataset.offset = String(geom.offsetPct);
  road.dataset.width = String(geom.widthPct);
  road.dataset.max = String(MAX);
  line = numberline.create({ container: road, geom, onCommit: plant, ends: ['0', String(MAX)] });
  line.stone.setAttribute('aria-label', COPY.flag);
  signpost.style.left = ((geom.offsetPct + geom.widthPct) * 100) + '%';
  traveler.hidden = true; traveler.classList.remove('step');
  truthEl.hidden = true; truthMark.hidden = true; truthEl.textContent = '';
  nextBtn.hidden = true;
  const target = stage[index];
  targetEl.textContent = String(target);
  speak(target);
}

/* the flag goes down: the child's placement, scored in the road's own numbers; then the walk */
function plant(value) {
  const target = stage[index], placement = value * MAX;
  const isProbe = stageNo === 0 && index === 0 && PROBE_TABLE[MAX] === target;
  const walkMs = reduced() ? (isProbe ? PROBE_WALK_REDUCED : WALK_REDUCED) : (isProbe ? PROBE_WALK : WALK);
  const result = { round, stage: stageNo, item: index, target, placement, value, pae: scoreEstimate(placement, target, { min: 0, max: MAX }),
    isProbe, walkMs, byKey, geom: { offsetPct: geom.offsetPct, widthPct: geom.widthPct }, revealAt: performance.now() };
  results.push(result);
  audio.play('plant');
  const W = road.getBoundingClientRect().width;
  const fx = fromNormalized(value, geom, W), tx = fromNormalized(target / MAX, geom, W);
  tone.from = pitchFor(placement, MAX); tone.to = pitchFor(target, MAX); tone.seconds = walkMs / 1000;
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
    traveler.classList.toggle('step', p < 1 && Math.floor(dt / STEP) % 2 === 1);
    if (p >= 1 && state.arrivedAt === null) {
      state.arrivedAt = now;
      truthMark.hidden = false;
      truthEl.hidden = false;
      const cw = truthEl.getBoundingClientRect().width;
      truthEl.style.left = Math.min(W - cw / 2 - 4, Math.max(cw / 2 + 4, tx)) + 'px';
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
  index++;
  if (index >= stage.length) startStage(stageNo + 1);
  startRound();
  if (byKey) line.stone.focus();
}

/* how the flag was put down: the last hand to touch the page */
window.addEventListener('keydown', () => { byKey = true; }, true);
window.addEventListener('pointerdown', () => { byKey = false; }, true);
nextBtn.addEventListener('click', next);
el('start').addEventListener('click', () => {
  el('first').hidden = true;
  if (byKey) line.stone.focus();
});

startStage(0);
startRound();

/* the loudest a child can make: a flag put down every half second and a slow walk begun each time */
const loudest = seconds => {
  const pattern = [];
  for (let t = 0; t < seconds; t += 0.5) pattern.push([t, 'plant'], [t + 0.01, 'walk']);
  return pattern;
};

window.YONDER = {
  ready: true,
  results,
  max: () => MAX,
  stage: () => stage.slice(),
  round: () => round,
  walkDone: () => !!(walk && walk.done),
  walk: () => walk && Object.assign({}, walk),
  spoken: () => spoken.slice(),
  audio: {
    sounded: () => audio.log.slice(),
    clear: () => { audio.log.length = 0; },
    renderLoud: (seconds, master) => audio.renderLoud(loudest(seconds), seconds, master)
  }
};
