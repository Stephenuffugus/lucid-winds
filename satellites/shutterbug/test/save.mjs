/* Browser gate `save` (BUILD-PLAN.md T1.10, section 2.4): the mirror toggled in Settings with a REAL tap survives a
 * reload (the strip mirrored); a cleared room appears in the save's recent rooms and on the title and survives a reload
 * (the climb skipped with SB_DEV.goto('exit'), the gates' one named camera liberty); 25 rooms added keep 20 and the
 * document under 64 KB; a corrupt blob boots the game on the title with the sentence shown and the string set aside in
 * quarantine; exactly one key not prefixed sws_ is written, shutterbug.v1; with setItem throwing (quota, private mode)
 * the game runs on with zero page errors.
 *
 * Settings by real input (the M1 review): sound off and reduced motion On survive the reload with the mirror; the next
 * reveal is a crossfade; a real jump is asked for and schedules no voice; the export text, pasted into a wiped save
 * and loaded with a real tap, brings the same document back, and garbage is refused in place.
 *
 * Every Settings control is 48 px tall or more.
 *
 * Watched red by SECOND_KEY, WRITE_25_ROOMS, SETITEM_UNGUARDED, SOUND_TOGGLE_MISWIRED, MOTION_IGNORED, IMPORT_REFUSES
 * and SELECT_44PX. */
