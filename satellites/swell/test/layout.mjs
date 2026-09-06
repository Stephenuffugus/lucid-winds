#!/usr/bin/env node
/* Every button a thumb uses, on every screen, in both orientations.
 *
 *   node test/layout.mjs
 *
 * 48 px RENDERED and reachable: the rectangle AND document.elementFromPoint at
 * its centre landing on it. Nothing hanging off the side of its own sheet.
 * The bottom left 120 by 120 of the podium belongs to the fleet's music chip
 * and its folded pill, and the chrome must get out of the way on touch and come
 * back after stillness, which is the one piece of layout that is also a rule.
 */
import { serve, open, reporter, tap, centre, sleep, waitFrames } from './harness.mjs';

const { base, close } = await serve();
const { fails, say } = reporter();
const SIZES = [
  { width: 375, height: 667, tag: '375x667' },
  { width: 320, height: 568, tag: '320x568' },
  { width: 412, height: 915, tag: '412x915' },
  { width: 667, height: 375, tag: '667x375 landscape' }
];

for (const size of SIZES) {
  const tag = size.tag;
  const { browser, page, errors } = await open(base, size);
  const dev = (fn, ...a) => page.evaluate(fn, ...a);
  await dev(() => localStorage.setItem('lw_swell_v1',
    JSON.stringify({ v: 1, mood: 'dawn', tilt: 0, motion: 1, seen: { how: 0 } })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.SWELL_DEV && window.SWELL_DEV.frames() > 2, { timeout: 30000 });
  await waitFrames(page, 4);

  /* ⛔ A FIRST ARRIVAL IS NOT A BLACK RECTANGLE, and this is measured HERE, on
     the fresh page, before this gate has touched anything. The first draft of it
     sat at the bottom of the file, by which point the gate had already held the
     screen, so `seen.held` was set and the "floor is lit" reading was the
     SWELL'S OWN WASH: a probe passing for the wrong reason. Before anyone has
     held it, the screen was the ground colour, one line of text and a gold REC
     button, which is indistinguishable from a page that failed to load, and no
     assertion in this game could tell the difference because every one of them
     is about the sound or about where an element sits. The game's own idea is
     that light rises out of the floor, so the floor breathes until a hand has
     held it once. */
  const rest = await dev(() => window.SWELL_DEV.restLight());
  say(!rest.seenHeld, tag + '  this is a screen nobody has held yet');
  say(rest.lit > 4000, tag + '  and its floor is lit, so it does not read as a page that failed to load ('
    + rest.lit + ' lit pixels below the middle)');
  /* ⛔ AND THE LOOP IS CHECKED AFTER THE IDLE STOP HAS HAD ITS CHANCE. The frame
     loop halts after two seconds of silence, so reading `rafOn` four frames
     after load is reading it before the thing that would stop it has run: the
     mutation that lets the loop stop left this assertion GREEN. Two and a half
     seconds is past the stop. */
  await sleep(2600);
  const still = await dev(() => window.SWELL_DEV.restLight());
  say(still.raf, tag + '  and two and a half seconds later the frame loop is still running, so the invitation breathes rather than freezing');
  say(still.lit > 4000, tag + '  and the floor is still lit then (' + still.lit + ')');

  async function check(sel, label, min) {
    const c = await centre(page, sel);
    const need = min || 48;
    const ok = !!c && c.w >= need && c.h >= need && c.onTop;
    say(ok, tag + '  ' + label + '  ' + (c ? c.w.toFixed(0) + 'x' + c.h.toFixed(0) + (c.onTop ? '' : ' NOT ON TOP') : 'MISSING'));
  }

  /* the podium */
  await check('#chipMood', 'the mood chip');
  await check('#btnMenu', 'the menu');
  await check('#btnRec', 'REC', 56);
  const line = await dev(() => {
    const el = document.getElementById('firstLine');
    return { text: el.textContent.trim(), shown: !el.classList.contains('gone') };
  });
  say(line.shown && line.text.length > 10, tag + '  the first boot line is on the podium and nothing else is');
  say(!/[-‐-―−!]/.test(line.text), tag + '  and it carries no dash and no exclamation point');

  /* the seat, measured by RECTANGLE: the chrome is pointer-events none, so
     elementFromPoint would report an empty corner that is full */
  const intruders = await dev(() => {
    const H = window.innerHeight, BOX = { l: 0, t: H - 120, r: 120, b: H };
    const skip = ['app', 'stage', 'chrome', 'toast', 'testPanel'];
    const bad = [];
    document.querySelectorAll('#app *').forEach(el => {
      if (skip.indexOf(el.id) >= 0) return;
      if (el.classList.contains('screen') || el.classList.contains('sheet')) return;
      if (el.closest('.screen') || el.closest('.sheet')) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return;
      if (el.hidden) return;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      if (r.right <= BOX.l || r.left >= BOX.r || r.bottom <= BOX.t || r.top >= BOX.b) return;
      bad.push((el.id || el.className || el.tagName) + ' at ' + r.left.toFixed(0) + ',' + r.top.toFixed(0));
    });
    return Array.from(new Set(bad));
  });
  say(intruders.length === 0, tag + '  the bottom left 120 by 120 is free for the music pill' + (intruders.length ? ': ' + intruders.join(', ') : ''));

  /* the menu and everything under it */
  await tap(page, '#btnMenu'); await sleep(220);
  for (const [sel, nm] of [['#btnMoods', 'CHOOSE A MOOD'], ['#btnAmbientOpen', 'AMBIENT'],
    ['#btnSettings', 'SETTINGS'], ['#btnAbout', 'ABOUT'], ['#btnMenuClose', 'CLOSE']]) await check(sel, nm);

  await tap(page, '#btnMoods'); await sleep(320);
  for (let i = 0; i < 3; i++) await check('#moodCards .moodcard:nth-child(' + (i + 1) + ')', 'mood card ' + (i + 1), 72);
  await check('#btnMoodsBack', 'BACK on the moods');
  const names = await dev(() => Array.prototype.map.call(document.querySelectorAll('.moodcard .nm'), e => e.textContent));
  say(names.join(',') === 'Dawn,Storm,Lullaby', tag + '  the three moods are there: ' + names.join(', '));
  await tap(page, '#btnMoodsBack'); await sleep(220);

  await tap(page, '#btnMenu'); await sleep(180);
  await tap(page, '#btnAmbientOpen'); await sleep(320);
  await check('#btnAmbientStart', 'START');
  await check('#btnAmbientBack', 'BACK on ambient');
  for (let i = 0; i < 4; i++) await check('#sleepRow button:nth-child(' + (i + 1) + ')', 'the sleep timer segment ' + (i + 1));
  const honest = await dev(() => Array.prototype.some.call(document.querySelectorAll('#scrAmbient .tiny'),
    e => /Keeps playing while this screen stays on/.test(e.textContent)));
  say(honest, tag + '  ambient says the honest thing about the screen staying on');
  await tap(page, '#btnAmbientBack'); await sleep(220);

  await tap(page, '#btnMenu'); await sleep(180);
  await tap(page, '#btnSettings'); await sleep(320);
  for (const [sel, nm] of [['#btnSoundTest', 'PLAY ONE SWELL'], ['#btnTilt', 'TILT'],
    ['#btnMotion', 'MOTION'], ['#btnSettingsClose', 'CLOSE settings']]) await check(sel, nm);
  await tap(page, '#btnSettingsClose'); await sleep(220);

  await tap(page, '#btnMenu'); await sleep(180);
  await tap(page, '#btnAbout'); await sleep(320);
  await check('#btnAboutBack', 'BACK on About');
  const about = await dev(() => document.getElementById('scrAbout').textContent);
  say(/Sky Wolf Studio/.test(about), tag + '  About names the studio');
  say(!/beta|debug|test/i.test(about), tag + '  and nothing on any screen says beta, debug or test');
  await tap(page, '#btnAboutBack'); await sleep(220);

  /* the chrome rule: out of the way on touch, back after stillness */
  const mid = await dev(() => ({ x: Math.round(window.innerWidth / 2), y: Math.round(window.innerHeight * 0.55) }));
  await dev((x, y) => document.getElementById('stage').dispatchEvent(new PointerEvent('pointerdown',
    { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y })), mid.x, mid.y);
  await sleep(500);
  say(await dev(() => window.SWELL_DEV.hushed()), tag + '  the chrome is out of the way half a second after a touch');
  await dev((x, y) => document.getElementById('stage').dispatchEvent(new PointerEvent('pointerup',
    { pointerId: 9, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y })), mid.x, mid.y);
  await sleep(2500);
  say(!(await dev(() => window.SWELL_DEV.hushed())), tag + '  and back two and a half seconds after the last one');

  /* nothing hangs off the side of its own sheet */
  const spill = await dev(() => {
    const bad = [];
    document.querySelectorAll('.screen.on, .sheet.on').forEach(box => {
      const br = box.getBoundingClientRect();
      box.querySelectorAll('button, input, canvas').forEach(el => {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || el.hidden) return;
        const r = el.getBoundingClientRect();
        if (r.width < 1) return;
        if (r.right > br.right + 1.5 || r.left < br.left - 1.5) {
          bad.push((el.id || el.className || el.tagName) + ' by ' + Math.max(r.right - br.right, br.left - r.left).toFixed(0) + ' px');
        }
      });
    });
    return bad;
  });
  say(spill.length === 0, tag + '  nothing hangs off the side of its sheet' + (spill.length ? ': ' + spill.join(', ') : ''));
  say(!(await dev(() => document.documentElement.scrollWidth > window.innerWidth + 1)), tag + '  nothing pushes the page sideways');
  say(errors.length === 0, tag + '  nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
}
close();
console.log('');
if (fails.length) { console.log(fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('LAYOUT OK');
