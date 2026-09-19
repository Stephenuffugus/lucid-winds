// Player powers. Numbers live in powers.json.
import { rnd } from './rng.js';
import { hyp } from './math.js';
import { log, ref, inB, flies, removeStruct, removeStructs, setTerrain, markDirty, full } from './world.js';
import { spawn } from './ents.js';
import { nearPoint } from './query.js';
import { die, isFoe } from './combat.js';
import { addFx } from './fx.js';

// Fireball and meteor: burn or crater the tiles in radius, hurt everything in it.
function blast(w, x, y, r, dmg, cause, crater) {
  const T = w.T, tid = w.C.tid, B = w.R.blast;
  addFx(w, 'boom', x, y, w.R.fx.boom).r = r;
  if (crater) w.shake = w.C.P.meteor.shake;
  const cx = Math.floor(x / T), cy = Math.floor(y / T), tr = Math.ceil(r / T);
  for (let ty = cy - tr; ty <= cy + tr; ty++) for (let tx = cx - tr; tx <= cx + tr; tx++) {
    if (!inB(w, tx, ty) || hyp(tx - cx, ty - cy) > r / T) continue;
    const i = ty * w.cols + tx, st = w.grid[i];
    if (st && (crater || st.def.food || B.burns.includes(st.type) || (st.def.home && !B.sturdyHomes.includes(st.type)))) removeStruct(w, tx, ty);
    if (crater && w.terr[i] !== tid.water && w.terr[i] !== tid.lava) setTerrain(w, tx, ty, tid.dirt);
  }
  const E = w.E;
  for (let k = 0; k < w.count; k++) {
    const e = w.order[k];
    if (!(!E.inside[e] && !(E.bless[e] > 0) && hyp(E.x[e] - x, E.y[e] - 4 - y) < r)) continue;
    E.hp[e] -= dmg; E.flash[e] = w.R.fx.powerFlash;
    if (E.hp[e] <= 0) die(w, e, cause);
  }
}

// Powers aimed at a point (tap) or at the creature nearest the point (target).
export function usePower(w, id, x, y) {
  const P = w.C.P[id], T = w.T, F = w.R.fx, E = w.E;
  const tx = Math.floor(x / T), ty = Math.floor(y / T);
  if (!inB(w, tx, ty)) return;
  if (id === 'bolt') {
    addFx(w, 'bolt', Math.round(x), Math.round(y), F.bolt);
    const s = w.grid[ty * w.cols + tx];
    if (s && !s.def.home && !P.spares.includes(s.type)) removeStruct(w, tx, ty);
    for (let k = 0; k < w.count; k++) {
      const e = w.order[k];
      if (!(!E.inside[e] && hyp(E.x[e] - x, E.y[e] - 4 - y) < P.radius)) continue;
      E.hp[e] -= P.dmg; E.flash[e] = F.powerFlash;
      if (E.hp[e] <= 0) die(w, e, 'lightning');
    }
  } else if (id === 'bless') {
    const e = nearPoint(w, x, y, P.radius);
    if (e >= 0) { E.bless[e] = P.sec; log(w, 'log.blessed', { a: ref(w, e) }); }
  } else if (id === 'clone') {
    const e = nearPoint(w, x, y, P.radius);
    if (e >= 0 && !full(w)) {
      const c = spawn(w, E.kind[e], Math.min(w.W - 2, E.x[e] + P.offset), E.y[e]); // at the right edge, not past it
      E.gear[c] = { ...E.gear[e] };
      if (E.over[e]) E.over[c] = E.over[e];
      E.hunger[c] = E.hunger[e];
      log(w, 'log.cloned', { a: ref(w, e) });
    }
  } else if (id === 'love') {
    for (let k = 0; k < w.count; k++) {
      const e = w.order[k];
      if (!(hyp(E.x[e] - x, E.y[e] - y) < P.radius)) continue;
      E.breedCd[e] = 0; E.hunger[e] = 0; E.baby[e] = false;
      addFx(w, 'heart', E.x[e], E.y[e] - 10, F.heart);
    }
  } else if (id === 'freeze') {
    const f = addFx(w, 'boom', x, y, F.boom); f.r = P.radius; f.col = P.fxColor;
    for (let k = 0; k < w.count; k++) { const e = w.order[k]; if (hyp(E.x[e] - x, E.y[e] - y) < P.radius) E.frozen[e] = P.sec; }
  } else if (id === 'fireball') blast(w, x, y, P.radius, P.dmg, 'fireball', false);
  else if (id === 'meteor') blast(w, x, y, P.radius, P.dmg, 'meteor', true);
  else if (id === 'twister') w.twisters.push({ x, y, px: x, py: y, t: P.sec, vx: rnd(w, -P.speed, P.speed), vy: rnd(w, -P.speed, P.speed) });
  else if (id === 'heal') {
    const e = nearPoint(w, x, y, P.radius);
    if (e >= 0) {
      E.hp[e] = w.C.S[E.kind[e]].hp; E.hunger[e] = 0;
      addFx(w, 'heart', E.x[e], E.y[e] - 10, F.heart);
      log(w, 'log.healed', { a: ref(w, e) });
    }
  }
}

// Powers that act on the whole world the moment they are tapped in the tray.
export function useInstant(w, id) {
  const P = w.C.P[id], S = w.C.S, E = w.E;
  if (id === 'rain') {
    w.rainT = P.sec;
    for (let i = 0; i < w.eaten.length; i++) if (w.eaten[i] > 0) { w.eaten[i] = 0; markDirty(w, i); }
    w.eatenN = 0; w.eatenIn.fill(0); // nothing is regrowing any more
    for (const st of w.structs) st.food = w.R.food.max;
    log(w, 'log.rain');
  } else if (id === 'quake') {
    w.shake = P.shake;
    // Which things fall: the same draws in the same order as removing them one by one, then all removed at once
    // (one at a time, each removal searched the list of things: a map full of walls took seconds).
    const gone = [];
    for (const st of w.structs) if (P.topple.includes(st.type) && w.rng.float() < P.toppleChance) gone.push(st);
    removeStructs(w, gone);
    const n = gone.length;
    for (let k = 0; k < w.count; k++) {
      const e = w.order[k];
      if (!(!flies(w, e) && !E.inside[e] && !(E.bless[e] > 0))) continue;
      E.hp[e] -= P.dmg; E.flash[e] = w.R.fx.powerFlash;
      if (E.hp[e] <= 0) die(w, e, 'quake');
    }
    log(w, 'log.quake', { n });
  } else if (id === 'smite') {
    let n = 0;
    for (let k = 0; k < w.count; k++) {
      const e = w.order[k];
      if (!isFoe(w, e)) continue;
      addFx(w, 'bolt', Math.round(E.x[e]), Math.round(E.y[e]), w.R.fx.bolt);
      die(w, e, 'smitten');
      n++;
    }
    if (n) log(w, 'log.smite', { n }); else log(w, 'log.smiteNone');
  } else if (id === 'time') {
    const D = w.R.daySec, d = (w.time % D) / D;
    w.time += ((d < w.R.nightFrac ? P.nightAt : P.dawnAt) - d) * D;
    log(w, d < w.R.nightFrac ? 'log.nightFalls' : 'log.sunUp');
  } else if (id === 'feast') {
    for (let k = 0; k < w.count; k++) { const e = w.order[k]; E.hunger[e] = 0; E.hp[e] = S[E.kind[e]].hp; }
    log(w, 'log.feast');
  }
}
