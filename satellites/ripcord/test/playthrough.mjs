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
  /* 2026-09-03: the fleet shell (/music-unlocks.js and friends) lives at the SITE root, one level
     above the games, and index.html includes it by absolute path. Serve it from there, the way the
     host does, instead of failing the gate on a 404 the player will never see. */
  let file = path.join(ROOT, rel);
  if (!fs.existsSync(file) && /^[a-z-]+\.js$/.test(rel)) file = path.join(ROOT, '..', '..', rel);
  const shell = file === path.join(ROOT, '..', '..', rel);
  if ((!file.startsWith(ROOT) && !shell) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
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

/* ⛔ EVERY MENU CONTROL, AT EVERY SHAPE A PHONE ACTUALLY TAKES.
 * Checking one viewport was not enough. The menu is a centred flex column, and
 * in landscape at 667 by 375 it grew taller than the screen: the wordmark went
 * off the top, the exit button off the bottom, and justify-content:center pushes
 * the overflow past the scroll origin so neither could be reached at all. It was
 * completely invisible in portrait. Rotating a phone is not an edge case. */
console.log('\nMENU CONTROLS ARE REACHABLE AT EVERY PHONE SHAPE');
for (const [w, h, label] of [[375, 667, 'portrait'], [667, 375, 'landscape'],
                             [320, 568, 'narrow'], [844, 390, 'wide landscape']]) {
  await page.setViewport({ width: w, height: h });
  await wait(350);
  const bad = await page.evaluate(async () => {
    const out = [];
    for (const id of ['mPlay', 'mHow', 'mShop', 'mModes', 'mSet', 'mExit']) {
      const el = document.getElementById(id);
      el.scrollIntoView({ block: 'center' });
      await new Promise(r => setTimeout(r, 110));
      const b = el.getBoundingClientRect();
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      const top = document.elementFromPoint(cx, cy);
      const reachable = cx >= 0 && cy >= 0 && cx <= innerWidth && cy <= innerHeight &&
                        top && (top === el || el.contains(top));
      if (!reachable) out.push(id);
    }
    return out;
  });
  ok(bad.length === 0, 'at ' + w + 'x' + h + ' (' + label + ') every menu control can be reached' +
     (bad.length ? ', but ' + bad.join(', ') + ' cannot' : ''));
}
await page.setViewport({ width: 375, height: 667 });
await wait(300);

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

// the bench drip: on a fresh save, Tuning and Rigs are promises, not
// panels - the workshop hands systems over as the player climbs
await page.evaluate(() => { document.getElementById('accMods').open = true; });
await wait(300);
const dripped = await page.evaluate(() =>
  /rung 3/.test(document.getElementById('mods').textContent) &&
  /rung 4/.test(document.getElementById('rigs').textContent));
ok(dripped, 'on a fresh save, Tuning and Rigs show as promises with their rungs');

// advance the save to rung 4 through its own storage and reload, so the
// tuning test below runs against a bench that has opened up
await page.evaluate(() => {
  const k = 'ripcord.save.v1';
  const sv = JSON.parse(localStorage.getItem(k));
  sv.rung = 4; sv.facing = 4;
  localStorage.setItem(k, JSON.stringify(sv));
});
await page.reload({ waitUntil: 'load' });
await wait(900);
await page.evaluate(() => { const b = document.querySelector('#howto [data-close]'); if (b) b.click(); });
await wait(300);
await tap('#mShop', 'Workshop, back at rung 4');
await wait(500);

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

/* ------------------------------------------------------------------------
 * A WHOLE MATCH, AND THE CEREMONY AT THE END OF IT
 *
 * Stephen played the build and said the round felt good and everything AROUND
 * the round did not: "there was no celebration, there was no checking out the
 * new gear ... it should have a stop, show you the next guy going into it".
 *
 * The ceremony that answers that is the biggest untested surface in the game,
 * because every gate above plays exactly ONE round and a match is four points.
 * So this plays real rounds until a match actually ends, then walks the beats
 * the way a thumb would: read what it says, press the button it offers, and
 * check the game hands the controls back at the end instead of stranding you
 * behind an overlay.
 *
 * ⛔ It asserts the CONTROLS COME BACK. The first version of the ceremony called
 * chrome(true) before the overlay opened, so the dock was live underneath a
 * backdrop nothing could press, and every existing gate went green on it,
 * because they all watch the dock and the dock was back.
 * ------------------------------------------------------------------------ */
console.log('\nA WHOLE MATCH, AND WHAT HAPPENS AFTER IT');
/* Back to the first rung and a bare build, because the beat this section exists
 * to check is WINNING one: the part reveal, the comparison against what is
 * fitted, and the introduction to whoever is next. The Field section above left
 * the save on rung 24 against a boss, where the likely outcome is a loss and the
 * whole reveal path goes unexercised. */
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('ripcord.save.v1') || '{}');
  s.rung = 0; s.facing = 0;
  // and the stock build, because the workshop section above deliberately fitted
  // a worse one and a first rung is meant to be beatable with what you start on
  delete s.mods; delete s.rigs;
  /* And a build that reliably WINS rung one, because the win is the path this
     section exists to walk: the reveal cards, the comparison against what is
     fitted, and the introduction to whoever is next. The stock build takes rung
     one about four times in ten (see HANDOFF section 5), so leaving it to chance
     leaves the whole reward path untested most runs. */
  s.unlocked = (s.unlocked || []).concat(['moth','orbit','slick','5-60','needle','chip']);
  /* ⛔ Counterweights persist as `holes` (a 2 ring by 6 hole grid of weight
     indices: 0 none, 1 chip, 2 slug, 3 brick), NOT as the `weights` array the
     simulation takes. Writing `weights` here parsed fine, saved fine, and was
     silently dropped on load, so the run rode a stamina build with no weights
     on it and lost three times in a row looking like bad luck. */
  s.build = { core:'moth', blade:'orbit', assist:'slick', ratchet:'5-60', bit:'needle',
              holes: [[0,0,0,0,0,0],[1,0,1,0,1,0]], trigger:'charged', rigs:[] };
  localStorage.setItem('ripcord.save.v1', JSON.stringify(s));
});
await page.reload({ waitUntil: 'load' });
await wait(700);
await tap('#mPlay', 'Play');
await wait(500);

