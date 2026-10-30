/* Browser gate `sprites` (BUILD-PLAN.md T0.17, section 5.6's table): the art is the palette.
 *
 * In saturated-blobs (film tabs and a moth) with the moth drawn near the hero, 64 pixels sampled by
 * SB_DEV.samplePixels(64) from where a sprite is opaque inside SB_DEV.spriteRects() (the hero, every live moth, the
 * beacon, every platform top edge row in view, every film tab) are each one of the sixteen hexes: an anti aliased edge,
 * a blend or a smoothed scale would put a pixel between them. The negative control: a backdrop pixel away from every
 * sprite (SB_DEV.backdropProbe) is NOT on palette and equals section 7.3's open blend, mix(mix(palette[idx], Pewter,
 * 0.4), the biome's open tint, 0.2), computed here from the hexes, so the sampler can tell the photo from the art.
 * The run holds each frame 5 steps (12 fps at 60), never 1. The perf guard: with the moths live the p95 of a step plus
 * the p95 of a draw stay under 4 ms on this box. Zero page errors.
 *
 * A dash draws the hero's Glare copy for exactly its 4 i frames (QUESTIONS Q47).
 *
 * Watched red by OFF_PALETTE_PIXEL (the atlas writes one channel a step off), ANIM_AT_60 (the run advances every
 * step) and DASH_NO_FLASH (the i frames drawn plain). */
import { readFileSync } from 'node:fs';
import { serve, launch, newPage, gotoGame, ready, reporter, GAME } from './harness.mjs';

const R = reporter('SPRITES');
const HEX = ['0b0a0f', '1f1a1d', '4a4a52', '8a8a90', 'c9c7c0', 'f2efe6', 'fbfbff', '6b3f2a', 'e07a2b', 'c8302f', 'd83a9b', '2f5fd0', '3fb8b4', '3f9a3a', 'f2d13f', 'f0dcb0'];
const ON = new Set(HEX.map(h => '#' + h));
const rgb = h => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const OPEN_TINT = [4, 5, 2, 4, 3];   /* section 7.3: Attic Ash, Frost Paper, Deep Slate, Overgrowth Ash, Ember Pewter */
const hex = c => '#' + c.map(v => ('0' + v.toString(16)).slice(-2)).join('');
const fixture = readFileSync(GAME + '/fixtures/synthetic/saturated-blobs.json', 'utf8');
const srv = await serve();
const browser = await launch();

