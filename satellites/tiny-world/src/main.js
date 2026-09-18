// Boot and main loop.
import { loadData } from './data/load.js';
import { initSprites } from './art/sprites.js';
import { createSim } from './sim/sim.js';
import { makeRng } from './sim/rng.js';
import { createRenderer } from './render/render.js';
import { createCamera } from './render/camera.js';
import { initText, str } from './ui/text.js';
import { createStatus } from './ui/status.js';
import { createTray } from './ui/tray.js';
import { createHud } from './ui/hud.js';
import { createActor } from './ui/act.js';
import { attachInput } from './ui/input.js';

// Errors. Nothing the player does may stop the game: every frame, tick, draw and input is guarded. Each
// distinct error is logged to the console once and kept (window.__twErrors, the last 50) for bug reports.
const errors = (window.__twErrors = []), seen = new Set();
function report(where, e) {
  const msg = `${where}: ${(e && (e.stack || e.message)) || e}`;
  if (errors.length === 50) errors.shift();
  errors.push({ where, msg, at: Date.now() });
  if (!seen.has(msg)) { seen.add(msg); console.error('tiny-world ' + msg); }
}
window.addEventListener('error', (ev) => report('page', ev.error || ev.message));
window.addEventListener('unhandledrejection', (ev) => report('promise', ev.reason));

// The game's files: if they cannot be loaded (twice, see load.js), a plain panel with a retry instead of a
// blank page.
let data = null;
try { data = await loadData(); } catch (e) { report('load', e); }
if (!data) {
  document.getElementById('bootfail').classList.add('on');
  document.getElementById('bootRetry').onclick = () => location.reload();
  throw new Error('tiny-world: the game data did not load');
}
initSprites(data.sprites);
initText(data.strings, data.creatures);

const wrap = document.getElementById('wrap'), cv = document.getElementById('c');
const pauseB = document.getElementById('pause'), speedB = document.getElementById('speed'), clearB = document.getElementById('clear');
let sim = null, selected = 0, paused = false, speed = 1; // selected: a creature handle, 0 for none
// A sim step or command that throws may leave the world half-changed, so the world stops (still drawn) and
// the status line offers a new one, instead of the same error every frame.
let broken = false;
function simFailed(where, e) {
  report(where, e);
  if (!broken) { broken = true; status.post(str('ui.oops')); }
}
// Runs a player action on the sim (a tap, a drag, a button) so that its error cannot escape.
const guard = (fn) => (...a) => { if (broken) return; try { fn(...a); } catch (e) { simFailed('input', e); } };

const status = createStatus(() => sim && sim.w);
const tray = createTray({ data, status, getSim: () => sim, guard });
const hud = createHud({ data, status });
const cam = createCamera();
const renderer = createRenderer(cv, { ...data.art, overlays: data.sprites.weaponOverlayPx }, cam);
const rawActor = createActor({ getSim: () => sim, getTool: () => tray.tool, onSelect: (h) => (selected = h) });
const actor = { down: guard(rawActor.down), move: guard(rawActor.move) };
attachInput(cv, actor, () => (sim ? cam : null), () => {});
const zin = document.getElementById('zin'), zout = document.getElementById('zout');
zin.setAttribute('aria-label', str('ui.zoomIn')); zout.setAttribute('aria-label', str('ui.zoomOut'));
zin.onclick = () => cam.step(1); zout.onclick = () => cam.step(-1);

document.getElementById('info').textContent = str('ui.start');
pauseB.textContent = str('ui.pause');
speedB.textContent = str('ui.speed').replace('{n}', speed);
clearB.textContent = str('ui.clear');
pauseB.onclick = () => { paused = !paused; pauseB.textContent = str(paused ? 'ui.play' : 'ui.pause'); };
speedB.onclick = () => { speed = speed === 1 ? 2 : speed === 2 ? 4 : 1; speedB.textContent = str('ui.speed').replace('{n}', speed); };
let clearArm = 0;
clearB.onclick = guard(() => {
  if (Date.now() < clearArm) {
    sim.command({ t: 'clear' });
    selected = 0;
    clearB.textContent = str('ui.clear');
    clearArm = 0;
  } else {
    clearArm = Date.now() + 2500;
    clearB.textContent = str('ui.clearSure');
    setTimeout(() => (clearB.textContent = str('ui.clear')), 2500);
  }
});
tray.build();

