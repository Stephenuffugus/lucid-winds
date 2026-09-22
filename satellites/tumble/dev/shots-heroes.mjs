// THE HERO PACKS IN THE GAME (DESIGN-T2 4.1): the new socks where she meets them, in a real Load on the table and
// in the Drawer, at a phone's size. The sheets (tools/hero-sheet.mjs, tools/hero-compare.mjs) show a sock alone;
// this shows it in a heap of forty others. It prints where each hero landed on the screen so the picture can be
// cropped to them and looked at closely.
//   node dev/shots-heroes.mjs [w h]      (412 915 by default)
import { harness } from '../tools/harness.mjs';

const W = Number(process.argv[2] || 412);
const H2 = Number(process.argv[3] || 915);
const NEW = ['pet-hair-fiber', 'office-kitchen-evidence', 'cottage-chore-club', 'found-1998', 'local-creature-report', 'plant-parents'];
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const H = await harness({ w: W, h: H2, port: 8796, dpr: 1 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const settle = (fn, arg, ms = 240000) => H.page.waitForFunction(fn, { timeout: ms, polling: 400 }, arg).then(() => true, () => false);

try {
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  await H.open('?nosw&turbo=1&unlockall=1&skipdump=1&load=laundry&size=heavy&tier=3&seed=heroes-a', 'play', 300000);
  // every hero that belongs to a SHOP pack (the three impossible socks are earned, never spawned: 103 minus 3)
  const owned = await D(() => { const app = window.TUMBLE; const inShop = new Set(app.data.unlocks.items.filter((i) => i.cat === 'pack').map((i) => i.look.pack)); return { owned: app.ownedHeroDefs().length, shop: app.data.heroes.filter((h) => inShop.has(h.pack)).length }; });
  ok(owned.shop >= 100 && owned.owned === owned.shop, `every pack is owned, so every pack hero can turn up (${owned.owned} of ${owned.shop})`);
  // 4.2 IN THE RUNNING GAME, not just the generator: a pack bought this Load gets the first hero place, and a Heavy
  // Load holds three heroes, no more. The app passes the first call through Game.start's own list of options, and
  // an option that list does not name is silently dropped, so only the page can say the wiring is real.
  const fc = [];
  for (const seed of ['first-call-a', 'first-call-b', 'first-call-c']) {
    await D((seed) => { const app = window.TUMBLE; app.save.packBought = { 'found-1998': app.save.stats.loads }; app.game.abandonLoad(); app.start({ mode: 'laundry', size: 'heavy', tier: 3, seed }); }, seed);
    await settle(() => window.TUMBLE_DEV && window.TUMBLE_DEV.state === 'play');
    fc.push(await D(() => { const app = window.TUMBLE; const hs = app.game.load.pairs.filter((p) => p.hero).map((p) => app.heroById(p.hero)); return { n: hs.length, first: hs[0] && hs[0].pack, recent: app.game.loadOpts.recentPacks }; }));
  }
  ok(fc.every((r) => r.first === 'found-1998'), `the running game gives a pack bought this Load the first hero place (${fc.map((r) => r.first).join(', ')})`);
  ok(fc.every((r) => r.n === 3), `and a Heavy Load holds three heroes, one in ten (${fc.map((r) => r.n).join(', ')})`);
  await D(() => { window.TUMBLE.save.packBought = {}; });
  // a Load holds about one hero pair in ten; try seeds until one holds at least two from the six new packs
  let got = null;
  for (let k = 0; k < 8 && !got; k++) {
    if (k) {
      await D((seed) => { const app = window.TUMBLE; app.game.abandonLoad(); app.start({ mode: 'laundry', size: 'heavy', tier: 3, seed }); }, 'heroes-' + String.fromCharCode(98 + k));
      await settle(() => window.TUMBLE_DEV && window.TUMBLE_DEV.state === 'play');
    }
    const heroes = await D((NEW) => {
      const app = window.TUMBLE, S = app.game.session, out = [];
      for (const s of S.socks.values()) {
        const h = s.hero ? app.heroById(s.hero) : null;
        if (h && NEW.includes(h.pack) && !out.some((o) => o.name === h.name)) out.push({ name: h.name, pack: h.pack, id: s.id });
      }
      return out;
    }, NEW);
    if (heroes.length >= 2) got = heroes;
  }
  ok(!!got, `a Heavy Load with at least two of the new packs' socks in it${got ? ': ' + got.map((h) => h.name).join(', ') : ''}`);
  await D(() => { const s = window.TUMBLE.save; for (const k of ['firstTapHint', 'mismatchHint', 'missHint', 'fogHint']) s.seen[k] = true; window.TUMBLE.ui.hideHint(); });
  await H.frames(6);
  // where each of them is on the screen, for cropping (a sock under the pile has no point: it says so)
  const where = await D((ids) => {
    const g = window.TUMBLE.game;
    return ids.map((id) => { const p = g.physics.pose(id); if (!p) return null; const q = g.render.project(p); return { id, x: Math.round(q.x), y: Math.round(q.y) }; });
  }, (got || []).map((h) => h.id));
  (got || []).forEach((h, i) => console.log(`  info  ${h.name} (${h.pack}) at ${where[i] ? where[i].x + ',' + where[i].y : 'no pose'}`));
  await H.shot(`heroes-table-${W}.png`);
  // the Drawer, with every hero in it
  await D(() => { const app = window.TUMBLE; app.game.abandonLoad(); app.showRoom(); });
  await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room');
  await D(() => window.TUMBLE.screens.open('drawer'));
  ok(await settle(() => document.querySelectorAll('#dGrid .cell').length > 6), 'the Drawer opens with socks in it');
  const heroChip = await D(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Heroes/.test(x.textContent.trim())); return b ? b.textContent.trim() : null; });
  ok(!!heroChip && /103/.test(heroChip), `the Drawer counts every hero (${heroChip})`);
  await H.frames(4);
  await H.shot(`heroes-drawer-${W}.png`);
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) {
  ok(false, 'hero shots crashed: ' + e.message);
}
await H.close();
console.log(fails.length ? `hero shots: ${fails.length} FAILED` : `hero shots: all taken at ${W}x${H2}`);
process.exitCode = fails.length ? 1 : 0;
