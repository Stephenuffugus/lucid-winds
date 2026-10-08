/* SHOTS (H1): the states a player sees, at the four fixtures, on a FRESH save and on a RETURNING save.
   A green gate is not a look: these are for opening and naming faults.
   Run: node satellites/hues/dev/shots.mjs [outDir=/tmp/hues-h1] [--fixtures=360x640,360x740,412x740,412x915] [--save=fresh,returning]
   Files: <outDir>/<w>x<h>-<save>/NN-state.png at 2x, plus errors.txt per run. */
import { mkdirSync, writeFileSync } from 'fs';
import { launch, open, close, arg, tap, tapText, startMode, guess, lock, next, playing, playSet, toMenu, waitFor, sleep, presentState } from './harness.mjs';

const OUT = process.argv.slice(2).find((a) => !a.startsWith('--')) || '/tmp/hues-h1';
const FIX = (arg('fixtures', '360x640,360x740,412x740,412x915')).split(',').map((s) => s.split('x').map(Number));
const SAVES = (arg('save', 'fresh,returning')).split(',');
const d = new Date(); const day = (n) => { const x = new Date(d); x.setDate(x.getDate() - n); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
const RETURNING = { hues_rules: '1', 'hm.coins': '1240', 'hm.owned': 'hairline,bevel,gold,clay_frog', 'hm.equip': 'clay_frog', 'hm.diff': 'normal', 'hm.sound': '1',
  'hm.endless.best': '6420', 'hm.daily.best': '4410', 'hm.daily.streak': '4', 'hm.daily.last': day(1), 'hm.daily.done': day(1), 'hm.daily.donescore': '3980',
  sws_music_progress: JSON.stringify({ hues: { first: Date.now() - 5 * 864e5, days: [day(3), day(2), day(1)], sessions: 4, secs: 600, milestones: 0, unlocked: [] } }) };

const browser = await launch();
for (const [w, h] of FIX) for (const save of SAVES) {
  const dir = OUT + '/' + w + 'x' + h + '-' + save; mkdirSync(dir, { recursive: true });
  const page = await open(browser, { w, h, dpr: 2, seed: save === 'returning' ? RETURNING : null, settleMs: 1600 });
  const shot = async (name) => { await page.screenshot({ path: dir + '/' + name + '.png' }); };
  const log = [];
  try {
    await shot('01-menu');
    if (save === 'fresh') { await tap(page, '[data-mode="daily"]'); await sleep(500); await shot('02-rules'); await tap(page, '#rulesGo'); }
    else { await tap(page, '#menuRules'); await sleep(500); await shot('02-rules'); await tap(page, '#rulesGo'); await sleep(300); await tap(page, '[data-mode="daily"]'); }
    await playing(page); await sleep(700); await shot('03-daily-play');
    await guess(page, 'close'); await lock(page); await shot('04-review');
    await next(page); await playSet(page, ['exact', 'far', 'close', 'close']);
    await shot('05-daily-result');
    await tapText(page, '#resActions', 'Share'); await sleep(800); await shot('06-share');
    await tap(page, '#shareCloseBtn'); await sleep(300);
    await toMenu(page); await sleep(1200); await shot('07-menu-after-set');
    const card = await page.evaluate(() => { const c = document.getElementById('sws-music-card'); return !!c && getComputedStyle(c).display !== 'none'; });
    log.push('music card after the set: ' + card);
    if (card) { await tap(page, '#sws-music-later'); await sleep(400); }
    await tap(page, '#shopLink'); await sleep(700); await shot('08-shop'); await toMenu(page);
    await startMode(page, 'endless'); await guess(page, 'far'); await lock(page); await shot('09-endless-life-lost');
    await next(page); await playing(page); await sleep(500); await shot('10-endless-level2');
    await toMenu(page);
    await startMode(page, 'versus'); await sleep(500); await shot('11-versus-p1');
    await playSet(page, ['close', 'close', 'close', 'close', 'close']); await shot('12-versus-handoff');
  } catch (e) { log.push('STOPPED at state ' + (await presentState(page).catch(() => '?')) + ': ' + e.message.split('\n')[0]); }
  log.push('page errors: ' + (page._errors.length ? page._errors.join(' | ') : 'none'));
  writeFileSync(dir + '/errors.txt', log.join('\n') + '\n');
  console.log(w + 'x' + h + ' ' + save + ': ' + log.join('; '));
  await close(page);
}
await browser.close();
process.exit(0);
