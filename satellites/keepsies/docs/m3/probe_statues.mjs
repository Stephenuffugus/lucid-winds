/* m3 step 10: the statues' view, numbers only: the ring inside the width minus 16 and above the tray, the tray 190 tall, her tile centres, a badge within 20 px above each statue, the chip clear of the finger, the move marks, the Move button clear of the circle */
import { open, startMatch, sleep, done } from './probe.mjs';
const rect = `(id) => { const el = typeof id === 'string' ? document.getElementById(id) : id; if (!el || el.hidden || el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return null; const r = el.getBoundingClientRect(); return { l: +r.left.toFixed(1), t: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; }`;
let bad = 0; const say = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
for (const [w, h] of [[412, 915], [360, 780], [360, 640]]) {
  const page = await open(w, h);
  await page.evaluate(() => window.KEEPSIES_DEV.start({ seed: 424242, forceFirst: 0, houseRules: { ringSizeFt: 5, statues: true } }));
  await page.waitForFunction(() => !!window.KEEPSIES_DEV.placing(), { timeout: 30000 });
  await sleep(6000);
  const a = await page.evaluate(`(() => { const rect = ${rect}; const c = window.KEEPSIES_DEV.debugCam(); return { c, tray: rect('statueTray'), tiles: ['column','loaf','arch','orb'].map(s => rect('st-' + s)), undo: rect('stUndo'), conf: rect('stConfirm'), head: rect('stHead'), line: rect('stLine') }; })()`);
  const R = a.c.ringRect;
  say(!!a.tray && a.tray.h >= 189.5 && a.tray.h <= 191, w + 'x' + h + ' tray ' + (a.tray ? a.tray.w + 'x' + a.tray.h : 'none') + ' (190 tall)');
  say(R.x0 >= 8 - 13 && R.x1 <= w - 8 + 13 && R.y1 < a.tray.t && R.y0 >= 56, ' chalk x ' + R.x0 + ' to ' + R.x1 + ', y ' + R.y0 + ' to ' + R.y1 + ' above the tray at ' + a.tray.t + ', el ' + a.c.cam.el);
  const ctr = a.tiles.map(t => t ? +(t.l + t.w / 2 - a.tray.l).toFixed(1) : null), cy = a.tiles.map(t => t ? +(t.t + t.h / 2 - a.tray.t).toFixed(1) : null);
  say(a.tiles.every(t => t && t.w === 56 && t.h === 56), ' tiles ' + JSON.stringify(a.tiles.map(t => t && t.w + 'x' + t.h)) + ' centres x ' + ctr.join(' ') + ' y ' + cy.join(' ') + ' (her 375: 58.5 144.5 230.5 316.5 at 95)');
  say(!!a.undo && !!a.conf && a.undo.h >= 48 && a.conf.h >= 48 && a.undo.t - a.tray.t >= 137 && a.undo.t - a.tray.t <= 141, ' undo ' + JSON.stringify(a.undo) + ' confirm ' + JSON.stringify(a.conf) + ' (her bands at y 139, 48 tall)');
  say(!!a.head && !!a.line, ' the title and hint bands: ' + JSON.stringify(a.head) + ' ' + JSON.stringify(a.line));
  // Not here: a real finger off the chalk, near each side
  const tile = a.tiles[0];
  for (const side of [0.2, 0.8]) {
    const X = w * side, Y = Math.max(160, R.y0 - 20);
    await page.touchscreen.touchStart(tile.l + 28, tile.t + 28); await sleep(100);
    await page.touchscreen.touchMove(X, Y); await sleep(1400);
    const n = await page.evaluate(`(() => { const rect = ${rect}; return { r: rect('stNot'), vars: (() => { const e = document.getElementById('stNot'); return e ? [e.style.getPropertyValue('--ll'), e.style.getPropertyValue('--la')] : null; })() }; })()`);
    const r = n.r, clear = r ? Math.max(r.l - X, 0, X - r.l - r.w, r.t - Y, 0, Y - r.t - r.h) : -1;
    say(!!r && clear >= 24 && r.l >= 0 && r.l + r.w <= w, ' Not here for a finger at ' + X.toFixed(0) + ',' + Y.toFixed(0) + ': ' + JSON.stringify(r) + ', ' + clear.toFixed(0) + ' px clear of the finger, leader ' + (n.vars || []).join(' '));
    await page.touchscreen.touchEnd(); await sleep(300);
  }
  // statues down through the dev door, so the badges and the move can be read
  for (let k = 0; k < 2; k++) {
    await page.waitForFunction(() => { const p = window.KEEPSIES_DEV.placing(); return p && p.placed % 2 === 0; }, { timeout: 20000 });
    await page.evaluate((k) => { const D = window.KEEPSIES_DEV, sp = D.spotsFor('arch'); const q = sp[Math.floor(sp.length * (k ? 0.8 : 0.2))]; D.placeStatueNow('arch', q.x, q.z); }, k);
    await sleep(300);
  }
  await page.waitForFunction(() => !window.KEEPSIES_DEV.placing(), { timeout: 20000 }).catch(() => {});
  await page.waitForFunction(() => { const s = window.KEEPSIES_DEV.state(); return s.match && !s.match.simulating && s.match.turn === 0 && window.KEEPSIES_DEV.aimUi().nudge; }, { timeout: 60000 }).catch(() => {});
  await sleep(600);
  const mv = await page.evaluate(`(() => { const rect = ${rect}; const t = window.KEEPSIES_DEV.tawScreen(); return { b: rect('moveStatue'), t }; })()`);
  if (mv.b && mv.t) { const clear = Math.max(mv.b.l - mv.t.x, 0, mv.t.x - mv.b.l - mv.b.w, mv.b.t - mv.t.y, 0, mv.t.y - mv.b.t - mv.b.h) - mv.t.grabR; say(clear >= 0, ' Move a statue ' + JSON.stringify(mv.b) + ' is ' + clear.toFixed(1) + ' px clear of the circle'); } else say(false, ' Move a statue not offered: ' + JSON.stringify(mv));
  // the badges in the whole ring view, on a held LOOK
  const lk = await page.evaluate(`(() => { const rect = ${rect}; return rect('topDown'); })()`);
  if (lk) {
    await page.touchscreen.touchStart(lk.l + lk.w / 2, lk.t + lk.h / 2);
    await page.waitForFunction(() => window.KEEPSIES_DEV.debugCam().cam.el > 85, { timeout: 30000 }).catch(() => {});
    await sleep(5000);
    const bd = await page.evaluate(() => { const D = window.KEEPSIES_DEV, out = []; for (const b of document.querySelectorAll('.stBadge')) { const r = b.getBoundingClientRect(); out.push({ x: +(r.left + r.width / 2).toFixed(0), bottom: +r.bottom.toFixed(0), w: r.width, hidden: b.hidden, owner: b.dataset.owner, ix: +b.dataset.i }); } return { out, st: D.statues().map(s => { const p = D.projectGround(s.x, s.z, ({ column: 0.06, loaf: 0.034, arch: 0.06, orb: 0.054 })[s.shape]); return { x: +p.x.toFixed(0), y: +p.y.toFixed(0), owner: s.owner }; }) }; });
    say(bd.out.length === bd.st.length && bd.st.length === 4, ' badges ' + bd.out.length + ' for ' + bd.st.length + ' statues, 12 px wide: ' + bd.out.map(b => b.w).join(' '));
    for (const b of bd.out) { const s = bd.st[b.ix]; if (s) say(!b.hidden && Math.abs(b.x - s.x) <= 2 && s.y - b.bottom >= 0 && s.y - b.bottom <= 20 && +b.owner === s.owner, '  badge ' + b.ix + ' at ' + b.x + ',' + b.bottom + ' over the statue at ' + s.x + ',' + s.y); }
    await page.touchscreen.touchEnd(); await sleep(600);
    const off = await page.evaluate(() => Array.prototype.filter.call(document.querySelectorAll('.stBadge'), b => !b.hidden).length);
    await page.waitForFunction(() => window.KEEPSIES_DEV.debugCam().cam.el < 40, { timeout: 30000 }).catch(() => {});
    await sleep(1500);
    const off2 = await page.evaluate(() => Array.prototype.filter.call(document.querySelectorAll('.stBadge'), b => !b.hidden).length);
    say(off2 === 0, ' and off the whole ring view the badges go: ' + off2 + ' showing');
  } else say(false, ' no LOOK button');
  say(page.errors.length === 0, ' page errors ' + page.errors.length + ' ' + page.errors.slice(0, 2).join(' | ').slice(0, 300));
  await page.close();
}
console.log(bad ? bad + ' FAILED' : 'STATUES VIEW OK');
await done();
