/* Browser gate `house` (BUILD-PLAN.md T2.8, QUESTIONS Q200; Stephen's rulings of 31 Oct, Q96 "House run + boss" and
 * Q97 "Firm ramp"): a five room house played by REAL taps, every climb skipped with SB_DEV.goto('exit') (the gates'
 * named camera liberty) and every step through SB_DEV.step (the loop held), so this is the one gate that drives the run
 * through the real input (T2.8's header rule).
 *   - a fresh title shows its two buttons only (DESIGN 5.3); after a first free play clear Start a house leads it;
 *   - Start a house opens the house's card; Use a recent room plays a room: the strip reads Room 1 of 5 and the save's
 *     run holds the room before a step; its clear shows the doorway (Room 1 cleared, Banked n dead pixels at x1 with
 *     the wallet up by exactly the room's count, Room 2 is tougher; Shoot the next room, Choose a photo, Use a recent
 *     room, Leave the house), every control 48 px or more;
 *   - room 2 from Choose a photo (the file chooser by a real tap, the crop, Develop): Room 2 of 5, its floor of 2
 *     enemies; a moth's hit, then the clear: the run carries the hearts with one back;
 *   - a reload resumes at room 2's doorway from Continue the house with the bug intact; room 3 starts with the
 *     carried hearts and an elite; standing still there the bug dies: The house is lost, Lost n dead pixels, Retry
 *     House, New house, Title, and the run saved as lost;
 *   - Retry House replays room 1 (the same grid) with a fresh bug, the same three rooms kept; the doorway offers
 *     Play room 2 (the same grid again); Leave the house goes to the title with Continue the house, which resumes
 *     after a reload; rooms 3, 4 and 5 (the strip: The last room) end on House cleared (5 rooms, n dead pixels, New
 *     house, Title), the run gone, Houses cleared 1 on the title.
 * At 320x568 the doorway card's controls are each 48 px or more and reachable.
 *
 * Watched red by LOSE_ROOM_2_ON_RELOAD and RETRY_NEW_GRIDS (T2.8's names), HOUSE_ON_FIRST_SCREEN, STRIP_NAME_PLAIN,
 * DOOR_NEXT_WRONG, DP_HALF_IN_HOUSE, CARRY_DROPPED, DEATH_CARD_FREE, CONTINUE_HIDDEN, HOUSE_CLEAR_UNCOUNTED and
 * DOOR_BUTTON_40PX. */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { serve, launch, newPage, gotoGame, ready, reporter, tap, GAME } from './harness.mjs';

const R = reporter('HOUSE');
const ROOM = JSON.parse(readFileSync(join(GAME, 'fixtures', 'sample-room.json'), 'utf8')).record.rows;
const TMP = '/tmp/claude-1000/shutterbug-house'; mkdirSync(TMP, { recursive: true });
const PHOTO = join(TMP, 'room-900x1600.png');
const srv = await serve();
const browser = await launch();

/* the page's state, read */
const look = page => page.evaluate(() => {
  const $ = id => document.getElementById(id), vis = id => { const el = $(id); return !!el && !el.hidden && el.getBoundingClientRect().height > 0; };
  const st = window.SB_DEV.state(), doc = window.SB.save.doc;
  return { screen: window.SB_DEV.screen(), name: $('roomname').textContent, head: $('doorhead').textContent, bank: vis('doorbank') ? $('doorbank').textContent : null,
    next: vis('doornext') ? $('doornext').textContent : null, enter: vis('doorenter') ? $('doorenter').textContent : null,
    shown: ['doorenter', 'doorshoot', 'doorchoose', 'doorrecent', 'doorleave', 'doornew', 'doortitle'].filter(vis),
    shoot: $('doorshoot').textContent, run: doc.run ? JSON.parse(JSON.stringify(doc.run)) : null, stored: JSON.parse(localStorage.getItem('shutterbug.v1') || 'null'),
    dp: doc.dp, clears: doc.stats.clears, houseClears: doc.stats.houseClears,
    hero: st ? { hearts: st.hero.hearts, heartsMax: st.hero.heartsMax, slots: st.hero.slots } : null, roomDp: st ? st.room.dp : 0,
    codes: doc.run ? doc.run.rooms.map(j => window.SB.record.encode(window.SB.record.fromJSON(j))) : [],
    enemies: st ? st.enemies.length : 0, elites: st ? st.enemies.filter(e => e.elite).length : 0, code: window.SB_DEV.level() ? window.SB_DEV.level().code : null };
});
/* every visible control on the screen showing, measured: the ids under 48 px */
const small = page => page.evaluate(() => [...document.querySelectorAll('.screen.on button, #death.on button')].filter(el => !el.hidden && el.getBoundingClientRect().height > 0)
  .filter(el => el.getBoundingClientRect().height < 48 || el.getBoundingClientRect().width < 48).map(el => (el.id || el.getAttribute('aria-label')) + ' ' + el.getBoundingClientRect().height.toFixed(0)));
