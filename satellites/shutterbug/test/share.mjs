/* Browser gate `share` (BUILD-PLAN.md T1.8): in the sample room a REAL tap on Share opens the sheet: its preview canvas
 * is 192x384 and painted (more than one colour), the three sentences stand verbatim, and its link (read from the sheet's
 * input) is the page's own origin + pathname + '#' + a 779 character code. The link opened in a new page shows the Tap
 * to develop card with the hash already cleared; a REAL tap on it develops the same level (the same hash). A garbage
 * code in the hash shows the refusal on the title. The sample room and three synthetic fixtures round trip in the page
 * through encode, the link and the parser to the same grid and the same level hash.
 *
 * The QR drawer (T1.9b): closed until its toggle is tapped, Copy link above it; open, the sheet's own link as a version
 * 20 symbol (97 modules, H-qr-3's) on a 105 pixel canvas, a 4 module quiet zone of Paper, every module the encoder's,
 * 3 CSS px a module at 412 and at 360 wide and on screen; a Double Exposure room gets `Long code, the link is easier.`
 * instead of a symbol.
 *
 * Q32 in a profile of its own (the M1 review): a link to a room whose first room build differs (trap-pattern) opens
 * in a fresh profile to the sharer's level with the first room not spent; the death card's Again and the clear card's
 * Play it again keep it a link and unspent; the player's own first room comes after. The Level code field: a typed code
 * and a real tap on Play open the card and the same level; garbage says so on the title.
 *
 * Watched red by SHARE_DROPS_FOCAL and PREFIX_CHECK_DROPPED through H-share-1 and H-share-2 (Node), QUIET_ZONE_0,
 * LINK_TAKES_FIRST_ROOM, AGAIN_FORGETS_LINK, PLAY_AGAIN_FORGETS_LINK and by this gate's own checks. */
