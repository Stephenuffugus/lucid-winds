// THE FIRST TEN SECONDS (DESIGN-T2 7.2), LOOKED AT. Every gate skips it on purpose (`?turbo` and `?load`), so
// until 23 Sep it had never been seen by anybody: this opens the game the way a new player does, with a fresh
// profile and no flags, and shoots it as it happens. Then it launches a second time and checks it stays quiet.
//   node dev/shots-first-ten.mjs [w h]      (412 915 by default)
import { harness } from '../tools/harness.mjs';

const W = Number(process.argv[2] || 412);
const H2 = Number(process.argv[3] || 915);
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const H = await harness({ w: W, h: H2, port: 8797 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const settle = (fn, ms = 240000) => H.page.waitForFunction(fn, { timeout: ms, polling: 100 }).then(() => true, () => false);

try {
  // a first launch: no `?load`, no `?turbo`. `?nosw` only keeps the worker out of a throwaway profile.
  await H.open('?nosw', 'room', 300000);
  ok(await settle(() => !!document.querySelector('.firstten')), 'a new player gets the first ten seconds');
  // ⛔ A screenshot here lands SECONDS late on this renderer (the first run caught the door already open, 3.4 s
  // in, with the fade long gone), so "is it dark at the start" cannot be answered by timing. It is answered by
  // stopping the fade at its first frame and asking what is on top: the room must be under it, everywhere.
  const cover = await D(() => {
    const el = document.querySelector('.firstten');
    el.style.transition = 'none'; el.classList.remove('lift'); el.style.opacity = '1'; el.style.pointerEvents = 'auto';
    const at = (id) => { const r = document.getElementById(id); if (!r || r.hidden) return null; const b = r.getBoundingClientRect(); return document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2) === el; };
    const mid = document.elementFromPoint(innerWidth / 2, innerHeight * 0.55) === el;
    return { mid, title: at('roomTitle'), wallet: at('roomWallet'), dock: at('dock') };
  });
  await H.shot(`first-ten-1-dark-${W}.png`);
  ok(cover.mid && cover.title !== false && cover.wallet !== false && cover.dock !== false, `the fade starts over the WHOLE screen (room ${cover.mid}, title ${cover.title}, wallet ${cover.wallet}, buttons ${cover.dock})`);
  await D(() => { const el = document.querySelector('.firstten'); if (el) { el.style.pointerEvents = 'none'; el.style.transition = ''; el.style.opacity = ''; el.classList.add('lift'); } });
  const start = await D(() => ({ open: !!window.TUMBLE.ui.open, hint: document.getElementById('hint').classList.contains('on') }));
  ok(!start.open && !start.hint, `and nothing asks her anything (sheet ${start.open}, hint ${start.hint})`);
  // the door, when it opens by itself
  ok(await settle(() => window.TUMBLE.game.render.dryerDoor.rotation.y < -0.2), 'the dryer door starts to open by itself');
  const mid = await D(() => window.TUMBLE.game.render.dryerDoor.rotation.y);
  await H.shot(`first-ten-2-door-${W}.png`);
  ok(await settle(() => !document.querySelector('.firstten')), 'and the ten seconds end on their own');
  await H.frames(4);
  const end = await D(() => ({ door: window.TUMBLE.game.render.dryerDoor.rotation.y, open: !!window.TUMBLE.ui.open, seen: !!window.TUMBLE.save.seen.firstTen }));
  ok(end.seen, 'the save remembers it ran');
  ok(mid > -1.8, `the door SWINGS, it does not appear open (first seen at ${mid.toFixed(2)} rad of -1.90; ${end.door.toFixed(2)} when the ten seconds end, the room easing it shut)`);
  await H.shot(`first-ten-3-after-${W}.png`);
  // a second launch is quiet
  await D(() => window.TUMBLE.store.save());
  await H.page.reload({ waitUntil: 'load' });
  await H.page.waitForFunction(() => window.TUMBLE_DEV && window.TUMBLE_DEV.state === 'room', { timeout: 300000, polling: 250 });
  await H.frames(3);
  ok(!(await D(() => !!document.querySelector('.firstten'))), 'a second launch goes straight to the room');
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) {
  ok(false, 'first ten crashed: ' + e.message);
}
await H.close();
console.log(fails.length ? `first ten: ${fails.length} FAILED` : 'first ten: all passed');
process.exitCode = fails.length ? 1 : 0;
