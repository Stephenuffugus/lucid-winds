// Boot and main loop.
import { loadData } from './data/load.js';
import { initSprites, url } from './art/sprites.js';
import { createSim } from './sim/sim.js';
import { whoToGreet } from './ui/welcome.js'; // design 18 A16: she is welcomed back
import { newFind, findPlace, goFind, stepFind, edgeArrow } from './ui/find.js'; // design 19 A6: find the one she named
import { makeRng } from './sim/rng.js';
import { createRenderer } from './render/render.js';
import { createCamera } from './render/camera.js';
import { initText, str, fill } from './ui/text.js';
import { createStatus } from './ui/status.js';
import { createNews } from './ui/news.js';
import { createTray } from './ui/tray.js';
import { createPi } from './ui/pi.js'; // the Pi Network rail (petri.lucidwinds.com): a taster tray and one unlock; nothing on any other host
import { createHud } from './ui/hud.js';
import { createActor } from './ui/act.js';
import { attachInput } from './ui/input.js';
import { createGestures, canSpray, modeOf } from './ui/gesture.js';
import { createBecause } from './ui/because.js';
import { createDoll, moveWords } from './ui/doll.js';
import { createScrap } from './ui/scrap.js';
import { createCounts } from './ui/counts.js';
import { createAudio } from './audio/audio.js';
import { buildStarter, starterUfo, ufoSeen } from './ui/starter.js';
import { HELD, ent } from './sim/ents.js';
import { openStore, newWorldId, fileBlob, fileText, askToKeep } from './ui/store.js';
import { unpackFile, createSeen } from './ui/cards.js'; // his cards (2 Oct 2026): a world's file carries her cards (scrap.toFile, scrap.openFile)
import { createSaver, thumbOf } from './ui/saver.js';
import { migrate, fromText, toText } from './sim/save.js';
import { moveRefusal } from './sim/commands.js'; // (his note, 4 Oct 2026: Move on the card, and the tap that says where)

// Every module has loaded and linked by the time this runs: the boot watchdog in index.html stands down.
window.__twStarted = true;
document.getElementById('bootfail').classList.remove('on'); // shown too early on a slow line: the game did load

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

const wrap = document.getElementById('wrap'), cv = document.getElementById('c'), infoEl = document.getElementById('info');
// A click listener makes the field a tap target of its own. Without one, Chrome moves a tap that lands on the
// field just under a header button onto that button (touch adjustment): New world or Clear from a tap on the grass.
cv.addEventListener('click', () => {});
const pauseB = document.getElementById('pause'), speedB = document.getElementById('speed');
let sim = null, selected = 0, paused = false, speed = 1; // selected: a creature handle, 0 for none
// A sim step or command that throws may leave the world half-changed, so the world stops (still drawn) and
// the status line offers a new one, instead of the same error every frame.
let broken = false;
function simFailed(where, e) {
  report(where, e);
  if (!broken) { broken = true; selected = 0; status.post(str('ui.oops')); news.pin(str('ui.oops')); }
}
// Runs a player action on the sim (a tap, a drag, a button) so that its error cannot escape.
const guard = (fn) => (...a) => { if (broken) return; try { fn(...a); } catch (e) { simFailed('input', e); } };

