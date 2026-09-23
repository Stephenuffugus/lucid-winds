// THE RADIO'S EIGHT PLACES (DESIGN-T2 phase 8). tests/radio.test.mjs holds the data; this holds the page:
//   · each station first tries HIS SONG, at the path the site serves (/music/v1/tumble/<song>.mp3)
//   · here that path is missing (his music lives in its own repo, never this one), so each falls back to its own
//     generated bed, and the bed SOUNDS: measured on the radio bus. The control first: a station kind with no bed
//     measures as silence, so the check can tell the two apart (dev/probe-live-radio.mjs plays the real songs live)
//   · each has its own icon in the shop's Radio tab, shot at the phone's width
//   node dev/shots-radio.mjs [w h]      (412 915 by default)
import { harness, sleep } from '../tools/harness.mjs';

const W = Number(process.argv[2] || 412);
const H2 = Number(process.argv[3] || 915);
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const H = await harness({ w: W, h: H2, port: 8795, dpr: 1 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, ms = 30000) => H.page.waitForFunction(f, { timeout: ms, polling: 200 }, arg).then(() => true, () => false);
// how loud the radio bus is over four seconds, a whole bar at the slowest tempo (root mean square of the waveform).
// ⛔ It was a second and a half, and a window that short can land in a bar's quiet stretch: the kitchen measured 2.8e-3
// at 360 and 5.9e-4 at 412 on the same bed (a check that samples a moment reports on a world it is not watching).
const LEVEL = () => new Promise((res) => {
  const A = window.TUMBLE.audio;
  if (!window.__an) { window.__an = A.ctx.createAnalyser(); window.__an.fftSize = 2048; A.radioBus.connect(window.__an); }
  const buf = new Float32Array(2048);
  let sum = 0, n = 0;
  const t0 = performance.now();
  const step = () => { window.__an.getFloatTimeDomainData(buf); for (const v of buf) { sum += v * v; n++; } if (performance.now() - t0 < 4000) setTimeout(step, 50); else res(Math.sqrt(sum / n)); };
  step();
});

try {
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  await H.open('?nosw&turbo=1&unlockall=1', 'room', 300000);
  await D(() => { const s = window.TUMBLE.save; for (const k of Object.keys(s.seen || {})) s.seen[k] = true; window.TUMBLE.ui.hideHint(); window.TUMBLE.audio.unlock(); });
  await until(() => window.TUMBLE.audio.ctx && window.TUMBLE.audio.ctx.state === 'running');
  const stations = await D(() => window.TUMBLE.data.unlocks.items.filter((i) => i.cat === 'radio' && i.look.url).map((i) => ({ id: i.id, name: i.name, key: i.look.station, url: i.look.url })));
  ok(stations.length === 8, `eight stations carry his songs (${stations.length})`);

  // the control: a station kind Station was never taught is SILENT (so a loud bed below means something)
  await D(() => window.TUMBLE.audio.radio('nonesuch', null));
  await sleep(1200);
  const silent = await D(LEVEL);
  ok(silent < 2e-4, `the control: a station with no bed is silent (level ${silent.toExponential(1)})`);

  // the yardstick: Build 1's six stations, each played as its generated bed
  const ref = {};
  for (const k of ['lofi', 'rain', 'jazz', 'tv', 'hold', 'resonarc']) {
    await D((k) => window.TUMBLE.audio.radio(k, null), k);
    await sleep(2500);
    ref[k] = await D(LEVEL);
  }
  // not the Steady Rain: its sound is the rain bed, which has its own bus, so on the radio bus it reads as silence
  // (5.8e-9) and would make the floor mean nothing
  const floor = Math.min(...Object.entries(ref).filter(([k]) => k !== 'rain').map(([, v]) => v));
  console.log('  info  Build 1 beds: ' + Object.entries(ref).map(([k, v]) => k + ' ' + v.toExponential(1)).join(', '));
  const tried = [], quiet = [], levels = [];
  for (const s of stations) {
    // equip it the way the shop does: the radio starts his song first
    const first = await D((id) => { const app = window.TUMBLE; app.save.equipped.radio = id; app._beds(); const n = app.audio.radioNode; return n ? { kind: n.kind, url: n.url } : null; }, s.id);
    if (!first || first.kind !== 'track' || first.url !== s.url) tried.push(`${s.name} (${JSON.stringify(first)})`);
    // no song here: it falls back to its own bed
    const fell = await until((key) => { const n = window.TUMBLE.audio.radioNode; return n && n.kind === 'synth' && n.station === key && n.alive; }, s.key, 20000);
    await sleep(2500);
    const level = fell ? await D(LEVEL) : 0;
    levels.push(`${s.key} ${level.toExponential(1)}`);
    // at least as loud as the quietest station Build 1 ever shipped (a bed that is quieter than that is a fault)
    if (!fell || level < floor * 0.9) quiet.push(`${s.name}${fell ? '' : ' (never fell back)'}`);
  }
  ok(!tried.length, `each station starts HIS song first, at the path the site serves${tried.length ? ': ' + tried.join('; ') : ''}`);
  ok(!quiet.length, `each station's own bed plays when the song cannot, at least as loud as Build 1's quietest (${floor.toExponential(1)}): ${levels.join(', ')}${quiet.length ? ': TOO QUIET ' + quiet.join(', ') : ''}`);
  await D(() => { window.TUMBLE.save.equipped.radio = null; window.TUMBLE._beds(); });

  // the Radio tab of the shop: an icon of its own for every station
  const icons = await D(() => {
    const app = window.TUMBLE; app.screens.door('radio');
    const out = {}; for (const it of app.data.unlocks.items.filter((i) => i.cat === 'radio')) out[it.look.station] = app.screens._swatch(it).icon;
    return out;
  });
  const generic = await D(() => window.TUMBLE.screens._swatch({ cat: 'radio', look: {} }).icon);
  const shared = Object.entries(icons).filter(([, ic]) => !ic || ic === generic).map(([k]) => k);
  ok(!shared.length && new Set(Object.values(icons)).size === Object.keys(icons).length, `every station has its own icon in the shop (${Object.keys(icons).length})${shared.length ? ': the shared radio for ' + shared.join(', ') : ''}`);
  // a card on screen and unmoved between two looks: the first, the last, or one by name
  const still = (which) => until((which) => {
    const bs = [...document.querySelectorAll('#sheetBody .txt b')];
    const b = which === 'last' ? bs[bs.length - 1] : which ? bs.find((x) => x.textContent === which) : bs[0];
    if (!b) return false;
    const q = b.getBoundingClientRect(), key = Math.round(q.x) + ',' + Math.round(q.y), same = window.__shopAt === key;
    window.__shopAt = key; return same && q.top >= 0 && q.bottom <= innerHeight;
  }, which, 60000);
  await D(() => { window.__shopAt = null; });
  ok(await still(null), 'the Radio tab settles');
  await D(() => { window.__shopAt = null; const b = [...document.querySelectorAll('#sheetBody .txt b')].find((x) => x.textContent === 'Kitchen After Midnight'); if (b) b.scrollIntoView({ block: 'start' }); });
  ok(await still('Kitchen After Midnight'), 'the eight places scroll into view');
  await H.shot(`radio-shop-${W}.png`);
  await D(() => { window.__shopAt = null; const body = document.getElementById('sheetBody'); body.scrollTop = body.scrollHeight; });
  await still('last');
  await H.shot(`radio-shop-end-${W}.png`);
  const errs = H.errors.filter((e) => !/favicon|\/music\//.test(e));
  ok(errs.length === 0, 'no console errors (the missing songs aside) ' + errs.join(' | '));
} catch (e) {
  ok(false, 'radio shots crashed: ' + e.message);
}
await H.close();
console.log(fails.length ? `radio shots: ${fails.length} FAILED` : `radio shots: all taken at ${W}x${H2}`);
process.exitCode = fails.length ? 1 : 0;
