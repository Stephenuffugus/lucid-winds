/* Browser gate `fight` (Weapons v1 step 1, docs/WEAPONS-V1.md 13.1): the first fight, by real input. A flat floor room
 * (a Frost room: its one lamp at the top, its floor a full width run) loaded through SB_DEV.loadRecord; its chest set on
 * the floor at (5, 46), its loot cleared and its moths laid by hand before the first state is kept (named liberties, as
 * the loot gate's: no fixture puts a chest and three frozen moths on one floor). Steering by real arrow keys, A and B by
 * real touches on #btnA and #btnB; the loop held and stepped. At 412x915, 360x780 and 320x568 (reduced motion at 320):
 *   - before the chest: two empty slot boxes (the charm's hidden) and a jump throws nothing;
 *   - the chest by a real walk: its voice and the equip voice, the +15, the slot's icon (its pixels equal the frame
 *     decoded here from the page's SPRITES), the world never held on that step or the next, no dialog, never modal;
 *   - the pickup card: its name and sentence equal COPY's (evaluated here from the page's source), in view, taking no
 *     tap, clear of Pause and the drawn controls and of the bug's drawn box, gone in about 2.5 s (no animation on it under
 *     reduced motion);
 *   - Play it again from the clear card: the new room's slots and HUD equal the cleared room's before its first step,
 *     and its chest gives the other weapon;
 *   - a real A tap throws (the throw voice): the boomerang drawn as Astra's fx_projectiles (ART2), every opaque pixel
 *     the frame decoded here from the page's SPRITES, out 5 cells and back, a frozen
 *     moth ahead killed (the pop drawn, the count +3 and `+3` under it, the pop voice);
 *   - a second jump inside the cooldown jumps and throws nothing; the jump box is `cool` for exactly JUMP_SLOT_CD_F steps;
 *   - a real B dive's landing and a real B dash each send the shock (drawn at both fronts, the shock voice) and kill a
 *     floor moth 3 cells off;
 *   - the HUD writes nothing over 30 quiet steps (a MutationObserver counts the records);
 *   - a chest laid near the room's top with the bug beside it (the camera at the top): the card docks low, clear of it,
 *     and as the bug falls the room's height into that place the card moves back to the top, never over it;
 *   - #top never overflows (scrollWidth at most clientWidth) with 4 hearts and both icons; zero page errors.
 *   - ART2 (Q161), ART3: the icon is Astra's icon_weapons glyph named by its code (576 pixels); the shock is her ring split at
 *     its centre, a half at each front; the kill's pop her enemy_death clip; a non lethal hit on a frozen 8 quarter
 *     jelly draws her enemy_hit burst over it, its four frames over the hurt; each drawn record's opaque pixels equal
 *     its frame decoded here, except where the hero or a later record covers them.
 * At 412x915 too, the sitting: Play it again again (both weapons carried), the recording replayed on a fresh sim made
 * from SB_DEV.roomOpts() equals the live hash; Title through the pause card ends it (the sample room starts empty); a
 * death after the chest: Again restarts with the gear the bug walked in with.
 *
 * SB_FIGHT_SIZES=412 runs only the named widths (redwatch's fight rows each name a 412 line; check.js runs all three).
 *
 * Watched red by CHEST_NO_WEAPON, CHEST_STOPS_FOR_EMPTY, HUD_STALE, HUD_EVERY_STEP, GOT_TAKES_TAPS, GOT_STAYS,
 * GOT_OVER_BUG, GOT_STAYS_OVER_BUG, THROW_SILENT, GEAR_LOST_ON_NEXT_ROOM, GEAR_KEPT_THROUGH_TITLE, DEATH_KEEPS_PICKUP, ROOM_OPTS_MISSING, and ART2's ICON_PLACEHOLDER, BOOMERANG_PLACEHOLDER,
 * SHOCK_WHOLE_RING, POP_PLACEHOLDER and HIT_NO_BURST. */
