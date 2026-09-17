// Quick look: boots a query, waits for a state, saves a screenshot. node tools/look.mjs "?debug=1&smoke=43" name.png [state]
import { harness, sleep } from './harness.mjs';
const [q = '?debug=1', name = 'look.png', state = 'play', w = '390', h = '844'] = process.argv.slice(2);
const H = await harness({ w: +w, h: +h });
const t0 = Date.now();
try {
  await H.open(q, state === 'none' ? null : state);
  await H.frames(8);
  await sleep(600);
  await H.shot(name);
  console.log('ok', name, 'in', Date.now() - t0, 'ms');
  const dbg = await H.page.evaluate(() => document.getElementById('debug')?.textContent || '');
  if (dbg) console.log(dbg);
} catch (e) { console.log('FAILED', e.message); await H.shot('fail-' + name); }
console.log(H.errors.join('\n') || 'no console errors');
await H.close();
