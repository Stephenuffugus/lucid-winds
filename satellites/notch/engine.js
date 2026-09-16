/* NOTCH's pure engine (plans/notch/HANDOFF-NOTCH.md sections 3 and 4). No screen, no clock, no unseeded die: every function takes
   its random source, so Node replays exactly what a page played.

   toleranceFor   N8's ladder (3.11)
   seatCheck      seated when the piece is not a mirror and within its tolerance of the notch (3.3: the shape laws carry the
                  weight, and the seat is identity and angle)
   keyStep        15 degree keys, wrapped to one turn (3.5)
   dealSession    twelve TURN tasks, disparities from a shuffled bag so each comes evenly (N3), foils at stage 2 (N2)
   dealFind       a FIND panel: the piece once as itself among decoys that are never its shape (3.10)
   regionCells    a FIND region's cells, mirrored then turned
   scoreTurn      a TURN round's result: seated, set aside, right, how far off (3.6)
   tierFor, stageAfter   the tolerance tier from right answers, and stage 2 after a clean stage 1 session (3.11)
   revealPlan, revealAt  the slow reveal as time and angle: 60 degrees a second on every path, a mirror's full turn then its
                  flip (3.6) */
import { PIECES, PIECE_IDS } from './pieces.js?v=20260916e';
import { adaptTier } from '../math/core/pure.js?v=20260916e';

export const DISPARITIES = Object.freeze([0, 30, 60, 90, 120, 150, 180]);
export const KEY_STEP = 15;
export const SESSION_LENGTH = 12;
const STAGE_TWO = [9, 7, 6];

export function toleranceFor(stage, tier) {
  if (!(stage >= 2)) return 12;
  const t = Math.min(STAGE_TWO.length - 1, Math.max(0, Math.floor(Number(tier) || 0)));
  return STAGE_TWO[t];
}

/* the smallest turn between an angle and the notch, 0 to 180 */
export function angleOff(angle) {
  const d = ((angle % 360) + 360) % 360;
  return Math.min(d, 360 - d);
}

export function seatCheck(task, angle) {
  return !task.isMirror && angleOff(angle) <= task.tolerance;
}

/* one key press: 15 degrees one way, the angle kept in [-180, 180) */
export function keyStep(angle, dir) {
  const a = angle + KEY_STEP * (dir < 0 ? -1 : 1);
  return ((((a + 180) % 360) + 360) % 360) - 180;
}

function shuffle(r, list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = out[i]; out[i] = out[j]; out[j] = t; }
  return out;
}

export function dealSession(r, { stage = 1, tier = 0 } = {}) {
  const bag = shuffle(r, DISPARITIES.concat(DISPARITIES)).slice(0, SESSION_LENGTH);
  const foils = stage >= 2 ? 1 + Math.floor(r() * 3) : 0;
  const foilAt = new Set(shuffle(r, Array.from({ length: SESSION_LENGTH }, (_, i) => i)).slice(0, foils));
  const tolerance = toleranceFor(stage, tier);
  let last = null;
  return bag.map((d, i) => {
    let id = PIECE_IDS[Math.floor(r() * PIECE_IDS.length)];
    if (id === last) id = PIECE_IDS[(PIECE_IDS.indexOf(id) + 1 + Math.floor(r() * (PIECE_IDS.length - 1))) % PIECE_IDS.length];
    last = id;
    const sign = r() < 0.5 ? 1 : -1;
    return { pieceId: id, axis: 'z', angularDisparity: d, startAngle: d === 0 ? 0 : sign * d, isMirror: foilAt.has(i), tolerance, stage };
  });
}

/* a region's cells: its piece, mirrored if it says, then turned a quarter at a time */
export function regionCells(g) {
  let cells = PIECES[g.pieceId].cells.map(([x, y]) => [x, y]);
  if (g.mirror) cells = cells.map(([x, y]) => [-x, y]);
  for (let k = 0; k < ((g.turn || 0) % 4 + 4) % 4; k++) cells = cells.map(([x, y]) => [y, -x]);
  return cells;
}

/* a TURN round ends when a piece seats or the child sets it aside. A right piece is right when it seats; a mirror is right
   when it is set aside, because no turn can seat it (N2). */
export function scoreTurn(task, { finalAngle, setAside, rtMs = null, turns = 0 }) {
  const seated = !setAside && seatCheck(task, finalAngle);
  return { seated, setAside: !!setAside, correct: task.isMirror ? !!setAside : seated, error: angleOff(finalAngle), rtMs, turns };
}

export const TIER_CONFIG = Object.freeze({ tiers: 3, up: 3, down: 2, start: 0, floor: 0 });
export function tierFor(results) {
  return adaptTier(results.map(x => !!x.correct), TIER_CONFIG);
}

/* stage 2 once a stage 1 session of twelve has ten or more right */
export function stageAfter(sessions) {
  return sessions.some(s => s.stage === 1 && s.results.length >= SESSION_LENGTH && s.results.filter(x => x.correct).length >= 10) ? 2 : 1;
}

export const REVEAL_DEG_PER_S = 60, FLIP_MS = 600;
/* the reveal as steps of { from, to, ms, flip }: a right piece turns the short way to the notch; a mirror turns a full turn from
   where it was left, flips, and turns the short way home. The same speed on every path; with less motion every step lasts 0. */
export function revealPlan(task, fromAngle, reduced = false) {
  const at = t => (reduced ? 0 : t);
  const home = (a, flipped) => ({ from: a, to: 0, ms: at(angleOff(a) / REVEAL_DEG_PER_S * 1000), flip: flipped });
  if (!task.isMirror) return [home(fromAngle, false)];
  return [
    { from: fromAngle, to: fromAngle + 360, ms: at(360 / REVEAL_DEG_PER_S * 1000), flip: false },
    { from: fromAngle, to: fromAngle, ms: at(FLIP_MS), flip: true },
    home(fromAngle, true)
  ];
}

/* where the reveal stands t ms in: its angle, whether the piece is flipped, and whether it is over */
export function revealAt(plan, t) {
  let left = Math.max(0, t);
  for (let i = 0; i < plan.length; i++) {
    const s = plan[i];
    if (left < s.ms) {
      const p = left / s.ms;
      /* the short way home: from a to 0 through the smaller arc */
      let to = s.to;
      if (s.to === 0 && s.from !== 0) { const d = ((s.from % 360) + 540) % 360 - 180; to = s.from - d; }
      return { angle: s.from + (to - s.from) * p, flipped: s.flip && (i > 1 || p >= 0.5), done: false, step: i };
    }
    left -= s.ms;
  }
  const last = plan[plan.length - 1];
  return { angle: 0, flipped: !!last.flip, done: true, step: plan.length };
}

export function dealFind(r, { stage = 1 } = {}) {
  const pieceId = PIECE_IDS[Math.floor(r() * PIECE_IDS.length)];
  const count = 6 + Math.floor(r() * 4);
  const others = shuffle(r, PIECE_IDS.filter(id => id !== pieceId));
  const regions = [{ pieceId, mirror: false, turn: 0 }];
  /* the piece's own mirror is the hardest decoy: never its shape under a turn (the bank's shape laws) */
  if (r() < 0.5) regions.push({ pieceId, mirror: true, turn: Math.floor(r() * 4) });
  for (const id of others) {
    if (regions.length >= count) break;
    regions.push({ pieceId: id, mirror: r() < 0.5, turn: Math.floor(r() * 4) });
  }
  return { pieceId, stage, regions: shuffle(r, regions).map((g, slot) => Object.assign({ slot }, g)) };
}
