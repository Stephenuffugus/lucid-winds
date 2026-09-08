#!/usr/bin/env node
/* BURROW BOWL, the node replica of the roll and the judge (2026-09-08).
 *
 *   node satellites/burrow-bowl/sim.mjs            the bands at 412 and the proofs
 *   import { outcomeOf, cssToLaunch, CONST } ...  from check.mjs, the seam
 *
 * Pure node, no browser, no lock. It does NOT hand mirror the numbers: every
 * constant and the judge() function are READ OUT OF index.html by name, so the
 * only thing written twice is the integrator itself (stepPhys roll + toFlight,
 * about fifteen lines), and check.mjs compares this file's answers with the
 * browser's for the same launches so a drift in those lines goes red.
 *
 * Why it exists: the Aug 20 "3.53 percent solution space" was measured in
 * LAUNCH units and never converted to what a thumb does in CSS px/s on a
 * phone, and the wall it left at 1860 CSS px/s was under any hard thumb. Every
 * number here is printed in CSS px/s at a named viewport width.
 */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/* comments blanked before any constant is read: the first pass of this file
   read HR=25 out of a PROSE comment ("With HR=25/HSQ=0.6 the pocket...") and
   every corner window it printed was three pixels too tight. Length kept so
   nothing else shifts. */
const SRC = fs.readFileSync(path.join(HERE, 'index.html'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));

/* every constant the roll and the judge use, read by name from the source */
function grabNum(name) {
  const m = SRC.match(new RegExp('(?:^|[\\s,;])' + name + '\\s*=\\s*(-?[0-9.]+)'));
  if (!m) throw new Error('constant ' + name + ' not found in index.html');
  return parseFloat(m[1]);
}
function grabExpr(name, shape) {
  const m = SRC.match(new RegExp('(?:^|[\\s,;])' + name + '\\s*=\\s*(' + shape + ')'));
  if (!m) throw new Error('constant ' + name + ' not found in index.html');
  return vm.runInNewContext('(' + m[1] + ')');
}
export const CONST = {
  RACK_Y: grabNum('RACK_Y'), RAMP_LIP: grabNum('RAMP_LIP'), LANE_BOT: grabNum('LANE_BOT'), LANE_TOP: grabNum('LANE_TOP'),
  FRICT: grabNum('FRICT'), VY_MIN: grabNum('VY_MIN'), VY_MAX: grabNum('VY_MAX'), VXW_MAX: grabNum('VXW_MAX'),
  RS_MIN: grabNum('RS_MIN'), RS_MAX: grabNum('RS_MAX'), DY0: grabNum('DY0'), DY1: grabNum('DY1'),
  BOARD_F: grabNum('BOARD_F'), SQ: grabNum('SQ'), HSQ: grabNum('HSQ'), HR: grabNum('HR'),
  RINGC: grabExpr('RINGC', '\\{[^}]*\\}'), RINGS: grabExpr('RINGS', '\\[\\[[\\s\\S]*?\\]\\]'), H100: grabExpr('H100', '\\[\\{[\\s\\S]*?\\}\\]'),
  READ_MS: grabNum('READ_MS'),
  /* the two launch scales in fup(): launch(-vy*A, vx*B) */
  A: (() => { const m = SRC.match(/launch\(-vy\*([0-9.]+),\s*vx\*([0-9.]+)\)/); if (!m) throw new Error('launch scale not found'); return parseFloat(m[1]); })(),
  B: (() => { const m = SRC.match(/launch\(-vy\*([0-9.]+),\s*vx\*([0-9.]+)\)/); return parseFloat(m[2]); })(),
  H: 1 / 240
};

/* the judge itself, lifted whole */
const judgeSrc = (() => { const m = SRC.match(/function judge\(sx,sy\)\{[\s\S]*?\n\}/); if (!m) throw new Error('judge() not found'); return m[0]; })();
const ctx = { Math };
Object.assign(ctx, CONST);
vm.runInNewContext(judgeSrc + '; this.judge = judge;', ctx);
export const judge = ctx.judge;

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

/* launch(): the vector clamp, then the component clamps */
export function launchOf(vy, vxW) {
  if (vy > CONST.VY_MAX) { vxW *= CONST.VY_MAX / vy; vy = CONST.VY_MAX; }
  return { vy: clamp(vy, CONST.VY_MIN, CONST.VY_MAX), vxW: clamp(vxW, -CONST.VXW_MAX, CONST.VXW_MAX) };
}

