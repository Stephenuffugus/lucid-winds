/* Browser gate `loop` (BUILD-PLAN.md T1.13, DESIGN 5.1): the free play loop end to end with real taps. The sample room
 * twice in a row (a speck taken, the climb skipped, the clear card, Share this room and its Close back to the card,
 * Play it again, the second clear), then Shoot the next room to the camera's picker, the photo, the crop, Develop and a
 * third room; a recent room and the death card, Again, the death card's Title. The gate's two named liberties:
 * SB_DEV.goto('speck') sets the hero on the first speck (so the room has Dead pixels to bank) and SB_DEV.goto('exit') on
 * the exit cell (the climb skipped); every other move is a real tap.
 * Checked: the room's Dead pixels banked at x0.5 floored on every clear and said on the card, which names the strip's
 * count it came from (QUESTIONS Q93: `Banked 1 of 3 dead pixels` over the count's 3); Recent rooms written on
 * every clear and shown on the title only after the first; every back and X returns to the screen it came from and
 * leaves nothing over the title; a share sheet left open under the strip's back never comes back over the next room;
 * an injected .lwfb-fab hides under every card and sheet and shows on the title, the crop and in the room. Inside the
 * wrapper iframe {sws:'earn', moment:'first_clear'} arrives exactly once across two clears and first_share once across
 * two copies, neither carrying an amount; the unframed clears marked no moment (QUESTIONS Q85).
 *
 * The M1 review: Settings opens after a room ran unheld, its Performance line a measure; a tap on A under the open
 * sheet is not banked into a jump at Close; the clear and death cards hide under the sheet; two quick copies come back
 * to Copy link.
 *
 * Watched red by X_LEAVES_OVERLAY, MOMENT_TWICE, FAB_OVER_SHEET, BANK_FULL_RATE, SHARE_CLOSE_TO_PLAY, PERF_OVER_PAIRS,
 * EDGE_BANKED_UNDER_SHEET, CARD_UNDER_SHEET, COPIED_STICKS and BANK_LINE_BARE. */
