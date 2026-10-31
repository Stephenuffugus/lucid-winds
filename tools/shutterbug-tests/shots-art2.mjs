#!/usr/bin/env node
/* ART2's shots (Astra's poses, effects and icons, Q161), against the local test server only (the gates' server, rooted
 * at this worktree; SB_PAGE serves another page, the old one for "old beside new"): each at 412x915, 360x780 and
 * 320x568, dpr 3, touch on. A flat Frost room loaded through SB_DEV.loadRecord, the gear and the enemies laid by hand
 * (the fight gate's liberties), A and B by real touches, the loop held. Every moment is chosen from the sim's state
 * (never from what a page draws), so the old page and the new are shot at the same steps.
 *
 *   flock /home/codespace/sb-drafts/browser.lock node tools/shutterbug-tests/shots-art2.mjs <outdir> [label]
 *   flock /home/codespace/sb-drafts/browser.lock node tools/shutterbug-tests/shots-art2.mjs --boards <oldDir> <newDir> <outDir>
 *
 * Each moment writes a full shot and a clip around its subject (a 3x crop); --boards lays the old clip beside the new
 * one, a board a size. THEN OPEN EVERY IMAGE AND LOOK: name three things wrong in each. */
import { serve, launch, gotoGame, ready, tap } from '../../satellites/shutterbug/test/harness.mjs';
import { mkdirSync, readFileSync, readdirSync, existsSync } from 'node:fs';

const SIZES = [[412, 915], [360, 780], [320, 568]];
const sleep = ms => new Promise(r => setTimeout(r, ms));

if (process.argv[2] === '--boards') {
  const [oldDir, newDir, out] = process.argv.slice(3);
  mkdirSync(out, { recursive: true });
  const browser = await launch();
  try {
    for (const [w, h] of SIZES) {
      const names = readdirSync(newDir).filter(f => f.endsWith('-' + w + 'x' + h + '-clip.png')).sort();
      const b64 = f => existsSync(f) ? 'data:image/png;base64,' + readFileSync(f).toString('base64') : '';
      const rows = names.map(n => '<tr><td>' + n.replace('-' + w + 'x' + h + '-clip.png', '') + '</td><td><img src="' + b64(oldDir + '/' + n) + '"></td><td><img src="' + b64(newDir + '/' + n) + '"></td></tr>').join('');
      const page = await browser.newPage();
      await page.setViewport({ width: 900, height: 600, deviceScaleFactor: 1 });
      await page.setContent('<html><body style="background:#333;color:#eee;font:14px sans-serif;margin:8px"><h3>' + w + 'x' + h + ' dpr 3: old (b1ab7b002) | new (ART2)</h3><table cellspacing=6>' + rows + '</table></body></html>');
      await page.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))));
      const f = out + '/board-' + w + 'x' + h + '.png';
      await page.screenshot({ path: f, fullPage: true }); console.log(f);
      await page.close();
    }
  } finally { await browser.close(); }
  process.exit(0);
}

const OUT = process.argv[2] || '/home/codespace/sb-drafts/weapons2/art2/shots/new';
mkdirSync(OUT, { recursive: true });
const W = 24, FLOOR = 46;
const rows0 = []; for (let y = 0; y < 48; y++) rows0.push(y === 47 ? '1'.repeat(W) : '4'.repeat(W));
rows0[3] = '4'.repeat(10) + '666' + '4'.repeat(11); rows0[4] = '4'.repeat(10) + '111' + '4'.repeat(11);
const REC = JSON.stringify({ v: 1, w: W, h: 48, mode: 0, focal: null, rows: rows0, rows2: null });

