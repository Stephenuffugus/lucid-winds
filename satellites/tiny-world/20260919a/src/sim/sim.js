// Public face of the simulation. DOM-free: runs in the page, in Node (tools/headless.mjs), later in a Worker.
// Time advances only in fixed steps of rules.tickSec (50 ms); speed changes how many steps run per frame.
import { compileContent } from './content.js';
import { createWorld } from './world.js';
import { update } from './update.js';
import { command } from './commands.js';
import { nearPoint } from './query.js';
import { worldHash } from './hash.js';
import { ent } from './ents.js';
import { view } from './view.js';

export function createSim(data, opts) {
  const C = compileContent(data);
  const w = createWorld(C, opts);
  const dt = C.rules.tickSec;
  return {
    w,
    C,
    // One fixed step. Positions before the step are kept for render interpolation.
    tick() {
      const E = w.E;
      for (let k = 0; k < w.count; k++) { const e = w.order[k]; E.px[e] = E.x[e]; E.py[e] = E.y[e]; }
      for (const t of w.twisters) { t.px = t.x; t.py = t.y; }
      update(w, dt);
      w.tick++;
    },
    // Commands apply at once, between steps, and are journaled with the step count so a replay
    // that applies them at the same point reproduces the world exactly. opts.journal false: no journal (the
    // game, where an hour of painting would otherwise keep every stroke in memory).
    command(c) {
      if (opts.journal !== false) w.journal.push({ tick: w.tick, c: JSON.parse(JSON.stringify(c)) });
      command(w, c);
    },
    // The creature nearest a tap, as a handle (0 for none): a handle stays valid, or goes stale, across steps.
    pick(x, y, r) { const i = nearPoint(w, x, y, r); return i < 0 ? 0 : w.slotH[i]; },
    // A creature as one plain object (for the HUD and tools, never per creature per frame), or null.
    view(h) { const i = ent(w, h); return i < 0 ? null : view(w, i); },
    hash: () => worldHash(w),
  };
}

// Rebuilds a world from its seed and journal, stopping after `ticks` steps.
export function replay(data, opts, journal, ticks) {
  const sim = createSim(data, opts);
  let i = 0;
  for (let t = 0; t < ticks; t++) {
    while (i < journal.length && journal[i].tick === t) sim.command(journal[i++].c);
    sim.tick();
  }
  while (i < journal.length && journal[i].tick === ticks) sim.command(journal[i++].c);
  return sim;
}
