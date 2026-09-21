// Player powers. Numbers live in powers.json.
import { rnd } from './rng.js';
import { hyp, dsin } from './math.js';
import { log, ref, inB, flies, removeStruct, removeStructs, setTerrain, markDirty, full, struct, placeStruct, isNight } from './world.js';
const EMPTY_TAGS = [];
import { spawn, goalMove } from './ents.js';
import { nearPoint } from './query.js';
import { die, isFoe } from './combat.js';
import { addFx } from './fx.js';
import { allowed, SRC } from './harm.js';
import { emit, EVI, POWER_EV } from './events.js';
import { reactPower, reactPlaced } from './reactions.js';

// A thing the WORLD puts down (a crystal Bless grows, what a seed comes up as) meets what is round it exactly as
// one the child puts down does. Before this the shiniest thing in the game appeared beside a crow and the crow
// never looked up, because only the child's own hands raised `placed`.
function grown(w, type, tx, ty) {
  placeStruct(w, type, tx, ty);
  const s = inB(w, tx, ty) ? w.grid[ty * w.cols + tx] : null;
  if (s && s.type === type && w.R.flags.handsRaise) reactPlaced(w, s);
  return s;
}

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
    E.hp[e] -= allowed(w, e, SRC.power, dmg); E.flash[e] = w.R.fx.powerFlash; // first-world humans keep 1 hp (harm.js)
    if (E.hp[e] <= 0) die(w, e, cause);
  }
}

