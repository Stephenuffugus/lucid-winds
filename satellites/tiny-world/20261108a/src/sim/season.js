// Design 20, THE LIVING YEAR (LIVING-YEAR-BUILD-PLAN.md; bible 01 §1, §11, §15; 07 M4-4): the seasons' turn, the weather's
// spells, and the winter pass (shore ice, settled snow) with its spring thaw. DOM free, clock free, and allocation free in the
// step (a storm spell pushes one cloud, as the Storm power does: minutes apart, never per step). Behind flags.seasons and
// flags.weather, and each world's two switches (w.seasonsOn, w.weatherOn: the parent's, saved with the world, never the page's).
// The sim's own defaults (rules.world.sim, the tools) have both off, so every recorded world is the world it was.
import { setTerrain, isNight, seasonAt, seasonOf, weatherOf, SEASONS, WEATHER, W_CLEAR, W_RAIN, W_STORM, W_SNOW, W_DROUGHT, swimStays, tileOf, log } from './world.js';
import { gatherAny, setPos } from './spatial.js';
import { rnd } from './rng.js';
import { reactClock } from './reactions.js';
import { addFx } from './fx.js';

// --- the season's turn -----------------------------------------------------------------------------------------------
// Called once a step after the clock moved: the season is read from the clock at both ends of the step (as wasNight is), so a
// world saved and loaded on the very step of a turn still has that turn, and the Season power's skip (w.seasonShift) counts in both.
export function seasonTurn(w, dt) {
  if (!(w.R.flags.seasons && w.seasonsOn)) return;
  const was = seasonAt(w, w.time - dt), now = seasonAt(w, w.time);
  if (was !== now) seasonChanged(w, now);
}
// The turn itself: summer and autumn take whatever the winter made and the spring had not yet undone (the thaw never lags a
// whole season), then the clock trigger is raised with the season's name, so rows tell the turn and make its card (reactions.json
// `a: { id: "winter" }`; validate-data RAISED). No plain log here: a line nobody's finger caused reaches her news line only
// through a row's record (ui/because.js), and the row says it once.
export function seasonChanged(w, now) {
  if (now === 1 || now === 2) thawAll(w);
  reactClock(w, SEASONS[now]);
}

// --- what the season and the sky do to the rates (read once a step by update.js) -----------------------------------------------
// The grass's regrowth: by season (01 §11: spring ×2, winter none), ×rainRegrow while it rains (rain regrows three times as fast),
// nothing in a dry spell. flags seasonGrow, rainGrows, weather.
export function growMul(w) {
  const R = w.R, s = seasonOf(w);
  let m = 1;
  if (R.flags.seasonGrow && s >= 0) m *= R.season.regrow[s];
  if (R.flags.rainGrows && w.rainT > 0) m *= R.weather.rainRegrow;
  if (weatherOf(w) === W_DROUGHT) m = 0;
  return m;
}
// What bushes and trees yield: autumn ×2 (01 §11 "autumn plants yield ×2"), winter none, nothing in a dry spell.
export function foodMul(w) {
  const R = w.R, s = seasonOf(w);
  let m = 1;
  if (R.flags.seasonGrow && s >= 0) m *= R.season.food[s];
  if (weatherOf(w) === W_DROUGHT) m = 0;
  return m;
}
// Breeding: spring ×1.5 (01 §11); a cooldown is divided by it. flag seasonBreed.
export function breedMul(w) { const s = seasonOf(w); return w.R.flags.seasonBreed && s >= 0 ? w.R.season.breed[s] : 1; }
// Winter nights are cold everywhere (01 §4, §11 "warmth matters everywhere at night"): hunger rises as on snow. flag seasonCold.
export const coldNight = (w) => !!(w.R.flags.seasonCold && seasonOf(w) === 3 && w.R.season.coldNights && isNight(w));
// Fire spreads twice as fast in a dry spell (01 §11 "drought: fire ×2"). Read by reactions.js fireTick through w.fireM.
export const fireMul = (w) => (weatherOf(w) === W_DROUGHT ? w.R.weather.droughtFire : 1);

