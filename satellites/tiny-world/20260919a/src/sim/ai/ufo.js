// UFO abduction and parachute return (keep exactly). Creatures are slots.
import { pick2 } from '../rng.js';
import { hyp, clamp } from '../math.js';
import { log, ref, structAt, pass } from '../world.js';
import { nearest } from '../query.js';
import { fHumanGrounded } from './decide.js';
import { addFx } from '../fx.js';
import { setPos } from '../spatial.js';

// Eject a carried creature with a parachute.
export function drop(w, o, x, y) {
  const E = w.E;
  E.inside[o] = 0; setPos(w, o, x, y); E.alt[o] = w.R.ufo.chuteAlt; E.chute[o] = true; E.goalKind[o] = 0; E.think[o] = 0;
  addFx(w, 'beam', x, y, w.R.fx.beamDrop);
  log(w, 'log.parachute', { a: ref(w, o) });
}

// Touchdown: a tower perch, one bounce off a human's head, or a snap to dry land within reach.
export function land(w, e) {
  const U = w.R.ufo, T = w.T, E = w.E;
  E.chute[e] = false;
  const st = structAt(w, E.x[e], E.y[e]);
  if (st && st.def.shoot && E.kind[e] === 'human') {
    E.perch[e] = st.h; E.perchT[e] = U.perchSec; setPos(w, e, st.tx * T + 4, st.ty * T + 6);
    log(w, 'log.perch', { a: ref(w, e) });
    return;
  }
  const o = nearest(w, e, U.bounceScan, fHumanGrounded);
  if (o >= 0 && !E.bounced[e]) {
    E.bounced[e] = 1; E.alt[e] = U.bounceAlt; setPos(w, e, clamp(3, w.W - 3, E.x[e] + pick2(w, -U.bounceShift, U.bounceShift)), E.y[e]); E.flash[o] = w.R.combat.hitFlash;
    log(w, 'log.bounce', { a: ref(w, e), b: ref(w, o) });
    return;
  }
  E.bounced[e] = 0;
  if (!pass(w, e, E.x[e], E.y[e])) {
    const cx = Math.floor(E.x[e] / T), cy = Math.floor(E.y[e] / T), n = U.snapTiles;
    let bx = 0, by = 0, bd = 1e9;
    for (let y = cy - n; y <= cy + n; y++) for (let x = cx - n; x <= cx + n; x++) {
      const d = hyp(x - cx, y - cy);
      if (d < bd && pass(w, e, x * T + 4, y * T + 5)) { bd = d; bx = x; by = y; }
    }
    if (bd < 1e9) setPos(w, e, bx * T + 4, by * T + 5);
  }
}