// The words at the bottom (15 A3): the style is per device, and reduced motion forces the still one.
let newsStyle = 'ticker';
try { newsStyle = localStorage.getItem('tw_news') === 'lines' ? 'lines' : 'ticker'; } catch (e) { /* no storage */ }
const news = createNews({ data, mode: newsStyle });
const status = createStatus(() => sim && sim.w, news);
// The Pi rail is the HOSTNAME's; on lucidwinds.com (and so in the Play app) it is off and every tile is free as ever.
let pi = null, piStorage = null;
try { piStorage = localStorage; } catch (e) { piStorage = null; }
pi = createPi({ data, str, hostname: location.hostname, params: new URLSearchParams(location.search), storage: piStorage, say: (t) => status.post(t), onChange: () => { if (tray) tray.build(); } });
const tray = createTray({ data, status, getSim: () => sim, guard, locked: (c, i) => pi.locked(c, i), onLocked: () => pi.ask('tray'), onTool: () => { showSpray(); if (moving && tray.tool.cat !== 'hand') stopMove(); } }); // (a tool taken up ends a Move)
const hud = createHud({ data, status, news });
const cam = createCamera();
const renderer = createRenderer(cv, { ...data.art, overlays: data.sprites.weaponOverlayPx, gearById: Object.fromEntries(data.gear.map((g) => [g.id, g])) }, cam);
// Sound (14 §7 T6, src/audio): silent until the first touch anywhere.
const audio = createAudio(data);
// pointerdown wakes the context; pointerup and click are the gestures a phone lets a song start on (9 Oct 2026)
for (const ev of ['pointerdown', 'pointerup', 'click']) document.addEventListener(ev, () => audio.unlock(), true);
// The game's own commands (H2 review round, 5 Oct 2026): her first world's starter (newWorld), the one left in her hand when the
// world was saved let go again (useSim), the first world's UFO (the loop). They are given as hers are, with their sounds, counts and
// the Scrapbook, but they are no answer to her, so nothing they say is pulled at once (withSound): as before H2, the HUD's pull or the
// hint after them decides. H2 pulled them too: her first world opened with twelve lines in Today she never caused ("A sheep arrived."
// six times), there until its fourth minute.
let gameOwn = 0;
function gameGives(fn) {
  gameOwn++;
  try { fn(); } finally { gameOwn--; }
}
// Every command the game gives also sounds (a chirp by species, a click by material; audio.command).
function withSound(s) {
  if (s.withSound) return s;
  const cmd = s.command;
  s.command = (c) => {
    cmd(c);
    // What it said answers her at once (H2, 5 Oct 2026; ui/status.js): pulled now, before a step of the world can log a line after it
    // or the Because system tell a cue (each made the answer no answer: the dog's bark at the goblin she put down, 5 of 17 never seen).
    // Not the game's own (gameGives).
    if (!gameOwn) try { status.sync(s.w); } catch (e) { report('status', e); }
    try { audio.command(c, s.w); } catch (e) { report('sound', e); }
    try { counts.command(c); } catch (e) { report('counts', e); }
    try { if (scrap) scrap.command(s.w, c); } catch (e) { report('scrap', e); } // the Scrapbook watches what the child does
  };
  s.withSound = true;
  return s;
}
// The interface's own state (design 14 §3), drawn by the renderer: the creature in the hand, pokes, the eraser's outlines,
// the followed creature, and the Because sparkle (14 §4, ui/because.js owns it). find: the one she is finding (design 19 A6).
const ui = { held: null, pokes: new Map(), outlines: new Map(), follow: 0, now: 0, spark: null, why: new Map(), pouring: false, pour: null, pourAt: null, welcome: null, find: null, U: data.ui };
let gestures = null, sprayOn = false, ufoAt = null; // ufoAt: the first world's UFO, when it comes ({tick, x, y})
const rawActor = createActor({ getSim: () => sim, getTool: () => tray.tool, onSelect: (h) => (selected = h), spareFor: (x, y) => gestures.spareFor(x, y), gid: () => gestures.touch });
gestures = createGestures({
  getSim: () => sim, getTool: () => tray.tool, actor: rawActor, cam, ui, U: data.ui,
  onSelect: (h) => (selected = h), onPicker: (hs, x, y) => showPicker(hs, x, y), onCamera: () => {}, spray: () => sprayOn,
  // Pouring (15 A2): the chip lights while it happens, and the first pour on a device leaves a short dotted
  // trail so the way in is shown once, without words.
  onPour: (on) => {
    sprayB.classList.toggle('pouring', on);
    if (!on) { ui.pour = null; return; }
    let seen = false;
    try { seen = localStorage.getItem('tw_poured') === '1'; } catch (e) { seen = true; }
    if (!seen) { try { localStorage.setItem('tw_poured', '1'); } catch (e) { /* no storage: it shows again next time */ } ui.pour = { t0: performance.now() }; }
  },
  onPoke: (h) => { counts.mark('poked'); const e = ent(sim.w, h); if (e >= 0) audio.chirp(sim.w.C.S[sim.w.E.kind[e]], sim.w.E.x[e], sim.w.E.y[e]); guard(() => sim.command({ t: 'poke', h }))(); },
  onPokeThing: (tx, ty) => { counts.mark('poked'); guard(() => sim.command({ t: 'pokeThing', tx, ty }))(); },
});
// The Because system (14 §4): which happening the player is told about, the sparkle, and the card. It shows the card the
// Scrapbook makes of the same record (card polish 3), so both read who stood where a moment ago from ONE `stood` (cards.js createSeen).
const stood = createSeen();
const because = createBecause({ data, wrap, cam, status, ui, getSim: () => sim, seen: stood });
// The paper doll (14 §7 T10) and naming (T11): it sends its own commands, guarded like every other input.
const doll = createDoll({ data, getSim: () => sim, command: guard((c) => sim.command(c)), onClose: () => { selected = 0; }, onFind: (phase, h) => findOn(phase, h), onMove: (h) => startMove(h) });
// Move (his note, 4 Oct 2026: "There should be a little button by the x the same size as the x out button that says move and you
// could click move and then you could click where you would want them to be moved to"). Her card's Move puts the card away (the one
// on it stays picked out on the field, its yellow corners) and the Hand is in her hand; a line says where to tap and how to stop.
// Her next tap on the field sets it down there (sim/commands.js `move`, asked first with moveRefusal, the same question the command
// asks: a refused tap says why and she is still choosing). A tap on the one she is moving, any tool taken up, or a long press ends
// it; so does the one she is moving going (a house, a UFO, her hand, gone). Then its card is up again, where it now stands, and it
// hops as a poke makes it hop, so it is plain which one moved.
let moving = 0, moveLine = ''; // the one her Move is setting down (a handle), 0 when she is not moving anybody; and the line it holds
// The line stays up, still, for as long as she is choosing (news.pin, where the line of the one she poked sits): an answer holds two
// seconds, and a Move she forgot would otherwise set her person down at her next tap, whatever that tap was for.
function moveSay(m) { status.post(m.t, m.vals); moveLine = fill(m.t, m.vals); news.pin(moveLine); }
function startMove(h) {
  if (!sim || broken) return;
  const e = ent(sim.w, h);
  if (e < 0) return;
  if (tray.tool.cat !== 'hand') tray.hand();
  moving = h; selected = h; ui.follow = 0;
  moveSay(moveWords(sim.w, e, '', data.strings));
}
function stopMove() { moving = 0; moveLine = ''; }
// Her tap at world (x, y) while she is moving somebody: true when the tap was Move's (it always is while she is choosing).
function tryMove(x, y) {
  const w = sim.w, h = moving, e = ent(w, h);
  if (e < 0 || w.E.inside[e]) { stopMove(); return false; }
  // a tap on the one she is moving: it stays where it is
  if (Math.hypot(w.E.x[e] - x, w.E.y[e] - 4 - y) < Math.max(data.ui.pickMinWorld, (data.ui.pickRadius * cam.dpr) / cam.zoom)) { stopMove(); return true; }
  const why = moveRefusal(w, e, x, y + w.R.tools.spawnDrop);
  if (why) { moveSay(moveWords(w, e, why, data.strings)); return true; }
  // A refusal's line holds two seconds: "There is no room there." must not stand over the one who just landed. Its moment ends
  // BEFORE the Move, whose own answer ("Lorna is here now.") comes the moment the command is done (withSound, H2) and holds its own
  // moment. Ended after the command, as H2 left it, it took that answer down a frame after it came, and the stale "Tap where Lorna
  // should go" stood over her instead: "is here now." was never seen (the H2 review round: 0 Moves of 22).
  news.endAnswer();
  sim.command({ t: 'move', h, x, y });
  stopMove();
  const e2 = ent(sim.w, h);
  if (e2 >= 0) { selected = h; ui.pokes.set(h, performance.now()); audio.chirp(sim.w.C.S[sim.w.E.kind[e2]], sim.w.E.x[e2], sim.w.E.y[e2]); }
  return true;
}
// The Scrapbook (14 §4.3, §7 T12): per device, filled from the same story records the Because system drains.
let scrap = null;
// Test 1's counters (14 §7 T14): seven latched seconds, per device, nothing else. ?counts shows them here.
const counts = createCounts();
// Every gesture is guarded: a sim error stops that world, never the game.
const g = {};
for (const k of ['down', 'tap', 'doubleTap', 'dragStart', 'drag', 'dragEnd', 'carry', 'release', 'cancel']) g[k] = guard(gestures[k].bind(gestures));
// Pouring (15 A2) asks the gesture layer two questions and gives it one command; they are guarded the same way,
// and the two questions answer with the interface's own numbers when the world is broken.
g.holdMs = () => { try { return gestures.holdMs(); } catch (e) { return data.ui.longPressMs; } };
g.holdSlop = () => { try { return gestures.holdSlop(); } catch (e) { return data.ui.tapSlop; } };
g.pour = (...a) => { if (broken) return false; try { return gestures.pour(...a); } catch (e) { simFailed('input', e); return false; } };
// A tap on the sparkle shows its Because card instead of poking what is under it. The Hand's taps only: with a
// tool in hand a tap is the tool's, and the sparkle simply lingers until it fades.
g.tap = guard((x, y, cssX, cssY) => {
  if (moving && tryMove(x, y)) return; // (his note, 4 Oct 2026: where her Move sets the one on her card down)
  if (modeOf(tray.tool) === 'hand' && because.tap(x, y)) return;
  gestures.tap(x, y, cssX, cssY);
});
g.doubleTap = guard((x, y) => { if (moving && tryMove(x, y)) return; gestures.doubleTap(x, y); }); // (a refused tap's quick second one is Move's too)
g.longPress = (...a) => { if (broken) return false; stopMove(); try { return gestures.longPress(...a); } catch (e) { simFailed('input', e); return false; } };
attachInput(cv, g, () => (sim ? cam : null), () => { railOpen(true); if (ui.find && ui.find.glide) ui.find = null; }, data.ui); // a pinch shows the rail: the bar and the pinch are the same thing (and, as a drag does, it takes the camera from a find's glide: design 19 A6)
// The Spray chip (design 14 §3): off by default; shown while a creature or a thing is the tool; on, a drag lays them.
const sprayB = document.getElementById('spray');
function showSpray() {
  const t = tray.tool, show = canSpray(t);
  sprayB.hidden = !show;
  sprayB.classList.toggle('on', sprayOn);
  sprayB.style.backgroundImage = `url(${url(sprayOn ? 'ui_sprayOn' : 'ui_sprayOff')})`;
  sprayB.setAttribute('aria-label', str(sprayOn ? 'ui.sprayOn' : 'ui.sprayOff'));
  sprayB.setAttribute('aria-pressed', String(sprayOn));
}
sprayB.onclick = () => { sprayOn = !sprayOn; showSpray(); status.post(str(sprayOn ? 'hint.sprayOn' : 'hint.sprayOff')); };
showSpray();
// The crowded-patch picker (14 §3): 3+ creatures under a Hand tap: their pictures in a row above the finger; a tap picks
// one; gone after ui.picker.ms, or at the next touch anywhere. The world keeps running.
const pickerEl = document.getElementById('picker');
let pickerT = 0;
function hidePicker() { pickerEl.hidden = true; pickerEl.textContent = ''; clearTimeout(pickerT); }
function showPicker(hs, x, y) {
  hidePicker();
  const P = data.ui.picker, w = sim.w;
  for (const h of hs) {
    const e = ent(w, h);
    if (e < 0) continue;
    const b = document.createElement('button'), im = new Image(), k = w.E.kind[e], sp = w.C.S[k];
    im.src = url(sp.spr || k, w.E.over[e] || sp.over); im.alt = '';
    b.appendChild(im);
    b.setAttribute('aria-label', w.E.name[e] || data.creatures[k].name);
    b.onclick = guard(() => { hidePicker(); gestures.poke(h); });
    pickerEl.appendChild(b);
  }
  const r = wrap.getBoundingClientRect(), width = hs.length * (P.size + 6);
  pickerEl.style.left = Math.max(4, Math.min(r.width - width - 4, x - width / 2)) + 'px';
  pickerEl.style.top = Math.max(4, y - P.size - 40) + 'px';
  pickerEl.hidden = false;
  pickerT = setTimeout(hidePicker, P.ms);
}
cv.addEventListener('pointerdown', (ev) => { hidePicker(ev); railOpen(false); }, true);
const zin = document.getElementById('zin'), zout = document.getElementById('zout');
zin.setAttribute('aria-label', str('ui.zoomIn')); zout.setAttribute('aria-label', str('ui.zoomOut'));
zin.onclick = () => { railOpen(true); cam.step(1); }; zout.onclick = () => { railOpen(true); cam.step(-1); };
// The zoom rail (14 §3): the knob sits at the zoom's place among the camera's levels (in at the top); a finger on the
// track sets the zoom at that place, around the middle of the view. Pinch still works.
const track = document.getElementById('track'), knob = document.getElementById('knob');
track.setAttribute('aria-label', str('ui.zoom'));
let railing = false, knobAt = -1;
// Shut, the rail is one handle in the corner (design 14 §3 asked for a rail; it never said it must own the
// right of the field). A tap opens it, a pinch shows it, a touch on the field puts it away, and it tucks
// itself back after ui.zoom.openMs of no touching. ui.json zoom.openMs 0 keeps it out always, as it was.
const rail = document.getElementById('rail'), zopen = document.getElementById('zopen');
const railMs = (data.ui.zoom && data.ui.zoom.openMs) || 0;
zopen.setAttribute('aria-label', str('ui.zoomOpen'));
zopen.style.backgroundImage = `url(${url('ui_zoom')})`;
let railT = 0;
function railOpen(open) {
  rail.classList.toggle('shut', !open && railMs > 0);
  clearTimeout(railT);
  if (open && railMs) railT = setTimeout(() => rail.classList.add('shut'), railMs);
}
zopen.onclick = () => railOpen(true);
railOpen(railMs === 0);
function railKnob() {
  if (rail.classList.contains('shut')) { knobAt = -1; return; } // shut: the track has no height to place it in
  const L = cam.levels, i = L.indexOf(cam.nearest(cam.zoom)), f = L.length > 1 ? i / (L.length - 1) : 0;
  const top = Math.round(2 + (1 - f) * Math.max(0, track.clientHeight - knob.offsetHeight - 4));
  if (top !== knobAt) { knobAt = top; knob.style.top = top + 'px'; }
}
function railSet(ev) {
  const r = track.getBoundingClientRect(), k = knob.offsetHeight, L = cam.levels;
  const f = 1 - Math.max(0, Math.min(1, (ev.clientY - r.top - k / 2) / Math.max(1, r.height - k)));
  const z = L[Math.round(f * (L.length - 1))];
  if (z !== cam.zoom) cam.zoomAt(z, cam.cw / 2 / cam.dpr, cam.ch / 2 / cam.dpr);
}
track.addEventListener('pointerdown', (ev) => { if (!sim) return; railOpen(true); railing = true; track.setPointerCapture(ev.pointerId); railSet(ev); });
track.addEventListener('pointermove', (ev) => { if (railing) railSet(ev); });
for (const n of ['pointerup', 'pointercancel']) track.addEventListener(n, () => (railing = false));

