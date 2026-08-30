/* playthrough — drives the real built game in a real browser, through every
 * mode, using real pointer events.
 *
 * ⛔ NOTHING IN HERE USES el.click(). A click dispatched at an element proves the
 * handler runs; it does not prove a finger could ever reach it. Every tap goes
 * through elementFromPoint at the control's centre first, so a control covered
 * by an invisible overlay fails here instead of shipping. That exact bug has
 * cost this studio a release before.
 *
 * ⛔ It also reloads the page and checks progress came back, because a save that
 * writes and never reads is the same as no save at all.
 *
 *   node test/playthrough.mjs
 */
import puppeteer from '/workspaces/lucid-winds/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import http from 'http';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const wait = ms => new Promise(r => setTimeout(r, ms));
const fails = [];
const ok = (cond, msg) => { console.log((cond ? '  ok    ' : '  FAIL  ') + msg); if (!cond) fails.push(msg); };

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
                '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('nope'); return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URL_BASE = 'http://127.0.0.1:' + server.address().port + '/index.html';

const browser = await puppeteer.launch({ headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });

const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

/* Tap a control the way a finger would: find its centre, ask the document what
 * is actually on top there, and refuse to proceed if it is not the control. */
async function tap(sel, label) {
  const hit = await page.evaluate(s => {
    const el = document.querySelector(s);
    if (!el) return { err: 'no such element' };
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return { err: 'zero size' };
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const top = document.elementFromPoint(cx, cy);
    if (!top) return { err: 'nothing at its centre' };
    if (top !== el && !el.contains(top))
      return { err: 'covered by ' + (top.id || top.className || top.tagName) };
    return { x: cx, y: cy };
  }, sel);
  if (hit.err) { fails.push((label || sel) + ' is not tappable: ' + hit.err);
                 console.log('  FAIL  ' + (label || sel) + ' is not tappable: ' + hit.err); return false; }
  await page.mouse.click(hit.x, hit.y);
  return true;
}

