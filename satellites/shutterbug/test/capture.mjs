/* The capture gate (BUILD-PLAN.md T0.15, gate `capture`): a 900x1600 synthetic photo, painted here on a canvas in a
 * blank page (a bright ceiling bar, dark furniture blocks, a window rectangle) and saved as a PNG, fed through the
 * Choose a photo input with uploadFile:
 *   - the crop screen shows the overlay, and its solid count changes when a real touch drags the box;
 *   - Develop reaches the play screen through the reveal;
 *   - the record SB_DEV.level() exposes validates and, built in Node by harness.js --record-json, gives the page's
 *     exit and tabs;
 *   - SB_DEV.photoAlive() is false after the reveal;
 *   - no localStorage value holds data:image or is over 8 KB.
 * The levels item (QUESTIONS Q180, Stephen's ruling 31 Oct, "Floor becomes the ledge"), on a fresh page with the dev
 * flag (?perf=1), the sample room painted with bands and two plain photos:
 *   - on 4 rows of Walnut it develops at the default box, the hero on the band's top (above row 46; a 2 row band
 *     blurs into the row above it in the canvas downscale and leaves row 46 open, measured 31 Oct);
 *   - on 26 rows of Walnut, under 26 rows of Slate, and an all black photo, each refusal shows its own message, the
 *     floor and ceiling bands marked on the overlay, the black photo's overlay shaded and never blank;
 *   - a refusal no fallback names (the checkerboard) keeps the one old message;
 *   - the dev readout under the box names the rule that refused (lv.detail).
 * The auto crop (QUESTIONS Q96 ruling 3, Q181) moved those messages behind Develop: a refusing box at rest shows no
 * message, and Develop searches for the nearest box that builds; the messages per cause are seen with ?seek=0 (the
 * search skipped, the refusal's message at once on Develop). Without flags:
 *   - 26 rows of Walnut at the default box: no message at rest; Develop (one real tap, no drag) searches, the box is
 *     drawn where the search chose, no message while it shows, and the room developed is the chosen box's record;
 *   - a photo Ink to every edge: the seek marker loops while it searches, then, after exactly SEEK.CAP builds, the
 *     message for a photo nothing builds in its dark form (Q183: nothing in the photo can be climbed, a night sky
 *     named; never a tighter crop), the box where the player left it; no animation frame spends more than
 *     SEEK.SLICE_MS on the search (the builds in a worker), and with ?seekworker=0 (the builds on the page's thread)
 *     on a photo of light and dark stripes 40 px high (no box of the list builds, no cause) the search still spreads
 *     over frames, no frame that ran more than one build passed the budget, and it ends on the plain message.
 * The capture normalisation (QUESTIONS Q182), on a painted model room at rest: the page's normalised canvas grid equals
 * the capture oracle's normalizeRGB of the same grid byte for byte, the crop screen's record is that grid's nearest
 * colour in every cell, and the oracle's own area average of the PNG, normalised, lands near the page's record.
 * PHOTO1R (the auto crop reviewed from the player's seat): the page's own thread builds the chosen box to the record
 * the room develops (the worker's OffscreenCanvas reads a box a little differently, so the worker only finds the box);
 * while the found box shows, a faint trace of the player's box where he left it, the line over the photo saying a box
 * was found and Develop live; the worker holds its photo copy while it searches and none after a search found nothing
 * or after the develop; after nothing, the line points to Retake and Retake is set apart, both back once the box moves;
 * a worker failing mid try is ended and its box tried again on this thread (the same box after the same builds); with
 * the page hidden or the focus lost the found box waits on the crop screen and develops SEEK.SHOW_MS after he is back
 * (the reveal plays), a tap on Develop develops it at once; while the search runs the line says it looks; Retake mid
 * search stops it (nothing develops behind the chooser); a still tap on the box mid search stops it and moves no chest.
 * Watched red by OVERLAY_STALE and PHOTO_HELD, for the levels item by MESSAGE_SINGLE, BAND_UNMARKED,
 * OVERLAY_BLANK_REFUSED and DEV_READOUT_MS_ONLY, for the auto crop by SEEK_OFF, SEEK_NO_BUDGET, SEEK_BOX_UNMOVED,
 * SEEK_MESSAGE_AT_REST and SEEK_MESSAGE_WITH_BOX, for the search's reach by SEEK_OLD_COPY, and for the normalisation by
 * NORM_OFF and NORM_SPLIT, and for PHOTO1R by SEEK_DEVELOPS_AWAY, SEEK_SHOW_TAP_IGNORED, SEEK_NO_TRACE, SEEK_SHOW_DIMMED,
 * SEEK_HINT_SILENT, RETAKE_KEEPS_SEEKING, SEEK_TAP_PLACES_CHEST, WORKER_NOT_ENDED, WORKER_LOST_BOX, WORKER_PHOTO_HELD,
 * CAP_UNENFORCED, WORKER_RECORD_TRUSTED, NOTHING_HINT_STALE and NOTHING_HINT_STUCK. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { serve, launch, newPage, gotoGame, ready, reporter, tap, sleep, leaveRoom } from './harness.mjs';

const HERE = dirname(fileURLToPath(import.meta.url)), GAME = join(HERE, '..');
/* the photo is the sample room painted: its palette grid laid exactly over the default crop (the room is known to be
   climbable, so Develop has a level to reach), a wall colour in the margins the crop leaves */
