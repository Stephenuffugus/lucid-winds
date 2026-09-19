// Night 0: the five scripted onboarding boards as run-shaped states, so the ordinary Night screen plays
// them. Relaxed rules: casts never run out, gems stay movable after a cast, nothing can be failed.
import { DATA } from './data.js';
import { grid } from './hex.js';
import { gemName } from './gems.js';
import ONBOARDING from '../data/onboarding.json' with { type: 'json' };

export const TUTORIAL = ONBOARDING;

export function tutorialState(index, data = DATA) {
  const def = ONBOARDING.boards[index];
  const g = grid(3);
  const at = ([q, r]) => g.at(q, r);
  const state = {
    v: 1, seed: `tutorial:${def.id}`, lantern: 'candle', vigil: 0, daily: false, phase: 'night', night: 0, endless: false,
    glints: 0, settings: [], gems: {}, pouch: [], nextUid: 1, dropIndex: 0, carry: [], offeredSettings: [],
    shop: null, reward: null, history: [], log: [], stats: { totalLux: 0, bestCast: null, casts: 0, dawns: 0, eclipsesBeaten: 0, inclusionGems: [], nightsCleared: 0 },
    opts: { seed: `tutorial:${def.id}`, lantern: 'candle', tutorial: true, loans: [] },
    tutorial: { index, id: def.id, verb: def.verb, teaches: def.teaches, ghost: def.ghost ? { cell: at(def.ghost.cell), facing: def.ghost.facing } : null, pulse: null, locked: [] },
  };
  const add = (spec) => {
    const uid = state.nextUid++;
    const gm = { uid, gemId: 7000 + uid, cut: spec.cut, stone: spec.stone, tier: 0, inclusion: null, nightsSurvived: 0, origin: 'tutorial' };
    gm.name = gemName(gm, data);
    state.gems[uid] = gm;
    state.pouch.push(uid);
    return uid;
  };
  const board = {
    radius: 3, night: 0, sub: 0, features: [], walls: [], dark: [], bright: [], fog: [], fixed: [],
    lanterns: [{ cell: at(def.lantern), dir: def.lantern[2] }],
    apertures: def.apertures.map(([q, r, color]) => ({ cell: at([q, r]), color })),
  };
  state.n = {
    night: 0, eclipse: null, board, apertures: board.apertures.map((a) => ({ ...a })), target: def.goal, casts: 99, castIndex: 0,
    lux: 0, castLux: [], draw: [], discard: [], hand: [], placed: [], fixedFacing: {}, redrawn: true, placedThisCast: 0,
    silkedUsed: false, colorsSeen: [], glints: 0, reshuffles: 0, cleared: false, reachedAt: null,
  };
  for (const p of def.placed) {
    const uid = add(p);
    state.n.placed.push({ uid, cell: at(p.cell), facing: p.facing, cast: 0, free: false, locked: !!p.locked });
    if (p.pulse) state.tutorial.pulse = at(p.cell);
    if (p.locked) state.tutorial.locked.push(at(p.cell));
  }
  for (const h of def.hand) state.n.hand.push(add(h));
  return state;
}