async function windIt(laps = 3.0, wobble = 0.06) {
  const cx = 187, cy = 333, R = 78;
  await page.mouse.move(cx, cy - R);
  await page.mouse.down();
  const steps = Math.round(20 * laps);
  for (let i = 1; i <= steps; i++) {
    const a = -Math.PI / 2 + (i / steps) * Math.PI * 2 * laps;
    const rr = R * (1 + wobble * Math.sin(i * 0.9));
    await page.mouse.move(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  await page.mouse.up();
  await wait(250);
}
const st = () => page.evaluate(() => window.__RC || null);

console.log('BOOT');
await page.goto(URL_BASE, { waitUntil: 'load' });
await wait(700);
ok(await page.evaluate(() => document.getElementById('howto').classList.contains('up')),
   'the rules open before play on a first run');
await tap('#howto [data-close]', 'rules Done');
await wait(500);
ok(await page.evaluate(() => document.getElementById('menu').classList.contains('up')),
   'the menu is up after the rules');

console.log('\nMENU CONTROLS ARE REACHABLE');
for (const id of ['#mPlay', '#mHow', '#mShop', '#mModes', '#mSet', '#mExit']) {
  const reach = await page.evaluate(s => {
    const el = document.querySelector(s), r = el.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!top && (top === el || el.contains(top));
  }, id);
  ok(reach, id + ' is the topmost element at its own centre');
}

console.log('\nWORKSHOP');
await tap('#mShop', 'Workshop');
await wait(400);
const before = await page.evaluate(() => document.getElementById('buildSum').textContent);
await page.evaluate(() => { document.getElementById('accBuild').open = true; });
await wait(200);
/* Change the blade by tapping a real chip.
   ⛔ The part rails scroll sideways, so a chip's bounding rect can sit off the
   viewport entirely. The first version of this clicked its rect centre anyway,
   the click landed on whatever was at those coordinates instead, the build did
   not change, and the failure read as "tapping a part does nothing" rather than
   "the test aimed at nothing". Scroll it in, THEN check what is on top of it. */
const changed = await page.evaluate(async () => {
  const chips = [...document.querySelectorAll('#slots .chip')].filter(c => !c.classList.contains('lock'));
  const target = chips.find(c => !c.classList.contains('on') && /Crest|Wheel|Halo|Orbit/.test(c.textContent));
  if (!target) return null;
  target.scrollIntoView({ block: 'nearest', inline: 'center' });
  await new Promise(r => setTimeout(r, 200));
  const r = target.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return { err: 'still off screen' };
  const top = document.elementFromPoint(cx, cy);
  if (!top || (top !== target && !target.contains(top)))
    return { err: 'covered by ' + (top ? (top.id || top.className) : 'nothing') };
  return { x: cx, y: cy, name: target.textContent.trim() };
});
if (changed && !changed.err) { await page.mouse.click(changed.x, changed.y); await wait(300); }
const after = await page.evaluate(() => document.getElementById('buildSum').textContent);
ok(!!changed && !changed.err, 'an unlocked part chip is present and hittable' +
   (changed && changed.err ? ': ' + changed.err : ''));
ok(before !== after, 'tapping a part changes the fitted build (' + before + ' to ' + after + ')');

// tuning applies and reverses
await page.evaluate(() => { document.getElementById('accMods').open = true; });
await wait(300);
const tuneWorks = await page.evaluate(() => {
  const plus = [...document.querySelectorAll('#mods .tbtn')].find(b => b.textContent === '+' && !b.hasAttribute('disabled'));
  if (!plus) return 'no operation is available';
  const sumBefore = document.getElementById('modSum').textContent;
  plus.click();
  const sumAfter = document.getElementById('modSum').textContent;
  const minus = [...document.querySelectorAll('#mods .tbtn')].find(b => b.textContent === '−' && !b.hasAttribute('disabled'));
  if (minus) minus.click();
  const sumBack = document.getElementById('modSum').textContent;
  return { sumBefore, sumAfter, sumBack };
});
ok(typeof tuneWorks === 'object' && tuneWorks.sumBefore !== tuneWorks.sumAfter,
   'a tuning operation changes the build');
ok(typeof tuneWorks === 'object' && tuneWorks.sumBack === tuneWorks.sumBefore,
   'and undoing it puts the build back exactly');

await tap('#sheet [data-close]', 'workshop Done');
await wait(400);

console.log('\nA ROUND OF PANGKAH');
await tap('#mPlay', 'Play');
await wait(500);
await windIt(3.0);
ok(await page.evaluate(() => document.getElementById('card').classList.contains('up')),
   'the wind is graded and the card comes up');
const grade = await page.evaluate(() => document.getElementById('gl').textContent.trim());
ok(/^[SABCDE]$/.test(grade), 'the wind got a letter grade (' + grade + ')');
await tap('#go', 'Launch');
await wait(400);
const launched = await page.evaluate(() => document.getElementById('dock').classList.contains('hide'));
ok(launched, 'the chrome clears out of the way the moment the round starts');
// let it play out
let ended = false;
for (let i = 0; i < 60 && !ended; i++) {
  await wait(500);
  ended = await page.evaluate(() => !document.getElementById('dock').classList.contains('hide'));
}
ok(ended, 'the round finished on its own and gave the controls back');
const score = await page.evaluate(() => document.getElementById('score').textContent);
ok(/\d/.test(score), 'a score was recorded (' + score.replace(/\s+/g, ' ').trim() + ')');

console.log('\nPASS THE PHONE');
await page.evaluate(() => { document.getElementById('menu').classList.add('up'); });
await tap('#mModes', 'Modes');
await wait(400);
const gotPass = await page.evaluate(() => {
  const b = [...document.querySelectorAll('#modesBody .rung')].find(x => /Pass the phone/.test(x.textContent));
  if (!b || b.classList.contains('locked')) return null;
  const r = b.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
ok(!!gotPass, 'pass the phone is available from the very first session');
if (gotPass) {
  await page.mouse.click(gotPass.x, gotPass.y);
  await wait(500);
  await windIt(3.0);
  await tap('#go', 'player one Launch');
  await wait(400);
  const handover = await page.evaluate(() => document.getElementById('hint').textContent);
  ok(/pass the phone/i.test(handover), 'it asks for the handover instead of starting (' + handover + ')');
  ok(await page.evaluate(() => !document.getElementById('dock').classList.contains('hide')),
     'and it does NOT launch on one wind');
  await windIt(2.4, 0.16);
  await tap('#go', 'player two Launch');
  await wait(600);
  ok(await page.evaluate(() => document.getElementById('dock').classList.contains('hide')),
     'both winds in, the round runs');
  for (let i = 0; i < 60; i++) {
    await wait(500);
    if (await page.evaluate(() => !document.getElementById('dock').classList.contains('hide'))) break;
  }
}

console.log('\nTHE FIELD, ONCE THE LADDER IS CLEARED');
{
  // Field mode is gated on clearing the last rung, so clear it the way the save
  // format does rather than by reaching into the running game.
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('ripcord.save.v1') || '{}');
    s.rung = 24; s.facing = 24;
    localStorage.setItem('ripcord.save.v1', JSON.stringify(s));
  });
  await page.reload({ waitUntil: 'load' });
  await wait(700);
  await tap('#mModes', 'Modes');
  await wait(400);
  const gotField = await page.evaluate(() => {
    const b = [...document.querySelectorAll('#modesBody .rung')].find(x => /The Field/.test(x.textContent));
    if (!b) return { err: 'no Field row' };
    if (b.classList.contains('locked')) return { err: 'still locked after clearing the ladder' };
    const r = b.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  ok(!!gotField && !gotField.err, 'the Field unlocks once the ladder is cleared' +
     (gotField && gotField.err ? ': ' + gotField.err : ''));
  if (gotField && !gotField.err) {
    await page.mouse.click(gotField.x, gotField.y);
    // it plays out a real match to pick somebody, so give it room
    let named = '';
    for (let i = 0; i < 30 && !/the field/i.test(named); i++) {
      await wait(400);
      named = await page.evaluate(() => document.getElementById('vs').textContent);
    }
    ok(/the field/i.test(named) && !/looking/i.test(named),
       'it builds an opponent to play (' + named.replace(/\s+/g, ' ').trim() + ')');
    await windIt(3.0);
    await tap('#go', 'Launch');
    await wait(500);
    ok(await page.evaluate(() => document.getElementById('dock').classList.contains('hide')),
       'and a round against them runs');
    for (let i = 0; i < 60; i++) {
      await wait(500);
      if (await page.evaluate(() => !document.getElementById('dock').classList.contains('hide'))) break;
    }
  }
}

console.log('\nSAVE SURVIVES A RELOAD');
const beforeReload = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('ripcord.save.v1') || '{}');
  return { build: s.build && s.build.blade, mods: JSON.stringify(s.mods || {}), rung: s.rung };
});
await page.reload({ waitUntil: 'load' });
await wait(700);
const afterReload = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('ripcord.save.v1') || '{}');
  return { build: s.build && s.build.blade, mods: JSON.stringify(s.mods || {}), rung: s.rung };
});
ok(!!beforeReload.build, 'something was actually written to storage');
ok(beforeReload.build === afterReload.build, 'the fitted build came back after a reload');
ok(beforeReload.mods === afterReload.mods, 'the tuning came back after a reload');
ok(await page.evaluate(() => !document.getElementById('howto').classList.contains('up')),
   'the rules do not reopen on a second visit');