import { serve, launch, newPage, gotoGame, ready, reporter, tap, GAME, GAME_PATH } from './harness.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const R = reporter('SHARE');
const srv = await serve();
const browser = await launch();
const SENT = ['This shares an abstracted 16 color version of your photo, not the photo.', 'Works offline once installed.', 'A phone that has opened Shutterbug once can open this link offline. A new phone needs one online load.'];
try {
  const { page, errors } = await newPage(browser, { width: 412, height: 915 });
  await gotoGame(page, srv.base); await ready(page);
  await page.evaluate(() => window.SB_DEV.hold(true));
  await tap(page, '#sample');
  const hashA = await page.evaluate(() => window.SB_DEV.level().hash);
  await tap(page, '#share');
  const sheet = await page.evaluate(() => {
    const cv = document.getElementById('sharecanvas'), d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, colours = new Set();
    for (let i = 0; i < d.length; i += 4 * 97) colours.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]);
    return { on: document.getElementById('sharesheet').classList.contains('on'), w: cv.width, h: cv.height, colours: colours.size, text: document.getElementById('sharesheet').innerText,
      link: document.getElementById('sharelink').value, own: location.origin + location.pathname, screen: window.SB_DEV.screen() };
  });
  const code = sheet.link.slice(sheet.link.lastIndexOf('#') + 1);
  R.say(sheet.on && sheet.w === 192 && sheet.h === 384 && sheet.colours > 1, 'a real tap on Share opens the sheet; its preview is 192x384 and painted (' + sheet.colours + ' colours sampled)');
  R.say(SENT.every(x => sheet.text.includes(x)), 'the three sentences stand verbatim');
  R.say(code.length === 779 && sheet.link === sheet.own + '#' + code, 'the link is the page\'s own origin + pathname + # + a ' + code.length + ' character code');
  R.say(sheet.screen === 'share', 'the sheet holds the room (the screen is share)');

  /* the link in a new page: the card, the hash cleared, the same level after a real tap */
  const b = await newPage(browser, { width: 412, height: 915 });
  await b.page.goto(sheet.link); await ready(b.page);
  const card = await b.page.evaluate(() => ({ on: document.getElementById('devcard').classList.contains('on'), hash: location.hash }));
  R.say(card.on && card.hash === '', 'the link opens on the Tap to develop card with the hash already cleared (' + JSON.stringify(card.hash) + ')');
  await tap(b.page, '#devtap');
  let hashB = null; for (let k = 0; k < 30 && !hashB; k++) { await new Promise(r => setTimeout(r, 100)); hashB = await b.page.evaluate(() => { const l = window.SB_DEV.level(); return l ? l.hash : null; }); }
  R.say(hashB === hashA, 'a real tap develops the same level (' + hashB + ', the first page ' + hashA + ')');
  R.say(b.errors.length === 0, 'the opened page has zero page errors' + (b.errors.length ? ' (' + b.errors.join(' ; ') + ')' : ''));

  /* Q32 in a profile of its own (the M1 review: the check above shares page A's save, past its first room, and the
     sample room builds the same either way). The sharer, past its first room, shares trap-pattern, whose first room
     build differs from its later build. A fresh profile opens the link: the same level, and the first room not spent;
     dies and taps Again, clears and taps Play it again: still a link, still not spent. Its own first room comes after. */
  const tp = JSON.parse(readFileSync(join(GAME, 'fixtures', 'synthetic', 'trap-pattern.json'), 'utf8')).record;
  const sh = await newPage(browser, { width: 412, height: 915 });   /* page A's profile, past its first room */
  await gotoGame(sh.page, srv.base); await ready(sh.page);
  await sh.page.evaluate(() => window.SB_DEV.hold(true));
  const shared = await sh.page.evaluate(j => { window.SB_DEV.loadRecord(JSON.stringify(j)); const SB = window.SB;
    const first = SB.pipeline.levelHash(SB.pipeline.build(SB.game.record, { firstRoom: true }));
    return { hash: window.SB_DEV.level().hash, first, link: SB.record.linkOf(location.origin, location.pathname, SB.game.record), code: SB.record.encode(SB.game.record) }; }, tp);
  await sh.page.close();
  const fc = await browser.createBrowserContext();
  const f = await newPage(fc, { width: 412, height: 915 });
  await f.page.goto(shared.link); await ready(f.page);
  await f.page.evaluate(() => window.SB_DEV.hold(true));
  await tap(f.page, '#devtap');
  const fl = () => f.page.evaluate(() => ({ hash: window.SB_DEV.level() ? window.SB_DEV.level().hash : null, screen: window.SB_DEV.screen(), mode: window.SB.game.mode,
    spent: !!window.SB.save.doc.onboarding.firstRoomDone, ui: window.SB.ui.firstRoomDone }));
  let fs = await fl();
  R.say(shared.first !== shared.hash && fs.hash === shared.hash && fs.mode === 'code' && !fs.spent && !fs.ui,
    'a fresh profile opens the link to the sharer\'s level (' + fs.hash + ', the sharer ' + shared.hash + ', a first room build ' + shared.first + ') and its first room is not spent');
  /* the room ended by hand (no fixture's moths reach an idle bug): the state marked dead, the next step shows the card */
  await f.page.evaluate(() => { window.SB.game.state.room.dead = 1; window.SB_DEV.step(1); });
  await tap(f.page, '#deathagain');
  fs = await fl();
  R.say(fs.screen === 'play' && fs.hash === shared.hash && fs.mode === 'code' && !fs.spent && !fs.ui, 'its death card\'s Again keeps it a link (mode ' + fs.mode + ') and the first room unspent (' + fs.spent + ')');
  await f.page.evaluate(() => { window.SB_DEV.goto('exit'); window.SB_DEV.step(2); });
  await tap(f.page, '#again');
  fs = await fl();
  R.say(fs.screen === 'play' && fs.hash === shared.hash && fs.mode === 'code' && !fs.spent && !fs.ui, 'its clear card\'s Play it again keeps it a link (mode ' + fs.mode + ') and the first room unspent (' + fs.spent + ')');
  await tap(f.page, '#back');
  await tap(f.page, '#sample');
  fs = await fl();
  R.say(fs.spent && fs.ui && fs.mode === 'free', 'the player\'s own first room comes after and spends it (' + fs.spent + ')');
  /* the Level code field, a returning player's: a pasted code opens on the card, garbage says so */
  await tap(f.page, '#back');
  await f.page.evaluate(code => { document.getElementById('levelcode').value = code; }, shared.code);
  await tap(f.page, '#playcode');
  const fcard = await f.page.evaluate(() => document.getElementById('devcard').classList.contains('on'));
  await tap(f.page, '#devtap');
  fs = await fl();
  R.say(fcard && fs.hash === shared.hash && fs.mode === 'code', 'a code typed in the Level code field and a real tap on Play open the card, then the same level (' + fs.hash + ')');
  await tap(f.page, '#back');
  await f.page.evaluate(() => { document.getElementById('levelcode').value = 'v1.not-a-room'; });
  await tap(f.page, '#playcode');
  const fbad = await f.page.evaluate(() => ({ shown: !document.getElementById('codemsg').hidden, text: document.getElementById('codemsg').textContent, card: document.getElementById('devcard').classList.contains('on') }));
  R.say(fbad.shown && fbad.text === 'That code did not open. Check it and try again.' && !fbad.card, 'garbage in the field says so on the title (' + fbad.text + ')');
  R.say(f.errors.length === 0, 'the fresh profile has zero page errors' + (f.errors.length ? ' (' + f.errors.join(' ; ') + ')' : ''));
  await fc.close();

  /* a garbage code */
  const c = await newPage(browser, { width: 360, height: 780 });
  await c.page.goto(srv.base + GAME_PATH + '#v1.this-is-not-a-room'); await ready(c.page);
  const refusal = await c.page.evaluate(() => ({ shown: !document.getElementById('codemsg').hidden, text: document.getElementById('codemsg').textContent, card: document.getElementById('devcard').classList.contains('on'), screen: window.SB_DEV.screen() }));
  R.say(refusal.shown && refusal.text === 'That code did not open. Check it and try again.' && !refusal.card && refusal.screen === 'title', 'a garbage code shows the refusal on the title (' + refusal.text + ')');

  /* the round trips in the page */
  const recs = [JSON.parse(readFileSync(join(GAME, 'fixtures', 'sample-room.json'), 'utf8')).record].concat(['saturated-blobs', 'shelves-a', 'trap-pattern'].map(n => JSON.parse(readFileSync(join(GAME, 'fixtures', 'synthetic', n + '.json'), 'utf8')).record));
  const trips = await page.evaluate(list => list.map(j => {
    const SB = window.SB, rec = SB.record.fromJSON(j), back = SB.record.parseCode(SB.record.linkOf(location.origin, location.pathname, rec)).rec;
    if (!back) return 'does not open';
    const a = SB.pipeline.build(rec, {}), b2 = SB.pipeline.build(back, {});
    return Array.from(back.pal).join() === Array.from(rec.pal).join() && SB.pipeline.levelHash(a) === SB.pipeline.levelHash(b2) ? 'same' : 'differs';
  }), recs);
  R.say(trips.every(x => x === 'same'), 'the sample room and three fixtures round trip through their links in the page (' + trips.join(', ') + ')');

  /* the QR drawer (T1.9b) on the first page's open sheet (brought to the front: a touch to a tab behind the two
     pages opened since never gets its acknowledgement) */
  await page.bringToFront();
  /* Android has the phone's own share sheet (navigator.share), so its button shows there: stubbed here, the sheet
     reopened, so the layout is the phone's */
  await tap(page, '#shareclose');
  await page.evaluate(() => { Object.defineProperty(navigator, 'share', { value: () => Promise.resolve(), configurable: true }); Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true }); });
  await tap(page, '#share');
  const qr0 = await page.evaluate(() => ({ hidden: document.getElementById('qrdrawer').hidden, toggle: document.getElementById('qrtoggle').textContent,
    above: document.getElementById('copylink').getBoundingClientRect().top < document.getElementById('qrtoggle').getBoundingClientRect().top }));
  R.say(qr0.hidden && qr0.toggle === 'Show QR code' && qr0.above, 'the QR drawer stays closed until asked for, and Copy link sits above its toggle');
  const inSight = await page.evaluate(() => { const sh = document.getElementById('sharesheet').getBoundingClientRect();
    return ['shareclose', 'copylink', 'sharenative', 'copycode', 'qrtoggle'].filter(id => { const el = document.getElementById(id), r = el.getBoundingClientRect(); return el.hidden || !(r.top >= sh.top && r.bottom <= sh.bottom); }); });
  R.say(inSight.length === 0, 'at 412x915 Close, Copy link, the phone\'s Share, Copy code and the QR toggle are all in sight without a scroll' + (inSight.length ? ' (out of sight: ' + inSight.join(', ') + ')' : ''));
  await tap(page, '#qrtoggle');
  const qr = await page.evaluate(() => {
    const cv = document.getElementById('qrcanvas'), n = cv.width, d = cv.getContext('2d').getImageData(0, 0, n, n).data, link = document.getElementById('sharelink').value;
    const sym = window.SB.qr.encode(link), q = +cv.dataset.quiet, P = window.SB.palette, paper = P.RGB[P.I.PAPER].join(), ink = P.RGB[P.I.INK].join();
    const at = (x, y) => { const o = (y * n + x) * 4; return [d[o], d[o + 1], d[o + 2]].join(); };
    let quietBad = 0, modBad = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (x < q || y < q || x >= n - q || y >= n - q) { if (at(x, y) !== paper) quietBad++; }
      else if (at(x, y) !== (sym.modules[(y - q) * sym.size + (x - q)] ? ink : paper)) modBad++;
    }
    const r = cv.getBoundingClientRect();
    return { open: !document.getElementById('qrdrawer').hidden, toggle: document.getElementById('qrtoggle').textContent, n, q, modules: +cv.dataset.modules, px: +cv.dataset.px,
      size: sym.size, quietBad, modBad, w: r.width, onScreen: r.left >= 0 && r.right <= innerWidth };
  });
  R.say(qr.open && qr.toggle === 'Hide QR code' && qr.modules === 97 && qr.size === 97 && qr.n === 105, 'a real tap opens the drawer: the link is a version 20 symbol of 97 modules (H-qr-3\'s) on a ' + qr.n + ' pixel canvas');
  R.say(qr.q === 4 && qr.quietBad === 0, 'its quiet zone is 4 modules of Paper on every side (' + qr.quietBad + ' pixels otherwise, quiet ' + qr.q + ')');
  R.say(qr.modBad === 0, 'every module drawn is the encoder\'s, Ink or Paper (' + qr.modBad + ' differ)');
  R.say(qr.px === 3 && Math.abs(qr.w - 315) < 0.5 && qr.onScreen, 'at 412 wide: 3 CSS px a module, ' + qr.w + ' px across, on screen');
  const dx = await newPage(browser, { width: 360, height: 780 });
  await gotoGame(dx.page, srv.base); await ready(dx.page);
  await dx.page.evaluate(() => window.SB_DEV.hold(true));
  await tap(dx.page, '#sample'); await tap(dx.page, '#share');
  /* at 360x780 the toggle is below the sheet's fold: the player's scroll of the sheet first */
  await dx.page.evaluate(() => document.getElementById('qrtoggle').scrollIntoView({ block: 'center' }));
  await tap(dx.page, '#qrtoggle');
  const q360 = await dx.page.evaluate(() => { const r = document.getElementById('qrcanvas').getBoundingClientRect(); return { px: +document.getElementById('qrcanvas').dataset.px, l: r.left, r: r.right }; });
  R.say(q360.px === 3 && q360.l >= 0 && q360.r <= 360, 'at 360 wide: 3 CSS px a module, the symbol on screen (' + q360.l.toFixed(0) + ' to ' + q360.r.toFixed(0) + ')');
  await tap(dx.page, '#shareclose'); await tap(dx.page, '#back');
  const sj = JSON.parse(readFileSync(join(GAME, 'fixtures', 'sample-room.json'), 'utf8')).record;
  const deScreen = await dx.page.evaluate(j => { window.SB_DEV.loadRecord(JSON.stringify(Object.assign({}, j, { mode: 2, rows2: j.rows }))); return window.SB_DEV.screen(); }, sj);
  await tap(dx.page, '#share');
  const de = await dx.page.evaluate(() => ({ toggle: document.getElementById('qrtoggle').hidden, long: !document.getElementById('qrlong').hidden, text: document.getElementById('qrlong').textContent, len: document.getElementById('sharelink').value.length }));
  R.say(deScreen === 'play' && de.toggle && de.long && de.text === 'Long code, the link is easier.', 'a Double Exposure room\'s ' + de.len + ' character link gets the sentence instead of a symbol');
  R.say(dx.errors.length === 0, 'the 360 wide page has zero page errors' + (dx.errors.length ? ' (' + dx.errors.join(' ; ') + ')' : ''));
  R.say(errors.length === 0 && c.errors.length === 0, 'zero page errors' + (errors.length + c.errors.length ? ' (' + errors.concat(c.errors).join(' ; ') + ')' : ''));
} finally { await browser.close(); await srv.close(); }
R.finish();