const srv = await serve();
const browser = await launch();
const errorsAll = [];
try {
  for (const [w, h] of SIZES) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    page.on('pageerror', e => errorsAll.push(w + ' pageerror: ' + e.message));
    await gotoGame(page, srv.base); await ready(page);
    const step = n => page.evaluate(n => { for (let k = 0; k < n; k++) window.SB_DEV.step(1); }, n);
    const st = () => page.evaluate(() => { const s = window.SB.game.state; return { frame: s.frame, x: s.hero.x, y: s.hero.y, ground: s.hero.ground, squash: s.hero.squash, dash: s.hero.dash, iframes: s.hero.iframes,
      proj: s.proj.filter(p => p.live).map(p => ({ kind: p.kind, mode: p.mode, age: p.age })), en: s.enemies.map(e => ({ hp: e.hp, hurt: e.hurt })) }; });
    /* a clip around the hero (or the whole room's lower band for the shock), in CSS px, the camera's canvas scale */
    const clipAt = (cx, cy, half) => page.evaluate((cx, cy, half) => { const cv = document.getElementById('view'), v = cv.getBoundingClientRect(), k = v.height / cv.height; const X = Math.max(0, v.left + (cx - half) * k), Y = Math.max(0, v.top + (cy - half) * k); return { x: X, y: Y, width: Math.min(innerWidth - X, 2 * half * k), height: Math.min(innerHeight - Y, 2 * half * k) }; }, cx, cy, half);
    const heroC = () => page.evaluate(() => { const s = window.SB.game.state, cam = window.SB.render.drawn.cam, camX = window.SB.render.drawn.camX; return [(s.hero.x >> 8) - camX + 6, (s.hero.y >> 8) - cam + 8]; });
    const shot = async (name, clip) => {
      const f = OUT + '/' + name + '-' + w + 'x' + h + '.png'; await page.screenshot({ path: f }); console.log(f);
      if (clip) await page.screenshot({ path: OUT + '/' + name + '-' + w + 'x' + h + '-clip.png', clip });
    };
    const heroShot = async (name, half) => { const [cx, cy] = await heroC(); await shot(name, await clipAt(cx, cy, half || 40)); };
    const room = () => page.evaluate(str => { window.SB_DEV.hold(true); window.SB_DEV.loadRecord(str); const s = window.SB.game.state; s.chest.idx = -1; s.loot.length = 0; s.enemies.length = 0; window.SB_DEV.step(0); }, REC);
    const lay = (c, r, kind, hp, frozen) => page.evaluate((c, r, kind, hp, frozen, W) => { const s = window.SB.game.state; s.enemies.push({ kind, x: c * 4096, y: r * 4096, vx: 0, vy: 0, hp, state: 0, timer: 0, dir: 1, home: r * W + c, elite: 0, frozen: frozen ? 1 << 20 : 0, stunned: 0, hurt: 0 }); window.SB_DEV.step(0); return s.enemies.length - 1; }, c, r, kind, hp, frozen, W);

    /* the drop in: the room's first steps (frame 1: descending, 9: contact, 17: settled) */
    await room(); await step(1); await heroShot('a2-drop-descending');
    await step(8); await heroShot('a2-drop-contact');
    await step(8); await heroShot('a2-drop-settled');
    await step(30);
    /* the takeoff (a real A, 2 steps in: the stretch) and the landing (the first squash step) */
    await tap(page, '#btnA'); await step(2); await heroShot('a2-takeoff');
    for (let k = 0; k < 90; k++) { await step(1); const s = await st(); if (s.ground && s.squash > 0) break; }
    await heroShot('a2-land');
    await step(30);
    /* the dash: a real B on the ground, its 2nd step (lit) and its 6th (plain) */
    await tap(page, '#btnB'); await step(1); await heroShot('a2-dash-lit');
    await step(4); await heroShot('a2-dash');
    await step(40);
    /* the hurt: a moth laid on the bug (a liberty), the first step the blink shows it */
    await page.evaluate(() => { const s = window.SB.game.state; s.hero.hearts = 4; s.hero.iframes = 0; s.hero.dashI = 0; s.enemies.push({ kind: 1, x: s.hero.x, y: s.hero.y, vx: 0, vy: 0, hp: 4, state: 0, timer: 0, dir: 1, home: 0, elite: 0, frozen: 0, stunned: 0, hurt: 0 }); });
    for (let k = 0; k < 30; k++) { await step(1); const sh = await page.evaluate(() => window.SB.game.state.hero.iframes > 0 && window.SB.render.heroShown); if (sh) break; }
    await heroShot('a2-hurt');
    await page.evaluate(() => { const s = window.SB.game.state; s.enemies.length = 0; });
    await step(90);
    /* the gear: both slots (a liberty), the HUD's two icons */
    await page.evaluate(() => { const s = window.SB.game.state; s.hero.slots[0] = 1; s.hero.slots[1] = 9; s.hero.hearts = 4; });
    await step(2);
    await shot('a2-hud', await page.evaluate(() => { const r = document.getElementById('top').getBoundingClientRect(); return { x: 0, y: 0, width: r.width, height: r.bottom + 4 }; }));
    /* face right, then the throw: out (its far point) and back */
    await page.keyboard.down('ArrowRight'); await step(3); await page.keyboard.up('ArrowRight'); await step(40);
    await tap(page, '#btnA');
    for (let k = 0; k < 30; k++) { await step(1); const s = await st(); const b = s.proj.find(p => p.kind === 1); if (b && b.mode === 1) break; }
    await heroShot('a2-throw-out', 64);
    await step(10); await heroShot('a2-throw-back', 64);
    await step(60);
    /* the hit: a frozen jelly of 8 quarters 2 cells ahead, the throw, the hit's first step; then the pop on the back pass */
    let s = await st(); const jc = Math.floor((s.x + 1536) / 4096) + 2, ji = await lay(jc, FLOOR, 3, 8, true);
    await tap(page, '#btnA');
    for (let k = 0; k < 30; k++) { await step(1); s = await st(); if (s.en[ji].hurt > 0) break; }
    await step(1); await heroShot('a2-hit', 56);
    for (let k = 0; k < 60; k++) { await step(1); s = await st(); if (s.proj.some(p => p.kind === 3)) break; }
    await step(2); await heroShot('a2-pop', 56);
    await step(60);
    /* the shock: a real A, then a real B in the air: the landing's shock mid run and at its full reach */
    await tap(page, '#btnA'); await step(4); await tap(page, '#btnB');
    for (let k = 0; k < 60; k++) { await step(1); s = await st(); const p = s.proj.find(q => q.kind === 2); if (p && p.age >= 3) break; }
    await heroShot('a2-shock-mid', 72);
    for (let k = 0; k < 30; k++) { await step(1); s = await st(); const p = s.proj.find(q => q.kind === 2); if (!p || p.age >= 9) break; }
    await heroShot('a2-shock-full', 72);
    await page.close();
  }
} finally { await browser.close(); await srv.close(); }
if (errorsAll.length) { console.log('PAGE ERRORS: ' + errorsAll.join(' ; ')); process.exit(1); }
console.log('SHOTS DONE: now open every one and look');