news.add(str('ui.start'), null, true); // the first line of all: an answer, so it is still and immediate (15 A3)
// Pause and Play as pictures (14 §1 rule 4).
const showPause = () => { pauseB.style.backgroundImage = `url(${url(paused ? 'ui_play' : 'ui_pause')})`; pauseB.setAttribute('aria-label', str(paused ? 'ui.play' : 'ui.pause')); };
showPause();
speedB.textContent = str('ui.speed').replace('{n}', speed);
pauseB.onclick = () => { paused = !paused; showPause(); };
speedB.onclick = () => { speed = speed === 1 ? 2 : speed === 2 ? 4 : 1; speedB.textContent = str('ui.speed').replace('{n}', speed); };

// Undo (design 14 §3): the sim takes back the player's last step (sim/undo.js). Before a Clear or a return to the
// Snapshot, the whole world is kept (swapBack): once the steps since are all undone, Undo brings that world back, and
// that is how both are protected with no "are you sure" (Flow rule 1).
const undoB = document.getElementById('undo'), snapB = document.getElementById('snap');
undoB.style.backgroundImage = `url(${url('ui_undo')})`;
undoB.setAttribute('aria-label', str('ui.undo'));
let swapBack = null; // { sim, view }
const camView = () => ({ x: cam.x, y: cam.y, z: cam.zoom / cam.dpr });
function swapTo(s, view) { swapBack = { sim, view: camView() }; useSim(s, view); saver.touch(); }
undoB.onclick = guard(() => {
  if (sim.w.undo.length) sim.command({ t: 'undo' });
  else if (swapBack) { const b = swapBack; swapBack = null; useSim(b.sim, b.view); saver.touch(); audio.sfx('undo'); }
  else status.post(str('hint.nothingToUndo'));
});
const showUndo = () => undoB.classList.toggle('off', !(sim && (sim.w.undo.length || swapBack)));
// Clear (in the menu now, 02 §1): at once; Undo brings the world back whole.
document.getElementById('clearW').textContent = str('ui.clearWorld');
// Sound settings (14 §7 T6), per device: sound, music, quiet surprises (loud sounds softened).
document.getElementById('soundLbl').textContent = str('ui.sound');
const soundBs = { sndB: 'sfx', musB: 'music', quietB: 'quiet' };
function showSound() { const s = audio.settings; for (const [id, k] of Object.entries(soundBs)) document.getElementById(id).textContent = fill(str('ui.snd.' + k), { state: str(s[k] ? 'ui.on' : 'ui.off') }); }
for (const [id, k] of Object.entries(soundBs)) document.getElementById(id).onclick = () => { audio.unlock(); audio.set(k, !audio.settings[k]); showSound(); audio.sfx('ui_tap'); };
showSound();
// THE MUSIC PLAYER (23 Sep 2026, Stephen: "just like Jimothy"): every song, a switch each; locked ones say how far off
// they are and can be listened to while the menu is open. Drawn again on every tap, and when the menu opens.
document.getElementById('musicLbl').textContent = str('ui.music');
document.getElementById('musicLead').textContent = str('ui.music.lead');
const songsEl = document.getElementById('songs');
function showSongs() {
  songsEl.innerHTML = '';
  for (const s of audio.songs()) {
    const row = document.createElement('div');
    row.className = 'row' + (s.unlocked ? '' : ' locked');
    const t = document.createElement('span');
    const state = s.unlocked ? (s.playing ? str('ui.song.playing') : s.on ? str('ui.song.inLoop') : str('ui.song.out')) : fill(str('ui.song.locked'), { n: s.minutesLeft });
    t.innerHTML = `${s.title}<small>${state}</small>`;
    const b = document.createElement('button');
    if (s.unlocked) {
      b.textContent = str(s.on ? 'ui.song.on' : 'ui.song.off');
      b.className = s.on ? 'on' : '';
      b.setAttribute('aria-pressed', String(s.on));
      b.setAttribute('aria-label', s.title);
      b.onclick = () => { audio.unlock(); audio.songOn(s.id, !s.on); audio.sfx('ui_tap'); showSongs(); };
    } else {
      b.textContent = str(s.previewing ? 'ui.song.stop' : 'ui.song.listen');
      b.className = s.previewing ? 'on' : '';
      b.setAttribute('aria-label', s.title);
      b.onclick = () => { audio.unlock(); audio.preview(s.previewing ? null : s.id); audio.sfx('ui_tap'); showSongs(); };
    }
    row.append(t, b);
    songsEl.appendChild(row);
  }
}
showSongs();
// The words at the bottom (15 A3): moving or still, per device. Reduced motion forces still whatever this says.
// (This whole block used to sit INSIDE the sound buttons' click handler: the arrow body above was never closed,
// so the News row was a blank dead box until you happened to tap Sounds first. Found by looking, Sep 20.)
const newsB = document.getElementById('newsB');
function showNews() { newsB.textContent = fill(str('ui.snd.news'), { state: str(news.style === 'lines' ? 'ui.newsLines' : 'ui.newsTicker') }); }
newsB.onclick = () => {
  news.style = news.style === 'lines' ? 'ticker' : 'lines';
  try { localStorage.setItem('tw_news', news.style); } catch (e) { /* no storage: this session only */ }
  showNews();
  audio.sfx('ui_tap');
};
showNews();
document.getElementById('clearW').onclick = guard(() => {
  closeSheet();
  const s = createSim(data, { record: sim.save(), journal: Q.has('debug') });
  s.command({ t: 'clear' });
  swapTo(s, camView());
  audio.sfx('erase');
  status.post(str('hint.cleared'));
});
// Design 19 A8 (Astra M4): the parent's Living Land switch, for the world that is open. On (every world starts so), reeds and clover
// spread by themselves and animals move in to ground a few days old; off, the land rests (the pass, the arrivals and the migrations
// stop: card polish 3, its words say only that; the flock's worn grass, the bones' flowers and the visitors go on, his call, Q50 A8)
// and nothing already changed changes back. It is the WORLD's, not the phone's: a `setting` command, journaled and saved with the
// world (sim/commands.js; another world keeps its own), and written at once, so a parent who switches it and closes the game
// finds it as they left it. A Clear keeps it (the cleared world is made from this one's save). Shown only where the game has it.
const landBox = document.getElementById('landBox'), landB = document.getElementById('landB');
landBox.hidden = !data.rules.flags.landSwitch;
document.getElementById('landLbl').textContent = str('ui.thisWorld');
document.getElementById('landLead').textContent = str('ui.land.lead');
function showLand() {
  const on = !sim || sim.w.landOn !== false;
  landB.textContent = fill(str('ui.land'), { state: str(on ? 'ui.on' : 'ui.off') });
  landB.setAttribute('aria-pressed', String(on));
}
landB.onclick = guard(() => {
  sim.command({ t: 'setting', key: 'land', value: !sim.w.landOn });
  showLand();
  saver.save();
  audio.sfx('ui_tap');
});
showLand();

