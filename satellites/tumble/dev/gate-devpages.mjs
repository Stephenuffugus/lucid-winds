// Opens the dev pages (atlas determinism twice, flick determinism, physics smoke) and reads their results.
// node dev/gate-devpages.mjs
import { harness } from '../tools/harness.mjs';
import { readFileSync } from 'fs';
const H = await harness({ w: 390, h: 844 });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const golden = JSON.parse(readFileSync(new URL('../tests/golden.json', import.meta.url), 'utf8')).atlas64;
try {
  await H.page.goto(H.url('dev/atlas.html'), { waitUntil: 'load', timeout: 120000 });
  await H.page.waitForFunction(() => window.ATLAS_RESULT, { timeout: 300000, polling: 500 });
  const a1 = await H.page.evaluate(() => window.ATLAS_RESULT);
  await H.shot('dev-atlas.png');
  await H.page.reload({ waitUntil: 'load' });
  await H.page.waitForFunction(() => window.ATLAS_RESULT, { timeout: 300000, polling: 500 });
  const a2 = await H.page.evaluate(() => window.ATLAS_RESULT);
  ok(a1.total === a2.total && a2.prev === a1.total, `dev/atlas.html re-renders identically on reload (${a1.total})`);
  ok(a1.total === golden.normal, `the browser paints the same bytes as Node (${a1.total} vs ${golden.normal})`);
  console.log(`  info  atlas: ${a1.ms.toFixed(0)} ms for 64 tiles in the browser main thread`);

  await H.page.goto(H.url('dev/flick.html'), { waitUntil: 'load', timeout: 120000 });
  await H.page.waitForFunction(() => window.FLICK_RESULT, { timeout: 300000, polling: 500 });
  const f = await H.page.evaluate(() => window.FLICK_RESULT);
  ok(f.pass, `dev/flick.html: 100 flicks within ${(f.spread * 100).toFixed(3)} cm (${f.ms.toFixed(0)} ms)`);
  await H.shot('dev-flick.png');

  await H.page.goto(H.url('dev/physics.html'), { waitUntil: 'load', timeout: 120000 });
  await H.page.waitForFunction(() => window.PHYSICS_RESULT, { timeout: 600000, polling: 1000 });
  const p = await H.page.evaluate(() => window.PHYSICS_RESULT);
  ok(p.n === 200 && p.settledAt > 0 && p.settledAt < 2 && p.awake === 0, `dev/physics.html: 200 socks settled in ${p.settledAt.toFixed(2)} s, pre sim ${p.simMs.toFixed(0)} ms, ${p.awake} awake`);
  console.log(`  info  physics page frame times on this rig (software WebGL): median ${p.median.toFixed(0)} ms, p95 ${p.p95.toFixed(0)} ms over ${p.frames} frames`);
  await H.shot('dev-physics.png');
  const errs = H.errors.filter((e) => !/favicon|lore|unlocks|clothesline/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.slice(0, 3).join(' | '));
} catch (e) { ok(false, 'crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `dev pages: ${fails.length} FAILED` : 'dev pages: all passed');
process.exitCode = fails.length ? 1 : 0;