// --- the weather's spells ------------------------------------------------------------------------------------------------
// One spell at a time (w.weather, w.weatherT seconds left), the next drawn on the sim's own stream from the season's table when
// one runs out (rules.weather.bySeason; `none` with the seasons off), its length in fractions of a day (rules.weather.days: a day
// is this world's). Rain and storm keep w.rainT alive, so everything that already answers rain (fire, crops, mud, the land's rain
// rules, the `raining` rows, the render's streaks) answers the weather. A storm spell pushes one cloud, the Storm power's kind
// (update.js stormTick drifts it and strikes). Snow and fog and the dry spell are read by name (weatherOf, needsOk `weather`).
export function weatherTick(w, dt) {
  if (!(w.R.flags.weather && w.weatherOn)) return;
  if (w.weatherT > 0) w.weatherT -= dt;
  if (w.weatherT <= 0) nextWeather(w);
  const k = w.weather, hold = w.R.weather.rainHold;
  if ((k === W_RAIN || k === W_STORM) && w.rainT < hold) w.rainT = hold; // (update.js takes dt off it each step)
}
function nextWeather(w) {
  const WR = w.R.weather, s = seasonOf(w), table = WR.bySeason[s < 0 ? 'none' : SEASONS[s]] || WR.bySeason.none;
  let total = 0;
  for (let i = 0; i < WEATHER.length; i++) total += table[WEATHER[i]] || 0;
  let r = w.rng.float() * total, pick = W_CLEAR;
  for (let i = 0; i < WEATHER.length; i++) {
    const wgt = table[WEATHER[i]] || 0;
    if (wgt <= 0) continue;
    if (r < wgt) { pick = i; break; }
    r -= wgt;
  }
  const len = WR.days[WEATHER[pick]], was = w.weather;
  w.weather = pick;
  w.weatherT = rnd(w, len[0], len[1]) * w.daySec;
  if (pick === W_STORM) {
    const P = w.C.P.storm, x = rnd(w, 16, w.W - 16), y = rnd(w, 16, w.H - 16);
    w.storms.push({ x, y, px: x, py: y, t: w.weatherT, next: rnd(w, P.strikeEvery[0], P.strikeEvery[1]), vx: rnd(w, -P.speed, P.speed), vy: rnd(w, -P.speed, P.speed) });
  }
  if (pick !== was) reactClock(w, pick === W_CLEAR ? 'skyClears' : WEATHER[pick]); // the turn of the sky, told by its row (and its card)
}