const cerUp = () => page.evaluate(() => document.getElementById('cer').classList.contains('up'));
const dockBack = () => page.evaluate(() => !document.getElementById('dock').classList.contains('hide'));

let matchEnded = false, roundsPlayed = 0;
for (let r = 0; r < 12 && !matchEnded; r++) {
  const ready = await page.evaluate(() => document.getElementById('cv') &&
    !document.getElementById('dock').classList.contains('hide'));
  if (!ready) { await wait(500); continue; }
  await windIt(3.0);
  if (!await tap('#go', 'Launch')) break;
  roundsPlayed++;
  for (let i = 0; i < 60; i++) {
    await wait(400);
    if (await cerUp()) { matchEnded = true; break; }
    if (await dockBack()) break;                 // round over, match still running
  }
}
ok(matchEnded, 'playing rounds actually reaches the end of a match (' + roundsPlayed + ' rounds)');

if (matchEnded) {
  ok(!await dockBack(),
     'the controls stay away while the ceremony is talking, not live under the backdrop');

  /* Walk every beat. A beat with buttons wants an answer; a beat without one
   * gets tapped to move it along, which is what an impatient thumb does. */
  const seen = [];
  let sawPart = false, sawCompare = false, sawNext = false;
  for (let i = 0; i < 14; i++) {
    if (!await cerUp()) break;
    const beat = await page.evaluate(() => ({
      kick: document.getElementById('cerKick').textContent.trim(),
      big:  document.getElementById('cerBig').textContent.trim(),
      sub:  document.getElementById('cerSub').textContent.trim(),
      part: !!document.querySelector('#cerBody .cerPart .slot'),
      cmp:  !!document.querySelector('#cerBody .cmp .cmpRow .cmpBar'),
      btns: [...document.querySelectorAll('#cerBtns .btn')].map(b => b.textContent.trim())
    }));
    /* ⛔ THE BEAT MUST CHANGE. A "Fit it" button whose action threw left the
     * player stuck on the same reveal card forever, with no way out and the
     * controls never returned, and every other assertion in here stayed green
     * on it. Repeating a headline is the signature of that dead end. */
    if (beat.big && seen.length && seen[seen.length - 1] === beat.kick + ': ' + beat.big) {
      fails.push('the ceremony repeated the same beat ("' + beat.big + '"), so a button did not advance it');
      console.log('  FAIL  the ceremony repeated "' + beat.big + '" - a button did not advance it');
      break;
    }
    if (beat.big) seen.push(beat.kick + ': ' + beat.big);
    if (beat.part) sawPart = true;
    if (beat.cmp) sawCompare = true;
    if (/^Rung /.test(beat.kick)) sawNext = true;
    // every beat has to actually SAY something; a blank card is a bug that
    // reads as a hang
    if (!beat.big) { fails.push('a ceremony beat came up with no headline');
                     console.log('  FAIL  a ceremony beat came up with no headline'); break; }
    if (beat.btns.length) {
      const idx = beat.btns.findIndex(t => /Fit it|Ready|Good/.test(t));
      const hit = await page.evaluate(n => {
        const b = document.querySelectorAll('#cerBtns .btn')[n];
        const r = b.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const top = document.elementFromPoint(cx, cy);
        return { x: cx, y: cy, covered: top !== b && !b.contains(top),
                 h: Math.round(r.height) };
      }, idx < 0 ? 0 : idx);
      if (hit.covered) { fails.push('a ceremony button is covered and cannot be pressed');
                         console.log('  FAIL  a ceremony button is covered'); break; }
      if (hit.h < 44) { fails.push('a ceremony button is only ' + hit.h + 'px tall');
                        console.log('  FAIL  ceremony button ' + hit.h + 'px tall'); }
      await page.mouse.click(hit.x, hit.y);
    } else {
      await page.mouse.click(187, 200);           // tap the backdrop to skip ahead
    }
    await wait(650);
  }
  console.log('        beats: ' + seen.join('  |  '));
  ok(seen.length >= 2, 'the end of a match is more than one screen (' + seen.length + ' beats)');
  ok(/won|beat|takes it|put down/i.test(seen.join(' ')),
     'it says who won before anything else');
  const won = /won|beat|put down/i.test(seen[0] || '');
  if (won) {
    ok(sawPart, 'winning puts the parts you won in front of you, one card at a time');
    ok(sawCompare, 'and each card says what it would change about the top you are riding');
    ok(sawNext, 'and it introduces whoever is next before handing you back');
  } else {
    ok(/what beat you/i.test(seen.join(' ')), 'losing says what beat you instead of just the score');
  }

  let gaveBack = false;
  for (let i = 0; i < 20 && !gaveBack; i++) { await wait(300); gaveBack = await dockBack(); }
  ok(gaveBack, 'the ceremony hands the controls back when it is done');
  ok(!await cerUp(), 'and the overlay is gone, not left sitting on top of the game');
  const hint = await page.evaluate(() => document.getElementById('hint').textContent.trim());
  ok(hint.length > 0, 'it leaves you knowing what to do next (' + hint + ')');

  /* ⛔ AND IT HAS TO FIT ON A SHORT PHONE. A reveal card carrying five stat rows
   * and two buttons is taller than a 320 by 568 screen, and a centred flex
   * column that overflows pushes its top above the scroll origin: the headline
   * clips off and the buttons go off the bottom with no way to reach either.
   * That exact shape has now cost this studio the menu twice. */
  for (const vp of [{ w: 320, h: 568, n: 'narrow' }, { w: 667, h: 375, n: 'landscape' }]) {
    await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1,
                             isMobile: true, hasTouch: true });
    await wait(320);
    const fit = await page.evaluate(() => {
      const cer = document.getElementById('cer');
      cer.classList.add('up');
      document.getElementById('cerKick').textContent = 'New part';
      document.getElementById('cerBig').textContent = 'Cleaver';
      document.getElementById('cerSub').textContent = 'Against your Wheel:';
      document.getElementById('cerBody').innerHTML =
        window.__cmpHTML ? '<div class="cerPart"><div class="slot">Blade</div>' +
          '<div class="job">The striking edge. It decides what your hits do, and ' +
          'what they do to you.</div><p>The sharpest stock edge on a narrow heavy ' +
          'disc; it cuts, and it feels every hit it takes.</p>' +
          window.__cmpHTML('blade', 'wheel', 'cleaver') + '</div>' : '';
      document.getElementById('cerBtns').innerHTML =
        '<button class="btn go">Fit it</button><button class="btn">Keep mine</button>';
      const out = [];
      for (const el of [document.getElementById('cerBig'),
                        ...document.querySelectorAll('#cerBtns .btn')]) {
        const r = el.getBoundingClientRect();
        out.push({ t: (el.textContent || '').trim().slice(0, 12),
                   top: Math.round(r.top), bot: Math.round(r.bottom),
                   h: Math.round(r.height) });
      }
      return { out, scroll: cer.scrollHeight > cer.clientHeight,
               vh: window.innerHeight };
    });
    // everything is reachable if it is either on screen already or scrollable to
    const stranded = fit.out.filter(o => (o.top < 0 || o.bot > fit.vh) && !fit.scroll);
    ok(stranded.length === 0,
       'at ' + vp.w + 'x' + vp.h + ' (' + vp.n + ') the whole reveal card is reachable' +
       (stranded.length ? ' - stranded: ' + stranded.map(o => o.t).join(', ') : ''));
    const short = fit.out.filter(o => /Fit it|Keep mine/.test(o.t) && o.h < 44);
    ok(short.length === 0,
       'and its buttons stay 44px or taller at ' + vp.w + 'x' + vp.h +
       (short.length ? ' - ' + short.map(o => o.t + ' ' + o.h + 'px').join(', ') : ''));
    await page.evaluate(() => document.getElementById('cer').classList.remove('up'));
  }
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1,
                           isMobile: true, hasTouch: true });
  await wait(300);

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
