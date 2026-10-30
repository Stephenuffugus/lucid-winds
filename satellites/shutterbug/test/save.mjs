/* Browser gate `save` (BUILD-PLAN.md T1.10, section 2.4): the mirror toggled in Settings with a REAL tap survives a
 * reload (the strip mirrored); a cleared room appears in the save's recent rooms and on the title and survives a reload
 * (the climb skipped with SB_DEV.goto('exit'), the gates' one named camera liberty); 25 rooms added keep 20 and the
 * document under 64 KB; a corrupt blob boots the game on the title with the sentence shown and the string set aside in
 * quarantine; exactly one key not prefixed sws_ is written, shutterbug.v1; with setItem throwing (quota, private mode)
 * the game runs on with zero page errors.
 *
 * Watched red by SECOND_KEY, WRITE_25_ROOMS and SETITEM_UNGUARDED. */
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
  await tap(page, '#setmirror');
  await tap(page, '#settitle');
  await page.reload(); await ready(page);
  await page.evaluate(() => window.SB_DEV.hold(true));
  await tap(page, '#sample');
  const mirrored = await page.evaluate(() => document.getElementById('strip').classList.contains('mirror'));
  R.say(mirrored, 'mirror toggled in Settings with a real tap, the page reloaded: the strip is mirrored');

  await page.evaluate(() => { window.SB_DEV.goto('exit'); window.SB_DEV.step(2); });
  const cleared = await page.evaluate(() => ({ screen: window.SB_DEV.screen(), recent: window.SB.save.doc.recent.length }));
  await page.evaluate(() => window.SB.save.flush());
  await page.reload(); await ready(page);
  const after = await page.evaluate(() => ({ recent: window.SB.save.doc.recent.length, shown: !document.getElementById('recent').hidden, thumbs: document.querySelectorAll('#recentlist button').length }));
  R.say(cleared.screen === 'clear' && cleared.recent === 1 && after.recent === 1 && after.shown && after.thumbs === 1, 'a cleared room is in the recent rooms (' + cleared.recent + ') and on the title after a reload (' + after.thumbs + ' thumbnail)');

  const big = await page.evaluate(list => { for (const j of list) window.SB.save.addRecent(window.SB.record.fromJSON(j)); window.SB.save.flush(); const raw = localStorage.getItem('shutterbug.v1'); return { n: JSON.parse(raw).recent.length, size: raw.length }; }, recs.slice(0, 25));
  R.say(big.n === 20 && big.size < 65536, '25 rooms added keep 20 (' + big.n + ') and the document at ' + big.size + ' bytes (under 64 KB)');

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
