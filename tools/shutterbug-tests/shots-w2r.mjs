#!/usr/bin/env node
/* W2R's shots (the review of weapons steps 1 and 2, Q123), against the local test server only (the gates' server,
 * rooted at this worktree): each at 412x915, 360x780 and 320x568, dpr 3, touch on, the loop held. Each moment writes a
 * full shot and, where the subject is small, a 3x clip around it:
 *   w2r-halo-flush: Halo from a ground jump flush against the room's left wall, the ring rising beside it;
 *   w2r-halo-walljump: Halo from a wall jump off the room's left wall (the ring died undrawn before W2R);
 *   w2r-swap-J8: the swap card offering Skyhook over the Boomerang ("Skyhook jumps higher and hits nothing."), a real
 *     stick thumb down under it (no pad drawn); w2r-swap-J7: Shutter Snap over the Boomerang;
 *   w2r-top: the top strip with the sample room's name, both boxes and the hearts (clipped).
 * (The old header follows.)
 *   art4-J2 .. art4-J7: each step 2 weapon firing beside an enemy at its reach (the fight gate's flat Frost room, the
 *     slots and the enemies laid by hand, A by real touches): Spark Trail's embers, Shield Kick off the left wall and
 *     off the right (J3, J3r), the Flashbulb's flash_ring on its frame b (the reach), Twin Darts, Halo's ring, the
 *     Shutter Snap frame; art4-J7-edge (the worst angle): the Snap with the bug against the room's left wall;
 *   art4-stick-idle, -held, -right, -full-right, -full-left: the pad idle with the hint, held, steering, both full pushes;
 *   art4-pause-normal, -pressed: Pause under no finger and a held one (the top bar clipped);
 *   art4-air-biome0..4: each biome's air on its own biome (saturated-blobs under each, a mote clipped);
 *   art4-crusher: a crusher column of three (trap-pattern under Frost) in its phase c, the columns beside it;
 *   art4-elite: the moth elite on a Magenta cell (saturated-blobs under the Attic); art4-speck: the speck's beat b.
 *
 *   flock /home/codespace/sb-drafts/browser.lock node tools/shutterbug-tests/shots-art4.mjs <outdir>
 *
 * THEN OPEN EVERY IMAGE AND LOOK: name three things wrong in each. */
import { serve, launch, gotoGame, ready, tap, landStick, stickAt, GAME } from '../../satellites/shutterbug/test/harness.mjs';
import { mkdirSync, readFileSync } from 'node:fs';

const OUT = process.argv[2] || '/home/codespace/sb-drafts/weapons2/w2r/shots';
mkdirSync(OUT, { recursive: true });
const BLOBS = readFileSync(GAME + '/fixtures/synthetic/saturated-blobs.json', 'utf8');
const TRAPS = readFileSync(GAME + '/fixtures/synthetic/trap-pattern.json', 'utf8');
const W = 24, FLOOR = 46;
const roomRows = () => { const r = []; for (let y = 0; y < 48; y++) r.push(y === 47 ? '1'.repeat(W) : '4'.repeat(W)); r[3] = '4'.repeat(10) + '666' + '4'.repeat(11); r[4] = '4'.repeat(10) + '111' + '4'.repeat(11); return r; };
const REC = JSON.stringify({ v: 1, w: W, h: 48, mode: 0, focal: null, rows: roomRows(), rows2: null });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CODE = { J1: 1, J2: 2, J3: 3, J4: 4, J5: 5, J6: 6, J7: 7, J8: 8, D1: 9 };

