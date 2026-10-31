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
 * ART1 (Astra's art, Q160): in saturated-blobs built under each of the five biomes, the hero set down at the elite's
 * home (SB_DEV.goto('elite')), the elite is drawn as its own <kind>_elite key, 24x24 at 1:1, placed in the sim's box
 * by its manifest anchor (moth and jelly centred, icicle hung from the top, crawler and spark on the bottom, at rest
 * held to the ceiling or floor of the row the box's middle is in, since the box starts centred on its cell; the
 * crawler mirrored to its way), and every opaque pixel of its frame (read from the page's SPRITES here) is that colour
 * on the canvas. The top strip's hearts, three full of eight, read from a real screenshot: each of the 72 pixels of
 * every heart is hud_heart's full or empty frame at 2x.
 *
 * Watched red by OFF_PALETTE_PIXEL (the atlas writes one channel a step off), ANIM_AT_60 (the run advances every
 * step), DASH_NO_FLASH (the i frames drawn plain), ELITE_DRAWS_BASE (an elite drawn as its base art scaled to
 * ELITE_PX), ELITE_SUNK (the rest rule off: the icicle's root and the spark's base 4 px into the roof and floor) and
 * HEART_NOT_SPRITE (the old CSS hearts back). */
import vm from 'node:vm';
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
/* the page's own SPRITES (the page under test, SB_PAGE for redwatch's mutants), the oracle for the elites and hearts */
const PAGE_SRC = readFileSync(process.env.SB_PAGE || GAME + '/index.html', 'utf8');
const SPR = vm.runInNewContext(PAGE_SRC.match(/\/\* SPRITES BEGIN \*\/([\s\S]*?)\/\* SPRITES END \*\//)[1] + '\n;SPRITES');
/* a drawn key's frame decoded here: '<' mirrored, '*' the hero's Glare copy (Sun and Walnut turned Glare, Q47) */
const frameOf = key => { const m = key.match(/^([a-z_]+)\.([a-z0-9_]+?)(<?)(\*?)$/); if (!m || !SPR[m[1]] || !SPR[m[1]].frames[m[2]]) return null; let rows = SPR[m[1]].frames[m[2]].split('/'); if (m[3]) rows = rows.map(r => r.split('').reverse().join('')); if (m[4]) rows = rows.map(r => r.replace(/[e7]/g, '6')); return rows; };
/* ART2: the hero as drawn, against its frame decoded here: the key, the rect, and every opaque pixel on the canvas */
const heroNow = page => page.evaluate(() => {
  const hd = window.SB.render.drawn.hero, camX = window.SB.render.drawn.camX || 0, cv = document.getElementById('view'), s = window.SB.game.state;
  if (!hd.key) return { key: null };
  const d = cv.getContext('2d').getImageData(hd.x, hd.y, hd.w, hd.h).data, px = [];
  for (let i = 0; i < d.length; i += 4) px.push('#' + [d[i], d[i + 1], d[i + 2]].map(v => ('0' + v.toString(16)).slice(-2)).join(''));
  return { key: hd.key, x: hd.x, y: hd.y, w: hd.w, h: hd.h, hx: (s.hero.x >> 8) - camX, hy: (s.hero.y >> 8) - (window.SB.render.drawn.cam || 0), px };
});
const heroEq = h => { const rows = h.key ? frameOf(h.key) : null; if (!rows || rows.length !== h.h || rows[0].length !== h.w) return { n: 0, bad: ['no frame of ' + h.w + 'x' + h.h + ' for ' + h.key] }; let n = 0; const bad = []; for (let y = 0; y < h.h; y++) for (let x = 0; x < h.w; x++) { const ch = rows[y][x]; if (ch === '.') continue; n++; if (h.px[y * h.w + x] !== '#' + HEX[parseInt(ch, 16)]) bad.push(x + ',' + y + ' ' + h.px[y * h.w + x]); } return { n, bad }; };
const srv = await serve();
const browser = await launch();

try {
  const { page, errors } = await newPage(browser, { width: 412, height: 915 });
  await gotoGame(page, srv.base);
  await ready(page);
  await page.evaluate(() => window.SB_DEV.hold(true));
  const loaded = await page.evaluate(str => window.SB_DEV.loadRecord(str), fixture);
  /* an enemy drawn in view while the hero stands out of its i frames (T1.2b: saturated-blobs' icicle hangs below the
     low plank and comes in level with the hero, so "within 6 rows above" never held and the wait ended in a death) */
  const st = await page.evaluate(() => {
    window.SB_DEV.step(1);
    for (let k = 0; k < 6000; k += 5) {
      const s = window.SB_DEV.state(), inView = window.SB_DEV.spriteRects().enemies.length > 0;
      if (inView && s.hero.ground && s.hero.squash === 0 && s.hero.iframes === 0 && !s.room.dead) break;
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

  /* ART2 (Q35, Q161): the takeoff stretch and the landing squash are Astra's 10x18 and 14x14 poses, drawn 1:1 for every
     step of the sim's squash counter, bottom centred in the rect the old transform scaled into (x + 1, y - 2 and x - 1,
     y + 2), every opaque pixel the frame on the canvas */
  await page.evaluate(() => window.SB_DEV.step(30));
  await page.keyboard.down('KeyZ');
  const sq = [];
  for (let k = 0; k < 90; k++) {
    const sqv = await page.evaluate(() => { window.SB_DEV.step(1); return window.SB_DEV.state().hero.squash; });
    if (sqv !== 0) { const h = await heroNow(page); sq.push(Object.assign({ squash: sqv }, h, heroEq(h))); }
  }
  await page.keyboard.up('KeyZ');
  const stretch = sq.filter(f => f.squash < 0), squash = sq.filter(f => f.squash > 0);
  const stOk = stretch.length >= 5 && stretch.every(f => /^hero_stretch\.stretch<?$/.test(f.key) && f.w === 10 && f.h === 18 && f.x === f.hx + 1 && f.y === f.hy - 2 && f.n > 40 && f.bad.length === 0);
  const sqOk = squash.length >= 5 && squash.every(f => /^hero_squash\.squash<?$/.test(f.key) && f.w === 14 && f.h === 14 && f.x === f.hx - 1 && f.y === f.hy + 2 && f.n > 40 && f.bad.length === 0);
  R.say(stOk && sqOk, 'the takeoff draws hero_stretch 10x18 for ' + stretch.length + ' steps and the landing hero_squash 14x14 for ' + squash.length + ', 1:1 in the old transform\'s rects, every opaque pixel the frame (' + [...new Set(sq.map(f => f.key + ' ' + f.w + 'x' + f.h + ' at ' + (f.x - f.hx) + ',' + (f.y - f.hy) + (f.bad.length ? ' ' + f.bad.length + ' differ' : '')))].join('; ') + ')');

  /* ART2: the dash's own lean: hero_dash for its steps on the ground, the Glare copy through its i frames, every opaque
     pixel the frame (Sun and Walnut Glare while lit) */
  await page.evaluate(() => window.SB_DEV.step(40));
  await page.keyboard.down('KeyX'); await page.evaluate(() => window.SB_DEV.step(1)); await page.keyboard.up('KeyX');
  const dsh = [];
  for (let k = 0; k < 6; k++) { const h = await heroNow(page); dsh.push(Object.assign(h, heroEq(h))); await page.evaluate(() => window.SB_DEV.step(1)); }
  const dshOn = dsh.filter(f => f.key && f.key.startsWith('hero_dash.'));
  R.say(dshOn.length >= 4 && dshOn.some(f => f.key.endsWith('*')) && dshOn.some(f => !f.key.endsWith('*')) && dshOn.every(f => f.n > 40 && f.bad.length === 0),
    'a dash draws hero_dash, lit through its i frames then plain, every opaque pixel the frame (' + dsh.map(f => f.key + (f.bad.length ? ' ' + f.bad.length + ' differ' : '')).join(', ') + ')');

  /* ART2: the hurt recoil: a moth laid on the bug (a liberty), the hit; the pose for the hit's first HURT_POSE_F steps
     wherever the blink shows the bug, then the plain frames again */
  await page.evaluate(() => window.SB_DEV.step(40));
  await page.evaluate(() => { const st = window.SB.game.state; st.hero.iframes = 0; st.hero.dashI = 0; st.hero.hearts = Math.max(st.hero.hearts, 3); st.enemies.push({ kind: 1, x: st.hero.x, y: st.hero.y, vx: 0, vy: 0, hp: 4, state: 0, timer: 0, dir: 1, home: 0, elite: 0, frozen: 0, stunned: 0, hurt: 0 }); });
  const hurt = [];
  for (let k = 0; k < 24; k++) { const it = await page.evaluate(() => { window.SB_DEV.step(1); return window.SB.game.state.hero.iframes; }); const h = await heroNow(page); hurt.push(Object.assign({ it }, h, h.key ? heroEq(h) : { n: 0, bad: [] })); }
  const hit0 = hurt.findIndex(f => f.it > 0), posed = hurt.filter(f => f.key && f.key.startsWith('hero_hurt.')), HF = hurt[hit0] ? hurt[hit0].it : 0;
  R.say(hit0 >= 0 && posed.length >= 6 && posed.every(f => f.it > HF - 16 && f.n > 40 && f.bad.length === 0) && hurt.some(f => f.key && f.it > 0 && f.it <= HF - 16 && !f.key.startsWith('hero_hurt.')),
    'a hit draws hero_hurt.recoil for ' + posed.length + ' shown steps of its first 16, every opaque pixel the frame, then the plain frames (' + hurt.map(f => (f.key ? f.key.replace('hero.', '').replace('hero_hurt.', 'H:') : '-') + '@' + f.it).join(' ') + ')');

  /* ART2: the drop in: a fresh room, its first 24 steps the three beats of hero_dropin, 8 steps each (8 fps), then idle */
  await page.evaluate(str => { window.SB_DEV.loadRecord(str); window.SB_DEV.step(0); }, fixture);
  const drop = [];
  for (let k = 0; k < 26; k++) { const h = await heroNow(page); drop.push(Object.assign(h, heroEq(h))); await page.evaluate(() => window.SB_DEV.step(1)); }
  const dropWant = ['descending', 'contact', 'settled'].flatMap(b => Array(8).fill(b));
  R.say(drop.slice(0, 24).every((f, i) => f.key && f.key.replace(/[<*]/g, '') === 'hero_dropin.' + dropWant[i] && f.n > 40 && f.bad.length === 0) && /^hero\.idle/.test(drop[24].key),
    'a room opens on the drop in: ' + drop.map(f => (f.key || '-').replace('hero_dropin.', '').replace('hero.', '')).join(' ') + (drop.some(f => f.bad.length) ? ' (pixels differ)' : '') + ', every opaque pixel the frame');

  /* the perf guard, the loop running with the moth live */
  await page.evaluate(() => window.SB_DEV.hold(false));
  await new Promise(r => setTimeout(r, 3000));
  const perf = await page.evaluate(() => window.SB_DEV.perf());
  const p95 = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * 0.95))] : 0; };
  const ps = p95(perf.step), pd = p95(perf.draw);
  R.say(perf.draw.length >= 20 && ps + pd < 4, 'the p95 step ' + ps.toFixed(2) + ' ms plus the p95 draw ' + pd.toFixed(2) + ' ms is under 4 ms (' + perf.draw.length + ' draws)');

  /* ART1: each biome's elite, its own art 1:1 in the sim's box by its anchor (Q160) */
  await page.evaluate(() => window.SB_DEV.hold(true));
  const ANCHOR = { moth: 'cell', icicle: 'top', jelly: 'cell', crawler: 'bottom', spark: 'bottom' }, KIND = ['', 'moth', 'icicle', 'jelly', 'crawler', 'spark'];
  for (let b = 0; b < 5; b++) {
    const got = await page.evaluate((str, b) => {
      window.SB_DEV.loadRecord(str, b); window.SB_DEV.goto('elite'); window.SB_DEV.step(0);   /* drawn, not stepped: the icicle still hangs (a step with the hero below it drops it) */
      const rc = window.SB_DEV.spriteRects(), st = window.SB_DEV.state(), camY = window.SB_DEV.level().camY;
      const cv = document.getElementById('view'), img = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height);
      const el = st.enemies.filter(e => e.elite)[0];
      return { rc, el: el && { kind: el.kind, x: el.x >> 8, y: (el.y >> 8) - camY, dir: el.dir, state: el.state, row: Math.floor(((el.y >> 8) + 12) / 16) * 16 - camY }, W: cv.width, H: cv.height, px: Array.from(img.data) };
    }, fixture, b);
    const kind = got.el ? KIND[got.el.kind] : '?';
    const r = got.rc.enemies.find(e => e.box && got.el && e.box.x === got.el.x && e.box.y === got.el.y && e.box.w === 24);
    const rows = r ? frameOf(r.key) : null, an = ANCHOR[kind];
    /* at rest (state 0) a top or bottom anchor holds to the ceiling or floor of the row the box's middle is in (the box
       starts centred on its cell, 4 px into the roof and the floor); in flight it rides the box */
    const rest = got.el && got.el.state === 0;
    const wantY = r ? (an === 'top' ? (rest ? got.el.row : r.box.y) : an === 'bottom' ? (rest ? got.el.row + 16 - 24 : r.box.y + r.box.h - 24) : r.box.y) : null;
    const keyOk = !!r && new RegExp('^' + kind + '_elite\\.[ab]' + (kind === 'crawler' && got.el.dir < 0 ? '<' : '') + '$').test(r.key);
    const placeOk = !!r && r.w === 24 && r.h === 24 && r.x === r.box.x && r.y === wantY;
    let n = 0, bad = [];
    if (rows && keyOk) {
      const hr = got.rc.hero, inHero = (x, y) => hr && x >= hr.x && x < hr.x + hr.w && y >= hr.y && y < hr.y + hr.h;
      for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
        const ch = rows[y][x], cx = r.x + x, cy = r.y + y;
        if (ch === '.' || inHero(cx, cy) || cx < 0 || cy < 0 || cx >= got.W || cy >= got.H) continue;
        const o = (cy * got.W + cx) * 4, h = hex([got.px[o], got.px[o + 1], got.px[o + 2]]);
        n++; if (h !== '#' + HEX[parseInt(ch, 16)]) bad.push(x + ',' + y + ' ' + h + ' not ' + HEX[parseInt(ch, 16)]);
      }
    }
    /* at least 60: the hero, set down at the elite's home, covers part of a cell centred one */
    R.say(keyOk && placeOk && n >= 60 && bad.length === 0, 'biome ' + b + ': the ' + kind + ' elite drawn as ' + (r ? r.key + ' at ' + r.x + ',' + r.y + ' ' + r.w + 'x' + r.h + ' in its box ' + r.box.x + ',' + r.box.y + ' (' + an + (an !== 'cell' && rest ? ', at rest on its row\'s ' + (an === 'top' ? 'ceiling ' : 'floor ') + got.el.row : '') + ')' : 'nothing (keys: ' + got.rc.enemies.map(e => e.key).join(' ') + ')')
      + ', ' + n + ' opaque pixels equal its frame on the canvas' + (bad.length ? ' (' + bad.length + ' differ: ' + bad.slice(0, 3).join('; ') + ')' : ''));
  }

  /* ART1: the hearts, three full of eight (the cap), read from a real screenshot at the page's dpr (Q160) */
  const hb = await page.evaluate(() => {
    window.SB.ui.hearts(3, 8);
    const els = Array.from(document.querySelectorAll('#hearts i')), box = document.getElementById('hearts').getBoundingClientRect();
    return { box: { x: box.left, y: box.top, w: box.width, h: box.height }, hs: els.map(e => { const q = e.getBoundingClientRect(); return { x: q.left, y: q.top, w: q.width, h: q.height, lost: e.classList.contains('lost') }; }), dpr: window.devicePixelRatio };
  });
  const shot = await page.screenshot({ encoding: 'base64', clip: { x: hb.box.x, y: hb.box.y, width: hb.box.w, height: hb.box.h } });
  const sp = await page.evaluate(async (b64) => {
    const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
    return { w: im.width, h: im.height, px: Array.from(x.getImageData(0, 0, im.width, im.height).data) };
  }, shot);
  let hn = 0; const hbad = [];
  hb.hs.forEach((q, i) => {
    const rows = SPR.hud_heart.frames[q.lost ? 'empty' : 'full'].split('/');
    for (let y = 0; y < 8; y++) for (let x = 0; x < 9; x++) {
      const ch = rows[y][x]; if (ch === '.') continue;
      const dx = Math.floor((q.x - hb.box.x + (x * 2 + 1) * q.w / 18) * hb.dpr), dy = Math.floor((q.y - hb.box.y + (y * 2 + 1) * q.h / 16) * hb.dpr);
      const o = (dy * sp.w + dx) * 4, h = hex([sp.px[o], sp.px[o + 1], sp.px[o + 2]]);
      hn++; if (h !== '#' + HEX[parseInt(ch, 16)]) hbad.push('heart ' + i + ' ' + x + ',' + y + ' ' + h + ' not ' + HEX[parseInt(ch, 16)]);
    }
  });
  const shape = hb.hs.length === 8 && hb.hs.filter(q => q.lost).length === 5 && hb.hs.every(q => q.w === 18 && q.h === 16);
  const opq = f => SPR.hud_heart.frames[f].replace(/[/.]/g, '').length;
  R.say(shape && hn === 3 * opq('full') + 5 * opq('empty') && hbad.length === 0, 'the top strip\'s ' + hb.hs.length + ' hearts (3 full, 5 empty, each 18x16 css px) are hud_heart at 2x on a real screenshot: ' + hn + ' opaque pixels' + (hbad.length ? ' (' + hbad.length + ' differ: ' + hbad.slice(0, 3).join('; ') + ')' : ''));

  R.say(errors.length === 0, 'zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
  await page.close();
} finally {
  await browser.close();
  await srv.close();
}
R.finish();
