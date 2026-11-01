#!/usr/bin/env node
/* Weapons v1 step 2's shots (docs/WEAPONS-V1.md 13.2), against the local test server only (the gates' server, rooted at
 * this worktree): each at 412x915, 360x780 and 320x568 (2 device px a CSS px, touch on), plus 3x clips of the details.
 * The fight gate's flat Frost room loaded through SB_DEV.loadRecord, the slots and the enemies laid by hand (named
 * liberties), A pressed by real touches, the swap card's buttons and Pause tapped for real, the loop held:
 *   w2-J2 .. w2-J8: each jump weapon mid effect beside an enemy at its distance;
 *   w2-frozen, w2-stunned: Shutter Snap's frozen look and the Flashbulb's stunned stars;
 *   w2-halo-ceiling (the worst angle): Halo under the 4 cell ledge two rows over the bug's head;
 *   w2-swap, w2-swap-paused: the swap card, and the pause card over it;
 *   w2-swap-top (the worst angle): the swap card with the bug at the room's top (the chest laid there).
 *
 *   flock /home/codespace/sb-drafts/browser.lock node tools/shutterbug-tests/shots-w2.mjs [outdir]
 *
 * THEN OPEN EVERY IMAGE AND LOOK: name three things wrong in each before calling the step done. */
import { serve, launch, gotoGame, ready, tap } from '../../satellites/shutterbug/test/harness.mjs';
import { mkdirSync } from 'node:fs';

const OUT = process.argv[2] || '/home/codespace/sb-drafts/weapons2/w2/shots';
mkdirSync(OUT, { recursive: true });
const W = 24, FLOOR = 46;
const roomRows = ledge => { const r = []; for (let y = 0; y < 48; y++) r.push(y === 47 ? '1'.repeat(W) : '4'.repeat(W)); r[3] = '4'.repeat(10) + '666' + '4'.repeat(11); r[4] = '4'.repeat(10) + '111' + '4'.repeat(11); if (ledge) { r[42] = '4444' + '1111' + '4'.repeat(16); r[43] = r[42]; } return r; };
const REC = JSON.stringify({ v: 1, w: W, h: 48, mode: 0, focal: null, rows: roomRows(false), rows2: null });
const LEDGE = JSON.stringify({ v: 1, w: W, h: 48, mode: 0, focal: null, rows: roomRows(true), rows2: null });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CODE = { J1: 1, J2: 2, J3: 3, J4: 4, J5: 5, J6: 6, J7: 7, J8: 8, D1: 9 };

