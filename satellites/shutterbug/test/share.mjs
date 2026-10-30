/* Browser gate `share` (BUILD-PLAN.md T1.8): in the sample room a REAL tap on Share opens the sheet: its preview canvas
 * is 192x384 and painted (more than one colour), the three sentences stand verbatim, and its link (read from the sheet's
 * input) is the page's own origin + pathname + '#' + a 779 character code. The link opened in a new page shows the Tap
 * to develop card with the hash already cleared; a REAL tap on it develops the same level (the same hash). A garbage
 * code in the hash shows the refusal on the title. The sample room and three synthetic fixtures round trip in the page
 * through encode, the link and the parser to the same grid and the same level hash.
 *
 * Watched red by SHARE_DROPS_FOCAL and PREFIX_CHECK_DROPPED through H-share-1 and H-share-2 (Node), and by this gate's
 * own checks. */
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
  R.say(errors.length === 0 && c.errors.length === 0, 'zero page errors' + (errors.length + c.errors.length ? ' (' + errors.concat(c.errors).join(' ; ') + ')' : ''));
} finally { await browser.close(); await srv.close(); }
R.finish();
