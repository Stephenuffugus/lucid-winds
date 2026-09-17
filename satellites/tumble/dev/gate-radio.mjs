// Radio gate: a station with a file (Stephen's beats, look.url) plays that file through the music bus, the music switch
// stops it, a station without a file plays the generated loop, and a missing file falls back to the loop.
// node dev/gate-radio.mjs
import { harness } from '../tools/harness.mjs';
const H = await harness({ w: 390, h: 844 });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, timeout = 60000) => H.page.waitForFunction(f, { timeout, polling: 200 }, arg).then(() => true, () => false);
try {
  await H.open('?nosw&turbo=1', 'room');
  await H.frames(3);
  // the player owns two stations; Lofi Beats carries a file (the fixture), Vinyl Jazz does not
  await D(() => {
    const A = TUMBLE;
    for (const id of ['radio-lofi', 'radio-jazz']) if (!A.save.unlocks.includes(id)) A.save.unlocks.push(id);
    A.item('radio-lofi').look.url = '/dev/radio-test/silence.wav';
    A.audio.unlock();
    A.save.equipped.radio = 'radio-lofi';
    A._beds();
  });
  const playing = await until(() => { const n = TUMBLE.audio.radioNode; return n && n.kind === 'track' && n.el && !n.el.paused && n.el.currentTime > 0.15; });
  const t = await D(() => { const n = TUMBLE.audio.radioNode; return n ? { kind: n.kind, url: n.url, paused: n.el && n.el.paused, t: n.el && n.el.currentTime, routed: !!n.src, loop: n.el && n.el.loop } : null; });
  ok(playing && t && t.kind === 'track', `a station with a file plays that file (${JSON.stringify(t)})`);
  ok(t && t.routed && t.loop, 'the track is routed through the music bus and loops');
  await D(() => TUMBLE.setSetting('music', false));
  const stopped = await until(() => !TUMBLE.audio.radioNode || !TUMBLE.audio.radioNode.alive);
  ok(stopped, 'turning the music off stops the track');
  await D(() => { TUMBLE.setSetting('music', true); TUMBLE.save.equipped.radio = 'radio-jazz'; TUMBLE._beds(); });
  const synth = await until(() => { const n = TUMBLE.audio.radioNode; return n && n.kind === 'synth' && n.station === 'jazz' && n.alive; });
  ok(synth, 'a station without a file plays the generated loop');
  await D(() => { TUMBLE.item('radio-jazz').look.url = '/dev/radio-test/does-not-exist.wav'; TUMBLE.save.equipped.radio = 'radio-lofi'; TUMBLE._beds(); TUMBLE.save.equipped.radio = 'radio-jazz'; TUMBLE._beds(); });
  const fell = await until(() => { const n = TUMBLE.audio.radioNode; return n && n.kind === 'synth' && n.station === 'jazz' && n.alive; }, null, 30000);
  ok(fell, 'a station whose file is missing falls back to the generated loop');
  const errs = H.errors.filter((e) => !/favicon|does-not-exist/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) { ok(false, 'gate crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `radio gate: ${fails.length} FAILED` : 'radio gate: all passed');
process.exitCode = fails.length ? 1 : 0;