const SBN = createRequire(import.meta.url)(join(GAME, 'tools', 'core-loader.js')).loadCoreFull(join(GAME, 'index.html')).SB;
const ROOM = JSON.parse(readFileSync(join(GAME, 'fixtures', 'sample-room.json'), 'utf8')).record.rows, HEX = Array.from(SBN.palette.HEX);
const R = reporter('CAPTURE');
const FIX = n => JSON.parse(readFileSync(join(GAME, 'fixtures', n), 'utf8')).record.rows;
const banded = (from, to, d) => ROOM.map((r, y) => (y >= from && y < to ? d.repeat(24) : r));
const TMP = '/tmp/claude-1000/shutterbug-capture'; mkdirSync(TMP, { recursive: true });
const PHOTO = join(TMP, 'room-900x1600.png'), REC = join(TMP, 'record.json');
let autoChosen = null;   /* the autocrop block's search of floor-tall, for PHOTO1R's worker failure */
const srv = await serve();
const browser = await launch();

try {
  /* the photo: painted, then shot to a PNG at exactly 900x1600 */
  {
    const { page } = await newPage(browser, { width: 900, height: 1600, dpr: 1 });
    await page.setContent('<html><body style="margin:0"><canvas id="c" width="900" height="1600"></canvas></body></html>');
    await page.evaluate((rows, hex) => {
      const c = document.getElementById('c').getContext('2d'), cw = 800 / 24, ch = 1600 / 48;
      c.fillStyle = '#' + hex[4]; c.fillRect(0, 0, 900, 1600);
      rows.forEach((r, y) => [...r].forEach((d, x) => { c.fillStyle = '#' + hex[parseInt(d, 16)]; c.fillRect(Math.round(50 + x * cw), Math.round(y * ch), Math.ceil(cw), Math.ceil(ch)); }));
    }, ROOM, HEX);
    const el = await page.$('#c');
    await el.screenshot({ path: PHOTO });
    await page.close();
  }
  /* the levels item's photos, painted the same way: the grid exactly over the default crop */
  const LEVELS = [
    ['floor-ok', banded(44, 48, '7')], ['floor-tall', banded(22, 48, '7')], ['ceiling-tall', banded(0, 26, '2')],
    ['black', Array(48).fill('0'.repeat(24))], ['checker', FIX('synthetic/checkerboard.json')]];
  for (const [name, rows] of LEVELS) {
    const { page } = await newPage(browser, { width: 900, height: 1600, dpr: 1 });
    await page.setContent('<html><body style="margin:0"><canvas id="c" width="900" height="1600"></canvas></body></html>');
    await page.evaluate((rows, hex) => {
      const c = document.getElementById('c').getContext('2d'), cw = 800 / 24, ch = 1600 / 48;
      c.fillStyle = '#' + hex[4]; c.fillRect(0, 0, 900, 1600);
      rows.forEach((r, y) => [...r].forEach((d, x) => { c.fillStyle = '#' + hex[parseInt(d, 16)]; c.fillRect(Math.round(50 + x * cw), Math.round(y * ch), Math.ceil(cw), Math.ceil(ch)); }));
    }, rows, HEX);
    await (await page.$('#c')).screenshot({ path: join(TMP, name + '.png') });
    await page.close();
  }
  /* the auto crop's photo that nothing builds: Ink to every edge (the black photo's wall margins build at the side) */
  {
    const { page } = await newPage(browser, { width: 900, height: 1600, dpr: 1 });
    await page.setContent('<html><body style="margin:0"><canvas id="c" width="900" height="1600"></canvas></body></html>');
    await page.evaluate(hex => { const c = document.getElementById('c').getContext('2d'); c.fillStyle = '#' + hex[0]; c.fillRect(0, 0, 900, 1600); }, HEX);
    await (await page.$('#c')).screenshot({ path: join(TMP, 'void.png') });
    await page.evaluate(() => { const c = document.getElementById('c').getContext('2d'); for (let y = 0; y < 1600; y += 40) { c.fillStyle = (y / 40) % 2 ? '#e6e6e6' : '#1e1e1e'; c.fillRect(0, y, 900, 40); } });
    await (await page.$('#c')).screenshot({ path: join(TMP, 'stripes.png') });
    await page.close();
  }
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base, 'perf=1&seek=0');
    await ready(page, { reveal: true });
    const input = await page.$('#filechoose');
    const COPY = await page.evaluate(() => Object.assign({}, window.SB.ui.COPY));
    /* the photo at rest (the dev readout read here, before Develop writes its own), then, for a refusal, Develop with
       the search skipped: the message, the band and the dashed Develop */
    const shoot = async name => {
      const d = await page.evaluate(() => window.SB_DEV.overlay().decodes);
      await input.uploadFile(join(TMP, name + '.png'));
      await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 10000 }, d).catch(() => {});
      const rest = await page.evaluate(() => Object.assign(window.SB_DEV.overlay(), { shown: !document.getElementById('tighter').hidden, dev: document.getElementById('cropsay').textContent, stuck: document.getElementById('crop').classList.contains('stuck') }));
      if (!rest.needsCrop) return rest;
      await page.evaluate(() => document.getElementById('develop').click());
      await page.waitForFunction(() => !document.getElementById('tighter').hidden, { timeout: 5000 }).catch(() => {});
      return page.evaluate(dev => Object.assign(window.SB_DEV.overlay(), { shown: !document.getElementById('tighter').hidden, dev: dev, stuck: document.getElementById('crop').classList.contains('stuck') }), rest.dev);
    };
    const ok = await shoot('floor-ok');
    R.say(ok.needsCrop === false && ok.spawnRow >= 40 && ok.spawnRow < 46 && !ok.shown && !ok.stuck, 'levels: the sample room on 4 rows of Walnut develops at the default box, the hero on the band\'s top (needsCrop ' + ok.needsCrop + ', spawn row ' + ok.spawnRow + ', the message ' + (ok.shown ? 'shown' : 'hidden') + ')');
    const fl = await shoot('floor-tall');
    R.say(fl.needsCrop && fl.cause === 'floor' && fl.shown && fl.says === COPY.tighterFloor, 'levels: the floor refusal says "' + COPY.tighterFloor + '" (cause ' + fl.cause + ', shown ' + fl.shown + ', it says "' + fl.says + '")');
    R.say(fl.marked > 0 && fl.band && fl.marked === 48 - fl.band.floor && fl.drawn > 0, 'levels: the overlay marks the floor band, its ' + fl.marked + ' rows from row ' + (fl.band && fl.band.floor) + ' down (' + fl.drawn + ' cells shaded)');
    R.say(typeof fl.detail === 'string' && fl.detail.length > 0 && fl.dev.includes(fl.detail) && fl.dev.includes('floor'), 'levels: the dev readout names the rule that refused ("' + fl.dev + '")');
    const ce = await shoot('ceiling-tall');
    R.say(ce.needsCrop && ce.cause === 'ceiling' && ce.shown && ce.says === COPY.tighterCeiling && ce.marked > 0 && ce.band && ce.marked === ce.band.ceiling - 1, 'levels: the ceiling refusal says "' + COPY.tighterCeiling + '" and the overlay marks its band (cause ' + ce.cause + ', it says "' + ce.says + '", ' + ce.marked + ' rows marked, band ' + JSON.stringify(ce.band) + ')');
    const bk = await shoot('black');
    R.say(bk.needsCrop && bk.cause === 'dark' && bk.shown && bk.says === COPY.tighterDark, 'levels: the black photo\'s refusal says "' + COPY.tighterDark + '" (cause ' + bk.cause + ', it says "' + bk.says + '")');
    R.say(bk.drawn > 1000, 'levels: the black photo\'s overlay shades its grid, never a blank box (' + bk.drawn + ' cells shaded of ' + bk.solids + ' solid)');
    const cb = await shoot('checker');
    R.say(cb.needsCrop && cb.cause === null && cb.shown && cb.says === COPY.tighter, 'levels: a refusal no fallback names keeps the one old message (the checkerboard: cause ' + cb.cause + ', it says "' + cb.says + '")');
    R.say(errors.length === 0, 'levels: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
  /* AUTOCROP (Q181): the player's page, no flags. 26 rows of Walnut refuse at the default box; Develop finds a box */
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base);
    await ready(page, { reveal: true });
    const input = await page.$('#filechoose'), SEEK = await page.evaluate(() => Object.assign({}, window.SB.capture.SEEK));
    const load = async name => {
      const d = await page.evaluate(() => window.SB_DEV.overlay().decodes);
      await input.uploadFile(join(TMP, name + '.png'));
      await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 10000 }, d).catch(() => {});
      return page.evaluate(() => Object.assign(window.SB_DEV.overlay(), { stuck: document.getElementById('crop').classList.contains('stuck') }));
    };
    const rest = await load('floor-tall');
    R.say(rest.needsCrop === true && !rest.shown && !rest.stuck, 'autocrop: 26 rows of Walnut refuse at the default box and say nothing at rest, Develop live (needsCrop ' + rest.needsCrop + ', the message ' + (rest.shown ? 'shown: "' + rest.says + '"' : 'hidden') + ', Develop ' + (rest.stuck ? 'dashed' : 'live') + ')');
    await tap(page, '#develop');
    await page.waitForFunction(() => { const s = window.SB_DEV.overlay().seek; return s && s.phase !== 'seek'; }, { timeout: 20000 }).catch(() => {});
    /* the chosen box built once more on the page's own thread (its <canvas> downscale, not the worker's OffscreenCanvas):
       the record Develop would take after a touch rebuilt the box (PHOTO1R) */
    const show = await page.evaluate(() => {
      const CR = window.SB.ui.crop, C = window.SB.capture, S = window.SB.ui.seekInfo(), ch = S && S.chosen;
      const pr = ch && CR.src ? window.SB.record.fromJSON(C.gridRecord(C.downscale(CR.src, ch, 24, 48), CR.focal)) : null;
      const f = document.getElementById('cropfrom');
      return Object.assign(window.SB_DEV.overlay(), { screen: window.SB_DEV.screen(), pageCode: pr ? window.SB.record.encode(pr) : null, dim: document.getElementById('crop').classList.contains('seeking'),
        fromAt: { left: parseFloat(f.style.left), top: parseFloat(f.style.top), width: parseFloat(f.style.width) } });
    });
    const sk = show.seek || {}, ch = sk.chosen, dr = sk.drawn || {};
    const at = ch ? { left: sk.ox + ch.x * sk.k, top: sk.oy + ch.y * sk.k, width: ch.w * sk.k } : null;
    const near = (a, b) => Math.abs(a - b) <= 1;
    R.say(sk.phase === 'show' && ch && JSON.stringify(ch) !== JSON.stringify(sk.from) && sk.builds >= 1 && show.screen === 'crop' && JSON.stringify(show.crop) === JSON.stringify(ch),
      'autocrop: one tap on Develop, no drag, and the search finds a box that builds (' + (sk.builds || 0) + ' builds, ' + (sk.mode || 'no') + ' mode, ' + Math.round(sk.ms || 0) + ' ms, the box ' + JSON.stringify(sk.from) + ' to ' + JSON.stringify(ch) + ', phase ' + sk.phase + ')');
    R.say(at && near(dr.left, at.left) && near(dr.top, at.top) && near(dr.width, at.width), 'autocrop: the box is drawn where the search chose it (drawn ' + JSON.stringify(dr) + ', the chosen box on screen ' + JSON.stringify(at) + ')');
    R.say(sk.phase === 'show' && !show.shown && !show.stuck && show.needsCrop === false, 'autocrop: no message while the chosen box shows (the message ' + (show.shown ? 'shown: "' + show.says + '"' : 'hidden') + ', needsCrop ' + show.needsCrop + ')');
    R.say(sk.mode === 'worker' && sk.code && show.pageCode === sk.code, 'photo1r: the page\'s own thread builds the chosen box to the record the worker found (' + sk.mode + ' mode, ' + sk.drift + ' of the worker\'s builds read differently here, ' + sk.refusedHere + ' refused here; the codes ' + (show.pageCode === sk.code ? 'agree' : 'differ: page ' + String(show.pageCode).slice(0, 24) + ' worker ' + String(sk.code).slice(0, 24)) + ')');
    const fa = sk.from ? { left: sk.ox + sk.from.x * sk.k, top: sk.oy + sk.from.y * sk.k, width: sk.from.w * sk.k } : null, fr = show.fromAt || {};
    R.say(sk.phase === 'show' && sk.fromShown && fa && near(fr.left, fa.left) && near(fr.top, fa.top) && near(fr.width, fa.width) && sk.hint === 'seekFound' && !show.dim,
      'photo1r: while the found box shows, the player\'s box stays as a faint trace where he left it, the line over the photo says a box was found, Develop live (trace ' + (sk.fromShown ? JSON.stringify(fr) : 'hidden') + ' against ' + JSON.stringify(fa) + ', the line ' + sk.hint + ', Develop ' + (show.dim ? 'dimmed' : 'live') + ')');
    autoChosen = ch ? { chosen: ch, builds: sk.builds } : null;
    await page.waitForFunction(() => window.SB_DEV.screen() === 'play', { timeout: 15000 }).catch(() => {});
    const dev = await page.evaluate(() => ({ screen: window.SB_DEV.screen(), code: window.SB_DEV.level() && window.SB_DEV.level().code, chosen: window.SB.ui.seekInfo().code }));
    R.say(dev.screen === 'play' && dev.code && dev.code === dev.chosen, 'autocrop: it develops by itself, the room the chosen box\'s record (screen ' + dev.screen + ', the room\'s code ' + (dev.code === dev.chosen ? 'is' : 'is not') + ' the chosen box\'s)');
    const heldDev = await page.evaluate(() => window.SB.ui.seekWorkerHeld());
    R.say(heldDev === false, 'photo1r: after the develop the worker holds no copy of the photo (it answers ' + heldDev + ')');
    await leaveRoom(page);
    await page.waitForFunction(() => window.SB_DEV.screen() === 'title', { timeout: 5000 }).catch(() => {});
    /* Ink to every edge: nothing in it builds */
    const bk0 = await load('void');
    await tap(page, '#develop');
    const mk = await page.evaluate(() => new Promise(r => requestAnimationFrame(() => setTimeout(() => r(Object.assign(window.SB_DEV.overlay().seek || {}, { seeking: window.SB_DEV.overlay().seeking })), 120))));
    await sleep(300);
    const heldMidV = await page.evaluate(() => window.SB.ui.seekWorkerHeld()), heldMid = await page.evaluate(() => ({ phase: window.SB.ui.seekInfo().phase }));
    await page.waitForFunction(() => { const s = window.SB_DEV.overlay().seek; return s && s.phase !== 'seek'; }, { timeout: 120000 }).catch(() => {});
    const bk = await page.evaluate(() => Object.assign(window.SB_DEV.overlay(), { stuck: document.getElementById('crop').classList.contains('stuck'), copy: Object.assign({}, window.SB.ui.COPY),
      nothing: document.getElementById('crop').classList.contains('nothing'), hint: document.getElementById('crophint').textContent, retakeBg: getComputedStyle(document.getElementById('retake')).backgroundColor }));
    const bs = bk.seek || {};
    const heldNone = await page.evaluate(() => window.SB.ui.seekWorkerHeld());
    R.say(heldMid.phase === 'seek' && heldMidV === true && heldNone === false, 'photo1r: the worker holds its copy of the photo while it searches and none once the search found nothing (mid search ' + heldMidV + ', after ' + heldNone + ')');
    R.say(bs.phase === 'none' && bk.hint === bk.copy.nothingHint && bk.nothing && bk.retakeBg !== 'rgba(0, 0, 0, 0)', 'photo1r: with the message that nothing builds, the line over the photo points to Retake and Retake is set apart (the line "' + bk.hint + '", Retake on ' + bk.retakeBg + ')');
    R.say(mk.seeking && mk.marker && mk.frames >= 1, 'autocrop: the seek marker shows while the search runs (searching ' + mk.seeking + ', the marker ' + (mk.marker ? 'shown' : 'hidden') + ', ' + (mk.frames || 0) + ' frames drawn)');
    R.say(bs.phase === 'none' && bs.builds === SEEK.CAP && bs.candidates > SEEK.CAP && bk.shown && bk.says === bk.copy.nothingDark && bk.stuck && !bs.marker && JSON.stringify(bk.crop) === JSON.stringify(bk0.crop),
      'autocrop: a photo nothing builds ends, after exactly SEEK.CAP builds, on the message that nothing in it can be climbed (its dark form), the box where the player left it (phase ' + bs.phase + ', ' + bs.builds + ' builds of ' + bs.candidates + ' boxes, CAP ' + SEEK.CAP + ', it says "' + bk.says + '", the box ' + JSON.stringify(bk.crop) + ')');
    R.say(!/tighter|crop/i.test(bk.says), 'autocrop: the message after a search never asks for a tighter crop ("' + bk.says + '")');
    {
      const b = await page.evaluate(() => { const r = document.getElementById('cropbox').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      const f = await page.touchscreen.touchStart(b.x, b.y);
      for (let k = 1; k <= 6; k++) { await f.move(b.x + k * 6, b.y); await sleep(30); }
      await f.end(); await sleep(300);
      const mv = await page.evaluate(() => ({ nothing: document.getElementById('crop').classList.contains('nothing'), hint: document.getElementById('crophint').getAttribute('data-copy'), shown: !document.getElementById('tighter').hidden }));
      R.say(!mv.nothing && mv.hint === 'cropHint' && !mv.shown, 'photo1r: once the box moves, the line and Retake are back as they were (the line ' + mv.hint + ', Retake ' + (mv.nothing ? 'still set apart' : 'plain') + ')');
    }
    R.say(bs.slices >= 2 && bs.sliceMax <= SEEK.SLICE_MS, 'autocrop: the search spreads over ' + bs.slices + ' frames and none spends more than ' + SEEK.SLICE_MS + ' ms on it (the longest ' + (bs.sliceMax || 0).toFixed(1) + ' ms, ' + bs.mode + ' mode)');
    R.say(errors.length === 0, 'autocrop: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
  /* PHOTO1R (the review of the auto crop from the player's seat): the search with the player away, a Retake and a touch
     while it looks, and a worker that fails mid try. The page's hidden state and its focus are set by hand (Object
     .defineProperty on document.hidden, document.hasFocus) with the events the browser sends, since a headless page is
     never hidden nor blurred */
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base);
    await ready(page, { reveal: true });
    const input = await page.$('#filechoose'), SEEK = await page.evaluate(() => Object.assign({}, window.SB.capture.SEEK));
    const load = async name => {
      const d = await page.evaluate(() => window.SB_DEV.overlay().decodes);
      await input.uploadFile(join(TMP, name + '.png'));
      await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 10000 }, d).catch(() => {});
    };
    const settled = () => page.waitForFunction(() => { const s = window.SB.ui.seekInfo(); return s && s.phase !== 'seek'; }, { timeout: 60000 }).catch(() => {});
    const info = () => page.evaluate(() => Object.assign(window.SB.ui.seekInfo() || {}, { screen: window.SB_DEV.screen(), seeking: !!window.SB.ui.crop.seek, focal: window.SB.ui.crop.focal }));
    /* the worker fails during its first try: it is ended, and the box it was trying is tried on this thread, so the
       search ends on the same box after the same builds as the autocrop block's search of this photo (a fresh page) */
    await load('floor-tall');
    await tap(page, '#develop');
    const er = await page.evaluate(() => new Promise(done => {
      const t0 = performance.now(), poll = () => {
        const CR = window.SB.ui.crop, S = CR.seek, w = CR.worker;
        if (S && S.busy && w) { let ended = false; const term = w.terminate; w.terminate = function () { ended = true; return term.call(this); }; w.dispatchEvent(new Event('error')); done({ at: S.i, ended: () => ended, worker: CR.worker, mode: S.mode, ok: true, endedNow: ended }); return; }
        if (performance.now() - t0 > 10000 || (S && S.phase !== 'seek')) { done({ ok: false, phase: S && S.phase }); return; }
        setTimeout(poll, 0);
      };
      poll();
    }).then(r => ({ ok: r.ok, at: r.at, ended: r.endedNow, gone: r.ok ? r.worker === null : null, mode: r.mode, phase: r.phase })));
    await settled();
    const ea = await info();
    R.say(er.ok && er.ended && er.gone && er.mode === 'main', 'photo1r: a worker that fails mid try is ended with its copy of the photo, and the search goes on on this thread (failed at try ' + er.at + ', ended ' + er.ended + ', the worker ' + (er.gone ? 'dropped' : 'kept') + ', ' + er.mode + ' mode)');
    R.say(ea.retried === 1 && autoChosen && JSON.stringify(ea.chosen) === JSON.stringify(autoChosen.chosen) && ea.builds === autoChosen.builds,
      'photo1r: the box the failed worker was trying is tried again, so the search finds the same box after the same builds (retried ' + ea.retried + ', ' + ea.builds + ' builds, the box ' + JSON.stringify(ea.chosen) + '; without the failure ' + JSON.stringify(autoChosen) + ')');
    await page.waitForFunction(() => window.SB_DEV.screen() === 'play', { timeout: 15000 }).catch(() => {});
    await leaveRoom(page);
    await page.waitForFunction(() => window.SB_DEV.screen() === 'title', { timeout: 5000 }).catch(() => {});
    /* the page hidden during the search (the phone locked, another app): the found box waits; back, it develops */
    await load('floor-tall');
    await tap(page, '#develop');
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    await settled();
    await sleep(SEEK.SHOW_MS + 900);
    const hd = await info();
    R.say(hd.phase === 'show' && hd.screen === 'crop' && hd.held >= 1, 'photo1r: with the page hidden the found box waits on the crop screen, never developing unseen (phase ' + hd.phase + ', screen ' + hd.screen + ', held ' + hd.held + ', ' + (SEEK.SHOW_MS + 900) + ' ms after the search)');
    await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    const seen = await page.evaluate(() => new Promise(r => { const t0 = performance.now(), saw = []; const k = () => { const s = window.SB_DEV.screen(); if (saw[saw.length - 1] !== s) saw.push(s); if (s === 'play' || performance.now() - t0 > 15000) r(saw); else requestAnimationFrame(k); }; k(); }));
    R.say(seen.includes('reveal') && seen[seen.length - 1] === 'play', 'photo1r: back on the page, the found box develops by itself and the reveal plays (the screens ' + seen.join(' > ') + ')');
    await leaveRoom(page);
    await page.waitForFunction(() => window.SB_DEV.screen() === 'title', { timeout: 5000 }).catch(() => {});
    /* the window's focus lost during the search (the notification shade): the found box waits; a tap on Develop
       develops it at once */
    await load('floor-tall');
    await tap(page, '#develop');
    await page.evaluate(() => { document.hasFocus = () => false; window.dispatchEvent(new Event('blur')); });
    await settled();
    await sleep(SEEK.SHOW_MS + 900);
    const bl = await info();
    R.say(bl.phase === 'show' && bl.screen === 'crop' && bl.held >= 1, 'photo1r: with the window\'s focus lost the found box waits on the crop screen (phase ' + bl.phase + ', screen ' + bl.screen + ', held ' + bl.held + ')');
    await tap(page, '#develop');
    await sleep(150);
    const bt = await info();
    R.say(bt.phase === 'done' && bt.tapped && bt.screen !== 'crop', 'photo1r: a tap on Develop while the found box shows develops it at once (phase ' + bt.phase + ', by the tap ' + bt.tapped + ', screen ' + bt.screen + ')');
    await page.evaluate(() => { delete document.hasFocus; window.dispatchEvent(new Event('focus')); });
    await page.waitForFunction(() => window.SB_DEV.screen() === 'play', { timeout: 15000 }).catch(() => {});
    await leaveRoom(page);
    await page.waitForFunction(() => window.SB_DEV.screen() === 'title', { timeout: 5000 }).catch(() => {});
    /* the stripes (nothing builds; a search of SEEK.CAP builds, seconds long): the line says it looks; Retake mid search
       stops it, so no box found behind the chooser develops the old photo */
    await load('stripes');
    await tap(page, '#develop');
    await sleep(300);
    const sh = await page.evaluate(() => ({ hint: document.getElementById('crophint').textContent, phase: window.SB.ui.seekInfo().phase, copy: window.SB.ui.COPY.seekHint }));
    R.say(sh.phase === 'seek' && sh.hint === sh.copy, 'photo1r: while the search runs the line over the photo says it is looking and that a touch stops it ("' + sh.hint + '", phase ' + sh.phase + ')');
    const chooser = page.waitForFileChooser({ timeout: 5000 }).catch(() => null);
    await tap(page, '#retake');
    const fc = await chooser;
    if (fc) await fc.cancel();
    const r1 = await info();
    await sleep(SEEK.SHOW_MS + 900);
    const r2 = await info();
    R.say(!!fc && r1.phase === 'stopped' && !r2.seeking && r2.builds === r1.builds && r2.screen === 'crop' && r2.hint === 'cropHint',
      'photo1r: Retake mid search stops the search, so nothing develops behind the chooser (the chooser ' + (fc ? 'opened' : 'never opened') + ', phase ' + r1.phase + ', builds ' + r1.builds + ' then ' + r2.builds + ', screen ' + r2.screen + ', the line ' + r2.hint + ')');
    /* a still tap inside the box while it searches stops the search and hides no chest under the finger */
    await tap(page, '#develop');
    await sleep(300);
    const t1 = await info();
    const bx = await page.evaluate(() => { const r = document.getElementById('cropbox').getBoundingClientRect(); return { x: r.left + r.width * 0.3, y: r.top + r.height * 0.6 }; });
    await page.touchscreen.tap(bx.x, bx.y);
    await sleep(200);
    const t2 = await info();
    R.say(t1.phase === 'seek' && t2.phase === 'stopped' && !t2.seeking && t2.focal === t1.focal && t2.hint === 'cropHint', 'photo1r: a tap on the box while it searches stops the search and moves no chest (phase ' + t1.phase + ' then ' + t2.phase + ', the chest cell ' + t1.focal + ' then ' + t2.focal + ', the line ' + t2.hint + ')');
    R.say(errors.length === 0, 'photo1r: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
  /* AUTOCROP: the builds on the page's own thread (no worker): still spread over frames under the budget */
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base, 'seekworker=0');
    await ready(page, { reveal: true });
    const SLICE = await page.evaluate(() => window.SB.capture.SEEK.SLICE_MS);
    const d = await page.evaluate(() => window.SB_DEV.overlay().decodes);
    await (await page.$('#filechoose')).uploadFile(join(TMP, 'stripes.png'));
    await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 10000 }, d).catch(() => {});
    await tap(page, '#develop');
    await page.waitForFunction(() => { const s = window.SB_DEV.overlay().seek; return s && s.phase !== 'seek'; }, { timeout: 150000 }).catch(() => {});
    const ms = await page.evaluate(() => window.SB_DEV.overlay().seek || {});
    const st = await page.evaluate(() => Object.assign(window.SB_DEV.overlay(), { copy: Object.assign({}, window.SB.ui.COPY) }));
    R.say(ms.phase === 'none' && st.cause === null && st.shown && st.says === st.copy.nothingClimbs, 'autocrop: the striped photo nothing builds (no cause) ends on "' + st.copy.nothingClimbs + '" (phase ' + ms.phase + ', ' + ms.builds + ' builds, cause ' + st.cause + ', it says "' + st.says + '")');
    R.say(ms.mode === 'main' && ms.phase === 'none' && ms.slices >= 2 && ms.multiOver === 0, 'autocrop: without a worker the builds spread over ' + ms.slices + ' frames and no frame that ran more than one build passed ' + SLICE + ' ms (' + ms.multiOver + ' did; the longest ' + (ms.sliceMax || 0).toFixed(1) + ' ms, ' + ms.builds + ' builds, ' + ms.mode + ' mode)');
    R.say(errors.length === 0, 'autocrop: zero page errors without a worker' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
  /* NORMALISE (Q182): a painted model room (tools/room-model.js scene 22, a pale blue wall, a 1024x1360 photo) at rest
     on the crop screen. The page's own canvas grid of the box, normalised by the page, equals the capture oracle's
     normalizeRGB of that same grid byte for byte; the record the crop screen built is the normalised grid's nearest
     colour in every cell (and not the raw grid's); the oracle's own area average of the PNG, normalised, lands near it */
  {
    const RM = createRequire(import.meta.url)(join(GAME, 'tools', 'room-model.js')), O = createRequire(import.meta.url)(join(GAME, 'tools', 'capture-oracle.js'));
    const SCENE = join(TMP, 'model-22.png');
    RM.png(RM.paint(22), SCENE);
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base);
    await ready(page, { reveal: true });
    const d = await page.evaluate(() => window.SB_DEV.overlay().decodes);
    await (await page.$('#filechoose')).uploadFile(SCENE);
    await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 10000 }, d).catch(() => {});
    const g = await page.evaluate(() => {
      const CR = window.SB.ui.crop, C = window.SB.capture, raw = C.downscale(CR.src, CR.crop, 24, 48);
      return { raw: Array.from(raw), norm: Array.from(C.normalize(raw)), pal: CR.lastRec ? Array.from(CR.lastRec.pal) : [], crop: CR.crop };
    });
    const raw = Uint8Array.from(g.raw), want = O.normalizeRGB(raw);
    let diff = 0; for (let i = 0; i < want.length; i++) if (want[i] !== g.norm[i]) diff++;
    R.say(g.norm.length === 3456 && diff === 0, 'normalise: the page\'s normalised grid of the box equals the capture oracle\'s normalizeRGB of the same canvas grid, byte for byte (' + diff + ' of ' + want.length + ' bytes differ)');
    let off = 0, moved = 0;
    for (let i = 0; i < 1152; i++) { if (g.pal[i] !== SBN.palette.nearest(want[3 * i], want[3 * i + 1], want[3 * i + 2])) off++; if (g.pal[i] !== SBN.palette.nearest(raw[3 * i], raw[3 * i + 1], raw[3 * i + 2])) moved++; }
    R.say(g.pal.length === 1152 && off === 0 && moved > 0, 'normalise: the crop screen\'s record is the normalised grid\'s nearest colour in every cell (' + off + ' cells are not; ' + moved + ' cells differ from the raw grid\'s nearest)');
    const img = O.readPNG(SCENE), c = g.crop, px = Buffer.alloc(c.w * c.h * 3);
    for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) { const s = ((c.y + y) * img.w + c.x + x) * img.bpp; px[(y * c.w + x) * 3] = img.px[s]; px[(y * c.w + x) * 3 + 1] = img.px[s + 1]; px[(y * c.w + x) * 3 + 2] = img.px[s + 2]; }
    const on = O.normalizeRGB(O.downscaleRGB({ w: c.w, h: c.h, bpp: 3, px }, 24, 48));
    let pd = 0; for (let i = 0; i < 1152; i++) if (g.pal[i] !== SBN.palette.nearest(on[3 * i], on[3 * i + 1], on[3 * i + 2])) pd++;
    R.say(pd <= 115, 'normalise: the oracle\'s own area average of the photo, normalised, gives the page\'s colour in all but ' + pd + ' of 1152 cells (at most 115: the canvas downscale drifts from the area average, risk 12)');
    R.say(errors.length === 0, 'normalise: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
  /* LEVELSR: the dev readout is the dev flag's alone; a player's crop screen never shows the rule that refused */
  {
    const { page } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base);
    await ready(page, { reveal: true });
    const d = await page.evaluate(() => window.SB_DEV.overlay().decodes);
    await (await page.$('#filechoose')).uploadFile(join(TMP, 'floor-tall.png'));
    await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 10000 }, d).catch(() => {});
    const np = await page.evaluate(() => Object.assign(window.SB_DEV.overlay(), { dev: document.getElementById('cropsay').textContent, shown: !document.getElementById('tighter').hidden }));
    R.say(np.needsCrop && np.dev === '', 'levels: without the dev flag the crop screen shows no readout (needsCrop ' + np.needsCrop + ', the readout "' + np.dev + '")');
    await page.close();
  }
  const { page, errors } = await newPage(browser, { width: 412, height: 915 });
  await gotoGame(page, srv.base);
  await ready(page, { reveal: true });
  const input = await page.$('#filechoose');
  await input.uploadFile(PHOTO);
  await page.waitForFunction(() => window.SB_DEV.screen() === 'crop' && window.SB_DEV.overlay().builds > 0, { timeout: 10000 }).catch(() => {});
  const o1 = await page.evaluate(() => window.SB_DEV.overlay());
  R.say(o1 && o1.builds > 0 && o1.solids > 0, 'the crop screen shows the pipeline\'s overlay (' + (o1 ? o1.builds + ' builds, ' + o1.solids + ' solid cells' : 'none') + ')');
  /* a real touch drags the box down: the overlay rebuilds and its solid count changes */
  /* the default crop spans the photo's height, so a real touch drags the box sideways */
  const box = await page.evaluate(() => { const r = document.getElementById('cropbox').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height }; });
  const f = await page.touchscreen.touchStart(box.x, box.y);
  for (let k = 1; k <= 8; k++) { await f.move(box.x - k * 6, box.y); await sleep(30); }
  await sleep(150);
  /* read while the finger is still down: the overlay follows the box as it moves, not only when it rests */
  const o2 = await page.evaluate(() => window.SB_DEV.overlay());
  await f.end();
  await sleep(200);
  R.say(o2.builds > o1.builds && o2.solids !== o1.solids && o2.full === false, 'dragging the box rebuilds the overlay as it moves, before the finger lifts, and its solid count changes (' + o1.solids + ' to ' + o2.solids + ', ' + o2.builds + ' builds, the box at x ' + o2.crop.x + ')');
  /* the same photo chosen again: the default crop, the room as painted. The wait is on the decode landing (the drag's
     own last rebuild satisfied a wait on builds, and Develop then raced the decode: 3 runs in 6 failed on 30 Oct) */
  const d0 = await page.evaluate(() => window.SB_DEV.overlay().decodes);
  await input.uploadFile(PHOTO);
  await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 10000 }, d0).catch(() => {});
  await tap(page, '#develop');
  await page.waitForFunction(() => window.SB_DEV.screen() === 'play', { timeout: 8000 }).catch(() => {});
  const lv = await page.evaluate(() => ({ s: window.SB_DEV.screen(), l: window.SB_DEV.level(), alive: window.SB_DEV.photoAlive(), tabs: window.SB_DEV.tabs() }));
  R.say(lv.s === 'play', 'Develop reaches the play screen through the reveal (' + lv.s + ')');
  R.say(lv.alive === false, 'the photo is released when the reveal ends (photoAlive ' + lv.alive + ')');
  writeFileSync(REC, JSON.stringify({ code: lv.l.code }));
  let node = null;
  try { node = JSON.parse(execFileSync('node', [join(GAME, 'harness.js'), '--record-json', REC], { encoding: 'utf8' }).trim().split('\n').pop()); } catch (e) { node = { error: String(e.message).slice(0, 200) }; }
  R.say(node && node.valid === true && node.exit === lv.l.exit && node.tabs === lv.tabs, 'the record validates and, built in Node, gives the page\'s exit and tabs (Node ' + JSON.stringify(node) + ', page exit ' + lv.l.exit + ' tabs ' + lv.tabs + ')');
  const store = await page.evaluate(() => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i), v = localStorage.getItem(k) || ''; out.push([k, v.length, v.includes('data:image')]); } return out; });
  R.say(store.every(([, n, img]) => n <= 8192 && !img), 'no localStorage value holds an image or is over 8 KB (' + (store.map(([k, n]) => k + ' ' + n).join(', ') || 'none stored') + ')');
  /* the race itself, forced: a retake whose decode lands after Develop is dropped, never pulling the player back to the
     crop nor releasing the photo the reveal shows (the room left by Pause and its card's Title: QUESTIONS Q94) */
  await leaveRoom(page);
  await page.waitForFunction(() => window.SB_DEV.screen() === 'title', { timeout: 5000 }).catch(() => {});
  const d1 = await page.evaluate(() => window.SB_DEV.overlay().decodes);
  await input.uploadFile(PHOTO);
  await page.waitForFunction(d => window.SB_DEV.overlay().decodes > d && window.SB_DEV.overlay().full, { timeout: 10000 }, d1).catch(() => {});
  await page.evaluate(() => { const dec = window.SB.capture.decode; window.SB.capture.decode = f => new Promise(r => setTimeout(r, 600)).then(() => dec(f)); });
  await input.uploadFile(PHOTO);
  await tap(page, '#develop');
  const raced = await page.evaluate(() => new Promise(r => setTimeout(() => r({ s: window.SB_DEV.screen(), alive: window.SB_DEV.photoAlive(), decodes: window.SB_DEV.overlay().decodes }), 1200)));
  R.say(raced.s !== 'crop' && raced.s !== 'title' && raced.decodes === d1 + 1, 'a retake decoding past Develop is dropped: the screen stays ' + raced.s + ' (not the crop), the late decode not shown (' + (raced.decodes - d1) + ' landed)');
  R.say(errors.length === 0, 'zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
  await page.close();
} finally {
  await browser.close();
  await srv.close();
}
R.finish();
