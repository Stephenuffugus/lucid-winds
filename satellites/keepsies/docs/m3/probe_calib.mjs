/* calibration at 412x839: three flicks of one speed at three frame phases, real pointer events with their own timeStamps (swiftshader draws about a
   frame a second here, so CDP touches arrive a second apart; the delivery itself is proved in node by test/flick.mjs) */
import { open, sleep, done } from './probe.mjs';
const page = await open(412, 839);
for (const ev of ['close', 'error', 'pageerror']) page.on(ev, (x) => console.log('EVENT', ev, String(x).slice(0, 300)));
await page.evaluate(() => window.KEEPSIES_DEV.calibrate());
await page.waitForFunction(() => window.KEEPSIES_DEV.state().match, { timeout: 40000 }); await sleep(1500);
const speeds = [];
for (let k = 0; k < 3; k++) {
  let a = { v: null };
  try { a = await page.evaluate((k) => {
    const D = window.KEEPSIES_DEV, t = D.tawScreen(), canvas = document.getElementById('stage'), r = canvas.getBoundingClientRect(), base = performance.now() - 600 + k * 3.7, prev = D.aimNow();
    const fire = (type, x, y, ts) => { const e = new PointerEvent(type, { pointerId: 51, pointerType: 'touch', clientX: r.left + x, clientY: r.top + y, bubbles: true, cancelable: true, isPrimary: true }); Object.defineProperty(e, 'timeStamp', { value: ts }); canvas.dispatchEvent(e); };
    fire('pointerdown', t.x, t.y, base);
    for (let i = 1; i <= 30; i++) fire('pointermove', t.x, t.y, base + i * 8.33);
    const mj = (s) => 10 * s ** 3 - 15 * s ** 4 + 6 * s ** 5, t0 = base + 250 + k * 2.1;
    for (let i = 1; i <= 9; i++) fire('pointermove', t.x, t.y - 220 * mj(i / 9), t0 + i * 8.33);
    fire('pointerup', t.x, t.y - 220, t0 + 75);
    const A = D.aimNow();
    return { v: A && A !== prev ? +A.thumbSpeed.toFixed(3) : null, say: document.getElementById('calibSay').textContent };
  }, k); } catch (e) { console.log('flick', k + 1, 'ended the screen:', String(e).slice(0, 80)); }
  console.log(JSON.stringify(a).slice(0, 160)); speeds.push(a.v);
  if (k < 2) { await page.waitForFunction(() => { const s = window.KEEPSIES_DEV.state(); return s.match && !s.match.simulating && window.KEEPSIES_DEV.tawScreen(); }, { timeout: 60000 }).catch(() => {}); await sleep(600); }
}
await sleep(1500);
let end = 'unread'; try { end = await page.evaluate(() => JSON.stringify({ calibHidden: document.getElementById('calib').hidden, say: document.getElementById('calibSay').textContent, match: !!window.KEEPSIES_DEV.state().match })); } catch (e) { end = 'THREW ' + String(e).slice(0, 100); }
console.log('after the third:', end);
const v = speeds.filter(Boolean);
console.log('calibration at 412x839: thumb speeds', speeds.join(' '), 'spread', v.length ? ((Math.max(...v) - Math.min(...v)) / Math.max(...v) * 100).toFixed(1) + '%' : '-', 'errors', page.errors.length, page.errors.slice(0, 2).join(' | ').slice(0, 200));
await done();