try {
  const { page, errors } = await newPage(browser, { width: 412, height: 915 });
  await gotoGame(page, srv.base);
  await ready(page);
  await page.evaluate(() => window.SB_DEV.hold(true));
  const loaded = await page.evaluate(str => window.SB_DEV.loadRecord(str), fixture);
  /* let the moth come within 6 rows of the hero, standing, out of the i frames */
  const st = await page.evaluate(() => {
    for (let k = 0; k < 6000; k += 5) {
      const s = window.SB_DEV.state(), near = s.enemies.some(e => Math.abs(e.y - s.hero.y) < 6 * 4096 && Math.abs(e.y - s.hero.y) > 1.5 * 4096);
      if (near && s.hero.ground && s.hero.squash === 0 && s.hero.iframes === 0) break;
      window.SB_DEV.step(5);
    }
    window.SB_DEV.step(1);
    return { s: window.SB_DEV.state(), rects: window.SB_DEV.spriteRects() };
  });
  R.say(loaded && st.rects.hero && st.rects.enemies.length >= 1 && st.rects.tabs.length >= 1 && st.rects.edges.length >= 1,
    'saturated-blobs: the hero, ' + st.rects.enemies.length + ' moth, ' + st.rects.tabs.length + ' film tabs and ' + st.rects.edges.length + ' edge rows in view');

  const px = await page.evaluate(() => window.SB_DEV.samplePixels(64));
  const off = px.filter(p => !ON.has(p.hex)), kinds = [...new Set(px.map(p => p.kind))];
  R.say(px.length === 64 && off.length === 0, '64 pixels sampled from ' + kinds.join(', ') + ' are each one of the 16 hexes' + (off.length ? ' (off: ' + off.slice(0, 6).map(p => p.kind + ' ' + p.x + ',' + p.y + ' ' + p.hex).join('; ') + ')' : ''));
  R.say(['hero', 'enemy', 'edge', 'tab'].every(k => kinds.includes(k)), 'the samples cover the hero, a moth, the edges and the tabs (' + kinds.join(', ') + ')');

  const bd = await page.evaluate(() => window.SB_DEV.backdropProbe());
  const want = bd ? hex(mix(mix(rgb(HEX[bd.idx]), rgb(HEX[3]), 0.4), rgb(HEX[OPEN_TINT[bd.biome]]), 0.2)) : null;
  R.say(!!bd && !ON.has(bd.hex) && bd.hex === want, 'the backdrop at (' + (bd && bd.x) + ', ' + (bd && bd.y) + ') is off palette and the blend: ' + (bd && bd.hex) + ' (palette ' + (bd && bd.idx) + ', want ' + want + ')');

  /* the run: a real key held, the frame read every step */
  await page.keyboard.down('ArrowRight');
  const seq = await page.evaluate(() => { const out = []; for (let k = 0; k < 45; k++) { window.SB_DEV.step(1); const s = window.SB_DEV.state(); out.push(s.hero.ground ? window.SB_DEV.heroFrame() : 'air'); } return out; });
  await page.keyboard.up('ArrowRight');
  const runs = []; let cur = null, n = 0;
  for (const f of seq.map(f => f.replace(/[<*]/g, ''))) { if (f === cur) n++; else { if (cur) runs.push([cur, n]); cur = f; n = 1; } }
  runs.push([cur, n]);
  const inner = runs.slice(1, -1).filter(r => r[0].startsWith('hero.run'));
  R.say(inner.length >= 3 && inner.every(r => r[1] === 5), 'running, each frame holds 5 steps (12 fps): ' + runs.map(r => r[0].replace('hero.', '') + ' ' + r[1]).join(', '));

  /* the moth flutters at 12 fps too: its frame holds 5 steps (the fourth review: it held 8) */
  const mseq = await page.evaluate(() => { const out = []; for (let k = 0; k < 40; k++) { window.SB_DEV.step(1); const e = window.SB_DEV.spriteRects().enemies; out.push(e.length ? e[0].key : '-'); } return out; });
  const mruns = []; let mc = null, mn = 0;
  for (const f of mseq) { if (f === mc) mn++; else { if (mc) mruns.push([mc, mn]); mc = f; mn = 1; } }
  mruns.push([mc, mn]);
  const minner = mruns.slice(1, -1);
  R.say(minner.length >= 3 && minner.every(r => r[0] !== '-' && r[1] === 5), 'the moth flutters at 12 fps, each frame held 5 steps: ' + mruns.map(r => r[0].replace('moth.', '') + ' ' + r[1]).join(', '));

  /* the dash's i frames drawn (QUESTIONS Q47): face left (away from the wall the run ends at), stop, then B on the
     ground; the Glare copy ('*') for exactly the dash's i frames, from its first step */
  await page.keyboard.down('ArrowLeft'); await page.evaluate(() => window.SB_DEV.step(1)); await page.keyboard.up('ArrowLeft');
  await page.evaluate(() => window.SB_DEV.step(30));
  await page.keyboard.down('KeyX'); await page.evaluate(() => window.SB_DEV.step(1)); await page.keyboard.up('KeyX');
  const dash = await page.evaluate(() => { const out = [window.SB_DEV.heroFrame()]; for (let k = 0; k < 9; k++) { window.SB_DEV.step(1); out.push(window.SB_DEV.heroFrame()); } return out; });
  const lit = dash.map(f => f.endsWith('*'));
  const litN = lit.filter(Boolean).length, first = lit.indexOf(true), contiguous = lit.slice(first, first + litN).every(Boolean);
  R.say(first === 0 && litN === 4 && contiguous, 'a dash draws the Glare hero for exactly its 4 i frames from its first step (' + dash.map(f => f.replace('hero.', '')).join(' ') + ')');

  /* the same, read from the canvas (the fourth review: the key alone passed a flash the atlas never drew): the hero's
     opaque pixels hold no Sun through the 4 i frames, and Sun again after them */
  await page.evaluate(() => window.SB_DEV.step(40));
  await page.keyboard.down('KeyX'); await page.evaluate(() => window.SB_DEV.step(1)); await page.keyboard.up('KeyX');
  const glow = await page.evaluate(sun => {
    const out = [];
    for (let k = 0; k < 8; k++) {
      const hp = window.SB_DEV.samplePixels(64).filter(p => p.kind === 'hero');
      out.push({ lit: window.SB_DEV.heroFrame().endsWith('*'), sun: hp.filter(p => p.hex === sun).length, n: hp.length });
      window.SB_DEV.step(1);
    }
    return out;
  }, '#' + HEX[14]);
  const litPx = glow.filter(g => g.lit), plainPx = glow.filter(g => !g.lit);
  R.say(litPx.length === 4 && litPx.every(g => g.n > 0 && g.sun === 0) && plainPx.length > 0 && plainPx.every(g => g.sun > 0),
    'on the canvas the hero shows no Sun through the dash i frames, and Sun again after them (' + glow.map(g => (g.lit ? '*' : '') + g.sun + '/' + g.n).join(' ') + ')');

  /* the landing squash and the takeoff stretch are scaled draws: their pixels stay on the palette too */
  await page.evaluate(() => window.SB_DEV.step(30));
  await page.keyboard.down('KeyZ');
  const sq = await page.evaluate(() => {
    const out = [];
    for (let k = 0; k < 90; k++) {
      window.SB_DEV.step(1);
      const s = window.SB_DEV.state();
      if (s.hero.squash !== 0) out.push({ squash: s.hero.squash, px: window.SB_DEV.samplePixels(64).filter(p => p.kind === 'hero') });
    }
    return out;
  });
  await page.keyboard.up('KeyZ');
  const stretch = sq.filter(f => f.squash < 0), squash = sq.filter(f => f.squash > 0), offSq = sq.flatMap(f => f.px.filter(p => !ON.has(p.hex)));
  R.say(stretch.length > 0 && squash.length > 0 && offSq.length === 0, 'the stretch (' + stretch.length + ' frames) and the squash (' + squash.length + ' frames) draw only palette pixels (' + sq.reduce((a, f) => a + f.px.length, 0) + ' sampled' + (offSq.length ? ', off: ' + offSq.slice(0, 4).map(p => p.hex).join(' ') : '') + ')');

  /* the perf guard, the loop running with the moth live */
  await page.evaluate(() => window.SB_DEV.hold(false));
  await new Promise(r => setTimeout(r, 3000));
  const perf = await page.evaluate(() => window.SB_DEV.perf());
  const p95 = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * 0.95))] : 0; };
  const ps = p95(perf.step), pd = p95(perf.draw);
  R.say(perf.draw.length >= 20 && ps + pd < 4, 'the p95 step ' + ps.toFixed(2) + ' ms plus the p95 draw ' + pd.toFixed(2) + ' ms is under 4 ms (' + perf.draw.length + ' draws)');
  R.say(errors.length === 0, 'zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
  await page.close();
} finally {
  await browser.close();
  await srv.close();
}
R.finish();
