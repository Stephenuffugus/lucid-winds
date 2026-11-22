/* m3 step 11: her plates, numbers only: each live render's rect against her window within 2 px, the pips on her centres, the stake slots, the strips, the cards' layouts. Run with the fast check green. */
import { open, sleep, done } from './probe.mjs';
import { POUCH_MOUTH, CHIP, HEIRLOOM, SHARE_MARBLE, SHARE_MATCH } from '../../src/render/plates.js';
const rectOf = `(el) => { if (typeof el === 'string') el = document.getElementById(el); if (!el) return null; const r = el.getBoundingClientRect(); return { l: +r.left.toFixed(1), t: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; }`;
let bad = 0; const say = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const within = (a, b, tol) => Math.abs(a - b) <= tol;
for (const [w, h] of (process.argv[2] ? JSON.parse(process.argv[2]) : [[412, 915], [375, 667], [360, 640]])) {
  const page = await open(w, h);
  const ev = (src) => page.evaluate(src);
  await page.evaluate(() => { const D = window.KEEPSIES_DEV; D.skipOnboarding(); D.grantSunbeams(20000); D.grantMarble('bloodstone_aggie'); });
  /* the setup: the cloth, five stake slots, Back still on the screen */
  await page.evaluate(() => { const D = window.KEEPSIES_DEV; D.setup(); }); await sleep(800);
  const su = await ev(`(() => { const rect = ${rectOf}; const st = [...document.querySelectorAll('#stakeStrip .stake')].slice(0, 5).map(rect); return { ante: rect('ante'), back: rect('setupBack'), go: rect('setupGo'), st, strip: rect('stakeStrip') }; })()`);
  say(su.st.every(q => q.w === 48 && q.h === 48), w + 'x' + h + ' stakes 48 px, ' + su.st.length + ' shown, step ' + (su.st[1] ? su.st[1].l - su.st[0].l : '-') + ' (her 60), strip width ' + (su.strip && su.strip.w));
  say(su.strip && su.strip.w >= 288, ' five slots show at once: 288 in ' + (su.strip && su.strip.w));
  say(su.back && su.back.t + su.back.h <= h && su.go && su.go.t + su.go.h <= h, ' Play and Back on the screen: Play foot ' + (su.go && su.go.t + su.go.h) + ', Back foot ' + (su.back && su.back.t + su.back.h) + ' of ' + h + '; cloth ' + JSON.stringify(su.ante));
  /* the chips: pips on her centres */
  await page.evaluate(() => window.KEEPSIES_DEV.go({ seed: 424242, forceFirst: 0 })); await page.waitForFunction(() => { const s = window.KEEPSIES_DEV.state(); return s.match && s.match.taw; }, { timeout: 40000 }); await sleep(1500);
  const ch = await ev(`(() => { const rect = ${rectOf}; const sides = [...document.querySelectorAll('#scores .side')].map(rect), pips = [...document.querySelectorAll('#sockMe .sock')].map(rect), mine = sides[0]; const who = rect('whoMe'); return { sides, pips, who }; })()`);
  const p0 = ch.sides[0], cxs = ch.pips.map(q => +(q.l + q.w / 2 - p0.l).toFixed(1)), cy0 = ch.pips[0] ? +(ch.pips[0].t + 8 - p0.t).toFixed(1) : null;
  const gapC = ch.sides[1].l - (ch.sides[0].l + ch.sides[0].w);
  say(ch.pips.length === 7 && ch.pips[0].w === CHIP.pipSize && within(cy0, CHIP.pipY, 0.6) && (p0.w < CHIP.w || cxs.every((x, k) => within(x, CHIP.pipX0 + CHIP.pipStep * k, 0.6))), ' chips ' + p0.w + 'x' + p0.h + ', pip centres ' + cxs.join(' ') + ' at ' + cy0 + ' (her ' + CHIP.pipX0 + ' + ' + CHIP.pipStep + 'k at ' + CHIP.pipY + ' on a ' + CHIP.w + ' chip), the gap ' + gapC.toFixed(0) + ' px');
  /* the tin: the renders in her windows */
  await page.evaluate(() => window.KEEPSIES_DEV.tin()); await sleep(2200);
  const tn = await ev(`(() => { const rect = ${rectOf}; return { pl: rect('heirlooms'), cv: [...document.querySelectorAll('#heirlooms canvas')].map(rect), back: [...document.querySelectorAll('#heirlooms canvas')].map(c => c.width), take: rect('tinTake') }; })()`);
  if (tn.cv.length === 3) {
    const k = tn.pl.w / 900;
    HEIRLOOM.windows.forEach((W, i) => { const q = tn.cv[i], x = tn.pl.l + W[0] * k, y = tn.pl.t + (W[1] - HEIRLOOM.cropTop) * k; say(within(q.l, x, 2) && within(q.t, y, 2) && within(q.w, W[2] * k, 2), ' heirloom ' + i + ' canvas ' + JSON.stringify(q) + ', her window ' + [x, y, W[2] * k].map(v => v.toFixed(1)).join(' ') + ', backing ' + tn.back[i]); });
    say(tn.take.t + tn.take.h <= h, ' the tin\'s button foot ' + (tn.take.t + tn.take.h) + ' of ' + h);
  } else say(false, ' the tin showed ' + tn.cv.length + ' canvases');
  await page.evaluate(() => { const v = document.getElementById('tin'); if (v) v.hidden = true; });
  /* the pouch reveal */
  for (const kind of ['standard', 'collector', 'grail']) {
    await page.evaluate((k) => { const D = window.KEEPSIES_DEV; D.collection(); D.pouch(k); }, kind); await sleep(1200);
    const po = await ev(`(() => { const rect = ${rectOf}; return { pl: rect('poPlate'), c: rect(document.querySelector('#poMouth canvas')), keep: rect('poKeep'), tier: rect('poTier'), hidden: document.getElementById('pouchOpen').hidden, back: (document.querySelector('#poMouth canvas') || {}).width }; })()`);
    if (po.hidden || !po.c) { say(false, ' pouch ' + kind + ' did not open: ' + (await page.evaluate(() => window.KEEPSIES_DEV.pouchSay()))); continue; }
    const k = po.pl.w / 320, M = POUCH_MOUTH[kind], cx = po.pl.l + M[0] * k, cy = po.pl.t + M[1] * k, r = 60 * k;
    say(within(po.c.l + po.c.w / 2, cx, 2) && within(po.c.t + po.c.h / 2, cy, 2) && within(po.c.w / 2, r, 2), ' pouch ' + kind + ' render ' + JSON.stringify(po.c) + ', her centre ' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' r ' + r.toFixed(1) + ', backing ' + po.back);
    say(po.keep.t + po.keep.h <= h && po.tier.h === 48, ' and Keep it foot ' + (po.keep.t + po.keep.h) + ' of ' + h + ', pill ' + po.tier.w + 'x' + po.tier.h);
    await page.evaluate(() => document.getElementById('poKeep').click()); await sleep(300);
  }
  /* the collection tile's mark */
  await page.evaluate(() => window.KEEPSIES_DEV.collection()); await sleep(1200);
  const tl = await ev(`(() => { const rect = ${rectOf}; const b = document.querySelector('#grid .tile'); if (!b) return null; return { t: rect(b), m: rect(b.querySelector('.tmark')), c: rect(b.querySelector('canvas')), f: getComputedStyle(b, '::after').borderImageSource.slice(0, 80) }; })()`);
  say(!!tl && !!tl.m && within(tl.m.l + 8 - tl.t.l, tl.t.w / 2, 1) && within(tl.m.t + 8 - tl.t.t, 10, 1), ' tile ' + (tl && tl.t.w) + ', its mark at ' + (tl && tl.m ? (tl.m.l + 8 - tl.t.l).toFixed(1) + ',' + (tl.m.t + 8 - tl.t.t).toFixed(1) : '-') + ' (her 48,10), render ' + (tl && tl.c.w) + 'x' + (tl && tl.c.h));
  /* inspect: the pill on the tallest card */
  await page.evaluate(() => { const D = window.KEEPSIES_DEV; D.inspect('lutz'); }); await sleep(800);
  const ins = await ev(`(() => { const rect = ${rectOf}; const c = document.getElementById('inspectCard'); return c ? { pill: rect('iTier'), sh: c.scrollHeight, ch: c.clientHeight, ov: getComputedStyle(c).overflowY } : null; })()`);
  say(!!ins && ins.pill.h === 48, ' inspect pill ' + (ins && ins.pill.w + 'x' + ins.pill.h) + ', the card ' + (ins && ins.sh) + ' in ' + (ins && ins.ch) + ', overflow ' + (ins && ins.ov));
  /* the result card with a level up, and the two share cards' layouts */
  await page.evaluate(() => { const D = window.KEEPSIES_DEV; D.grantXp(1000); const p = D.progress(); D.grantXp(Math.max(0, p.needed - p.xp - 60)); D.setup(); D.stake('dirt_plain'); D.go({ seed: 424242, forceFirst: 0 }); D.forceEnd(0); });
  await sleep(600); await page.evaluate(() => window.KEEPSIES_DEV.ceremonySkip()); await sleep(1200);
  const lv = await ev(`(() => { const rect = ${rectOf}; const e = document.getElementById('rLevel'); return { r: e.hidden ? null : rect(e), lvT: e.querySelector('.lv') ? e.querySelector('.lv').textContent : '', rwT: e.querySelector('.rw') ? e.querySelector('.rw').textContent : '', lv: e.querySelector('.lv') ? rect(e.querySelector('.lv')) : null, ov: e.querySelector('.rw') ? e.querySelector('.rw').scrollWidth > e.querySelector('.rw').clientWidth : null, again: rect('again') }; })()`);
  say(!!lv.r && lv.r.h === 60, ' level strip ' + JSON.stringify(lv.r) + ': "' + lv.lvT + '" / "' + lv.rwT + '", reward overflows ' + lv.ov + ', Rematch foot ' + (lv.again.t + lv.again.h) + ' of ' + h);
  const ly = await page.evaluate(() => window.KEEPSIES_DEV.cardLayouts('lutz'));
  const inW = (R, W, tol) => R[0] >= W[0] - tol && R[1] >= W[1] - tol && R[0] + R[2] <= W[0] + W[2] + tol && R[1] + R[3] <= W[1] + W[3] + tol;
  say(inW(ly.marble.render, SHARE_MARBLE.render_window, 2), ' marble card render ' + ly.marble.render.join(' ') + ' in her window ' + SHARE_MARBLE.render_window.join(' '));
  if (ly.match) { say(inW(ly.match.render, SHARE_MATCH.render_window, 2), ' match card render ' + ly.match.render.join(' ') + ' in her window ' + SHARE_MATCH.render_window.join(' ')); say(ly.match.pots.length > 0 && ly.match.pots.every(p => inW(p, SHARE_MATCH.pot_cloth_box, 2)), ' and ' + ly.match.pots.length + ' pot renders on her cloth ' + JSON.stringify(ly.match.pots)); } else say(false, ' no match card');
  say(page.errors.length === 0, ' page errors ' + page.errors.length + ' ' + page.errors.slice(0, 3).join(' | ').slice(0, 400));
  await page.close();
}
console.log(bad ? bad + ' FAILED' : 'PLATES VIEW OK');
await done();