import { serve, launch, newPage, gotoGame, ready, reporter, tap, sleep, GAME } from './harness.mjs';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const R = reporter('FIGHT');
const SBN = createRequire(import.meta.url)(join(GAME, 'tools', 'core-loader.js')).loadCoreFull(join(GAME, 'index.html')).SB;
const SRC = readFileSync(process.env.SB_PAGE || join(GAME, 'index.html'), 'utf8');
/* COPY and SPRITES evaluated here from the page's source, as the lint reads them (never read back from the page) */
const COPY = (() => {
  const at = SRC.indexOf('ui.COPY = Object.freeze(') + 'ui.COPY = Object.freeze('.length; let d = 0, k = at;
  for (; k < SRC.length; k++) { if (SRC[k] === '{') d++; else if (SRC[k] === '}') { d--; if (d === 0) break; } }
  return vm.runInNewContext('(' + SRC.slice(at, k + 1) + ')');
})();
const SPR = vm.runInNewContext(SRC.match(/\/\* SPRITES BEGIN \*\/([\s\S]*?)\/\* SPRITES END \*\//)[1] + '\n;SPRITES');
const RGB = SBN.palette.RGB, I = SBN.palette.I, T = SBN.TUNING, K = SBN.K;
const WPN = ['', 'J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8', 'D1'];
/* ART3 (Astra's round 2): an icon is Astra's icon_weapons glyph named by the weapon's code (J1, D1), the gate's own
   reading of the strip, never the page's lookup (H-spr-1 pins J1 and D1 to round 1's boomerang and anvil boots) */
const ICON_NAME = new Proxy({}, { get: (_, id) => (COPY.wpn[id] ? String(id) : '') });
const iconPx = id => SPR.icon_weapons.frames[ICON_NAME[id]].split('/').map(r => [...r].map(c => c === '.' ? null : RGB[parseInt(c, 16)].join(','))).flat();
void I;
/* ART2: a drawn record's frame decoded here ('<' mirrored, the record's sx, sy the part of the frame it drew) */
const frameRows = key => { const m = key.match(/^([a-z_]+)\.([a-z0-9_]+?)(<?)$/); if (!m || !SPR[m[1]] || !SPR[m[1]].frames[m[2]]) return null; const rows = SPR[m[1]].frames[m[2]].split('/'); return m[3] ? rows.map(r => r.split('').reverse().join('')) : rows; };

const srv = await serve();
const browser = await launch();
const W = 24, FLOOR = 46, CHEST = 5, MOTH = 1;
const rows = []; for (let y = 0; y < 48; y++) rows.push(y === 47 ? '1'.repeat(W) : '4'.repeat(W));
rows[3] = '4'.repeat(10) + '666' + '4'.repeat(11); rows[4] = '4'.repeat(10) + '111' + '4'.repeat(11);   /* the lamp: the exit */
const REC = JSON.stringify({ v: 1, w: W, h: 48, mode: 0, focal: null, rows, rows2: null });

/* the page's probes, installed once a page is up */
async function install(page) {
  await page.evaluate(() => {
    window.__probe = () => {
      const s = window.SB.game.state, b = [...document.querySelectorAll('#slots .slot')], got = document.getElementById('got');
      return { frame: s.frame, x: s.hero.x, y: s.hero.y, ground: s.hero.ground, vy: s.hero.vy, slots: s.hero.slots.slice(), cd: s.hero.cd[0], dp: s.room.dp, compare: s.room.compare,
        open: s.chest.open, ev: s.ev, dpn: document.getElementById('dpn').textContent, plus: document.getElementById('dpplus').classList.contains('on') ? document.getElementById('dpplus').textContent : '',
        boxes: b.map(e => ({ empty: e.classList.contains('empty'), cool: e.classList.contains('cool'), hidden: e.hidden, label: e.getAttribute('aria-label') })),
        got: got ? got.classList.contains('on') : false, modal: document.body.classList.contains('sb-modal'), screen: window.SB_DEV.screen(),
        dialogs: [...document.querySelectorAll('[role=dialog]')].filter(d => getComputedStyle(d).display !== 'none' && d.getBoundingClientRect().height > 0).map(d => d.id),
        proj: s.proj.filter(p => p.live).map(p => ({ kind: p.kind, x: p.x, a: p.a, b: p.b, mode: p.mode, age: p.age })), hp: s.enemies.map(e => e.hp), heard: [] };
    };
    window.__step = n => { const v0 = window.SB.audio.events.length; let p; for (let k = 0; k < (n || 1); k++) { window.SB_DEV.step(1); p = window.__probe(); } return Object.assign(p, { heard: window.SB.audio.events.slice(v0).map(e => e.name) }); };
  });
}
/* a room from the record with the liberties: the chest at (cx, 46) shut, the loot cleared, the moths [col, row, frozen]
   laid; the first state kept in __s0, one draw */
const setRoom = (page, cx, moths) => page.evaluate((str, W, FLOOR, cx, moths, MOTH) => {
  window.SB_DEV.hold(true);
  const ok = window.SB_DEV.loadRecord(str), st = window.SB.game.state;
  st.chest.idx = FLOOR * W + cx; st.chest.open = 0; st.loot.length = 0; st.enemies.length = 0;
  for (const [c, r, fz] of moths) st.enemies.push({ kind: MOTH, x: c * 4096, y: r * 4096, vx: 0, vy: 0, hp: 4, state: 0, timer: 0, dir: 1, home: r * W + c, elite: 0, frozen: fz, stunned: 0, hurt: 0 });
  window.__s0 = structuredClone(st);
  window.SB_DEV.step(0);
  return { ok: !!ok, slots: st.hero.slots.slice(), screen: window.SB_DEV.screen(), x: st.hero.x };
}, REC, W, FLOOR, cx, moths, MOTH);
/* lay a frozen moth now (a liberty mid room: a fresh target for a weapon) */
const layMoth = (page, c, r) => page.evaluate((c, r, W, MOTH) => { const st = window.SB.game.state; st.enemies.push({ kind: MOTH, x: c * 4096, y: r * 4096, vx: 0, vy: 0, hp: 4, state: 0, timer: 0, dir: 1, home: r * W + c, elite: 0, frozen: 1 << 20, stunned: 0, hurt: 0 }); return st.enemies.length - 1; }, c, r, W, MOTH);
const probe = page => page.evaluate(() => window.__probe());
const stepN = (page, n) => page.evaluate(n => window.__step(n), n);
/* the boxes' and the card's geometry, and the card's words */
const card = page => page.evaluate(() => {
  const el = document.getElementById('got'), r = el.getBoundingClientRect(), cs = getComputedStyle(el), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  const over = ['#pause', '#btnA .glyph', '#btnB .glyph', '#rocker .zl', '#rocker .zr'].filter(s => { const e = document.querySelector(s); if (!e) return false; const b = e.getBoundingClientRect(); return b.height > 0 && b.right > r.left && b.left < r.right && b.bottom > r.top && b.top < r.bottom; });
  const hd = window.SB.render.drawn.hero, cv = document.getElementById('view'), vr = cv.getBoundingClientRect(), k = vr.height / cv.height;
  const bug = hd && hd.key ? { top: vr.top + hd.y * k, bottom: vr.top + (hd.y + hd.h) * k, left: vr.left + hd.x * k, right: vr.left + (hd.x + hd.w) * k } : null;
  const overBug = !!bug && bug.right > r.left && bug.left < r.right && bug.bottom > r.top && bug.top < r.bottom;
  return { on: el.classList.contains('on'), low: el.classList.contains('low'), name: el.querySelector('b').textContent, says: el.querySelector('span').textContent, real: r.width > 0 && r.height > 0,
    inView: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, noTap: cs.pointerEvents === 'none' && hit !== el && !el.contains(hit), hitName: hit ? hit.id || hit.className || hit.tagName : 'nothing',
    over, overBug, still: el.getAnimations().length === 0, box: [r.left, r.top, r.width, r.height].map(Math.round), opacity: Number(cs.opacity) };
});
const slotPx = (page, k) => page.evaluate(k => { const cv = document.querySelectorAll('#slots .slot canvas')[k], d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, out = []; for (let i = 0; i < d.length; i += 4) out.push(d[i + 3] === 0 ? null : d[i] + ',' + d[i + 1] + ',' + d[i + 2]); return out; }, k);
const audioOn = async page => { let st = 'none'; for (let k = 0; k < 30 && st !== 'running'; k++) { await sleep(100); st = await page.evaluate(() => window.SB_DEV.audioState()); } return st; };
/* walk by a real arrow key until the chest opens (or n steps), then one more; the trace of probes */
async function walkToChest(page, key) {
  const trace = [await probe(page)];
  await page.keyboard.down(key);
  let at = -1;
  for (let k = 0; k < 120 && (at < 0 || trace.length - 1 < at + 1); k++) { const p = await stepN(page, 1); trace.push(p); if (p.open && at < 0) at = trace.length - 1; }
  await page.keyboard.up(key);
  return { trace, at };
}
/* ART2: every drawn record of a kind against its frame decoded here from the page's SPRITES: each opaque pixel of the
   part it drew equals the canvas, except where the hero or a record drawn after it covers it (the hero draws last) */
const drawnEqual = async (page, kind) => {
  const got = await page.evaluate(kind => {
    const all = window.SB_DEV.spriteRects(), cv = document.getElementById('view'), d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    const out = all.proj.map((r, i) => ({ i, kind: r.kind, key: r.key, x: r.x, y: r.y, w: r.w, h: r.h, sx: r.sx, sy: r.sy, px: [] }));
    for (const r of out) if (r.kind === kind) for (let y = -1; y < r.h; y++) for (let x = 0; x < r.w; x++) { const X = r.x + x, Y = r.y + y; const o = (Y * cv.width + X) * 4; r.px.push(X < 0 || Y < 0 || X >= cv.width || Y >= cv.height ? null : d[o] + ',' + d[o + 1] + ',' + d[o + 2]); }
    const h = all.hero ? { key: all.hero.key, x: all.hero.x, y: all.hero.y, w: all.hero.w, h: all.hero.h, sx: 0, sy: 0 } : null;
    return { recs: out, hero: h };
  }, kind);
  const mine = got.recs.filter(r => r.kind === kind), bad = []; let n = 0;
  /* covered: an opaque pixel of the hero's frame or of a record drawn later lies on it (each frame decoded here) */
  const covered = (r, X, Y) => [got.hero].concat(got.recs.filter(q => q.i > r.i)).some(q => { if (!q || X < q.x || X >= q.x + q.w || Y < q.y || Y >= q.y + q.h) return false; const fr = frameRows(q.key.replace('*', '')); return !fr || fr[q.sy + Y - q.y][q.sx + X - q.x] !== '.'; });
  for (const r of mine) {
    const rows = frameRows(r.key);
    if (!rows) { bad.push(r.key + ' has no frame in SPRITES'); continue; }
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
      const ch = rows[r.sy + y][r.sx + x], c = r.px[(y + 1) * r.w + x];
      if (ch === '.' || c === null || covered(r, r.x + x, r.y + y)) continue;
      n++; if (c !== RGB[parseInt(ch, 16)].join(',')) bad.push(r.key + ' ' + (r.sx + x) + ',' + (r.sy + y) + ' ' + c);
    }
  }
  /* the rim (ART2, the shock): the pixel just above each column's topmost opaque pixel, where nothing later covers it */
  let rimN = 0; const rimBad = [], INK = RGB[0].join(',');
  for (const r of mine) { const rows = frameRows(r.key); if (!rows) continue; for (let x = 0; x < r.w; x++) { let t = -1; for (let y = 0; y < r.h; y++) if (rows[r.sy + y][r.sx + x] !== '.') { t = y; break; } if (t < 0 || covered(r, r.x + x, r.y + t - 1)) continue; const c = r.px[t * r.w + x]; if (c === null) continue; rimN++; if (c !== INK) rimBad.push(r.key + ' col ' + (r.sx + x) + ' ' + c); } }
  return { rects: mine.length, keys: mine.map(r => r.key + (r.sx ? '@' + r.sx : '')), sizes: mine.map(r => r.w + 'x' + r.h), n, bad, rimN, rimBad };
};

try {
  /* SB_FIGHT_SIZES=412 (a comma list of widths) runs only those sizes: redwatch's fight rows all name a 412 line */
  const only = process.env.SB_FIGHT_SIZES ? process.env.SB_FIGHT_SIZES.split(',').map(Number) : null;
  for (const [w, h, rm] of [[412, 915, false], [360, 780, false], [320, 568, true]].filter(z => !only || only.includes(z[0]))) {
    const { page, errors } = await newPage(browser, { width: w, height: h });
    if (rm) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await gotoGame(page, srv.base); await ready(page);
    await tap(page, '.art');   /* a real tap: the audio context's unlock */
    await install(page);
    const s0 = await setRoom(page, CHEST, []);
    const ctx = await audioOn(page);
    let p = await probe(page);
    R.say(s0.ok && s0.screen === 'play' && JSON.stringify(s0.slots) === '[0,0,0]' && p.boxes.length === 3 && p.boxes[0].empty && p.boxes[1].empty && p.boxes[2].hidden && !p.boxes[0].hidden && !p.boxes[1].hidden,
      w + ': a fresh sitting\'s room shows two empty slot boxes and hides the charm\'s (' + JSON.stringify(p.boxes.map(b => (b.hidden ? 'hidden' : b.empty ? 'empty' : 'full'))) + ', labels ' + p.boxes.slice(0, 2).map(b => b.label).join(' / ') + ')');
    R.say(p.boxes[0].label === COPY.slotNone.replace('{slot}', COPY.slotJump) && p.boxes[1].label === COPY.slotNone.replace('{slot}', COPY.slotDive), w + ': the empty boxes say so in COPY\'s words');
    /* a jump with nothing equipped throws nothing */
    await stepN(page, 4);
    await tap(page, '#btnA'); const j0 = await stepN(page, 1);
    R.say(!j0.ground && j0.vy < 0 && j0.proj.length === 0 && !j0.heard.includes('throw'), w + ': a jump with no weapon jumps and throws nothing (' + j0.heard.join(', ') + ')');
    for (let k = 0; k < 60 && !(await probe(page)).ground; k++) await stepN(page, 1);
    await stepN(page, 2);

    /* the chest by a real walk left */
    const c1 = await walkToChest(page, 'ArrowLeft'), at1 = c1.at, ch = at1 > 0 ? c1.trace[at1] : null, nx = at1 > 0 ? c1.trace[at1 + 1] : null;
    const put1 = ch ? ch.slots.findIndex(c => c > 0) : -1, id1 = ch && put1 >= 0 ? WPN[ch.slots[put1]] : '';
    R.say(!!ch && ch.heard.includes('chest') && ch.heard.includes('equip') && ch.dp === T.DP_CHEST && ch.dpn === String(T.DP_CHEST) && ch.plus === '+' + T.DP_CHEST && put1 >= 0 && ch.compare === 0,
      w + ': the chest opens by a real walk with its voice and the equip voice (' + (ch ? ch.heard.join(', ') : 'never') + '), pays ' + (ch ? ch.dpn : '?') + ' with ' + (ch ? ch.plus : '?') + ' under the count, and equips ' + id1 + ' into an empty slot at once');
    R.say(!!ch && !!nx && ch.x !== c1.trace[at1 - 1].x && nx.x !== ch.x && !ch.dialogs.length && !nx.dialogs.length && !ch.modal && !nx.modal,
      w + ': the world is never held: the bug walks on the chest\'s step and the next (x ' + (ch ? [c1.trace[at1 - 1].x, ch.x, nx ? nx.x : '?'].map(v => (v / 256).toFixed(1)).join(', ') : '?') + '), no dialog, never modal');
    const px1 = put1 >= 0 ? await slotPx(page, put1) : [], want1 = id1 ? iconPx(id1) : [];
    R.say(!!id1 && px1.length === 576 && px1.every((c, i) => c === want1[i]) && !ch.boxes[put1].empty, w + ': the ' + (put1 === 0 ? 'jump' : 'dive') + ' box shows ' + id1 + '\'s icon (icon_weapons.' + ICON_NAME[id1] + '), its 576 pixels equal the frame decoded from the page\'s SPRITES (' + px1.filter((c, i) => c !== want1[i]).length + ' differ)');
    const g1 = await card(page);
    R.say(g1.on && g1.name === COPY.wpn[id1] && g1.says === COPY.wpnSays[id1], w + ': the pickup card names ' + JSON.stringify(g1.name) + ' and says ' + JSON.stringify(g1.says) + ', COPY\'s words');
    R.say(g1.real && g1.inView && g1.noTap && g1.over.length === 0 && !g1.overBug, w + ': the card is in view (box ' + g1.box.join(' ') + '), takes no tap (a thumb lands on ' + g1.hitName + '), clear of Pause and the drawn controls' + (g1.over.length ? ' (over ' + g1.over.join(' ') + ')' : '') + ' and of the bug\'s drawn box' + (g1.overBug ? ' (OVER THE BUG)' : ''));
    if (rm) R.say(g1.still && g1.opacity > 0.99, w + ': with reduced motion the card stands still at full opacity (' + (g1.still ? 'no animation' : 'animated') + ', ' + g1.opacity + ')');
    const t0 = Date.now();
    const goneAt = await page.waitForFunction(() => !document.getElementById('got').classList.contains('on'), { timeout: 6000, polling: 50 }).then(() => Date.now() - t0).catch(() => -1);
    R.say(goneAt >= 1800 && goneAt <= 3200, w + ': the card goes in about 2.5 s (' + goneAt + ' ms after the check)');

    /* clear, then Play it again: the gear carried, shown before the first step; its chest gives the other weapon */
    await page.evaluate(() => { window.SB_DEV.goto('exit'); window.SB_DEV.step(1); });
    await tap(page, '#again');
    const s2 = await setRoom(page, CHEST, []);
    p = await probe(page);
    R.say(s2.ok && JSON.stringify(s2.slots) === JSON.stringify(ch ? ch.slots : null) && !p.boxes[put1].empty && p.frame === 0, w + ': Play it again starts the next room with the cleared room\'s gear (' + s2.slots.join(',') + '), its box full before the first step');
    const c2 = await walkToChest(page, 'ArrowLeft'), ch2 = c2.at > 0 ? c2.trace[c2.at] : null, id2 = ch2 ? WPN[ch2.slots[1 - put1]] : '';
    R.say(!!ch2 && ch2.heard.includes('equip') && ch2.slots[0] > 0 && ch2.slots[1] > 0 && id2 && id2 !== id1, w + ': its chest gives the other weapon (' + id2 + '), both slots full now');
    await page.waitForFunction(() => !document.getElementById('got').classList.contains('on'), { timeout: 6000, polling: 50 }).catch(() => {});

    /* the throw: face right (a few real steps), a frozen moth 3 cells ahead on the floor row */
    await page.keyboard.down('ArrowRight'); await stepN(page, 3); await page.keyboard.up('ArrowRight'); await stepN(page, 8);
    p = await probe(page);
    const col = Math.floor((p.x + 6 * 256) / 4096), mi = await layMoth(page, col + 3, FLOOR), dpA = p.dp;
    await tap(page, '#btnA');
    const th = [await stepN(page, 1)];
    let popEq = null;   /* ART2: the kill's pop read on the canvas on the step it is first drawn */
    for (let k = 0; k < 80; k++) { const q = await stepN(page, 1); th.push(q); if (!popEq && q.hp[mi] === 0 && q.proj.some(e => e.kind === 3)) popEq = await drawnEqual(page, 3); }
    const b = th.flatMap(q => q.proj.filter(e => e.kind === 1)), far = b.length ? Math.max(...b.map(e => Math.abs(e.x - e.a))) : 0, back = th.some(q => q.proj.some(e => e.kind === 1 && e.mode === 1));
    const killAt = th.findIndex(q => q.hp[mi] === 0), kq = killAt >= 0 ? th[killAt] : null;
    R.say(th[0].heard.includes('throw') && th[0].proj.some(e => e.kind === 1) && far === K.J1_REACH && back && th[th.length - 1].proj.every(e => e.kind !== 1),
      w + ': a real A tap throws the boomerang with the throw voice (' + th[0].heard.join(', ') + '), out ' + (far / 4096).toFixed(2) + ' cells and back, caught');
    R.say(!!kq && kq.heard.includes('pop') && kq.dp === dpA + T.DP_FODDER && kq.dpn === String(dpA + T.DP_FODDER) && kq.plus === '+' + T.DP_FODDER && kq.proj.some(e => e.kind === 3),
      w + ': it kills the frozen moth ahead with the pop voice, the count ' + (kq ? kq.dpn : '?') + ' and ' + (kq ? kq.plus : '?') + ' under it, the pop drawn (' + (kq ? kq.proj.map(e => e.kind).join(' ') : 'never killed') + ')');

    R.say(!!popEq && popEq.rects === 1 && /^fx_enemy_hit\.enemy_death_0$/.test(popEq.keys[0]) && popEq.sizes[0] === '32x32' && popEq.n >= 8 && popEq.bad.length === 0,
      w + ': the kill\'s pop is Astra\'s ' + (popEq ? popEq.keys.join(' ') + ' (' + popEq.sizes.join(' ') + '), its ' + popEq.n + ' opaque pixels equal the frame' + (popEq.bad.length ? ' (' + popEq.bad.length + ' differ: ' + popEq.bad.slice(0, 3).join('; ') + ')' : '') : 'never drawn'));

    /* ART2: a hit's burst over a live enemy: a frozen jelly of 8 quarters 2 cells ahead takes the throw and lives; the
       burst read on the canvas on the hit's first drawn step, its frames walked over the hurt */
    for (let k = 0; k < 60 && !(await probe(page)).ground; k++) await stepN(page, 1);
    await stepN(page, 40); p = await probe(page);
    const jc = Math.floor((p.x + 6 * 256) / 4096) + 2;
    const ji = await page.evaluate((c, r, W) => { const st = window.SB.game.state; st.enemies.push({ kind: 3, x: c * 4096, y: r * 4096, vx: 0, vy: 0, hp: 8, state: 0, timer: 0, dir: 1, home: r * W + c, elite: 0, frozen: 1 << 20, stunned: 0, hurt: 0 }); window.SB_DEV.step(0); return st.enemies.length - 1; }, jc, FLOOR, W);
    await tap(page, '#btnA');
    let hitEq = null; const hitKeys = [];
    for (let k = 0; k < 30; k++) {
      await stepN(page, 1);
      const hk = await page.evaluate(() => window.SB_DEV.spriteRects().proj.filter(r => r.kind === 'hit').map(r => r.key));
      if (hk.length) { hitKeys.push(hk[0]); if (!hitEq) hitEq = await drawnEqual(page, 'hit'); } else if (hitKeys.length) break;
    }
    const jhp = (await probe(page)).hp[ji];
    R.say(!!hitEq && hitEq.rects === 1 && /^fx_enemy_hit\.enemy_hit_0$/.test(hitEq.keys[0]) && hitEq.n >= 8 && hitEq.bad.length === 0 && jhp > 0 && hitKeys.length >= K.HURT_FLASH_F - 1 && hitKeys.length <= K.HURT_FLASH_F
      && hitKeys[hitKeys.length - 1] === 'fx_enemy_hit.enemy_hit_3' && hitKeys.every((k, i) => i === 0 || k >= hitKeys[i - 1]),
      w + ': a hit on a live jelly draws Astra\'s burst over it, ' + (hitEq ? hitEq.n : 0) + ' opaque pixels of ' + (hitEq ? hitEq.keys[0] : 'nothing') + ' equal the frame' + (hitEq && hitEq.bad.length ? ' (' + hitEq.bad.length + ' differ: ' + hitEq.bad.slice(0, 3).join('; ') + ')' : '') + ', its frames over the hurt\'s ' + K.HURT_FLASH_F + ' steps: ' + hitKeys.map(k => k.slice(-1)).join(' ') + ' (the jelly lives, ' + jhp + ' quarters)');

    /* the boomerang on the canvas (a fresh throw once the cooldown has run) */
    for (let k = 0; k < 60 && !(await probe(page)).ground; k++) await stepN(page, 1);
    await stepN(page, 40);
    await tap(page, '#btnA'); await stepN(page, 6);
    const bc = await drawnEqual(page, 1);
    R.say(bc.rects === 1 && /^fx_projectiles\.boomerang_[0-3]<?$/.test(bc.keys[0]) && bc.sizes[0] === '32x32' && bc.n >= 40 && bc.bad.length === 0,
      w + ': the boomerang is Astra\'s ' + bc.keys.join(' ') + ' (' + bc.sizes.join(' ') + '), its ' + bc.n + ' opaque pixels equal the frame decoded from the page\'s SPRITES' + (bc.bad.length ? ' (' + bc.bad.length + ' differ: ' + bc.bad.slice(0, 3).join('; ') + ')' : ''));

    /* the cooldown: a hop landed inside it, then A: it jumps and throws nothing; the jump box cool for exactly 36 steps */
    const cdTrace = [await probe(page)];
    for (let k = 0; k < 60 && !cdTrace[cdTrace.length - 1].ground; k++) cdTrace.push(await stepN(page, 1));
    await tap(page, '#btnA'); const hop2 = await stepN(page, 1); cdTrace.push(hop2);
    for (let k = 0; k < 60; k++) cdTrace.push(await stepN(page, 1));
    const fireIdx = 0, coolSteps = cdTrace.filter(q => q.boxes[0].cool).length;
    R.say(hop2.vy < 0 && !hop2.heard.includes('throw') && hop2.cd > 0 && !hop2.proj.some(e => e.kind === 1 && e.age === 1), w + ': a jump inside the cooldown jumps (vy ' + hop2.vy + ') and throws nothing (' + hop2.heard.join(', ') + ')');
    /* the throw was the first of the 6 steps before cdTrace[0] (its state the 6th after the throw's own): the five
       unprobed cool states and the trace's count */
    R.say(coolSteps + 5 === K.JUMP_SLOT_CD_F && cdTrace[0].boxes[0].cool && cdTrace[cdTrace.length - 1].boxes[0].cool === false, w + ': the jump box is cool for exactly JUMP_SLOT_CD_F steps from the throw (' + (coolSteps + 5) + ' of ' + K.JUMP_SLOT_CD_F + ')');
    void fireIdx;

    /* the dive: a frozen moth 3 cells behind the bug; a real A, then a real B in the air; the landing's shock */
    for (let k = 0; k < 60 && !(await probe(page)).ground; k++) await stepN(page, 1);
    await stepN(page, 40);
    p = await probe(page);
    const c0 = Math.floor((p.x + 6 * 256) / 4096), mb = await layMoth(page, c0 - 3, FLOOR);
    await tap(page, '#btnA'); await stepN(page, 4); await tap(page, '#btnB');
    let dv = null; for (let k = 0; k < 60 && !dv; k++) { const q = await stepN(page, 1); if (q.heard.includes('shock')) dv = q; }
    const dRects = await page.evaluate(() => window.SB_DEV.spriteRects().proj.filter(r => r.kind === 2).length);
    await stepN(page, 4); const dq = await drawnEqual(page, 2);   /* four steps on: the fronts out from under the bug */
    R.say(dq.rects === 2 && dq.keys.every(k => /^fx_shockwave\.anvil_boots_[0-3](@\d+)?$/.test(k)) && dq.keys.some(k => k.endsWith('@24')) && dq.keys.some(k => !k.endsWith('@24')) && dq.n >= 10 && dq.bad.length === 0 && dq.rimN >= 8 && dq.rimBad.length === 0,
      w + ': the shock is Astra\'s ring split at its centre, a half at each front (' + dq.keys.join(', ') + '; ' + dq.sizes.join(', ') + '), its ' + dq.n + ' opaque pixels equal the frame' + (dq.bad.length ? ' (' + dq.bad.length + ' differ: ' + dq.bad.slice(0, 3).join('; ') + ')' : '') + ', an Ink rim above it in ' + dq.rimN + ' columns' + (dq.rimBad.length ? ' (' + dq.rimBad.length + ' not Ink: ' + dq.rimBad.slice(0, 3).join('; ') + ')' : ''));
    await stepN(page, 8); const afterDive = await probe(page);
    R.say(!!dv && dv.proj.some(e => e.kind === 2) && dRects === 2 && afterDive.hp[mb] === 0, w + ': a real B dive\'s landing sends the shock with its voice, drawn at both fronts (' + dRects + ' rects), and kills a floor moth 3 cells behind (' + (afterDive.hp[mb] === 0) + ')');
    /* the dash: a frozen moth 3 cells ahead; a real B on the ground */
    await stepN(page, 20); p = await probe(page);
    const c1d = Math.floor((p.x + 6 * 256) / 4096), md = await layMoth(page, c1d + 3, FLOOR);
    await tap(page, '#btnB'); const ds = await stepN(page, 1); await stepN(page, 14); const afterDash = await probe(page);
    R.say(ds.heard.includes('shock') && ds.proj.some(e => e.kind === 2) && !ds.proj.some(e => e.kind === 1) && afterDash.hp[md] === 0, w + ': a real B dash sends the shock on its first step with its voice (' + ds.heard.join(', ') + ') and kills a floor moth 3 cells ahead (' + (afterDash.hp[md] === 0) + ')');

    /* the HUD writes nothing while nothing changes */
    await stepN(page, 40);
    const writes = await page.evaluate(() => { const box = document.getElementById('slots'); let n = 0; const mo = new MutationObserver(r => { n += r.length; }); mo.observe(box, { attributes: true, childList: true, subtree: true, characterData: true }); for (let k = 0; k < 30; k++) window.SB_DEV.step(1); const left = mo.takeRecords().length; mo.disconnect(); return n + left; });
    R.say(writes === 0, w + ': the HUD is written 0 times over 30 quiet steps (' + writes + ' mutation records)');
    const ov = await page.evaluate(() => { const t = document.getElementById('top'); return { sw: t.scrollWidth, cw: t.clientWidth, name: document.getElementById('roomname').getBoundingClientRect().width, hearts: document.querySelectorAll('#hearts i').length }; });
    R.say(ov.sw <= ov.cw && ov.hearts === 4, w + ': the top strip holds Pause, the name, both icons and ' + ov.hearts + ' hearts without overflow (scrollWidth ' + ov.sw + ', clientWidth ' + ov.cw + ', the name ' + Math.round(ov.name) + ' px)');

    /* the card near the top: a fresh sitting (Title), a chest in the bug's own cell high in the room */
    await page.evaluate(() => window.SB_DEV.goto('title'));
    await page.evaluate((str, W) => { window.SB_DEV.hold(true); window.SB_DEV.loadRecord(str); const st = window.SB.game.state; st.loot.length = 0; st.enemies.length = 0; st.hero.x = 3 * 4096 + 512; st.hero.y = 3 * 4096; st.chest.idx = 3 * W + 3; st.chest.open = 0; window.SB_DEV.step(0); }, REC, W);
    const top1 = await stepN(page, 1), gl = await card(page);
    R.say(top1.slots.some(c => c > 0) && gl.on && gl.low && !gl.overBug && gl.inView && gl.over.length === 0, w + ': a chest near the room\'s top with the bug beside it: the card docks low (' + gl.low + '), clear of the bug (box ' + gl.box.join(' ') + ')');
    /* the bug then falls the room's height into the low card's place: each step the card stays off the bug's drawn box,
       moving back to the top (in one evaluate, inside the card's 2.5 s) */
    const fall = await page.evaluate(() => {
      const el = document.getElementById('got'), cv = document.getElementById('view'); let over = 0, onSteps = 0;
      for (let k = 0; k < 90; k++) {
        window.SB_DEV.step(1);
        if (!el.classList.contains('on')) continue;
        onSteps++;
        const hd = window.SB.render.drawn.hero, vr = cv.getBoundingClientRect(), kk = vr.height / cv.height, r = el.getBoundingClientRect();
        if (hd && hd.key && vr.top + hd.y * kk < r.bottom && vr.top + (hd.y + hd.h) * kk > r.top) over++;
      }
      return { over, onSteps, low: el.classList.contains('low'), ground: window.SB.game.state.hero.ground };
    });
    R.say(fall.ground && fall.onSteps >= 60 && fall.over === 0 && !fall.low, w + ': as the bug falls under the docked card, the card moves back to the top and never covers it (' + fall.over + ' steps over the bug in ' + fall.onSteps + ', docked ' + (fall.low ? 'low' : 'at the top') + ' at the end)');
    R.say(ctx === 'running' && errors.length === 0, w + ': the audio ran and zero page errors' + (errors.length ? ' (' + errors.join('; ') + ')' : ''));

    /* the sitting, at 412: Play it again carries both; the roomOpts replay; Title ends it; a death keeps the entry gear */
    if (w === 412) {
      await page.evaluate(() => window.SB_DEV.goto('title'));
      await page.evaluate(str => { window.SB_DEV.hold(true); window.SB_DEV.loadRecord(str); }, REC);
      const g0 = await probe(page);
      await page.evaluate(() => { const st = window.SB.game.state; st.hero.slots[0] = 1; st.hero.slots[1] = 9; window.SB_DEV.goto('exit'); window.SB_DEV.step(1); });   /* a liberty: the bug carries both out */
      await tap(page, '#again');
      const g3 = await probe(page), opts = await page.evaluate(() => window.SB_DEV.roomOpts());
      R.say(JSON.stringify(g0.slots) === '[0,0,0]' && JSON.stringify(g3.slots) === '[1,9,0]' && !g3.boxes[0].empty && !g3.boxes[1].empty && g3.frame === 0 && JSON.stringify(opts.loadout) === '["J1","D1",null]',
        '412: Play it again carries the gear out of a clear (' + g3.slots.join(',') + ', roomOpts ' + JSON.stringify(opts.loadout) + '), shown before the first step');
      await page.keyboard.down('ArrowRight'); await stepN(page, 10); await tap(page, '#btnA'); await stepN(page, 30); await page.keyboard.up('ArrowRight'); await stepN(page, 30);
      const rep = await page.evaluate(() => { const s = window.SB.sim.create(window.SB.game.level, window.SB_DEV.roomOpts()); for (const wd of window.SB.sim.rle.decode(window.SB.input.recording())) window.SB.sim.step(s, wd); return { same: window.SB.sim.hash(s) === window.SB_DEV.hash(), threw: window.SB.audio.played.throw || 0 }; });
      R.say(rep.same, '412: the recording replayed on a fresh sim made from SB_DEV.roomOpts() reaches the live hash (' + rep.same + ')');
      await tap(page, '#pause'); await tap(page, '#pausetitle');
      await tap(page, '#sample');
      const g4 = await probe(page);
      R.say(JSON.stringify(g4.slots) === '[0,0,0]' && g4.boxes[0].empty && g4.boxes[1].empty, '412: Title through the pause card ends the sitting: the sample room starts empty (' + g4.slots.join(',') + ')');
      await page.evaluate(() => window.SB_DEV.goto('title'));
      await setRoom(page, CHEST, []);
      const cd = await walkToChest(page, 'ArrowLeft'), got = cd.at > 0 ? cd.trace[cd.at].slots : null;
      await page.evaluate(() => { const st = window.SB.game.state; st.hero.hearts = 1; st.hero.iframes = 0; st.hero.dashI = 0; st.enemies.push({ kind: 1, x: st.hero.x - 512, y: st.hero.y, vx: 0, vy: 0, hp: 4, state: 0, timer: 0, dir: 1, home: 0, elite: 0, frozen: 0, stunned: 0, hurt: 0 }); for (let k = 0; k < 10 && !st.room.dead; k++) window.SB_DEV.step(1); window.SB_DEV.step(1); });
      const dead = await page.evaluate(() => window.SB_DEV.screen());
      await tap(page, '#deathagain');
      const g5 = await probe(page);
      R.say(!!got && got.some(c => c > 0) && dead === 'dead' && JSON.stringify(g5.slots) === '[0,0,0]' && g5.boxes[0].empty && g5.boxes[1].empty, '412: a death after the chest (' + (got ? got.join(',') : '?') + ', screen ' + dead + '): Again restarts with the gear the bug walked in with (' + g5.slots.join(',') + ')');
      R.say(errors.length === 0, '412 the sitting: zero page errors' + (errors.length ? ' (' + errors.join('; ') + ')' : ''));
    }
    /* W2 (step 2): Twin Darts and Shutter Snap drawn. The slots laid by hand (a liberty: the chest's draw is H-wpn-7's);
       a real A tap shoots two darts with the dart voice, each Astra's twin_darts frame (the left one mirrored), every
       opaque pixel the frame decoded here; then Shutter Snap freezes a live moth beside the bug with the shutter voice,
       and the frozen look (fx_frozen_stunned.frozen_n) is drawn over it, every opaque pixel its frame */
    await page.evaluate(() => window.SB_DEV.goto('title'));
    await setRoom(page, 20, [[14, 30, 1 << 20]]);
    await page.evaluate(() => { window.SB.game.state.hero.slots[0] = 5; });
    await stepN(page, 4);
    await tap(page, '#btnA'); const d1 = await stepN(page, 1); await stepN(page, 2);
    const dEq = await drawnEqual(page, 7);
    R.say(d1.heard.includes('dart') && d1.proj.filter(e => e.kind === 7).length === 2 && dEq.rects === 2 && dEq.keys.some(k => /^fx_projectiles\.twin_darts_\d<$/.test(k)) && dEq.keys.some(k => /^fx_projectiles\.twin_darts_\d$/.test(k)) && dEq.n >= 20 && dEq.bad.length === 0,
      w + ': a real A tap with Twin Darts shoots two darts with the dart voice (' + d1.heard.join(', ') + '), drawn as Astra\'s ' + dEq.keys.join(' ') + ', ' + dEq.n + ' opaque pixels equal the frames' + (dEq.bad.length ? ' (' + dEq.bad.length + ' differ: ' + dEq.bad.slice(0, 3).join('; ') + ')' : ''));
    for (let k = 0; k < 60 && !(await probe(page)).ground; k++) await stepN(page, 1);
    await stepN(page, 40);
    const sp = await probe(page), sc = Math.floor((sp.x + 6 * 256) / 4096);
    const mi2 = await page.evaluate((c, r) => { const st = window.SB.game.state; st.hero.slots[0] = 7; st.enemies.push({ kind: 1, x: c * 4096, y: r * 4096, vx: 0, vy: 0, hp: 4, state: 0, timer: 0, dir: 1, home: r * 24 + c, elite: 0, frozen: 0, stunned: 1 << 20, hurt: 0 }); return st.enemies.length - 1; }, sc + 2, FLOOR);
    await stepN(page, 1);
    await tap(page, '#btnA'); const z1 = await stepN(page, 1); await stepN(page, 1);
    const fz = await page.evaluate(i => window.SB.game.state.enemies[i].frozen, mi2), zEq = await drawnEqual(page, 'frozen');
    R.say(z1.heard.includes('shutter') && fz > 0 && fz <= K.J7_FREEZE_F && z1.hp[mi2] === 4 && zEq.rects >= 1 && zEq.keys.every(k => /^fx_frozen_stunned\.frozen_\d$/.test(k)) && zEq.n >= 20 && zEq.bad.length === 0,
      w + ': a real A tap with Shutter Snap freezes the moth beside the bug (' + fz + ' steps left, hp ' + z1.hp[mi2] + ') with the shutter voice (' + z1.heard.join(', ') + '), its frozen look drawn as ' + zEq.keys.join(' ') + ', ' + zEq.n + ' opaque pixels equal the frame' + (zEq.bad.length ? ' (' + zEq.bad.length + ' differ)' : ''));
    await page.close();
  }
} finally { await browser.close(); await srv.close(); }
R.finish();