// The canvas fills its area at device resolution; the camera decides what of the world it shows.
function sizeCanvas() {
  cam.resize(wrap.clientWidth, wrap.clientHeight, window.devicePixelRatio || 1); // the renderer sizes the canvas each frame
}
// A world of one of the bible's sizes (rules.worldSizes: S 48×64 by default, M, L, XL); `?size=WxH` and
// `?seed=` set them for testing. The start view: the world's width across the phone, centred.
function newWorld(sizeId) {
  const q = new URLSearchParams(location.search), dev = /^(\d+)x(\d+)$/.exec(q.get('size') || '');
  const [cols, rows] = dev && !sizeId ? [+dev[1], +dev[2]] : data.rules.worldSizes[sizeId || data.rules.startSize];
  const sq = q.get('seed');
  const seed = sq !== null && sq !== '' && Number.isFinite(Number(sq)) && !sizeId ? Number(sq) | 0 : (Date.now() ^ Math.floor(performance.now() * 1000)) | 0;
  sim = createSim(data, { cols, rows, seed });
  selected = 0; broken = false; status.post(undefined);
  renderer.resize(sim.w);
  sizeCanvas();
  cam.fitWidth(sim.w.W, sim.w.H);
}
const init = () => newWorld(null);

// The ☰ menu, minimal for now (M1-5): New world, with a size. The full menu sheet is M3.
const sheet = document.getElementById('sheet'), sizesEl = document.getElementById('sizes');
let pick = data.rules.startSize;
document.getElementById('menu').setAttribute('aria-label', str('ui.menu'));
document.getElementById('sheetTitle').textContent = str('world.new');
document.getElementById('sizeLbl').textContent = str('world.size');
document.getElementById('cancelNew').textContent = str('ui.cancel');
document.getElementById('startNew').textContent = str('world.create');
for (const [id, [w, h]] of Object.entries(data.rules.worldSizes)) {
  const b = document.createElement('button');
  b.dataset.size = id;
  b.innerHTML = `${str('world.' + id)}<small>${str('world.tiles').replace('{w}', w).replace('{h}', h)}</small>`;
  b.onclick = () => { pick = id; for (const o of sizesEl.children) o.classList.toggle('on', o === b); };
  sizesEl.appendChild(b);
}
document.getElementById('menu').onclick = () => { for (const o of sizesEl.children) o.classList.toggle('on', o.dataset.size === pick); sheet.classList.add('on'); };
document.getElementById('cancelNew').onclick = () => sheet.classList.remove('on');
document.getElementById('startNew').onclick = () => {
  sheet.classList.remove('on');
  try { newWorld(pick); } catch (e) { simFailed('new world', e); }
};
// The canvas area changes size without a window resize too (the tray lays out after boot): watch the area.
new ResizeObserver(() => { try { if (sim) { sizeCanvas(); cam.update(); } } catch (e) { report('resize', e); } }).observe(wrap);

const fxRng = makeRng(0x7157); // cosmetic stream: rain streaks and screen shake
const rand = () => fxRng.float();
// Fixed-step loop: real time times the speed fills a budget that is spent in whole 50 ms sim steps.
// Speed never changes the step length. A slow frame is caught up (so 1x keeps real time on a slow
// phone, where the prototype slowed down); only a very long gap, such as a hidden tab, is dropped.
const MAX_FRAME_SEC = 0.25, MAX_STEPS_PER_FRAME = 8;
let last = performance.now(), hudT = 0, budget = 0;
function loop(now) {
  requestAnimationFrame(loop); // first, so an error in one frame cannot stop the game
  const dt = Math.max(0, Math.min(MAX_FRAME_SEC, (now - last) / 1000)) || 0;
  last = now;
  if (!sim) return;
  const w = sim.w, step = w.R.tickSec;
  if (!paused && !broken) {
    budget += dt * speed;
    let n = 0;
    try { while (budget >= step && n < MAX_STEPS_PER_FRAME) { sim.tick(); budget -= step; n++; } } catch (e) { simFailed('step', e); }
    if (n === MAX_STEPS_PER_FRAME) budget = Math.min(budget, step);
  }
  try {
    renderer.animate(w, Math.min(dt, 0.05));
    cv.style.transform = w.shake > 0 ? `translate(${(rand() * 6 - 3) | 0}px,${(rand() * 6 - 3) | 0}px)` : '';
    renderer.frame(w, selected, rand, broken ? 1 : budget / step);
  } catch (e) { report('draw', e); }
  hudT -= dt;
  if (hudT <= 0) { hudT = 0.25; try { hud.update(sim, selected); } catch (e) { report('hud', e); } }
}
requestAnimationFrame(() => { try { init(); } catch (e) { simFailed('start', e); } requestAnimationFrame(loop); });

// ?debug exposes the running sim for dev tools (dev/browser-checks.mjs). Nothing reads it otherwise.
if (new URLSearchParams(location.search).has('debug')) window.__tw = { get sim() { return sim; }, get speed() { return speed; }, get paused() { return paused; }, get broken() { return broken; }, errors, cam, renderer };