const srv = await serve();
const browser = await launch();
const errorsAll = [];
try {
  for (const [w, h] of [[412, 915], [360, 780], [320, 568]]) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    page.on('pageerror', e => errorsAll.push(w + ' pageerror: ' + e.message));
    await gotoGame(page, srv.base); await ready(page);
    const shot = async (name, clip) => { const f = OUT + '/' + name + '-' + w + 'x' + h + '.png'; await page.screenshot({ path: f }); console.log(f); if (clip) { const c = await page.evaluate(clip); if (c && c.width > 0 && c.height > 0) { const fc = OUT + '/' + name + '-' + w + 'x' + h + '-clip.png'; await page.screenshot({ path: fc, clip: Object.assign(c, { scale: 3 / 2 }) }); console.log(fc); } } };
    const step = n => page.evaluate(n => { for (let k = 0; k < n; k++) window.SB_DEV.step(1); return window.SB.game.state.frame; }, n);
    const st = () => page.evaluate(() => { const s = window.SB.game.state; return { x: s.hero.x, y: s.hero.y, vy: s.hero.vy, ground: s.hero.ground, wall: s.hero.wall, ev: s.ev, compare: s.room.compare, proj: s.proj.filter(p => p.live).map(p => ({ kind: p.kind, age: p.age, mode: p.mode })) }; });
    /* a room with the liberties: the chest at cx on the floor (or none), the loot cleared, the enemies [col, row, kind,
       held] laid (held: 'frozen', 'stunned' or none), the slots */
    const room = (rec, cx, ens, slots) => page.evaluate((str, cx, ens, slots, W, FLOOR) => {
      window.SB_DEV.hold(true); window.SB_DEV.loadRecord(str); const s = window.SB.game.state;
      s.chest.idx = cx < 0 ? -1 : FLOOR * W + cx; s.chest.open = 0; s.loot.length = 0; s.enemies.length = 0;
      for (const [c, r, kind, held] of ens) s.enemies.push({ kind, x: c * 4096, y: r * 4096, vx: 0, vy: 0, hp: kind === 3 ? 8 : 4, state: 0, timer: 0, dir: 1, home: r * W + c, elite: 0, frozen: held === 'frozen' ? 1 << 20 : 0, stunned: held === 'stunned' ? 1 << 20 : 0, hurt: 0 });
      s.hero.slots[0] = slots[0]; s.hero.slots[1] = slots[1];
      window.SB_DEV.step(0);
    }, rec, cx, ens, slots, W, FLOOR);
    const at = (cx, cy) => page.evaluate((cx, cy) => { const s = window.SB.game.state; s.hero.x = cx * 4096 + 512; s.hero.y = cy * 4096; window.SB_DEV.step(0); }, cx, cy);
    const near = (kinds) => new Function('return (' + ((kinds) => { const R = window.SB_DEV.spriteRects(), rs = R.proj.filter(p => kinds.includes(p.kind)).concat(kinds.includes('hero') && R.hero ? [R.hero] : []), cv = document.getElementById('view'), v = cv.getBoundingClientRect(), k = v.height / cv.height; if (!rs.length) return null; const x0 = Math.min(...rs.map(r => r.x)) - 24, y0 = Math.min(...rs.map(r => r.y)) - 24, x1 = Math.max(...rs.map(r => r.x + r.w)) + 24, y1 = Math.max(...rs.map(r => r.y + r.h)) + 24; const X = Math.max(0, v.left + x0 * k), Y = Math.max(0, v.top + y0 * k); return { x: X, y: Y, width: Math.min(innerWidth, v.left + x1 * k) - X, height: Math.min(innerHeight, v.top + y1 * k) - Y }; }).toString() + ')(' + JSON.stringify(kinds) + ')');

    /* J2 Spark Trail: a frozen jelly where the first spark lands, the trail of three mid jump */
    await room(REC, -1, [[11, 45, 3, 'frozen'], [14, 44, 1, 'frozen']], [CODE.J2, CODE.D1]); await at(11, FLOOR); await step(4);
    await tap(page, '#btnA'); await step(22);
    await shot('w2-J2', near([5, 'hero']));
    /* J3 Shield Kick: the bug sliding down the room's left edge, a frozen moth two cells up the wall, the kick */
    await room(REC, -1, [[0, 38, 1, 'frozen'], [0, 42, 3, 'frozen']], [CODE.J3, CODE.D1]);
    await page.evaluate(() => { const s = window.SB.game.state; s.hero.x = 0; s.hero.y = 40 * 4096; s.hero.ground = 0; window.SB_DEV.step(0); });
    await page.keyboard.down('ArrowLeft'); for (let k = 0; k < 30 && !(await st()).wall; k++) await step(1); await page.keyboard.up('ArrowLeft');
    await tap(page, '#btnA'); await step(3);
    await shot('w2-J3', near([9, 'hero']));
    /* J4 Flashbulb: jellies two cells off each side at the apex height, the burst, then the stunned stars */
    await room(REC, -1, [[13, 41, 3, 'frozen'], [9, 41, 3, 'frozen']], [CODE.J4, CODE.D1]); await at(11, FLOOR); await step(4);
    await page.evaluate(() => window.SB.game.state.enemies.forEach(e => { e.frozen = 0; e.stunned = 0; e.vx = 0; }));
    await page.evaluate(() => window.SB.game.state.enemies.forEach(e => { e.state = 0; }));
    await tap(page, '#btnA');
    for (let k = 0; k < 40; k++) { await step(1); if ((await st()).proj.some(p => p.kind === 6 && p.mode === 1)) break; }
    await step(2); await shot('w2-J4', near([6, 'hero']));
    await step(12); await shot('w2-stunned', near(['stunned', 'hero']));
    /* J5 Twin Darts: moths four cells off each side, the darts mid flight */
    await room(REC, -1, [[16, 46, 1, 'frozen'], [6, 45, 1, 'frozen']], [CODE.J5, CODE.D1]); await at(11, FLOOR); await step(4);
    await tap(page, '#btnA'); await step(6);
    await shot('w2-J5', near([7, 'hero']));
    /* J6 Halo: a moth six cells over the takeoff, the ring rising to it */
    await room(REC, -1, [[11, 40, 1, 'frozen']], [CODE.J6, CODE.D1]); await at(11, FLOOR); await step(4);
    await tap(page, '#btnA'); await step(12);
    await shot('w2-J6', near([8, 'hero']));
    /* the worst angle: Halo under the 4 cell ledge (rows 42 and 43, columns 4 to 7), two rows over the bug's head */
    await room(LEDGE, -1, [[5, 38, 1, 'frozen']], [CODE.J6, CODE.D1]); await at(5, FLOOR); await step(4);
    await tap(page, '#btnA'); await step(1);
    await shot('w2-halo-ceiling', near([8, 'hero']));
    /* J7 Shutter Snap: moths two cells off each side, held by a stun (not frozen), the snap and the frozen look */
    await room(REC, -1, [[13, 46, 1, 'stunned'], [8, 45, 1, 'stunned']], [CODE.J7, CODE.D1]); await at(11, FLOOR); await step(4);
    await tap(page, '#btnA'); await step(2);
    await shot('w2-J7', near([10, 'frozen', 'hero']));
    await step(4); await shot('w2-frozen', near(['frozen', 'hero']));
    /* J8 Skyhook: the flourish under the takeoff */
    await room(REC, -1, [], [CODE.J8, CODE.D1]); await at(11, FLOOR); await step(4);
    await tap(page, '#btnA'); await step(3);
    await shot('w2-J8', near(['hook', 'hero']));
    await step(60);
    /* the swap card: Boomerang and Anvil Boots, a chest on the floor walked into by a real arrow key */
    await room(REC, 5, [], [CODE.J1, CODE.D1]); await step(4);
    await page.keyboard.down('ArrowLeft'); for (let k = 0; k < 120 && !(await st()).compare; k++) await step(1); await page.keyboard.up('ArrowLeft');
    await step(1); await sleep(200);
    await shot('w2-swap');
    await tap(page, '#pause'); await sleep(200);
    await shot('w2-swap-paused');
    await tap(page, '#resume'); await tap(page, '#swapkeep'); await step(2); await sleep(2700);
    /* the worst angle: the chest at the room's top, the bug beside it */
    await page.evaluate(str => { window.SB_DEV.hold(true); window.SB_DEV.loadRecord(str); const s = window.SB.game.state; s.loot.length = 0; s.enemies.length = 0; s.hero.slots[0] = 1; s.hero.slots[1] = 9; s.hero.x = 3 * 4096 + 512; s.hero.y = 2 * 4096; s.chest.idx = 2 * 24 + 4; s.chest.open = 0; window.SB_DEV.step(0); }, REC);
    await page.keyboard.down('ArrowRight'); for (let k = 0; k < 60 && !(await st()).compare; k++) await step(1); await page.keyboard.up('ArrowRight');
    await step(1); await sleep(200);
    await shot('w2-swap-top');
    await page.close();
  }
} finally { await browser.close(); await srv.close(); }
if (errorsAll.length) { console.log('PAGE ERRORS: ' + errorsAll.join(' ; ')); process.exit(1); }
console.log('SHOTS DONE: now open every one and look');
