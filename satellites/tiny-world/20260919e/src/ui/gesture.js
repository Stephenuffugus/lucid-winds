// What a finger does, by tool (design 14 §3). The one tool state is the tray's (getTool); these are its gestures.
//   Hand (the default)  tap: poke and select, or with 3+ creatures under the finger a row of their pictures to pick
//                       from · double tap: select and follow · drag: pan · long press: lift a creature, carry it, and
//                       drop it where the finger lifts (commands lift / drop)
//   Place (a creature, thing, gear or weapon)  tap: place / give / build · drag: pan, or with the Spray chip on, lay
//                       them along the finger (the old spray: one creature per rules.tools.sprayGap px, things per tile)
//   Paint (land), Erase  act where the finger lands and all along a drag (two fingers pan)
//   Power               tap: use it at the point · drag: pan (no power acts along a drag yet)
// Every drag ends a follow. A named creature is never erased by the first touch that reaches it (spareFor()).
import { HELD, ent } from '../sim/ents.js';

const PLACE = new Set(['creature', 'enemy', 'water', 'weapon', 'gear', 'build']);
export function modeOf(tool) {
  if (tool.cat === 'hand' || tool.id === 'inspect') return 'hand';
  if (tool.id === 'erase') return 'erase';
  if (tool.cat === 'land') return 'paint';
  if (PLACE.has(tool.cat)) return 'place';
  return 'power';
}
// Place tools that can spray (the chip shows for them): creatures and things; a weapon or gear is given, one at a time.
export const canSpray = (tool) => ['creature', 'enemy', 'water', 'build'].includes(tool.cat);

// ui: the interface's state the renderer draws from: held {h, x, y} | null, pokes Map(handle -> ms), outlines
// Map(handle -> {until, stroke}), follow (a handle or 0).
export function createGestures({ getSim, getTool, actor, cam, ui, U, onSelect, onPicker, onCamera, spray, onPoke = () => {} }) {
  const mode = () => modeOf(getTool());
  const sprayOn = () => spray() && canSpray(getTool());
  // Pick radius: ui.pickRadius CSS px around the finger, never under pickMinWorld world px (a sprite's width).
  const reach = () => Math.max(U.pickMinWorld, (U.pickRadius * cam.dpr) / cam.zoom);
  // Handles of the creatures within r of (x, y), nearest first, at most max (the sim is read, never changed).
  function near(x, y, r, max) {
    const w = getSim().w, E = w.E, out = [];
    for (let k = 0; k < w.count; k++) { const e = w.order[k]; if (E.inside[e] || E.dead[e]) continue; const d = Math.hypot(E.x[e] - x, E.y[e] - 4 - y); if (d < r) out.push([d, w.slotH[e]]); }
    out.sort((a, b) => a[0] - b[0]);
    return out.slice(0, max).map((q) => q[1]);
  }
  const now = () => performance.now();
  function poke(h) { ui.pokes.set(h, now()); onSelect(h); onPoke(h); }
  let pan = false, stroke = 0, touch = 0;
  return {
    poke,
    get touch() { return touch; }, // this touch's id: every command it gives is one Undo step (sim/undo.js)
    down(x, y) {
      pan = false;
      touch++;
      const m = mode();
      if (m === 'erase') stroke++;
      if (m === 'paint' || m === 'erase' || (m === 'place' && sprayOn())) actor.down(x, y);
    },
    tap(x, y, cssX, cssY) {
      const m = mode();
      if (m === 'hand') {
        const hs = near(x, y, reach(), U.picker.max);
        if (hs.length >= U.picker.min) onPicker(hs, cssX, cssY);
        else if (hs.length) poke(hs[0]);
        else onSelect(0);
      } else if ((m === 'place' && !sprayOn()) || m === 'power') actor.down(x, y); // one of it, at the point
    },
    doubleTap(x, y) {
      if (mode() !== 'hand') return this.tap(x, y);
      const hs = near(x, y, reach(), 1);
      if (hs.length) { poke(hs[0]); ui.follow = hs[0]; }
    },
    dragStart() {
      ui.follow = 0; // any drag ends a follow (14 §3)
      const m = mode();
      pan = m === 'hand' || m === 'power' || (m === 'place' && !sprayOn());
    },
    drag(from, to, dx, dy) {
      if (pan) { cam.panBy(dx, dy); onCamera(); }
      else actor.move(to[0], to[1]);
    },
    dragEnd() { pan = false; },
    longPress(x, y) {
      if (mode() !== 'hand') return false;
      const hs = near(x, y, reach(), 1), sim = getSim();
      if (!hs.length) { // no creature: a loose item on the tile under the finger (a crown, a hat)
        const w = sim.w, tx = Math.floor(x / w.T), ty = Math.floor(y / w.T), s = tx >= 0 && ty >= 0 && tx < w.cols && ty < w.rows ? w.grid[ty * w.cols + tx] : null;
        if (!s || !s.def.item) return false;
        sim.command({ t: 'liftItem', tx, ty });
        ui.held = { item: s.def.item, x, y };
        ui.follow = 0;
        return true;
      }
      sim.command({ t: 'lift', h: hs[0] });
      const e = ent(sim.w, hs[0]);
      if (e < 0 || sim.w.E.inside[e] !== HELD) return false; // in a house or a UFO: stays put
      ui.held = { h: hs[0], x, y };
      ui.follow = 0;
      onSelect(hs[0]);
      return true;
    },
    carry(x, y) { if (ui.held) { ui.held.x = x; ui.held.y = y; } },
    release(x, y) {
      if (!ui.held) return;
      if (ui.held.item) getSim().command({ t: 'dropItem', item: ui.held.item, x, y });
      else getSim().command({ t: 'drop', h: ui.held.h, x, y });
      ui.held = null;
    },
    cancel() { pan = false; },
    // Erase's guard (14 §3): handles of the named creatures under the eraser at (x, y) that this touch must leave.
    // The first touch to reach one outlines it red for ui.eraseGuardMs and spares it for the rest of that touch; a
    // new touch within that time erases it.
    spareFor(x, y) {
      const w = getSim().w, E = w.E, r = w.R.tools.eraseRadius, t = now(), spare = [];
      for (let k = 0; k < w.count; k++) {
        const e = w.order[k];
        if (E.inside[e] || !E.name[e] || Math.hypot(E.x[e] - x, E.y[e] - 4 - y) >= r) continue;
        const h = w.slotH[e], o = ui.outlines.get(h);
        if (o && o.until > t && o.stroke !== stroke) continue; // its second touch
        if (!o || o.until <= t) ui.outlines.set(h, { until: t + U.eraseGuardMs, stroke });
        spare.push(h);
      }
      return spare;
    },
  };
}
