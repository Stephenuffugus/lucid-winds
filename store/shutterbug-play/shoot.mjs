/* SHUTTERBUG STORE RAWS for Astra's round 7 frames (3 Nov 2026). Six captures from the REAL game at 9:16: 405 x 720 CSS
   (a Pixel's width) at 32/15 = 864 x 1536, exactly the window of her frames, all from ONE room photo (his own room, or a
   CC0 fixture until he sends one). The studio music chip is hidden (the include seats it mid screen at 9:16, over the
   bugs; play already hides it); nothing else is touched:
     1 the photo turning into the room (the reveal held mid dissolve)   2 the bug in that room (keys, monsters)
     3 the album (that room among the fixture rooms)                    4 trophies and bugs
     5 the guardian at the end of a house of that room                  6 the Darkroom
   Run:  node store/shutterbug-play/shoot.mjs [--photo /path/to/room.jpg] [--reveal 550] [--only 25]  (--only retakes those
         shots; without shot 1 the room comes from raw-r7/room.txt, the code shot 1 wrote)
   then: node tools/store-kit/compose.mjs store/shutterbug-play/kit.json   (frames, headlines, the feature graphic) */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const ROOT = '/workspaces/lucid-winds', GAME = join(ROOT, 'satellites/shutterbug');
const { serve, launch, newPage, gotoGame, ready, tap } = await import(join(GAME, 'test/harness.mjs'));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const PHOTO = arg('photo', '/home/codespace/sb-drafts/realphotos/photos/r06.jpg'), REVEAL = +arg('reveal', 550);
const OUT = join(ROOT, 'store/shutterbug-play/raw-r7') + '/'; mkdirSync(OUT, { recursive: true });
const ONLY = String(arg('only', '123456')), want = n => ONLY.includes(String(n));
const REAL = JSON.parse(readFileSync(join(GAME, 'fixtures/real-photos.json'), 'utf8')).map(r => r.record);
/* a player some days in: four houses cleared (four looks won), the hints and the story seen */
const SAVE = { stats: { clears: 34, houseClears: 4, deaths: 9, bestClimbFrames: null, wallJumps: 140, keys: 41, flawless: 6, albumPages: 0, albumBiomes: 0 },
  onboarding: { firstRoomDone: true, revealSeen: true, storySeen: true, hints: { rocker: true, jump: true, dive: true, wall: true, specks: 3 } },
  cosmetics: { hero: 0, frame: 1, owned: ['frame.walnut', 'hero.umber', 'hero.teal', 'hero.lapis'] } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const srv = await serve(), browser = await launch(), errors = [];
const fresh = async (save, opts = {}) => {
  const b = await newPage(browser, { width: 405, height: 720, dpr: 32 / 15 });
  await gotoGame(b.page, srv.base); await ready(b.page, opts);
  await b.page.evaluate(sv => { const d = Object.assign(window.SB.record.saveDefaults(), sv); localStorage.setItem('shutterbug.v1', JSON.stringify(d)); }, Object.assign({}, SAVE, save || {}));
  await b.page.reload(); await ready(b.page, opts); await clean(b.page);
  return b;
};
const clean = page => page.addStyleTag({ content: '#sws-music-card,#sws-music-pill,#sws-music-toast,#sws-music-chip{display:none!important}' });
const scrollTap = async (page, sel) => { await page.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); return tap(page, sel); };
const snap = async (b, name) => { await sleep(300); await b.page.screenshot({ path: OUT + name + '.png' }); console.log('  ' + name); };
const done = async (b) => { errors.push(...b.errors); await b.page.close(); };
let code = !want(1) && existsSync(OUT + 'room.txt') ? readFileSync(OUT + 'room.txt', 'utf8').trim() : null;
try {
  /* 1 the photo turning into the room: Choose a photo, Develop, the reveal held at REVEAL ms (hold 300, resolve 800) */
  if (want(1) || !code) { const b = await fresh(null, { reveal: true });
    const d0 = await b.page.evaluate(() => window.SB_DEV.overlay().decodes);
    await (await b.page.$('#filechoose')).uploadFile(PHOTO);
    await b.page.waitForFunction(d => window.SB_DEV.screen() === 'crop' && window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 15000 }, d0);
    await sleep(400); await tap(b.page, '#develop');
    await b.page.waitForFunction(() => window.SB_DEV.screen() === 'reveal', { timeout: 15000 });
    await b.page.evaluate(ms => { window.SB_DEV.hold(true); window.SB_DEV.revealAt(ms); }, REVEAL);
    await snap(b, '1-reveal');
    await b.page.evaluate(() => window.SB_DEV.hold(false));
    await b.page.waitForFunction(() => window.SB_DEV.screen() === 'play', { timeout: 15000 });
    code = await b.page.evaluate(() => window.SB_DEV.level().code); writeFileSync(OUT + 'room.txt', code + '\n');
    await done(b); }
  /* 2 the bug in that room, its keys and monsters on (flags 3), the first key taken */
  if (want(2)) { const b = await fresh(); await b.page.evaluate(() => window.SB_DEV.hold(true));
    await b.page.evaluate(c => { const R = window.SB.record, j = R.toJSON(R.decode(c)); j.v = 2; j.biome = j.biome | 0; j.rules = j.rules | 0; j.flags = 3;
      return window.SB.ui.startRoom(R.fromJSON(j), window.SB.ui.COPY.photoRoom, {}); }, code);   /* 'Your room', as Develop names it */
    await sleep(1300);
    await b.page.evaluate(() => { const D = window.SB_DEV; D.immortal(true); D.arm('J6'); D.goto('key'); D.step(2); D.step(200); });
    await snap(b, '2-climb'); await done(b); }
  /* 3 the album: his room and the nine fixture rooms */
  if (want(3)) { const b = await fresh();
    await b.page.evaluate((c, real) => {
      const R = window.SB.record, S = window.SB.save, mine = R.decode(c);
      S.addPrint(mine, Math.max(0, (R.toJSON(mine).biome || 1) - 1), true);
      real.forEach((j, i) => S.addPrint(R.fromJSON(j), Math.max(0, (j.biome || 1) - 1), i % 2 === 0));
      window.SB.ui.trophyCheck(); S.commit(); S.flush && S.flush();
    }, code, REAL);
    await b.page.reload(); await ready(b.page); await clean(b.page);
    await b.page.evaluate(() => document.getElementById('albumbtn').click()); await snap(b, '3-album'); await done(b); }
  /* 4 trophies and bugs: a player some weeks in (six houses, so six looks won), scrolled to the bugs and the next prize */
  if (want(4)) { const b = await fresh({ stats: { clears: 64, houseClears: 6, deaths: 21, bestClimbFrames: null, wallJumps: 300, keys: 120, flawless: 12, albumPages: 1, albumBiomes: 1 },
      cosmetics: { hero: 0, frame: 1, owned: ['frame.walnut', 'hero.umber', 'hero.teal', 'hero.lapis', 'hero.pinstripe', 'hero.domino'] } });
    await b.page.evaluate(() => { window.SB.ui.trophyCheck(); window.SB.save.commit(); document.getElementById('trophiesbtn').click(); });
    await sleep(300); await b.page.evaluate(() => document.getElementById('trnext').scrollIntoView({ block: 'end' }));
    await snap(b, '4-trophies'); await done(b); }
  /* 5 the guardian: a house of five of that room, at its last (the 2 Nov recipe; Frost, whose guardian throws icicles) */
  if (want(5)) { const b = await fresh({ run: null });
    const why = await b.page.evaluate(c => {   /* through the game's own save: a raw localStorage write is lost to its flush on unload */
      const R = window.SB.record, S = window.SB.save, j = R.toJSON(R.decode(c)); j.v = 2; j.biome = 2; j.rules = 0; j.flags = 0;   /* biome, rules and flags only in v2 */
      let e = ''; try { R.fromJSON(j); } catch (x) { e = x.message; } if (e) return e;
      const run = R.runValid({ v: 1, rooms: Array.from({ length: 5 }, () => j), at: 4, hero: { vigor: 0, focus: 0, grit: 0, scrolls: 0, hearts: 4, heartsMax: 4, slots: [1, 9, 0] }, entry: [0, 0, 0], dp: 0, last: 0, lost: 0 });
      if (!run) return 'runValid refused';
      S.doc.run = run; S.commit(); S.flush && S.flush(); return '';
    }, code);
    if (why) throw new Error('the house run did not validate: ' + why);
    await b.page.reload(); await ready(b.page); await b.page.evaluate(() => window.SB_DEV.hold(true));
    if (!(await b.page.evaluate(() => !!window.SB.save.doc.run))) throw new Error('the house run did not validate');
    await scrollTap(b.page, '#housego'); await scrollTap(b.page, '#doorenter'); await sleep(900);
    await b.page.evaluate(() => { const D = window.SB_DEV; D.immortal(true); for (let k = 0; k < 900; k++) { D.step(1); if (D.state().proj.some(p => p.live && p.kind === 17)) break; } D.step(16); });
    await snap(b, '5-guardian'); await done(b); }
  /* 6 the Darkroom: prints to develop, a collection */
  if (want(6)) { const b = await fresh({ dp: 420, prints: ['J4', 'D3', 'C1'], collection: ['J6', 'D6', 'C2'] });
    await b.page.evaluate(() => window.SB.ui.show('darkroom')); await snap(b, '6-darkroom'); await done(b); }
  console.log(errors.length ? 'PAGE ERRORS: ' + errors.join(' ; ') : 'raws done, no page errors');
} finally { await browser.close(); srv.close && srv.close(); }