const srv = await serve();
const browser = await launch();
const errorsAll = [];
try {
  for (const [w, h] of [[412, 915], [360, 780], [320, 568]]) {
    const tg = w + 'x' + h;
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    page.on('pageerror', e => errorsAll.push(tg + ' pageerror: ' + e.message));
    await gotoGame(page, srv.base); await ready(page);
    await page.evaluate(() => window.SB_DEV.hold(true));
    const shot = async (name, clip) => { const f = OUT + '/' + name + '-' + tg + '.png'; await page.screenshot({ path: f }); console.log(f); if (clip && clip.width > 0 && clip.height > 0) { const fc = OUT + '/' + name + '-' + tg + '-clip.png'; await page.screenshot({ path: fc, clip }); console.log(fc); } };
    /* a clip around a canvas box (canvas px), in CSS px */
    const clipAt = (x, y, bw, bh, pad = 8) => page.evaluate((x, y, bw, bh, pad) => { const cv = document.getElementById('view'), v = cv.getBoundingClientRect(), k = v.height / cv.height; const X = Math.max(0, v.left + (x - pad) * k), Y = Math.max(0, v.top + (y - pad) * k); return { x: X, y: Y, width: Math.min(innerWidth, v.left + (x + bw + pad) * k) - X, height: Math.min(innerHeight, v.top + (y + bh + pad) * k) - Y }; }, x, y, bw, bh, pad);
    const topClip = () => page.evaluate(() => { const r = document.getElementById('top').getBoundingClientRect(); return { x: 0, y: r.top, width: innerWidth, height: r.height + 12 }; });
    /* the drawn records of these kinds (and the hero), their union padded: the clip */
    const near = async kinds => { const b = await page.evaluate(kinds => { const R = window.SB_DEV.spriteRects(), rs = R.proj.filter(p => kinds.includes(p.kind)).concat(kinds.includes('hero') && R.hero ? [R.hero] : []).concat(kinds.includes('enemies') ? R.enemies : []); if (!rs.length) return null; const x0 = Math.min(...rs.map(r => r.x)), y0 = Math.min(...rs.map(r => r.y)); return [x0, y0, Math.max(...rs.map(r => r.x + r.w)) - x0, Math.max(...rs.map(r => r.y + r.h)) - y0]; }, kinds); return b ? clipAt(b[0], b[1], b[2], b[3], 16) : null; };
    const step = n => page.evaluate(n => { for (let k = 0; k < n; k++) window.SB_DEV.step(1); return window.SB.game.state.frame; }, n);
    const st = () => page.evaluate(() => { const s = window.SB.game.state; return { x: s.hero.x, y: s.hero.y, vy: s.hero.vy, ground: s.hero.ground, wall: s.hero.wall, proj: s.proj.filter(p => p.live).map(p => ({ kind: p.kind, age: p.age, mode: p.mode })) }; });
    /* a room with the liberties: no chest, the loot cleared, the enemies [col, row, kind, held] laid, the slots */
    const room = (ens, slots) => page.evaluate((str, ens, slots, W) => {
      window.SB_DEV.hold(true); window.SB_DEV.loadRecord(str); const s = window.SB.game.state;
      s.chest.idx = -1; s.chest.open = 0; s.loot.length = 0; s.enemies.length = 0;
      for (const [c, r, kind, held] of ens) s.enemies.push({ kind, x: c * 4096, y: r * 4096, vx: 0, vy: 0, hp: kind === 3 ? 8 : 4, state: 0, timer: 0, dir: 1, home: r * W + c, elite: 0, frozen: held === 'frozen' ? 1 << 20 : 0, stunned: held === 'stunned' ? 1 << 20 : 0, hurt: 0 });
      s.hero.slots[0] = slots[0]; s.hero.slots[1] = slots[1];
      window.SB_DEV.step(0);
    }, REC, ens, slots, W);
    const at = (cx, cy) => page.evaluate((cx, cy) => { const s = window.SB.game.state; s.hero.x = cx * 4096 + 512; s.hero.y = cy * 4096; window.SB_DEV.step(0); }, cx, cy);

    /* Halo flush against the room's left wall (x 0): a ground jump, then a wall jump off the same wall */
    await room([[0, 41, 1, 'frozen']], [CODE.J6, CODE.D1]);
    await page.evaluate(() => { const s = window.SB.game.state; s.hero.x = 0; s.hero.y = 46 * 4096; window.SB_DEV.step(0); }); await step(4);
    await tap(page, '#btnA'); await step(8);
    console.log(tg, 'flush', JSON.stringify((await st()).proj));
    await shot('w2r-halo-flush', await near([8, 'hero', 'enemies']));
    await room([[0, 33, 1, 'frozen']], [CODE.J6, CODE.D1]);
    await page.evaluate(() => { const s = window.SB.game.state; s.hero.x = 0; s.hero.y = 38 * 4096; s.hero.ground = 0; window.SB_DEV.step(0); });
    await page.keyboard.down('ArrowLeft'); for (let k = 0; k < 30 && !(await st()).wall; k++) await step(1);
    await tap(page, '#btnA'); await step(8); await page.keyboard.up('ArrowLeft');
    console.log(tg, 'walljump', JSON.stringify((await st()).proj));
    await shot('w2r-halo-walljump', await near([8, 'hero', 'enemies']));
    /* the swap card for Skyhook and for Shutter Snap over the Boomerang (the compare laid by hand), a stick thumb down */
    for (const cand of ['J8', 'J7']) {
      await room([], [CODE.J1, CODE.D1]); await at(11, FLOOR); await step(4);
      await page.evaluate(c => { const s = window.SB.game.state; s.room.compare = 1; s.room.cand = c; window.SB_DEV.step(1); }, CODE[cand]); await step(2);
      const sp = await stickAt(page, 0.25, 0.8), thumb = await landStick(page, sp.x, sp.y); await step(1);
      const info = await page.evaluate(() => ({ cmp: document.querySelector('#swap .cmp').textContent, on: document.getElementById('swap').classList.contains('on'), pad: getComputedStyle(document.querySelector('#stick .pad')).display, cls: document.getElementById('swap').className }));
      console.log(tg, cand, JSON.stringify(info));
      await shot('w2r-swap-' + cand);
      await thumb.end(); await tap(page, '#swapkeep'); await step(2);
    }
    /* the top strip in the sample room */
    await page.evaluate(() => { window.SB_DEV.goto('sample'); window.SB_DEV.step(1); window.SB.game.state.hero.slots[0] = 1; window.SB.game.state.hero.slots[1] = 9; window.SB_DEV.step(1); });
    const tw = await page.evaluate(() => ({ name: Math.round(document.getElementById('roomname').getBoundingClientRect().width), text: document.getElementById('roomname').textContent, hearts: document.querySelectorAll('#hearts i').length }));
    console.log(tg, 'top', JSON.stringify(tw));
    await shot('w2r-top', await topClip());
    await page.close();
  }
} finally { await browser.close(); await srv.close(); }
if (errorsAll.length) { console.log('PAGE ERRORS: ' + errorsAll.join(' ; ')); process.exit(1); }
console.log('SHOTS DONE: now open every one and look');