import { serve, launch, newPage, gotoGame, ready, reporter, tap, GAME } from './harness.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const R = reporter('SAVE');
const srv = await serve();
const browser = await launch();
const SYN = join(GAME, 'fixtures', 'synthetic');
const recs = [];
for (const f of readdirSync(SYN).sort()) if (f.endsWith('.json')) { const j = JSON.parse(readFileSync(join(SYN, f), 'utf8')).record; recs.push(Object.assign({}, j, { mode: 0 }), Object.assign({}, j, { mode: 1 })); }
try {
  const { page, errors } = await newPage(browser, { width: 412, height: 915 });
  await gotoGame(page, srv.base); await ready(page);
  await page.evaluate(() => localStorage.clear()); await page.reload(); await ready(page);

  await tap(page, '#settingsbtn');
  const fresh = await page.evaluate(() => document.getElementById('setperf').textContent);
  R.say(fresh === 'Performance: not measured yet, last room not played yet', 'a fresh Settings says so in words, no dash: "' + fresh + '"');
  await tap(page, '#setmirror');
  /* the sound and the reduced motion override, by real input too (the M1 review: only the mirror was ever driven, and
     the audio gate turned the sound off through SB.audio.setSound) */
  await tap(page, '#setsound');
  /* every control on Settings is a 48 px target (the M1 review: the Reduced motion select was 44) */
  const short = await page.evaluate(() => [...document.querySelectorAll('#settings button, #settings select, #settings label.row')].filter(el => !el.hidden && el.getBoundingClientRect().height > 0 && el.getBoundingClientRect().height < 48).map(el => (el.id || el.tagName) + ' ' + el.getBoundingClientRect().height.toFixed(0)));
  R.say(short.length === 0, 'every Settings control is 48 px tall or more' + (short.length ? ' (' + short.join(', ') + ')' : ''));
  await page.evaluate(() => document.getElementById('setmotion').scrollIntoView({ block: 'center' }));
  await page.select('#setmotion', 'on');
  await tap(page, '#settitle');
  await page.reload(); await ready(page);
  const st0 = await page.evaluate(() => structuredClone(window.SB.save.doc.settings));
  R.say(st0.mirror === true && st0.sound === false && st0.reducedMotion === true, 'mirror on, sound off and reduced motion On, set in Settings by real input, survive a reload (' + JSON.stringify(st0) + ')');
  /* the reveal under the override: a crossfade (the loop free, so the reveal's clock runs) */
  await page.evaluate(() => window.SB_DEV.revealSkip(false));
  await tap(page, '#sample');
  await page.waitForFunction(() => window.SB_DEV.screen() === 'play', { timeout: 5000 }).catch(() => {});
  await page.evaluate(() => window.SB_DEV.hold(true));
  const rv = await page.evaluate(() => window.SB_DEV.perf().reveal);
  R.say(!!rv && rv.reduced === true && rv.end - rv.start < 600, 'reduced motion On in Settings makes the next reveal a crossfade (reduced ' + (rv && rv.reduced) + ', ' + (rv ? (rv.end - rv.start).toFixed(0) : '?') + ' ms)');
  const mirrored = await page.evaluate(() => document.getElementById('strip').classList.contains('mirror'));
  R.say(mirrored, 'mirror toggled in Settings with a real tap, the page reloaded: the strip is mirrored');
  /* the sound off: the context running, a real jump is asked for and no voice is scheduled */
  let ctx = 'none';
  for (let k = 0; k < 30 && ctx !== 'running'; k++) { await new Promise(r => setTimeout(r, 100)); ctx = await page.evaluate(() => window.SB_DEV.audioState()); }
  await page.evaluate(() => { for (let k = 0; k < 120 && !window.SB_DEV.state().hero.ground; k++) window.SB_DEV.step(1); window.SB_DEV.step(2); });
  const v0 = await page.evaluate(() => ({ n: window.SB_DEV.audioEvents().length, asked: window.SB_DEV.audioPlayed().jump || 0 }));
  await tap(page, '#btnA'); await page.evaluate(() => window.SB_DEV.step(1));
  const v1 = await page.evaluate(() => ({ n: window.SB_DEV.audioEvents().length, asked: window.SB_DEV.audioPlayed().jump || 0, up: !window.SB_DEV.state().hero.ground }));
  R.say(ctx === 'running' && v1.up && v1.asked === v0.asked + 1 && v1.n === v0.n, 'sound off in Settings: the context ' + ctx + ', a real jump is asked for (' + (v1.asked - v0.asked) + ') and schedules no voice (' + (v1.n - v0.n) + ')');

  await page.evaluate(() => { window.SB_DEV.goto('exit'); window.SB_DEV.step(2); });
  const cleared = await page.evaluate(() => ({ screen: window.SB_DEV.screen(), recent: window.SB.save.doc.recent.length }));
  await page.evaluate(() => window.SB.save.flush());
  await page.reload(); await ready(page);
  const after = await page.evaluate(() => ({ recent: window.SB.save.doc.recent.length, shown: !document.getElementById('recent').hidden, thumbs: document.querySelectorAll('#recentlist button').length }));
  R.say(cleared.screen === 'clear' && cleared.recent === 1 && after.recent === 1 && after.shown && after.thumbs === 1, 'a cleared room is in the recent rooms (' + cleared.recent + ') and on the title after a reload (' + after.thumbs + ' thumbnail)');

  const big = await page.evaluate(list => { for (const j of list) window.SB.save.addRecent(window.SB.record.fromJSON(j)); window.SB.save.flush(); const raw = localStorage.getItem('shutterbug.v1'); return { n: JSON.parse(raw).recent.length, size: raw.length }; }, recs.slice(0, 25));
  R.say(big.n === 20 && big.size < 65536, '25 rooms added keep 20 (' + big.n + ') and the document at ' + big.size + ' bytes (under 64 KB)');

  /* export and import (T1.10) through Settings: the export text read, the save wiped, the text pasted and Load the
     pasted save tapped with the confirm accepted: the page reloads to the same document; garbage is refused in place */
  await tap(page, '#settingsbtn');
  const exp = await page.evaluate(() => document.getElementById('setexport').value);
  await page.evaluate(() => localStorage.clear()); await page.reload(); await ready(page);
  const wiped = await page.evaluate(() => window.SB.save.doc.recent.length);
  await tap(page, '#settingsbtn');
  await page.evaluate(t => { window.confirm = () => true; document.getElementById('setimport').value = t; document.getElementById('setimportgo').scrollIntoView({ block: 'center' }); }, exp);
  await Promise.all([page.waitForNavigation({ waitUntil: 'load', timeout: 15000 }).catch(() => {}), tap(page, '#setimportgo')]);
  await ready(page);
  const back = await page.evaluate(() => JSON.stringify(window.SB.save.doc));
  R.say(wiped === 0 && back === JSON.stringify(JSON.parse(exp).save), 'the export text pasted into a wiped save and loaded with a real tap brings the same document back (' + JSON.parse(back).recent.length + ' recent rooms, ' + back.length + ' bytes)');
  await tap(page, '#settingsbtn');
  await page.evaluate(() => { window.confirm = () => true; document.getElementById('setimport').value = 'not a save'; document.getElementById('setimportgo').scrollIntoView({ block: 'center' }); });
  await tap(page, '#setimportgo');
  const refused = await page.evaluate(() => ({ text: document.getElementById('setimport').value, screen: window.SB_DEV.screen(), recent: window.SB.save.doc.recent.length }));
  R.say(refused.text === 'That save did not open.' && refused.screen === 'settings' && refused.recent === JSON.parse(back).recent.length, 'garbage pasted and loaded is refused in place (' + refused.text + '), the save untouched');
  await tap(page, '#settitle');

  await page.evaluate(() => localStorage.setItem('shutterbug.v1', '{not json'));
  await page.reload(); await ready(page);
  const corrupt = await page.evaluate(() => ({ title: document.getElementById('title').classList.contains('on'), shown: !document.getElementById('codemsg').hidden, msg: document.getElementById('codemsg').textContent, q: window.SB.save.doc.quarantine, stored: JSON.parse(localStorage.getItem('shutterbug.v1')).quarantine }));
  R.say(corrupt.title && corrupt.shown && corrupt.msg === 'A damaged save was set aside. You can copy it from Settings.' && corrupt.q === '{not json' && corrupt.stored === '{not json', 'a corrupt blob boots on the title with the sentence shown and the string set aside in quarantine under the same key');

  const keys = await page.evaluate(() => Object.keys(localStorage).filter(k => !k.startsWith('sws_')));
  R.say(keys.length === 1 && keys[0] === 'shutterbug.v1', 'exactly one key not prefixed sws_ is written: ' + keys.join(', '));
  R.say(errors.length === 0, 'zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));

  const b = await newPage(browser, { width: 360, height: 780 });
  await b.page.evaluateOnNewDocument(() => { Storage.prototype.setItem = function () { throw new Error('QuotaExceededError'); }; });
  await gotoGame(b.page, srv.base); await ready(b.page);
  await b.page.evaluate(() => window.SB_DEV.hold(true));
  await tap(b.page, '#sample');
  await b.page.evaluate(() => { window.SB_DEV.goto('exit'); window.SB_DEV.step(2); window.SB.save.doc.settings.mirror = true; window.SB.save.commit(); });
  await new Promise(r => setTimeout(r, 600));
  const runs = await b.page.evaluate(() => window.SB_DEV.screen());
  R.say(runs === 'clear' && b.errors.length === 0, 'with setItem throwing the game runs on (a room clears, the save is written) with zero page errors' + (b.errors.length ? ' (' + b.errors.join(' ; ') + ')' : ''));
} finally { await browser.close(); await srv.close(); }
R.finish();