/* stepPhys roll + toFlight, mirrored. wind and wax are the free lane's (0, 1). */
export function outcomeOf(vy0, vxW0, wind = 0, wax = 1) {
  const C = CONST, h = C.H;
  const L = launchOf(vy0, vxW0);
  let vy = L.vy, vxW = L.vxW, by = C.RACK_Y, worldX = 0;
  for (let n = 0; n < 100000; n++) {
    vy -= C.FRICT * wax * h;
    if (vy <= 0) return { kind: 'rollback', pts: null, vy: L.vy, vxW: L.vxW };
    by -= vy * h;
    worldX += vxW * h;
    if (Math.abs(worldX) > 150) return { kind: 'gutterLane', pts: 0, vy: L.vy, vxW: L.vxW };
    if (by <= C.RAMP_LIP) break;
  }
  const rs = vy;
  const df = clamp((rs - C.RS_MIN) / (C.RS_MAX - C.RS_MIN), 0, 1);
  const T = 0.5 + 0.34 * df;
  const wxl = worldX + vxW * 0.55 * T + 0.5 * wind * T * T;
  const landY = C.DY0 - (C.DY0 - C.DY1) * df;
  let landSX = 270 + wxl * C.BOARD_F;
  let out;
  if (Math.abs(wxl) > 170) { out = { kind: 'gutterAir', pts: 0 }; landSX = clamp(landSX, 54, 486); }
  else out = judge(landSX, landY);
  return Object.assign({ rs, df, landX: landSX, landY, vy: L.vy, vxW: L.vxW }, out);
}

/* a thumb: speed in CSS px/s and an angle off straight up, on a viewport where
   the 540 wide stage is drawn `cssW` CSS px wide. stagePt scales by 540/cssW. */
export function cssToLaunch(cssSpeed, deg, cssW = 412) {
  const k = 540 / cssW;
  const vyCss = cssSpeed * Math.cos(deg * Math.PI / 180), vxCss = cssSpeed * Math.sin(deg * Math.PI / 180);
  return { vy: vyCss * k * CONST.A, vxW: vxCss * k * CONST.B };
}
export function thumb(cssSpeed, deg, cssW = 412, wind = 0, wax = 1) {
  const L = cssToLaunch(cssSpeed, deg, cssW);
  return outcomeOf(L.vy, L.vxW, wind, wax);
}

/* the straight bands in CSS px/s at a width: scan and print the runs */
export function bands(cssW = 412, step = 1) {
  const runs = [];
  let prev = null;
  for (let v = 100; v <= 6000; v += step) {
    const o = thumb(v, 0, cssW);
    const label = o.kind === 'rollback' ? 'rollback' : o.kind === 'sink' ? ('ring ' + o.pts) : o.kind === 'tray' ? (o.landY > CONST.RINGC.y ? 'tray 10 (short)' : 'back band 10') : o.kind;
    if (label !== prev) { runs.push({ from: v, label }); prev = label; }
  }
  for (let i = 0; i < runs.length; i++) runs[i].to = i + 1 < runs.length ? runs[i + 1].from - step : Infinity;
  return runs;
}

/* the corner window: for a speed, which angles sink a 100 */
export function cornerAngles(cssSpeed, cssW = 412) {
  const hit = [];
  for (let d = 0; d <= 40; d += 0.25) { const o = thumb(cssSpeed, d, cssW); if (o.kind === 'sink' && o.pts === 100) hit.push(d); }
  return hit.length ? { lo: hit[0], hi: hit[hit.length - 1], n: hit.length } : null;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const W = parseInt(process.argv[2] || '412', 10);
  console.log('BURROW BOWL replica, constants read from index.html; VY_MAX ' + CONST.VY_MAX + ', READ_MS ' + CONST.READ_MS + ', launch scale ' + CONST.A + '/' + CONST.B);
  console.log('\nstraight bands at ' + W + ' CSS px wide (1 CSS px = ' + (540 / W).toFixed(3) + ' stage px):');
  for (const r of bands(W)) console.log('  ' + String(r.from).padStart(5) + ' to ' + (r.to === Infinity ? 'clamp+' : String(r.to)).padStart(6) + '  ' + r.label);
  console.log('\nthe corner 100 by speed (angles off straight that sink, either side):');
  for (const v of [1500, 1600, 1700, 1800, 2000, 2500, 3000, 4000, 5000]) {
    const c = cornerAngles(v, W);
    console.log('  ' + String(v).padStart(5) + ' px/s  ' + (c ? (c.lo + ' to ' + c.hi + ' deg') : 'no angle sinks'));
  }
  console.log('\nproofs:');
  for (const v of [2000, 3000, 5000]) { const o = thumb(v, 0, W); console.log('  straight ' + v + ': ' + o.kind + ' ' + o.pts + '  (landY ' + o.landY.toFixed(0) + ', rs ' + o.rs.toFixed(0) + ')'); }
  for (const v of [2000, 2500, 3000]) for (const d of [12, 15, 18, 20]) { const o = thumb(v, d, W); console.log('  ' + v + ' at ' + d + ' deg: ' + o.kind + ' ' + o.pts + '  (x ' + o.landX.toFixed(0) + ', y ' + o.landY.toFixed(0) + ')'); }
  const s = outcomeOf(2050, 0); console.log('  scripted BB.flick(2050,0): ' + s.kind + ' ' + s.pts);
  const g = outcomeOf(1080, 0); console.log('  scripted BB.flick(1080,0): ' + g.kind + ' ' + g.pts);
}
