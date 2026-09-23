// VERSION 2 IN THE GAME (DESIGN-T2 5.2): the six new pattern families where she meets them. tools/family-sheet.mjs
// shows each family alone and flat; this shows them in a real Heavy Load on the table, on a sock's card, and in the
// Drawer's pattern row, at a phone's size. It checks that the running game mints version 2 (every ordinary sock
// marked), prints where one sock of each new family landed and crops the table round it, so each can be looked at
// close, then taps the Drawer's Tweed chip for real.
//   node dev/shots-gen2.mjs [w h]      (412 915 by default)
import { harness } from '../tools/harness.mjs';

const W = Number(process.argv[2] || 412);
const H2 = Number(process.argv[3] || 915);
const NEW = ['herringbone', 'basketweave', 'windowpane', 'pinstripe', 'tweed', 'lattice'];
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const H = await harness({ w: W, h: H2, port: 8797, dpr: 1 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const settle = (fn, arg, ms = 240000) => H.page.waitForFunction(fn, { timeout: ms, polling: 400 }, arg).then(() => true, () => false);
const sheetOpen = () => { const s = document.getElementById('sheet'); if (!s || !s.classList.contains('on')) return false; const t = getComputedStyle(s).transform; return t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)'; };

try {
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  await H.open('?nosw&turbo=1&skipdump=1&load=laundry&size=heavy&tier=5&seed=gen2-a', 'play', 300000);
  // try seeds until a Heavy Load has at least four of the six new families ON TOP, where a picture can see them
  let got = null, marked = null;
  for (let k = 0; k < 10 && !got; k++) {
    if (k) {
      await D((seed) => { const app = window.TUMBLE; app.game.abandonLoad(); app.start({ mode: 'laundry', size: 'heavy', tier: 5, seed }); }, 'gen2-' + String.fromCharCode(97 + k));
      await settle(() => window.TUMBLE_DEV && window.TUMBLE_DEV.state === 'play');
    }
    const r = await D(async (NEW) => {
      const SG = await import('/engine/sockgen.js');
      const app = window.TUMBLE, g = app.game, S = g.session, out = {};
      let plain = 0, v2 = 0;
      for (const s of S.socks.values()) {
        if (s.hero) continue;
        plain++;
        if (s.seed.includes('~g.2')) v2++;
        const sp = SG.decode(s.seed);
        if (!NEW.includes(sp.family)) continue;
        const p = g.physics.pose(s.id);
        if (!p) continue;
        const q = g.render.project(p);
        // the highest one of each family (nearest the camera), inside the screen and clear of the HUD bands
        if (q.x < 40 || q.x > innerWidth - 40 || q.y < 120 || q.y > innerHeight - 150) continue;
        if (!out[sp.family] || p.y > out[sp.family].h) out[sp.family] = { id: s.id, name: app.nameOf(s.seed), seed: s.seed, x: Math.round(q.x), y: Math.round(q.y), h: p.y };
      }
      return { plain, v2, fams: out };
    }, NEW);
    marked = marked || r;
    if (Object.keys(r.fams).length >= 4) { got = r; marked = r; }
  }
  ok(marked && marked.plain > 20 && marked.v2 === marked.plain, `the running game mints version 2: every ordinary sock in the Load is marked (${marked ? marked.v2 + ' of ' + marked.plain : 'no Load'})`);
  ok(!!got, `a Heavy Load with at least four of the six new families on screen${got ? ': ' + Object.keys(got.fams).join(', ') : ''}`);
  await D(() => { const s = window.TUMBLE.save; for (const k of ['firstTapHint', 'mismatchHint', 'missHint', 'fogHint']) s.seen[k] = true; window.TUMBLE.ui.hideHint(); });
  await H.frames(6);
  await H.shot(`gen2-table-${W}.png`);
  // a close crop round each: the table picture is where a pattern has to read, at the size a heap gives it
  for (const [fam, f] of Object.entries(got ? got.fams : {})) {
    console.log(`  info  ${fam}: ${f.name} at ${f.x},${f.y}`);
    const cw = 150, ch = 150;
    const x = Math.max(0, Math.min(W - cw, f.x - cw / 2)), y = Math.max(0, Math.min(H2 - ch, f.y - ch / 2));
    await H.page.screenshot({ path: `${H.out}/gen2-crop-${fam}-${W}.png`, clip: { x, y, width: cw, height: ch } });
  }

  // the card: one sock of each new family held up, its name and its pattern's name
  await D(() => { const app = window.TUMBLE; app.game.abandonLoad(); app.showRoom(); });
  await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room');
  const seeds = await D(async (NEW) => {
    // one real version 2 seed per family from the generator, plus the first ten, into a Drawer with a history
    const SG = await import('/engine/sockgen.js');
    const app = window.TUMBLE, dec = SG.decode, byFam = {};
    for (let i = 0; i < 4000 && Object.keys(byFam).length < 16; i++) {
      const sd = SG.seedFrom('gen2-drawer-' + i) + '~g.2';
      const f = dec(sd).family;
      if (!byFam[f]) byFam[f] = sd;
    }
    let t = Date.now() - 1e6;
    app.save.drawer = Object.values(byFam).map((sd) => ({ sockSeed: sd, foundAt: t++, count: 1, odd: false }));
    app.store.save();
    return NEW.map((f) => byFam[f]);
  }, NEW);
  const cards = [];
  for (let i = 0; i < NEW.length; i++) {
    await D((sd) => window.TUMBLE.screens.sockCard({ sockSeed: sd, count: 1 }), seeds[i]);
    await settle(sheetOpen);
    await H.frames(8);
    cards.push(await D((sd) => ({ title: (document.getElementById('sheetTitle') || {}).textContent || '', lead: ([...document.querySelectorAll('#sheetBody .lead')][0] || {}).textContent || '', big: [...window.TUMBLE.thumbCache.keys()].some((k) => k.startsWith(sd + '|') && k.endsWith('|192')) }), seeds[i]));
    if (i === 0 || i === 4) await H.shot(`gen2-card-${NEW[i]}-${W}.png`);
    await D(() => window.TUMBLE.ui.closeSheet());
    await settle(() => !document.getElementById('sheet').classList.contains('on'));
  }
  cards.forEach((c, i) => console.log(`  info  card ${NEW[i]}: "${c.title}" / ${c.lead}`));
  ok(cards.every((c) => c.title && !/undefined/.test(c.title + c.lead) && c.title.split(' ').length >= 3), 'every new family\'s card has a proper name and says its pattern');
  // the card paints its sock at 192 px, not the Drawer's 96 px thumbnail stretched (tweed went to blocks that way)
  ok(cards.every((c) => c.big), 'every card painted its sock at 192 px');

  // the Drawer's pattern row: the sixteen she has, and the Tweed chip, tapped for real
  await D(() => window.TUMBLE.screens.open('drawer'));
  ok(await settle(() => document.querySelectorAll('#dGrid .cell').length >= 16), 'the Drawer opens with sixteen socks, one of every pattern');
  const chips = await D(() => [...document.querySelectorAll('#dFam button')].map((b) => b.textContent.trim()));
  ok(chips.length === 17 && ['Herringbone', 'Basketweave', 'Windowpane', 'Pinstripe', 'Tweed', 'Lattice'].every((n) => chips.includes(n)), `the pattern row has every pattern she has, the six new ones with it (${chips.length - 1}: ${chips.slice(-6).join(', ')})`);
  await settle(sheetOpen);
  await H.frames(4);
  await H.shot(`gen2-drawer-${W}.png`);
  await D(() => { const el = document.querySelector('#dFam button[data-fam="tweed"]'); const b = el.getBoundingClientRect(), row = el.parentElement.getBoundingClientRect(); if (b.left < row.left || b.right > row.right) el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' }); });
  let r = null, hits = 0;
  for (let k = 0; k < 40 && hits < 2; k++) {
    await H.frames(2);
    r = await D(() => { const el = document.querySelector('#dFam button[data-fam="tweed"]'); const b = el.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2; const at = document.elementFromPoint(x, y); return { x, y, on: !!at && el.contains(at) }; });
    hits = r.on ? hits + 1 : 0;
  }
  if (hits >= 2) await H.page.touchscreen.tap(r.x, r.y);
  ok(hits >= 2 && await settle(() => { const el = document.querySelector('#dFam button[data-fam="tweed"]'); return !!el && el.getAttribute('aria-pressed') === 'true' && document.querySelectorAll('#dGrid .cell').length === 1; }, null, 60000), 'a real tap on Tweed leaves the one tweed sock');
  await H.frames(4);
  await H.shot(`gen2-drawer-tweed-${W}.png`);
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) {
  ok(false, 'version 2 shots crashed: ' + e.message);
}
await H.close();
console.log(fails.length ? `version 2 shots: ${fails.length} FAILED` : `version 2 shots: all taken at ${W}x${H2}`);
process.exitCode = fails.length ? 1 : 0;