const scrollTap = async (page, sel) => { await page.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); return tap(page, sel); };
const playing = page => page.waitForFunction(() => window.SB_DEV.screen() === 'play', { timeout: 10000 }).catch(() => {});
/* a recent room from the doorway, by real taps: Use a recent room, then the first thumbnail */
async function fromRecent(page) {
  await scrollTap(page, '#doorrecent');
  await scrollTap(page, '#doorrecentlist button');
  await playing(page);
}
/* the climb skipped: the bug set down in the exit, two steps (the clear, then the doorway) */
const climb = page => page.evaluate(() => { window.SB_DEV.goto('exit'); window.SB_DEV.step(2); });
/* a speck taken first, so the room's count is more than 0 */
const speck = page => page.evaluate(() => { window.SB_DEV.goto('speck'); window.SB_DEV.step(2); return window.SB_DEV.state().room.dp; });

try {
  /* the photo for Choose a photo: the sample room painted over the default crop (capture's way) */
  {
    const { page } = await newPage(browser, { width: 900, height: 1600, dpr: 1 });
    await page.setContent('<html><body style="margin:0"><canvas id="c" width="900" height="1600"></canvas></body></html>');
    const HEX = await (async () => { const p = await newPage(browser); await gotoGame(p.page, srv.base); await ready(p.page); const h = await p.page.evaluate(() => Array.from(window.SB.palette.HEX)); await p.page.close(); return h; })();
    await page.evaluate((rows, hex) => {
      const c = document.getElementById('c').getContext('2d'), cw = 800 / 24, ch = 1600 / 48;
      c.fillStyle = '#' + hex[4]; c.fillRect(0, 0, 900, 1600);
      rows.forEach((r, y) => [...r].forEach((d, x) => { c.fillStyle = '#' + hex[parseInt(d, 16)]; c.fillRect(Math.round(50 + x * cw), Math.round(y * ch), Math.ceil(cw), Math.ceil(ch)); }));
    }, ROOM, HEX);
    await (await page.$('#c')).screenshot({ path: PHOTO });
    await page.close();
  }

  const { page, errors } = await newPage(browser, { width: 412, height: 915 });
  await gotoGame(page, srv.base); await ready(page);
  await page.evaluate(() => localStorage.clear()); await page.reload(); await ready(page);
  await page.evaluate(() => window.SB_DEV.hold(true));
  const fresh = await page.evaluate(() => ({ house: !document.getElementById('house').hidden, shoot: !document.getElementById('shoot').hidden }));
  R.say(!fresh.house && fresh.shoot, 'a fresh title shows its two buttons and no house (DESIGN 5.3; house shown ' + fresh.house + ')');

  /* a first free play room cleared: the title then leads with Start a house */
  await tap(page, '#sample');
  await climb(page);
  await tap(page, '#cleartitle');
  const t1 = await page.evaluate(() => {
    const r = id => document.getElementById(id).getBoundingClientRect(), vis = id => !document.getElementById(id).hidden;
    return { house: vis('house'), go: vis('housego'), count: vis('housecount'), first: r('housestart').top < r('shoot').top, free: document.getElementById('freeplay').textContent };
  });
  R.say(t1.house && !t1.go && !t1.count && t1.first && t1.free === 'Free play', 'after a first clear Start a house leads the title, Free play below it, no Continue the house and no Houses cleared yet (' + JSON.stringify(t1) + ')');

  /* the house's start */
  await tap(page, '#housestart');
  let s = await look(page);
  R.say(s.screen === 'door' && s.head === 'A new house' && s.shoot === 'Shoot the first room' && s.shown.join() === 'doorshoot,doorchoose,doorrecent,doorleave' && s.run && s.run.at === 0 && s.run.rooms.length === 0,
    'Start a house opens the house\'s card: A new house, Shoot the first room, Choose a photo, Use a recent room, Leave the house; a run saved at room 0 (' + s.head + '; ' + s.shown.join(', ') + ')');
  let sm = await small(page);
  R.say(sm.length === 0, 'every control on the house\'s card is 48 px or more' + (sm.length ? ' (' + sm.join(', ') + ')' : ''));

  /* room 1 from a recent room */
  await fromRecent(page);
  s = await look(page);
  const room1 = s.code;
  R.say(s.screen === 'play' && s.name === 'Room 1 of 5' && s.run.rooms.length === 1 && s.stored.run && s.stored.run.rooms.length === 1 && s.hero.hearts === 4,
    'a recent room from the doorway plays as Room 1 of 5, the run saved with it before a step (strip "' + s.name + '", ' + (s.stored.run ? s.stored.run.rooms.length : 0) + ' room stored)');
  const dp1 = await speck(page), w0 = s.dp;
  await climb(page);
  s = await look(page);
  R.say(s.screen === 'door' && s.head === 'Room 1 cleared' && s.bank === (dp1 === 1 ? 'Banked 1 dead pixel' : 'Banked ' + dp1 + ' dead pixels') && s.next === 'Room 2 is tougher',
    'room 1\'s clear shows the doorway: "' + s.head + '", "' + s.bank + '", "' + s.next + '"');
  R.say(dp1 > 0 && s.dp === w0 + dp1 && s.run.dp === dp1, 'the doorway banks the room\'s ' + dp1 + ' dead pixels at x1 (DESIGN 8): the wallet ' + w0 + ' to ' + s.dp);
  R.say(s.shown.join() === 'doorshoot,doorchoose,doorrecent,doorleave' && s.shoot === 'Shoot the next room', 'the doorway\'s buttons: Shoot the next room, Choose a photo, Use a recent room, Leave the house (' + s.shown.join(', ') + ')');
  sm = await small(page);
  R.say(sm.length === 0, 'every control on the doorway is 48 px or more' + (sm.length ? ' (' + sm.join(', ') + ')' : ''));
  R.say(s.stored.run && s.stored.run.at === 1, 'the run is written after room 1 (at ' + (s.stored.run && s.stored.run.at) + ')');

  /* room 2 from Choose a photo: the chooser by a real tap, the crop, Develop */
  const d0 = await page.evaluate(() => window.SB_DEV.overlay().decodes);
  const [chooser] = await Promise.all([page.waitForFileChooser({ timeout: 10000 }), scrollTap(page, '#doorchoose')]);
  await chooser.accept([PHOTO]);
  await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 15000 }, d0).catch(() => {});
  await tap(page, '#develop');
  await playing(page);
  s = await look(page);
  R.say(s.screen === 'play' && s.name === 'Room 2 of 5' && s.enemies >= 2 && s.run.rooms.length === 2, 'Choose a photo at the doorway plays room 2: the strip reads "' + s.name + '", ' + s.enemies + ' enemies (its floor 2)');
  /* a moth's hit, then the clear: one heart back */
  const hit = await page.evaluate(() => { const h0 = window.SB_DEV.state().hero.hearts; for (let k = 0; k < 4000 && window.SB_DEV.state().hero.hearts === h0; k += 10) window.SB_DEV.step(10); return { h0, h1: window.SB_DEV.state().hero.hearts }; });
  await climb(page);
  s = await look(page);
  R.say(hit.h1 < hit.h0 && s.screen === 'door' && s.run.hero.hearts === Math.min(s.run.hero.heartsMax, hit.h1 + 1) && s.head === 'Room 2 cleared' && s.next === 'Room 3 is tougher',
    'hearts carry with one back: hit to ' + hit.h1 + ' of ' + hit.h0 + ' in room 2, the doorway saves ' + (s.run && s.run.hero.hearts) + ' ("' + s.head + '", "' + s.next + '")');
  const hero2 = JSON.stringify(s.run.hero), rooms2 = JSON.stringify(s.run.rooms);

  /* a reload resumes at room 2's doorway */
  await page.reload(); await ready(page); await page.evaluate(() => window.SB_DEV.hold(true));
  const tt = await page.evaluate(() => ({ go: !document.getElementById('housego').hidden, text: document.getElementById('housego').textContent }));
  R.say(tt.go && tt.text === 'Continue the house', 'after a reload the title offers Continue the house');
  await tap(page, '#housego');
  s = await look(page);
  R.say(s.screen === 'door' && s.head === 'Room 2 cleared' && s.next === 'Room 3 is tougher' && JSON.stringify(s.run.hero) === hero2 && JSON.stringify(s.run.rooms) === rooms2,
    'Continue the house resumes at room 2\'s doorway with the bug intact (' + s.head + '; ' + JSON.stringify(s.run && s.run.hero) + ')');

  /* room 3: the carried hearts, an elite; then a death */
  await fromRecent(page);
  s = await look(page);
  R.say(s.name === 'Room 3 of 5' && s.hero.hearts === JSON.parse(hero2).hearts && s.elites >= 1 && s.enemies >= 3, 'room 3 starts with the carried ' + s.hero.hearts + ' hearts, ' + s.enemies + ' enemies and ' + s.elites + ' elite (strip "' + s.name + '")');
  const rooms3 = JSON.stringify(s.run.rooms), lostDp = await speck(page);
  const died = await page.evaluate(() => { for (let k = 0; k < 9000 && window.SB_DEV.screen() === 'play'; k += 30) window.SB_DEV.step(30); return window.SB_DEV.screen(); });
  const dc = await page.evaluate(() => { const $ = id => document.getElementById(id), vis = id => !$(id).hidden && $(id).getBoundingClientRect().height > 0;
    return { head: $('deathhead').textContent, lost: vis('deathlost') ? $('deathlost').textContent : null, btn: ['deathagain', 'deathretry', 'deathnew', 'deathtitle'].filter(vis), run: window.SB.save.doc.run, stored: JSON.parse(localStorage.getItem('shutterbug.v1')).run }; });
  R.say(died === 'dead' && dc.head === 'The house is lost' && dc.lost === (lostDp === 1 ? 'Lost 1 dead pixel' : 'Lost ' + lostDp + ' dead pixels') && dc.btn.join() === 'deathretry,deathnew,deathtitle',
    'a death in the house: "' + dc.head + '", "' + dc.lost + '", buttons ' + dc.btn.join(', '));
  R.say(dc.stored && dc.stored.lost === 1, 'the run is saved as lost (Retry House reads it)');
  sm = await small(page);
  R.say(sm.length === 0, 'every control on the house\'s death card is 48 px or more' + (sm.length ? ' (' + sm.join(', ') + ')' : ''));

  /* Retry House: the same rooms so far, a fresh bug */
  await tap(page, '#deathretry');
  s = await look(page);
  R.say(s.screen === 'play' && s.name === 'Room 1 of 5' && s.code === room1 && s.hero.hearts === 4 && s.hero.heartsMax === 4 && JSON.stringify(s.run.rooms) === rooms3 && s.run.at === 0 && s.run.lost === 0,
    'Retry House replays room 1 (the same grid) with a fresh bug (' + (s.hero && s.hero.hearts) + ' hearts), the same ' + (s.run ? s.run.rooms.length : 0) + ' rooms kept');
  await climb(page);
  s = await look(page);
  R.say(s.screen === 'door' && s.enter === 'Play room 2' && s.shown[0] === 'doorenter', 'after the retried room 1 the doorway offers Play room 2 first ("' + s.enter + '")');
  await tap(page, '#doorenter');
  s = await look(page);
  R.say(s.name === 'Room 2 of 5' && s.code === s.codes[1] && JSON.stringify(s.run.rooms) === rooms3, 'Play room 2 replays the saved room 2, its grid (the rooms kept: ' + (s.run ? s.run.rooms.length : 0) + ')');
  await climb(page);

  /* Leave the house, then Continue after a reload */
  await scrollTap(page, '#doorleave');
  const lt = await page.evaluate(() => ({ screen: window.SB_DEV.screen(), go: !document.getElementById('housego').hidden, at: window.SB.save.doc.run && window.SB.save.doc.run.at }));
  R.say(lt.screen === 'title' && lt.go && lt.at === 2, 'Leave the house goes to the title with Continue the house, the run at 2 rooms');
  await page.reload(); await ready(page); await page.evaluate(() => window.SB_DEV.hold(true));
  await tap(page, '#housego');
  s = await look(page);
  R.say(s.screen === 'door' && s.head === 'Room 2 cleared' && s.enter === 'Play room 3', 'Continue the house after a reload: "' + s.head + '", "' + s.enter + '"');
  await tap(page, '#doorenter');
  s = await look(page);
  R.say(s.name === 'Room 3 of 5', 'Play room 3 plays as Room 3 of 5 ("' + s.name + '")');
  await climb(page);
  await fromRecent(page);
  s = await look(page);
  R.say(s.name === 'Room 4 of 5' && s.enemies >= 4 && s.elites >= 1, 'room 4: "' + s.name + '", ' + s.enemies + ' enemies, ' + s.elites + ' elite');
  await climb(page);
  s = await look(page);
  R.say(s.next === 'Room 5 is tougher', 'room 4\'s doorway: "' + s.next + '"');
  await fromRecent(page);
  s = await look(page);
  R.say(s.name === 'The last room', 'room 5\'s strip reads "' + s.name + '"');
  const banked = s.run.dp, dp5 = await speck(page);
  await climb(page);
  s = await look(page);
  const total = banked + dp5;
  R.say(s.screen === 'door' && s.head === 'House cleared' && s.bank === '5 rooms, ' + total + (total === 1 ? ' dead pixel' : ' dead pixels') && s.shown.join() === 'doornew,doortitle',
    'room 5\'s clear ends the house: "' + s.head + '", "' + s.bank + '", buttons ' + s.shown.join(', '));
  R.say(s.run === null && s.stored.run === null && s.houseClears === 1, 'the house cleared: the run gone from the save, Houses cleared ' + s.houseClears);
  sm = await small(page);
  R.say(sm.length === 0, 'every control on the house clear card is 48 px or more' + (sm.length ? ' (' + sm.join(', ') + ')' : ''));
  await tap(page, '#doortitle');
  const tc = await page.evaluate(() => ({ count: document.getElementById('housecount').hidden ? null : document.getElementById('housecount').textContent, go: !document.getElementById('housego').hidden }));
  R.say(tc.count === 'Houses cleared 1' && !tc.go, 'the title says "' + tc.count + '" and offers no Continue the house');
  R.say(errors.length === 0, 'zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));

  /* the short phone: the doorway's controls 48 px or more, each reachable by a scroll and a real tap */
  {
    const b = await newPage(browser, { width: 320, height: 568 });
    await gotoGame(b.page, srv.base); await ready(b.page);
    await b.page.evaluate(() => window.SB_DEV.hold(true));
    await scrollTap(b.page, '#sample'); await climb(b.page); await scrollTap(b.page, '#cleartitle');
    await scrollTap(b.page, '#housestart');
    await fromRecent(b.page); await climb(b.page);
    const sm2 = await small(b.page);
    const reach = await b.page.evaluate(() => ['doorshoot', 'doorchoose', 'doorrecent', 'doorleave'].map(id => { const el = document.getElementById(id); el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(), top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return top === el ? null : id; }).filter(Boolean));
    R.say(sm2.length === 0 && reach.length === 0, '320x568: every doorway control is 48 px or more and reachable' + (sm2.length || reach.length ? ' (' + sm2.concat(reach).join(', ') + ')' : ''));
    R.say(b.errors.length === 0, '320x568: zero page errors' + (b.errors.length ? ' (' + b.errors.join(' ; ') + ')' : ''));
    await b.page.close();
  }
} finally { await browser.close(); await srv.close(); }
R.finish();
