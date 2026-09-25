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
  if (tool.cat === 'land' || tool.cat === 'village') return 'paint';
  if (PLACE.has(tool.cat)) return 'place';
  return 'power';
}
// Place tools that can spray (the chip shows for them): creatures and things; a weapon or gear is given, one at a time.
export const canSpray = (tool) => ['creature', 'enemy', 'water', 'build'].includes(tool.cat);

// ui: the interface's state the renderer draws from: held {h, x, y} | null, pokes Map(handle -> ms), outlines
// Map(handle -> {until, stroke}), follow (a handle or 0).
export function createGestures({ getSim, getTool, actor, cam, ui, U, onSelect, onPicker, onCamera, spray, onPoke = () => {}, onPokeThing = () => {}, onPour = () => {} }) {
  const mode = () => modeOf(getTool());
  const sprayOn = () => spray() && canSpray(getTool());
  let pouring = false;
  // Pick radius: ui.pickRadius CSS px around the finger, never under pickMinWorld world px (a sprite's width).
  const reach = () => Math.max(U.pickMinWorld, (U.pickRadius * cam.dpr) / cam.zoom);
  // Handles of the creatures within r of (x, y), nearest first, at most max (the sim is read, never changed).
  function near(x, y, r, max) {
    const w = getSim().w, E = w.E, out = [];
    // (A giant is drawn twice the size: its middle is higher up and it is easier to hit.)
    for (let k = 0; k < w.count; k++) { const e = w.order[k]; if (E.inside[e] || E.dead[e]) continue; const big = E.bigT[e] !== 0, d = Math.hypot(E.x[e] - x, E.y[e] - (big ? 8 : 4) - y) - (big ? 5 : 0); if (d < r) out.push([d, w.slotH[e]]); }
    out.sort((a, b) => a[0] - b[0]);
    gap = out.length > 1 ? out[1][0] - out[0][0] : Infinity;
    first = out.length ? out[0][0] : Infinity;
    return out.slice(0, max).map((q) => q[1]);
  }
  const now = () => performance.now();
  let gap = Infinity; // how much nearer the nearest creature under the finger was than the next one (near())
  let first = Infinity; // and how far the nearest one was from the finger
  // The thing on the tile under the finger, poked (design 17), or false when there is none. A thing under the finger
  // wins over a creature that is merely within reach: a hen stands beside the egg she has just laid, and every poke
  // meant for the egg used to go to her (the review of Sep 21).
  function pokeThingAt(x, y) {
    const w = getSim().w, tx = Math.floor(x / w.T), ty = Math.floor(y / w.T);
    if (!(tx >= 0 && ty >= 0 && tx < w.cols && ty < w.rows) || !w.grid[ty * w.cols + tx]) return false;
    ui.thingPoke = { tx, ty, t: now() };
    onPokeThing(tx, ty);
    return true;
  }
  function poke(h) { ui.pokes.set(h, now()); onSelect(h); onPoke(h); }
  let pan = false, stroke = 0, touch = 0;
  return {
    poke,
    // How long a still finger waits before the tool takes over (design 15 A2): with something sprayable in hand
    // that is the pour, otherwise it is the Hand's long press.
    holdMs: () => (mode() === 'place' && canSpray(getTool()) ? U.pourMs : U.longPressMs),
    // How far the finger may wander and still count as held (15 A2 asks for 8 px while pouring).
    holdSlop: () => (mode() === 'place' && canSpray(getTool()) ? U.pourSlop : U.tapSlop),
    // Hold to pour (15 A2): a finger that stays put with a creature or a thing in hand starts pouring, and the
    // drag that follows lays them along its path. A finger that moves sooner is a pan, exactly as before.
    pour(x, y) {
      if (mode() !== 'place' || !canSpray(getTool())) return false;
      pouring = true;
      ui.pouring = true;
      ui.pourAt = [x, y];
      actor.down(x, y);
      onPour(true);
      return true;
    },
    get pouring() { return pouring; },
    get touch() { return touch; }, // this touch's id: every command it gives is one Undo step (sim/undo.js)
    down(x, y) {
      pan = false;
      touch++;
      const m = mode();
      // Any touch on the field with a tool in hand puts the creature card away (Stephen, Sep 20: with a build
      // tool selected there was no way to close it). The Hand keeps its own rule below: it selects and pokes.
      if (m !== 'hand') onSelect(0);
      if (m === 'erase') stroke++;
      if (m === 'paint' || m === 'erase' || (m === 'place' && sprayOn())) actor.down(x, y);
    },
    tap(x, y, cssX, cssY) {
      const m = mode();
      if (m === 'hand') {
        const hs = near(x, y, reach(), U.picker.max);
        // Three or more under the finger opens the picker, but not when one of them is plainly the one she meant: in
        // a hen house every poke used to be a picker, and the second poke of the bell wearer (the herd had just
        // arrived) was never a poke at all (the engine judge, Sep 21).
        // A thing right under the finger, and no creature within a few px of it: the thing is what she meant.
        if (first > U.pokeThingOver && pokeThingAt(x, y)) onSelect(0);
        else if (hs.length >= U.picker.min && gap < 3) onPicker(hs, cssX, cssY);
        else if (hs.length) poke(hs[0]);
        else { onSelect(0); pokeThingAt(x, y); }
      } else if ((m === 'place' && !sprayOn()) || m === 'power') actor.down(x, y); // one of it, at the point
    },
    doubleTap(x, y) {
      if (mode() !== 'hand') return this.tap(x, y);
      const hs = near(x, y, reach(), 1);
      // (With nobody under the finger a double tap is simply two taps: every second quick poke of a tree used to be
      // swallowed here. The review of Sep 21.)
      if (hs.length && !(first > U.pokeThingOver && pokeThingAt(x, y))) { poke(hs[0]); ui.follow = hs[0]; }
      else if (!hs.length) pokeThingAt(x, y);
    },
    dragStart() {
      ui.follow = 0; // any drag ends a follow (14 §3)
      const m = mode();
      pan = m === 'hand' || m === 'power' || (m === 'place' && !sprayOn());
    },
    drag(from, to, dx, dy) {
      if (pouring) { ui.pourAt = to; actor.move(to[0], to[1]); return; } // pouring: the path places them, whatever the chip says
      if (pan) { cam.panBy(dx, dy); onCamera(); }
      else actor.move(to[0], to[1]);
    },
    dragEnd() { pan = false; this.stopPour(); },
    stopPour() { if (!pouring) return; pouring = false; ui.pouring = false; onPour(false); },
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
      onSelect(0); // lifted: it is in the hand now, so its card goes with it (Stephen, Sep 20)
      return true;
    },
    carry(x, y) { if (ui.held) { ui.held.x = x; ui.held.y = y; } },
    release(x, y) {
      if (!ui.held) return;
      if (ui.held.item) getSim().command({ t: 'dropItem', item: ui.held.item, x, y });
      else getSim().command({ t: 'drop', h: ui.held.h, x, y });
      ui.held = null;
    },
    cancel() { pan = false; this.stopPour(); },
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
