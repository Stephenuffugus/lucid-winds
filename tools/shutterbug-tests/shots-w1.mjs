#!/usr/bin/env node
/* Weapons v1 step 1's shots (docs/WEAPONS-V1.md 13.1), against the local test server only (the gates' server, rooted at
 * this worktree): each at 412x915, 360x780 and 320x568 (2 device px a CSS px, touch on), plus 3x clips of the details.
 * A flat Frost room (its lamp at the top) loaded through SB_DEV.loadRecord, the chest and the moths laid by hand (the
 * fight gate's liberties), the bug steered by real arrow keys and A and B pressed by real touches, the loop held.
 *
 *   flock /home/codespace/sb-drafts/browser.lock node tools/shutterbug-tests/shots-w1.mjs [outdir]
 *
 * THEN OPEN EVERY IMAGE AND LOOK: name three things wrong in each before calling the step done. */
import { serve, launch, gotoGame, ready, tap } from '../../satellites/shutterbug/test/harness.mjs';
import { mkdirSync } from 'node:fs';

const OUT = process.argv[2] || '/home/codespace/sb-drafts/weapons/w1/shots';
mkdirSync(OUT, { recursive: true });
const W = 24, FLOOR = 46;
const roomRows = ledge => { const r = []; for (let y = 0; y < 48; y++) r.push(y === 47 ? '1'.repeat(W) : '4'.repeat(W)); r[3] = '4'.repeat(10) + '666' + '4'.repeat(11); r[4] = '4'.repeat(10) + '111' + '4'.repeat(11); if (ledge) { r[42] = '4444' + '1111' + '4'.repeat(16); r[43] = r[42]; } return r; };
const REC = JSON.stringify({ v: 1, w: W, h: 48, mode: 0, focal: null, rows: roomRows(false), rows2: null });
const LEDGE = JSON.stringify({ v: 1, w: W, h: 48, mode: 0, focal: null, rows: roomRows(true), rows2: null });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const srv = await serve();
const browser = await launch();
const errorsAll = [];
try {
  for (const [w, h] of [[412, 915], [360, 780], [320, 568]]) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    page.on('pageerror', e => errorsAll.push(w + ' pageerror: ' + e.message));
    await gotoGame(page, srv.base); await ready(page);
    const shot = async (name, clip) => { const f = OUT + '/' + name + '-' + w + 'x' + h + '.png'; await page.screenshot({ path: f }); console.log(f); if (clip) { const c = await page.evaluate(clip); if (c) { const fc = OUT + '/' + name + '-' + w + 'x' + h + '-clip.png'; await page.screenshot({ path: fc, clip: Object.assign(c, { scale: 3 / 2 }) }); console.log(fc); } } };
    const step = n => page.evaluate(n => { for (let k = 0; k < n; k++) window.SB_DEV.step(1); return window.SB.game.state.frame; }, n);
    const st = () => page.evaluate(() => { const s = window.SB.game.state; return { x: s.hero.x, y: s.hero.y, ground: s.hero.ground, slots: s.hero.slots.slice(), proj: s.proj.filter(p => p.live).map(p => ({ kind: p.kind, x: p.x, y: p.y, a: p.a, mode: p.mode, age: p.age })), en: s.enemies.map(e => ({ hp: e.hp, hurt: e.hurt })), open: s.chest.open }; });
    const room = (rec, cx, moths) => page.evaluate((str, cx, moths, W, FLOOR) => {
      window.SB_DEV.hold(true); window.SB_DEV.loadRecord(str); const s = window.SB.game.state;
      s.chest.idx = cx < 0 ? -1 : FLOOR * W + cx; s.chest.open = 0; s.loot.length = 0; s.enemies.length = 0;
      for (const [c, r, kind] of moths) s.enemies.push({ kind, x: c * 4096, y: r * 4096, vx: 0, vy: 0, hp: kind === 3 ? 8 : 4, state: 0, timer: 0, dir: 1, home: r * W + c, elite: 0, frozen: 1 << 20, stunned: 0, hurt: 0 });
      window.SB_DEV.step(0);
    }, rec, cx, moths, W, FLOOR);
    const lay = (c, r, kind) => page.evaluate((c, r, kind, W) => { const s = window.SB.game.state; s.enemies.push({ kind, x: c * 4096, y: r * 4096, vx: 0, vy: 0, hp: kind === 3 ? 8 : 4, state: 0, timer: 0, dir: 1, home: r * W + c, elite: 0, frozen: 1 << 20, stunned: 0, hurt: 0 }); return s.enemies.length - 1; }, c, r, kind, W);
    /* a clip around every drawn rect of a kind (the pool's kinds, or 'enemy'), 24 canvas px of margin, in CSS px */
    const projClip = kind => new Function('return (' + ((kind) => { const R = window.SB_DEV.spriteRects(), rs = kind === 'enemy' ? R.enemies : R.proj.filter(p => p.kind === kind), cv = document.getElementById('view'), v = cv.getBoundingClientRect(), k = v.height / cv.height; if (!rs.length) return null; const x0 = Math.min(...rs.map(r => r.x)) - 24, y0 = Math.min(...rs.map(r => r.y)) - 24, x1 = Math.max(...rs.map(r => r.x + r.w)) + 24, y1 = Math.max(...rs.map(r => r.y + r.h)) + 24; const X = Math.max(0, v.left + x0 * k), Y = Math.max(0, v.top + y0 * k); return { x: X, y: Y, width: Math.min(innerWidth, v.left + x1 * k) - X, height: Math.min(innerHeight, v.top + y1 * k) - Y }; }).toString() + ')(' + JSON.stringify(kind) + ')');

    /* the HUD empty, a fresh sitting */
    await room(REC, 5, []); await step(2);
    await shot('w1-hud-empty', () => { const r = document.getElementById('top').getBoundingClientRect(); return { x: 0, y: 0, width: r.width, height: r.bottom + 4 }; });
    /* the chest by a real walk left: the step it opens, the card, the +15, one icon */
    await page.keyboard.down('ArrowLeft');
    for (let k = 0; k < 120; k++) { await step(1); if ((await st()).open) break; }
    await page.keyboard.up('ArrowLeft'); await step(1); await sleep(350);
    await shot('w1-chest-card');
    await sleep(2600);
    /* the throw: face right, a frozen moth just past the far point; out at its far point, then on its way back */
    await page.keyboard.down('ArrowRight'); await step(3); await page.keyboard.up('ArrowRight'); await step(8);
    let s = await st(); const col = Math.floor((s.x + 1536) / 4096);
    await lay(col + 6, FLOOR, 1);
    await tap(page, '#btnA');
    for (let k = 0; k < 30; k++) { await step(1); s = await st(); const b = s.proj.find(p => p.kind === 1); if (b && b.mode === 1) break; }
    await shot('w1-throw-out', projClip(1));
    await step(10); await shot('w1-throw-back', projClip(1));
    await step(40);
    /* the hit flash: a frozen jelly two cells ahead, the throw, the flash's on frame */
    s = await st(); const jc = Math.floor((s.x + 1536) / 4096) + 2, ji = await lay(jc, FLOOR, 3);
    await tap(page, '#btnA');
    for (let k = 0; k < 20; k++) { await step(1); s = await st(); const e = s.en[ji]; if (e.hurt > 0 && !(((e.hurt + 1) >> 1) & 1)) break; }
    await shot('w1-hit-flash', projClip('enemy'));
    /* the kill: the back pass, the pop and the +3 */
    for (let k = 0; k < 60; k++) { await step(1); s = await st(); if (s.en[ji].hp === 0) break; }
    await step(2); await sleep(300); await shot('w1-kill-pop');
    await step(60);
    /* the dive slot: clear, Play it again, the chest's other weapon */
    await page.evaluate(() => { window.SB_DEV.goto('exit'); window.SB_DEV.step(1); });
    await tap(page, '#again');
    await room(REC, 5, []);
    await page.keyboard.down('ArrowLeft'); for (let k = 0; k < 120; k++) { await step(1); if ((await st()).open) break; } await page.keyboard.up('ArrowLeft');
    await step(4); await sleep(2700);
    await page.keyboard.down('ArrowRight'); await step(3); await page.keyboard.up('ArrowRight'); await step(50);
    /* the shock at its full reach: a frozen moth 4 cells behind (out of reach, beside the wave), a dive's landing */
    s = await st(); const c0 = Math.floor((s.x + 1536) / 4096); await lay(c0 - 4, FLOOR, 1);
    await tap(page, '#btnA'); await step(4); await tap(page, '#btnB');
    for (let k = 0; k < 40; k++) { await step(1); s = await st(); const p = s.proj.find(q => q.kind === 2); if (p && p.age >= 8) break; }
    await shot('w1-shock-full', projClip(2));
    await step(60);
    /* the worst angle: a dive onto a 4 cell ledge, the wave ending at its edges in the air */
    await room(LEDGE, -1, []);
    await page.evaluate(() => { const s = window.SB.game.state; s.hero.slots[0] = 1; s.hero.slots[1] = 9; s.hero.x = 5 * 4096 + 512; s.hero.y = 36 * 4096; s.hero.ground = 0; window.SB_DEV.step(0); });
    await tap(page, '#btnB');
    for (let k = 0; k < 60; k++) { await step(1); s = await st(); const p = s.proj.find(q => q.kind === 2); if (p && p.age >= 8) break; }
    await shot('w1-shock-ledge', projClip(2));
    /* the boomerang over the Frost room's Paper: a throw high on the ledge */
    await step(30); await tap(page, '#btnA'); await step(8);
    await shot('w1-frost', projClip(1));
    /* the HUD with both icons and 4 hearts */
    await step(60);
    await shot(w === 320 ? 'w1-hud-320' : 'w1-hud-full', () => { const r = document.getElementById('top').getBoundingClientRect(); return { x: 0, y: 0, width: r.width, height: r.bottom + 4 }; });
    /* the worst angle for the card: a chest near the room's top with the bug beside it (a fresh sitting) */
    await page.evaluate(() => window.SB_DEV.goto('title'));
    await page.evaluate(str => { window.SB_DEV.hold(true); window.SB_DEV.loadRecord(str); const s = window.SB.game.state; s.loot.length = 0; s.enemies.length = 0; s.hero.x = 3 * 4096 + 512; s.hero.y = 3 * 4096; s.chest.idx = 3 * 24 + 3; s.chest.open = 0; window.SB_DEV.step(0); }, REC);
    await step(1); await sleep(350);
    await shot('w1-card-low');
    await page.close();
  }
} finally { await browser.close(); await srv.close(); }
if (errorsAll.length) { console.log('PAGE ERRORS: ' + errorsAll.join(' ; ')); process.exit(1); }
console.log('SHOTS DONE: now open every one and look');