// Snapshot (14 §3): one per world. A tap keeps this moment (its picture becomes the button); a hold (ui.snapHoldMs, the
// button fills while held) goes back to it, and Undo comes forward again. Kept with the world's saves.
let snap = null; // { rec, thumb, view }
snapB.style.setProperty('--snapIcon', `url(${url('ui_snap')})`);
snapB.style.setProperty('--hold', data.ui.snapHoldMs + 'ms');
snapB.setAttribute('aria-label', str('ui.snap'));
function showSnap() {
  snapB.classList.toggle('has', !!(snap && snap.thumb));
  snapB.style.backgroundImage = `url(${snap && snap.thumb ? snap.thumb : url('ui_snap')})`;
}
showSnap();
let snapHold = 0, snapHeld = false;
snapB.addEventListener('pointerdown', (ev) => {
  snapB.setPointerCapture(ev.pointerId);
  snapHeld = false;
  snapB.classList.add('holding');
  snapHold = setTimeout(() => {
    snapHold = 0; snapHeld = true; snapB.classList.remove('holding');
    if (!snap || !sim || broken) return;
    try {
      swapTo(createSim(data, { record: migrate(snap.rec), journal: Q.has('debug') }), snap.view);
      status.post(str('hint.snapBack'));
    } catch (e) { report('snapshot', e); }
  }, data.ui.snapHoldMs);
});
const snapUp = (ev) => {
  snapB.classList.remove('holding');
  if (snapHold) { clearTimeout(snapHold); snapHold = 0; if (ev.type === 'pointerup' && !snapHeld) takeSnap(); }
};
snapB.addEventListener('pointerup', snapUp);
snapB.addEventListener('pointercancel', snapUp);
function takeSnap() {
  if (!sim || broken) return;
  snap = { rec: sim.save(), thumb: thumbOf(sim.w), view: camView(), at: Date.now() };
  showSnap();
  audio.sfx('snap');
  status.post(str('hint.snapTaken'));
  if (store && saver.id) store.putSnap(saver.id, snap).catch((e) => report('snapshot', e));
}
tray.build();

