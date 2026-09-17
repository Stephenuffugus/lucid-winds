// The gesture reader (DESIGN 3.1) with a fake element: hold + tap works without moving the thumb, a short hold + tap
// still ends as a release, and a cancelled second finger does not leave a phantom two finger shake behind.
import { suite } from './lib.mjs';
import { Input } from '../src/input.js';

const { ok, done } = suite('input');

function rig({ picks = true } = {}) {
  const listeners = {};
  const el = {
    addEventListener: (t, f) => { listeners[t] = f; },
    getBoundingClientRect: () => ({ left: 0, top: 0 }),
    setPointerCapture: () => {},
  };
  const calls = [];
  const h = {};
  for (const k of ['dragStart', 'drag', 'release', 'tap', 'doubleTap', 'secondTap', 'shake', 'cancel']) h[k] = () => calls.push(k);
  h.down = () => { calls.push('down'); return picks; };
  const inp = new Input(el, h);
  let t = 1000;
  const ev = (type, id, x, y, dt = 16) => { t += dt; listeners[type]({ pointerId: id, clientX: x, clientY: y, timeStamp: t, pointerType: 'touch', preventDefault() {} }); };
  return { inp, calls, ev };
}

{
  // a still thumb on a sock, then a quick second tap
  const { calls, ev } = rig();
  ev('pointerdown', 1, 100, 300);
  ev('pointerdown', 2, 200, 250, 40);
  ev('pointerup', 2, 200, 250, 60);
  ev('pointerup', 1, 100, 300, 300);
  ok(calls.join(',') === 'down,dragStart,secondTap,release', `still hold + tap: ${calls.join(',')}`);
}
{
  // the whole hold + tap under 320 ms: still a release, never a tap (a tap would leave the sock stuck in the hand)
  const { calls, ev } = rig();
  ev('pointerdown', 1, 100, 300);
  ev('pointerdown', 2, 200, 250, 20);
  ev('pointerup', 2, 200, 250, 30);
  ev('pointerup', 1, 100, 300, 30);
  ok(calls[calls.length - 1] === 'release' && !calls.includes('tap'), `quick hold + tap ends as a release: ${calls.join(',')}`);
}
{
  // a moving thumb with a resting second finger still drags
  const { calls, ev } = rig();
  ev('pointerdown', 1, 100, 300);
  ev('pointerdown', 2, 200, 250, 20);
  for (let i = 1; i <= 4; i++) ev('pointermove', 1, 100 + i * 8, 300);
  ok(calls.filter((c) => c === 'drag').length >= 2 && !calls.includes('shake'), `thumb drags while the other finger rests: ${calls.join(',')}`);
}
{
  // two fingers swiping together shake, and the thumb's lift is a cancel
  const { calls, ev } = rig({ picks: false });
  ev('pointerdown', 1, 100, 300);
  ev('pointerdown', 2, 160, 300, 10);
  for (let i = 1; i <= 8; i++) { ev('pointermove', 1, 100 + i * 12, 300, 8); ev('pointermove', 2, 160 + i * 12, 300, 8); }
  ev('pointerup', 2, 256, 300);
  ev('pointerup', 1, 196, 300);
  ok(calls.includes('shake') && calls[calls.length - 1] === 'cancel', `two finger swipe shakes: ${calls.join(',')}`);
}
{
  // a cancelled second finger: the thumb goes back to dragging and its release is a throw
  const { calls, ev } = rig();
  ev('pointerdown', 1, 100, 300);
  for (let i = 1; i <= 3; i++) ev('pointermove', 1, 100 + i * 6, 300);
  ev('pointerdown', 2, 200, 250);
  ev('pointermove', 2, 220, 250);
  ev('pointercancel', 2, 220, 250);
  calls.length = 0;
  for (let i = 1; i <= 3; i++) ev('pointermove', 1, 118 + i * 10, 300);
  ev('pointerup', 1, 148, 300);
  ok(calls.join(',') === 'drag,drag,drag,release', `after a cancelled second finger: ${calls.join(',')}`);
}
{
  // a still press that lifted nothing is a tap however long it was held (a 400 ms press on a sock used to do nothing),
  // and it never starts a double tap
  const { calls, ev } = rig();
  ev('pointerdown', 1, 100, 300);
  ev('pointerup', 1, 101, 301, 420);
  ok(calls.join(',') === 'down,tap', `a slow still press is a tap: ${calls.join(',')}`);
  ev('pointerdown', 1, 104, 302, 100); ev('pointerup', 1, 104, 302, 60);
  ok(calls.join(',') === 'down,tap,down,tap', `a quick tap right after a slow press is a plain tap, not a double tap: ${calls.join(',')}`);
}
{
  // a plain tap and a double tap
  const { calls, ev } = rig();
  ev('pointerdown', 1, 100, 300); ev('pointerup', 1, 100, 300, 60);
  ev('pointerdown', 1, 104, 302, 120); ev('pointerup', 1, 104, 302, 60);
  ok(calls.join(',') === 'down,tap,down,doubleTap', `tap then double tap: ${calls.join(',')}`);
}

done();
