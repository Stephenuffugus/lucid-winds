/* frame time at quality high: frames over 40 s in the aim phase, the camera still */
import { open, startMatch, sleep, done } from './probe.mjs';
const ft = parseInt(process.argv[2] || '10', 10);
const page = await open(412, 915);
await startMatch(page, { houseRules: { ringSizeFt: ft, statues: false } });
await sleep(4000);
const a = await page.evaluate(() => ({ f: window.KEEPSIES_DEV.state().frames, q: window.KEEPSIES_DEV.state().quality, t: performance.now() }));
await sleep(40000);
const b = await page.evaluate(() => ({ f: window.KEEPSIES_DEV.state().frames, t: performance.now() }));
console.log('ring', ft, 'quality', a.q, ((b.t - a.t) / Math.max(1, b.f - a.f)).toFixed(0), 'ms a frame over', b.f - a.f, 'frames; errors', page.errors.length);
await done();