// The canvas fills its area at device resolution; the camera decides what of the world it shows.
function sizeCanvas() {
  cam.resize(wrap.clientWidth, wrap.clientHeight, window.devicePixelRatio || 1); // the renderer sizes the canvas each frame
}
// Saves (design 14 §7 T1): IndexedDB through ui/store.js, written by ui/saver.js. store stays null where the browser
// has no IndexedDB (the game then runs unsaved, and says so once a save is due).
const Q = new URLSearchParams(location.search);
let store = null;
const disk = document.getElementById('disk'), rescueB = document.getElementById('rescue');
{ // the disk icon, drawn once from art.json's pixel grid
  const ic = data.art.saveIcon, c = document.createElement('canvas'), g = c.getContext('2d');
  c.width = ic.px[0].length; c.height = ic.px.length;
  ic.px.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== ' ') { g.fillStyle = ic.col[ch]; g.fillRect(x, y, 1, 1); } }));
  disk.style.backgroundImage = rescueB.style.backgroundImage = `url(${c.toDataURL()})`;
}
let saveFailing = false, keepAsked = false;
const saver = createSaver({
  rules: data.rules, getStore: () => store, getSim: () => sim, getBroken: () => broken,
  getView: () => ({ x: cam.x, y: cam.y, z: cam.zoom / cam.dpr }),
  onSaved: (row) => {
    disk.classList.remove('pulse'); void disk.offsetWidth; disk.classList.add('pulse'); // one pulse, restarted
    if (saveFailing) { saveFailing = false; rescueB.hidden = true; }
    if (!keepAsked) { keepAsked = true; askToKeep(); } // once there is something to keep
    if (window.__twSaveLog) window.__twSaveLog(`saved seq ${row.seq} tick ${row.tick}`);
  },
  onSnap: (s, seq) => { if (window.__twSaveLog) window.__twSaveLog(`snap seq ${seq} tick ${s.w.tick} hash ${s.hash()}`); },
  hashCopies: new URLSearchParams(location.search).has('debug'),
  // Said again at every failed attempt (once an interval at most): the status line is shared with the world's news.
  onFailed: (e) => { report('save', e); saveFailing = true; rescueB.hidden = false; status.post(str('save.failed')); },
});
// Makes a sim the open world: the view is the saved one, or the start view (the world's width across the phone).
function useSim(s, view) {
  sim = withSound(s); selected = 0; moving = 0; broken = false; status.post(undefined);
  ui.held = null; ui.follow = 0; ui.pokes.clear(); ui.outlines.clear(); ui.why.clear(); ui.welcome = null; ui.find = null; hidePicker(); because.clear(); doll.hide(); news.clear();
  // A creature left in the hand when the world was saved: the finger is gone, so it is let go where it was (the game's doing).
  gameGives(() => { for (let k = 0; k < s.w.count; k++) { const e = s.w.order[k]; if (s.w.E.inside[e] === HELD) s.command({ t: 'drop', h: s.w.slotH[e], x: s.w.E.x[e], y: s.w.E.y[e] }); } });
  renderer.resize(sim.w);
  sizeCanvas();
  cam.fitWidth(sim.w.W, sim.w.H);
  if (view && Number.isFinite(view.x) && Number.isFinite(view.y) && view.z > 0) { cam.zoom = cam.nearest(view.z * cam.dpr); cam.x = view.x; cam.y = view.y; cam.update(); }
}
// A world of one of the bible's sizes (rules.worldSizes: S 48×64 by default, M, L, XL); `?size=WxH` and
// `?seed=` set them for testing. It is saved at once, so it is the one that opens next time.
// preset: 'first' (a player's first world: Safe on, Gentle for everyone, Pets safe on; 14 §1 rule 7) or 'later'
// (rules.world); daySec: the day length picked in the menu.
function newWorld(sizeId, preset, daySec) {
  const settings = { ...data.rules.world[preset] };
  if (daySec) settings.daySec = daySec;
  const dev = /^(\d+)x(\d+)$/.exec(Q.get('size') || '');
  const [cols, rows] = dev && !sizeId ? [+dev[1], +dev[2]] : data.rules.worldSizes[sizeId || data.rules.startSize];
  const sq = Q.get('seed');
  const seed = sq !== null && sq !== '' && Number.isFinite(Number(sq)) && !sizeId ? Number(sq) | 0 : (Date.now() ^ Math.floor(performance.now() * 1000)) | 0;
  useSim(createSim(data, { cols, rows, seed, settings, journal: Q.has('debug') })); // the journal is for tools; a long game would keep every stroke
  // The first world opens alive (14 §7 T7): the starter scene, and the UFO at 20 s once per device. (Not for a test world.)
  ufoAt = null;
  if (preset === 'first' && !dev && sq === null) {
    gameGives(() => buildStarter(sim, data.starter)); // (the game's doing: no line of it is her answer)
    ufoAt = starterUfo(sim.w, data.starter);
    // Close enough to see who is there: view.tiles tiles across the phone, the centre in the middle.
    const want = data.starter.view.tiles * sim.w.T;
    let z = cam.levels[0];
    for (const l of cam.levels) if (l >= 1 && want * l <= cam.cw) z = l;
    cam.zoom = Math.max(cam.zoom, z); cam.x = sim.w.W / 2; cam.y = sim.w.H / 2; cam.update();
    status.post(str('hint.hand'));
  }
  saver.attach(newWorldId(), { createdAt: Date.now(), seq: 0 });
  snap = null; swapBack = null; showSnap();
  saver.save();
}
// Design 18 A16: she is welcomed back. A second after a SAVED world opens, whoever she named and left out there
// shows one heart and makes the sound a poke makes. The view's doing entirely: no command, no effect record, no
// field, so the world she comes back to is exactly the one she left (design 14 §1 rule 6).
let greetT = 0;
function greetLater() {
  const W = data.ui.welcome;
  clearTimeout(greetT);
  ui.welcome = null;
  greetT = setTimeout(() => {
    if (!sim || broken) return;
    const h = whoToGreet(sim.w, cam.x, cam.y, W.r);
    if (!h) return;
    ui.welcome = { h, t0: performance.now() };
    ui.pokes.set(h, performance.now()); // the hop of a poke, so it is plain WHICH one is saying hello (looked at, 22 Sep)
    const e = ent(sim.w, h);
    if (e >= 0) audio.chirp(sim.w.C.S[sim.w.E.kind[e]], sim.w.E.x[e], sim.w.E.y[e]);
  }, W.waitMs);
}
// Opens a saved world: its newest copy, or the older one if the newest will not load (last-good). False if neither.
async function openWorld(id) {
  let copies = [];
  try { copies = await store.copies(id); } catch (e) { report('load', e); }
  for (const c of copies) {
    try {
      const s = createSim(data, { record: migrate(c.rec), journal: Q.has('debug') }), row = await store.row(id).catch(() => null);
      useSim(s, c.view);
      greetLater(); // design 18 A16
      saver.attach(id, { createdAt: row ? row.createdAt : c.at, seq: c.seq });
      snap = (await store.snap(id).catch(() => null)) || null; swapBack = null; showSnap();
      store.setCurrent(id).catch((e) => report('save', e));
      if (window.__twSaveLog) window.__twSaveLog(`loaded ${id} seq ${c.seq} tick ${s.w.tick} hash ${s.hash()} stored ${c.hash}`);
      return true;
    } catch (e) { report('load', e); }
  }
  return false;
}
// Start: the world open last, as it was left (Flow rule 6: nothing happened while the game was closed); a new world
// when there is none, or when the URL asks for one (?seed, ?size).
async function init() {
  if (Q.has('bench')) return startBench();
  store = await openStore().catch(() => null);
  scrap = createScrap({ data, getSim: () => sim, store, cv, cam, seen: stood, locked: () => pi.askFirst(), onLocked: () => pi.ask('scrap') }); // the Scrapbook (14 §7 T12)
  pi.boot(); // the Pi rail: sign in and what she owns (returns at once on any other host)
  const scrapB = document.getElementById('scrapB');
  scrapB.setAttribute('aria-label', str('ui.scrapbook'));
  scrapB.addEventListener('click', () => counts.mark('scrapbook'));
  if (Q.has('counts')) showCounts(); // the card this device keeps (14 §7 T14): nothing leaves the phone
  if (store && !Q.has('seed') && !Q.has('size')) {
    const id = await store.current().catch(() => null);
    if (id && (await openWorld(id))) return;
  }
  // The first world on this device gets the first-world settings; one made while others are saved is a later world.
  const others = store ? await store.rows().catch(() => []) : [];
  newWorld(null, others.length ? 'later' : 'first');
}
// ?bench (design 14 §7 T2): the named stress workload (src/dev/bench.json "t2") played at 1x with drawing, for the
// frame-time distribution on a real phone. Nothing is saved. After the warm-up it records every frame's interval and
// every step's time for `ticks` steps, then pauses and shows p50/p95/p99 in the status line (and window.__twBench).
let bench = null;
async function startBench() {
  const B = (await (await fetch(new URL('./dev/bench.json', import.meta.url))).json()).t2;
  const { buildBench } = await import('./dev/bench.js');
  const s = createSim(data, { cols: B.size[0], rows: B.size[1], seed: B.seed, journal: false }), b = buildBench(s, B), tick = s.tick;
  useSim(s);
  status.sync = () => {}; // the world's news would scroll past the bench's own line (Stephen's Pixel, Sep 19)
  bench = { B, b, steps: [], frames: [], on: false, done: false, last: 0, said: -1 };
  s.tick = () => { const t0 = performance.now(); b.update(); tick(); if (bench.on) bench.steps.push(performance.now() - t0); };
}
const pct = (xs, p) => { const a = xs.slice().sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.floor(p * a.length))] : NaN; };
function benchFrame(now) {
  const w = sim.w, B = bench.B, end = B.warmup + B.ticks;
  if (!bench.on) { if (w.tick >= B.warmup) { bench.on = true; bench.last = now; } }
  else { bench.frames.push(now - bench.last); bench.last = now; }
  const left = Math.ceil(((end - w.tick) * w.R.tickSec));
  if (w.tick >= end) {
    bench.done = true; paused = true; pauseB.textContent = str('ui.play');
    const f = bench.frames, st = bench.steps, r = (x) => Math.round(x * 10) / 10;
    const res = { frames: { n: f.length, p50: r(pct(f, 0.5)), p95: r(pct(f, 0.95)), p99: r(pct(f, 0.99)), over20: r((100 * f.filter((x) => x > 20).length) / f.length), over33: r((100 * f.filter((x) => x > 33.4).length) / f.length) },
      steps: { n: st.length, p50: r(pct(st, 0.5)), p95: r(pct(st, 0.95)), p99: r(pct(st, 0.99)) }, census: bench.b.census(), view: [innerWidth, innerHeight, devicePixelRatio], ua: navigator.userAgent };
    window.__twBench = res;
    console.log('tiny-world bench ' + JSON.stringify(res));
    status.post(str('bench.done'), { f50: res.frames.p50, f95: res.frames.p95, f99: res.frames.p99, slow: res.frames.over20, s95: res.steps.p95 }); // (a hint's template and its values: status.js asks the template)
    const card = document.getElementById('benchCard'), line = (k, v) => { const p = document.createElement('p'); p.style.margin = '0'; p.append(k + ' '); const b = document.createElement('b'); b.textContent = v; p.append(b); return p; };
    const ua = document.createElement('small');
    ua.textContent = `${res.view[0]}x${res.view[1]} @${res.view[2]} · ${res.frames.n} frames, ${res.steps.n} steps · ${res.ua}`;
    card.append(line(str('bench.frames'), `${res.frames.p50} / ${res.frames.p95} / ${res.frames.p99} ms`), line(str('bench.slow'), `${res.frames.over20}% · ${res.frames.over33}%`),
      line(str('bench.step'), `${res.steps.p50} / ${res.steps.p95} ms`), line(str('bench.count'), String(res.census.creatures)), ua);
    card.classList.add('on');
    card.onclick = () => card.classList.remove('on');
  } else if (left !== bench.said) { bench.said = left; if (bench.on) status.post(str('bench.run'), { s: left }); else status.post(str('bench.warm')); }
}
// Leaving the open world (new world, another world, a file): its last changes are written first.
const leave = () => saver.save();

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
// The ☰ menu pauses the world while it is open (14 §3: nothing else does), and gives back the pause state it found.
let menuPaused = false;
function openSheet() { if (!sheet.classList.contains('on')) { menuPaused = !paused; paused = true; } sheet.classList.add('on'); }
function closeSheet() { if (sheet.classList.contains('on') && menuPaused) paused = false; menuPaused = false; sheet.classList.remove('on'); audio.preview(null); }
const worldsEl = document.getElementById('worlds'), worldsLbl = document.getElementById('worldsLbl');
worldsLbl.textContent = str('save.worlds');
// The other saved worlds, the one played last first: a picture and its day each; a tap opens it.
async function listWorlds() {
  worldsEl.textContent = ''; worldsLbl.hidden = true;
  if (!store) return;
  const rows = (await store.rows().catch(() => [])).filter((r) => r.id !== saver.id);
  worldsLbl.hidden = !rows.length;
  for (const r of rows) {
    const b = document.createElement('button'), img = document.createElement('img'), day = document.createElement('small');
    if (r.thumb) img.src = r.thumb;
    img.alt = '';
    day.textContent = str('save.day').replace('{n}', r.day);
    b.append(img, day);
    b.setAttribute('aria-label', str('save.day').replace('{n}', r.day));
    b.onclick = async () => {
      closeSheet();
      await leave();
      if (!(await openWorld(r.id))) status.post(str('save.damaged'));
    };
    worldsEl.appendChild(b);
  }
}
// Day length (14 §9.1): three choices, the later preset's by default.
const daysEl = document.getElementById('days');
let dayPick = data.rules.world.later.daySec;
document.getElementById('dayLbl').textContent = str('world.day');
for (const d of data.rules.world.dayChoices) {
  const b = document.createElement('button');
  b.dataset.day = d;
  b.innerHTML = `${str('world.day' + d)}<small>${str('world.minutes').replace('{n}', d / 60)}</small>`;
  b.onclick = () => { dayPick = d; for (const o of daysEl.children) o.classList.toggle('on', o === b); };
  daysEl.appendChild(b);
}
document.getElementById('menu').onclick = () => {
  for (const o of sizesEl.children) o.classList.toggle('on', o.dataset.size === pick);
  for (const o of daysEl.children) o.classList.toggle('on', +o.dataset.day === dayPick);
  openSheet(); listWorlds(); showSongs(); showLand();
};
document.getElementById('cancelNew').onclick = () => closeSheet();
// The menu's own way out: Cancel and Start belong to New world, and nothing simply shut the sheet.
const sheetX = document.getElementById('sheetX');
sheetX.setAttribute('aria-label', str('ui.close'));
sheetX.onclick = () => closeSheet();
document.getElementById('startNew').onclick = async () => {
  if (pi.askFirst()) { closeSheet(); pi.ask('world'); return; } // the Pi rail before the unlock: her first world is the one
  closeSheet();
  await leave();
  try { newWorld(pick, 'later', dayPick); } catch (e) { simFailed('new world', e); }
};
// Files (.tinyworld): the open world saved to a file, and a file opened as a new world (a copy: never over one).
const exportB = document.getElementById('exportB'), importB = document.getElementById('importB'), importF = document.getElementById('importF');
exportB.textContent = str('save.export'); importB.textContent = str('save.import');
rescueB.setAttribute('aria-label', str('save.export'));
async function exportWorld() {
  if (!sim || broken) return;
  const text = toText(sim.save()), blob = await fileBlob(scrap ? scrap.toFile(text) : text), a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = str('save.fileName').replace('{n}', Math.floor(sim.w.time / sim.w.daySec) + 1);
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}
exportB.onclick = () => { closeSheet(); exportWorld().catch((e) => report('export', e)); };
rescueB.onclick = () => exportWorld().catch((e) => report('export', e));
importB.onclick = () => { if (pi.askFirst()) { closeSheet(); pi.ask('world'); return; } importF.click(); };
importF.onchange = async () => {
  const f = importF.files && importF.files[0];
  importF.value = '';
  if (!f) return;
  closeSheet();
  let s;
  try {
    // Her cards first: a collection carried to a new device comes in even when the world in the file is from a newer game.
    const text = await fileText(f), worldText = scrap ? scrap.openFile(text) : unpackFile(text).text;
    s = createSim(data, { record: fromText(worldText), journal: Q.has('debug') });
  } catch (e) { report('import', e); status.post(str(e && e.code === 'newer' ? 'save.newer' : 'save.damaged')); return; }
  await leave();
  useSim(s);
  saver.attach(newWorldId(), { createdAt: Date.now(), seq: 0 });
  snap = null; swapBack = null; showSnap();
  saver.save();
  status.post(str('save.opened'));
};
// The canvas area changes size without a window resize too (the tray lays out after boot): watch the area.
new ResizeObserver(() => { try { if (sim) { sizeCanvas(); cam.update(); } } catch (e) { report('resize', e); } }).observe(wrap);

