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
 * The review of HOUSE-A (HOUSE-AR, Q201): room 1 banks at free play's x0.5 and room 2 at x1; the doorway reads Room n of
 * 5 cleared and shows the bug's hearts with the one back ringed; room 4's doorway says The last room is next and room 5
 * holds room 4's row; the crop screen from a doorway has Back, to it; Pause's Title in a house is Leave the house; with a
 * house saved its button leads the title in Sun (Continue the house, room n of 5); a reload on the death card keeps
 * the lost run, the title leading with Retry House; the death lost count struck in the strip; the House cleared card
 * counts the house's whole bank; at 320x568 the house death card stacks its buttons on one line each and its Retry
 * House replays room 1; the strip's name fits beside 8 hearts and two weapons at 320, 360 and 412 wide.
 *
 * Watched red by LOSE_ROOM_2_ON_RELOAD and RETRY_NEW_GRIDS (T2.8's names), HOUSE_ON_FIRST_SCREEN, STRIP_NAME_PLAIN,
 * DOOR_NEXT_WRONG, DP_HALF_IN_HOUSE, CARRY_DROPPED, DEATH_CARD_FREE, CONTINUE_HIDDEN, HOUSE_CLEAR_UNCOUNTED and
 * DOOR_BUTTON_40PX; and by HOUSE-AR's ROOM1_FULL_PAY, DP_HALF_IN_HOUSE, RETRY_ZEROES_DP, TITLE_DROPS_LOST, CONTINUE_PAPER,
 * STRIP_NAME_FULL, DOOR_HEARTS_OFF, DOOR_LAST_TOUGHER, DEATH_HOUSE_ROW, DP_NOT_STRUCK, PAUSE_TITLE_IN_HOUSE, CROP_BACK_TITLE. */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { serve, launch, newPage, gotoGame, ready, reporter, tap, GAME } from './harness.mjs';

const R = reporter('HOUSE');
const SAMPLE = JSON.parse(readFileSync(join(GAME, 'fixtures', 'sample-room.json'), 'utf8')).record, ROOM = SAMPLE.rows;
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
    enemies: st ? st.enemies.length : 0, elites: st ? st.enemies.filter(e => e.elite).length : 0, code: window.SB_DEV.level() ? window.SB_DEV.level().code : null,
    dhearts: vis('doorhearts') ? [...$('doorhearts').children].map(i => i.className || 'full').join(',') : null, croptitle: $('croptitle').textContent, pausetitle: $('pausetitle').textContent };
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
/* a saved house written into the save (the sample room at every place so far), then a reload to the title */
async function saveRun(page, o) {
  await page.evaluate((rec, o) => {
    const R = window.SB.record, d = R.saveDefaults(), W = window.SB.sim.WPN, slots = o.hero.slots ? o.hero.slots.split(',').map(id => W.indexOf(id)).concat([0]) : [0, 0, 0];
    d.stats.clears = 1; d.onboarding.firstRoomDone = true;
    d.run = { v: 1, rooms: Array.from({ length: o.at + 1 }, () => rec), at: o.at, hero: Object.assign({ vigor: 0, focus: 0, grit: 0, scrolls: 0 }, o.hero, { slots: slots.slice(0, 3) }), entry: [0, 0, 0], dp: 0, last: 0, lost: 0 };
    if (!R.runValid(d.run)) throw new Error('the gate\'s run is not valid');
    const doc = window.SB.save.doc; for (const k of Object.keys(d)) doc[k] = d[k];   /* the page's own write on the way out writes the same save */
    localStorage.setItem('shutterbug.v1', JSON.stringify(d));
  }, SAMPLE, o);
  await page.reload(); await ready(page); await page.evaluate(() => window.SB_DEV.hold(true));
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
  const wHouse = await page.evaluate(() => window.SB.save.doc.dp);
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
  const half1 = Math.floor(dp1 / 2), bank1 = half1 < dp1 ? 'Banked ' + half1 + ' of ' + dp1 + ' dead pixels' : half1 === 1 ? 'Banked 1 dead pixel' : 'Banked ' + half1 + ' dead pixels';
  R.say(s.screen === 'door' && s.head === 'Room 1 of 5 cleared' && s.bank === bank1 && s.next === 'Room 2 is tougher' && s.dhearts === 'full,full,full,full',
    'room 1\'s clear shows the doorway: "' + s.head + '", "' + s.bank + '", "' + s.next + '", the hearts ' + s.dhearts);
  /* room 1 is free play's room byte for byte, so it pays free play's x0.5 (the review of HOUSE-A: at x1 a house
     started and left after room 1 paid every free play room double) */
  R.say(dp1 > 1 && s.dp === w0 + half1 && s.run.dp === half1, 'room 1 banks at free play\'s rate: ' + dp1 + ' dead pixels carried, ' + half1 + ' banked, the wallet ' + w0 + ' to ' + s.dp + ' (free play pays ' + half1 + ')');
  R.say(s.shown.join() === 'doorshoot,doorchoose,doorrecent,doorleave' && s.shoot === 'Shoot the next room', 'the doorway\'s buttons: Shoot the next room, Choose a photo, Use a recent room, Leave the house (' + s.shown.join(', ') + ')');
  sm = await small(page);
  R.say(sm.length === 0, 'every control on the doorway is 48 px or more' + (sm.length ? ' (' + sm.join(', ') + ')' : ''));
  R.say(s.stored.run && s.stored.run.at === 1, 'the run is written after room 1 (at ' + (s.stored.run && s.stored.run.at) + ')');

  /* room 2 from Choose a photo: the chooser by a real tap, the crop, Develop */
  const d0 = await page.evaluate(() => window.SB_DEV.overlay().decodes);
  const [chooser] = await Promise.all([page.waitForFileChooser({ timeout: 10000 }), scrollTap(page, '#doorchoose')]);
  await chooser.accept([PHOTO]);
  await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 15000 }, d0).catch(() => {});
  /* the crop screen from a doorway: its corner control is Back, to that doorway (not Title) */
  s = await look(page);
  const cropAt = s.screen;
  await tap(page, '#croptitle');
  const backAt = await look(page);
  R.say(cropAt === 'crop' && s.croptitle === 'Back' && backAt.screen === 'door' && backAt.head === 'Room 1 of 5 cleared' && backAt.run && backAt.run.at === 1,
    'Back on the crop screen returns to the doorway ("' + s.croptitle + '" on ' + cropAt + ', then ' + backAt.screen + ' "' + backAt.head + '")');
  const d1 = await page.evaluate(() => window.SB_DEV.overlay().decodes);
  const [chooser2] = await Promise.all([page.waitForFileChooser({ timeout: 10000 }), scrollTap(page, '#doorchoose')]);
  await chooser2.accept([PHOTO]);
  await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 15000 }, d1).catch(() => {});
  await tap(page, '#develop');
  await playing(page);
  s = await look(page);
  R.say(s.screen === 'play' && s.name === 'Room 2 of 5' && s.enemies >= 2 && s.run.rooms.length === 2, 'Choose a photo at the doorway plays room 2: the strip reads "' + s.name + '", ' + s.enemies + ' enemies (its floor 2)');
  R.say(s.pausetitle === 'Leave the house', 'in a house the pause card\'s Title reads "' + s.pausetitle + '"');
  const w2 = s.dp;
  /* a moth's hit, then the clear: one heart back */
  /* two hits, so the heart back leaves the bug short of its cap and room 3 starts below a fresh bug's hearts */
  const hit = await page.evaluate(() => { const h0 = window.SB_DEV.state().hero.hearts; for (let k = 0; k < 6000 && window.SB_DEV.state().hero.hearts > h0 - 2; k += 10) window.SB_DEV.step(10); return { h0, h1: window.SB_DEV.state().hero.hearts }; });
  const dp2 = await speck(page);
  await climb(page);
  s = await look(page);
  R.say(hit.h1 === hit.h0 - 2 && s.screen === 'door' && s.run.hero.hearts === Math.min(s.run.hero.heartsMax, hit.h1 + 1) && s.head === 'Room 2 of 5 cleared' && s.next === 'Room 3 is tougher',
    'hearts carry with one back: hit to ' + hit.h1 + ' of ' + hit.h0 + ' in room 2, the doorway saves ' + (s.run && s.run.hero.hearts) + ' ("' + s.head + '", "' + s.next + '")');
  R.say(dp2 > 0 && s.dp === w2 + dp2 && s.run.dp === half1 + dp2, 'the doorway banks the room\'s ' + dp2 + ' dead pixels at x1 in room 2 (DESIGN 8): the wallet ' + w2 + ' to ' + s.dp);
  const wantHearts = Array.from({ length: s.run.hero.heartsMax }, (_, k) => k >= s.run.hero.hearts ? 'lost' : k === s.run.hero.hearts - 1 ? 'back' : 'full').join(',');
  R.say(s.dhearts === wantHearts, 'the doorway shows the bug\'s hearts, the one back ringed (' + s.dhearts + ', want ' + wantHearts + ')');
  const hero2 = JSON.stringify(s.run.hero), rooms2 = JSON.stringify(s.run.rooms);

  /* a reload resumes at room 2's doorway */
  await page.reload(); await ready(page); await page.evaluate(() => window.SB_DEV.hold(true));
  const lead = () => page.evaluate(() => { const $ = id => document.getElementById(id), r = id => $(id).getBoundingClientRect(), sun = getComputedStyle(document.documentElement).getPropertyValue('--sun').trim(),
    bg = id => getComputedStyle($(id)).backgroundColor, hex = c => { const m = c.match(/\d+/g); return '#' + m.slice(0, 3).map(v => (+v).toString(16).padStart(2, '0')).join(''); };
    return { go: !$('housego').hidden, text: $('housego').textContent, first: r('housego').top < r('housestart').top, goSun: hex(bg('housego')) === sun.toLowerCase(), startSun: hex(bg('housestart')) === sun.toLowerCase() }; });
  const tt = await lead();
  R.say(tt.go && tt.text === 'Continue the house, room 3 of 5', 'after a reload the title offers Continue the house ("' + tt.text + '")');
  R.say(tt.first && tt.goSun && !tt.startSun, 'with a house saved its button leads the title in Sun and Start a house follows in Paper (' + JSON.stringify(tt) + ')');
  await tap(page, '#housego');
  s = await look(page);
  R.say(s.screen === 'door' && s.head === 'Room 2 of 5 cleared' && s.next === 'Room 3 is tougher' && JSON.stringify(s.run.hero) === hero2 && JSON.stringify(s.run.rooms) === rooms2,
    'Continue the house resumes at room 2\'s doorway with the bug intact (' + s.head + '; ' + JSON.stringify(s.run && s.run.hero) + ')');

  /* room 3: the carried hearts, an elite; then a death */
  await fromRecent(page);
  s = await look(page);
  R.say(s.name === 'Room 3 of 5' && s.hero.hearts === JSON.parse(hero2).hearts && s.hero.hearts < s.hero.heartsMax && s.elites >= 1 && s.enemies >= 3, 'room 3 starts with the carried ' + s.hero.hearts + ' hearts, ' + s.enemies + ' enemies and ' + s.elites + ' elite (strip "' + s.name + '")');
  const rooms3 = JSON.stringify(s.run.rooms), lostDp = await speck(page);
  const died = await page.evaluate(() => { for (let k = 0; k < 9000 && window.SB_DEV.screen() === 'play'; k += 30) window.SB_DEV.step(30); return window.SB_DEV.screen(); });
  const dc = await page.evaluate(() => { const $ = id => document.getElementById(id), vis = id => !$(id).hidden && $(id).getBoundingClientRect().height > 0;
    return { head: $('deathhead').textContent, lost: vis('deathlost') ? $('deathlost').textContent : null, btn: ['deathagain', 'deathretry', 'deathnew', 'deathtitle'].filter(vis), run: window.SB.save.doc.run, stored: JSON.parse(localStorage.getItem('shutterbug.v1')).run }; });
  R.say(died === 'dead' && dc.head === 'The house is lost' && dc.lost === (lostDp === 1 ? 'Lost 1 dead pixel' : 'Lost ' + lostDp + ' dead pixels') && dc.btn.join() === 'deathretry,deathnew,deathtitle',
    'a death in the house: "' + dc.head + '", "' + dc.lost + '", buttons ' + dc.btn.join(', '));
  R.say(dc.stored && dc.stored.lost === 1, 'the run is saved as lost (Retry House reads it)');
  const struck = await page.evaluate(() => getComputedStyle(document.getElementById('dpn')).textDecorationLine);
  R.say(struck === 'line-through', 'the strip\'s count the death lost is struck through (' + struck + ')');
  sm = await small(page);
  R.say(sm.length === 0, 'every control on the house\'s death card is 48 px or more' + (sm.length ? ' (' + sm.join(', ') + ')' : ''));

  /* a reload on the death card (a killed tab, an app switch) keeps the lost house: the title leads with Retry House */
  await page.reload(); await ready(page); await page.evaluate(() => window.SB_DEV.hold(true));
  const tl = await lead(), keptLost = await page.evaluate(() => window.SB.save.doc.run && window.SB.save.doc.run.lost);
  R.say(tl.go && tl.text === 'Retry House' && tl.first && tl.goSun && keptLost === 1, 'after a reload on the death card the title offers Retry House first (' + JSON.stringify(tl) + ', lost ' + keptLost + ')');

  /* Retry House from that title: the same rooms so far, a fresh bug */
  await tap(page, '#housego');
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
  R.say(s.screen === 'door' && s.head === 'Room 2 of 5 cleared' && s.enter === 'Play room 3', 'Continue the house after a reload: "' + s.head + '", "' + s.enter + '"');
  await tap(page, '#doorenter');
  s = await look(page);
  R.say(s.name === 'Room 3 of 5', 'Play room 3 plays as Room 3 of 5 ("' + s.name + '")');
  await climb(page);
  await fromRecent(page);
  s = await look(page);
  R.say(s.name === 'Room 4 of 5' && s.enemies >= 4 && s.elites >= 1, 'room 4: "' + s.name + '", ' + s.enemies + ' enemies, ' + s.elites + ' elite');
  await climb(page);
  s = await look(page);
  R.say(s.next === 'The last room is next', 'room 4\'s doorway: "' + s.next + '"');
  await fromRecent(page);
  s = await look(page);
  R.say(s.name === 'The last room' && s.enemies >= 4 && s.elites >= 1, 'room 5\'s strip reads "' + s.name + '", ' + s.enemies + ' enemies, ' + s.elites + ' elite (room 4\'s row until the boss)');
  const banked = s.run.dp, dp5 = await speck(page);
  await climb(page);
  s = await look(page);
  const total = banked + dp5;
  R.say(s.screen === 'door' && s.head === 'House cleared' && s.bank === '5 rooms, ' + total + (total === 1 ? ' dead pixel' : ' dead pixels') && s.shown.join() === 'doornew,doortitle',
    'room 5\'s clear ends the house: "' + s.head + '", "' + s.bank + '", buttons ' + s.shown.join(', '));
  R.say(s.run === null && s.stored.run === null && s.houseClears === 1, 'the house cleared: the run gone from the save, Houses cleared ' + s.houseClears);
  R.say(total === s.dp - wHouse, 'the House cleared card counts the house\'s whole bank, Retry House\'s first attempt included (' + total + '; the wallet up ' + (s.dp - wHouse) + ' since Start a house)');
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

    /* the house's death card at 320x568: a saved run at room 3 with one heart, played until the bug falls */
    await saveRun(b.page, { at: 2, hero: { hearts: 1, heartsMax: 4 } });
    await scrollTap(b.page, '#housego'); await scrollTap(b.page, '#doorenter'); await playing(b.page);
    await b.page.evaluate(() => { for (let k = 0; k < 9000 && window.SB_DEV.screen() === 'play'; k += 30) window.SB_DEV.step(30); });
    const dk = await b.page.evaluate(() => {
      const $ = id => document.getElementById(id), ids = ['deathretry', 'deathnew', 'deathtitle'], rs = ids.map(id => $(id).getBoundingClientRect());
      const lines = id => { const rg = document.createRange(); rg.selectNodeContents($(id)); return new Set([...rg.getClientRects()].map(r => Math.round(r.top))).size; };
      return { screen: window.SB_DEV.screen(), column: rs.every((r, k) => k === 0 || (Math.abs(r.left - rs[0].left) < 1 && r.top >= rs[k - 1].bottom)), lines: ids.map(lines), text: ids.map(id => $(id).textContent) };
    });
    R.say(dk.screen === 'dead' && dk.column && dk.lines.every(n => n === 1), '320x568: the house death card stacks its buttons, each on one line (' + JSON.stringify(dk) + ')');
    const sm3 = await small(b.page);
    R.say(sm3.length === 0, '320x568: every control on the house death card is 48 px or more' + (sm3.length ? ' (' + sm3.join(', ') + ')' : ''));
    await scrollTap(b.page, '#deathretry');
    const rt = await look(b.page);
    R.say(rt.screen === 'play' && rt.name === 'Room 1 of 5' && rt.code === rt.codes[0] && rt.hero.hearts === 4, '320x568: Retry House on the death card replays room 1 with a fresh bug ("' + rt.name + '", ' + (rt.hero && rt.hero.hearts) + ' hearts)');
    R.say(b.errors.length === 0, '320x568: zero page errors' + (b.errors.length ? ' (' + b.errors.join(' ; ') + ')' : ''));
    await b.page.close();
  }

  /* the strip's house name with 8 carried hearts and two weapons fits at 320 and 360 wide, room 3 and the last room
     (the review of HOUSE-A: Room... and The last ro...) */
  for (const [vw, vh] of [[320, 568], [360, 780], [412, 915]]) {
    const b = await newPage(browser, { width: vw, height: vh });
    await gotoGame(b.page, srv.base); await ready(b.page);
    for (const at of [2, 4]) {
      await saveRun(b.page, { at, hero: { hearts: 8, heartsMax: 8, scrolls: 18, slots: 'J1,D1' } });
      await scrollTap(b.page, '#housego'); await scrollTap(b.page, '#doorenter'); await playing(b.page);
      const nm = await b.page.evaluate(() => { const el = document.getElementById('roomname'); const hs = document.getElementById('hearts'); return { text: el.textContent, sw: el.scrollWidth, cw: el.clientWidth, hearts: hs.getAttribute('aria-label'), shown: hs.textContent || hs.children.length + ' sprites',
        over: document.getElementById('top').scrollWidth > document.getElementById('top').clientWidth,
        slots: document.querySelectorAll('#slots .slot:not(.empty)').length }; });
      const want = at === 4 ? ['The last room', 'Last room', '5/5'] : ['Room 3 of 5', 'Room 3/5', '3/5'];
      R.say(nm.hearts === '8 of 8 hearts' && nm.slots === 2 && want.includes(nm.text) && nm.sw <= nm.cw && !nm.over, vw + 'x' + vh + ': the strip\'s room name fits beside 8 hearts and two weapons in room ' + (at + 1) + ' ("' + nm.text + '", ' + nm.sw + ' of ' + nm.cw + ' px, the hearts ' + nm.shown + ')');
      await b.page.evaluate(() => window.SB.ui.toTitle());
    }
    R.say(b.errors.length === 0, vw + 'x' + vh + ': zero page errors' + (b.errors.length ? ' (' + b.errors.join(' ; ') + ')' : ''));
    await b.page.close();
  }
} finally { await browser.close(); await srv.close(); }
R.finish();
