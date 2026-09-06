/* THE SOUND, as far as a headless browser can honestly be asked about it.
 *
 *   node test/sound.mjs
 *
 * ⛔ WHAT THIS GATE CANNOT SEE. The browser here runs with
 * --autoplay-policy=no-user-gesture-required, so an AudioContext made before a
 * gesture works. On a real phone it stays suspended and every note lands in
 * silence with no error. That is why the engine is only ever opened inside a
 * pointer handler, and why the plan still carries a phone test. Nobody has
 * HEARD this game.
 *
 * What it can prove: that the rush is ONE held voice rather than a note fired
 * every frame, that the wind moves it, that a stall changes its colour, that
 * veer buzzes, and that SOUND OFF is silent.
 */
import { serve, open, reporter, tap, waitFrames } from './harness.mjs';

const site = await serve();
const { browser, page, errors } = await open(site.base, { width: 375, height: 667 });
const { fails, say } = reporter();
const T = (fn, ...a) => page.evaluate(fn, ...a);
const setDial = (id, v) => T((id, v) => {
  const d = document.getElementById(id);
  d.value = String(v);
  d.dispatchEvent(new Event('input', { bubbles: true }));
}, id, v);

try {
  say((await T(() => window.AIRWORTHY_TEST.sound())).ctx === 'none',
    'nothing opens an audio engine before a gesture');
  await tap(page, '#btnTunnel');
  await waitFrames(page, 6);
  const s0 = await T(() => window.AIRWORTHY_TEST.sound());
  say(s0.ctx === 'running', 'a tap on the tunnel opens it (' + s0.ctx + ')');
  say(s0.rushes === 1, 'and the rush is one held voice, not a note a frame (' + s0.rushes + ')');

  await setDial('dialWind', 4);
  await waitFrames(page, 25);
  const low = await T(() => window.AIRWORTHY_TEST.sound());
  await setDial('dialWind', 15);
  await waitFrames(page, 25);
  const high = await T(() => window.AIRWORTHY_TEST.sound());
  say(high.rush > low.rush * 1.4,
    'more wind is more rush (' + low.rush.toFixed(4) + ' to ' + high.rush.toFixed(4) + ')');
  say(high.tone > low.tone + 80,
    'and a higher one (' + low.tone.toFixed(0) + ' Hz to ' + high.tone.toFixed(0) + ' Hz)');
  say((await T(() => window.AIRWORTHY_TEST.sound())).rushes === 1,
    'and it is still one voice after all that');

  /* past the stall the rush goes broad and ragged */
  await setDial('dialAlpha', 4);
  await waitFrames(page, 25);
  const clean = await T(() => window.AIRWORTHY_TEST.sound());
  await setDial('dialAlpha', 27.5);
  await waitFrames(page, 25);
  const stalled = await T(() => ({ s: window.AIRWORTHY_TEST.sound(), t: window.AIRWORTHY_TEST.tunnel() }));
  say(stalled.t.stalled, 'the dial is past the stall');
  say(stalled.s.q < clean.q * 0.7,
    'and the rush opens out with it (Q ' + clean.q.toFixed(2) + ' to ' + stalled.s.q.toFixed(2) + ')');
  say(stalled.s.flutter > clean.flutter + 0.005,
    'with the paper buzzing (' + clean.flutter.toFixed(4) + ' to ' + stalled.s.flutter.toFixed(4) + ')');

  /* a flight, and a plane sliding sideways. ⛔ THE CLAIM IS A COMPARISON, not a
     number: veer builds over seconds and a flight lasts three, so any absolute
     threshold here is really a measurement of how fast the machine ran the
     frames. Two planes, same moment, and the sloppy one has to buzz. */
  const flyAndRead = async (spec, at) => {
    /* ⛔ let the last voice die first. A gain set toward zero never quite gets
       there, and the tail of the stall buzz read as this plane's buzz. */
    await T(() => window.AIRWORTHY_TEST.toField());
    await waitFrames(page, 18);
    await T((spec) => {
      window.AIRWORTHY_TEST.toField(spec);
      window.AIRWORTHY_TEST.launch(8, 0.6);
    }, spec);
    await waitFrames(page, 3);
    const air = await T(() => window.AIRWORTHY_TEST.sound());
    await T((at) => window.AIRWORTHY_TEST.advance(at), at);
    await waitFrames(page, 6);
    const out = await T(() => ({
      s: window.AIRWORTHY_TEST.sound(),
      v: Math.abs(window.AIRWORTHY_TEST.state().live.veer),
      flying: window.AIRWORTHY_TEST.state().flying
    }));
    await T(() => window.AIRWORTHY_TEST.finish());
    await waitFrames(page, 3);
    return { air: air, out: out };
  };
  const square = await flyAndRead({ nose: 'blunt', noseFolds: 1, wing: 0.6, elev: 0,
    precision: 1, ail: 0, dihedral: 0.8 }, 1.7);
  const sloppy = await flyAndRead({ nose: 'blunt', noseFolds: 1, wing: 0.6, elev: 0,
    precision: 0, ail: 8, dihedral: 0 }, 1.7);
  say(square.air.rush > 0.001, 'the air rushes past a plane in flight (' + square.air.rush.toFixed(4) + ')');
  say(square.out.flying && sloppy.out.flying, 'both are still in the air when the buzz is read');
  say(sloppy.out.v > square.out.v * 4,
    'a sloppy fold with an aileron on it slides and a square one does not (veer '
    + sloppy.out.v.toFixed(3) + ' against ' + square.out.v.toFixed(3) + ')');
  say(sloppy.out.s.flutter > square.out.s.flutter * 4 && sloppy.out.s.flutter > 0.002,
    'and only the sloppy one buzzes (' + sloppy.out.s.flutter.toFixed(4) + ' against '
    + square.out.s.flutter.toFixed(4) + ')');
  await waitFrames(page, 20);
  say((await T(() => window.AIRWORTHY_TEST.sound())).rush < 0.004,
    'and it all goes quiet when the plane is down');

  /* SOUND OFF means off */
  await T(() => {
    document.getElementById('btnMenu').click();
    document.getElementById('btnSound').click();
  });
  await waitFrames(page, 4);
  await T(() => {
    document.getElementById('btnMenuClose').click();
    window.AIRWORTHY_TEST.launch(8, 0.6);
    window.AIRWORTHY_TEST.advance(1.0);
  });
  await waitFrames(page, 20);
  const off = await T(() => window.AIRWORTHY_TEST.sound());
  say(off.on === false, 'SOUND OFF turns it off');
  say(off.rush < 0.004 && off.flutter < 0.004,
    'and nothing is left running under it (rush ' + off.rush.toFixed(4)
    + ', flutter ' + off.flutter.toFixed(4) + ')');

  say(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
} finally {
  await browser.close();
  site.close();
}
console.log('');
if (fails.length) { console.log(fails.length + ' SOUND FAILURE(S)'); process.exit(1); }
console.log('SOUND OK');
