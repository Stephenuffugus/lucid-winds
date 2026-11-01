#!/usr/bin/env node
/* ART4's shots (Astra's round 4, Q164), against the local test server only (the gates' server, rooted at this
 * worktree): each at 412x915, 360x780 and 320x568, dpr 3, touch on, the loop held. Each moment writes a full shot and,
 * where the subject is small, a 3x clip around it.
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

const OUT = process.argv[2] || '/home/codespace/sb-drafts/weapons2/art4/shots';
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

    /* J2 Spark Trail: a frozen jelly where the first spark lands, the trail of three mid jump */
    await room([[11, 45, 3, 'frozen'], [14, 44, 1, 'frozen']], [CODE.J2, CODE.D1]); await at(11, FLOOR); await step(4);
    await tap(page, '#btnA'); await step(22);
    await shot('art4-J2', await near([5, 'hero', 'enemies']));
    /* J3 Shield Kick off each wall: the bug sliding down the room's edge, frozen moths two cells up and down the wall */
    for (const side of [-1, 1]) {
      const col = side < 0 ? 0 : W - 1;
      await room([[col, 38, 1, 'frozen'], [col, 42, 3, 'frozen']], [CODE.J3, CODE.D1]);
      await page.evaluate((side, W) => { const s = window.SB.game.state; s.hero.x = side < 0 ? 0 : W * 4096 - window.SB.K.HERO_W_SUB; s.hero.y = 40 * 4096; s.hero.ground = 0; window.SB_DEV.step(0); }, side, W);
      const key = side < 0 ? 'ArrowLeft' : 'ArrowRight';
      await page.keyboard.down(key); for (let k = 0; k < 30 && !(await st()).wall; k++) await step(1);
      await tap(page, '#btnA'); await step(6); await page.keyboard.up(key);
      await shot(side < 0 ? 'art4-J3' : 'art4-J3r', await near([9, 'hero', 'enemies']));
    }
    /* J4 Flashbulb: moths at the reach's edge each side at a tap's apex height, the burst on its frame b, then the stars */
    await room([[13, 44, 1, 'frozen'], [9, 44, 1, 'frozen']], [CODE.J4, CODE.D1]); await at(11, FLOOR); await step(4);
    await page.evaluate(() => window.SB.game.state.enemies.forEach(e => { e.frozen = 0; e.hp = 8; }));
    await tap(page, '#btnA');
    for (let k = 0; k < 40; k++) { await step(1); if ((await st()).proj.some(p => p.kind === 6 && p.mode === 1)) break; }
    await step(6); await shot('art4-J4', await near([6, 'hero', 'enemies']));
    await step(12); await shot('art4-stunned', await near(['stunned', 'hero']));
    /* J5 Twin Darts: moths four cells off each side, the darts mid flight */
    await room([[16, 46, 1, 'frozen'], [6, 45, 1, 'frozen']], [CODE.J5, CODE.D1]); await at(11, FLOOR); await step(4);
    await tap(page, '#btnA'); await step(6);
    await shot('art4-J5', await near([7, 'hero', 'enemies']));
    /* J6 Halo: a moth six cells over the takeoff, the ring rising to it */
    await room([[11, 40, 1, 'frozen']], [CODE.J6, CODE.D1]); await at(11, FLOOR); await step(4);
    await tap(page, '#btnA'); await step(12);
    await shot('art4-J6', await near([8, 'hero', 'enemies']));
    /* J7 Shutter Snap: moths two cells off each side, held by a stun, the snap's frame */
    await room([[13, 46, 1, 'stunned'], [8, 45, 1, 'stunned']], [CODE.J7, CODE.D1]); await at(11, FLOOR); await step(4);
    await tap(page, '#btnA'); await step(2);
    await shot('art4-J7', await near([10, 'hero']));
    /* the worst angle: the Snap with the bug against the room's left wall, a moth in reach on its right */
    await room([[3, 45, 1, 'stunned']], [CODE.J7, CODE.D1]); await at(0, FLOOR); await page.evaluate(() => { window.SB.game.state.hero.x = 0; window.SB_DEV.step(0); }); await step(4);
    await tap(page, '#btnA'); await step(2);
    await shot('art4-J7-edge', await near([10, 'hero']));
    await step(60);

    /* the stick: idle with its hint (a fresh save, so the first standing moment's pulse plays), held, right, full pushes */
    await page.evaluate(() => localStorage.clear()); await page.reload(); await ready(page); await page.evaluate(() => window.SB_DEV.hold(true));
    await tap(page, '#sample');
    await page.evaluate(() => { for (let k = 0; k < 200 && !document.getElementById('stick').classList.contains('hint'); k++) window.SB_DEV.step(1); });
    await sleep(2200);
    await shot('art4-stick-idle');
    const c = await stickAt(page, 0.4, 0.55);
    let f = await landStick(page, c.x, c.y);
    const padClip = () => page.evaluate(() => { const r = document.querySelector('#stick .pad').getBoundingClientRect(); return { x: Math.max(0, r.left - 20), y: Math.max(0, r.top - 20), width: Math.min(innerWidth, r.right + 20) - Math.max(0, r.left - 20), height: Math.min(innerHeight, r.bottom + 20) - Math.max(0, r.top - 20) }; });
    await page.evaluate(() => window.SB_DEV.step(1));
    await shot('art4-stick-held', await padClip());
    await f.slide(20); await page.evaluate(() => window.SB_DEV.step(1));
    await shot('art4-stick-right', await padClip());
    await f.slide(60); await page.evaluate(() => window.SB_DEV.step(1));
    await shot('art4-stick-full-right', await padClip());
    await f.end(); await page.evaluate(() => window.SB_DEV.step(5));
    f = await landStick(page, c.x + 40, c.y);
    await f.slide(-80); await page.evaluate(() => window.SB_DEV.step(1));
    await shot('art4-stick-full-left', await padClip());
    await f.end(); await page.evaluate(() => window.SB_DEV.step(5));
    /* Pause pressed under a held finger (its release opens the card: then Resume), then normal */
    const pc = await page.evaluate(() => { const r = document.querySelector('#pause i').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.touchscreen.touchStart(pc.x, pc.y); await sleep(80);
    await shot('art4-pause-pressed', await topClip());
    await page.touchscreen.touchEnd(); await sleep(120);
    await page.evaluate(() => { const b = document.getElementById('resume'); if (b) b.click(); });
    await sleep(120);
    await shot('art4-pause-normal', await topClip());

    /* each biome's air on its biome: a mote clipped */
    for (let b = 0; b < 5; b++) {
      const m = await page.evaluate((str, b) => { window.SB_DEV.loadRecord(str, b); window.SB_DEV.step(70); const md = window.SB.render.drawn.motes || []; const q = md[Math.floor(md.length / 2)] || md[0]; return q ? { x: q.x, y: q.y } : null; }, BLOBS, b);
      await shot('art4-air-biome' + b, m ? await clipAt(m.x, m.y, 16, 16, 40) : null);
    }
    /* the moth elite on a Magenta cell: saturated-blobs under the Attic */
    const e = await page.evaluate(str => { window.SB_DEV.loadRecord(str, 0); window.SB_DEV.step(1); window.SB_DEV.goto('elite'); window.SB_DEV.step(2); const m = window.SB.render.drawn.moths.find(q => q.w === 24) || window.SB.render.drawn.moths[0]; return m ? { x: m.x, y: m.y, w: m.w, h: m.h } : null; }, BLOBS);
    await shot('art4-elite', e ? await clipAt(e.x, e.y, e.w, e.h, 24) : null);
    /* a crusher column of three (trap-pattern under Frost) in phase c, the bug clear of it */
    const col = await page.evaluate(str => {
      window.SB_DEV.loadRecord(str, 1); window.SB_DEV.step(1);
      const G = window.SB.game, lv = G.level, w = lv.w, tf = Array.from(lv.features.trap || []); let best = null;
      for (const c of tf) if (!lv.trap[c - w]) { let n = 1; while (lv.trap[c + n * w]) n++; if (!best || n > best.n) best = { top: c, n }; }
      return { best, w, period: window.SB.K.TRAP_PERIOD_F };
    }, TRAPS);
    if (col.best) {
      const r = await page.evaluate((top, n, tph) => { const G = window.SB.game, lv = G.level, w = lv.w, C = 16, hh = G.state.hero; G.state.traps.phase = tph; hh.x = ((top % w) < 12 ? 20 : 2) * C * 256; hh.y = Math.floor(top / w) * C * 256; window.SB.render.draw(G.state, lv); const cam = window.SB.render.drawn.cam; return { x: (top % w) * C - 3 * C, y: Math.floor(top / w) * C - cam - C, w: 7 * C, h: (n + 2) * C }; }, col.best.top, col.best.n, (col.period >> 1) + 20);
      await shot('art4-crusher', await clipAt(r.x, r.y, r.w, r.h, 8));
    }
    /* the speck's beat b in the sample room */
    const sp = await page.evaluate(() => { window.SB_DEV.goto('sample'); window.SB_DEV.step(1); const G = window.SB.game, lv = G.level, s = G.state; const L = s.loot.find(l => l.kind === 1 && !l.taken); if (!L) return null; s.frame = 15; window.SB.render.draw(s, lv); const cam = window.SB.render.drawn.cam, C = 16; return { x: (L.idx % lv.w) * C, y: Math.floor(L.idx / lv.w) * C - cam }; });
    await shot('art4-speck', sp ? await clipAt(sp.x, sp.y, 16, 16, 24) : null);
    await page.close();
  }
} finally { await browser.close(); await srv.close(); }
if (errorsAll.length) { console.log('PAGE ERRORS: ' + errorsAll.join(' ; ')); process.exit(1); }
console.log('SHOTS DONE: now open every one and look');