const fxRng = makeRng(0x7157); // cosmetic stream: rain streaks and screen shake
const rand = () => fxRng.float();
// Fixed-step loop: real time times the speed fills a budget that is spent in whole 50 ms sim steps.
// Speed never changes the step length. A slow frame is caught up (so 1x keeps real time on a slow
// phone, where the prototype slowed down); only a very long gap, such as a hidden tab, is dropped.
// Catching up is time-boxed too: once a frame has spent FRAME_MS on steps it stops (at least one step runs), so a
// world too heavy for the phone runs slower instead of freezing the page. 100 ms keeps QUESTIONS Q8's promise: a
// phone down to 4 fps with light steps still gets its 20 steps a second.
// Follow-cam (14 §3): the camera eases toward the followed creature; a big ✕ at the field's edge ends it, and so does any
// drag (ui/gesture.js). Old pokes and outlines are forgotten here too.
const followB = document.getElementById('unfollow');
followB.setAttribute('aria-label', str('ui.unfollow'));
followB.onclick = () => { ui.follow = 0; };
function follow(w) {
  if (ui.follow) {
    const e = ent(w, ui.follow);
    if (e < 0 || w.E.inside[e]) ui.follow = 0;
    else { const f = data.ui.followEase; cam.x += (w.E.x[e] - cam.x) * f; cam.y += (w.E.y[e] - 4 - cam.y) * f; cam.update(); }
  }
  followB.hidden = !ui.follow;
  if (ui.pokes.size > 64) ui.pokes.clear();
  for (const [h, o] of ui.outlines) if (o.until < ui.now) ui.outlines.delete(h);
  for (const [h, o] of ui.why) if (ui.now - o.t0 > data.ui.because.whyMs) ui.why.delete(h); // cause icons (14 §4.2)
}
// Find the one she named (design 19 A6, Astra B4, the locator; ui/find.js). A tap on the name on a card brings the camera to
// the one on it, or to the house it went into or the UFO carrying it, and when the camera is there one heart beats over it
// (render.js) and it hops the way a poke makes it hop, so it is plain which one (the welcome's lesson, 22 Sep); a house it is in
// wiggles the way a poked thing does, and the heart sits on its roof. While her finger is down on the name and it is off the
// screen, one arrow at the field's edge points the way, never on her card. The view's doing entirely: no command, no field,
// nothing the world keeps. Any drag on the field ends the glide (ui/gesture.js), as it ends a follow.
const arrowEl = document.getElementById('findArrow'), arrowAt = { x: 0, y: 0, dir: 0 };
const dollEl = document.getElementById('doll'), dollXEl = document.getElementById('dollX'), cardAt = { x0: 0, y0: 0, x1: 0, y1: 0 };
// The arrow's two pictures from art.json (pointing east, and south east), outlined; the other six ways are quarter turns.
const arrowPics = ['px', 'diag'].map((k) => {
  const A = data.art.findArrow, rows = A[k], c = document.createElement('canvas'), g = c.getContext('2d');
  c.width = rows[0].length + 2; c.height = rows.length + 2;
  const at = (fn) => rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '#') fn(x + 1, y + 1); }));
  g.fillStyle = data.art.glyphs.outline; at((x, y) => g.fillRect(x - 1, y - 1, 3, 3));
  g.fillStyle = A.col; at((x, y) => g.fillRect(x, y, 1, 1));
  return { url: `url(${c.toDataURL()})`, w: c.width * data.ui.locator.arrowPx, h: c.height * data.ui.locator.arrowPx };
});
let arrowShown = -1; // the way the arrow points now (0..7), -1 for no arrow
// Her card on the field, from its row of buttons down to the field's foot (her finger is on its name and her hand is under it), in
// canvas device px: ui/find.js keeps the arrow off it and the one she finds above it. Null when it is not up.
function card() {
  if (dollEl.hidden) return null;
  const d = dollEl.getBoundingClientRect(), b = dollXEl.getBoundingClientRect(), c = cv.getBoundingClientRect(), k = cam.dpr;
  if (!d.width) return null;
  cardAt.x0 = (d.left - c.left) * k; cardAt.x1 = (d.right - c.left) * k;
  cardAt.y0 = (Math.min(d.top, b.height ? b.top : d.top) - c.top) * k; cardAt.y1 = cam.ch;
  return cardAt;
}
// The camera got there: the one she named hops (or the UFO carrying it), or the house it is in wiggles.
function found(w, s, now) {
  if (s.e >= 0) ui.pokes.set(w.slotH[s.e], now);
  else ui.thingPoke = { tx: Math.floor(s.x / w.T), ty: Math.floor(s.y / w.T), t: now };
}
function findOn(phase, h) {
  if (!sim || broken) return;
  let s = ui.find;
  if (phase === 'up') { if (s) s.down = false; return; }
  if (!s || s.h !== h) s = ui.find = newFind(h);
  if (!findPlace(sim.w, h, s)) { ui.find = null; return; } // gone, or in her hand
  if (phase === 'down') { s.down = true; return; }
  s.down = false; // 'go': the tap
  if (ui.follow !== h) ui.follow = 0; // (following somebody else: that ends; following this one, it carries on)
  const now = performance.now();
  goFind(s, cam, data.ui.locator, now, card());
  if (!s.glide) found(sim.w, s, now); // already there: the heart now
}
function find(w) {
  const s = ui.find;
  let dir = -1;
  if (s) {
    if (!findPlace(w, s.h, s) || (s.glide && ui.follow && ui.follow !== s.h)) ui.find = null; // (gone; or a double tap follows another)
    else {
      const box = s.glide || s.down ? card() : null;
      if (stepFind(s, cam, data.ui.locator, ui.now, box)) found(w, s, ui.now);
      if (s.down && selected !== s.h) s.down = false; // (the card went while her finger was on it)
      if (s.down && edgeArrow(cam, s.x, s.y - 4, (data.ui.locator.edge + arrowPics[0].w / 2) * cam.dpr, arrowAt, box)) dir = arrowAt.dir;
      if (!s.down && !s.glide && !(s.t0 && ui.now - s.t0 < data.ui.locator.heartMs)) ui.find = null; // done
    }
  }
  if (dir >= 0) {
    const p = arrowPics[dir & 1], st = arrowEl.style;
    if (dir !== arrowShown) { st.backgroundImage = p.url; st.width = p.w + 'px'; st.height = p.h + 'px'; st.transform = `rotate(${(dir >> 1) * 90}deg)`; }
    st.left = Math.round(arrowAt.x / cam.dpr - p.w / 2) + 'px'; st.top = Math.round(arrowAt.y / cam.dpr - p.h / 2) + 'px';
  }
  if (dir !== arrowShown) { arrowEl.hidden = dir < 0; arrowShown = dir; }
}
const MAX_FRAME_SEC = 0.25, MAX_STEPS_PER_FRAME = 8, FRAME_MS = 100;
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
    const t0 = performance.now();
    try {
      while (budget >= step && n < MAX_STEPS_PER_FRAME) {
        sim.tick(); budget -= step; n++;
        try { // before the sounds: the Because system reads the events ring too
          const records = because.step(sim.w);
          doll.note(sim.w, records);
          if (scrap) scrap.step(sim.w, records);
          counts.records(records);
        } catch (e) { report('because', e); }
        audio.drain(sim.w); // this step's sounds (the ring holds one step's events)
        if (performance.now() - t0 > FRAME_MS) break;
      }
    } catch (e) { simFailed('step', e); }
    if (n === MAX_STEPS_PER_FRAME || budget >= step) budget = Math.min(budget, step);
  }
  try { if (bench) { if (!bench.done) benchFrame(now); } else saver.frame(now); } catch (e) { report(bench ? 'bench' : 'save', e); }
  try {
    renderer.animate(w, Math.min(dt, 0.05));
    cv.style.transform = w.shake > 0 ? `translate(${(rand() * 6 - 3) | 0}px,${(rand() * 6 - 3) | 0}px)` : '';
    ui.now = performance.now();
    try { news.frame(Math.min(dt, 0.05)); } catch (e) { report('news', e); } // the ticker moves on real time, not sim time
    if (ufoAt && w.tick >= ufoAt.tick && !broken) { gameGives(() => sim.command({ t: 'place', kind: 'ufo', x: ufoAt.x, y: ufoAt.y })); ufoSeen(data.starter); ufoAt = null; } // (the game's doing)
    audio.drain(w); // events from commands given this frame (powers)
    audio.frame(w, cam, [wrap.clientWidth, wrap.clientHeight], paused || broken, (w.time % w.daySec) / w.daySec > w.R.nightFrac);
    for (const song of audio.newSongs()) status.post(str('ui.song.unlocked'), { title: song.title }); // (its template and its value: a title is never a blank, whatever it holds)
    follow(w);
    find(w); // design 19 A6
    railKnob();
    renderer.frame(w, selected, rand, broken ? 1 : budget / step, ui);
  } catch (e) {
    report('draw', e);
    const g = cv.getContext('2d'); // a draw that failed half way may leave a clip or a saved state behind
    if (g.reset) g.reset(); else { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; }
  }
  hudT -= dt;
  if (hudT <= 0) {
    hudT = 0.25;
    if (moving && (ent(sim.w, moving) < 0 || sim.w.E.inside[ent(sim.w, moving)])) { stopMove(); selected = 0; } // (the one she was moving went indoors, aboard, into her hand, or is gone)
    try { hud.update(sim, selected, !!moving); } catch (e) { report('hud', e); } // (while she chooses where, Move's line holds the space)
    if (moving) news.pin(moveLine);
    try { doll.update(sim, moving ? 0 : selected); } catch (e) { report('doll', e); } // (while she chooses where, the card is put away)
    try { if (scrap) scrap.tick(sim.w); } catch (e) { report('scrap', e); }
    showUndo();
    if (broken) news.pin(str('ui.oops')); // the way out stays on screen, whatever was tapped since
  }
}
requestAnimationFrame(() => { init().catch((e) => simFailed('start', e)); requestAnimationFrame(loop); });
// Hidden (another app, the lock button, the tab closing): write now. pagehide covers a close that skips it.
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && !bench) saver.hide(); });
window.addEventListener('pagehide', () => { if (!bench) saver.hide(); });

