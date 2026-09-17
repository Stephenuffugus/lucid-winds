// Hints gate (Jessie, Sep 17: "the instructions move too fast ... she wants a click to continue"). A teaching hint stays
// until it is tapped and carries a Got it button of at least 48 px; a timed hint lasts long enough to read and can be
// tapped away early. node dev/gate-hints.mjs
import { harness } from '../tools/harness.mjs';
const H = await harness({ w: 390, h: 844 });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => H.page.evaluate(f, ...a);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const hintState = () => D(() => { const h = document.getElementById('hint'); const b = document.getElementById('hintGo'); const r = b ? b.getBoundingClientRect() : null; return { on: h.classList.contains('on'), text: h.textContent.trim().slice(0, 80), pe: getComputedStyle(h).pointerEvents, btn: r ? { w: Math.round(r.width), h: Math.round(r.height), x: r.left + r.width / 2, y: r.top + r.height / 2 } : null }; });
try {
  // a fresh player's first Load: the first teaching hint
  await H.open('?nosw&turbo=1&skipdump=1&load=laundry&size=small&seed=hints', 'play', 240000);
  await H.frames(3);
  let s = await hintState();
  ok(s.on && /Tap a sock to pick it up/.test(s.text), `the first Load shows the first teaching hint ("${s.text}")`);
  ok(!!s.btn && s.btn.w >= 48 && s.btn.h >= 48, `the teaching hint carries a Got it button of at least 48 px (${s.btn ? s.btn.w + 'x' + s.btn.h : 'none'})`);
  await wait(6500);   // longer than the old 4.2 s timer
  s = await hintState();
  ok(s.on, 'the teaching hint is still up after 6.5 s (it waits for the tap)');
  await H.shot('g-hints-sticky.png');
  if (s.btn) await H.tap(s.btn.x, s.btn.y);
  await H.frames(3);
  s = await hintState();
  ok(!s.on, 'tapping Got it dismisses it');
  // a timed hint gets a reading floor: 60 characters need more than the old 2.6 s default
  await D(() => TUMBLE.ui.hint('A sixty character hint that a new player needs time to read fully.'));
  await wait(3200);
  s = await hintState();
  ok(s.on, 'a 60 character timed hint is still readable after 3.2 s (the old default faded at 2.6 s)');
  ok(s.pe !== 'none', 'a hint can be tapped');
  const hb = await D(() => { const r = document.getElementById('hint').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await H.tap(hb.x, hb.y);
  await H.frames(3);
  s = await hintState();
  ok(!s.on, 'tapping a timed hint dismisses it early');
  await D(() => TUMBLE.ui.hint('Link copied.'));
  await wait(9000);
  s = await hintState();
  ok(!s.on, 'a timed hint still goes away on its own (Link copied gone within 9 s)');
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) { ok(false, 'gate crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `hints gate: ${fails.length} FAILED` : 'hints gate: all passed');
process.exitCode = fails.length ? 1 : 0;
