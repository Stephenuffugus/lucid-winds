/* HUSH's pure engine (plans/hush/HANDOFF-HUSH.md sections 3 and 4). No screen, no clock, no unseeded die: every function takes
   its random source and its times as arguments, so Node replays exactly what a page played.

   dealRun     the order of go and no-go trials (H1 and 3.2) and the gap before each pose (3.6)
   scoreTrial  a step against a pose's paint and hide (3.6, S2)
   stepsDelta, approach, tierOf, settled   the approach in both forks (3.4, 3.5; H4, H9)
   adaptAxes   the three staircases on their three histories (3.3)
   dealSimon   SIMON's thirty commands (3.7) */
import { adaptStaircase } from '../math/core/pure.js?v=20260916d';
import { SIMON_COMMANDS } from './content.js?v=20260916d';

export { SIMON_COMMANDS };

export const GRACE_MS = 150;
export const GAP_MIN = 700, GAP_MAX = 1500;
export const SETTLE = 18, STEPS_PER_TIER = 3, TIERS = 6;
export const RATIO = Object.freeze({ easy: 0.775, hard: 0.8 });
export const DURATION = Object.freeze({ min: 400, max: 1200, step: 80, start: { quick: 800, careful: 1200 } });
export const SIMILARITY = Object.freeze({ min: 0, max: 1, step: 0.25 });

/* 3.2: at easy a no-go count of floor(n 9/40), at hard n/5. Never round(n 0.225): 60 gives 14 and a clock. */
export function noGoCount(n, level) {
  return level === 'hard' ? Math.floor(n / 5) : Math.floor(n * 9 / 40);
}

/* The order is drawn uniformly over every legal arrangement: k no-go tokens (each three go then a no-go) and n - 4k spare go
   tokens, placed by choosing which of the n - 3k slots hold a no-go (stars and bars). */
function order(r, n, k) {
  const slots = n - 3 * k;
  const marks = Array.from({ length: slots }, (_, i) => i < k);
  for (let i = slots - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = marks[i]; marks[i] = marks[j]; marks[j] = t;
  }
  const out = [];
  for (const nogo of marks) {
    if (nogo) out.push('go', 'go', 'go', 'nogo');
    else out.push('go');
  }
  return out;
}

export function dealRun(r, { n = 40, level = 'easy', mode = 'step' } = {}) {
  const k = noGoCount(n, level);
  return order(r, n, k).map(type => ({ mode, type, gapMs: GAP_MIN + Math.floor(r() * (GAP_MAX - GAP_MIN + 1)) }));
}

/* 3.6: a step counts from the pose's paint to its hide and GRACE_MS after; a step outside that window is in the gap and
   ignored, so it scores as no step. Reaction time is from paint. */
export function scoreTrial({ type, paintedAt, hiddenAt, stepAt }) {
  const inside = stepAt !== null && stepAt !== undefined && stepAt >= paintedAt && stepAt <= hiddenAt + GRACE_MS;
  if (type === 'go') return inside ? { outcome: 'hit', rtMs: stepAt - paintedAt } : { outcome: 'miss', rtMs: null };
  return inside ? { outcome: 'falseAlarm', rtMs: stepAt - paintedAt } : { outcome: 'correctRejection', rtMs: null };
}

/* 3.4: Quick earns a step on a hit; Careful on a hit and on a freeze; a false alarm is one step back in both (H4); a miss is
   nothing at all (H9). */
export function stepsDelta(outcome, fork) {
  if (outcome === 'hit') return 1;
  if (outcome === 'falseAlarm') return -1;
  if (outcome === 'correctRejection' && fork === 'careful') return 1;
  return 0;
}

export function approach(steps, delta) {
  return Math.min(SETTLE, Math.max(0, steps + delta));
}
export function tierOf(steps) {
  return Math.min(TIERS - 1, Math.floor(Math.max(0, steps) / STEPS_PER_TIER));
}
export function settled(steps) {
  return steps >= SETTLE;
}

/* 3.3: three staircases, three histories. A run is a list of { type, outcome }. adaptStaircase makes a level LOWER when it is
   harder, so duration is used as it is, and similarity and the ratio are used negated. */
export function adaptAxes(runs, fork) {
  const trials = [].concat(...runs);
  const go = trials.filter(t => t.type === 'go').map(t => t.outcome === 'hit');
  const nogo = trials.filter(t => t.type === 'nogo').map(t => t.outcome === 'correctRejection');
  const clean = runs.map(run => {
    const n = run.filter(t => t.type === 'nogo');
    return n.length === 0 || n.filter(t => t.outcome === 'falseAlarm').length / n.length < 0.25;
  });
  const d = adaptStaircase(go, { start: DURATION.start[fork === 'quick' ? 'quick' : 'careful'], step: DURATION.step, min: DURATION.min, max: DURATION.max, down: 2, up: 1 });
  const s = adaptStaircase(nogo, { start: 0, step: SIMILARITY.step, min: -SIMILARITY.max, max: -SIMILARITY.min, down: 2, up: 1 });
  const q = adaptStaircase(clean, { start: fork === 'quick' ? -1 : 0, step: 1, min: -1, max: 0, down: 2, up: 1 });
  return { durationMs: d.level, cueSimilarity: 0 - s.level, ratio: q.level === -1 ? RATIO.hard : RATIO.easy };
}

/* 3.7: thirty commands; "Hush says" is the go share with H1's minimum, the easy level's order. It scores nothing. */
export function dealSimon(r, { n = 30 } = {}) {
  return order(r, n, noGoCount(n, 'easy')).map(type => ({ says: type === 'go', command: SIMON_COMMANDS[Math.floor(r() * SIMON_COMMANDS.length)] }));
}