// Back. A sideways swipe on the tray's scrollers can still count as the browser's back gesture, and back would
// throw the world away. A guard entry in the history, set again on every tap, takes the first back; the status
// line says so, and a second back leaves.
const armBack = () => { if (!history.state || !history.state.tw) history.pushState({ tw: 1 }, '', location.href); };
document.addEventListener('pointerdown', armBack, true);
window.addEventListener('popstate', () => { if (!broken) status.post(str('ui.backAgain')); });

// The counters' card (?counts, design 14 §7 T14). Seven seconds and a count of days, on the device that made
// them; there is no upload and no identifier. It draws over the field and goes at a tap.
function showCounts() {
  const box = document.createElement('div');
  box.id = 'counts-card';
  const h = document.createElement('b');
  h.textContent = str('counts.title');
  box.appendChild(h);
  for (const line of counts.lines(str)) { const p = document.createElement('p'); p.textContent = line; box.appendChild(p); }
  box.onclick = () => box.remove();
  wrap.appendChild(box);
}

// ?debug exposes the running sim for dev tools (dev/browser-checks.mjs). Nothing reads it otherwise.
if (Q.has('debug')) window.__tw = { data, get sim() { return sim; }, get speed() { return speed; }, get paused() { return paused; }, get broken() { return broken; }, errors, cam, renderer, saver, get store() { return store; }, audio, ui, because, counts, news, get scrap() { return scrap; } };