// --- the winter pass, and the spring thaw --------------------------------------------------------------------------------
// Once every rules.season.passSec seconds of the world's time (a third of a game minute: a snow spell of a few dozen seconds
// must meet a pass), sliced over rules.season.passTicks steps as the land's pass is (land.js). Winter: a water tile (any kind the
// `water` tag names: water, shallows, lily pond, marsh) at the SHORE (a land neighbour) with water still on two sides of it freezes to ice (01 §11 "water edge tiles freeze"; the two
// sides keep a core in every pond, so no pond freezes whole), and whoever swims in it goes to the nearest open water first
// (01 §15), or the tile waits. While it snows, bare ground (rules.season.snowOn) takes snow, in drifts (four times as likely
// beside snow already down). Spring: what the season laid (w.under: the ground it covered, +1) goes back, a few tiles a pass;
// summer takes the rest at once (seasonChanged). The caps are the land's shape: the larger of perPass and tiles over
// perPassArea. Every roll is the tile's own hash with the pass's number, never the random stream, so the pass changes nothing
// else and a saved world's winter is the same winter.
export function seasonTick(w) {
  if (!(w.R.flags.seasons && w.seasonsOn)) return;
  const S = w.R.season, mt = (S.passSec / w.R.tickSec) | 0, m = w.tick % mt, minute = (w.tick / mt) | 0; // (`minute`: which pass, the roll's salt)
  if (m === 0) { w.seasonN = 0; w.snowN = 0; }
  if (m >= S.passTicks) return;
  const s = seasonOf(w);
  if (s !== 0 && s !== 3) return;
  const snowing = s === 3 && weatherOf(w) === W_SNOW, winter = s === 3;
  const rows = w.rows, cols = w.cols, per = ((rows + S.passTicks - 1) / S.passTicks) | 0;
  const r0 = m * per, r1 = r0 + per < rows ? r0 + per : rows, off = minute % rows;
  const area = (w.nTiles / S.perPassArea + 0.5) | 0;
  const capIce = S.perPass > area ? S.perPass : area, capSnow = S.snowPerPass > area ? S.snowPerPass : area, capThaw = S.thawPerPass > area ? S.thawPerPass : area;
  const tid = w.C.tid, terr = w.terr, under = w.under, grid = w.grid, claim = w.claim;
  const winterMin = ((S.days * w.daySec) / 60 + 0.5) | 0; // a winter in game minutes (the land's age is in them, 255 at most)
  for (let rr = r0; rr < r1; rr++) {
    const ty = (off + rr) % rows;
    for (let tx = 0; tx < cols; tx++) {
      const i = ty * cols + tx, t = terr[i];
      if (winter) {
        if (isWater(w, t) && under[i] === 0) { // any water (a pond's rim is lily pads and marsh after a few weeks of the land)
          if (w.seasonN >= capIce || !shore(w, i, tx, ty) || roll(w, i, minute, 1) >= S.freezeChance) continue;
          freeze(w, i, tx, ty);
        } else if (snowing && w.snowOn[t] && !grid[i] && !(claim[i] & 1) && under[i] === 0) {
          if (w.snowN >= capSnow) continue;
          const drift = besideKind(w, tx, ty, tid.snow) ? S.snowDrift : 1;
          if (roll(w, i, minute, 2) >= S.snowChance * drift) continue;
          setTerrain(w, tx, ty, tid.snow); under[i] = t + 1; w.snowN++;
        }
      } else if (under[i] > 0) { // spring: the season's own snow and ice go back
        if (w.seasonN >= capThaw || roll(w, i, minute, 3) >= S.thawChance) continue;
        if (thaw(w, i, tx, ty)) w.seasonN++;
      } else if ((t === tid.snow || t === tid.ice) && !w.hold[i] && w.age[i] < winterMin) { // and the young snow and ice the cold spread by itself
        if (w.seasonN >= capThaw || roll(w, i, minute, 4) >= S.thawChance) continue;
        under[i] = (t === tid.snow ? tid.grass : tid.water) + 1;
        if (thaw(w, i, tx, ty)) w.seasonN++; else under[i] = 0;
      }
    }
  }
}
// A tile's own number for this minute, 0 to 1: the tile, the minute and which question, hashed; never the random stream.
function roll(w, i, minute, q) {
  let h = (Math.imul(i + 1, 2654435761) ^ Math.imul(minute + 1, 40503) ^ Math.imul(q, 97) ^ w.seed) >>> 0;
  h ^= h >>> 15; h = Math.imul(h, 2246822507) >>> 0; h ^= h >>> 13; h = Math.imul(h, 3266489909) >>> 0; h ^= h >>> 16;
  return (h >>> 8) / 16777216;
}
const isWater = (w, t) => ((w.C.tags.terr0[t] & w.water0) | (w.C.tags.terr1[t] & w.water1)) !== 0;
// At the shore: a land neighbour (not water, not ice) on one of its four sides, and on another a water tile that is itself
// off the shore (no land beside it): the pond's core, which never freezes, so a pond keeps its open middle and a pond two tiles
// wide (all shore, no core) never freezes at all.
const landAt = (w, t) => !isWater(w, t) && t !== w.C.tid.ice;
function landBeside(w, i, tx, ty) {
  const cols = w.cols, terr = w.terr;
  return (tx > 0 && landAt(w, terr[i - 1])) || (tx < cols - 1 && landAt(w, terr[i + 1])) || (ty > 0 && landAt(w, terr[i - cols])) || (ty < w.rows - 1 && landAt(w, terr[i + cols]));
}
function coreAt(w, j, tx, ty) { return isWater(w, w.terr[j]) && !landBeside(w, j, tx, ty); }
function shore(w, i, tx, ty) {
  const cols = w.cols, rows = w.rows;
  if (!landBeside(w, i, tx, ty)) return false;
  return (tx > 0 && coreAt(w, i - 1, tx - 1, ty)) || (tx < cols - 1 && coreAt(w, i + 1, tx + 1, ty)) || (ty > 0 && coreAt(w, i - cols, tx, ty - 1)) || (ty < rows - 1 && coreAt(w, i + cols, tx, ty + 1));
}
function besideKind(w, tx, ty, k) {
  const cols = w.cols, i = ty * cols + tx, terr = w.terr;
  return (tx > 0 && terr[i - 1] === k) || (tx < cols - 1 && terr[i + 1] === k) || (ty > 0 && terr[i - cols] === k) || (ty < w.rows - 1 && terr[i + cols] === k);
}
// The shore freezes: whoever swims in the tile goes to the nearest open water it can live in first (01 §15), with a sparkle where
// it went; with none for one of them, the tile waits for another pass. Then the ice, and what it covers remembered.
function freeze(w, i, tx, ty) {
  const T = w.T, E = w.E, S = w.C.S, n = gatherAny(w, tx * T + 4, ty * T + 4, T), near = w.near;
  for (let k = 0; k < n; k++) {
    const e = near[k];
    if (E.dead[e] || E.inside[e] || E.alt[e] > 0 || tileOf(w, e) !== i) continue;
    const sp = S[E.kind[e]];
    if (!sp.water) continue; // (an amphibian stands on the ice as it stands on land)
    const j = openWater(w, e, i);
    if (j < 0) return false;
    const jx = (j % w.cols) * T + 4, jy = ((j / w.cols) | 0) * T + 6;
    setPos(w, e, jx, jy);
    addFx(w, 'magic', jx, jy - 4, w.R.fx.heart);
  }
  const t = w.terr[i];
  setTerrain(w, tx, ty, w.C.tid.ice);
  w.under[i] = t + 1; w.seasonN++;
  return true;
}
// The nearest tile, not `skip`, that this swimmer can live in: rings outward, the nearest by distance (land.js nearestWater's walk).
function openWater(w, e, skip) {
  const E = w.E, T = w.T, sp = w.C.S[E.kind[e]], cols = w.cols, rows = w.rows, cx = ((E.x[e] | 0) / T) | 0, cy = ((E.y[e] | 0) / T) | 0, last = cols > rows ? cols : rows;
  let best = -1, bd = 0x7fffffff;
  for (let ring = 0; ring <= last && ring * ring <= bd; ring++) {
    for (let dy = -ring; dy <= ring; dy++) for (let dx = -ring; dx <= ring; dx += (ring === 0 || dy === -ring || dy === ring) ? 1 : 2 * ring) {
      const x = cx + dx, y = cy + dy;
      if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
      const i = y * cols + x, d = dx * dx + dy * dy;
      if (i === skip || d >= bd || !swimStays(w, sp, i) || w.terr[i] === w.C.tid.ice) continue;
      best = i; bd = d;
    }
  }
  return best;
}
// The season's snow or ice goes back to the ground it covered. Ice with someone standing on it who cannot swim waits (the
// pass asks again next pass); summer's sweep does not wait (a creature over water is snapped to land as it always was).
function thaw(w, i, tx, ty, force) {
  const was = w.under[i] - 1, t = w.terr[i], tid = w.C.tid;
  if (t !== tid.snow && t !== tid.ice) { w.under[i] = 0; return false; } // something else changed it meanwhile: not the season's any more
  if (t === tid.ice && !force) {
    const T = w.T, E = w.E, S = w.C.S, n = gatherAny(w, tx * T + 4, ty * T + 4, T), near = w.near;
    for (let k = 0; k < n; k++) { const e = near[k]; if (!E.dead[e] && !E.inside[e] && !(E.alt[e] > 0) && tileOf(w, e) === i && !S[E.kind[e]].water && !S[E.kind[e]].amph && !S[E.kind[e]].fly) return false; }
  }
  setTerrain(w, tx, ty, was);
  w.under[i] = 0;
  return true;
}
// Summer (or the switch going off): every tile the season still holds goes back at once.
export function thawAll(w) {
  const cols = w.cols;
  for (let i = 0; i < w.nTiles; i++) if (w.under[i] > 0) thaw(w, i, i % cols, (i / cols) | 0, true);
}