// Powers aimed at a point (tap) or at the creature nearest the point (target).
export function usePower(w, id, x, y) {
  const P = w.C.P[id], T = w.T, F = w.R.fx, E = w.E;
  const tx = Math.floor(x / T), ty = Math.floor(y / T);
  if (!inB(w, tx, ty)) return;
  powerReact(w, id, x, y); // design 14 §5: what the power met, before it acts (lightning finds the pond it landed in)
  if (POWER_EV[id]) emit(w, EVI[POWER_EV[id]], x, y, P.radius); // (every aimed power has a radius: validate-data)
  if (id === 'bolt') {
    addFx(w, 'bolt', Math.round(x), Math.round(y), F.bolt);
    const s = w.grid[ty * w.cols + tx];
    if (s && !s.def.home && !P.spares.includes(s.type)) removeStruct(w, tx, ty);
    for (let k = 0; k < w.count; k++) {
      const e = w.order[k];
      if (!(!E.inside[e] && hyp(E.x[e] - x, E.y[e] - 4 - y) < P.radius)) continue;
      E.hp[e] -= allowed(w, e, SRC.power, P.dmg); E.flash[e] = F.powerFlash;
      if (E.hp[e] <= 0) die(w, e, 'lightning');
    }
  } else if (id === 'bless') {
    // Design 15 C2: Bless is the life power. On a creature it protects, as it always has; on the ground it makes
    // something grow — a crystal out of rock, meadow out of ash or bare dirt, and a field one stage on.
    const e = nearPoint(w, x, y, P.radius);
    if (e >= 0) { E.bless[e] = P.sec; log(w, 'log.blessed', { a: ref(w, e) }); }
    else if (w.R.flags.blessGrows) {
      const tid = w.C.tid, i = ty * w.cols + tx, t = w.terr[i], def = w.C.TERR[t];
      if (t === tid.rock && !w.grid[i]) { addFx(w, 'block', x, y, F.block); log(w, 'log.crystal'); grown(w, 'crystal', tx, ty); }
      else if (def.growsTo !== undefined) { setTerrain(w, tx, ty, w.C.tid[def.growsTo]); addFx(w, 'block', x, y, F.block); log(w, 'log.grew'); }
      else if (t === tid.ash || t === tid.dirt || t === tid.grass) {
        const r = w.R.bless.meadow;
        let n = 0;
        for (let yy = ty - r; yy <= ty + r; yy++) for (let xx = tx - r; xx <= tx + r; xx++) {
          if (!inB(w, xx, yy)) continue;
          const j = yy * w.cols + xx, tj = w.terr[j];
          if (tj !== tid.ash && tj !== tid.dirt && tj !== tid.grass) continue;
          setTerrain(w, xx, yy, tid.meadow); n++;
        }
        if (n) { addFx(w, 'block', x, y, F.block); log(w, 'log.grew'); }
      }
    }
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
  } else if (id === 'sunbeam') {
    // Design 15 C2: a patch of sunshine. It melts, it dries, it grows, it wakes, and at night it is no friend
    // of the undead. Everything it does happens at once; the warm circle is what the child sees.
    const tid = w.C.tid, r = P.radius, cx = x, cy = y;
    for (let i = 0; i < w.nTiles; i++) {
      const tx2 = (i % w.cols) * T + 4, ty2 = ((i / w.cols) | 0) * T + 4;
      const dx = tx2 - cx, dy = ty2 - cy;
      if (dx * dx + dy * dy > r * r) continue;
      const t = w.terr[i], def = w.C.TERR[t];
      if (t === tid.snow) setTerrain(w, i % w.cols, (i / w.cols) | 0, tid.dirt);
      else if (t === tid.ice) setTerrain(w, i % w.cols, (i / w.cols) | 0, tid.water);
      else if (t === tid.mud) setTerrain(w, i % w.cols, (i / w.cols) | 0, tid.dirt);
      else if (def.growsTo !== undefined) setTerrain(w, i % w.cols, (i / w.cols) | 0, w.C.tid[def.growsTo]);
      else if (t === tid.grass) setTerrain(w, i % w.cols, (i / w.cols) | 0, tid.meadow);
    }
    for (let k = 0; k < w.count; k++) {
      const e = w.order[k];
      if (hyp(E.x[e] - x, E.y[e] - 4 - y) >= r) continue;
      if (E.inside[e] > 0) { const h = struct(w, E.inside[e]); if (h) h.occ--; E.inside[e] = 0; E.think[e] = 0; } // woken
      const sp = w.C.S[E.kind[e]];
      if ((sp.tags || EMPTY_TAGS).indexOf('undead') >= 0 && isNight(w)) { E.frozen[e] = P.stunSec; addFx(w, 'block', E.x[e], E.y[e] - 6, F.block); }
      else if (E.kind[e] === 'cat') { goalMove(w, e, x, y, 0); E.think[e] = P.sec; addFx(w, 'heart', E.x[e], E.y[e] - 8, F.healHeart); }
    }
    const f = addFx(w, 'boom', x, y, P.sec);
    f.r = r; f.col = w.C.P.sunbeam.fxColor || '#f6e7a8';
    log(w, 'log.sunbeam');
  } else if (id === 'seeds') {
    // Design 15 C2: a handful of seeds. What each one becomes is decided by the ground it lands on, so the
    // child chooses the crop by choosing where to throw them.
    const S = w.R.seeds;
    let grew = 0;
    for (let n = 0; n < P.count; n++) {
      // Round the circle, not in a square: the same two draws every time, and dsin for both (the sim never
      // calls Math.sin, whose last bit is not specified).
      const a = w.rng.float() * 6.283185307179586, d = Math.sqrt(w.rng.float()) * P.radius;
      const sx = Math.floor((x + dsin(a + 1.5707963267948966) * d) / T), sy = Math.floor((y + dsin(a) * d) / T);
      if (!inB(w, sx, sy)) continue;
      const i = sy * w.cols + sx;
      if (w.grid[i]) continue; // something is there already
      const ground = w.C.TERR[w.terr[i]].id, what = (w.R.flags.content17 && S.v17 && S.v17[ground]) || S[ground]; // (design 17: mushrooms come up too)
      if (!what) continue;
      if (what === 'meadow' || what === 'crops') { setTerrain(w, sx, sy, w.C.tid[what]); grew++; continue; }
      const pick = Array.isArray(what) ? what[Math.floor(w.rng.float() * what.length)] : what;
      grown(w, pick, sx, sy);
      grew++;
    }
    if (grew) log(w, 'log.seeds', { n: grew });
  } else if (id === 'storm') {
    // Design 15 C2: a cloud that drifts and strikes. It is a world feature with a life of its own (update.js
    // stormTick), not a thing that happens at the moment of the tap.
    w.storms.push({ x, y, px: x, py: y, t: P.sec, next: rnd(w, P.strikeEvery[0], P.strikeEvery[1]),
      vx: rnd(w, -P.speed, P.speed), vy: rnd(w, -P.speed, P.speed) });
    w.rainT = Math.max(w.rainT, P.sec);
    log(w, 'log.storm');
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

// A number between 0 and 1 for a tile, the same every time for the same tile in the same world: the sim's own
// hash of the tile index, not its random stream, so asking does not change what happens next (design 15 C1).
function tileFrac(w, i) {
  let h = (i * 2654435761 + w.seed * 40503) >>> 0;
  h ^= h >>> 15; h = Math.imul(h, 2246822507) >>> 0; h ^= h >>> 13;
  return (h >>> 8) / 16777216;
}

// Powers that act on the whole world the moment they are tapped in the tray.
export function useInstant(w, id) {
  const P = w.C.P[id], S = w.C.S, E = w.E;
  reactPower(w, id, w.W / 2, w.H / 2); // design 15 A6: rain is a power too, and rows may answer it
  if (POWER_EV[id]) emit(w, EVI[POWER_EV[id]], -1, -1, 0);
  if (id === 'rain') {
    w.rainT = P.sec;
    for (let i = 0; i < w.eaten.length; i++) if (w.eaten[i] > 0) { w.eaten[i] = 0; markDirty(w, i); }
    w.eatenN = 0; w.eatenIn.fill(0); // nothing is regrowing any more
    for (const st of w.structs) st.food = w.R.food.max;
    log(w, 'log.rain');
    // Design 15 C1: rain on ash sprouts it at once — the burnt ground does not wait its forty-five seconds,
    // it flowers under the shower. (Not a reaction row: only one row answers a power, and the lava rows are
    // already there. Rain has always had effects of its own, like putting fires out.)
    // Design 15 C1: rain leaves mud on about two fifths of the bare ground under it, always the same patches
    // for the same tiles (the tile's own hash decides, so a world muddies the same way twice), and it dries
    // again after rules.mud.drySec.
    if (w.R.flags.mud) {
      const M = w.R.mud, dirt = w.C.tid.dirt, mud = w.C.tid.mud;
      let made = 0;
      for (let i = 0; i < w.nTiles; i++) {
        if (w.terr[i] !== dirt || tileFrac(w, i) >= M.mudFrac) continue;
        setTerrain(w, i % w.cols, (i / w.cols) | 0, mud);
        w.tmr.push({ i, t: M.drySec, to: dirt });
        made++;
      }
      if (made) log(w, 'log.mud', { n: made });
    }
    // Design 15 C1: and it stands in puddles on the hard ground (rock and path), which are shallows for a while.
    if (w.R.flags.shallows) {
      const M = w.R.mud, rock = w.C.tid.rock, path = w.C.tid.path, shallows = w.C.tid.shallows;
      let pools = 0;
      for (let i = 0; i < w.nTiles; i++) {
        const t = w.terr[i];
        if ((t !== rock && t !== path) || tileFrac(w, i + 7919) >= M.puddleFrac) continue;
        setTerrain(w, i % w.cols, (i / w.cols) | 0, shallows);
        w.tmr.push({ i, t: M.puddleSec, to: t });
        pools++;
      }
      if (pools) log(w, 'log.puddles', { n: pools });
    }
    if (w.R.flags.ash) {
      const ash = w.C.tid.ash, meadow = w.C.tid.meadow;
      let sprouted = 0;
      for (let i = 0; i < w.nTiles; i++) if (w.terr[i] === ash) { setTerrain(w, i % w.cols, (i / w.cols) | 0, meadow); sprouted++; }
      for (let k = w.tmr.length - 1; k >= 0; k--) if (w.tmr[k].to === meadow) w.tmr.splice(k, 1); // their timers are spent
      if (sprouted) log(w, 'log.ashBloom', { n: sprouted });
    }
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
      E.hp[e] -= allowed(w, e, SRC.power, P.dmg); E.flash[e] = w.R.fx.powerFlash;
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
    const D = w.daySec, d = (w.time % D) / D;
    w.time += ((d < w.R.nightFrac ? P.nightAt : P.dawnAt) - d) * D;
    log(w, d < w.R.nightFrac ? 'log.nightFalls' : 'log.sunUp');
  } else if (id === 'feast') {
    for (let k = 0; k < w.count; k++) { const e = w.order[k]; E.hunger[e] = 0; E.hp[e] = S[E.kind[e]].hp; }
    log(w, 'log.feast');
  }
}

// The power trigger (14 §5). The reaction runs before the power's own damage, so a row that stuns the pond's
// swimmers has them floating when the bolt's own damage arrives, and a row that puts a fire out wins over it.
function powerReact(w, id, x, y) { reactPower(w, id, x, y); }