import { serve, launch, newPage, gotoGame, ready, reporter, tap, centre, GAME, GAME_PATH, sleep } from './harness.mjs';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const R = reporter('LOOP');
const SBN = createRequire(import.meta.url)(join(GAME, 'tools', 'core-loader.js')).loadCoreFull(join(GAME, 'index.html')).SB;
const ROOM = JSON.parse(readFileSync(join(GAME, 'fixtures', 'sample-room.json'), 'utf8')).record.rows, HEX = Array.from(SBN.palette.HEX);
const TMP = '/tmp/claude-1000/shutterbug-loop'; mkdirSync(TMP, { recursive: true });
const PHOTO = join(TMP, 'room-900x1600.png');
const OVER = ['clear', 'death', 'sharesheet', 'devcard'];   /* the cards and sheets a player can meet (the scroll offer and the chest's slip left M1: QUESTIONS Q92) */
const srv = await serve();
const browser = await launch();
try {
  /* the photo: the sample room painted over the default crop (as the capture gate paints it) */
  { const { page } = await newPage(browser, { width: 900, height: 1600, dpr: 1 });
    await page.setContent('<html><body style="margin:0"><canvas id="c" width="900" height="1600"></canvas></body></html>');
    await page.evaluate((rows, hex) => {
      const c = document.getElementById('c').getContext('2d'), cw = 800 / 24, ch = 1600 / 48;
      c.fillStyle = '#' + hex[4]; c.fillRect(0, 0, 900, 1600);
      rows.forEach((r, y) => [...r].forEach((d, x) => { c.fillStyle = '#' + hex[parseInt(d, 16)]; c.fillRect(Math.round(50 + x * cw), Math.round(y * ch), Math.ceil(cw), Math.ceil(ch)); }));
    }, ROOM, HEX);
    await (await page.$('#c')).screenshot({ path: PHOTO }); await page.close(); }

  const { page, errors } = await newPage(browser, { width: 412, height: 915 });
  await gotoGame(page, srv.base); await ready(page);
  await page.evaluate(() => localStorage.clear()); await page.reload(); await ready(page);
  await page.evaluate(() => {
    window.SB_DEV.hold(true);
    const f = document.createElement('div'); f.className = 'lwfb-fab';
    f.style.cssText = 'position:fixed;right:12px;bottom:96px;width:78px;height:78px;z-index:2000000000;background:#d83a9b';
    document.body.appendChild(f);
  });
  const look = () => page.evaluate((OVER) => ({
    screen: window.SB_DEV.screen(), on: OVER.filter(id => document.getElementById(id).classList.contains('on')),
    fab: getComputedStyle(document.querySelector('.lwfb-fab')).display, modal: document.body.classList.contains('sb-modal'),
    recentShown: !document.getElementById('recent').hidden, bank: document.getElementById('clearbank').hidden ? '' : document.getElementById('clearbank').textContent,
    count: document.getElementById('dpn').textContent,
    st: window.SB_DEV.state(), save: structuredClone(window.SB.save.doc) }), OVER);
  const clean = async (label) => {
    const l = await look(), c = await centre(page, '#sample');
    return R.say(l.screen === 'title' && l.on.length === 0 && !l.modal && l.fab !== 'none' && !!c && c.onTop,
      label + ': the title with nothing over it (screen ' + l.screen + (l.on.length ? ', still on: ' + l.on.join(' ') : '') + (c && !c.onTop ? ', a thumb on Try the sample room lands on ' + c.topName : '') + ', fab ' + l.fab + ')');
  };
  const shown = id => page.evaluate(id => getComputedStyle(document.getElementById(id)).visibility, id);
  const sheetOver = async (from, label) => {
    await tap(page, from === 'clear' ? '#clearshare' : '#share');
    const a = await look(), want = from === 'dead' ? 'death' : from, under = from === 'play' ? 'visible' : await shown(want);
    await tap(page, '#shareclose');
    const b = await look(), back = from === 'play' ? 'visible' : await shown(want);
    R.say(a.screen === 'share' && a.on.includes('sharesheet') && a.fab === 'none' && b.screen === from && !b.on.includes('sharesheet') && (from === 'play' || b.on.includes(want)),
      label + ': the share sheet over the ' + from + ' screen (fab ' + a.fab + ') and its Close returns to it (screen ' + b.screen + ', on: ' + (b.on.join(' ') || 'nothing') + ')');
    /* the card the sheet sits over never shows under it (the M1 review: at 320x568 the clear card's Play it again and
       Title showed and took taps below the sheet) */
    if (from !== 'play') R.say(under === 'hidden' && back === 'visible', label + ': the ' + want + ' card hides under the sheet (' + under + ') and shows again at Close (' + back + ')');
  };
  const clearRoom = async () => {
    const before = await look();
    await page.evaluate(() => { window.SB_DEV.goto('exit'); window.SB_DEV.step(2); });
    const after = await look();
    return { dp: before.st.room.dp, before, after };
  };
  const kill = () => page.evaluate(() => { let k = 0; for (; k < 20000 && !window.SB_DEV.state().room.dead; k += 60) window.SB_DEV.step(60); return k; });

  let l = await look();
  R.say(l.screen === 'title' && !l.recentShown && l.fab !== 'none', 'a fresh title: no Recent rooms before the first clear; the injected fab shows (' + l.fab + ')');

  /* the sample room, twice in a row */
  let banked = 0;
  for (let round = 1; round <= 2; round++) {
    if (round === 1) await tap(page, '#sample'); else await tap(page, '#again');
    l = await look();
    R.say(l.screen === 'play' && l.st.frame === 0 && l.on.length === 0 && l.fab !== 'none', 'round ' + round + ': ' + (round === 1 ? 'Try the sample room' : 'Play it again') + ' opens the room at frame 0 with nothing over it (fab ' + l.fab + ')');
    if (round === 1) {
      /* the sheet over the play screen comes before the A tap below: that tap first proves a thumb lands on A, so a fab
         left showing over the sheet threw there before this check could name it (FAB_OVER_SHEET read WRONG REASON in
         the sb-m1-1 full check). It opens and closes the sheet and never steps the held sim, so what follows is as before. */
      await sheetOver('play', 'round 1');
      /* a thumb on A while the sheet is up is never banked into a jump at Close (the M1 review: the strip under the
         sheet stays live, and its press edge fired on the next step) */
      const g0 = await page.evaluate(() => { for (let k = 0; k < 120 && !window.SB_DEV.state().hero.ground; k++) window.SB_DEV.step(1); window.SB_DEV.step(2); return window.SB_DEV.state().hero; });
      await tap(page, '#share'); await tap(page, '#btnA'); await tap(page, '#shareclose');
      const g1 = await page.evaluate(() => { window.SB_DEV.step(3); return window.SB_DEV.state().hero; });
      R.say(g0.ground && g1.ground && g1.y === g0.y, 'round 1: a tap on A under the open share sheet does not jump at Close (on the ground ' + g1.ground + ', y ' + (g0.y / 256) + ' then ' + (g1.y / 256) + ' px)');
    }
    await page.evaluate(() => { window.SB_DEV.goto('speck'); window.SB_DEV.step(2); });
    const c = await clearRoom(), want = Math.floor(c.dp * 0.5);
    banked += want;
    R.say(c.dp > 0 && c.after.screen === 'clear' && c.after.on.includes('clear') && c.after.fab === 'none', 'round ' + round + ': a speck taken (' + c.dp + ' Dead pixels in the room) and the clear card up; the fab hides under it');
    R.say(c.after.save.dp === banked && c.after.bank === 'Banked ' + want + ' of ' + c.dp + ' dead pixels', 'round ' + round + ': banked at x0.5 floored, ' + want + ' (the save holds ' + c.after.save.dp + ', the card says "' + c.after.bank + '")');
    /* the card's words and the strip's count under it agree (QUESTIONS Q93: the chest's +15, then a bare "Banked 7 dead
       pixels" over "Dead pixels 15", read as 8 lost): a bank under the count names the count it came from */
    R.say(c.after.count === String(c.dp) && new RegExp('^Banked ' + want + ' of ' + c.after.count + ' dead pixels?$').test(c.after.bank),
      'round ' + round + ': the card names the count it banked from, the strip\'s ' + c.after.count + ' under it ("' + c.after.bank + '")');
    R.say(c.after.save.stats.clears === round && c.after.save.recent.length === 1, 'round ' + round + ': the clear counted (' + c.after.save.stats.clears + ') and the room in Recent rooms (' + c.after.save.recent.length + ', the same grid once)');
    const btns = await Promise.all(['#nextroom', '#clearshare', '#again', '#cleartitle'].map(s => centre(page, s)));
    R.say(btns.every(b => b && b.onTop && b.inView && b.h >= 48), 'round ' + round + ': a thumb lands on each of Shoot the next room, Share this room, Play it again and Title, each 48 px tall or more');
    await sheetOver('clear', 'round ' + round);
    if (round === 1) {
      /* two quick taps on Copy link (a clipboard that takes it): the label says Copied, then comes back to Copy link,
         and the next sheet opens on Copy link (the M1 review: the second tap read Copied as the label and kept it) */
      await page.evaluate(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.resolve() }, configurable: true }); });
      await tap(page, '#clearshare'); await tap(page, '#copylink'); await sleep(300); await tap(page, '#copylink');
      const mid = await page.evaluate(() => document.getElementById('copylink').textContent);
      await sleep(1900);
      const after = await page.evaluate(() => document.getElementById('copylink').textContent);
      await tap(page, '#shareclose'); await tap(page, '#clearshare');
      const reopened = await page.evaluate(() => document.getElementById('copylink').textContent);
      await tap(page, '#shareclose');
      R.say(mid === 'Copied' && after === 'Copy link' && reopened === 'Copy link', 'round 1: two quick copies say Copied (' + mid + '), then Copy link again (' + after + '), and the next sheet opens on it (' + reopened + ')');
    }
  }
  await tap(page, '#cleartitle');
  await clean('the clear card\'s Title');
  l = await look();
  R.say(l.recentShown, 'after the first clear the title shows Recent rooms');

  /* the room's own back */
  await tap(page, '#sample');
  await tap(page, '#back');
  await clean('the strip\'s Title from the room');

  /* Shoot the next room: the camera's picker, the photo, the crop (its Title back), Develop */
  await tap(page, '#sample');
  await clearRoom();
  const [ch1] = await Promise.all([page.waitForFileChooser({ timeout: 10000 }), tap(page, '#nextroom')]);
  await ch1.accept([PHOTO]);
  await page.waitForFunction(() => window.SB_DEV.screen() === 'crop' && window.SB_DEV.overlay().builds > 0, { timeout: 15000 }).catch(() => {});
  l = await look();
  R.say(l.screen === 'crop' && l.on.length === 0 && l.fab !== 'none', 'Shoot the next room opens the camera\'s picker; the photo opens the crop (screen ' + l.screen + ', fab ' + l.fab + ')');
  await tap(page, '#croptitle');
  await clean('the crop\'s Title');
  const [ch2] = await Promise.all([page.waitForFileChooser({ timeout: 10000 }), tap(page, '#choose')]);
  await ch2.accept([PHOTO]);
  await page.waitForFunction(() => window.SB_DEV.screen() === 'crop' && window.SB_DEV.overlay().full, { timeout: 20000 }).catch(() => {});
  await tap(page, '#develop');
  await page.waitForFunction(() => window.SB_DEV.screen() === 'play', { timeout: 15000 }).catch(() => {});
  const c3 = await clearRoom();
  banked += Math.floor(c3.dp * 0.5);
  R.say(c3.before.screen === 'play' && c3.after.screen === 'clear' && c3.after.save.stats.clears === 4 && c3.after.save.dp === banked, 'Develop plays the photographed room and its clear banks too (clears ' + c3.after.save.stats.clears + ', the save holds ' + c3.after.save.dp + ')');
  await tap(page, '#cleartitle');
  await clean('the clear card\'s Title after a photo');

  /* a recent room, the death card, Again, the death card's Title */
  await tap(page, '#recentlist button');
  const k1 = await kill();
  l = await look();
  R.say(l.screen === 'dead' && l.on.includes('death') && l.fab === 'none', 'a recent room played and left alone ends at the death card in ' + k1 + ' steps; the fab hides under it');
  await sheetOver('dead', 'the death card');
  await tap(page, '#deathagain');
  l = await look();
  R.say(l.screen === 'play' && l.st.frame === 0 && l.st.room.dead === 0 && l.on.length === 0, 'Again restarts the room with nothing over it');
  await kill();
  await tap(page, '#deathtitle');
  await clean('the death card\'s Title');

  /* a share sheet left open under the strip's back: never over the next room */
  await tap(page, '#sample');
  await tap(page, '#share');
  await tap(page, '#back');
  await clean('the strip\'s Title with the share sheet open');
  await tap(page, '#sample');
  l = await look();
  const mid = await page.evaluate(() => { const r = document.getElementById('view').getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t ? t.id : ''; });
  R.say(l.screen === 'play' && !l.on.includes('sharesheet') && mid === 'stage', 'the next room opens with no share sheet over it (on: ' + (l.on.join(' ') || 'nothing') + ', a thumb mid room lands on ' + mid + ')');
  await tap(page, '#back');

  /* settings and back, after a room that ran unheld (the M1 review: the Performance line ran its p95 over the frame
     log's [now, steps] pairs and threw, so Settings never opened again once a room had run) */
  await tap(page, '#sample');
  await page.evaluate(() => window.SB_DEV.hold(false));
  await sleep(900);
  await page.evaluate(() => window.SB_DEV.hold(true));
  const ran = await page.evaluate(() => ({ frames: window.SB_DEV.perf().frames.length, screen: window.SB_DEV.screen() }));   /* the frame log fills only while the loop runs unheld */
  await tap(page, ran.screen === 'dead' ? '#deathtitle' : '#back');
  await tap(page, '#settingsbtn');
  l = await look();
  const perfLine = await page.evaluate(() => document.getElementById('setperf').textContent);
  R.say(ran.frames > 20 && l.screen === 'settings' && /^Performance: \d+\.\d ms p95, last room [0-9a-f]{16}$/.test(perfLine),
    'Settings opens after a room ran unheld (' + ran.frames + ' frames) and its Performance line reads "' + perfLine + '"');
  await tap(page, '#settitle');
  await clean('the settings\' Title');
  l = await look();
  R.say(JSON.stringify(l.save.moments) === '{}', 'unframed, the clears and the copied link marked no moment (' + JSON.stringify(l.save.moments) + ')');
  R.say(errors.length === 0, 'zero page errors unframed' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
  await page.close();

  /* inside the wrapper iframe: first_clear once across two clears, first_share once across two copies */
  const b = await newPage(browser, { width: 412, height: 915 });
  await b.page.goto(srv.base + '/__wrap.html', { waitUntil: 'load' });
  let fr = null;
  for (let k = 0; k < 100 && !fr; k++) { fr = b.page.frames().find(f => f.url().includes('probe=wrap')); if (!fr) await sleep(100); }
  await fr.waitForFunction(() => window.SB_DEV && typeof window.SB_DEV.screen === 'function', { timeout: 30000 });
  await fr.evaluate(() => { window.SB_DEV.revealSkip(true); window.SB_DEV.hold(true); });
  const box = await (await fr.frameElement()).boundingBox();
  const ftap = async (sel) => {
    const c = await fr.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); if (r.width < 1) return null;
      const x = r.left + r.width / 2, y = r.top + r.height / 2, t = document.elementFromPoint(x, y); return { x, y, onTop: !!t && (t === el || el.contains(t)) }; }, sel);
    if (!c || !c.onTop) throw new Error('in the frame a thumb on ' + sel + ' does not land on it');
    await b.page.touchscreen.tap(box.x + c.x, box.y + c.y);
  };
  await ftap('#sample');
  await fr.evaluate(() => { window.SB_DEV.goto('exit'); window.SB_DEV.step(2); });
  await ftap('#again');
  await fr.evaluate(() => { window.SB_DEV.goto('exit'); window.SB_DEV.step(2); });
  await ftap('#clearshare'); await ftap('#copylink'); await ftap('#copylink'); await ftap('#shareclose');
  await sleep(400);
  const msgs = await b.page.evaluate(() => window.__msgs.map(m => m.data).filter(d => d && d.sws === 'earn'));
  const fc = msgs.filter(m => m.moment === 'first_clear').length, fs = msgs.filter(m => m.moment === 'first_share').length;
  const scr = await fr.evaluate(() => ({ screen: window.SB_DEV.screen(), clears: window.SB.save.doc.stats.clears, moments: window.SB.save.doc.moments }));
  R.say(scr.clears >= 6 && fc === 1, 'inside the wrapper iframe two clears (the save counts ' + scr.clears + ') announce first_clear exactly once (' + fc + ')');
  R.say(fs === 1, 'two copied links announce first_share exactly once (' + fs + ')');
  R.say(msgs.every(m => Object.keys(m).every(k => k === 'sws' || k === 'moment' || k === 'detail') && !Object.values(m.detail || {}).some(v => typeof v === 'number')), 'no earn message carries an amount (' + JSON.stringify(msgs) + ')');
  R.say(scr.screen === 'clear' && scr.moments.first_clear === true && scr.moments.first_share === true, 'the framed save marks both moments (' + JSON.stringify(scr.moments) + ')');
  R.say(b.errors.length === 0, 'zero page errors framed' + (b.errors.length ? ' (' + b.errors.join(' ; ') + ')' : ''));
} finally { await browser.close(); await srv.close(); }
R.finish();