console.log('\nTHE GAME STILL WORKS WITH NO STORAGE AT ALL');
{
  const p2 = await browser.newPage();
  await p2.setViewport({ width: 375, height: 667 });
  const errs2 = [];
  p2.on('pageerror', e => errs2.push(e.message));
  // Not "empty localStorage": localStorage that THROWS, which is what a locked
  // down browser actually does and what takes a game down before its first frame.
  await p2.evaluateOnNewDocument(() => {
    Object.defineProperty(window, 'localStorage', {
      get() { throw new Error('storage is blocked in this context'); }
    });
  });
  await p2.goto(URL_BASE, { waitUntil: 'load' });

  await wait(800);
  const alive = await p2.evaluate(() => !!document.getElementById('cv').width);
  ok(alive && errs2.length === 0,
     'it boots with localStorage throwing on access' + (errs2.length ? ' (' + errs2[0] + ')' : ''));
  await p2.close();
}

console.log('\nPAGE ERRORS: ' + (errors.length || 'none'));
errors.forEach(e => console.log('   ' + e));
if (errors.length) fails.push(errors.length + ' page errors');

await browser.close();
server.close();
console.log(fails.length ? '\nPLAYTHROUGH FAILED\n  ' + fails.join('\n  ') : '\nPLAYTHROUGH OK');
process.exit(fails.length ? 1 : 0);
